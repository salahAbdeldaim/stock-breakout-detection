import React from 'react';
import { ShieldCheck, AlertOctagon, TrendingUp, Compass, ShieldAlert, XCircle } from 'lucide-react';

export default function DecisionCard({ auditResult }) {
  if (!auditResult) {
    return (
      <div className="decision-card">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Select an equity and date, then click "Run Quantitative Audit" to inspect.
        </div>
      </div>
    );
  }

  const isCandidate = auditResult.Status === 'BREAKOUT_CANDIDATE_DETECTED';
  const consensus = auditResult.Consensus;
  const isTier1 = consensus?.Execution_Tier?.includes('TIER 1');
  const isTier2 = consensus?.Execution_Tier?.includes('TIER 2');
  const isTier3 = consensus?.Execution_Tier?.includes('TIER 3');

  let cardClass = 'decision-card';
  if (!isCandidate) cardClass += ' consolidation';
  else if (isTier1) cardClass += ' tier-1';
  else if (isTier2) cardClass += ' tier-2';
  else if (isTier3) cardClass += ' tier-3';

  return (
    <div className={cardClass}>
      <div className="decision-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
            TACTICAL STRATEGY VERDICT
          </span>
        </div>

        {/* Tier / State Badge */}
        {!isCandidate ? (
          <span className="decision-tier-badge badge-consolidation">
            <Compass size={14} />
            STABLE CONSOLIDATION
          </span>
        ) : isTier1 ? (
          <span className="decision-tier-badge badge-tier-1">
            <ShieldCheck size={14} />
            TIER 1: FULL ALLOCATION
          </span>
        ) : isTier2 ? (
          <span className="decision-tier-badge badge-tier-2">
            <TrendingUp size={14} />
            TIER 2: SPECULATIVE HALF-SIZE
          </span>
        ) : (
          <span className="decision-tier-badge badge-tier-3">
            <ShieldAlert size={14} />
            TIER 3: CAPITAL PRESERVATION
          </span>
        )}
      </div>

      {/* When Breakout Candidate: Dynamic Tiered Position Sizing */}
      {isCandidate && consensus && (
        <>
          <div className="allocation-box">
            <div className="alloc-item">
              <span className="alloc-label">RECOMMENDED ALLOCATION</span>
              <span
                className="alloc-val"
                style={{
                  color: isTier1 ? '#10b981' : isTier2 ? '#f59e0b' : '#ef4444'
                }}
              >
                {consensus.Recommended_Allocation}
              </span>
            </div>

            <div className="alloc-item">
              <span className="alloc-label">COMMITTEE CONSENSUS</span>
              <span className="alloc-val" style={{ color: '#38bdf8' }}>
                {consensus.Approval_Rate}
              </span>
            </div>
          </div>

          <div className="action-guidance">
            <strong style={{ color: '#f8fafc' }}>Execution Guidance: </strong>
            <span>{consensus.Action_Guidance}</span>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(0,0,0,0.2)',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              borderLeft: `3px solid ${isTier1 ? '#10b981' : isTier2 ? '#f59e0b' : '#ef4444'}`
            }}
          >
            <strong>Risk Management: </strong> {consensus.Risk_Management}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
            <em>{consensus.Rationale}</em>
          </div>
        </>
      )}

      {/* When NOT Breakout Candidate: Screener Explanations */}
      {!isCandidate && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            {auditResult.Status_Message}
          </div>

          {auditResult.Screening_Failures && auditResult.Screening_Failures.length > 0 && (
            <div className="screening-failures-list">
              <div style={{ fontSize: '0.72rem', color: '#ef4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                STAGE 1 SCREENER REJECTION REASONS:
              </div>
              {auditResult.Screening_Failures.map((reason, i) => (
                <div key={i} className="screening-failure-item">
                  <XCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
