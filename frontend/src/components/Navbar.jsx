import React, { useState, useEffect } from 'react';
import { Activity, Shield, Sparkles, TrendingUp, Globe, Clock, Timer, Info, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Navbar({ presets, selectedPreset, onSelectPreset }) {
  const { lang, setLang, t } = useLanguage();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [timeData, setTimeData] = useState({
    nyTime: '',
    nyDate: '',
    localTime: '',
    statusKey: 'marketClosed',
    statusColor: '#94a3b8',
    actionLabel: '',
    targetLabel: '',
    countdown: ''
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const nyTime = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const nyDate = now.toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric'
      });

      const localTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Break down NY wall-clock components
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      }).formatToParts(now);

      const getPart = (type) => parts.find((p) => p.type === type)?.value;
      const weekday = getPart('weekday');
      const hour = parseInt(getPart('hour') || '0', 10);
      const min = parseInt(getPart('minute') || '0', 10);
      const sec = parseInt(getPart('second') || '0', 10);

      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
      const totalMin = hour * 60 + min;
      const totalSec = totalMin * 60 + sec;

      let statusKey = 'marketClosed';
      let statusColor = '#94a3b8'; // Slate
      let actionLabel = '';
      let targetLabel = '';
      let remSec = 0;

      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

      if (isWeekday && totalMin >= 570 && totalMin < 960) {
        // 09:30 to 16:00 (Regular Trading Hours)
        statusKey = 'marketOpen';
        statusColor = '#10b981'; // Emerald
        remSec = (960 * 60) - totalSec;
        actionLabel = t('closesIn');
        targetLabel = t('regularSessionTarget');
      } else if (isWeekday && totalMin >= 960 && totalMin < 1200) {
        // 16:00 to 20:00 (After-Hours)
        statusKey = 'afterHours';
        statusColor = '#38bdf8'; // Cyan
        remSec = (1200 * 60) - totalSec;
        actionLabel = t('endsIn');
        targetLabel = t('afterHoursTarget');
      } else if (isWeekday && totalMin >= 240 && totalMin < 570) {
        // 04:00 to 09:30 (Pre-Market)
        statusKey = 'preMarket';
        statusColor = '#f59e0b'; // Amber
        remSec = (570 * 60) - totalSec;
        actionLabel = t('opensIn');
        targetLabel = t('preMarketTarget');
      } else {
        // Closed
        statusKey = 'marketClosed';
        statusColor = '#94a3b8';

        let daysUntil = 0;
        if (dayOfWeek === 6) { // Saturday -> Monday (2 days)
          daysUntil = 2;
        } else if (dayOfWeek === 0) { // Sunday -> Monday (1 day)
          daysUntil = 1;
        } else if (dayOfWeek === 5 && totalMin >= 1200) { // Friday night -> Monday (3 days)
          daysUntil = 3;
        } else if (totalMin >= 1200) { // Mon-Thu after 20:00 -> Tomorrow (1 day)
          daysUntil = 1;
        } else { // Mon-Fri 00:00 to 03:59 -> Today 09:30 AM (0 days)
          daysUntil = 0;
        }

        const targetSec = (daysUntil * 86400) + (570 * 60);
        remSec = targetSec - totalSec;

        const dayName = daysUntil === 0
          ? t('today')
          : (daysUntil === 1 ? t('tomorrow') : t('mon'));
        const amSuffix = lang === 'ar' ? 'ص' : 'AM';

        actionLabel = t('nextBell');
        targetLabel = `${t('nextBell')}: ${dayName} 9:30 ${amSuffix}`;
      }

      // Format countdown time
      const formatCountdown = (seconds) => {
        if (seconds <= 0) return lang === 'ar' ? 'الآن' : 'Now';
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (lang === 'ar') {
          if (d > 0) return `${d}ي ${h}س ${m}د`;
          if (h > 0) return `${h}س ${m}د ${s}ث`;
          return `${m}د ${s}ث`;
        } else {
          if (d > 0) return `${d}d ${h}h ${m}m`;
          if (h > 0) return `${h}h ${m}m ${s}s`;
          return `${m}m ${s}s`;
        }
      };

      setTimeData({
        nyTime,
        nyDate,
        localTime,
        statusKey,
        statusColor,
        actionLabel,
        targetLabel,
        countdown: formatCountdown(remSec)
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang, t]);

  return (
    <>
      <nav className="terminal-nav">
        <div className="brand-section">
          <button
            type="button"
            className="brand-logo-badge brand-logo-btn"
            onClick={() => setShowInfoModal(true)}
            title={t('clickForSystemInfo')}
          >
            STOCKPRED
          </button>
          <div className="brand-title-wrap">
            <h1 className="brand-title" onClick={() => setShowInfoModal(true)} title={t('clickForSystemInfo')}>
              {t('brandTitle')}
            </h1>
            <button
              type="button"
              className="brand-info-pill"
              onClick={() => setShowInfoModal(true)}
              title={t('clickForSystemInfo')}
              aria-label={t('systemInfoTag')}
            >
              <Info size={12} />
              <span>{t('systemInfoTag')}</span>
            </button>
          </div>
        </div>

        <div className="nav-status-group">
          {/* Real-time US Market Clock & Session Schedule */}
          <div
            className="market-clock-pill"
            title={`${t('marketScheduleTooltip')}\n• ${t('marketTimeNYC')}: ${timeData.nyDate} - ${timeData.nyTime}\n• ${timeData.targetLabel}\n• ${timeData.actionLabel}: ${timeData.countdown}\n• Local Time: ${timeData.localTime}`}
          >
            <div className="clock-time-segment">
              <Clock size={13} className="clock-icon" />
              <span className="clock-city">NYC</span>
              <span className="clock-time">{timeData.nyDate} · {timeData.nyTime}</span>
            </div>

            <span className="nav-pill-separator" />

            <span
              className="market-status-tag"
              style={{
                background: `${timeData.statusColor}18`,
                color: timeData.statusColor,
                border: `1px solid ${timeData.statusColor}44`
              }}
            >
              <span className="status-indicator-dot" style={{ background: timeData.statusColor }} />
              {t(timeData.statusKey)}
            </span>

            <span className="nav-pill-separator" />

            <div className="market-countdown-segment" title={timeData.targetLabel}>
              <Timer size={12} className="countdown-timer-icon" />
              <span className="countdown-label">{timeData.actionLabel}:</span>
              <span className="countdown-val">{timeData.countdown}</span>
            </div>
          </div>

          {/* Engine Status */}
          <div className="system-status-pill" title={t('engineOnline')}>
            <span className="pulse-dot"></span>
            <span className="engine-status-text">{t('engineOnline')}</span>
          </div>

          {/* Presentation Deck Link */}
          <a
            href={import.meta.env.VITE_PRESENTATION_URL || "https://45.39.253.4.sslip.io/presentation/"}
            target="_blank"
            rel="noopener noreferrer"
            className="lang-btn"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', padding: '0.35rem 0.75rem', background: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.3)' }}
            title={lang === 'ar' ? 'فتح العرض التقديمي التنفيذي للمشروع' : 'Open Executive Presentation Deck (20 Slides)'}
          >
            <Sparkles size={12} color="#38bdf8" />
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{lang === 'ar' ? 'العرض التقديمي' : 'Slides'}</span>
          </a>

          {/* Full Language Switcher Toggle */}
          <div className="lang-switcher" role="group" aria-label={t('switchLanguage')}>
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
              title="Switch interface to English"
            >
              <Globe size={11} />
              <span>EN</span>
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
              onClick={() => setLang('ar')}
              title="تبديل الواجهة بالكامل للغة العربية"
            >
              <span>العربية</span>
            </button>
          </div>
        </div>
      </nav>

      {/* System Architecture & Info Modal */}
      {showInfoModal && (
        <div className="info-modal-backdrop" onClick={() => setShowInfoModal(false)}>
          <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <div className="info-modal-title-group">
                <div className="brand-logo-badge">STOCKPRED</div>
                <div>
                  <h2 className="info-modal-title">{t('brandTitle')}</h2>
                  <div className="info-modal-subtitle">{t('brandSubtitle')}</div>
                </div>
              </div>
              <button
                type="button"
                className="info-modal-close-btn"
                onClick={() => setShowInfoModal(false)}
                aria-label={t('close')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="info-modal-body">
              <p className="info-modal-description">
                {t('systemDetailedDesc')}
              </p>

              <div className="info-specs-grid">
                <div className="info-spec-item">
                  <span className="info-spec-label">{t('specArchitecture')}</span>
                  <span className="info-spec-val">Stage 1 Screener + Stage 2 Tri-Expert Consensus</span>
                </div>
                <div className="info-spec-item">
                  <span className="info-spec-label">{t('specModels')}</span>
                  <span className="info-spec-val">Conservative (XGBoost w=5), Balanced (LightGBM w=3), Aggressive (XGBoost w=1)</span>
                </div>
                <div className="info-spec-item">
                  <span className="info-spec-label">{t('specCapitalRules')}</span>
                  <span className="info-spec-val">Tier 1 (100% Full), Tier 2 (50% Half-Size), Tier 3 (0% Avoid Bull Trap)</span>
                </div>
                <div className="info-spec-item">
                  <span className="info-spec-label">{t('specTeam')}</span>
                  <span className="info-spec-val">Team Stockbrokers // NTI Quantitative AI Track</span>
                </div>
              </div>

              <div className="info-modal-footer-strip">
                <div className="info-chips-group">
                  <span className="info-tag-chip">Tri-Expert ML Ensemble</span>
                  <span className="info-tag-chip">TreeSHAP Explainability</span>
                  <span className="info-tag-chip">Live Market Feeds</span>
                </div>
                <button
                  type="button"
                  className="info-modal-ok-btn"
                  onClick={() => setShowInfoModal(false)}
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Scenarios Strip */}
      <div className="presets-strip">
        <span className="presets-label">
          <Sparkles size={13} style={{ display: 'inline', marginInlineEnd: '4px' }} />
          {t('benchmarkCases')}
        </span>
        {presets.map((preset) => {
          const isActive = selectedPreset?.id === preset.id;
          const tierLabel = preset.expected_tier && preset.expected_tier !== 'NONE'
            ? preset.expected_tier
            : t('consolidation');

          const tooltip = t(`preset_${preset.id}_desc`) || preset.description;

          return (
            <button
              key={preset.id}
              className={`preset-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPreset(preset)}
              title={tooltip}
            >
              {preset.expected_tier === 'TIER 1' && <TrendingUp size={13} color="#10b981" />}
              {preset.expected_tier === 'TIER 3' && <Shield size={13} color="#ef4444" />}
              {preset.expected_tier === 'NONE' && <Activity size={13} color="#38bdf8" />}
              <span>{preset.ticker} ({preset.date})</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>- {tierLabel}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
