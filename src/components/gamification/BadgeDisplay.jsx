import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getEarnedBadges, BADGES } from '../../utils/gamification'

/**
 * BadgeDisplay — Shows earned and locked badges.
 *
 * Props:
 *   stats: gamification stats object
 *   compact: boolean (show only earned, no locked)
 */
export default function BadgeDisplay({ stats, compact = false }) {
  const { t } = useTranslation('app')

  const earned = useMemo(() => getEarnedBadges(stats || {}), [stats])
  const earnedIds = useMemo(() => new Set(earned.map(b => b.id)), [earned])

  if (compact) {
    if (!earned.length) return null
    return (
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {earned.map(badge => (
          <span
            key={badge.id}
            title={`${badge.name}: ${badge.description}`}
            style={{
              fontSize: '1.25rem',
              cursor: 'default',
              animation: 'fade-in-up 0.3s ease-out',
            }}
          >
            {badge.icon}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Earned badges */}
      {earned.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.04rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem',
          }}>
            {t('gamification.earnedBadges', 'Earned Badges')} ({earned.length})
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))', gap: '0.5rem' }}>
            {earned.map(badge => (
              <div key={badge.id} style={{
                padding: '0.625rem', borderRadius: '0.625rem',
                background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
                textAlign: 'center', animation: 'fade-in-up 0.3s ease-out',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{badge.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{badge.name}</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      <div>
        <h4 style={{
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.04rem', color: 'var(--text-disabled)', marginBottom: '0.5rem',
        }}>
          {t('gamification.lockedBadges', 'Locked')} ({BADGES.length - earned.length})
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))', gap: '0.5rem' }}>
          {BADGES.filter(b => !earnedIds.has(b.id)).map(badge => (
            <div key={badge.id} style={{
              padding: '0.625rem', borderRadius: '0.625rem',
              background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
              textAlign: 'center', opacity: 0.5,
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem', filter: 'grayscale(1)' }}>{badge.icon}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>{badge.name}</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>{badge.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
