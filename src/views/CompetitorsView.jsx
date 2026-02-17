import { useState, useMemo } from 'react'
import { Users, Activity, PieChart } from 'lucide-react'
import CompetitorsOverviewTab from './competitors/CompetitorsOverviewTab'
import CompetitorMonitoringTab from './competitors/CompetitorMonitoringTab'
import CitationShareTab from './competitors/CitationShareTab'

export default function CompetitorsView({ activeProject, updateProject, user }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'monitoring' | 'citation'

  const undismissedAlertCount = useMemo(() => {
    return (activeProject?.competitorAlerts || []).filter(a => !a.dismissed).length
  }, [activeProject?.competitorAlerts])

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24 fade-in-up">
        <Users size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Project Selected</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Select a project to view competitor insights.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
          color: 'var(--text-primary)', margin: 0,
        }}>
          Competitor Intelligence
        </h1>
        <p style={{
          fontSize: '0.8125rem', color: 'var(--text-secondary)',
          margin: '0.25rem 0 0', lineHeight: 1.5,
        }}>
          Analyze competitors, track AEO scores over time, and monitor brand citations across AI engines.
        </p>
      </div>

      {/* Tab row */}
      <div style={{
        display: 'flex', gap: '0.375rem', marginBottom: '1.25rem',
        padding: '0.25rem',
        background: 'var(--hover-bg)',
        borderRadius: '0.625rem',
        width: 'fit-content',
      }}>
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          icon={<Users size={14} />}
          label="Overview"
        />
        <TabButton
          active={activeTab === 'monitoring'}
          onClick={() => setActiveTab('monitoring')}
          icon={<Activity size={14} />}
          label="Monitoring"
          badge={undismissedAlertCount > 0 ? undismissedAlertCount : null}
        />
        <TabButton
          active={activeTab === 'citation'}
          onClick={() => setActiveTab('citation')}
          icon={<PieChart size={14} />}
          label="Citation Share"
        />
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <CompetitorsOverviewTab
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
        />
      )}

      {activeTab === 'monitoring' && (
        <CompetitorMonitoringTab
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
        />
      )}

      {activeTab === 'citation' && (
        <CitationShareTab
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
        />
      )}
    </div>
  )
}

function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.4375rem 0.875rem', border: 'none', borderRadius: '0.5rem',
        cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
        fontWeight: 600, transition: 'background 150ms, color 150ms',
        background: active ? 'var(--color-phase-1)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
      }}
    >
      {icon}
      {label}
      {badge !== null && badge !== undefined && (
        <span style={{
          fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
          padding: '0.0625rem 0.375rem', borderRadius: '0.625rem', marginLeft: '0.125rem',
          background: active ? 'rgba(255,255,255,0.2)' : 'rgba(239, 68, 68, 0.15)',
          color: active ? '#fff' : 'var(--color-error)',
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}
