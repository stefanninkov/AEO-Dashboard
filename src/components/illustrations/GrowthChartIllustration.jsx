import { memo } from 'react'

/** Metrics (no history) — Growing bar chart with seedling */
function GrowthChartIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chart background */}
      <rect x="20" y="20" width="80" height="70" rx="4" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />

      {/* Grid lines */}
      {[35, 50, 65, 80].map(y => (
        <line key={y} x1="25" y1={y} x2="95" y2={y} stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="2 3" />
      ))}

      {/* Growing bars */}
      <rect x="30" y="70" width="10" height="15" rx="2" fill="var(--accent)" opacity="0.2" />
      <rect x="44" y="60" width="10" height="25" rx="2" fill="var(--accent)" opacity="0.35" />
      <rect x="58" y="48" width="10" height="37" rx="2" fill="var(--accent)" opacity="0.5" />
      <rect x="72" y="35" width="10" height="50" rx="2" fill="var(--accent)" opacity="0.7" />
      <rect x="86" y="25" width="10" height="60" rx="2" fill="var(--accent)" opacity="0.9" />

      {/* Growth line */}
      <polyline points="35,67 49,57 63,45 77,32 91,22" fill="none" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="91" cy="22" r="2.5" fill="var(--color-success)" />

      {/* Seedling */}
      <line x1="60" y1="108" x2="60" y2="96" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 100 Q55 95 48 96" stroke="var(--color-success)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M60 97 Q65 92 72 93" stroke="var(--color-success)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="48" cy="96" rx="5" ry="3" fill="var(--color-success)" opacity="0.3" />
      <ellipse cx="72" cy="93" rx="5" ry="3" fill="var(--color-success)" opacity="0.3" />

      {/* Soil line */}
      <path d="M40 110 Q50 107 60 110 Q70 113 80 110" stroke="var(--text-disabled)" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

export default memo(GrowthChartIllustration)
