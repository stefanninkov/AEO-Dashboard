import { memo } from 'react'

/** Dashboard (no project) — Rocket launching into stars */
function RocketIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stars */}
      <circle cx="20" cy="15" r="1.5" fill="var(--text-disabled)" opacity="0.6" />
      <circle cx="95" cy="25" r="2" fill="var(--text-disabled)" opacity="0.4" />
      <circle cx="15" cy="55" r="1" fill="var(--text-disabled)" opacity="0.5" />
      <circle cx="105" cy="60" r="1.5" fill="var(--text-disabled)" opacity="0.3" />
      <circle cx="35" cy="10" r="1" fill="var(--text-disabled)" opacity="0.7" />
      <circle cx="80" cy="12" r="1.5" fill="var(--text-disabled)" opacity="0.5" />

      {/* Exhaust trail */}
      <path d="M52 95 L48 115 L60 105 L72 115 L68 95" fill="var(--color-warning)" opacity="0.6" />
      <path d="M54 90 L50 108 L60 100 L70 108 L66 90" fill="var(--color-warning)" opacity="0.8" />

      {/* Rocket body */}
      <path d="M60 20 C60 20 45 45 45 70 L75 70 C75 45 60 20 60 20Z" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2" />

      {/* Rocket window */}
      <circle cx="60" cy="48" r="7" fill="var(--accent)" opacity="0.2" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="60" cy="48" r="3" fill="var(--accent)" opacity="0.4" />

      {/* Fins */}
      <path d="M45 62 L32 80 L45 75Z" fill="var(--accent)" opacity="0.7" />
      <path d="M75 62 L88 80 L75 75Z" fill="var(--accent)" opacity="0.7" />

      {/* Nose cone accent */}
      <path d="M60 20 C60 20 53 35 51 42 L69 42 C67 35 60 20 60 20Z" fill="var(--accent)" opacity="0.15" />

      {/* Bottom */}
      <rect x="48" y="70" width="24" height="5" rx="2" fill="var(--accent)" opacity="0.5" />
    </svg>
  )
}

export default memo(RocketIllustration)
