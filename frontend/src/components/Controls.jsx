import React from 'react';
import { Search, Calendar, Cpu, Play, RefreshCw, Zap } from 'lucide-react';

export default function Controls({
  stocks,
  selectedTicker,
  setSelectedTicker,
  selectedDate,
  setSelectedDate,
  selectedModel,
  setSelectedModel,
  onRunAudit,
  onRefreshLive,
  onSetLatestDate,
  latestAvailableDate,
  loading,
  refreshing
}) {
  const isLatest = selectedDate === latestAvailableDate;

  return (
    <div className="controls-panel">
      {/* Stock Selector */}
      <div className="control-item">
        <label className="control-label">
          <Search size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Asset / Equity (50 US Stocks)
        </label>
        <select
          className="control-select"
          value={selectedTicker}
          onChange={(e) => setSelectedTicker(e.target.value)}
        >
          {stocks.map((stock) => (
            <option key={stock.ticker} value={stock.ticker}>
              {stock.ticker} - {stock.name} (${stock.last_price})
            </option>
          ))}
        </select>
      </div>

      {/* Date Selector with Today / Latest Button */}
      <div className="control-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="control-label">
            <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Inspection Date
          </label>
          <button
            type="button"
            onClick={onSetLatestDate}
            style={{
              background: isLatest ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
              border: `1px solid ${isLatest ? '#10b981' : '#38bdf8'}`,
              color: isLatest ? '#34d399' : '#38bdf8',
              borderRadius: '4px',
              padding: '0.15rem 0.45rem',
              fontSize: '0.68rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontFamily: 'var(--font-mono)'
            }}
            title="Jump to the most recent trading day available"
          >
            <Zap size={10} />
            <span>{isLatest ? 'Today / Latest' : 'Set to Latest'}</span>
          </button>
        </div>
        <input
          type="date"
          className="control-input"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Model Focus */}
      <div className="control-item">
        <label className="control-label">
          <Cpu size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Quantitative Model Focus
        </label>
        <select
          className="control-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="Consensus">Tri-Expert Consensus (Tiered Strategy 🏛️)</option>
          <option value="Conservative">Conservative (Capital Preserver - XGBoost w=5.0)</option>
          <option value="Balanced">Balanced (LightGBM Alpha Booster w=3.0)</option>
          <option value="Aggressive">Aggressive (Momentum Hunter - XGBoost w=1.0)</option>
        </select>
      </div>

      {/* Buttons Group */}
      <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
        {/* Live Refresh Button */}
        <button
          type="button"
          onClick={() => onRefreshLive(selectedTicker)}
          disabled={refreshing || loading}
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid var(--border-active)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            height: '42px',
            transition: 'all 0.2s'
          }}
          title="Fetch latest real-time prices directly from Yahoo Finance"
        >
          <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
          <span>{refreshing ? 'Fetching...' : 'Live Fetch'}</span>
        </button>

        {/* Audit Trigger */}
        <button
          className="audit-btn"
          onClick={onRunAudit}
          disabled={loading || refreshing}
        >
          <Play size={15} fill="currentColor" />
          <span>{loading ? 'Auditing Engine...' : 'Run Audit'}</span>
        </button>
      </div>
    </div>
  );
}
