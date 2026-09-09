import os
import json
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from stock_analyzer import MultiExpertSystem, LOOKBACK, BREAKOUT_PCT, CLOSE_NEAR_HIGH, VOLUME_MULTIPLIER

app = FastAPI(
    title="QuantBreakout AI Engine",
    description="Multi-Expert Breakout & Bull Trap Quantitative Detection API",
    version="2.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 50 Equities Metadata
STOCK_METADATA = {
    "AAPL": {"name": "Apple Inc.", "sector": "Technology"},
    "ABBV": {"name": "AbbVie Inc.", "sector": "Healthcare"},
    "ADBE": {"name": "Adobe Inc.", "sector": "Technology"},
    "AMD": {"name": "Advanced Micro Devices", "sector": "Semiconductors"},
    "AMZN": {"name": "Amazon.com Inc.", "sector": "Consumer Cyclical"},
    "AVGO": {"name": "Broadcom Inc.", "sector": "Semiconductors"},
    "BA": {"name": "Boeing Co.", "sector": "Industrials"},
    "BAC": {"name": "Bank of America", "sector": "Financials"},
    "CAT": {"name": "Caterpillar Inc.", "sector": "Industrials"},
    "CMCSA": {"name": "Comcast Corp.", "sector": "Communication Services"},
    "COP": {"name": "ConocoPhillips", "sector": "Energy"},
    "COST": {"name": "Costco Wholesale", "sector": "Consumer Defensive"},
    "CRM": {"name": "Salesforce Inc.", "sector": "Technology"},
    "CSCO": {"name": "Cisco Systems", "sector": "Technology"},
    "CVX": {"name": "Chevron Corp.", "sector": "Energy"},
    "DIS": {"name": "Walt Disney Co.", "sector": "Communication Services"},
    "GE": {"name": "General Electric", "sector": "Industrials"},
    "GOOGL": {"name": "Alphabet Inc.", "sector": "Communication Services"},
    "GS": {"name": "Goldman Sachs", "sector": "Financials"},
    "HD": {"name": "Home Depot", "sector": "Consumer Cyclical"},
    "HON": {"name": "Honeywell International", "sector": "Industrials"},
    "INTC": {"name": "Intel Corp.", "sector": "Semiconductors"},
    "JNJ": {"name": "Johnson & Johnson", "sector": "Healthcare"},
    "JPM": {"name": "JPMorgan Chase", "sector": "Financials"},
    "KO": {"name": "Coca-Cola Co.", "sector": "Consumer Defensive"},
    "LLY": {"name": "Eli Lilly and Co.", "sector": "Healthcare"},
    "MA": {"name": "Mastercard Inc.", "sector": "Financials"},
    "MCD": {"name": "McDonald's Corp.", "sector": "Consumer Cyclical"},
    "META": {"name": "Meta Platforms Inc.", "sector": "Communication Services"},
    "MRK": {"name": "Merck & Co.", "sector": "Healthcare"},
    "MS": {"name": "Morgan Stanley", "sector": "Financials"},
    "MSFT": {"name": "Microsoft Corp.", "sector": "Technology"},
    "NFLX": {"name": "Netflix Inc.", "sector": "Communication Services"},
    "NKE": {"name": "Nike Inc.", "sector": "Consumer Cyclical"},
    "NVDA": {"name": "NVIDIA Corp.", "sector": "Semiconductors"},
    "ORCL": {"name": "Oracle Corp.", "sector": "Technology"},
    "PEP": {"name": "PepsiCo Inc.", "sector": "Consumer Defensive"},
    "PFE": {"name": "Pfizer Inc.", "sector": "Healthcare"},
    "PG": {"name": "Procter & Gamble", "sector": "Consumer Defensive"},
    "QCOM": {"name": "Qualcomm Inc.", "sector": "Semiconductors"},
    "SLB": {"name": "Schlumberger", "sector": "Energy"},
    "TMO": {"name": "Thermo Fisher Scientific", "sector": "Healthcare"},
    "TSLA": {"name": "Tesla Inc.", "sector": "Consumer Cyclical"},
    "UNH": {"name": "UnitedHealth Group", "sector": "Healthcare"},
    "UNP": {"name": "Union Pacific", "sector": "Industrials"},
    "V": {"name": "Visa Inc.", "sector": "Financials"},
    "VZ": {"name": "Verizon Communications", "sector": "Communication Services"},
    "WFC": {"name": "Wells Fargo", "sector": "Financials"},
    "WMT": {"name": "Walmart Inc.", "sector": "Consumer Defensive"},
    "XOM": {"name": "Exxon Mobil", "sector": "Energy"}
}

# Singleton instance of the quantitative engine
engine: Optional[MultiExpertSystem] = None

@app.on_event("startup")
def startup_event():
    global engine
    print("[QuantBreakout] Initializing Multi-Expert Quantitative Engine...")
    engine = MultiExpertSystem(dataset_path="data/unified_breakout_dataset.csv")
    print("[QuantBreakout] Engine ready! All 3 experts loaded (Conservative, Balanced LightGBM, Aggressive).")

class AnalyzeRequest(BaseModel):
    ticker: str
    date: Optional[str] = None
    expert: Optional[str] = "Consensus"

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "QuantBreakout AI Engine", "version": "2.0.0"}

