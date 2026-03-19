import { Users } from 'lucide-react'
import EmptyState from '../../components/EmptyState'

export default function PortalCompetitors({ project }) {
  const competitors = project.competitors || []

  if (competitors.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Competitor Data"
        description="Competitor analysis data will appear here once configured."
      />
    )
  }

  return (
    <div className="portal-section">
      <div className="portal-competitors-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {competitors.map((comp, i) => (
          <div key={i} className="card-padded" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{comp.name || comp.url}</div>
              {comp.url && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{comp.url}</div>}
            </div>
            {comp.score != null && (
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)' }}>
                {comp.score}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
