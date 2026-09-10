import React from 'react';
import { ShieldCheck, TrendingUp, Compass, ShieldAlert, XCircle, AlertCircle } from 'lucide-react';
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
      {/* Header Section */}
      <div className="decision-header">
        <div className="decision-title-group">
          <div className="decision-icon-badge">
            <Compass size={18} color="#38bdf8" />
          </div>
          <div className="decision-title-texts">
            <span className="decision-main-title">
              {t('tacticalVerdictTitle')}
            </span>
            <span className="decision-sub-title">
              {t('tacticalVerdictSubtitle')}
            </span>
          </div>
        </div>

        {/* Tier / State Badge */}
        {!isCandidate ? (
          <span className="decision-tier-badge badge-consolidation">
            <span className="badge-dot dot-cyan"></span>
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
        <div className="decision-content-candidate">
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

          <div className="action-guidance-strip">
            <strong style={{ color: '#f8fafc' }}>{t('executionGuidanceLabel')} </strong>
            <span>{helpers.translateActionGuidance(consensus.Action_Guidance)}</span>
          </div>

          <div className="risk-management-strip" style={{
            borderInlineStart: `3px solid ${isTier1 ? '#10b981' : isTier2 ? '#f59e0b' : '#ef4444'}`
          }}>
            <strong style={{ color: '#f8fafc' }}>{t('riskManagementLabel')} </strong>
            <span>{helpers.translateRiskManagement(consensus.Risk_Management)}</span>
          </div>

          <div className="rationale-strip">
            <em>{helpers.translateRationale(consensus.Rationale)}</em>
          </div>
        </div>
      )}

      {/* When NOT Breakout Candidate: Screener Explanation (Clean, No Nested Clunky Box) */}
      {!isCandidate && (
        <div className="decision-content-consolidation">
          {/* Main Status Text */}
          <div className="consolidation-lead-status">
            <AlertCircle size={15} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{lang === 'ar' ? t('statusMessageConsolidation') : auditResult.Status_Message}</span>
          </div>

          {/* Clean Checklist of Screener Reasons */}
          {auditResult.Screening_Failures && auditResult.Screening_Failures.length > 0 && (
            <div className="screener-checkpoints-section">
              <div className="screener-checkpoints-header">
                {t('screeningCheckpointsTitle')}
              </div>
              <div className="screener-checkpoints-list">
                {auditResult.Screening_Failures.map((reason, i) => (
                  <div key={i} className="screener-checkpoint-row">
                    <XCircle size={14} color="#f87171" className="checkpoint-icon" />
                    <span className="checkpoint-text">{helpers.translateScreenerReason(reason)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