@app.get("/api/stocks")
def get_stocks():
    """Returns all 50 available stocks with metadata and historical coverage."""
    stocks_dir = "stock_data"
    if not os.path.exists(stocks_dir):
        raise HTTPException(status_code=500, detail="stock_data directory not found")
        
    results = []
    files = sorted([f for f in os.listdir(stocks_dir) if f.endswith(".csv")])
    
    for f in files:
        ticker = f.replace(".csv", "")
        meta = STOCK_METADATA.get(ticker, {"name": ticker, "sector": "Equities"})
        filepath = os.path.join(stocks_dir, f)
        
        try:
            df = pd.read_csv(filepath)
            df["Date"] = pd.to_datetime(df["Date"])
            df = df.sort_values("Date").reset_index(drop=True)
            
            last_row = df.iloc[-1]
            prev_row = df.iloc[-2] if len(df) > 1 else last_row
            change_pct = round(((last_row["Close"] - prev_row["Close"]) / prev_row["Close"]) * 100, 2)
            
            results.append({
                "ticker": ticker,
                "name": meta["name"],
                "sector": meta["sector"],
                "last_price": round(float(last_row["Close"]), 2),
                "change_pct": change_pct,
                "start_date": df.iloc[0]["Date"].strftime("%Y-%m-%d"),
                "end_date": last_row["Date"].strftime("%Y-%m-%d"),
                "total_candles": len(df)
            })
        except Exception:
            results.append({
                "ticker": ticker,
                "name": meta["name"],
                "sector": meta["sector"],
                "last_price": 0.0,
                "change_pct": 0.0,
                "start_date": "",
                "end_date": "",
                "total_candles": 0
            })
            
    return results

@app.get("/api/chart/{ticker}")
def get_chart_data(ticker: str, limit: int = Query(default=160, ge=30, le=500)):
    """Returns historical candlestick data, 30d resistance overlay, and breakout indicators."""
    filepath = f"stock_data/{ticker.upper()}.csv"
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found.")
        
    df = pd.read_csv(filepath)
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date").reset_index(drop=True)
    
    # Compute 30d resistance and indicators
    df["Resistance_30d"] = df["High"].shift(1).rolling(LOOKBACK).max()
    df["Avg_Vol_30d"] = df["Volume"].shift(1).rolling(LOOKBACK).mean()
    high_low = df["High"] - df["Low"]
    df["Close_Pos"] = np.where(high_low > 0, (df["Close"] - df["Low"]) / high_low, 0)
    df["Vol_Ratio"] = df["Volume"] / (df["Avg_Vol_30d"] + 1e-9)
    
    df["Is_Breakout"] = (
        (df["Close"] > df["Resistance_30d"] * (1 + BREAKOUT_PCT)) &
        (df["Close_Pos"] >= CLOSE_NEAR_HIGH) &
        (df["Vol_Ratio"] >= VOLUME_MULTIPLIER)
    )
    
    # Slice recent candles
    recent_df = df.tail(limit).copy()
    
    candles = []
    for _, row in recent_df.iterrows():
        res_val = round(float(row["Resistance_30d"]), 2) if pd.notnull(row["Resistance_30d"]) else None
        avg_vol = round(float(row["Avg_Vol_30d"]), 0) if pd.notnull(row["Avg_Vol_30d"]) else None
        
        candles.append({
            "date": row["Date"].strftime("%Y-%m-%d"),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
            "resistance_30d": res_val,
            "avg_volume_30d": avg_vol,
            "is_breakout": bool(row["Is_Breakout"]),
            "close_pos": round(float(row["Close_Pos"]), 2),
            "vol_ratio": round(float(row["Vol_Ratio"]), 2)
        })
        
    meta = STOCK_METADATA.get(ticker.upper(), {"name": ticker.upper(), "sector": "Equities"})
    return {
        "ticker": ticker.upper(),
        "name": meta["name"],
        "sector": meta["sector"],
        "candles": candles
    }

