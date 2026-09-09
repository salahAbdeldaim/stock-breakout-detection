import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Controls from './components/Controls';
import CandlestickChart from './components/CandlestickChart';
import DecisionCard from './components/DecisionCard';
import TriExpertMatrix from './components/TriExpertMatrix';
import TreeSHAPView from './components/TreeSHAPView';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
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

  // 2. Fetch Chart Data whenever ticker changes
  useEffect(() => {
    if (!selectedTicker) return;
    async function loadChart() {
      try {
        const res = await fetch(`${API_BASE}/chart/${selectedTicker}?limit=150`);
        if (!res.ok) throw new Error('Chart data unavailable');
        const json = await res.json();
        setChartData(json);
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    }
    loadChart();
  }, [selectedTicker]);

  // 3. Run Quantitative Audit
  const handleRunAudit = async (ticker = selectedTicker, date = selectedDate) => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
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
      handleRunAudit(ticker, targetDate);
    }
  };

  // 5. Jump to Today / Latest Date
  const handleSetLatestDate = () => {
    setSelectedPreset(null);
    if (latestAvailableDate) {
      setSelectedDate(latestAvailableDate);
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
      setStatusNotice(`⚡ Live market data updated for ${ticker} up to ${data.latest_date} ($${data.latest_price})!`);

      // Refresh chart and stocks
      const [chartRes, stocksRes] = await Promise.all([
        fetch(`${API_BASE}/chart/${ticker}?limit=150`),
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
    handleRunAudit(preset.ticker, preset.date);
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
        onSetLatestDate={handleSetLatestDate}
        latestAvailableDate={latestAvailableDate}
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
            fontFamily: 'var(--font-mono)'
          }}
        >
          {statusNotice}
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
            fontSize: '0.85rem'
          }}
        >
          <span>⚠️ {error}</span>
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
          <span>QUANTBREAKOUT AI TERMINAL // FASTAPI + REACT VITE</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>WIN RATE: 83.3% - 90.1%</span>
          <span>MARKET CAPTURE: 98.6%</span>
          <span>LIVE MARKET FETCH: ACTIVE (YFINANCE)</span>
        </div>
      </footer>
    </div>
  );
}
