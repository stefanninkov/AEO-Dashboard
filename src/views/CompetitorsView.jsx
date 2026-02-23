import { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Activity, PieChart } from 'lucide-react'
import CompetitorsOverviewTab from './competitors/CompetitorsOverviewTab'
import CompetitorMonitoringTab from './competitors/CompetitorMonitoringTab'
import CitationShareTab from './competitors/CitationShareTab'
import { useScrollActiveTab } from '../hooks/useScrollActiveTab'

export default function CompetitorsView({ activeProject, updateProject, user }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'monitoring' | 'citation'
  const tabsRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)

  const undismissedAlertCount = useMemo(() => {
    return (activeProject?.competitorAlerts || []).filter(a => !a.dismissed).length
  }, [activeProject?.competitorAlerts])

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24 fade-in-up">
        <Users size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
        <h3 className="view-title" style={{ marginBottom: 'var(--space-2)' }}>{t('competitors.noProjectSelected')}</h3>
        <p className="view-subtitle">{t('competitors.noProjectSelectedDesc')}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h2 className="view-title">{t('competitors.title')}</h2>
        <p className="view-subtitle">{t('competitors.subtitle')}</p>
      </div>

      {/* Tab row */}
      <div ref={tabsRef} className="scrollable-tabs tab-bar-segmented" role="tablist" style={{ marginBottom: 'var(--space-5)' }}>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'overview'}
          data-active={activeTab === 'overview' || undefined}
          onClick={() => setActiveTab('overview')}
        >
          <Users size={14} />
          {t('competitors.tabOverview')}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'monitoring'}
          data-active={activeTab === 'monitoring' || undefined}
          onClick={() => setActiveTab('monitoring')}
        >
          <Activity size={14} />
          {t('competitors.tabMonitoring')}
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
          {t('competitors.tabCitationShare')}
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
