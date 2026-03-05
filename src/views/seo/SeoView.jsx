import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck, FileSearch, Wrench, KeyRound, PenLine,
} from 'lucide-react'
import { useScrollActiveTab } from '../../hooks/useScrollActiveTab'
import { useSeoAnalyzer } from './useSeoAnalyzer'
import SeoAuditTab from './SeoAuditTab'
import OnPageSeoTab from './OnPageSeoTab'
import TechnicalSeoTab from './TechnicalSeoTab'
import KeywordResearchTab from './KeywordResearchTab'
import ContentOptimizationTab from './ContentOptimizationTab'

const TABS = [
  { id: 'audit', icon: ClipboardCheck },
  { id: 'onpage', icon: FileSearch },
  { id: 'technical', icon: Wrench },
  { id: 'keywords', icon: KeyRound },
  { id: 'content', icon: PenLine },
]

export default function SeoView({ activeProject, updateProject, user }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('audit')
  const tabsRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)

  const analyzer = useSeoAnalyzer({ activeProject, updateProject, user })

  const tabLabels = {
    audit: t('seo.tabAudit'),
    onpage: t('seo.tabOnPage'),
    technical: t('seo.tabTechnical'),
    keywords: t('seo.tabKeywords'),
    content: t('seo.tabContent'),
  }

  return (
    <div className="view-wrapper">
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">{t('seo.title')}</h2>
          <p className="view-subtitle">{t('seo.subtitle')}</p>
        </div>
      </div>

      <div ref={tabsRef} className="scrollable-tabs tab-bar-segmented" role="tablist" style={{ width: 'fit-content' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className="tab-segmented"
              role="tab"
              aria-selected={activeTab === tab.id}
              data-active={activeTab === tab.id || undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              {tabLabels[tab.id]}
            </button>
          )
        })}
      </div>

      {activeTab === 'audit' && (
        <SeoAuditTab analyzer={analyzer} activeProject={activeProject} />
      )}
      {activeTab === 'onpage' && (
        <OnPageSeoTab analyzer={analyzer} />
      )}
      {activeTab === 'technical' && (
        <TechnicalSeoTab analyzer={analyzer} />
      )}
      {activeTab === 'keywords' && (
        <KeywordResearchTab
          analyzer={analyzer}
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
        />
      )}
      {activeTab === 'content' && (
        <ContentOptimizationTab
          analyzer={analyzer}
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
        />
      )}
    </div>
  )
}
