// src/components/DataConfidenceLabel.jsx

/**
 * Shows a small label indicating whether data is measured or estimated.
 * Use on every stat card / metric that comes from AI estimation.
 */
export function DataConfidenceLabel({ type = 'estimated' }) {
  const labels = {
    measured: { text: 'Measured', color: 'var(--color-success)', icon: '\u2713' },
    estimated: { text: 'AI Estimated', color: 'var(--color-warning)', icon: '~' },
    mixed: { text: 'Partial Data', color: 'var(--color-info, var(--accent))', icon: '\u25D0' },
  }
  const config = labels[type] || labels.estimated

  return (
    <span style={{
      fontSize: 'var(--text-2xs, 0.625rem)',
      color: config.color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      opacity: 0.8,
    }}
    title={type === 'estimated'
      ? 'This value is estimated by AI analysis and may vary between runs'
      : type === 'measured'
      ? 'This value is measured from actual page data'
      : 'This combines measured and estimated data'}
    >
      {config.icon} {config.text}
    </span>
  )
}
