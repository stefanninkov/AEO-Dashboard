import { useState, useCallback } from 'react'
import { PenLine, Loader2, AlertCircle, Settings, Sparkles, Copy, CheckCircle2 } from 'lucide-react'
import { callAI } from '../../utils/apiClient'
import { hasApiKey } from '../../utils/aiProvider'

export default function ContentOptimizationTab({ analyzer, activeProject, updateProject, user }) {
const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const { lastScan } = analyzer
  const apiKeyAvailable = hasApiKey()
  const seoData = activeProject?.seo || {}
  const previousOptimizations = seoData.contentOptimizations || []

  const runOptimization = useCallback(async () => {
    if (!lastScan || loading || !apiKeyAvailable) return
    setLoading(true)
    setError(null)

    const pageData = lastScan.pageData
    const seoScore = lastScan.seoScore
    const title = pageData.meta.title || ''
    const metaDesc = pageData.meta.metaDescription || ''
    const h1 = pageData.headings.list.find(h => h.level === 1)?.text || ''
    const headings = pageData.headings.list.map(h => `${'#'.repeat(h.level)} ${h.text}`).join('\n')
    const targetKeyword = seoScore?.targetKeyword || ''
    const failingChecks = seoScore?.checks?.filter(c => c.status === 'fail').map(c => `- ${c.item}: ${c.detail}`).join('\n') || 'None'

    const prompt = `You are an SEO content optimization expert. Analyze this webpage and provide actionable optimization suggestions.

Page URL: ${lastScan.url}
Current Title: ${title}
Current Meta Description: ${metaDesc}
H1: ${h1}
Target Keyword: ${targetKeyword}
Word Count: ${pageData.content.wordCount}
Internal Links: ${pageData.links.internal}
External Links: ${pageData.links.external}
Images: ${pageData.images.total} (${pageData.images.withAlt} with alt text)

Current Headings:
${headings}

Failing SEO Checks:
${failingChecks}

Provide optimization suggestions in this exact JSON format:
{
  "titleSuggestions": [
    {"original": "current title", "optimized": "suggested title", "reason": "why this is better"}
  ],
  "metaDescSuggestions": [
    {"original": "current desc", "optimized": "suggested desc (150-160 chars)", "reason": "why"}
  ],
  "headingSuggestions": [
    {"current": "current heading", "suggested": "improved heading", "reason": "why"}
  ],
  "contentGaps": [
    {"topic": "missing topic", "suggestion": "what to add", "priority": "high|medium|low"}
  ],
  "internalLinking": [
    {"suggestion": "specific internal linking opportunity", "priority": "high|medium|low"}
  ],
  "readabilityTips": [
    {"issue": "specific readability issue", "fix": "how to fix it"}
  ],
  "summary": "2-3 sentence overall content optimization strategy"
}

Be specific and actionable. Return ONLY the JSON.`

    try {
      const response = await callAI([{ role: 'user', content: prompt }], {
        maxTokens: 2500,
        temperature: 0.3,
      })

      const text = response.content || response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Invalid response format')
      const parsed = JSON.parse(jsonMatch[0])

      setResults(parsed)

      // Persist
      if (activeProject?.id) {
        const entry = { url: lastScan.url, results: parsed, timestamp: new Date().toISOString() }
        await updateProject(activeProject.id, {
          seo: {
            ...seoData,
            contentOptimizations: [...previousOptimizations, entry].slice(-20),
          },
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to generate content optimization suggestions')
    }
    setLoading(false)
  }, [lastScan, loading, apiKeyAvailable, seoData, activeProject, updateProject, previousOptimizations])

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  if (!apiKeyAvailable) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-tertiary)' }}>
        <Settings size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {'Content optimization requires an API key. Set one in Settings.'}
        </h3>
      </div>
    )
  }

  if (!lastScan) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-tertiary)' }}>
        <PenLine size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {'No SEO scans yet'}
        </h3>
        <p style={{ fontSize: '0.875rem' }}>{'Run an SEO audit first from the SEO Audit tab.'}</p>
      </div>
    )
  }

  const data = results || previousOptimizations.find(r => r.url === lastScan.url)?.results

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 0' }}>
      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {'Content Optimization'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {'AI-powered suggestions to improve your content for search engines'}
          </p>
        </div>
        <button
          onClick={runOptimization}
          disabled={loading}
          className="btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {'Optimize Content'}
        </button>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--color-error) 20%, transparent)',
          borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: '0.8125rem',
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary */}
          {data.summary && (
            <div style={{
              padding: '1rem 1.25rem', background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
              border: '0.0625rem solid color-mix(in srgb, var(--accent) 15%, transparent)',
              borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>{'Strategy'}:</strong>{' '}
              {data.summary}
            </div>
          )}

          {/* Title Suggestions */}
          {data.titleSuggestions?.length > 0 && (
            <SuggestionCard
              title={'Title Tag Suggestions'}
              items={data.titleSuggestions}
              renderItem={(item, i) => (
                <div key={i} style={{ padding: '0.75rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Current:</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{item.original}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-success)' }}>Suggested:</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{item.optimized}</span>
                    <button
                      onClick={() => copyText(item.optimized, `title-${i}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0.25rem' }}
                    >
                      {copiedField === `title-${i}` ? <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                    </button>
                  </div>
                  {item.reason && (
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>{item.reason}</p>
                  )}
                </div>
              )}
            />
          )}

          {/* Meta Description Suggestions */}
          {data.metaDescSuggestions?.length > 0 && (
            <SuggestionCard
              title={'Meta Description Suggestions'}
              items={data.metaDescSuggestions}
              renderItem={(item, i) => (
                <div key={i} style={{ padding: '0.75rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Current:</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.original}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-success)', flexShrink: 0, marginTop: '0.125rem' }}>Suggested:</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', flex: 1, lineHeight: 1.5 }}>{item.optimized}</span>
                    <button
                      onClick={() => copyText(item.optimized, `meta-${i}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0.25rem', flexShrink: 0 }}
                    >
                      {copiedField === `meta-${i}` ? <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                    </button>
                  </div>
                  {item.reason && (
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>{item.reason}</p>
                  )}
                </div>
              )}
            />
          )}

          {/* Content Gaps */}
          {data.contentGaps?.length > 0 && (
            <SuggestionCard
              title={'Content Gap Analysis'}
              items={data.contentGaps}
              renderItem={(item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                  <PriorityBadge priority={item.priority} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.topic}</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{item.suggestion}</p>
                  </div>
                </div>
              )}
            />
          )}

          {/* Internal Linking */}
          {data.internalLinking?.length > 0 && (
            <SuggestionCard
              title={'Internal Linking Opportunities'}
              items={data.internalLinking}
              renderItem={(item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                  <PriorityBadge priority={item.priority} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.suggestion}</span>
                </div>
              )}
            />
          )}

          {/* Readability Tips */}
          {data.readabilityTips?.length > 0 && (
            <SuggestionCard
              title={'Readability Improvements'}
              items={data.readabilityTips}
              renderItem={(item, i) => (
                <div key={i} style={{ padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.issue}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{item.fix}</p>
                </div>
              )}
            />
          )}
        </>
      )}
    </div>
  )
}

function SuggestionCard({ title, items, renderItem }) {
  return (
    <div style={{
      padding: '1.25rem', background: 'var(--bg-card)',
      border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
    }}>
      <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {title}
      </h4>
      {items.map(renderItem)}
    </div>
  )
}

function PriorityBadge({ priority }) {
  const colors = {
    high: 'var(--color-error)',
    medium: 'var(--color-warning)',
    low: 'var(--text-tertiary)',
  }
  const color = colors[priority] || colors.medium
  return (
    <span style={{
      fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase',
      color, padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-sm)',
      background: `color-mix(in srgb, ${color} 10%, transparent)`,
      flexShrink: 0, marginTop: '0.125rem',
    }}>
      {priority}
    </span>
  )
}
