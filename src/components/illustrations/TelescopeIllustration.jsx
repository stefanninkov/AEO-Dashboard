import { memo } from 'react'

/** Competitors (none) — Telescope scanning horizon */
function TelescopeIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Horizon line */}
      <line x1="10" y1="95" x2="110" y2="95" stroke="var(--border-subtle)" strokeWidth="1" />

      {/* Tripod */}
      <line x1="60" y1="70" x2="40" y2="95" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="70" x2="80" y2="95" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="70" x2="60" y2="95" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Telescope tube */}
      <rect x="35" y="30" width="50" height="14" rx="7" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" transform="rotate(-25 60 37)" />

      {/* Lens */}
      <circle cx="82" cy="26" r="10" fill="var(--accent)" opacity="0.12" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="82" cy="26" r="5" fill="var(--accent)" opacity="0.2" />

      {/* Eyepiece */}
      <rect x="30" y="44" width="10" height="6" rx="3" fill="var(--hover-bg)" stroke="var(--accent)" strokeWidth="1" transform="rotate(-25 35 47)" />

      {/* Mount joint */}
      <circle cx="60" cy="70" r="4" fill="var(--hover-bg)" stroke="var(--accent)" strokeWidth="1.5" />

      {/* Stars being observed */}
      <circle cx="95" cy="15" r="2" fill="var(--accent)" opacity="0.6" />
      <circle cx="102" cy="22" r="1.5" fill="var(--accent)" opacity="0.4" />
      <circle cx="88" cy="10" r="1" fill="var(--accent)" opacity="0.5" />

      {/* Scan line effect */}
      <line x1="82" y1="26" x2="100" y2="15" stroke="var(--accent)" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
    </svg>
  )
}

export default memo(TelescopeIllustration)
