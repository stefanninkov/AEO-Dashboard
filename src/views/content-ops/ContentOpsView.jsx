import { useState, useRef } from 'react'
import { CalendarDays, FileText, Clock, Layout } from 'lucide-react'
import CalendarView from './CalendarView'
import BriefView from './BriefView'
import ContentHistoryTab from './ContentHistoryTab'
import TemplatesBrowser from '../../components/TemplatesBrowser'
import { useScrollActiveTab } from '../../hooks/useScrollActiveTab'

export default function ContentOpsView({ activeProject, updateProject, user, phases, toggleCheckItem }) {
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
          <h2 className="view-title">{'Content Operations'}</h2>
          <p className="view-subtitle">{'Schedule content work tied to your AEO checklist and generate AI-powered content briefs.'}</p>
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
          {'Calendar'}
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
          {'Briefs'}
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
          {'History'}
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
          {'Templates'}
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
