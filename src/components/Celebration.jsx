/**
 * Celebration — Lightweight CSS confetti burst overlay.
 *
 * Usage:
 *   <Celebration active={isCelebrating} colors={['#FF6B35','#7B2FBE','#0EA5E9']} />
 *
 * Renders a fixed overlay of falling confetti particles for ~1.2s, then unmounts.
 * No external libraries — pure CSS animation.
 */
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

const PARTICLE_COUNT = 40
const DURATION_MS = 1400

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

const SHAPES = ['square', 'rect', 'circle']

function Particle({ color, index }) {
  const style = useMemo(() => {
    const shape = SHAPES[index % SHAPES.length]
    const left = randomBetween(5, 95)
    const delay = randomBetween(0, 0.4)
    const drift = randomBetween(-4, 4)
    const spin = randomBetween(0, 720)
    const scale = randomBetween(0.6, 1.2)
    const duration = randomBetween(0.8, 1.3)

    return {
      position: 'absolute',
      top: '-0.5rem',
      left: `${left}%`,
      width: shape === 'rect' ? '0.5rem' : '0.375rem',
      height: shape === 'circle' ? '0.375rem' : shape === 'rect' ? '0.25rem' : '0.375rem',
      borderRadius: shape === 'circle' ? '50%' : '0.0625rem',
      background: color,
      opacity: 0,
      transform: `scale(${scale})`,
      animation: `confetti-fall ${duration}s ${delay}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
      '--confetti-drift': `${drift}rem`,
      '--confetti-spin': `${spin}deg`,
    }
  }, [color, index])

  return <span style={style} aria-hidden="true" />
}

const DEFAULT_COLORS = [
  '#FF6B35', '#7B2FBE', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899',
]

export default function Celebration({ active, colors = DEFAULT_COLORS, onComplete }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) return
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, DURATION_MS)
    return () => clearTimeout(timer)
  }, [active, onComplete])

  if (!visible) return null

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => (
    <Particle key={i} index={i} color={colors[i % colors.length]} />
  ))

  return createPortal(
    <div
      className="celebration-overlay"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {particles}
    </div>,
    document.body,
  )
}
