import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search, Zap, Diamond, Trophy, Code2, PenTool,
  Flame, CalendarDays, Sparkles, Handshake, Link, Compass,
  Award,
} from 'lucide-react'
import { getEarnedBadges, BADGES } from '../../utils/gamification'

const ICON_MAP = {
  Search, Zap, Diamond, Trophy, Code2, PenTool,
  Flame, CalendarDays, Sparkles, Handshake, Link, Compass,
}

function BadgeIcon({ name, size = 20, style }) {
  const Icon = ICON_MAP[name] || Award
  return <Icon size={size} style={style} />
}

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
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
              background: 'var(--accent-muted)',
              cursor: 'default',
              animation: 'fade-in-up 0.3s ease-out',
            }}
          >
            <BadgeIcon name={badge.icon} size={14} style={{ color: 'var(--accent)' }} />
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
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem',
                  background: 'var(--accent-muted)', margin: '0 auto 0.375rem',
                }}>
                  <BadgeIcon name={badge.icon} size={20} style={{ color: 'var(--accent)' }} />
                </div>
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
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem',
                background: 'var(--border-subtle)', margin: '0 auto 0.375rem',
              }}>
                <BadgeIcon name={badge.icon} size={20} style={{ color: 'var(--text-disabled)' }} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>{badge.name}</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>{badge.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
