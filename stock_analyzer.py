import os
import json
import argparse
import pandas as pd
import numpy as np
import xgboost as xgb

# 17 Predictive Features
FEATURE_COLS = [
    "Resistance_Distance_%",
    "Close_Position",
    "Volume_Ratio",
    "Volume_Surge_10",
    "Distance_MA10_%",
    "Distance_MA30_%",
    "MA_Ratio",
    "Momentum_5d_%",
    "Momentum_10d_%",
    "Momentum_20d_%",
    "ATR_Pct",
    "Daily_Range_%",
    "Range_Ratio",
    "Volatility_10d",
    "Price_Range_10d_%",
    "RSI_14",
    "Breakout_Pct"
]

FEATURE_DESCRIPTIONS = {
    "Resistance_Distance_%": "Clearance above 30d resistance level",
    "Close_Position": "Intraday close strength (near high of day)",
    "Volume_Ratio": "Volume surge vs 30-day baseline average",
    "Volume_Surge_10": "Short-term volume surge vs 10-day average",
    "Distance_MA10_%": "Extension above short-term 10-day trend",
    "Distance_MA30_%": "Extension above intermediate 30-day trend",
    "MA_Ratio": "Moving average alignment (MA10 / MA30)",
    "Momentum_5d_%": "5-day trailing price velocity",
    "Momentum_10d_%": "10-day trailing price velocity",
    "Momentum_20d_%": "20-day trailing price velocity",
    "ATR_Pct": "Normalized price volatility (ATR % of Close)",
    "Daily_Range_%": "Intraday high-low expansion range",
    "Range_Ratio": "Intraday expansion vs 10-day average range",
    "Volatility_10d": "10-day historical standard deviation",
    "Price_Range_10d_%": "Pre-breakout consolidation tightness (Squeeze)",
    "RSI_14": "14-day Relative Strength Index (Momentum/Overbought)",
    "Breakout_Pct": "Clearance margin above resistance"
}

LOOKBACK = 30
BREAKOUT_PCT = 0.01       # 1% clearance above resistance
CLOSE_NEAR_HIGH = 0.70    # Close in top 30% of day's range
VOLUME_MULTIPLIER = 1.20  # Volume >= 120% of 30-day average

