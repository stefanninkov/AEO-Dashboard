import { ArrowRight, AlertTriangle, TrendingUp, CheckCircle2, X } from 'lucide-react'

/**
 * RecommendationCard — Actionable recommendation card.
 *
 * Props:
 *   recommendation: { text, detail, priority, category, actionLabel, action, impact }
 *   onDismiss: () => void (optional)
 *   compact: boolean (default: false)
 */
export default function RecommendationCard({ recommendation: rec, onDismiss, compact = false }) {
  const PriorityIcon = rec.priority === 1
    ? AlertTriangle
    : rec.priority <= 2
      ? TrendingUp
      : CheckCircle2

  const priorityColor = rec.priority === 1
    ? 'var(--color-error)'
    : rec.priority <= 2
      ? 'var(--color-phase-1)'
      : 'var(--color-success)'

  const impactBadge = rec.impact && (
    <span style={{
      fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: rec.impact === 'high' ? 'var(--color-error)' : rec.impact === 'medium' ? 'var(--color-warning)' : 'var(--color-success)',
      padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
      background: rec.impact === 'high'
        ? 'rgba(239,68,68,0.1)'
        : rec.impact === 'medium'
          ? 'rgba(245,158,11,0.1)'
          : 'rgba(16,185,129,0.1)',
    }}>
      {rec.impact} impact
    </span>
  )

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
        background: 'var(--hover-bg)',
        fontSize: '0.8125rem',
      }}>
        <PriorityIcon size={12} style={{ color: priorityColor, flexShrink: 0 }} />
        <span style={{ flex: 1, color: 'var(--text-primary)' }}>{rec.text}</span>
        {rec.action && (
          <button
            onClick={rec.action}
            className="btn-ghost"
            style={{
              padding: '0.25rem 0.5rem', fontSize: '0.6875rem',
              color: 'var(--accent)', fontWeight: 600,
            }}
          >
            {rec.actionLabel || 'Go'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '0.875rem 1rem', borderRadius: '0.75rem',
      background: 'var(--hover-bg)',
      border: '0.0625rem solid var(--border-subtle)',
      borderLeft: `0.1875rem solid ${priorityColor}`,
      position: 'relative',
    }}>
      <PriorityIcon size={14} style={{ color: priorityColor, flexShrink: 0, marginTop: '0.125rem' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          {rec.source && (
            <span style={{
              fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', color: 'var(--text-tertiary)',
              padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
              background: 'var(--bg-hover)',
            }}>
              {rec.source}
            </span>
          )}
          {impactBadge}
        </div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          {rec.text}
        </p>
        {rec.detail && (
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
            {rec.detail}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {rec.action && (
          <button
            onClick={rec.action}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: 'none',
              background: 'rgba(37,99,235,0.1)', color: 'var(--accent)',
              fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
              transition: 'all 150ms',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            {rec.actionLabel || 'Go'}
            <ArrowRight size={11} />
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-disabled)', padding: '0.25rem',
            }}
            title="Dismiss"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
