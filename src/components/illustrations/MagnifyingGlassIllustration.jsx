import { memo } from 'react'

/** Analyzer (no results) — Magnifying glass over webpage */
function MagnifyingGlassIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Webpage */}
      <rect x="20" y="25" width="60" height="75" rx="4" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      {/* Browser bar */}
      <rect x="20" y="25" width="60" height="12" rx="4" fill="var(--hover-bg)" />
      <circle cx="28" cy="31" r="2" fill="var(--color-error)" opacity="0.5" />
      <circle cx="35" cy="31" r="2" fill="var(--color-warning)" opacity="0.5" />
      <circle cx="42" cy="31" r="2" fill="var(--color-success)" opacity="0.5" />
      {/* Content lines */}
      <rect x="28" y="44" width="30" height="3" rx="1.5" fill="var(--border-subtle)" opacity="0.6" />
      <rect x="28" y="51" width="44" height="2" rx="1" fill="var(--border-subtle)" opacity="0.3" />
      <rect x="28" y="56" width="38" height="2" rx="1" fill="var(--border-subtle)" opacity="0.3" />
      <rect x="28" y="64" width="20" height="12" rx="2" fill="var(--accent)" opacity="0.08" />
      <rect x="52" y="64" width="20" height="12" rx="2" fill="var(--accent)" opacity="0.08" />
      <rect x="28" y="80" width="44" height="2" rx="1" fill="var(--border-subtle)" opacity="0.3" />
      <rect x="28" y="85" width="36" height="2" rx="1" fill="var(--border-subtle)" opacity="0.3" />

      {/* Magnifying glass */}
      <circle cx="80" cy="55" r="22" fill="var(--accent)" opacity="0.06" stroke="var(--accent)" strokeWidth="2.5" />
      <circle cx="80" cy="55" r="16" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
      {/* Handle */}
      <line x1="96" y1="71" x2="110" y2="85" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
      <line x1="96" y1="71" x2="110" y2="85" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

      {/* Gleam */}
      <path d="M72 42 Q75 38 78 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

export default memo(MagnifyingGlassIllustration)
