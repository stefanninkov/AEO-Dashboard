import { BarChart3 } from 'lucide-react'
import EmptyState from '../../components/EmptyState'

export default function PortalMetrics({ project }) {
  const history = project.metricsHistory || []

  if (history.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No Metrics History"
        description="Score history will appear here as analyses are run over time."
      />
    )
  }

  const last10 = history.slice(-10)

  return (
    <div className="portal-section">
      {/* Score trend chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Score Trend
        </h3>
        <div style={{ width: '100%', height: '3.5rem' }}>
          <svg viewBox="0 0 280 50" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="metricsGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const scores = last10.map(h => h.overallScore ?? 0)
              const max = Math.max(...scores, 100)
              const min = Math.min(...scores, 0)
              const range = max - min || 1
              const pts = scores.map((s, i) => {
                const x = (i / Math.max(scores.length - 1, 1)) * 280
                const y = 50 - ((s - min) / range) * 50
                return `${x},${y}`
              })
              return (
                <>
                  <polygon points={`0,50 ${pts.join(' ')} 280,50`} fill="url(#metricsGrad)" />
                  <polyline points={pts.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )
            })()}
          </svg>
        </div>
      </div>

      {/* History table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {last10.reverse().map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-md, 0.375rem)',
            background: i % 2 === 0 ? 'var(--hover-bg)' : 'transparent',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {entry.date ? new Date(entry.date).toLocaleDateString() : `Run ${last10.length - i}`}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {entry.overallScore ?? '—'}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
