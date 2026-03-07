import { useMemo } from 'react'
import { getLevel, getNextLevel, getLevelProgress } from '../../utils/gamification'

/**
 * LevelProgress — Shows current level, XP bar, and next level.
 *
 * Props:
 *   points: number
 *   compact: boolean (minimal display)
 */
export default function LevelProgress({ points = 0, compact = false }) {
const level = useMemo(() => getLevel(points), [points])
  const nextLevel = useMemo(() => getNextLevel(points), [points])
  const progress = useMemo(() => getLevelProgress(points), [points])

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '1.5rem', height: '1.5rem', borderRadius: '50%',
          background: level.color, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700,
          color: '#fff', fontFamily: 'var(--font-heading)',
        }}>
          {level.level}
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {level.name}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
          {points} XP
        </span>
      </div>
    )
  }

  return (
    <div style={{
      padding: '0.875rem 1rem', borderRadius: '0.75rem',
      background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '50%',
            background: level.color, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: '#fff', fontFamily: 'var(--font-heading)',
          }}>
            {level.level}
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {'Level'} {level.level}: {level.name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
              {points} {'total XP'}
            </div>
          </div>
        </div>
        {nextLevel && (
          <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textAlign: 'right' }}>
            {'Next'}: {nextLevel.name}
            <br />{nextLevel.minPoints - points} XP {'to go'}
          </div>
        )}
      </div>
      {/* XP Bar */}
      <div style={{
        height: '0.375rem', borderRadius: '0.25rem',
        background: 'var(--border-subtle)', overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: level.color, borderRadius: '0.25rem',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}
