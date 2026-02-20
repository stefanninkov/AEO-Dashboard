import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Lightbulb, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react'

const CATEGORY_COLORS = {
  getting_started: 'var(--color-phase-1)',
  checklist: 'var(--color-phase-4)',
  metrics: 'var(--color-phase-7)',
  content: 'var(--color-phase-5)',
  monitoring: 'var(--color-phase-6)',
  competitors: 'var(--color-phase-2)',
  analysis: 'var(--color-phase-3)',
  schema: 'var(--color-phase-4)',
}

function PriorityIcon({ priority }) {
  if (priority === 1) return <AlertTriangle size={13} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
  if (priority <= 2) return <TrendingUp size={13} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />
  return <CheckCircle2 size={13} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
}

export default function RecommendationsPanel({ recommendations, contextLine }) {
  const { t } = useTranslation('app')

  const CATEGORY_META = useMemo(() => ({
    getting_started: { label: t('dashboard.recommendations.setup'), color: CATEGORY_COLORS.getting_started },
    checklist: { label: t('dashboard.recommendations.checklist'), color: CATEGORY_COLORS.checklist },
    metrics: { label: t('dashboard.recommendations.metrics'), color: CATEGORY_COLORS.metrics },
    content: { label: t('dashboard.recommendations.content'), color: CATEGORY_COLORS.content },
    monitoring: { label: t('dashboard.recommendations.monitoring'), color: CATEGORY_COLORS.monitoring },
    competitors: { label: t('dashboard.recommendations.competitors'), color: CATEGORY_COLORS.competitors },
    analysis: { label: t('dashboard.recommendations.analysis'), color: CATEGORY_COLORS.analysis },
    schema: { label: t('dashboard.recommendations.schema'), color: CATEGORY_COLORS.schema },
  }), [t])

  if (!recommendations || recommendations.length === 0) return null

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: contextLine ? '0.25rem' : '0.875rem' }}>
        <Lightbulb size={16} style={{ color: 'var(--color-phase-5)' }} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
          {t('dashboard.recommendations.title')}
        </h3>
        <span style={{
          fontSize: '0.6875rem', color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-heading)', fontWeight: 500,
        }}>
          {t('dashboard.recommendations.suggestionCount', { count: recommendations.length })}
        </span>
      </div>
      {contextLine && (
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', paddingLeft: '1.5rem' }}>
          {t('dashboard.recommendations.tailoredFor', { context: contextLine })}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommendations.map(rec => {
          const cat = CATEGORY_META[rec.category] || {}
          return (
            <div
              key={rec.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
                background: 'var(--hover-bg)',
                border: '1px solid var(--border-subtle)',
                borderLeft: rec.category ? `3px solid ${cat.color || 'var(--border-subtle)'}` : undefined,
              }}
            >
              <PriorityIcon priority={rec.priority} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.125rem', flexWrap: 'wrap' }}>
                  {cat.label && (
                    <span style={{
                      fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: cat.color || 'var(--text-tertiary)',
                      padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
                      background: `${cat.color || '#888'}15`,
                    }}>
                      {cat.label}
                    </span>
                  )}
                  {rec.priority === 1 && (
                    <span style={{
                      fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: 'var(--color-error)',
                      padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
                      background: 'rgba(239,68,68,0.1)',
                    }}>
                      {t('dashboard.recommendations.highPriority')}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{rec.text}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{rec.detail}</p>
              </div>
              <button
                onClick={rec.action}
                style={{
                  padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: 'none',
                  background: 'rgba(255,107,53,0.1)', color: 'var(--color-phase-1)',
                  fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                  transition: 'all 150ms',
                }}
              >
                {rec.actionLabel}
                <ArrowRight size={11} style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
