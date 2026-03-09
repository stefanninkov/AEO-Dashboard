import { memo } from 'react'

/** Content Ops (empty) — Calendar with colorful pins */
function CalendarIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar body */}
      <rect x="18" y="28" width="84" height="76" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1.5" />

      {/* Header */}
      <rect x="18" y="28" width="84" height="20" rx="6" fill="var(--accent)" opacity="0.12" />
      <rect x="18" y="42" width="84" height="6" fill="var(--accent)" opacity="0.12" />

      {/* Calendar rings */}
      <rect x="38" y="22" width="4" height="14" rx="2" fill="var(--accent)" opacity="0.6" />
      <rect x="58" y="22" width="4" height="14" rx="2" fill="var(--accent)" opacity="0.6" />
      <rect x="78" y="22" width="4" height="14" rx="2" fill="var(--accent)" opacity="0.6" />

      {/* Day headers */}
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
        <text key={i} x={28 + i * 11} y="40" fontSize="5" fontWeight="600" fill="var(--accent)" opacity="0.7" textAnchor="middle">
          {d}
        </text>
      ))}

      {/* Grid of days */}
      {[0, 1, 2, 3, 4].map(row =>
        [0, 1, 2, 3, 4, 5, 6].map(col => {
          const dayNum = row * 7 + col + 1
          if (dayNum > 31) return null
          const x = 22 + col * 11
          const y = 50 + row * 11
          return (
            <text key={`${row}-${col}`} x={x + 5} y={y + 7} fontSize="5" fill="var(--text-disabled)" textAnchor="middle">
              {dayNum}
            </text>
          )
        })
      )}

      {/* Colorful pins / event markers */}
      <circle cx="44" cy="54" r="3.5" fill="var(--accent)" opacity="0.7" />
      <circle cx="55" cy="65" r="3.5" fill="var(--color-phase-2)" opacity="0.7" />
      <circle cx="33" cy="76" r="3.5" fill="var(--color-phase-3)" opacity="0.7" />
      <circle cx="77" cy="54" r="3.5" fill="var(--color-phase-4)" opacity="0.7" />
      <circle cx="66" cy="87" r="3.5" fill="var(--color-success)" opacity="0.7" />

      {/* Pin dots */}
      <circle cx="44" cy="54" r="1.5" fill="white" opacity="0.6" />
      <circle cx="55" cy="65" r="1.5" fill="white" opacity="0.6" />
      <circle cx="33" cy="76" r="1.5" fill="white" opacity="0.6" />
      <circle cx="77" cy="54" r="1.5" fill="white" opacity="0.6" />
      <circle cx="66" cy="87" r="1.5" fill="white" opacity="0.6" />
    </svg>
  )
}

export default memo(CalendarIllustration)
