import { memo } from 'react'

/** Monitoring (no alerts) — Shield with green checkmark */
function ShieldIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer glow */}
      <path d="M60 15 L95 30 L95 60 Q95 90 60 108 Q25 90 25 60 L25 30Z" fill="var(--color-success)" opacity="0.06" />

      {/* Shield body */}
      <path d="M60 20 L90 33 L90 58 Q90 85 60 102 Q30 85 30 58 L30 33Z" fill="var(--bg-card)" stroke="var(--color-success)" strokeWidth="2" />

      {/* Inner shield */}
      <path d="M60 30 L82 40 L82 56 Q82 78 60 92 Q38 78 38 56 L38 40Z" fill="var(--color-success)" opacity="0.08" />

      {/* Checkmark */}
      <path d="M47 58 L55 68 L73 46" stroke="var(--color-success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Pulse rings */}
      <circle cx="60" cy="60" r="38" fill="none" stroke="var(--color-success)" strokeWidth="0.5" opacity="0.2" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="var(--color-success)" strokeWidth="0.5" opacity="0.1" />

      {/* Small sparkles */}
      <circle cx="20" cy="20" r="1.5" fill="var(--color-success)" opacity="0.4" />
      <circle cx="100" cy="25" r="1" fill="var(--color-success)" opacity="0.3" />
      <circle cx="15" cy="75" r="1" fill="var(--color-success)" opacity="0.3" />
      <circle cx="105" cy="80" r="1.5" fill="var(--color-success)" opacity="0.4" />
    </svg>
  )
}

export default memo(ShieldIllustration)
