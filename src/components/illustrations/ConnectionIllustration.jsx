import { memo } from 'react'

/** GSC/GA4 (not connected) — Chain link connecting two nodes */
function ConnectionIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left node */}
      <rect x="10" y="40" width="32" height="40" rx="6" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="26" cy="52" r="6" fill="var(--accent)" opacity="0.15" />
      <rect x="18" y="62" width="16" height="2" rx="1" fill="var(--border-subtle)" opacity="0.6" />
      <rect x="20" y="67" width="12" height="2" rx="1" fill="var(--border-subtle)" opacity="0.4" />

      {/* Right node */}
      <rect x="78" y="40" width="32" height="40" rx="6" fill="var(--bg-card)" stroke="var(--color-success)" strokeWidth="1.5" />
      <circle cx="94" cy="52" r="6" fill="var(--color-success)" opacity="0.15" />
      <rect x="86" y="62" width="16" height="2" rx="1" fill="var(--border-subtle)" opacity="0.6" />
      <rect x="88" y="67" width="12" height="2" rx="1" fill="var(--border-subtle)" opacity="0.4" />

      {/* Chain link - two interlocking ovals */}
      <rect x="44" y="52" width="16" height="10" rx="5" fill="none" stroke="var(--accent)" strokeWidth="2" />
      <rect x="56" y="52" width="16" height="10" rx="5" fill="none" stroke="var(--color-success)" strokeWidth="2" />

      {/* Connection dots at overlap */}
      <circle cx="58" cy="57" r="2" fill="var(--accent)" opacity="0.6" />

      {/* Dashed lines from nodes to chain */}
      <line x1="42" y1="57" x2="44" y2="57" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="72" y1="57" x2="78" y2="57" stroke="var(--color-success)" strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Small arrows indicating data flow */}
      <path d="M50 42 L54 38 L58 42" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M62 42 L66 38 L70 42" stroke="var(--color-success)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

      {/* Labels */}
      <text x="26" y="92" fontSize="6" fill="var(--text-disabled)" textAnchor="middle" fontWeight="500">Your Site</text>
      <text x="94" y="92" fontSize="6" fill="var(--text-disabled)" textAnchor="middle" fontWeight="500">Google</text>

      {/* Subtle background circles */}
      <circle cx="26" cy="60" r="22" fill="var(--accent)" opacity="0.03" />
      <circle cx="94" cy="60" r="22" fill="var(--color-success)" opacity="0.03" />
    </svg>
  )
}

export default memo(ConnectionIllustration)
