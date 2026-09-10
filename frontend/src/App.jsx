import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import Navbar from './components/Navbar';
import Controls from './components/Controls';
import CandlestickChart from './components/CandlestickChart';
import DecisionCard from './components/DecisionCard';
import TriExpertMatrix from './components/TriExpertMatrix';
import TreeSHAPView from './components/TreeSHAPView';
import CopilotDrawer from './components/CopilotDrawer';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://45.39.253.4.sslip.io/api';

function DashboardContent() {
  const { lang, t } = useLanguage();
  const [stocks, setStocks] = useState([]);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const [selectedTicker, setSelectedTicker] = useState('NVDA');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedModel, setSelectedModel] = useState('Consensus');

  const [chartData, setChartData] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusNotice, setStatusNotice] = useState(null);

  // Helper to get latest available date for currently selected ticker
  const currentStockMeta = stocks.find((s) => s.ticker === selectedTicker);
  const latestAvailableDate = currentStockMeta?.end_date || (chartData?.candles?.length > 0 ? chartData.candles[chartData.candles.length - 1].date : '');

  // 1. Initial Load: Fetch Stocks and Presets
  useEffect(() => {
    async function initData() {
      try {
        const [stocksRes, presetsRes] = await Promise.all([
          fetch(`${API_BASE}/stocks`),
          fetch(`${API_BASE}/presets`)
        ]);
        const stocksJson = await stocksRes.json();
        const presetsJson = await presetsRes.json();

        setStocks(stocksJson);
        setPresets(presetsJson);

        // Default to latest available date of NVDA
        const nvda = stocksJson.find((s) => s.ticker === 'NVDA') || stocksJson[0];
        if (nvda) {
          setSelectedTicker(nvda.ticker);
          setSelectedDate(nvda.end_date);
          handleRunAudit(nvda.ticker, nvda.end_date);
        }
      } catch (err) {
        console.error('Failed to load initial metadata:', err);
        setError('Could not connect to FastAPI backend on http://localhost:8000');
      }
    }
    initData();
  }, []);

  // 2. Fetch Chart Data (Supports date-window centering around inspected candle)
  const loadChart = async (ticker = selectedTicker, date = selectedDate) => {
    if (!ticker) return;
    try {
      const url = date
        ? `${API_BASE}/chart/${ticker}?target_date=${date}&limit=160`
        : `${API_BASE}/chart/${ticker}?limit=160`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Chart data unavailable');
      const json = await res.json();
      setChartData(json);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  // 3. Run Quantitative Audit
  const handleRunAudit = async (ticker = selectedTicker, date = selectedDate) => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      // Synchronize chart to show the exact audited candle and surrounding window
      loadChart(ticker, date);

      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker,
          date: date || undefined,
          expert: selectedModel
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Audit failed');
      }

      const report = await res.json();
      setAuditResult(report);
    } catch (err) {
      console.error('Audit execution error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle changing ticker from dropdown -> Automatically default to its latest date!
  const handleSelectTicker = (ticker) => {
    setSelectedTicker(ticker);
    setSelectedPreset(null);
    const meta = stocks.find((s) => s.ticker === ticker);
    const targetDate = meta?.end_date || '';
    if (targetDate) {
      setSelectedDate(targetDate);
      loadChart(ticker, targetDate);
      handleRunAudit(ticker, targetDate);
    }
  };

  // 5. Jump to Today / Latest Date
  const handleSetLatestDate = () => {
    setSelectedPreset(null);
    if (latestAvailableDate) {
      setSelectedDate(latestAvailableDate);
      loadChart(selectedTicker, latestAvailableDate);
      handleRunAudit(selectedTicker, latestAvailableDate);
    }
  };

  // 6. Live Refresh via Yahoo Finance API
  const handleRefreshLive = async (ticker = selectedTicker) => {
    setRefreshing(true);
    setError(null);
    setStatusNotice(null);
    try {
      const res = await fetch(`${API_BASE}/refresh/${ticker}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Live refresh failed');
      }

      const data = await res.json();
      setStatusNotice(
        lang === 'ar'
          ? `تم تحديث بيانات السوق المباشرة لسهم ${ticker} حتى ${data.latest_date} ($${data.latest_price})!`
          : `Live market data updated for ${ticker} up to ${data.latest_date} ($${data.latest_price})!`
      );

      // Refresh chart and stocks
      const [chartRes, stocksRes] = await Promise.all([
        fetch(`${API_BASE}/chart/${ticker}?target_date=${data.latest_date}&limit=160`),
        fetch(`${API_BASE}/stocks`)
      ]);
      const chartJson = await chartRes.json();
      const stocksJson = await stocksRes.json();

      setChartData(chartJson);
      setStocks(stocksJson);
      setSelectedDate(data.latest_date);
      setSelectedPreset(null);

      // Re-run audit with the new live candle
      handleRunAudit(ticker, data.latest_date);

      // Auto-clear notice after 6 seconds
      setTimeout(() => setStatusNotice(null), 6000);
    } catch (err) {
      console.error('Live fetch error:', err);
      setError(`Live Refresh Error: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  // 7. Handle Preset benchmark selection
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setSelectedTicker(preset.ticker);
    setSelectedDate(preset.date);
    loadChart(preset.ticker, preset.date);
    handleRunAudit(preset.ticker, preset.date);
  };

  // 8. Handle AI Copilot Stock & Date Auto-Sync
  const handleSelectStockAndDate = (ticker, date) => {
    setSelectedPreset(null);
    setSelectedTicker(ticker);
    setSelectedDate(date);
    loadChart(ticker, date);
    handleRunAudit(ticker, date);
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navbar
        presets={presets}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
      />

      {/* Control Bar */}
      <Controls
        stocks={stocks}
        selectedTicker={selectedTicker}
        setSelectedTicker={handleSelectTicker}
        selectedDate={selectedDate}
        setSelectedDate={(date) => {
          setSelectedDate(date);
          setSelectedPreset(null);
        }}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        onRunAudit={() => handleRunAudit()}
        onRefreshLive={handleRefreshLive}
        loading={loading}
        refreshing={refreshing}
      />

      {/* Status Notice (Live Update Confirmation) */}
      {statusNotice && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#34d399',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Zap size={15} />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Interactive Technical Chart */}
        <CandlestickChart
          chartData={chartData}
          targetDate={selectedDate}
          ticker={selectedTicker}
          name={chartData?.name || ''}
        />

        {/* Right Column: Tactical Decision, Tri-Expert Matrix & TreeSHAP */}
        <div className="analysis-column">
          <DecisionCard auditResult={auditResult} />

          {auditResult?.Status === 'BREAKOUT_CANDIDATE_DETECTED' && (
            <>
              <TriExpertMatrix
                experts={auditResult?.Experts}
                selectedModel={selectedModel}
              />
              <TreeSHAPView
                experts={auditResult?.Experts}
              />
            </>
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <footer className="terminal-footer">
        <div>
          <span>{t('footerTitle')}</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span>{t('footerWinRate')}</span>
          <span>{t('footerCapture')}</span>
          <span>{t('footerLiveFetch')}</span>
        </div>
      </footer>

      {/* Floating Autonomous AI Copilot */}
      <CopilotDrawer
        selectedTicker={selectedTicker}
        selectedDate={selectedDate}
        onSelectStockAndDate={handleSelectStockAndDate}
        apiBase={import.meta.env.VITE_API_BASE_HOST || "https://45.39.253.4.sslip.io"}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
}
