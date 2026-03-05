import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck, FileSearch, Wrench, KeyRound, PenLine, BookOpen,
  Settings2, Clock, ToggleLeft, ToggleRight,
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

function AutoScanPopover({ analyzer, onClose }) {
  const { t } = useTranslation('app')
  const { autoScanEnabled, autoScanInterval, setAutoScan } = analyzer
  const intervals = [
    { key: '1d', label: t('seo.interval1d', 'Every day') },
    { key: '3d', label: t('seo.interval3d', 'Every 3 days') },
    { key: '7d', label: t('seo.interval7d', 'Every 7 days') },
  ]

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: '0.375rem', zIndex: 50,
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', padding: '0.875rem', width: '14rem',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <Clock size={12} style={{ color: 'var(--accent)' }} />
        {t('seo.autoScan', 'Scheduled Re-scans')}
      </h4>

      {/* Enable toggle */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '0.625rem' }}
        onClick={() => setAutoScan(!autoScanEnabled, autoScanInterval)}
      >
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
          {t('seo.autoScanEnabled', 'Auto-scan enabled')}
        </span>
        {autoScanEnabled
          ? <ToggleRight size={20} style={{ color: 'var(--accent)' }} />
          : <ToggleLeft size={20} style={{ color: 'var(--text-disabled)' }} />
        }
      </div>

      {/* Interval selector */}
      {autoScanEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('seo.autoScanInterval', 'Interval')}
          </span>
          {intervals.map(iv => (
            <button
              key={iv.key}
              onClick={() => setAutoScan(true, iv.key)}
              style={{
                padding: '0.375rem 0.5rem', fontSize: '0.6875rem', textAlign: 'left',
                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: autoScanInterval === iv.key ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                color: autoScanInterval === iv.key ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: autoScanInterval === iv.key ? 600 : 400,
              }}
            >
              {iv.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SeoView({ activeProject, updateProject, user, setDocItem }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('audit')
  const [showAutoScan, setShowAutoScan] = useState(false)
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
        {/* Auto-scan settings gear */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAutoScan(prev => !prev)}
            title={t('seo.autoScan', 'Scheduled Re-scans')}
            style={{
              background: 'none', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)', padding: '0.375rem', cursor: 'pointer',
              color: analyzer.autoScanEnabled ? 'var(--accent)' : 'var(--text-tertiary)',
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            <Settings2 size={14} />
            {analyzer.autoScanEnabled && (
              <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--accent)' }}>ON</span>
            )}
          </button>
          {showAutoScan && <AutoScanPopover analyzer={analyzer} onClose={() => setShowAutoScan(false)} />}
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
        <OnPageSeoTab analyzer={analyzer} activeProject={activeProject} />
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

      {/* Click outside to close auto-scan popover */}
      {showAutoScan && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setShowAutoScan(false)}
        />
      )}
    </div>
  )
}
