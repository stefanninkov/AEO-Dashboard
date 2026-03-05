import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck, FileSearch, Wrench, KeyRound, PenLine, BookOpen,
} from 'lucide-react'
import { useScrollActiveTab } from '../../hooks/useScrollActiveTab'
import { useSeoAnalyzer } from './useSeoAnalyzer'
import { SEO_DOCS } from '../../data/seo-docs'
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

export default function SeoView({ activeProject, updateProject, user, setDocItem }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('audit')
  const tabsRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)

  const analyzer = useSeoAnalyzer({ activeProject, updateProject, user })

  const openDoc = useCallback((docKey) => {
    if (setDocItem && SEO_DOCS[docKey]) {
      setDocItem(SEO_DOCS[docKey])
    }
  }, [setDocItem])

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

      {/* Learn more banner */}
      {SEO_DOCS[activeTab] && setDocItem && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.625rem 1rem', marginTop: '0.5rem',
          background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--accent) 12%, transparent)',
          borderRadius: 'var(--radius-md)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {t('seo.learnMoreHint')}
          </span>
          <button
            onClick={() => openDoc(activeTab)}
            className="btn-action"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.6875rem', padding: '0.25rem 0.5rem',
              color: 'var(--accent)', background: 'none', border: '0.0625rem solid var(--accent)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600,
            }}
          >
            <BookOpen size={11} />
            {t('seo.learnMore')}
          </button>
        </div>
      )}

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
