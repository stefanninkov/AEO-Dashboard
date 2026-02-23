/**
 * Sparkline — Tiny SVG trend line (no external library).
 *
 * Usage:
 *   <Sparkline data={[65, 70, 72, 80, 85]} width={40} height={16} />
 *
 * Renders a minimal polyline with optional gradient fill underneath.
 */
import { useMemo } from 'react'

export default function Sparkline({
  data = [],
  width = 40,
  height = 16,
  stroke = 'var(--color-phase-1)',
  strokeWidth = 1.5,
  fill = true,
  className = '',
}) {
  const points = useMemo(() => {
    if (!data.length || data.length < 2) return null
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padY = 2 // leave breathing room top/bottom

    return data.map((val, i) => ({
      x: (i / (data.length - 1)) * width,
      y: padY + ((max - val) / range) * (height - padY * 2),
    }))
  }, [data, width, height])

  if (!points) return null

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ')
  const fillPoints = `0,${height} ${linePoints} ${width},${height}`
  const gradientId = `sparkline-grad-${Math.random().toString(36).slice(2, 6)}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={fillPoints}
            fill={`url(#${gradientId})`}
          />
        </>
      )}
      <polyline
        points={linePoints}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
