import { Search } from 'lucide-react'
import EmptyState from '../../components/EmptyState'

export default function PortalSeo({ project }) {
  const metrics = project.metricsHistory
  const latest = metrics?.length > 0 ? metrics[metrics.length - 1] : null

  if (!latest) {
    return (
      <EmptyState
        icon={Search}
        title="No SEO Data"
        description="SEO audit data will appear here after the first analysis run."
      />
    )
  }

  const categories = [
    { label: 'Content & Structure', key: 'contentStructure' },
    { label: 'Technical SEO', key: 'technicalSeo' },
    { label: 'Schema Coverage', key: 'schemaCoverage' },
    { label: 'AI Crawlability', key: 'aiCrawlability' },
  ]

  return (
    <div className="portal-section">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {latest.overallScore ?? '—'}
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Overall Score</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {categories.map(cat => {
          const score = latest[cat.key] ?? latest.categoryScores?.[cat.key]
          return (
            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', width: '10rem', flexShrink: 0 }}>{cat.label}</span>
              <div style={{ flex: 1, height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
                <div style={{
                  width: score != null ? `${score}%` : '0%',
                  height: '100%',
                  borderRadius: '0.1875rem',
                  background: 'var(--accent)',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', width: '2.5rem', textAlign: 'right' }}>
                {score ?? '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
