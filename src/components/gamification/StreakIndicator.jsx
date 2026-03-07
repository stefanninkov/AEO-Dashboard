import { Flame } from 'lucide-react'

/**
 * StreakIndicator — Shows current login streak with fire icon.
 *
 * Props:
 *   currentStreak: number
 *   longestStreak: number
 *   compact: boolean
 */
export default function StreakIndicator({ currentStreak = 0, longestStreak = 0, compact = false }) {
const streakColor = currentStreak >= 7
    ? 'var(--color-error)'
    : currentStreak >= 3
      ? 'var(--color-warning)'
      : 'var(--text-tertiary)'

  if (compact) {
    if (!currentStreak) return null
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
        background: `color-mix(in srgb, ${streakColor} 10%, transparent)`,
        fontSize: '0.6875rem', fontWeight: 600, color: streakColor,
      }}>
        <Flame size={11} />
        {currentStreak}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
      background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
    }}>
      <Flame size={20} style={{ color: streakColor }} />
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {currentStreak} {'day streak'}
        </div>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
          {'Best'}: {longestStreak} {'days'}
        </div>
      </div>
    </div>
  )
}
