import { useState } from 'react'
import { Code2, Loader2, Copy, Check, ChevronDown, ChevronUp, Sparkles, Trash2, Clock, AlertCircle, Plus, FileJson } from 'lucide-react'
import { callAnthropicApi } from '../utils/apiClient'
import { getAnalyzerIndustryContext } from '../utils/getRecommendations'
import { createActivity, appendActivity } from '../utils/activityLogger'
import logger from '../utils/logger'

// ─── Schema Types ────────────────────────────────────────────
const SCHEMA_TYPES = [
  {
    id: 'faqPage',
    label: 'FAQ Page',
    icon: '❓',
    description: 'FAQPage schema for question & answer sections',
    schemaType: 'FAQPage',
    prompt: (topic, context, pageUrl) => `Generate FAQPage structured data (JSON-LD) for: "${topic}"
${context ? `\nWebsite context: ${context}` : ''}
${pageUrl ? `\nPage URL: ${pageUrl}` : ''}

Generate 5-8 high-quality FAQ entries that answer engine AI systems would consider authoritative.

Return JSON in this exact format:
{
  "schemaType": "FAQPage",
  "name": "FAQ title",
  "description": "Brief description of what these FAQs cover",
  "jsonLd": { the complete JSON-LD object with @context, @type, mainEntity array },
  "implementation": "Step-by-step instructions for adding this to a webpage",
  "seoNotes": "How this schema helps with AEO and featured snippets"
}`,
  },
  {
    id: 'howTo',
    label: 'How-To',
    icon: '📋',
    description: 'HowTo schema for step-by-step instructions',
    schemaType: 'HowTo',
    prompt: (topic, context, pageUrl) => `Generate HowTo structured data (JSON-LD) for: "${topic}"
${context ? `\nWebsite context: ${context}` : ''}
${pageUrl ? `\nPage URL: ${pageUrl}` : ''}

Create a detailed how-to guide with 5-10 steps that AI answer engines can parse directly.

Return JSON in this exact format:
{
  "schemaType": "HowTo",
  "name": "How-to title",
  "description": "Brief description",
  "jsonLd": { the complete JSON-LD object with @context, @type, name, description, step array with HowToStep items },
  "implementation": "Step-by-step instructions for adding this to a webpage",
  "seoNotes": "How this schema helps with AEO and featured snippets"
}`,
  },
  {
    id: 'article',
    label: 'Article',
    icon: '📰',
    description: 'Article schema for blog posts & news articles',
    schemaType: 'Article',
    prompt: (topic, context, pageUrl) => `Generate Article structured data (JSON-LD) for: "${topic}"
${context ? `\nWebsite context: ${context}` : ''}
${pageUrl ? `\nPage URL: ${pageUrl}` : ''}

Create comprehensive Article schema that maximizes visibility in AI answer engines.

Return JSON in this exact format:
{
  "schemaType": "Article",
  "name": "Article title",
  "description": "Brief description",
  "jsonLd": { the complete JSON-LD object with @context, @type, headline, description, author, datePublished, dateModified, image, publisher },
  "implementation": "Step-by-step instructions for adding this to a webpage",
  "seoNotes": "How this schema helps with AEO and featured snippets"
}`,
  },
  {
    id: 'product',
    label: 'Product',
    icon: '🛍️',
    description: 'Product schema with offers, ratings & reviews',
    schemaType: 'Product',
    prompt: (topic, context, pageUrl) => `Generate Product structured data (JSON-LD) for: "${topic}"
${context ? `\nWebsite context: ${context}` : ''}
${pageUrl ? `\nPage URL: ${pageUrl}` : ''}

Create comprehensive Product schema with offers, aggregateRating, and review data that AI engines use for rich results.

Return JSON in this exact format:
{
  "schemaType": "Product",
  "name": "Product name",
  "description": "Brief description",
  "jsonLd": { the complete JSON-LD object with @context, @type, name, description, brand, offers, aggregateRating, review },
  "implementation": "Step-by-step instructions for adding this to a webpage",
  "seoNotes": "How this schema helps with AEO and rich results"
}`,
  },
  {
    id: 'localBusiness',
    label: 'Local Business',
    icon: '📍',
    description: 'LocalBusiness schema for physical locations',
    schemaType: 'LocalBusiness',
    prompt: (topic, context, pageUrl) => `Generate LocalBusiness structured data (JSON-LD) for: "${topic}"
${context ? `\nWebsite context: ${context}` : ''}
${pageUrl ? `\nPage URL: ${pageUrl}` : ''}

Create comprehensive LocalBusiness schema with address, hours, contact, geo coordinates, and area served.

Return JSON in this exact format:
{
  "schemaType": "LocalBusiness",
  "name": "Business name",
  "description": "Brief description",
  "jsonLd": { the complete JSON-LD object with @context, @type, name, address, telephone, openingHours, geo, areaServed },
  "implementation": "Step-by-step instructions for adding this to a webpage",
  "seoNotes": "How this schema helps with AEO and local search"
}`,
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: '🏢',
    description: 'Organization schema for company identity',
    schemaType: 'Organization',
    prompt: (topic, context, pageUrl) => `Generate Organization structured data (JSON-LD) for: "${topic}"
${context ? `\nWebsite context: ${context}` : ''}
${pageUrl ? `\nPage URL: ${pageUrl}` : ''}

Create comprehensive Organization schema with logo, contact, social profiles, and sameAs links.

Return JSON in this exact format:
{
  "schemaType": "Organization",
  "name": "Organization name",
  "description": "Brief description",
  "jsonLd": { the complete JSON-LD object with @context, @type, name, url, logo, contactPoint, sameAs, address },
  "implementation": "Step-by-step instructions for adding this to a webpage",
  "seoNotes": "How this schema helps with AEO and knowledge panels"
}`,
  },
  {
    id: 'breadcrumb',
    label: 'Breadcrumb',
    icon: '🔗',
    description: 'BreadcrumbList schema for navigation paths',
    schemaType: 'BreadcrumbList',
    prompt: (topic, context, pageUrl) => `Generate BreadcrumbList structured data (JSON-LD) for: "${topic}"
${context ? `\nWebsite context: ${context}` : ''}
${pageUrl ? `\nPage URL: ${pageUrl}` : ''}

Create BreadcrumbList schema showing the navigation hierarchy. Include 3-5 breadcrumb items representing a logical site path.

Return JSON in this exact format:
{
  "schemaType": "BreadcrumbList",
  "name": "Breadcrumb path description",
  "description": "Brief description of the page hierarchy",
  "jsonLd": { the complete JSON-LD object with @context, @type, itemListElement array with ListItem items },
  "implementation": "Step-by-step instructions for adding this to a webpage",
  "seoNotes": "How this schema helps with AEO and search appearance"
}`,
  },
  {
    id: 'video',
    label: 'Video',
    icon: '🎬',
    description: 'VideoObject schema for video content',
    schemaType: 'VideoObject',
    prompt: (topic, context, pageUrl) => `Generate VideoObject structured data (JSON-LD) for: "${topic}"
${context ? `\nWebsite context: ${context}` : ''}
${pageUrl ? `\nPage URL: ${pageUrl}` : ''}

Create comprehensive VideoObject schema with thumbnailUrl, uploadDate, duration, and description.

Return JSON in this exact format:
{
  "schemaType": "VideoObject",
  "name": "Video title",
  "description": "Brief description",
  "jsonLd": { the complete JSON-LD object with @context, @type, name, description, thumbnailUrl, uploadDate, duration, contentUrl, embedUrl },
  "implementation": "Step-by-step instructions for adding this to a webpage",
  "seoNotes": "How this schema helps with AEO and video rich results"
}`,
  },
]

