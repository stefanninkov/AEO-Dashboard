import { useState, useEffect, useRef } from 'react'
import { Star } from 'lucide-react'

/**
 * PointsCounter — Animated points display with increment animation.
 *
 * Props:
 *   points: number
 *   compact: boolean
 */
export default function PointsCounter({ points = 0, compact = false }) {
  const [display, setDisplay] = useState(points)
  const [animating, setAnimating] = useState(false)
  const prevRef = useRef(points)

  useEffect(() => {
    if (points !== prevRef.current) {
      setAnimating(true)
      const start = prevRef.current
      const diff = points - start
      const duration = 600
      const startTime = performance.now()
      const rafIdRef = { current: null }

      const animate = (time) => {
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        setDisplay(Math.round(start + diff * eased))
        if (progress < 1) rafIdRef.current = requestAnimationFrame(animate)
        else {
          setAnimating(false)
          prevRef.current = points
        }
      }
      rafIdRef.current = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(rafIdRef.current)
    }
  }, [points])

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        fontSize: '0.6875rem', fontWeight: 600,
        color: animating ? 'var(--accent)' : 'var(--text-secondary)',
        transition: 'color 0.3s',
      }}>
        <Star size={11} style={{ color: 'var(--color-warning)' }} />
        {display.toLocaleString()} XP
      </span>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
      background: animating
        ? 'color-mix(in srgb, var(--color-warning) 10%, transparent)'
        : 'var(--hover-bg)',
      border: '0.0625rem solid var(--border-subtle)',
      transition: 'background 0.3s',
    }}>
      <Star size={16} style={{ color: 'var(--color-warning)' }} />
      <div>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          {display.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>
          Total XP
        </div>
      </div>
    </div>
  )
}
