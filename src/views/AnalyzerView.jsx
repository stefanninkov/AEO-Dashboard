import { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Globe, Link2, Loader2, AlertCircle, Sparkles, SearchCheck, FileText, BarChart3,
  Shield, Bot, Map, CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp,
  Code2, FileCode, ExternalLink, Zap,
} from 'lucide-react'
import { getAnalyzerIndustryContext } from '../utils/getRecommendations'
import { useActivityWithWebhooks } from '../hooks/useActivityWithWebhooks'
import { callAI } from '../utils/apiClient'
import { getApiKey, setApiKey as setProviderApiKey, hasApiKey } from '../utils/aiProvider'
import logger from '../utils/logger'
import { useFixGenerator, FixButton, FixPanel } from './analyzer/FixGenerator'
import { useScrollActiveTab } from '../hooks/useScrollActiveTab'
import BulkFixGenerator from './analyzer/BulkFixGenerator'
import {
  STATUS_CONFIG, AnalysisResults, AnalyzerItemRow, AnalyzerItemWithFix,
  SkeletonLoader, parseAnalysisJSON, parseFixJSON,
} from './analyzer/AnalysisResultsShared'
import PageAnalyzerTab from './analyzer/PageAnalyzerTab'
import PageHealthTab from './analyzer/PageHealthTab'
import { fetchPageHtml, parsePageData } from '../utils/htmlCrawler'
import { checkRobotsTxt, AI_CRAWLERS } from '../utils/robotsChecker'
import { checkSitemap } from '../utils/sitemapChecker'
import { scorePage } from '../utils/deterministicScorer'
import { useScoreHistory } from '../hooks/useScoreHistory'

