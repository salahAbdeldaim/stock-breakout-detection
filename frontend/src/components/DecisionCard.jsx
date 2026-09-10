import React from 'react';
import { ShieldCheck, TrendingUp, Compass, ShieldAlert, XCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function DecisionCard({ auditResult }) {
  const { lang, t, helpers } = useLanguage();

  if (!auditResult) {
    return (
      <div className="decision-card">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          {t('decisionPrompt')}
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              {t('tacticalVerdictTitle')}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
              {t('tacticalVerdictSubtitle')}
            </span>
          </div>
        </div>

        {/* Tier / State Badge */}
        {!isCandidate ? (
          <span className="decision-tier-badge badge-consolidation">
            <Compass size={14} />
            {t('badgeConsolidation')}
          </span>
        ) : isTier1 ? (
          <span className="decision-tier-badge badge-tier-1">
            <ShieldCheck size={14} />
            {t('badgeTier1')}
          </span>
        ) : isTier2 ? (
          <span className="decision-tier-badge badge-tier-2">
            <TrendingUp size={14} />
            {t('badgeTier2')}
          </span>
        ) : (
          <span className="decision-tier-badge badge-tier-3">
            <ShieldAlert size={14} />
            {t('badgeTier3')}
          </span>
        )}
      </div>

      {/* When Breakout Candidate: Dynamic Tiered Position Sizing */}
      {isCandidate && consensus && (
        <>
          <div className="allocation-box">
            <div className="alloc-item">
              <span className="alloc-label">{t('allocationLabel')}</span>
              <span
                className="alloc-val"
                style={{
                  color: isTier1 ? '#10b981' : isTier2 ? '#f59e0b' : '#ef4444'
                }}
              >
                {helpers.translateAllocation(consensus.Recommended_Allocation)}
              </span>
            </div>

            <div className="alloc-item">
              <span className="alloc-label">{t('consensusLabel')}</span>
              <span className="alloc-val" style={{ color: '#38bdf8' }}>
                {helpers.translateConsensusRate(consensus.Approval_Rate)}
              </span>
            </div>
          </div>

          <div className="action-guidance">
            <strong style={{ color: '#f8fafc' }}>{t('executionGuidanceLabel')} </strong>
            <span>{helpers.translateActionGuidance(consensus.Action_Guidance)}</span>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(0,0,0,0.25)',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              borderInlineStart: `3px solid ${isTier1 ? '#10b981' : isTier2 ? '#f59e0b' : '#ef4444'}`
            }}
          >
            <strong style={{ color: '#f8fafc' }}>{t('riskManagementLabel')} </strong>
            <span>{helpers.translateRiskManagement(consensus.Risk_Management)}</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
            <em>{helpers.translateRationale(consensus.Rationale)}</em>
          </div>
        </>
      )}

      {/* When NOT Breakout Candidate: Screener Explanations */}
      {!isCandidate && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.4 }}>
            {lang === 'ar' ? t('statusMessageConsolidation') : auditResult.Status_Message}
          </div>

          {auditResult.Screening_Failures && auditResult.Screening_Failures.length > 0 && (
            <div className="screening-failures-list">
              <div style={{ fontSize: '0.72rem', color: '#ef4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {t('screenerFailuresTitle')}
              </div>
              {auditResult.Screening_Failures.map((reason, i) => (
                <div key={i} className="screening-failure-item">
                  <XCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{helpers.translateScreenerReason(reason)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
