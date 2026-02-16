import { ArrowRight, Lightbulb } from 'lucide-react'

export default function RecommendationsPanel({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <Lightbulb size={16} style={{ color: 'var(--color-phase-5)' }} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Recommended Next Steps
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommendations.map(rec => (
          <div
            key={rec.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
              background: 'var(--hover-bg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{rec.text}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{rec.detail}</p>
            </div>
            <button
              onClick={rec.action}
              style={{
                padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: 'none',
                background: 'rgba(255,107,53,0.1)', color: 'var(--color-phase-1)',
                fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                transition: 'all 150ms',
              }}
            >
              {rec.actionLabel}
              <ArrowRight size={11} style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
