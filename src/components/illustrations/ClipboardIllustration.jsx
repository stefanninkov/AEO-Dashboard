import { memo } from 'react'

/** Checklist (empty) — Clipboard with sparkle checkmarks */
function ClipboardIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clipboard body */}
      <rect x="28" y="22" width="64" height="85" rx="6" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1.5" />

      {/* Clip */}
      <rect x="44" y="16" width="32" height="14" rx="4" fill="var(--hover-bg)" stroke="var(--accent)" strokeWidth="1.5" />
      <rect x="52" y="12" width="16" height="8" rx="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />

      {/* Checklist lines */}
      {[42, 56, 70, 84].map((y, i) => (
        <g key={i}>
          {i < 2 ? (
            <>
              <rect x="38" y={y} width="12" height="12" rx="3" fill="var(--accent)" opacity="0.15" stroke="var(--accent)" strokeWidth="1" />
              <path d={`M${41} ${y + 6} L${43} ${y + 9} L${48} ${y + 3}`} stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <rect x="38" y={y} width="12" height="12" rx="3" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
          )}
          <rect x="56" y={y + 2} width={i < 2 ? 28 : 24} height="3" rx="1.5" fill={i < 2 ? 'var(--accent)' : 'var(--border-subtle)'} opacity={i < 2 ? 0.3 : 0.5} />
          <rect x="56" y={y + 7} width={16 + i * 2} height="2" rx="1" fill="var(--border-subtle)" opacity="0.3" />
        </g>
      ))}

      {/* Sparkles */}
      <path d="M82 35 L84 31 L86 35 L90 37 L86 39 L84 43 L82 39 L78 37Z" fill="var(--accent)" opacity="0.5" />
      <path d="M22 50 L23 47 L24 50 L27 51 L24 52 L23 55 L22 52 L19 51Z" fill="var(--accent)" opacity="0.3" />
      <path d="M96 70 L97.5 67 L99 70 L102 71.5 L99 73 L97.5 76 L96 73 L93 71.5Z" fill="var(--accent)" opacity="0.4" />
    </svg>
  )
}

export default memo(ClipboardIllustration)