class MultiExpertSystem:
    def __init__(self, dataset_path="data/unified_breakout_dataset.csv"):
        self.dataset_path = dataset_path
        self.experts = {}
        self._train_experts()
        
    def _train_experts(self):
        df = pd.read_csv(self.dataset_path)
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values("Date").reset_index(drop=True)
        df["Target"] = (df["Label"] == "breakout").astype(int)
        
        split_idx = int(len(df) * 0.80)
        train_df = df.iloc[:split_idx]
        X_train = train_df[FEATURE_COLS]
        y_train = train_df["Target"]
        
        # 1. Conservative Expert (Capital Preserver, w=5.0)
        w_cons = np.where(y_train == 0, 5.0, 1.0)
        exp_cons = xgb.XGBClassifier(
            n_estimators=150, max_depth=4, learning_rate=0.04,
            subsample=0.8, colsample_bytree=0.8, reg_alpha=0.5, reg_lambda=1.5,
            random_state=42, eval_metric="logloss"
        )
        exp_cons.fit(X_train, y_train, sample_weight=w_cons)
        
        # 2. Balanced Expert (Swing Trader, w=3.0)
        w_bal = np.where(y_train == 0, 3.0, 1.0)
        exp_bal = xgb.XGBClassifier(
            n_estimators=150, max_depth=4, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, reg_alpha=0.3, reg_lambda=1.0,
            random_state=42, eval_metric="logloss"
        )
        exp_bal.fit(X_train, y_train, sample_weight=w_bal)
        
        # 3. Aggressive Expert (Momentum Hunter, w=1.0)
        exp_agg = xgb.XGBClassifier(
            n_estimators=120, max_depth=4, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            random_state=42, eval_metric="logloss"
        )
        exp_agg.fit(X_train, y_train)
        
        self.experts = {
            "Conservative (Capital Preserver)": {
                "model": exp_cons,
                "profile": "Risk-Averse: Prioritizes Capital Preservation (Win Rate 90%, Catches 68% of Traps)",
                "min_prob": 0.50
            },
            "Balanced (Swing Trader)": {
                "model": exp_bal,
                "profile": "Balanced: Optimal trade-off between capturing market upside and avoiding traps",
                "min_prob": 0.50
            },
            "Aggressive (Momentum Hunter)": {
                "model": exp_agg,
                "profile": "Growth-Seeker: Captures 98%+ of market breakouts, relies on tight stop-loss",
                "min_prob": 0.50
            }
        }

    def compute_features(self, df_stock, target_idx=-1):
        """Computes all 17 predictive Day-0 features for a given candle index without lookahead bias."""
        if target_idx < 0:
            target_idx = len(df_stock) + target_idx
            
        df = df_stock.copy()
        df["Return"] = df["Close"].pct_change()
        
        # Moving Averages & Distances (Shift 1)
        df["MA_10"] = df["Close"].shift(1).rolling(10).mean()
        df["MA_30"] = df["Close"].shift(1).rolling(30).mean()
        df["MA_Ratio"] = df["MA_10"] / (df["MA_30"] + 1e-9)
        df["Distance_MA10_%"] = ((df["Close"] - df["MA_10"]) / (df["MA_10"] + 1e-9)) * 100
        df["Distance_MA30_%"] = ((df["Close"] - df["MA_30"]) / (df["MA_30"] + 1e-9)) * 100
        
        # Volume Metrics
        df["Avg_Volume_30"] = df["Volume"].shift(1).rolling(30).mean()
        df["Avg_Volume_10"] = df["Volume"].shift(1).rolling(10).mean()
        df["Volume_Ratio"] = df["Volume"] / (df["Avg_Volume_30"] + 1e-9)
        df["Volume_Surge_10"] = df["Volume"] / (df["Avg_Volume_10"] + 1e-9)
        
        # Momentum Metrics
        df["Momentum_5d_%"] = ((df["Close"] / df["Close"].shift(5)) - 1) * 100
        df["Momentum_10d_%"] = ((df["Close"] / df["Close"].shift(10)) - 1) * 100
        df["Momentum_20d_%"] = ((df["Close"] / df["Close"].shift(20)) - 1) * 100
        
        # Volatility & Range Metrics
        high_low = df["High"] - df["Low"]
        high_close = (df["High"] - df["Close"].shift(1)).abs()
        low_close = (df["Low"] - df["Close"].shift(1)).abs()
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        df["ATR_14"] = tr.rolling(14).mean()
        df["ATR_Pct"] = (df["ATR_14"] / (df["Close"] + 1e-9)) * 100
        
        df["Daily_Range_%"] = high_low / (df["Close"] + 1e-9) * 100
        df["Avg_Range_10"] = df["Daily_Range_%"].shift(1).rolling(10).mean()
        df["Range_Ratio"] = df["Daily_Range_%"] / (df["Avg_Range_10"] + 1e-9)
        
        df["Volatility_10d"] = df["Return"].shift(1).rolling(10).std()
        df["Price_Range_10d_%"] = ((df["High"].shift(1).rolling(10).max() - df["Low"].shift(1).rolling(10).min()) / (df["Close"] + 1e-9)) * 100
        
        # RSI 14
        delta = df["Close"].diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        rs = gain.rolling(14).mean() / (loss.rolling(14).mean() + 1e-9)
        df["RSI_14"] = 100 - (100 / (1 + rs))
        
        # Resistance & Screening
        df["Resistance"] = df["High"].shift(1).rolling(LOOKBACK).max()
        df["Resistance_Distance_%"] = ((df["Close"] - df["Resistance"]) / (df["Resistance"] + 1e-9)) * 100
        df["Breakout_Pct"] = df["Resistance_Distance_%"]
        df["Close_Position"] = np.where(high_low > 0, (df["Close"] - df["Low"]) / high_low, 0)
        
        row = df.iloc[target_idx]
        return row

    def explain_expert(self, expert_model, feature_series):
        """Computes exact TreeSHAP feature contributions for a single observation."""
        feat_vals = feature_series[FEATURE_COLS].values.reshape(1, -1)
        dmat = xgb.DMatrix(feat_vals, feature_names=FEATURE_COLS)
        contribs = expert_model.get_booster().predict(dmat, pred_contribs=True)[0]
        
        base_bias = contribs[-1]
        feat_contribs = pd.Series(contribs[:-1], index=FEATURE_COLS)
        
        # Positive pushes towards Breakout; Negative pushes towards Fakeout (causes doubt)
        top_support = feat_contribs[feat_contribs > 0].sort_values(ascending=False).head(3)
        top_doubt = feat_contribs[feat_contribs < 0].sort_values(ascending=True).head(3)
        
        return feat_contribs, top_support, top_doubt, base_bias

    def analyze(self, ticker, date=None, filepath=None):
        """Performs Two-Stage Screener & Multi-Expert Quantitative Audit."""
        if filepath is None:
            filepath = f"stock_data/{ticker}.csv"
            
        if not os.path.exists(filepath):
            return {"error": f"Data file for ticker '{ticker}' not found at '{filepath}'."}
            
        df_stock = pd.read_csv(filepath)
        df_stock["Date"] = pd.to_datetime(df_stock["Date"])
        df_stock = df_stock.sort_values("Date").reset_index(drop=True)
        
        if date is not None:
            match = df_stock[df_stock["Date"] == pd.to_datetime(date)]
            if match.empty:
                return {"error": f"Date '{date}' not found in historical data for '{ticker}'."}
            target_idx = match.index[0]
        else:
            target_idx = len(df_stock) - 1
            
        if target_idx < LOOKBACK + 15:
            return {"error": f"Insufficient historical lookback for date {df_stock.loc[target_idx, 'Date'].strftime('%Y-%m-%d')}."}
            
        candle = self.compute_features(df_stock, target_idx)
        candle_date = candle["Date"].strftime("%Y-%m-%d")
        close_price = candle["Close"]
        resistance = candle["Resistance"]
        res_dist = candle["Resistance_Distance_%"]
        close_pos = candle["Close_Position"]
        vol_ratio = candle["Volume_Ratio"]
        
        # Stage 1: Screener Check
        is_breakout_candidate = (
            (close_price > resistance * (1 + BREAKOUT_PCT)) and
            (close_pos >= CLOSE_NEAR_HIGH) and
            (vol_ratio >= VOLUME_MULTIPLIER)
        )
        
        report = {
            "Ticker": ticker,
            "Date": candle_date,
            "Close": round(close_price, 2),
            "Resistance_30d": round(resistance, 2),
            "Distance_to_Resistance_%": round(res_dist, 2),
            "Close_Position": round(close_pos, 3),
            "Volume_Ratio": round(vol_ratio, 2),
            "Is_Breakout_Candidate": is_breakout_candidate
        }
        
        # If NOT a breakout candidate, report consolidation / stable state
        if not is_breakout_candidate:
            reasons = []
            if close_price <= resistance:
                reasons.append(f"Price is below 30-day resistance (${resistance:.2f}) by {abs(res_dist):.2f}%.")
            elif close_price <= resistance * (1 + BREAKOUT_PCT):
                reasons.append(f"Price breached resistance but failed the 1% clearance hurdle (+{res_dist:.2f}% vs required +1.00%).")
            if close_pos < CLOSE_NEAR_HIGH:
                reasons.append(f"Intraday closing position ({close_pos:.2f}) is weak (requires >= 0.70 near day's high).")
            if vol_ratio < VOLUME_MULTIPLIER:
                reasons.append(f"Volume surge ({vol_ratio:.2f}x) is below the required institutional surge (>= 1.20x).")
                
            report["Status"] = "STABLE_CONSOLIDATION"
            report["Status_Message"] = "Stock is currently consolidating within normal boundaries. No breakout signal triggered today."
            report["Screening_Failures"] = reasons
            return report
            
        # Stage 2: Breakout Candidate Detected -> Multi-Expert Evaluation
        report["Status"] = "BREAKOUT_CANDIDATE_DETECTED"
        expert_evaluations = {}
        approval_count = 0
        
        for exp_name, exp_info in self.experts.items():
            model = exp_info["model"]
            prob_breakout = model.predict_proba(candle[FEATURE_COLS].values.reshape(1, -1))[0, 1]
            prob_fakeout = 1.0 - prob_breakout
            is_approved = bool(prob_breakout >= exp_info["min_prob"])
            if is_approved:
                approval_count += 1
                
            contribs, top_support, top_doubt, base_bias = self.explain_expert(model, candle)
            
            # Extract top support & doubt drivers with descriptions
            support_factors = []
            for feat, impact in top_support.items():
                support_factors.append({
                    "feature": feat,
                    "description": FEATURE_DESCRIPTIONS.get(feat, feat),
                    "value": round(float(candle[feat]), 3),
                    "impact": round(float(impact), 3)
                })
                
            doubt_factors = []
            for feat, impact in top_doubt.items():
                doubt_factors.append({
                    "feature": feat,
                    "description": FEATURE_DESCRIPTIONS.get(feat, feat),
                    "value": round(float(candle[feat]), 3),
                    "impact": round(float(impact), 3)
                })
                
            expert_evaluations[exp_name] = {
                "Verdict": "APPROVED (GENUINE BREAKOUT)" if is_approved else "REJECTED (FAKEOUT ALERT)",
                "Breakout_Probability_%": round(prob_breakout * 100, 1),
                "Fakeout_Probability_%": round(prob_fakeout * 100, 1),
                "Profile": exp_info["profile"],
                "Factors_Causing_Doubt": doubt_factors,
                "Factors_Supporting_Breakout": support_factors
            }
            
        report["Experts"] = expert_evaluations
        
        # Consensus Engine
        if approval_count == 3:
            consensus = "UNANIMOUS APPROVAL: High-Conviction Breakout 🟢"
            action = "CONFIDENT LONG ENTRY (Institutional Grade Setup)"
        elif approval_count == 2:
            consensus = "MAJORITY APPROVAL: Moderate Breakout 🟡"
            action = "STANDARD POSITION SIZE (Conservative stop-loss recommended)"
        elif approval_count == 1:
            consensus = "SPLIT DECISION: High Risk Speculative 🟠"
            action = "PASS / WATCHLIST ONLY (Conservative & Balanced experts rejected)"
        else:
            consensus = "UNANIMOUS REJECTION: Deadly Bull Trap / Fakeout Alert 🔴"
            action = "DO NOT ENTER / STAND ASIDE (High probability of capital drawdown)"
            
        report["Consensus"] = {
            "Verdict": consensus,
            "Approval_Rate": f"{approval_count}/3 Experts Approved",
            "Recommended_Action": action,
            "Stop_Loss_Guidance": f"Suggested Stop Loss: ${candle['Close'] * (1 - candle['ATR_Pct']/100):.2f} (1 ATR = -{candle['ATR_Pct']:.2f}%)"
        }
        
        return report

