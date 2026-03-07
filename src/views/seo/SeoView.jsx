import { useState, useRef, useCallback, useMemo } from 'react'
import {
  ClipboardCheck, FileSearch, Wrench, KeyRound, PenLine, BookOpen,
  Settings2, Clock, ToggleLeft, ToggleRight, Lightbulb, LayoutGrid,
} from 'lucide-react'
import { useScrollActiveTab } from '../../hooks/useScrollActiveTab'
import { useSeoAnalyzer } from './useSeoAnalyzer'
import { SEO_DOCS } from '../../data/seo-docs'
import RecommendationCard from '../../components/RecommendationCard'
import { useRecommendations } from '../../hooks/useRecommendations'
import SeoAuditTab from './SeoAuditTab'
import OnPageSeoTab from './OnPageSeoTab'
import TechnicalSeoTab from './TechnicalSeoTab'
import KeywordResearchTab from './KeywordResearchTab'
import ContentOptimizationTab from './ContentOptimizationTab'
import { AeoTreemapChart } from '../../components/charts'

const TABS = [
  { id: 'audit', icon: ClipboardCheck },
  { id: 'onpage', icon: FileSearch },
  { id: 'technical', icon: Wrench },
  { id: 'keywords', icon: KeyRound },
  { id: 'content', icon: PenLine },
  { id: 'structure', icon: LayoutGrid },
]

function AutoScanPopover({ analyzer, onClose }) {
const { autoScanEnabled, autoScanInterval, setAutoScan } = analyzer
  const intervals = [
    { key: '1d', label: 'Every day' },
    { key: '3d', label: 'Every 3 days' },
    { key: '7d', label: 'Every 7 days' },
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
        {'Scheduled Re-scans'}
      </h4>

      {/* Enable toggle */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '0.625rem' }}
        onClick={() => setAutoScan(!autoScanEnabled, autoScanInterval)}
      >
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
          {'Auto-scan enabled'}
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
            {'Interval'}
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

export default function SeoView({ activeProject, updateProject, user, setDocItem, setActiveView }) {
const [activeTab, setActiveTab] = useState('audit')
  const [showAutoScan, setShowAutoScan] = useState(false)
  const [showRecs, setShowRecs] = useState(true)
  const tabsRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)

  const analyzer = useSeoAnalyzer({ activeProject, updateProject, user })

  // SEO-specific recommendations
  const { recommendations: allRecs } = useRecommendations({ activeProject, phases: null, setActiveView: setActiveView || (() => {}) })
  const seoRecs = useMemo(() =>
    allRecs.filter(r => r.category === 'analysis' || r.source === 'score').slice(0, 5),
    [allRecs]
  )

  const openDoc = useCallback((docKey) => {
    if (setDocItem && SEO_DOCS[docKey]) {
      setDocItem(SEO_DOCS[docKey])
    }
  }, [setDocItem])

  // Build site structure treemap data from project analysis
  const structureData = useMemo(() => {
    const pages = activeProject?.pageAnalyses || {}
    const entries = Object.entries(pages)
    if (entries.length === 0) {
      // Demo data when no pages analyzed
      return [
        { name: '/', value: 100, color: '#10B981' },
        { name: '/blog', value: 80, color: '#3B82F6' },
        { name: '/products', value: 65, color: '#8B5CF6' },
        { name: '/about', value: 45, color: '#F59E0B' },
        { name: '/contact', value: 30, color: '#EF4444' },
        { name: '/faq', value: 55, color: '#10B981' },
        { name: '/docs', value: 70, color: '#3B82F6' },
        { name: '/pricing', value: 40, color: '#F59E0B' },
      ]
    }
    return entries.map(([url, data]) => {
      const score = data?.overallScore ?? 50
      const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
      let path = '/'
      try { path = new URL(url).pathname || '/' } catch { /* use default */ }
      return { name: path, value: score, color }
    })
  }, [activeProject?.pageAnalyses])

  const tabLabels = {
    audit: 'SEO Audit',
    onpage: 'On-Page SEO',
    technical: 'Technical SEO',
    keywords: 'Keyword Research',
    content: 'Content Optimization',
    structure: 'Structure',
  }

  return (
    <div className="view-wrapper">
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">{'SEO Optimization'}</h2>
          <p className="view-subtitle">{'Comprehensive search engine optimization analysis for your project'}</p>
        </div>
        {/* Auto-scan settings gear */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAutoScan(prev => !prev)}
            title={'Scheduled Re-scans'}
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
            {'New to this section? Read the documentation to understand what each check means and how to improve.'}
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
            {'Learn more'}
          </button>
        </div>
      )}

      {/* SEO Recommendations */}
      {showRecs && seoRecs.length > 0 && (
        <div className="card" style={{ padding: '0.875rem 1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <Lightbulb size={14} style={{ color: 'var(--color-phase-5)' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', flex: 1 }}>
              {'SEO Recommendations'}
            </span>
            <button onClick={() => setShowRecs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
              {'Dismiss'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {seoRecs.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} compact />
            ))}
          </div>
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
      {activeTab === 'structure' && (
        <div className="card" style={{ padding: '1.25rem', marginTop: '0.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase',
            letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            {'Site Structure Overview'}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
            {'Treemap visualization of your site pages sized by AEO score. Analyze pages to see real data.'}
          </p>
          <AeoTreemapChart data={structureData} height={320} />
        </div>
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