def sanitize_for_json(obj):
    if isinstance(obj, dict):
        return {str(k): sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [sanitize_for_json(v) for v in obj]
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, (np.integer, int)):
        return int(obj)
    elif isinstance(obj, (np.floating, float)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj

@app.post("/api/analyze")
def analyze_stock(req: AnalyzeRequest):
    """Executes full multi-expert quantitative analysis for a given ticker and date."""
    global engine
    if engine is None:
        engine = MultiExpertSystem(dataset_path="data/unified_breakout_dataset.csv")
        
    ticker = req.ticker.upper()
    result = engine.analyze(ticker, date=req.date)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return sanitize_for_json(result)

@app.post("/api/refresh/{ticker}")
def refresh_live_data(ticker: str):
    """Downloads the latest live market data from Yahoo Finance and updates local CSV."""
    import yfinance as yf
    filepath = f"stock_data/{ticker.upper()}.csv"
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found.")
        
    try:
        t = yf.Ticker(ticker.upper())
        df_new = t.history(period="1mo")
        if df_new.empty:
            raise HTTPException(status_code=400, detail=f"No recent live data returned for {ticker}.")
            
        df_new = df_new.reset_index()
        df_new["Date"] = pd.to_datetime(df_new["Date"]).dt.strftime("%Y-%m-%d")
        cols = ["Date", "Close", "High", "Low", "Open", "Volume"]
        df_new = df_new[cols]
        
        df_old = pd.read_csv(filepath)
        df_old["Date"] = pd.to_datetime(df_old["Date"]).dt.strftime("%Y-%m-%d")
        
        combined = pd.concat([df_old[cols], df_new], ignore_index=True)
        combined = combined.drop_duplicates(subset=["Date"], keep="last").sort_values("Date").reset_index(drop=True)
        combined.to_csv(filepath, index=False)
        
        latest_date = combined.iloc[-1]["Date"]
        latest_price = round(float(combined.iloc[-1]["Close"]), 2)
        return {
            "status": "success",
            "ticker": ticker.upper(),
            "latest_date": latest_date,
            "latest_price": latest_price,
            "message": f"Successfully updated live market data for {ticker.upper()} up to {latest_date}."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live fetch error: {str(e)}")

@app.get("/api/presets")
def get_presets():
    """Returns curated benchmark historical test cases representing all strategic tiers."""
    return [
        {
            "id": "nvda_tier1",
            "ticker": "NVDA",
            "date": "2024-06-05",
            "title": "NVDA Institutional Breakout (Tier 1 Consensus 🟢)",
            "description": "Massive post-consolidation clearance above resistance. Unanimous institutional approval (3/3 Experts, 100% Full Allocation).",
            "expected_state": "BREAKOUT_CANDIDATE_DETECTED",
            "expected_tier": "TIER 1"
        },
        {
            "id": "nvda_tier2",
            "ticker": "NVDA",
            "date": "2026-05-14",
            "title": "NVDA Speculative Momentum (Tier 2 Half-Size 🟡)",
            "description": "Momentum Hunter approved, but Conservative model flagged doubt. Half-size allocation (50%) + tight stop (-2.50%).",
            "expected_state": "BREAKOUT_CANDIDATE_DETECTED",
            "expected_tier": "TIER 2"
        },
        {
            "id": "cmcsa_tier3",
            "ticker": "CMCSA",
            "date": "2019-03-15",
            "title": "CMCSA Classic Bull Trap (Tier 3 Trap Alert 🔴)",
            "description": "Price pierced resistance but formed large upper wick. Unanimous rejection (0/3 Approved); capital completely preserved!",
            "expected_state": "BREAKOUT_CANDIDATE_DETECTED",
            "expected_tier": "TIER 3"
        },
        {
            "id": "tsla_consolidation",
            "ticker": "TSLA",
            "date": "2024-04-15",
            "title": "TSLA Rangebound Consolidation (Stable State ⚪)",
            "description": "Asset trading within baseline boundaries below resistance. Demonstrates stage 1 screener avoiding unnecessary model evaluation.",
            "expected_state": "STABLE_CONSOLIDATION",
            "expected_tier": "NONE"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
