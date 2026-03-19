import { FileText } from 'lucide-react'
import EmptyState from '../../components/EmptyState'

export default function PortalContent({ project }) {
  const briefs = project.contentBriefs || []
  const calendar = project.contentCalendar || []
  const items = [...briefs, ...calendar]

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Content Data"
        description="Content calendar and brief data will appear here when available."
      />
    )
  }

  return (
    <div className="portal-section">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.slice(0, 20).map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 0.875rem',
            borderRadius: 'var(--radius-md, 0.375rem)',
            border: '0.0625rem solid var(--border-subtle)',
          }}>
            <FileText size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title || item.name || 'Untitled'}
              </div>
              {item.status && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                  {item.status}
                </div>
              )}
            </div>
            {item.date && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                {new Date(item.date).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
