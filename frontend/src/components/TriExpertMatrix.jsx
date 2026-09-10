import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function TriExpertMatrix({
  experts,
  selectedModel,
  onSelectExpert
}) {
  const { lang, t, helpers } = useLanguage();

  if (!experts) return null;

  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '0.6rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{t('triExpertHeader')}</span>
      </div>

      <div className="experts-grid">
        {Object.entries(experts).map(([name, data]) => {
          const isApproved = data.Verdict?.includes('APPROVED');
          const rawProb = data["Breakout_Probability_%"];
          const probNum = typeof rawProb === 'number' ? rawProb : parseFloat(rawProb || 0);
          const probFormatted = !isNaN(probNum) ? probNum.toFixed(1) : '0.0';

          const isSelected =
            (selectedModel === 'Conservative' && name.includes('Conservative')) ||
            (selectedModel === 'Balanced' && name.includes('Balanced')) ||
            (selectedModel === 'Aggressive' && name.includes('Aggressive'));

          let displayName = name.split(' ')[0];
          if (lang === 'ar') {
            displayName = name.includes('Conservative')
              ? t('expertConservativeName')
              : name.includes('Balanced')
              ? t('expertBalancedName')
              : t('expertAggressiveName');
          }

          return (
            <div
              key={name}
              className="expert-card"
              style={{
                borderColor: isSelected ? 'var(--color-accent)' : undefined,
                background: isSelected ? 'rgba(56, 189, 248, 0.06)' : undefined,
                cursor: 'pointer'
              }}
              onClick={() => onSelectExpert && onSelectExpert(name)}
            >
              <div className="expert-title">
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{displayName}</span>
                <span
                  className={`expert-verdict-pill ${isApproved ? 'verdict-approved' : 'verdict-rejected'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {isApproved ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  <span>{isApproved ? t('verdictApproved') : t('verdictRejected')}</span>
                </span>
              </div>

              {/* Probability Meter */}
              <div className="prob-meter-container">
                <div className="prob-numbers">
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{t('breakoutProbability')}</span>
                  <span style={{ color: isApproved ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-mono)' }}>
                    {probFormatted}%
                  </span>
                </div>
                <div className="prob-track">
                  <div
                    className="prob-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, probNum))}%`,
                      background: isApproved
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)'
                    }}
                  />
                </div>
              </div>

              {/* Profile Description */}
              <div style={{ fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.4, marginTop: '0.4rem' }}>
                {helpers.translateExpertProfile(data.Profile)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
