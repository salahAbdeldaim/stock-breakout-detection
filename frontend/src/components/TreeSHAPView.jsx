import React, { useState } from 'react';
import { Eye, TrendingUp, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function TreeSHAPView({ experts, activeExpertName }) {
  const { lang, t } = useLanguage();

  if (!experts) return null;

  // Determine which expert to show SHAP for
  const expertKeys = Object.keys(experts);
  const [selectedExpKey, setSelectedExpKey] = useState(
    activeExpertName && experts[activeExpertName] ? activeExpertName : expertKeys[0]
  );

  const currentExpert = experts[selectedExpKey] || experts[expertKeys[0]];
  if (!currentExpert) return null;

  const supportFactors = currentExpert.Factors_Supporting_Breakout || [];
  const doubtFactors = currentExpert.Factors_Causing_Doubt || [];

  // Find max impact magnitude for normalizing bar lengths
  let maxImpact = 0.01;
  [...supportFactors, ...doubtFactors].forEach((f) => {
    if (Math.abs(f.impact) > maxImpact) maxImpact = Math.abs(f.impact);
  });

  return (
    <div className="shap-panel">
      <div className="shap-header">
        <div className="shap-title">
          <Eye size={16} color="#38bdf8" />
          <span>{t('shapTitle')}</span>
        </div>

        {/* Model Switcher for SHAP */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {expertKeys.map((key) => {
            const isSel = selectedExpKey === key;
            const shortName = lang === 'ar'
              ? (key.includes('Conservative')
                  ? t('expertConservativeName')
                  : key.includes('Balanced')
                  ? t('expertBalancedName')
                  : t('expertAggressiveName'))
              : key.split(' ')[0];

            return (
              <button
                key={key}
                onClick={() => setSelectedExpKey(key)}
                style={{
                  background: isSel ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                  border: `1px solid ${isSel ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                  color: isSel ? '#f8fafc' : '#94a3b8',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: isSel ? 600 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Support Factors (Positive Drivers) */}
        <div>
          <div className="shap-section-title" style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={14} />
              <span>{t('supportDrivers')}</span>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>+SHAP</span>
          </div>

          <div className="shap-factors-list">
            {supportFactors.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '0.5rem' }}>
                {t('noSupportFactors')}
              </div>
            ) : (
              supportFactors.map((f, i) => {
                const widthPct = Math.min(100, (Math.abs(f.impact) / maxImpact) * 100);
                const title = lang === 'ar'
                  ? (f.name_ar || f.name || f.feature)
                  : (f.name || f.feature?.replace(/_/g, ' '));
                const description = lang === 'ar'
                  ? (f.description_ar || f.description)
                  : f.description;
                const displayVal = f.formatted_value || (f.value !== undefined ? String(f.value) : '');

                return (
                  <div key={i} className="shap-factor-row">
                    <div className="shap-factor-meta">
                      <span className="shap-factor-name">{title}</span>
                      <div style={{ textAlign: lang === 'ar' ? 'left' : 'right', display: 'flex', flexDirection: 'column', alignItems: lang === 'ar' ? 'flex-start' : 'flex-end', gap: '2px' }}>
                        <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>
                          +{f.impact.toFixed(3)}
                        </span>
                        {displayVal && (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 6px', borderRadius: '4px', color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>
                            {displayVal}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shap-factor-desc">
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.4 }}>
                        {description}
                      </div>
                    </div>

                    <div className="shap-bar-track">
                      <div className="shap-bar-fill fill-support" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Doubt Factors (Trap Risks) */}
        <div>
          <div className="shap-section-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={14} />
              <span>{t('trapRisks')}</span>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>-SHAP</span>
          </div>

          <div className="shap-factors-list">
            {doubtFactors.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '0.5rem' }}>
                {t('noDoubtFactors')}
              </div>
            ) : (
              doubtFactors.map((f, i) => {
                const widthPct = Math.min(100, (Math.abs(f.impact) / maxImpact) * 100);
                const title = lang === 'ar'
                  ? (f.name_ar || f.name || f.feature)
                  : (f.name || f.feature?.replace(/_/g, ' '));
                const description = lang === 'ar'
                  ? (f.description_ar || f.description)
                  : f.description;
                const displayVal = f.formatted_value || (f.value !== undefined ? String(f.value) : '');

                return (
                  <div key={i} className="shap-factor-row">
                    <div className="shap-factor-meta">
                      <span className="shap-factor-name">{title}</span>
                      <div style={{ textAlign: lang === 'ar' ? 'left' : 'right', display: 'flex', flexDirection: 'column', alignItems: lang === 'ar' ? 'flex-start' : 'flex-end', gap: '2px' }}>
                        <span style={{ color: '#ef4444', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>
                          {f.impact.toFixed(3)}
                        </span>
                        {displayVal && (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1px 6px', borderRadius: '4px', color: '#fca5a5', fontFamily: 'var(--font-mono)' }}>
                            {displayVal}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shap-factor-desc">
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.4 }}>
                        {description}
                      </div>
                    </div>

                    <div className="shap-bar-track">
                      <div className="shap-bar-fill fill-doubt" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