/* ── Deterministic Score Badge ── */
function ScoreBadge({ score, size = 'lg' }) {
  const color = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
  const isLg = size === 'lg'
  return (
    <div style={{
      width: isLg ? '4.5rem' : '2.5rem', height: isLg ? '4.5rem' : '2.5rem',
      borderRadius: '50%', border: `3px solid ${color}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: isLg ? '1.25rem' : '0.875rem', color, lineHeight: 1 }}>
        {score}
      </span>
      {isLg && <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>/100</span>}
    </div>
  )
}

/* ── Category Score Bar ── */
function CategoryBar({ name, score, maxScore }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const color = pct >= 70 ? 'var(--color-success)' : pct >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '8rem', flexShrink: 0 }}>{name}</span>
      <div style={{ flex: 1, height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '0.25rem', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '0.25rem', transition: 'width 500ms ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, fontWeight: 600, width: '2.5rem', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

/* ── Check Item Row ── */
function CheckRow({ check }) {
  const icon = check.status === 'pass' ? <CheckCircle2 size={14} /> : check.status === 'fail' ? <XCircle size={14} /> : <MinusCircle size={14} />
  const color = check.status === 'pass' ? 'var(--color-success)' : check.status === 'fail' ? 'var(--color-error)' : 'var(--color-warning)'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
      <span style={{ color, flexShrink: 0, marginTop: '0.0625rem' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{check.item}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, fontWeight: 600 }}>
            {check.points}/{check.maxPoints}
          </span>
        </div>
        {check.detail && (
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem', lineHeight: 1.4 }}>
            {check.detail}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Crawler Status Row ── */
function CrawlerRow({ crawler }) {
  const color = crawler.status === 'allowed' ? 'var(--color-success)' : crawler.status === 'blocked' ? 'var(--color-error)' : 'var(--color-warning)'
  const icon = crawler.status === 'allowed' ? <CheckCircle2 size={13} /> : crawler.status === 'blocked' ? <XCircle size={13} /> : <MinusCircle size={13} />
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem',
      borderBottom: '0.0625rem solid color-mix(in srgb, var(--border-subtle) 50%, transparent)',
    }}>
      <span style={{ color, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', width: '7rem' }}>{crawler.name}</span>
      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', flex: 1 }}>{crawler.engine}</span>
      <span style={{
        fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase',
        padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
        color, background: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}>
        {crawler.status}
      </span>
    </div>
  )
}

/* ── Collapsible Section for Deterministic Results ── */
function DetSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700,
          color: 'var(--text-primary)', textAlign: 'left',
        }}
      >
        {icon}
        <span style={{ flex: 1 }}>{title}</span>
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
      </button>
      {open && <div style={{ padding: '0 1rem 1rem' }}>{children}</div>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */

export default function AnalyzerView({ activeProject, updateProject, user }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('site') // 'site' | 'pages' | 'health'
  const topTabsRef = useRef(null)
  useScrollActiveTab(topTabsRef, activeTab)
  const [mode, setMode] = useState('url') // 'webflow' | 'url'
  const modeTabsRef = useRef(null)
  useScrollActiveTab(modeTabsRef, mode)
  const [url, setUrl] = useState(activeProject?.url || '')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(activeProject?.analyzerResults || null)
  const [apiKey, setApiKey] = useState(() => getApiKey() || '')
  const [showApiKey, setShowApiKey] = useState(false)

  // Score history — auto-record scores after analysis
  const { addSnapshot: addScoreSnapshot } = useScoreHistory({ activeProject, updateProject })

  // Deterministic state
  const [deterministicScore, setDeterministicScore] = useState(activeProject?.deterministicScore || null)
  const [robotsData, setRobotsData] = useState(activeProject?.robotsData || null)
  const [sitemapData, setSitemapData] = useState(activeProject?.sitemapData || null)
  const [pageData, setPageData] = useState(null)
  const [scanPhase, setScanPhase] = useState('') // 'html' | 'robots' | 'sitemap' | 'scoring' | ''

  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })

  // Fix generator state
  const [fixes, setFixes] = useState(activeProject?.analyzerFixes || {})

  // Sync state when active project changes
  useEffect(() => {
    setUrl(activeProject?.url || '')
    setResults(activeProject?.analyzerResults || null)
    setDeterministicScore(activeProject?.deterministicScore || null)
    setRobotsData(activeProject?.robotsData || null)
    setSitemapData(activeProject?.sitemapData || null)
    setFixes(activeProject?.analyzerFixes || {})
    setError(null)
  }, [activeProject?.id])

  // Webflow state
  const [webflowSites, setWebflowSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [webflowLoading, setWebflowLoading] = useState(false)

  // Page count for badge
  const pageCount = useMemo(() => {
    return Object.keys(activeProject?.pageAnalyses || {}).length
  }, [activeProject?.pageAnalyses])

  const saveApiKey = (key) => {
    setApiKey(key)
    setProviderApiKey(undefined, key)
    setShowApiKey(false)
  }

  // ── Fix handlers ──

  const handleFixGenerated = (fixData) => {
    setFixes(prev => {
      const newFixes = { ...prev, [fixData.itemId]: fixData }
      updateProject(activeProject.id, { analyzerFixes: newFixes })
      return newFixes
    })
    logAndDispatch('generateFix', {
      itemName: fixData.itemId,
      priority: fixData.priority,
    }, user)
  }

  const handleBulkFix = async (items, onProgress) => {
    for (let i = 0; i < items.length; i++) {
      const { item, categoryName } = items[i]
      try {
        const data = await callAI({
          maxTokens: 4000,
          system: `You are an AEO (Answer Engine Optimization) expert. Generate practical, ready-to-use fixes for website issues. Always provide:
1. A brief explanation of WHY this matters for AEO
2. The exact code or content to implement
3. Clear implementation steps
4. Priority level (critical/high/medium/low)

Format your response as JSON:
{
  "explanation": "Why this matters for AEO (1-2 sentences)",
  "priority": "critical|high|medium|low",
  "codeBlocks": [
    {
      "language": "html|json|javascript|css|text",
      "label": "Short description of this code block",
      "code": "The actual code to implement"
    }
  ],
  "steps": ["Step 1...", "Step 2..."],
  "notes": "Any additional implementation notes (optional)"
}`,
          messages: [{
            role: 'user',
            content: `Generate a fix for this AEO issue:

Website: ${results?.url || activeProject?.url || 'Unknown'}
Category: ${categoryName}
Item: ${item.name}
Current Status: ${item.status}
Analysis Note: ${item.note}

Provide a specific, implementable fix with code that can be directly copied and used.`
          }],
        })

        const textContent = data.text

        const parsed = parseFixJSON(textContent)
        if (parsed) {
          const fixData = {
            ...parsed,
            itemId: `${categoryName}::${item.name}`,
            generatedAt: new Date().toISOString(),
          }
          handleFixGenerated(fixData)
          onProgress(i + 1, true)
        } else {
          onProgress(i + 1, false)
        }
      } catch (err) {
        logger.error('Bulk fix error:', err)
        onProgress(i + 1, false)
      }

      // Small delay between requests to avoid rate limits
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  // Collect all fail/partial items for bulk fix
  const getFailItems = () => {
    if (!results?.categories) return []
    const items = []
    results.categories.forEach(cat => {
      cat.items?.forEach(item => {
        if (item.status === 'fail' || item.status === 'partial') {
          items.push({ item, categoryName: cat.name })
        }
      })
    })
    return items
  }

  // --- Deterministic URL Analysis (FREE — no API key) ---
  const runDeterministicAnalysis = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setDeterministicScore(null)
    setRobotsData(null)
    setSitemapData(null)
    setPageData(null)

    const targetUrl = url.startsWith('http') ? url : 'https://' + url

    try {
      // Phase 1: Fetch HTML
      setScanPhase('html')
      const html = await fetchPageHtml(targetUrl)
      const parsed = parsePageData(html, targetUrl)
      setPageData(parsed)

      // Phase 2: Check robots.txt (in parallel with sitemap)
      setScanPhase('robots')
      const [robots, sitemap] = await Promise.all([
        checkRobotsTxt(targetUrl).catch(() => null),
        checkSitemap(targetUrl).catch(() => ({ found: false, pageCount: 0, hasLastmod: false, freshness: null })),
      ])
      setRobotsData(robots)
      setSitemapData(sitemap)

      // Phase 3: Score
      setScanPhase('scoring')
      const score = scorePage(parsed, robots, sitemap)
      setDeterministicScore(score)

      // Persist to project
      updateProject(activeProject.id, {
        deterministicScore: score,
        robotsData: robots ? { found: robots.found, crawlers: robots.crawlers, summary: robots.summary, sitemaps: robots.sitemaps } : null,
        sitemapData: sitemap,
        url: targetUrl,
      })

      // Auto-record score snapshot for history timeline
      const scoreSnapshot = {
        overall: score.overallScore,
        ...Object.fromEntries(
          Object.entries(score.categories || {}).map(([name, cat]) => [
            name.toLowerCase().replace(/\s+/g, '_'),
            Math.round((cat.score / cat.maxScore) * 100),
          ])
        ),
      }
      addScoreSnapshot(scoreSnapshot, 'analyzer')

      logAndDispatch('analyze', { url: targetUrl, score: score.overallScore, mode: 'deterministic' }, user)
    } catch (err) {
      logger.error('Deterministic analysis error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setScanPhase('')
    }
  }

  // --- AI Analysis (requires API key — optional layer) ---
  const runAiAnalysis = async () => {
    if (!url.trim()) return
    if (!hasApiKey()) {
      setShowApiKey(true)
      return
    }
    setAiLoading(true)
    setError(null)
    try {
      const data = await callAI({
        messages: [{
          role: 'user',
          content: `Analyze this URL for AEO readiness: ${url}${getAnalyzerIndustryContext(activeProject?.questionnaire)}

Search for and visit this website, then evaluate against these AEO criteria. For each item give status: "pass", "fail", or "partial" with brief explanation.

Return ONLY valid JSON:
{
  "url": "${url}",
  "overallScore": 0-100,
  "source": "url",
  "categories": [
    { "name": "Schema Markup", "items": [
      { "name": "FAQPage schema", "status": "pass|fail|partial", "note": "..." },
      { "name": "Article schema", "status": "...", "note": "..." },
      { "name": "Organization schema", "status": "...", "note": "..." },
      { "name": "BreadcrumbList schema", "status": "...", "note": "..." }
    ]},
    { "name": "Content Structure", "items": [
      { "name": "Question-based headings", "status": "...", "note": "..." },
      { "name": "Direct answer paragraphs", "status": "...", "note": "..." },
      { "name": "Summary/TL;DR section", "status": "...", "note": "..." },
      { "name": "FAQ section present", "status": "...", "note": "..." },
      { "name": "Definition-style formatting", "status": "...", "note": "..." }
    ]},
    { "name": "Technical SEO", "items": [
      { "name": "HTTPS enabled", "status": "...", "note": "..." },
      { "name": "Meta description optimized", "status": "...", "note": "..." },
      { "name": "Open Graph tags", "status": "...", "note": "..." },
      { "name": "Semantic HTML", "status": "...", "note": "..." },
      { "name": "Mobile responsive", "status": "...", "note": "..." }
    ]},
    { "name": "Authority Signals", "items": [
      { "name": "Author information", "status": "...", "note": "..." },
      { "name": "Last updated date", "status": "...", "note": "..." },
      { "name": "External citations", "status": "...", "note": "..." },
      { "name": "Internal linking", "status": "...", "note": "..." }
    ]}
  ],
  "topPriorities": ["top 5 things to fix"],
  "summary": "2-3 sentence assessment"
}`
        }],
        extraBody: {
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        },
      })

      const textContent = data.text

      const parsed = parseAnalysisJSON(textContent)
      if (parsed) {
        setResults(parsed)
        updateProject(activeProject.id, { analyzerResults: parsed, url })
        logAndDispatch('analyze', { url, score: parsed.overallScore, mode: 'ai' }, user)
      } else {
        setError(t('analyzer.parseErrorAccess'))
      }
    } catch (err) {
      logger.error('AI Analyzer error:', err)
      setError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  // --- Webflow MCP Analysis ---
  const fetchWebflowSites = async () => {
    if (!hasApiKey()) {
      setShowApiKey(true)
      setError(t('analyzer.enterApiKeyFirst'))
      return
    }
    setWebflowLoading(true)
    setError(null)
    try {
      const data = await callAI({
        messages: [{ role: 'user', content: 'List all my Webflow sites with their site IDs and domains. Return as JSON array: [{"id": "...", "name": "...", "domain": "..."}]' }],
        extraBody: {
          mcp_servers: [{
            type: 'url',
            url: 'https://mcp.webflow.com/mcp',
            name: 'webflow-mcp'
          }]
        },
      })

      const textContent = data.text

      try {
        const clean = textContent.replace(/```json\s?|```/g, '').trim()
        const jsonMatch = clean.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          setWebflowSites(JSON.parse(jsonMatch[0]))
        }
      } catch {
        setWebflowSites([])
        setError(t('analyzer.webflowParseError'))
      }
    } catch (err) {
      logger.error('Webflow fetch error:', err)
      setError(err.message)
    } finally {
      setWebflowLoading(false)
    }
  }

  const analyzeWebflowSite = async (site) => {
    if (!hasApiKey()) {
      setShowApiKey(true)
      setError(t('analyzer.enterApiKeyFirst'))
      return
    }
    setSelectedSite(site)
    setAiLoading(true)
    setError(null)
    try {
      const data = await callAI({
        maxTokens: 8000,
        messages: [{
          role: 'user',
          content: `Analyze the Webflow site "${site.name}" (ID: ${site.id}) for AEO (Answer Engine Optimization) readiness.

Please:
1. List all pages of the site
2. Check custom code blocks for schema markup (JSON-LD)
3. Check SEO settings (meta titles, descriptions, OG tags)
4. Check CMS collections and their structure
5. Analyze content patterns

Then evaluate against these AEO criteria and return ONLY valid JSON:
{
  "url": "${site.domain || site.name}",
  "overallScore": 0-100,
  "source": "webflow",
  "categories": [
    { "name": "Schema Markup", "items": [
      { "name": "FAQPage schema", "status": "pass|fail|partial", "note": "..." },
      { "name": "Article schema", "status": "...", "note": "..." },
      { "name": "Organization schema", "status": "...", "note": "..." },
      { "name": "BreadcrumbList schema", "status": "...", "note": "..." },
      { "name": "Product schema", "status": "...", "note": "..." }
    ]},
    { "name": "Content Structure", "items": [
      { "name": "Question-based headings", "status": "...", "note": "..." },
      { "name": "Direct answer paragraphs", "status": "...", "note": "..." },
      { "name": "Summary/TL;DR sections", "status": "...", "note": "..." },
      { "name": "FAQ sections present", "status": "...", "note": "..." },
      { "name": "CMS structure optimized", "status": "...", "note": "..." }
    ]},
    { "name": "Technical SEO", "items": [
      { "name": "Meta descriptions", "status": "...", "note": "..." },
      { "name": "Open Graph tags", "status": "...", "note": "..." },
      { "name": "Semantic HTML", "status": "...", "note": "..." },
      { "name": "Mobile responsive", "status": "...", "note": "..." },
      { "name": "Custom code implementation", "status": "...", "note": "..." }
    ]},
    { "name": "Authority Signals", "items": [
      { "name": "Author information", "status": "...", "note": "..." },
      { "name": "Last updated dates", "status": "...", "note": "..." },
      { "name": "External citations", "status": "...", "note": "..." },
      { "name": "Internal linking", "status": "...", "note": "..." }
    ]}
  ],
  "topPriorities": ["top 5 things to fix"],
  "summary": "2-3 sentence assessment"
}`
        }],
        extraBody: {
          mcp_servers: [{
            type: 'url',
            url: 'https://mcp.webflow.com/mcp',
            name: 'webflow-mcp'
          }]
        },
      })

      const textContent = data.text

      const parsed = parseAnalysisJSON(textContent)
      if (parsed) {
        setResults(parsed)
        updateProject(activeProject.id, { analyzerResults: parsed })
        logAndDispatch('analyze', { url, score: parsed.overallScore }, user)
      } else {
        setError(t('analyzer.parseError'))
      }
    } catch (err) {
      logger.error('Webflow analysis error:', err)
      setError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  // Count critical issues in deterministic score
  const criticalCount = deterministicScore ? deterministicScore.checks.filter(c => c.status === 'fail').length : 0
  const passCount = deterministicScore ? deterministicScore.checks.filter(c => c.status === 'pass').length : 0

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">{t('analyzer.title')}</h2>
          <p className="view-subtitle">{t('analyzer.subtitle')}</p>
        </div>
      </div>

      {/* ── Top-Level Tabs ── */}
      <div ref={topTabsRef} className="scrollable-tabs tab-bar-segmented" role="tablist">
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'site'}
          data-active={activeTab === 'site' || undefined}
          onClick={() => setActiveTab('site')}
        >
          <Globe size={14} />
          {t('analyzer.siteAnalysis')}
        </button>
        <button
          className="tab-segmented"
          role="tab"
          aria-selected={activeTab === 'pages'}
          data-active={activeTab === 'pages' || undefined}
          onClick={() => setActiveTab('pages')}
        >
          <FileText size={14} />
          {t('analyzer.pageAnalysis')}
          {pageCount > 0 && (
            <span className="tab-badge">{pageCount}</span>
          )}
        </button>
        {pageCount > 0 && (
          <button
            className="tab-segmented"
            role="tab"
            aria-selected={activeTab === 'health'}
            data-active={activeTab === 'health' || undefined}
            onClick={() => setActiveTab('health')}
          >
            <BarChart3 size={14} />
            {t('analyzer.health.tab')}
          </button>
        )}
      </div>

      {/* ── Site Analysis Tab ── */}
      {activeTab === 'site' && (
        <>
          {/* Mode Toggle */}
          <div ref={modeTabsRef} className="scrollable-tabs tab-bar-segmented">
            <button
              data-active={mode === 'url' || undefined}
              onClick={() => setMode('url')}
              className="tab-segmented"
            >
              <Globe size={14} />
              {t('analyzer.urlScan')}
            </button>
            <button
              data-active={mode === 'webflow' || undefined}
              onClick={() => setMode('webflow')}
              className="tab-segmented"
            >
              <Link2 size={14} />
              {t('analyzer.webflowConnect')}
            </button>
          </div>

          {/* URL Mode */}
          {mode === 'url' && (
            <>
              <div className="analyzer-url-row">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runDeterministicAnalysis()}
                  className="analyzer-url-input"
                />
                <button
                  onClick={runDeterministicAnalysis}
                  disabled={loading || !url.trim()}
                  className="metrics-run-btn"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                  {loading ? t('analyzer.analyzing') : 'Scan Site'}
                </button>
              </div>

              {/* Scan progress indicator */}
              {loading && scanPhase && (
                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {scanPhase === 'html' && 'Fetching page HTML...'}
                        {scanPhase === 'robots' && 'Checking robots.txt & sitemap...'}
                        {scanPhase === 'scoring' && 'Computing AEO score...'}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        No API key needed — real data analysis
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem', height: '0.25rem', background: 'var(--border-subtle)', borderRadius: '0.125rem', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '0.125rem',
                      background: 'linear-gradient(90deg, var(--accent), var(--color-phase-3))',
                      width: scanPhase === 'html' ? '33%' : scanPhase === 'robots' ? '66%' : '100%',
                      transition: 'width 400ms ease',
                    }} />
                  </div>
                </div>
              )}

              {/* ── DETERMINISTIC RESULTS ── */}
              {deterministicScore && !loading && (
                <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {/* Score Overview Card */}
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <ScoreBadge score={deterministicScore.overallScore} />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          AEO Readiness Score
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {passCount} checks passed · {criticalCount} critical issues · Based on real page data
                        </p>
                        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase',
                            padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
                            color: 'var(--color-success)', background: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                          }}>
                            Measured
                          </span>
                          <span style={{
                            fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase',
                            padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
                            color: 'var(--text-tertiary)', background: 'var(--hover-bg)',
                          }}>
                            No API Key Required
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Category bars */}
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(deterministicScore.categories).map(([name, cat]) => (
                        <CategoryBar key={name} name={name} score={cat.score} maxScore={cat.maxScore} />
                      ))}
                    </div>
                  </div>

                  {/* Detailed Check Results */}
                  {Object.entries(deterministicScore.categories).map(([name, cat]) => (
                    <DetSection
                      key={name}
                      title={`${name} (${Math.round((cat.score / cat.maxScore) * 100)}%)`}
                      icon={
                        name === 'Content Structure' ? <FileText size={15} style={{ color: 'var(--color-phase-1)' }} /> :
                        name === 'Schema Markup' ? <Code2 size={15} style={{ color: 'var(--color-phase-2)' }} /> :
                        name === 'Technical' ? <FileCode size={15} style={{ color: 'var(--color-phase-3)' }} /> :
                        name === 'AI Discoverability' ? <Bot size={15} style={{ color: 'var(--color-phase-4)' }} /> :
                        <Shield size={15} style={{ color: 'var(--color-phase-5)' }} />
                      }
                      defaultOpen={cat.score / cat.maxScore < 0.7}
                    >
                      {cat.items.map((check, i) => <CheckRow key={i} check={check} />)}
                    </DetSection>
                  ))}

                  {/* AI Crawler Access Panel */}
                  {robotsData && (
                    <DetSection
                      title={`AI Crawler Access (${robotsData.summary?.allowed || 0}/${robotsData.summary?.total || 0} allowed)`}
                      icon={<Bot size={15} style={{ color: 'var(--color-phase-4)' }} />}
                      defaultOpen={robotsData.summary?.blocked > 0}
                    >
                      {robotsData.crawlers?.map((crawler, i) => (
                        <CrawlerRow key={i} crawler={crawler} />
                      ))}
                    </DetSection>
                  )}

                  {/* Schema Detected Panel */}
                  {pageData?.schema && pageData.schema.count > 0 && (
                    <DetSection
                      title={`Schema Detected (${pageData.schema.count} found)`}
                      icon={<Code2 size={15} style={{ color: 'var(--color-phase-2)' }} />}
                      defaultOpen={false}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                        {pageData.schema.types.map(type => (
                          <span key={type} style={{
                            fontSize: '0.6875rem', fontWeight: 600,
                            padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                            background: 'var(--accent-subtle)', color: 'var(--accent)',
                          }}>
                            {type}
                          </span>
                        ))}
                      </div>
                      {pageData.schema.found.filter(s => s.format === 'json-ld').slice(0, 3).map((s, i) => (
                        <div key={i} style={{
                          marginTop: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem',
                          background: 'var(--bg-page)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
                          color: 'var(--text-tertiary)', maxHeight: '6rem', overflow: 'hidden',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                        }}>
                          {JSON.stringify(s.data, null, 2).slice(0, 400)}...
                        </div>
                      ))}
                    </DetSection>
                  )}

                  {/* Sitemap Summary */}
                  {sitemapData && sitemapData.found && (
                    <DetSection
                      title={`Sitemap (${sitemapData.pageCount || '?'} pages)`}
                      icon={<Map size={15} style={{ color: 'var(--color-phase-3)' }} />}
                      defaultOpen={false}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--hover-bg)', textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {sitemapData.pageCount || '?'}
                          </div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pages</div>
                        </div>
                        {sitemapData.freshness && (
                          <>
                            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--hover-bg)', textAlign: 'center' }}>
                              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-success)' }}>
                                {sitemapData.freshness.fresh}
                              </div>
                              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Fresh (&lt;30d)</div>
                            </div>
                            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--hover-bg)', textAlign: 'center' }}>
                              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-warning)' }}>
                                {sitemapData.freshness.stale}
                              </div>
                              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Stale (30-180d)</div>
                            </div>
                          </>
                        )}
                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--hover-bg)', textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {sitemapData.lastmodCoverage || 0}%
                          </div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Lastmod</div>
                        </div>
                      </div>
                    </DetSection>
                  )}

                  {/* AI Analysis Button */}
                  <div className="card" style={{
                    padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 5%, var(--bg-card)), var(--bg-card))',
                    border: '0.0625rem solid color-mix(in srgb, var(--accent) 20%, var(--border-subtle))',
                  }}>
                    <Sparkles size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Want AI-powered recommendations?
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        Get intelligent fix suggestions, priority ranking, and content recommendations.
                      </p>
                    </div>
                    <button
                      onClick={() => hasApiKey() ? runAiAnalysis() : setShowApiKey(true)}
                      disabled={aiLoading}
                      className="btn-primary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      {aiLoading ? 'Analyzing...' : hasApiKey() ? 'Run AI Analysis' : 'Set API Key'}
                    </button>
                  </div>

                  {/* API Key Input (shown when needed) */}
                  {showApiKey && (
                    <div className="card fade-in-up" style={{ padding: '1rem 1.25rem' }}>
                      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {t('analyzer.apiKeyRequired')}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                        {t('analyzer.enterApiKey')}
                      </p>
                      <div className="analyzer-url-row">
                        <input
                          type="password"
                          placeholder="sk-ant-..."
                          value={apiKey}
                          onChange={e => setApiKey(e.target.value)}
                          className="analyzer-url-input"
                        />
                        <button
                          onClick={() => saveApiKey(apiKey)}
                          className="metrics-run-btn"
                        >
                          {t('analyzer.save')}
                        </button>
                      </div>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.375rem' }}>
                        {t('analyzer.keyStoredLocally')}
                      </p>
                    </div>
                  )}

                  {/* AI Analysis Results (existing component) */}
                  {results && !aiLoading && (
                    <DetSection
                      title="AI Analysis Results"
                      icon={<Sparkles size={15} style={{ color: 'var(--accent)' }} />}
                      defaultOpen={true}
                    >
                      <div style={{
                        fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase',
                        padding: '0.125rem 0.375rem', borderRadius: '0.25rem', marginBottom: '0.75rem',
                        color: 'var(--color-warning)', background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      }}>
                        ~ AI Estimated
                      </div>
                      <AnalysisResults
                        results={results}
                        siteUrl={results.url || activeProject?.url}
                        fixes={fixes}
                        onFixGenerated={handleFixGenerated}
                        failItems={getFailItems()}
                        onBulkFix={handleBulkFix}
                      />
                    </DetSection>
                  )}
                </div>
              )}

              {/* AI Loading */}
              {aiLoading && <SkeletonLoader />}
            </>
          )}

          {/* Webflow Mode */}
          {mode === 'webflow' && (
            <div className="analyzer-api-card space-y-4">
              {/* API Key (needed for Webflow) */}
              {!hasApiKey() && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {t('analyzer.apiKeyRequired')}
                  </h4>
                  <div className="analyzer-url-row">
                    <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKey(e.target.value)} className="analyzer-url-input" />
                    <button onClick={() => saveApiKey(apiKey)} className="metrics-run-btn">{t('analyzer.save')}</button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[0.8125rem] text-text-secondary">{t('analyzer.webflowConnectDesc')}</p>
                <button
                  onClick={fetchWebflowSites}
                  disabled={webflowLoading}
                  className="px-4 py-2 bg-accent text-white rounded-lg text-[0.8125rem] font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center gap-2"
                >
                  {webflowLoading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                  {webflowSites.length > 0 ? t('analyzer.refreshSites') : t('analyzer.loadSites')}
                </button>
              </div>

              {webflowSites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[0.625rem] text-text-tertiary font-heading uppercase tracking-[0.0625rem]">{t('analyzer.selectSite')}</p>
                  {webflowSites.map((site, idx) => (
                    <button
                      key={idx}
                      onClick={() => analyzeWebflowSite(site)}
                      disabled={aiLoading}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${
                        selectedSite?.id === site.id
                          ? 'border-phase-2/40 bg-phase-2/5'
                          : ''
                      }`}
                      style={selectedSite?.id !== site.id ? { background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)' } : {}}
                    >
                      <p className="text-[0.8125rem] font-medium text-text-primary">{site.name}</p>
                      {site.domain && <p className="text-[0.6875rem] text-text-tertiary">{site.domain}</p>}
                    </button>
                  ))}
                </div>
              )}

              {/* Webflow AI results */}
              {results && !aiLoading && (
                <AnalysisResults
                  results={results}
                  siteUrl={results.url || activeProject?.url}
                  fixes={fixes}
                  onFixGenerated={handleFixGenerated}
                  failItems={getFailItems()}
                  onBulkFix={handleBulkFix}
                />
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="analyzer-error bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3 fade-in-up">
              <AlertCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error">{t('analyzer.analysisError')}</p>
                <p className="text-xs text-text-secondary mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* No results empty state */}
          {!deterministicScore && !results && !loading && !aiLoading && !error && (
            <div className="analyzer-empty-card fade-in-up">
              <div className="analyzer-empty-icon">
                <SearchCheck size={28} className="text-text-tertiary" />
              </div>
              <h3 className="analyzer-empty-title">{t('analyzer.readyToAnalyze')}</h3>
              <p className="analyzer-empty-text">
                Enter a URL to get an instant AEO readiness score. No API key needed — deterministic analysis based on real page data.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Page Analysis Tab ── */}
      {activeTab === 'pages' && (
        <PageAnalyzerTab
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
          gscPageData={null}
        />
      )}

      {/* ── Page Health Tab ── */}
      {activeTab === 'health' && (
        <PageHealthTab activeProject={activeProject} />
      )}
    </div>
  )
}
