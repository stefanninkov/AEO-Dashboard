import { useState } from 'react'
import { Globe, Link2, Loader2, AlertCircle, CheckCircle2, MinusCircle, XCircle, Zap, Search } from 'lucide-react'
import { getAnalyzerIndustryContext } from '../utils/getRecommendations'
import { createActivity, appendActivity } from '../utils/activityLogger'
import logger from '../utils/logger'

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Pass' },
  partial: { icon: MinusCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'Partial' },
  fail: { icon: XCircle, color: 'text-error', bg: 'bg-error/10', label: 'Fail' },
}

/* ── Skeleton Loader ── */
function SkeletonLoader() {
  return (
    <div className="space-y-6 fade-in-up">
      {/* Score skeleton */}
      <div className="analyzer-results-card">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-3 w-40" />
          </div>
          <div className="skeleton h-12 w-16 rounded-lg" />
        </div>
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-4 w-3/4 mt-3" />
      </div>
      {/* Category skeletons */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="analyzer-category-card" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="analyzer-category-header">
            <div className="skeleton h-4 w-32" />
          </div>
          <div>
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="analyzer-category-item">
                <div className="skeleton h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-full" />
                </div>
                <div className="skeleton h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyzerView({ activeProject, updateProject }) {
  const [mode, setMode] = useState('url') // 'webflow' | 'url'
  const [url, setUrl] = useState(activeProject?.url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(activeProject?.analyzerResults || null)
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic-api-key') || '')
  const [showApiKey, setShowApiKey] = useState(!apiKey)

  // Webflow state
  const [webflowSites, setWebflowSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [webflowLoading, setWebflowLoading] = useState(false)

  const saveApiKey = (key) => {
    setApiKey(key)
    localStorage.setItem('anthropic-api-key', key)
    setShowApiKey(false)
  }

  // --- Webflow MCP Analysis ---
  const fetchWebflowSites = async () => {
    if (!apiKey) {
      setShowApiKey(true)
      setError('Please enter your Anthropic API key first.')
      return
    }
    setWebflowLoading(true)
    setError(null)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: 'List all my Webflow sites with their site IDs and domains. Return as JSON array: [{"id": "...", "name": "...", "domain": "..."}]' }],
          mcp_servers: [{
            type: 'url',
            url: 'https://mcp.webflow.com/mcp',
            name: 'webflow-mcp'
          }]
        }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API error: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
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
        setError('Could not parse Webflow sites. You may need to authenticate with Webflow first.')
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
      setError('Please enter your Anthropic API key to use the analyzer.')
      return
    }
    setSelectedSite(site)
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
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
          mcp_servers: [{
            type: 'url',
            url: 'https://mcp.webflow.com/mcp',
            name: 'webflow-mcp'
          }]
        }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API error: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
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
        const entry = createActivity('analyze', { url, score: parsed.overallScore })
        updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, entry) })
      } else {
        setError('Could not parse analysis results.')
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
      setError('Please enter your Anthropic API key to use the analyzer.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
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
        }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API error: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
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
        const entry = createActivity('analyze', { url, score: parsed.overallScore })
        updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, entry) })
      } else {
        setError('Could not parse analysis results. The AI may not have been able to access the site.')
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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01875rem] text-text-primary">Site Analyzer</h2>
          <span className="text-[0.6875rem] px-2 py-0.5 rounded-full bg-phase-3/10 text-phase-3 font-medium">{activeProject?.name}</span>
        </div>
        <p className="text-[0.8125rem] text-text-secondary">Analyze any website for AEO readiness using AI-powered analysis.</p>
      </div>

      {/* API Key */}
      {showApiKey && (
        <div className="analyzer-api-card analyzer-api-card-accent fade-in-up">
          <h3 className="analyzer-api-title">API Key Required</h3>
          <p className="text-[0.8125rem] text-text-secondary mb-3">Enter your Anthropic API key to use the analyzer:</p>
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
              Save
            </button>
          </div>
          <p className="text-[0.6875rem] text-text-tertiary mt-2">Key is stored locally in your browser only.</p>
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
          URL Scan
        </button>
        <button
          onClick={() => setMode('webflow')}
          className={`analyzer-mode-tab ${mode === 'webflow' ? 'active' : ''}`}
          style={mode === 'webflow' ? { backgroundColor: 'var(--color-phase-2)' } : {}}
        >
          <Link2 size={14} />
          Webflow Connect
        </button>
        {!showApiKey && apiKey && (
          <button
            onClick={() => setShowApiKey(true)}
            className="ml-auto text-[0.6875rem] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Change API Key
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
            Analyze
          </button>
        </div>
      )}

      {/* Webflow Mode */}
      {mode === 'webflow' && (
        <div className="analyzer-api-card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[0.8125rem] text-text-secondary">Connect to Webflow to analyze your sites directly.</p>
            <button
              onClick={fetchWebflowSites}
              disabled={webflowLoading}
              className="px-4 py-2 bg-phase-2 text-white rounded-lg text-[0.8125rem] font-medium hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center gap-2"
            >
              {webflowLoading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
              {webflowSites.length > 0 ? 'Refresh Sites' : 'Load Sites'}
            </button>
          </div>

          {webflowSites.length > 0 && (
            <div className="space-y-2">
              <p className="text-[0.625rem] text-text-tertiary font-heading uppercase tracking-[0.0625rem]">Select a site</p>
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
            <p className="text-sm font-medium text-error">Analysis Error</p>
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
          <h3 className="analyzer-empty-title">Ready to analyze</h3>
          <p className="analyzer-empty-text">
            Enter a URL or connect to Webflow to analyze your site's AEO readiness.
          </p>
        </div>
      )}

      {/* Results */}
      {results && !loading && <AnalysisResults results={results} />}
    </div>
  )
}

function AnalysisResults({ results }) {
  const scoreColor = results.overallScore >= 70 ? 'text-success' : results.overallScore >= 40 ? 'text-warning' : 'text-error'

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="analyzer-results-card fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-base font-bold">AEO Score</h3>
            <p className="text-xs text-text-tertiary">{results.url} {results.source === 'webflow' ? '(Webflow)' : '(URL Scan)'}</p>
          </div>
          <div className={`font-heading text-4xl font-bold ${scoreColor}`}>
            {results.overallScore}
          </div>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-page)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${results.overallScore}%`,
              backgroundColor: results.overallScore >= 70 ? 'var(--color-success)' : results.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
              animation: 'fill-bar 800ms ease-out forwards',
            }}
          />
        </div>
        {results.summary && (
          <p className="text-sm text-text-secondary mt-3">{results.summary}</p>
        )}
      </div>

      {/* Categories */}
      {results.categories?.map((category, catIdx) => (
        <div
          key={catIdx}
          className="analyzer-category-card fade-in-up"
          style={{ animationDelay: `${(catIdx + 1) * 80}ms` }}
        >
          <div className="analyzer-category-header">
            <h3 className="font-heading text-sm font-bold">{category.name}</h3>
          </div>
          <div>
            {category.items?.map((item, itemIdx) => {
              const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.fail
              const Icon = config.icon
              return (
                <div key={itemIdx} className="analyzer-category-item">
                  <Icon size={16} className={`${config.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{item.note}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Top Priorities */}
      {results.topPriorities?.length > 0 && (
        <div className="analyzer-priorities-card fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="font-heading text-sm font-bold mb-3 text-phase-5">Top Priorities</h3>
          <div className="space-y-2">
            {results.topPriorities.map((priority, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-heading text-xs text-phase-5 mt-0.5 w-4 text-right flex-shrink-0">{idx + 1}.</span>
                <p className="text-sm text-text-secondary">{priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function parseAnalysisJSON(text) {
  try {
    const clean = text.replace(/```json\s?|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    logger.warn('JSON parse error:', e)
  }
  return null
}
