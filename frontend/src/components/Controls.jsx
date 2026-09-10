import React from 'react';
import { Search, Calendar, Cpu, Play, RefreshCw } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

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
  loading,
  refreshing
}) {
  const { t } = useLanguage();

  return (
    <div className="controls-panel">
      {/* Stock Selector */}
      <div className="control-item">
        <label className="control-label">
          <Search size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
          {t('assetEquity')}
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

      {/* Date Selector */}
      <div className="control-item">
        <label className="control-label">
          <Calendar size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
          {t('inspectionDate')}
        </label>
        <input
          type="date"
          className="control-input"
          value={selectedDate}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker();
            } catch (err) {
              // Browser fallback
            }
          }}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Model Focus */}
      <div className="control-item">
        <label className="control-label">
          <Cpu size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
          {t('modelFocus')}
        </label>
        <select
          className="control-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="Consensus">{t('modelConsensus')}</option>
          <option value="Conservative">{t('modelConservative')}</option>
          <option value="Balanced">{t('modelBalanced')}</option>
          <option value="Aggressive">{t('modelAggressive')}</option>
        </select>
      </div>

      {/* Buttons Group */}
      <div className="controls-buttons-group">
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
          title={t('liveFetchTitle')}
        >
          <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
          <span>{refreshing ? t('fetching') : t('liveFetch')}</span>
        </button>

        {/* Audit Trigger */}
        <button
          className="audit-btn"
          onClick={onRunAudit}
          disabled={loading || refreshing}
        >
          <Play size={15} fill="currentColor" />
          <span>{loading ? t('auditingEngine') : t('runAudit')}</span>
        </button>
      </div>
    </div>
  );
}
