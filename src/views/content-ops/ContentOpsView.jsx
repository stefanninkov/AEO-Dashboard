import { useState, useRef } from 'react'
import { CalendarDays, FileText, Clock, Layout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CalendarView from './CalendarView'
import BriefView from './BriefView'
import ContentHistoryTab from './ContentHistoryTab'
import TemplatesBrowser from '../../components/TemplatesBrowser'
import { useScrollActiveTab } from '../../hooks/useScrollActiveTab'

export default function ContentOpsView({ activeProject, updateProject, user, phases, toggleCheckItem }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('calendar') // 'calendar' | 'briefs' | 'history'
  const [showTemplates, setShowTemplates] = useState(false)
  const tabsRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)

  const calendarCount = (activeProject?.contentCalendar || []).length
  const briefCount = (activeProject?.contentBriefs || []).length
  const historyCount = (activeProject?.contentHistory || []).length + (activeProject?.schemaHistory || []).length

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">{t('contentOps.title')}</h2>
          <p className="view-subtitle">{t('contentOps.subtitle')}</p>
        </div>
      </div>

      {/* Tab row */}
      <div ref={tabsRef} className="scrollable-tabs tab-bar-segmented" role="tablist" style={{ width: 'fit-content' }}>
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
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'history'}
          data-active={activeTab === 'history' || undefined}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={14} />
          {t('contentOps.tabHistory')}
          {historyCount > 0 && (
            <span className="tab-badge">{historyCount}</span>
          )}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={false}
          onClick={() => setShowTemplates(true)}
        >
          <Layout size={14} />
          {t('contentOps.tabTemplates', 'Templates')}
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

      {activeTab === 'history' && (
        <ContentHistoryTab
          activeProject={activeProject}
          updateProject={updateProject}
        />
      )}

      <TemplatesBrowser
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={(tpl) => {
          setShowTemplates(false)
          // Switch to briefs tab and pre-populate with template content
          if (tpl?.fields) {
            setActiveTab('briefs')
          }
        }}
        category="content"
      />
    </div>
  )
}
