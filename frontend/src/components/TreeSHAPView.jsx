import React, { useState } from 'react';
import { Eye, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TreeSHAPView({ experts, activeExpertName }) {
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
          <span>EXPLAINABLE AI (TreeSHAP ATTRIBUTION)</span>
        </div>

        {/* Model Switcher for SHAP */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {expertKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedExpKey(key)}
              style={{
                background: selectedExpKey === key ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                border: `1px solid ${selectedExpKey === key ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                color: selectedExpKey === key ? '#f8fafc' : '#94a3b8',
                borderRadius: '6px',
                padding: '0.25rem 0.55rem',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {key.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Support Factors 🟢 */}
        <div>
          <div className="shap-section-title" style={{ color: '#10b981' }}>
            <TrendingUp size={13} />
            <span>Key Factors Supporting Breakout</span>
          </div>

          <div className="shap-factors-list">
            {supportFactors.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No strong positive drivers detected.</div>
            ) : (
              supportFactors.map((f, i) => {
                const widthPct = Math.min(100, (Math.abs(f.impact) / maxImpact) * 100);
                return (
                  <div key={i} className="shap-factor-row">
                    <div className="shap-factor-meta">
                      <span className="shap-factor-name">{f.feature}</span>
                      <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        +{f.impact.toFixed(3)}
                      </span>
                    </div>
                    <div className="shap-factor-desc">{f.description} (Value: {f.value})</div>
                    <div className="shap-bar-track">
                      <div className="shap-bar-fill fill-support" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Doubt Factors 🔴 */}
        <div>
          <div className="shap-section-title" style={{ color: '#ef4444' }}>
            <AlertTriangle size={13} />
            <span>Key Factors Causing Doubt (Trap Risks)</span>
          </div>

          <div className="shap-factors-list">
            {doubtFactors.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No strong negative doubt factors.</div>
            ) : (
              doubtFactors.map((f, i) => {
                const widthPct = Math.min(100, (Math.abs(f.impact) / maxImpact) * 100);
                return (
                  <div key={i} className="shap-factor-row">
                    <div className="shap-factor-meta">
                      <span className="shap-factor-name">{f.feature}</span>
                      <span style={{ color: '#ef4444', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {f.impact.toFixed(3)}
                      </span>
                    </div>
                    <div className="shap-factor-desc">{f.description} (Value: {f.value})</div>
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
