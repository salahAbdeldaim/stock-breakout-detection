import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, Cpu, Play, RefreshCw, ChevronDown, Check, X } from 'lucide-react';
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
  const { lang, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const currentStock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0] || {
    ticker: selectedTicker,
    name: selectedTicker,
    last_price: ''
  };

  const filteredStocks = stocks.filter((stock) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    return (
      stock.ticker.toLowerCase().includes(q) ||
      (stock.name && stock.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="controls-panel">
      {/* Custom Searchable Stock Dropdown */}
      <div className="control-item custom-stock-dropdown-container" ref={dropdownRef}>
        <label className="control-label">
          <Search size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
          {t('assetEquity')}
        </label>

        <button
          type="button"
          className={`stock-select-trigger ${dropdownOpen ? 'active' : ''}`}
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setSearchTerm('');
          }}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <div className="stock-trigger-info">
            <span className="stock-badge-ticker">{currentStock.ticker}</span>
            <span className="stock-trigger-name">{currentStock.name}</span>
          </div>
          <div className="stock-trigger-meta">
            {currentStock.last_price && (
              <span className="stock-trigger-price">${Number(currentStock.last_price).toFixed(2)}</span>
            )}
            <ChevronDown size={14} className={`stock-trigger-chevron ${dropdownOpen ? 'open' : ''}`} />
          </div>
        </button>

        {dropdownOpen && (
          <div className="custom-stock-popover" role="listbox">
            {/* Search filter inside dropdown */}
            <div className="stock-popover-search">
              <Search size={14} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                className="stock-popover-search-input"
                placeholder={t('searchStockPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="stock-search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* List of stocks */}
            <div className="stock-popover-list">
              {filteredStocks.length === 0 ? (
                <div className="stock-popover-empty">
                  {t('noStocksFound')}
                </div>
              ) : (
                filteredStocks.map((stock) => {
                  const isSelected = stock.ticker === selectedTicker;
                  const price = stock.last_price ? `$${Number(stock.last_price).toFixed(2)}` : '';
                  const changePct = stock.change_pct !== undefined ? stock.change_pct : null;
                  const isPositive = changePct !== null && changePct >= 0;

                  return (
                    <div
                      key={stock.ticker}
                      role="option"
                      aria-selected={isSelected}
                      className={`stock-popover-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedTicker(stock.ticker);
                        setDropdownOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className="stock-item-main">
                        <span className="stock-item-ticker">{stock.ticker}</span>
                        <span className="stock-item-name">{stock.name}</span>
                      </div>
                      <div className="stock-item-right">
                        {price && <span className="stock-item-price">{price}</span>}
                        {changePct !== null && (
                          <span className={`stock-item-change ${isPositive ? 'up' : 'down'}`}>
                            {isPositive ? '+' : ''}{Number(changePct).toFixed(2)}%
                          </span>
                        )}
                        {isSelected && <Check size={14} className="stock-item-check" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
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
            } catch (err) {}
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
