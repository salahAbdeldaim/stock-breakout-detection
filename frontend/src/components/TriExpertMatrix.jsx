import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function TriExpertMatrix({
  experts,
  selectedModel,
  onSelectExpert
}) {
  if (!experts) return null;

  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
        Tri-Expert Model Committee Inspection
      </div>

      <div className="experts-grid">
        {Object.entries(experts).map(([name, data]) => {
          const isApproved = data.Verdict.includes('APPROVED');
          const prob = data["Breakout_Probability_%"];
          const isSelected =
            (selectedModel === 'Conservative' && name.includes('Conservative')) ||
            (selectedModel === 'Balanced' && name.includes('Balanced')) ||
            (selectedModel === 'Aggressive' && name.includes('Aggressive'));

          return (
            <div
              key={name}
              className="expert-card"
              style={{
                borderColor: isSelected ? 'var(--color-accent)' : undefined,
                background: isSelected ? 'rgba(56, 189, 248, 0.06)' : undefined
              }}
              onClick={() => onSelectExpert && onSelectExpert(name)}
            >
              <div className="expert-title">
                <span>{name.split(' ')[0]}</span>
                <span className={`expert-verdict-pill ${isApproved ? 'verdict-approved' : 'verdict-rejected'}`}>
                  {isApproved ? 'APPROVED' : 'REJECTED'}
                </span>
              </div>

              {/* Probability Meter */}
              <div className="prob-meter-container">
                <div className="prob-numbers">
                  <span style={{ color: '#94a3b8' }}>Breakout Prob</span>
                  <span style={{ color: isApproved ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {prob}%
                  </span>
                </div>
                <div className="prob-track">
                  <div
                    className="prob-fill"
                    style={{
                      width: `${prob}%`,
                      background: isApproved
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)'
                    }}
                  />
                </div>
              </div>

              {/* Profile Description */}
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.35 }}>
                {data.Profile}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
