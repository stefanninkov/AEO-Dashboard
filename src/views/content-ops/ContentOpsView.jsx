import { useState, useRef } from 'react'
import { CalendarDays, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CalendarView from './CalendarView'
import BriefView from './BriefView'
import { useScrollActiveTab } from '../../hooks/useScrollActiveTab'

export default function ContentOpsView({ activeProject, updateProject, user, phases, toggleCheckItem }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('calendar') // 'calendar' | 'briefs'
  const tabsRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)

  const calendarCount = (activeProject?.contentCalendar || []).length
  const briefCount = (activeProject?.contentBriefs || []).length

  return (
    <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h2 className="view-title">{t('contentOps.title')}</h2>
        <p className="view-subtitle">{t('contentOps.subtitle')}</p>
      </div>

      {/* Tab row */}
      <div ref={tabsRef} className="scrollable-tabs tab-bar-segmented" role="tablist" style={{ marginBottom: 'var(--space-5)', width: 'fit-content' }}>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'calendar'}
          data-active={activeTab === 'calendar' || undefined}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarDays size={14} />
          {t('contentOps.tabCalendar')}
          {calendarCount > 0 && (
            <span className="tab-badge">{calendarCount}</span>
          )}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'briefs'}
          data-active={activeTab === 'briefs' || undefined}
          onClick={() => setActiveTab('briefs')}
        >
          <FileText size={14} />
          {t('contentOps.tabBriefs')}
          {briefCount > 0 && (
            <span className="tab-badge">{briefCount}</span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'calendar' && (
        <CalendarView
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
          phases={phases}
          toggleCheckItem={toggleCheckItem}
        />
      )}

      {activeTab === 'briefs' && (
        <BriefView
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
        />
      )}
    </div>
  )
}
