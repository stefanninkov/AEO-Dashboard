import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Link2, Loader2, AlertCircle, Zap, Search, FileText } from 'lucide-react'
import { getAnalyzerIndustryContext } from '../utils/getRecommendations'
import { useActivityWithWebhooks } from '../hooks/useActivityWithWebhooks'
import { callAnthropicApi } from '../utils/apiClient'
import logger from '../utils/logger'
import { useFixGenerator, FixButton, FixPanel } from './analyzer/FixGenerator'
import BulkFixGenerator from './analyzer/BulkFixGenerator'
import {
  STATUS_CONFIG, AnalysisResults, AnalyzerItemRow, AnalyzerItemWithFix,
  SkeletonLoader, parseAnalysisJSON, parseFixJSON,
} from './analyzer/AnalysisResultsShared'
import PageAnalyzerTab from './analyzer/PageAnalyzerTab'

export default function AnalyzerView({ activeProject, updateProject, user }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('site') // 'site' | 'pages'
  const [mode, setMode] = useState('url') // 'webflow' | 'url'
  const [url, setUrl] = useState(activeProject?.url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(activeProject?.analyzerResults || null)
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic-api-key') || '')
  const [showApiKey, setShowApiKey] = useState(!apiKey)

  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })

  // Fix generator state
  const [fixes, setFixes] = useState(activeProject?.analyzerFixes || {})

  // Sync state when active project changes
  useEffect(() => {
    setUrl(activeProject?.url || '')
    setResults(activeProject?.analyzerResults || null)
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
    localStorage.setItem('anthropic-api-key', key)
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
        const data = await callAnthropicApi({
          apiKey,
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

        const textContent = data.content
          ?.filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n') || ''

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

  // --- Webflow MCP Analysis ---
  const fetchWebflowSites = async () => {
    if (!apiKey) {
      setShowApiKey(true)
      setError(t('analyzer.enterApiKeyFirst'))
      return
    }
    setWebflowLoading(true)
    setError(null)
    try {
      const data = await callAnthropicApi({
        apiKey,
        messages: [{ role: 'user', content: 'List all my Webflow sites with their site IDs and domains. Return as JSON array: [{"id": "...", "name": "...", "domain": "..."}]' }],
        extraBody: {
          mcp_servers: [{
            type: 'url',
            url: 'https://mcp.webflow.com/mcp',
            name: 'webflow-mcp'
          }]
        },
      })
      if (data.error) throw new Error(data.error.message)

      const textContent = data.content
        ?.filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n') || ''

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
    if (!apiKey) {
      setShowApiKey(true)
      setError(t('analyzer.enterApiKeyFirst'))
      return
    }
    setSelectedSite(site)
    setLoading(true)
    setError(null)
    try {
      const data = await callAnthropicApi({
        apiKey,
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
      if (data.error) throw new Error(data.error.message)

      const textContent = data.content
        ?.filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n') || ''

      const parsed = parseAnalysisJSON(textContent)
      if (parsed) {
        setResults(parsed)
        updateProject(activeProject.id, { analyzerResults: parsed })
        // Log analyze activity
        logAndDispatch('analyze', { url, score: parsed.overallScore }, user)
      } else {
        setError(t('analyzer.parseError'))
      }
    } catch (err) {
      logger.error('Webflow analysis error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- URL Analysis ---
  const analyzeUrl = async () => {
    if (!url.trim()) return
    if (!apiKey) {
      setShowApiKey(true)
      setError(t('analyzer.enterApiKeyFirst'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await callAnthropicApi({
        apiKey,
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
      if (data.error) throw new Error(data.error.message)

      const textContent = data.content
        ?.filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n') || ''

      const parsed = parseAnalysisJSON(textContent)
      if (parsed) {
        setResults(parsed)
        updateProject(activeProject.id, { analyzerResults: parsed, url })
        // Log analyze activity
        logAndDispatch('analyze', { url, score: parsed.overallScore }, user)
      } else {
        setError(t('analyzer.parseErrorAccess'))
      }
    } catch (err) {
      logger.error('Analyzer error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01875rem] text-text-primary">{t('analyzer.title')}</h2>
          <span className="text-[0.6875rem] px-2 py-0.5 rounded-full bg-phase-3/10 text-phase-3 font-medium">{activeProject?.name}</span>
        </div>
        <p className="text-[0.8125rem] text-text-secondary">{t('analyzer.subtitle')}</p>
      </div>

      {/* ── Top-Level Tabs ── */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--hover-bg)', borderRadius: '0.625rem', padding: '0.1875rem' }}>
        <button
          onClick={() => setActiveTab('site')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600,
            fontFamily: 'var(--font-body)', border: 'none', borderRadius: '0.5rem',
            cursor: 'pointer', transition: 'all 100ms',
            background: activeTab === 'site' ? 'var(--color-phase-1)' : 'transparent',
            color: activeTab === 'site' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          <Globe size={14} />
          {t('analyzer.siteAnalysis')}
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600,
            fontFamily: 'var(--font-body)', border: 'none', borderRadius: '0.5rem',
            cursor: 'pointer', transition: 'all 100ms',
            background: activeTab === 'pages' ? 'var(--color-phase-1)' : 'transparent',
            color: activeTab === 'pages' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          <FileText size={14} />
          {t('analyzer.pageAnalysis')}
          {pageCount > 0 && (
            <span style={{
              fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
              padding: '0.0625rem 0.3125rem', borderRadius: '0.375rem',
              background: activeTab === 'pages' ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)',
              color: activeTab === 'pages' ? '#fff' : 'var(--text-tertiary)',
            }}>
              {pageCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Site Analysis Tab ── */}
      {activeTab === 'site' && (
        <>
          {/* API Key */}
          {showApiKey && (
            <div className="analyzer-api-card analyzer-api-card-accent fade-in-up">
              <h3 className="analyzer-api-title">{t('analyzer.apiKeyRequired')}</h3>
              <p className="text-[0.8125rem] text-text-secondary mb-3">{t('analyzer.enterApiKey')}</p>
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
              <p className="text-[0.6875rem] text-text-tertiary mt-2">{t('analyzer.keyStoredLocally')}</p>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="analyzer-mode-tabs">
            <button
              onClick={() => setMode('url')}
              className={`analyzer-mode-tab ${mode === 'url' ? 'active' : ''}`}
              style={mode === 'url' ? { backgroundColor: 'var(--color-phase-1)' } : {}}
            >
              <Globe size={14} />
              {t('analyzer.urlScan')}
            </button>
            <button
              onClick={() => setMode('webflow')}
              className={`analyzer-mode-tab ${mode === 'webflow' ? 'active' : ''}`}
              style={mode === 'webflow' ? { backgroundColor: 'var(--color-phase-2)' } : {}}
            >
              <Link2 size={14} />
              {t('analyzer.webflowConnect')}
            </button>
            {!showApiKey && apiKey && (
              <button
                onClick={() => setShowApiKey(true)}
                className="ml-auto text-[0.6875rem] text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {t('analyzer.changeApiKey')}
              </button>
            )}
          </div>

          {/* URL Mode */}
          {mode === 'url' && (
            <div className="analyzer-url-row">
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && analyzeUrl()}
                className="analyzer-url-input"
              />
              <button
                onClick={analyzeUrl}
                disabled={loading || !url.trim()}
                className="metrics-run-btn"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {loading ? t('analyzer.analyzing') : t('analyzer.analyze')}
              </button>
            </div>
          )}

          {/* Webflow Mode */}
          {mode === 'webflow' && (
            <div className="analyzer-api-card space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[0.8125rem] text-text-secondary">{t('analyzer.webflowConnectDesc')}</p>
                <button
                  onClick={fetchWebflowSites}
                  disabled={webflowLoading}
                  className="px-4 py-2 bg-phase-2 text-white rounded-lg text-[0.8125rem] font-medium hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center gap-2"
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
                      disabled={loading}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${
                        selectedSite?.id === site.id
                          ? 'border-phase-2/40 bg-phase-2/5'
                          : ''
                      }`}
                      style={selectedSite?.id !== site.id ? { background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)' } : {}}
                    >
                      <p className="text-[0.8125rem] font-medium text-text-primary">{site.name}</p>
                      {site.domain && <p className="text-[0.6875rem] text-text-tertiary">{site.domain}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading — Skeleton */}
          {loading && <SkeletonLoader />}

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
          {!results && !loading && !error && (
            <div className="analyzer-empty-card fade-in-up">
              <div className="analyzer-empty-icon">
                <Search size={28} className="text-text-tertiary" />
              </div>
              <h3 className="analyzer-empty-title">{t('analyzer.readyToAnalyze')}</h3>
              <p className="analyzer-empty-text">
                {t('analyzer.readyToAnalyzeDesc')}
              </p>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <AnalysisResults
              results={results}
              apiKey={apiKey}
              siteUrl={results.url || activeProject?.url}
              fixes={fixes}
              onFixGenerated={handleFixGenerated}
              failItems={getFailItems()}
              onBulkFix={handleBulkFix}
            />
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
    </div>
  )
}