// ─── Main Component ──────────────────────────────────────────
export default function SchemaGeneratorView({ activeProject, updateProject, user }) {
  const [topic, setTopic] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [selectedType, setSelectedType] = useState('faqPage')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedJsonLd, setCopiedJsonLd] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [apiKey] = useState(() => localStorage.getItem('anthropic-api-key') || '')

  const history = activeProject?.schemaHistory || []

  // ── Generate Schema ──
  const generate = async () => {
    if (!topic.trim() || loading) return
    if (!apiKey) {
      setError('Please set your Anthropic API key in the Analyzer view first.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const schemaType = SCHEMA_TYPES.find(t => t.id === selectedType)
    const context = getAnalyzerIndustryContext(activeProject?.questionnaire)

    try {
      const data = await callAnthropicApi({
        apiKey,
        maxTokens: 4000,
        system: `You are an expert in structured data and Schema.org markup for AEO (Answer Engine Optimization). You generate valid, comprehensive JSON-LD structured data that maximizes visibility in AI answer engines like Google SGE, ChatGPT, Perplexity, and Bing Chat. Always return valid JSON-LD with @context set to "https://schema.org". Never include comments in the JSON-LD.`,
        messages: [{
          role: 'user',
          content: schemaType.prompt(topic, context, pageUrl),
        }],
      })

      const textContent = data.content
        ?.filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n') || ''

      const parsed = parseJSON(textContent)
      if (parsed && parsed.jsonLd) {
        const entry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: selectedType,
          schemaType: schemaType.schemaType,
          topic,
          pageUrl,
          content: parsed,
          createdAt: new Date().toISOString(),
        }
        setResult(entry)

        // Persist to history
        const newHistory = [entry, ...history].slice(0, 50)
        updateProject(activeProject.id, { schemaHistory: newHistory })

        // Log activity
        const actEntry = createActivity('schemaGenerate', { type: selectedType, topic: topic.slice(0, 60) }, user)
        updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, actEntry) })
      } else {
        setError('Could not parse the generated schema. Please try again.')
      }
    } catch (err) {
      logger.error('Schema generator error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Copy JSON-LD ──
  const copyJsonLd = () => {
    if (!result?.content?.jsonLd) return
    const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(result.content.jsonLd, null, 2)}\n</script>`
    navigator.clipboard.writeText(scriptTag)
    setCopiedJsonLd(true)
    setTimeout(() => setCopiedJsonLd(false), 2000)
  }

  // ── Copy Raw JSON ──
  const copyRawJson = () => {
    if (!result?.content?.jsonLd) return
    navigator.clipboard.writeText(JSON.stringify(result.content.jsonLd, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── History Management ──
  const deleteHistoryItem = (id) => {
    const newHistory = history.filter(h => h.id !== id)
    updateProject(activeProject.id, { schemaHistory: newHistory })
  }

  const loadFromHistory = (entry) => {
    setResult(entry)
    setTopic(entry.topic)
    setPageUrl(entry.pageUrl || '')
    setSelectedType(entry.type)
    setShowHistory(false)
  }

  // ── Render ──
  return (
    <div className="schema-container">
      {/* Header */}
      <div className="schema-header">
        <div className="schema-header-left">
          <Code2 size={24} className="schema-header-icon" />
          <div>
            <h1 className="schema-title">Schema Markup Generator</h1>
            <p className="schema-subtitle">Generate JSON-LD structured data optimized for AI answer engines</p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            className="schema-history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock size={16} />
            History ({history.length})
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="schema-history-panel">
          {history.map(entry => {
            const type = SCHEMA_TYPES.find(t => t.id === entry.type)
            return (
              <div key={entry.id} className="schema-history-item">
                <button className="schema-history-load" onClick={() => loadFromHistory(entry)}>
                  <span className="schema-history-icon">{type?.icon || '📄'}</span>
                  <div className="schema-history-info">
                    <span className="schema-history-label">{entry.content?.name || entry.topic}</span>
                    <span className="schema-history-meta">
                      {type?.label || entry.type} · {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
                <button
                  className="schema-history-delete"
                  onClick={() => deleteHistoryItem(entry.id)}
                  aria-label="Delete history item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Type Selector */}
      <div className="schema-type-grid">
        {SCHEMA_TYPES.map(type => (
          <button
            key={type.id}
            className={`schema-type-card ${selectedType === type.id ? 'schema-type-active' : ''}`}
            onClick={() => setSelectedType(type.id)}
          >
            <span className="schema-type-icon">{type.icon}</span>
            <span className="schema-type-label">{type.label}</span>
            <span className="schema-type-desc">{type.description}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="schema-form-card">
        <div className="schema-form-row">
          <div className="schema-form-field schema-form-field-wide">
            <label className="schema-label">Topic / Subject *</label>
            <input
              type="text"
              className="schema-input"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={SCHEMA_TYPES.find(t => t.id === selectedType)?.id === 'product'
                ? 'e.g., Wireless Noise-Cancelling Headphones XM5'
                : SCHEMA_TYPES.find(t => t.id === selectedType)?.id === 'localBusiness'
                ? 'e.g., Downtown Coffee Roasters - Portland, OR'
                : 'e.g., How to optimize your website for AI search engines'}
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
          </div>
          <div className="schema-form-field">
            <label className="schema-label">Page URL (optional)</label>
            <input
              type="url"
              className="schema-input"
              value={pageUrl}
              onChange={e => setPageUrl(e.target.value)}
              placeholder="https://example.com/page"
            />
          </div>
        </div>
        <button
          className="schema-generate-btn"
          onClick={generate}
          disabled={!topic.trim() || loading || !apiKey}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="schema-spinner" />
              Generating Schema…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Schema Markup
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="schema-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="schema-loading-card">
          <Loader2 size={32} className="schema-spinner" />
          <p>Generating {SCHEMA_TYPES.find(t => t.id === selectedType)?.schemaType} structured data…</p>
          <span className="schema-loading-sub">This usually takes 10-15 seconds</span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="schema-result">
          <div className="schema-result-header">
            <div>
              <h2 className="schema-result-title">
                <FileJson size={20} />
                {result.content.name}
              </h2>
              <p className="schema-result-desc">{result.content.description}</p>
              <span className="schema-result-badge">{result.schemaType}</span>
            </div>
            <div className="schema-result-actions">
              <button className="schema-copy-btn schema-copy-script" onClick={copyJsonLd}>
                {copiedJsonLd ? <Check size={16} /> : <Copy size={16} />}
                {copiedJsonLd ? 'Copied!' : 'Copy <script> Tag'}
              </button>
              <button className="schema-copy-btn" onClick={copyRawJson}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
          </div>

          {/* JSON-LD Code Block */}
          <div className="schema-code-section">
            <div className="schema-code-label">
              <Code2 size={14} />
              JSON-LD Markup
            </div>
            <pre className="schema-code-block">
              <code>{`<script type="application/ld+json">\n${JSON.stringify(result.content.jsonLd, null, 2)}\n</script>`}</code>
            </pre>
          </div>

          {/* Implementation Guide */}
          {result.content.implementation && (
            <div className="schema-impl-section">
              <h3 className="schema-section-title">
                <Plus size={16} />
                Implementation Guide
              </h3>
              <div className="schema-impl-content">
                {result.content.implementation.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* SEO Notes */}
          {result.content.seoNotes && (
            <div className="schema-seo-section">
              <h3 className="schema-section-title">
                <Sparkles size={16} />
                AEO Impact Notes
              </h3>
              <p className="schema-seo-content">{result.content.seoNotes}</p>
            </div>
          )}

          {/* Validation Reminder */}
          <div className="schema-validation-note">
            <AlertCircle size={16} />
            <span>
              Always validate your schema at{' '}
              <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer">
                validator.schema.org
              </a>
              {' '}and test with{' '}
              <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer">
                Google Rich Results Test
              </a>
              {' '}before deploying to production.
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="schema-empty">
          <Code2 size={48} strokeWidth={1} />
          <h3>Generate Schema Markup</h3>
          <p>Select a schema type, enter your topic, and generate valid JSON-LD structured data optimized for AI answer engines.</p>
          <div className="schema-empty-types">
            {SCHEMA_TYPES.slice(0, 4).map(t => (
              <span key={t.id} className="schema-empty-tag">{t.icon} {t.label}</span>
            ))}
            <span className="schema-empty-tag">+{SCHEMA_TYPES.length - 4} more</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────
function parseJSON(text) {
  try {
    const clean = text.replace(/```json\s?|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch (e) {
    logger.warn('Schema JSON parse error:', e)
  }
  return null
}
