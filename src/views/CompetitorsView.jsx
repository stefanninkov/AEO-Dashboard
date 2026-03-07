import { useState, useRef, useMemo } from 'react'
import { Users, Activity, PieChart, Dna, Target, BarChart3 } from 'lucide-react'
import CompetitorsOverviewTab from './competitors/CompetitorsOverviewTab'
import CompetitorMonitoringTab from './competitors/CompetitorMonitoringTab'
import CitationShareTab from './competitors/CitationShareTab'
import CitationDNATab from './competitors/CitationDNATab'
import ContentGapsTab from './competitors/ContentGapsTab'
import BenchmarkTab from './competitors/BenchmarkTab'
import { useScrollActiveTab } from '../hooks/useScrollActiveTab'

export default function CompetitorsView({ activeProject, updateProject, user }) {
const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'benchmark' | 'monitoring' | 'citation' | 'dna' | 'gaps'
  const tabsRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)

  const undismissedAlertCount = useMemo(() => {
    return (activeProject?.competitorAlerts || []).filter(a => !a.dismissed).length
  }, [activeProject?.competitorAlerts])

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24 fade-in-up">
        <Users size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
        <h3 className="view-title" style={{ marginBottom: 'var(--space-2)' }}>{'No Project Selected'}</h3>
        <p className="view-subtitle">{'Select a project to view competitor insights.'}</p>
      </div>
    )
  }

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">{'Competitor Analysis'}</h2>
          <p className="view-subtitle">{'Track and compare competitors\' AEO performance'}</p>
        </div>
      </div>

      {/* Tab row */}
      <div ref={tabsRef} className="scrollable-tabs tab-bar-segmented" role="tablist">
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'overview'}
          data-active={activeTab === 'overview' || undefined}
          onClick={() => setActiveTab('overview')}
        >
          <Users size={14} />
          {'Overview'}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'benchmark'}
          data-active={activeTab === 'benchmark' || undefined}
          onClick={() => setActiveTab('benchmark')}
        >
          <BarChart3 size={14} />
          {'Benchmark'}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'monitoring'}
          data-active={activeTab === 'monitoring' || undefined}
          onClick={() => setActiveTab('monitoring')}
        >
          <Activity size={14} />
          {'Monitoring'}
          {undismissedAlertCount > 0 && (
            <span className="tab-badge tab-badge-alert">{undismissedAlertCount}</span>
          )}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'citation'}
          data-active={activeTab === 'citation' || undefined}
          onClick={() => setActiveTab('citation')}
        >
          <PieChart size={14} />
          {'Citation Share'}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'dna'}
          data-active={activeTab === 'dna' || undefined}
          onClick={() => setActiveTab('dna')}
        >
          <Dna size={14} />
          {'Citation DNA'}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'gaps'}
          data-active={activeTab === 'gaps' || undefined}
          onClick={() => setActiveTab('gaps')}
        >
          <Target size={14} />
          {'Content Gaps'}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <CompetitorsOverviewTab
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
        />
      )}

      {activeTab === 'benchmark' && (
        <BenchmarkTab
          activeProject={activeProject}
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

      {activeTab === 'dna' && (
        <CitationDNATab activeProject={activeProject} />
      )}

      {activeTab === 'gaps' && (
        <ContentGapsTab activeProject={activeProject} updateProject={updateProject} />
      )}
    </div>
  )
}