def print_audit_report(result):
    print("=" * 85)
    print(f"       🏛️ QUANTITATIVE MULTI-EXPERT DECISION SYSTEM: {result.get('Ticker', 'UNKNOWN')}")
    print("=" * 85)
    print(f"Date: {result.get('Date')} | Close Price: ${result.get('Close')} | 30d Resistance: ${result.get('Resistance_30d')}")
    print(f"Distance to Resistance: {result.get('Distance_to_Resistance_%'):+.2f}% | Volume Ratio: {result.get('Volume_Ratio')}x")
    print("-" * 85)
    
    if result.get("Status") == "STABLE_CONSOLIDATION":
        print("⚪ STATE: STABLE / CONSOLIDATING WITHIN RANGE (NO BREAKOUT TODAY)")
        print("Summary: The asset did not trigger the breakout screener criteria.")
        print("\nScreener Audit Details:")
        for r in result.get("Screening_Failures", []):
            print(f"   • {r}")
        print("=" * 85)
        return
        
    print("🚨 STATE: CANDIDATE BREAKOUT DETECTED -> REFERRED TO QUANTITATIVE PANEL")
    print("-" * 85)
    
    consensus = result["Consensus"]
    print(f"🏛️ COMMITTEE CONSENSUS:  {consensus['Verdict']}")
    print(f"📋 ACTION GUIDANCE:      {consensus['Recommended_Action']}")
    print(f"🛡️ RISK MANAGEMENT:      {consensus['Stop_Loss_Guidance']}")
    print("=" * 85)
    
    print("\n" + "-" * 35 + " PANEL OF EXPERTS BREAKDOWN " + "-" * 35)
    for exp_name, exp in result["Experts"].items():
        v_icon = "🟢" if "APPROVED" in exp["Verdict"] else "🔴"
        print(f"\n👤 [{exp_name}] -> {v_icon} {exp['Verdict']}")
        print(f"   Breakout Confidence: {exp['Breakout_Probability_%']}%  |  Fakeout Risk: {exp['Fakeout_Probability_%']}%")
        print(f"   Philosophy: {exp['Profile']}")
        
        if exp["Factors_Causing_Doubt"]:
            print("   🔴 Why Did the Expert Doubt (Pushing Towards Trap/Fakeout)?")
            for d in exp["Factors_Causing_Doubt"]:
                print(f"      - {d['description']}: value = {d['value']} (weight: {d['impact']:+.3f})")
                
        if exp["Factors_Supporting_Breakout"]:
            print("   🟢 What Factors Supported the Breakout?")
            for s in exp["Factors_Supporting_Breakout"]:
                print(f"      - {s['description']}: value = {s['value']} (weight: {s['impact']:+.3f})")
    print("=" * 85)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stock Breakout Multi-Expert Analyzer")
    parser.add_argument("--ticker", type=str, default="AAPL", help="Stock Ticker (e.g. AAPL, NVDA, MSFT)")
    parser.add_argument("--date", type=str, default=None, help="Target Date (YYYY-MM-DD), default latest")
    args = parser.parse_args()
    
    system = MultiExpertSystem()
    res = system.analyze(ticker=args.ticker, date=args.date)
    print_audit_report(res)
