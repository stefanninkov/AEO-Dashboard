/**
 * QuickWinCard — Prominent card highlighting the single highest-impact
 * next action the user should take.
 *
 * Visually distinct from RecommendationsPanel — uses gradient accent border,
 * larger typography, and impact/effort badges to convey urgency.
 */
import { useTranslation } from 'react-i18next'
import { Zap, ArrowRight, Clock, TrendingUp } from 'lucide-react'

export default function QuickWinCard({ quickWin }) {
  const { t } = useTranslation('app')

  if (!quickWin) return null

  return (
    <div
      className="card card-interactive fade-in-up"
      style={{
        padding: '1.25rem 1.5rem',
        borderLeft: '0.25rem solid var(--color-phase-1)',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--hover-bg) 100%)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        cursor: 'pointer',
      }}
      onClick={quickWin.action}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); quickWin.action() } }}
      role="button"
      tabIndex={0}
      aria-label={`${t('dashboard.quickWin.label')}: ${quickWin.text}`}
    >
      {/* Icon */}
      <div style={{
        width: '2.75rem', height: '2.75rem', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(37,99,235,0.12)', color: 'var(--accent)',
        flexShrink: 0,
      }}>
        <Zap size={18} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          marginBottom: '0.25rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--color-phase-1)',
          }}>
            {t('dashboard.quickWin.label')}
          </span>
          {quickWin.impact && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
              fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: quickWin.impact === 'high' ? 'var(--color-success)' : 'var(--text-tertiary)',
              padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
              background: quickWin.impact === 'high' ? 'rgba(16,185,129,0.1)' : 'var(--hover-bg)',
            }}>
              <TrendingUp size={8} />
              {t(`dashboard.quickWin.impact.${quickWin.impact}`)}
            </span>
          )}
          {quickWin.effort && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
              fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.04em', color: 'var(--text-tertiary)',
              padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
              background: 'var(--hover-bg)',
            }}>
              <Clock size={8} />
              {t(`dashboard.quickWin.effort.${quickWin.effort}`)}
            </span>
          )}
        </div>
        <p style={{
          fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
          marginBottom: '0.125rem',
        }}>
          {quickWin.text}
        </p>
        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.4,
        }}>
          {quickWin.detail}
        </p>
      </div>

      {/* CTA */}
      <button
        className="btn-primary btn-sm"
        onClick={(e) => { e.stopPropagation(); quickWin.action() }}
        style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        {quickWin.actionLabel}
        <ArrowRight size={12} style={{ marginLeft: '0.25rem' }} />
      </button>
    </div>
  )
}
