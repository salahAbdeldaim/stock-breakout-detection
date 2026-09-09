import React from 'react';
import { Activity, Zap, Shield, Sparkles, TrendingUp } from 'lucide-react';

export default function Navbar({ presets, selectedPreset, onSelectPreset }) {
  return (
    <header>
      <nav className="terminal-nav">
        <div className="brand-section">
          <div className="brand-logo-badge">QUANT // AI</div>
          <div>
            <h1 className="brand-title">QUANTBREAKOUT TERMINAL</h1>
            <div className="brand-subtitle">Multi-Expert Breakout & Bull Trap Quantitative Detection</div>
          </div>
        </div>

        <div className="nav-status-group">
          <div className="system-status-pill">
            <span className="pulse-dot"></span>
            <span>ENGINE ONLINE // 3 EXPERTS LOADED</span>
          </div>
        </div>
      </nav>

      {/* Preset Scenarios Strip */}
      <div className="presets-strip">
        <span className="presets-label">
          <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
          Benchmark Cases:
        </span>
        {presets.map((preset) => {
          const isActive = selectedPreset?.id === preset.id;
          return (
            <button
              key={preset.id}
              className={`preset-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPreset(preset)}
              title={preset.description}
            >
              {preset.expected_tier === 'TIER 1' && <TrendingUp size={13} color="#10b981" />}
              {preset.expected_tier === 'TIER 3' && <Shield size={13} color="#ef4444" />}
              {preset.expected_tier === 'NONE' && <Activity size={13} color="#38bdf8" />}
              <span>{preset.ticker} ({preset.date})</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>- {preset.expected_tier || 'Consolidation'}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
