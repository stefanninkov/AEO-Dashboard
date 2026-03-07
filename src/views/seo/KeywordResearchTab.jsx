import { useState, useCallback } from 'react'
import { KeyRound, Loader2, AlertCircle, Settings, Sparkles, Copy, CheckCircle2 } from 'lucide-react'
import { callAI } from '../../utils/apiClient'
import { hasApiKey } from '../../utils/aiProvider'

export default function KeywordResearchTab({ analyzer, activeProject, updateProject, user }) {
const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [copiedIdx, setCopiedIdx] = useState(null)

  const { lastScan } = analyzer
  const apiKeyAvailable = hasApiKey()
  const seoData = activeProject?.seo || {}

  // Load previous results
  const previousResearch = seoData.keywordResearch || []

  const runResearch = useCallback(async () => {
    if (!lastScan || loading || !apiKeyAvailable) return
    setLoading(true)
    setError(null)

    const pageData = lastScan.pageData
    const title = pageData.meta.title || ''
    const h1 = pageData.headings.list.find(h => h.level === 1)?.text || ''
    const metaDesc = pageData.meta.metaDescription || ''
    const headings = pageData.headings.list.map(h => `${'#'.repeat(h.level)} ${h.text}`).join('\n')
    const targetKeyword = lastScan.seoScore?.targetKeyword || ''

    const prompt = `Analyze this webpage and provide SEO keyword research.

Page URL: ${lastScan.url}
Title: ${title}
H1: ${h1}
Meta Description: ${metaDesc}
Detected Target Keyword: ${targetKeyword}
Word Count: ${pageData.content.wordCount}
Headings:
${headings}

Provide keyword research in this exact JSON format:
{
  "primaryKeyword": "the main keyword this page should target",
  "keywords": [
    {
      "keyword": "keyword phrase",
      "intent": "informational|transactional|navigational|commercial",
      "difficulty": "low|medium|high",
      "relevance": "high|medium|low",
      "type": "primary|secondary|long-tail|question"
    }
  ],
  "clusters": [
    {
      "topic": "cluster topic name",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "questions": ["question keyword 1?", "question keyword 2?"],
  "suggestions": "Brief actionable suggestion for keyword strategy (2-3 sentences)"
}

Return 15-20 keywords total across all types. Include 5+ question-based keywords.
Return ONLY the JSON, no markdown.`

    try {
      const response = await callAI([{ role: 'user', content: prompt }], {
        maxTokens: 2000,
        temperature: 0.3,
      })

      const text = response.content || response
      // Parse JSON from response
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
            keywordResearch: [...previousResearch, entry].slice(-20),
          },
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to generate keyword research')
    }
    setLoading(false)
  }, [lastScan, loading, apiKeyAvailable, seoData, activeProject, updateProject, previousResearch])

  const copyKeyword = (kw, idx) => {
    navigator.clipboard.writeText(kw)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  // No API key
  if (!apiKeyAvailable) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-tertiary)' }}>
        <Settings size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {'Keyword research requires an API key. Set one in Settings.'}
        </h3>
      </div>
    )
  }

  // No scan
  if (!lastScan) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-tertiary)' }}>
        <KeyRound size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {'No keyword research yet'}
        </h3>
        <p style={{ fontSize: '0.875rem' }}>{'Scan a page first, then use AI to find keyword opportunities.'}</p>
      </div>
    )
  }

  const intentColors = {
    informational: 'var(--color-phase-1)',
    transactional: 'var(--color-success)',
    navigational: 'var(--accent)',
    commercial: 'var(--color-warning)',
  }

  const data = results || previousResearch.find(r => r.url === lastScan.url)?.results

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 0' }}>
      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {'Keyword Research'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {'AI-powered keyword suggestions based on your content'}
          </p>
        </div>
        <button
          onClick={runResearch}
          disabled={loading}
          className="btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {'Extract Keywords'}
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
          {/* Primary keyword */}
          {data.primaryKeyword && (
            <div style={{
              padding: '1rem 1.25rem', background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
              border: '0.0625rem solid color-mix(in srgb, var(--accent) 15%, transparent)',
              borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <KeyRound size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{'Primary Keyword'}:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                {data.primaryKeyword}
              </span>
            </div>
          )}

          {/* Keywords table */}
          {data.keywords?.length > 0 && (
            <div style={{
              padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', overflow: 'auto',
            }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {'Keyword Suggestions'} ({data.keywords.length})
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.6875rem' }}>Keyword</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.6875rem' }}>Intent</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.6875rem' }}>Difficulty</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.6875rem' }}>Type</th>
                    <th style={{ width: '2rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.keywords.map((kw, i) => (
                    <tr key={i} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {kw.keyword}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span style={{
                          fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase',
                          color: intentColors[kw.intent] || 'var(--text-tertiary)',
                          padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-sm)',
                          background: `color-mix(in srgb, ${intentColors[kw.intent] || 'var(--text-tertiary)'} 10%, transparent)`,
                        }}>
                          {kw.intent}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{kw.difficulty}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{kw.type}</td>
                      <td style={{ padding: '0.5rem 0.25rem' }}>
                        <button
                          onClick={() => copyKeyword(kw.keyword, i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0.25rem' }}
                          title="Copy"
                        >
                          {copiedIdx === i ? <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Clusters */}
          {data.clusters?.length > 0 && (
            <div style={{
              padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {'Keyword Clusters'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '0.75rem' }}>
                {data.clusters.map((cluster, i) => (
                  <div key={i} style={{
                    padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)',
                    border: '0.0625rem solid var(--border-subtle)',
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.375rem' }}>
                      {cluster.topic}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {cluster.keywords.map((kw, j) => (
                        <span key={j} style={{
                          fontSize: '0.6875rem', padding: '0.125rem 0.375rem',
                          background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                          borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
                        }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          {data.questions?.length > 0 && (
            <div style={{
              padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {'Question Keywords'}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {data.questions.map((q, i) => (
                  <li key={i} style={{
                    fontSize: '0.8125rem', color: 'var(--text-secondary)',
                    padding: '0.375rem 0.5rem', background: 'var(--bg-page)',
                    borderRadius: 'var(--radius-sm)', border: '0.0625rem solid var(--border-subtle)',
                  }}>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {data.suggestions && (
            <div style={{
              padding: '1rem 1.25rem', background: 'color-mix(in srgb, var(--color-success) 6%, transparent)',
              border: '0.0625rem solid color-mix(in srgb, var(--color-success) 15%, transparent)',
              borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem', color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>{'Strategy Suggestion'}:</strong>{' '}
              {data.suggestions}
            </div>
          )}
        </>
      )}
    </div>
  )
}
