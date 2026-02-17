/**
 * ProjectWebflowSection — Webflow integration as a Settings sub-section.
 * Moved from standalone WebflowView into Settings.
 */
import { useState, useCallback } from 'react'
import {
  Globe, Loader2, AlertCircle, CheckCircle2, Copy, Check, RefreshCw,
  Code2, FileText, Search, Layers, ArrowRight, ExternalLink, Zap
} from 'lucide-react'
import { callAnthropicApi } from '../../utils/apiClient'
import { useToast } from '../../components/Toast'
import logger from '../../utils/logger'
import { sectionTitleStyle } from './SettingsShared'

const MCP_CONFIG = {
  mcp_servers: [{
    type: 'url',
    url: 'https://mcp.webflow.com/mcp',
    name: 'webflow-mcp',
  }],
}

const TABS = [
  { id: 'sites', label: 'My Sites', icon: Globe },
  { id: 'audit', label: 'AEO Audit', icon: Search },
  { id: 'schema', label: 'Schema Inject', icon: Code2 },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'pages', label: 'Pages', icon: Layers },
]

export default function ProjectWebflowSection({ activeProject, updateProject }) {
  const [apiKey] = useState(() => localStorage.getItem('anthropic-api-key') || '')
  const [activeTab, setActiveTab] = useState('sites')
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Audit state
  const [auditResults, setAuditResults] = useState(null)
  const [auditLoading, setAuditLoading] = useState(false)

  // Schema inject state
  const [schemaCode, setSchemaCode] = useState('')
  const [schemaLoading, setSchemaLoading] = useState(false)
  const [schemaCopied, setSchemaCopied] = useState(false)

  // Content state
  const [contentResult, setContentResult] = useState('')
  const [contentLoading, setContentLoading] = useState(false)
  const [contentType, setContentType] = useState('faq')
  const [contentTopic, setContentTopic] = useState('')
  const [contentCopied, setContentCopied] = useState(false)

  // Pages state
  const [pages, setPages] = useState([])
  const [pagesLoading, setPagesLoading] = useState(false)

  const { addToast } = useToast()

  const webflowSiteId = activeProject?.webflowSiteId || ''

  // ── Fetch Sites ──
  const handleFetchSites = useCallback(async () => {
    if (!apiKey) { setError('Add your Anthropic API key in Settings first.'); return }
    setLoading(true)
    setError(null)
    try {
      const data = await callAnthropicApi({
        apiKey,
        messages: [{
          role: 'user',
          content: 'List all my Webflow sites with their site IDs, names, and domains. Return ONLY valid JSON: [{"id":"...","name":"...","domain":"..."}]',
        }],
        extraBody: MCP_CONFIG,
      })
      const text = data.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || ''
      const clean = text.replace(/```json\s?|```/g, '').trim()
      const match = clean.match(/\[[\s\S]*\]/)
      if (match) {
        const parsed = JSON.parse(match[0])
        setSites(parsed)
        if (parsed.length > 0) addToast('success', `Found ${parsed.length} Webflow site${parsed.length !== 1 ? 's' : ''}`)
      } else {
        setSites([])
        setError('Could not parse sites. You may need to authenticate with Webflow via the MCP.')
      }
    } catch (err) {
      logger.error('Webflow fetch:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [apiKey, addToast])

  // ── Select Site ──
  const handleSelectSite = (site) => {
    setSelectedSite(site)
    if (activeProject && site.id !== webflowSiteId) {
      updateProject(activeProject.id, { webflowSiteId: site.id })
    }
    addToast('info', `Selected: ${site.name}`)
  }

  // ── AEO Audit ──
  const handleAudit = useCallback(async () => {
    if (!selectedSite) { setError('Select a site first.'); return }
    if (!apiKey) { setError('Add your Anthropic API key in Settings.'); return }
    setAuditLoading(true)
    setAuditResults(null)
    setError(null)
    try {
      const data = await callAnthropicApi({
        apiKey,
        maxTokens: 8000,
        messages: [{
          role: 'user',
          content: `Perform a deep AEO (Answer Engine Optimization) audit on the Webflow site "${selectedSite.name}" (ID: ${selectedSite.id}).

Analyze:
1. Schema markup on all pages (FAQPage, HowTo, Article, Organization, BreadcrumbList)
2. Content structure — are pages using clear headings, Q&A format, concise answers?
3. Meta tags — title, description, Open Graph, canonical tags
4. Technical — page speed signals, mobile readiness, sitemap, robots.txt
5. Authority — author bylines, credentials, external citations, about pages
6. AI-readiness — content that directly answers questions, structured data quality

Return ONLY valid JSON:
{
  "siteName": "${selectedSite.name}",
  "overallScore": 0-100,
  "sections": [
    {
      "name": "Schema Markup",
      "score": 0-100,
      "status": "pass|partial|fail",
      "findings": ["Finding 1", "Finding 2"],
      "recommendations": ["Recommendation 1"]
    }
  ],
  "topPriorities": ["Priority 1", "Priority 2", "Priority 3"],
  "summary": "Brief summary of the audit"
}`,
        }],
        extraBody: MCP_CONFIG,
      })
      const text = data.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || ''
      const clean = text.replace(/```json\s?|```/g, '').trim()
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        setAuditResults(parsed)
        addToast('success', `Audit complete: ${parsed.overallScore}/100`)
        if (activeProject) {
          updateProject(activeProject.id, {
            webflowAudit: { ...parsed, date: new Date().toISOString() },
          })
        }
      } else {
        setError('Could not parse audit results.')
      }
    } catch (err) {
      logger.error('Webflow audit:', err)
      setError(err.message)
    } finally {
      setAuditLoading(false)
    }
  }, [selectedSite, apiKey, activeProject, updateProject, addToast])

  // ── Schema Inject ──
  const handleGenerateSchema = useCallback(async () => {
    if (!selectedSite) { setError('Select a site first.'); return }
    if (!apiKey) return
    setSchemaLoading(true)
    setSchemaCode('')
    setError(null)
    try {
      const data = await callAnthropicApi({
        apiKey,
        maxTokens: 6000,
        messages: [{
          role: 'user',
          content: `For the Webflow site "${selectedSite.name}" (ID: ${selectedSite.id}), generate comprehensive JSON-LD schema markup for AEO optimization.

Include all applicable schema types:
- Organization (with logo, social profiles, contact)
- WebSite (with SearchAction)
- BreadcrumbList (for main navigation)
- FAQPage (if the site has FAQ content)
- Article/BlogPosting (if blog exists)
- LocalBusiness (if applicable)

Return ONLY the complete <script type="application/ld+json"> block(s) that should be added to the site's custom code in Webflow.
Include a comment explaining where to paste it in Webflow (Settings > Custom Code > Head Code).`,
        }],
        extraBody: MCP_CONFIG,
      })
      const text = data.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || ''
      setSchemaCode(text)
      addToast('success', 'Schema markup generated')
    } catch (err) {
      logger.error('Schema generate:', err)
      setError(err.message)
    } finally {
      setSchemaLoading(false)
    }
  }, [selectedSite, apiKey, addToast])

  // ── Content Generation ──
  const handleGenerateContent = useCallback(async () => {
    if (!selectedSite) { setError('Select a site first.'); return }
    if (!apiKey || !contentTopic.trim()) return
    setContentLoading(true)
    setContentResult('')
    setError(null)

    const typePrompts = {
      faq: `Generate 8-10 FAQ questions and answers about "${contentTopic}" optimized for AI citations. Format as clean HTML that can be pasted into a Webflow Rich Text element. Include proper heading tags and structured Q&A format.`,
      'how-to': `Generate a detailed how-to guide about "${contentTopic}" optimized for AI answer engines. Format as clean HTML with numbered steps, clear headings, and concise actionable steps. Suitable for Webflow Rich Text.`,
      comparison: `Generate a comparison/vs article about "${contentTopic}" optimized for AI citations. Include a comparison table in HTML, pros/cons lists, and a clear verdict. Format for Webflow Rich Text.`,
      glossary: `Generate a glossary of key terms related to "${contentTopic}" with concise, authoritative definitions. Format as HTML definition list suitable for Webflow Rich Text. Optimize each definition to be directly citable by AI engines.`,
    }

    try {
      const data = await callAnthropicApi({
        apiKey,
        maxTokens: 6000,
        messages: [{
          role: 'user',
          content: `For the Webflow site "${selectedSite.name}": ${typePrompts[contentType]}

The content should be:
- Directly answerable by AI engines (clear, concise, authoritative)
- Properly structured with H2/H3 headings
- Ready to paste into Webflow's Rich Text editor or Embed element`,
        }],
        extraBody: MCP_CONFIG,
      })
      const text = data.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || ''
      setContentResult(text)
      addToast('success', 'Content generated')
    } catch (err) {
      logger.error('Content generate:', err)
      setError(err.message)
    } finally {
      setContentLoading(false)
    }
  }, [selectedSite, apiKey, contentTopic, contentType, addToast])

  // ── Fetch Pages ──
  const handleFetchPages = useCallback(async () => {
    if (!selectedSite) { setError('Select a site first.'); return }
    if (!apiKey) return
    setPagesLoading(true)
    setPages([])
    setError(null)
    try {
      const data = await callAnthropicApi({
        apiKey,
        maxTokens: 6000,
        messages: [{
          role: 'user',
          content: `List all pages of the Webflow site "${selectedSite.name}" (ID: ${selectedSite.id}).

For each page, check:
1. Does it have proper meta title and description?
2. Does it have any schema markup?
3. Is the content structured for AI readability?

Return ONLY valid JSON:
[{
  "title": "Page Title",
  "slug": "/page-slug",
  "hasMeta": true/false,
  "hasSchema": true/false,
  "aeoScore": 0-100,
  "issue": "Brief issue description or null"
}]`,
        }],
        extraBody: MCP_CONFIG,
      })
      const text = data.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || ''
      const clean = text.replace(/```json\s?|```/g, '').trim()
      const match = clean.match(/\[[\s\S]*\]/)
      if (match) {
        setPages(JSON.parse(match[0]))
        addToast('success', 'Pages loaded')
      }
    } catch (err) {
      logger.error('Pages fetch:', err)
      setError(err.message)
    } finally {
      setPagesLoading(false)
    }
  }, [selectedSite, apiKey, addToast])

  // ── Copy Helper ──
  const handleCopy = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text)
      setter(true)
      setTimeout(() => setter(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const scoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)'
    if (score >= 50) return 'var(--color-phase-5)'
    return 'var(--color-error)'
  }

  const statusBadge = (status) => {
    const colors = {
      pass: { bg: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' },
      partial: { bg: 'rgba(245,158,11,0.1)', color: 'var(--color-phase-5)' },
      fail: { bg: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' },
    }
    const c = colors[status] || colors.fail
    return (
      <span style={{
        fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
        padding: '0.125rem 0.5rem', borderRadius: '1rem',
        background: c.bg, color: c.color,
      }}>
        {status}
      </span>
    )
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Section Title */}
      <div style={sectionTitleStyle}>
        <Globe size={15} />
        Webflow
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', padding: '0 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
                background: 'none', border: 'none', borderBottom: `2px solid ${isActive ? 'var(--color-phase-1)' : 'transparent'}`,
                color: isActive ? 'var(--color-phase-1)' : 'var(--text-tertiary)',
                transition: 'all 150ms',
                marginBottom: '-1px',
              }}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid var(--border-subtle)' }}>
          <AlertCircle size={14} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{error}</p>
        </div>
      )}

      {/* ═══ TAB: My Sites ═══ */}
      {activeTab === 'sites' && (
        <div style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Connected Sites
              </h4>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                Load your Webflow sites via MCP connection
              </p>
            </div>
            <button
              onClick={handleFetchSites}
              disabled={loading}
              className="btn-primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
            >
              {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />}
              {sites.length > 0 ? 'Refresh' : 'Load Sites'}
            </button>
          </div>

          {sites.length === 0 && !loading && (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <Globe size={28} style={{ color: 'var(--text-disabled)', margin: '0 auto 0.625rem' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                No sites loaded. Click "Load Sites" to connect to your Webflow account.
              </p>
              <p style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.375rem' }}>
                Requires an Anthropic API key and Webflow MCP authentication.
              </p>
            </div>
          )}

          {sites.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {sites.map((site, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSite(site)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.75rem 0.875rem', borderRadius: '0.5rem',
                    border: `1px solid ${selectedSite?.id === site.id ? 'var(--color-phase-1)' : 'var(--border-subtle)'}`,
                    background: selectedSite?.id === site.id ? 'rgba(255,107,53,0.06)' : 'var(--hover-bg)',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'all 150ms',
                  }}
                >
                  <Globe size={14} style={{ color: selectedSite?.id === site.id ? 'var(--color-phase-1)' : 'var(--text-tertiary)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{site.name}</p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>{site.domain || site.id}</p>
                  </div>
                  {selectedSite?.id === site.id && (
                    <CheckCircle2 size={14} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedSite && (
            <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--bg-hover)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>
                Active Site
              </p>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedSite.name}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontFamily: '"JetBrains Mono", monospace' }}>{selectedSite.id}</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: AEO Audit ═══ */}
      {activeTab === 'audit' && (
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Webflow AEO Audit
              </h4>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                {selectedSite ? `Audit "${selectedSite.name}" for AEO readiness` : 'Select a site from My Sites tab first'}
              </p>
            </div>
            <button
              onClick={handleAudit}
              disabled={!selectedSite || auditLoading}
              className="btn-primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
            >
              {auditLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={12} />}
              {auditLoading ? 'Auditing...' : 'Run Audit'}
            </button>
          </div>

          {auditResults && (
            <>
              {/* Score */}
              <div style={{ padding: '0.875rem', background: 'var(--hover-bg)', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>AEO Score</h4>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{auditResults.siteName}</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: scoreColor(auditResults.overallScore) }}>
                    {auditResults.overallScore}
                  </span>
                </div>
                <div style={{ height: '0.25rem', borderRadius: '1rem', background: 'var(--border-subtle)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '1rem', width: `${auditResults.overallScore}%`, background: scoreColor(auditResults.overallScore), transition: 'width 600ms ease-out' }} />
                </div>
                {auditResults.summary && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>{auditResults.summary}</p>
                )}
              </div>

              {/* Top Priorities */}
              {auditResults.topPriorities?.length > 0 && (
                <div style={{ padding: '0.875rem', background: 'var(--hover-bg)', borderRadius: '0.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Zap size={12} style={{ color: 'var(--color-phase-1)' }} />
                    Top Priorities
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {auditResults.topPriorities.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.6875rem', color: 'var(--color-phase-1)', minWidth: '1rem' }}>{i + 1}.</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections */}
              {auditResults.sections?.map((section, idx) => (
                <div key={idx} style={{ padding: '0.875rem', background: 'var(--hover-bg)', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {section.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {statusBadge(section.status)}
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8125rem', color: scoreColor(section.score) }}>
                        {section.score}
                      </span>
                    </div>
                  </div>
                  {section.findings?.length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>Findings</p>
                      {section.findings.map((f, i) => (
                        <p key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.125rem 0', lineHeight: 1.5 }}>• {f}</p>
                      ))}
                    </div>
                  )}
                  {section.recommendations?.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-phase-1)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>Recommendations</p>
                      {section.recommendations.map((r, i) => (
                        <p key={i} style={{ fontSize: '0.75rem', color: 'var(--color-phase-1)', padding: '0.125rem 0', lineHeight: 1.5 }}>{r}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ═══ TAB: Schema Inject ═══ */}
      {activeTab === 'schema' && (
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Schema Markup Generator
              </h4>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                {selectedSite ? `Generate JSON-LD for "${selectedSite.name}"` : 'Select a site first'}
              </p>
            </div>
            <button
              onClick={handleGenerateSchema}
              disabled={!selectedSite || schemaLoading}
              className="btn-primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
            >
              {schemaLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Code2 size={12} />}
              {schemaLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {!schemaCode && !schemaLoading && (
            <div style={{ padding: '1.25rem', textAlign: 'center' }}>
              <Code2 size={24} style={{ color: 'var(--text-disabled)', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Generate schema markup tailored to your Webflow site's content.
              </p>
              <p style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>
                Copy the generated code to Webflow Project Settings &gt; Custom Code &gt; Head Code
              </p>
            </div>
          )}

          {schemaCode && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Generated Schema</h4>
                <button
                  onClick={() => handleCopy(schemaCode, setSchemaCopied)}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.625rem', fontSize: '0.625rem' }}
                >
                  {schemaCopied ? <Check size={10} /> : <Copy size={10} />}
                  {schemaCopied ? 'Copied!' : 'Copy All'}
                </button>
              </div>
              <pre style={{
                fontSize: '0.6875rem', fontFamily: '"JetBrains Mono", monospace',
                background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                borderRadius: '0.5rem', padding: '0.875rem', overflow: 'auto',
                maxHeight: '20rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {schemaCode}
              </pre>
              <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,107,53,0.06)', borderRadius: '0.375rem', border: '1px solid rgba(255,107,53,0.15)' }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-phase-1)', fontWeight: 500 }}>
                  <ArrowRight size={10} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  Paste in Webflow: Project Settings &gt; Custom Code &gt; Head Code
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ TAB: Content ═══ */}
      {activeTab === 'content' && (
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            AEO Content for Webflow
          </h4>

          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {[
              { id: 'faq', label: 'FAQ Section' },
              { id: 'how-to', label: 'How-To Guide' },
              { id: 'comparison', label: 'Comparison' },
              { id: 'glossary', label: 'Glossary' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setContentType(t.id)}
                style={{
                  padding: '0.3125rem 0.625rem', borderRadius: '0.375rem', border: 'none',
                  background: contentType === t.id ? 'var(--color-phase-1)' : 'var(--hover-bg)',
                  color: contentType === t.id ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', transition: 'all 150ms',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input-field"
              value={contentTopic}
              onChange={e => setContentTopic(e.target.value)}
              placeholder="Enter a topic..."
              style={{ flex: 1, fontSize: '0.75rem' }}
              onKeyDown={e => e.key === 'Enter' && contentTopic.trim() && !contentLoading && handleGenerateContent()}
            />
            <button
              onClick={handleGenerateContent}
              disabled={!selectedSite || !contentTopic.trim() || contentLoading}
              className="btn-primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', flexShrink: 0 }}
            >
              {contentLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={12} />}
              {contentLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {!selectedSite && (
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Select a site from the My Sites tab first.
            </p>
          )}

          {contentResult && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Generated Content
                </h4>
                <button
                  onClick={() => handleCopy(contentResult, setContentCopied)}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.625rem', fontSize: '0.625rem' }}
                >
                  {contentCopied ? <Check size={10} /> : <Copy size={10} />}
                  {contentCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre style={{
                fontSize: '0.6875rem', fontFamily: '"JetBrains Mono", monospace',
                background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                borderRadius: '0.5rem', padding: '0.875rem', overflow: 'auto',
                maxHeight: '20rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {contentResult}
              </pre>
              <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,107,53,0.06)', borderRadius: '0.375rem', border: '1px solid rgba(255,107,53,0.15)' }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-phase-1)', fontWeight: 500 }}>
                  <ArrowRight size={10} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  Paste in Webflow: Add an Embed or Rich Text element
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ TAB: Pages ═══ */}
      {activeTab === 'pages' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Page-Level AEO Analysis</h4>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                {selectedSite ? `Analyze every page of "${selectedSite.name}"` : 'Select a site first'}
              </p>
            </div>
            <button
              onClick={handleFetchPages}
              disabled={!selectedSite || pagesLoading}
              className="btn-primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
            >
              {pagesLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Layers size={12} />}
              {pagesLoading ? 'Scanning...' : 'Scan Pages'}
            </button>
          </div>

          {pages.length > 0 && (
            <>
              {/* Table Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 4rem 4rem 3.5rem auto',
                padding: '0.5rem 1.25rem', borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: 'var(--text-disabled)',
                fontFamily: 'var(--font-heading)',
              }}>
                <span>Page</span>
                <span style={{ textAlign: 'center' }}>Meta</span>
                <span style={{ textAlign: 'center' }}>Schema</span>
                <span style={{ textAlign: 'center' }}>Score</span>
                <span>Issue</span>
              </div>

              {pages.map((page, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 4rem 4rem 3.5rem auto',
                    padding: '0.5rem 1.25rem', alignItems: 'center',
                    borderBottom: i < pages.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {page.title || page.slug}
                    </p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontFamily: '"JetBrains Mono", monospace' }}>{page.slug}</p>
                  </div>
                  <span style={{ textAlign: 'center' }}>
                    {page.hasMeta ? <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} /> : <AlertCircle size={12} style={{ color: 'var(--color-error)' }} />}
                  </span>
                  <span style={{ textAlign: 'center' }}>
                    {page.hasSchema ? <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} /> : <AlertCircle size={12} style={{ color: 'var(--color-error)' }} />}
                  </span>
                  <span style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.75rem', color: scoreColor(page.aeoScore) }}>
                    {page.aeoScore}
                  </span>
                  <p style={{ fontSize: '0.6875rem', color: page.issue ? 'var(--color-phase-5)' : 'var(--text-tertiary)' }}>
                    {page.issue || '—'}
                  </p>
                </div>
              ))}
            </>
          )}

          {pages.length === 0 && !pagesLoading && (
            <div style={{ padding: '1.5rem 1.25rem', textAlign: 'center' }}>
              <Layers size={24} style={{ color: 'var(--text-disabled)', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {selectedSite ? 'Click "Scan Pages" to analyze your site' : 'Select a site from My Sites tab first'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
