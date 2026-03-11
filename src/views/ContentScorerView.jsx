/**
 * ContentScorerView — Paste text content, get an AI Answerability Score.
 *
 * Evaluates content across 5 dimensions: clarity, structure, comprehensiveness,
 * authority, and natural language. Uses the same callAI pipeline as other tools.
 */
import { useState, useCallback, useRef } from 'react'
import {
  Star, Loader2, AlertCircle, Copy, Check,
  MessageSquare, Layers, BookOpen, Shield, Sparkles, Globe, FileText,
} from 'lucide-react'
import { callAI } from '../utils/apiClient'
import { hasApiKey } from '../utils/aiProvider'
import { fetchPageHtml, parsePageData } from '../utils/htmlCrawler'
import { useScrollActiveTab } from '../hooks/useScrollActiveTab'

const DIMENSIONS = [
  { key: 'clarity', icon: MessageSquare, color: 'var(--color-phase-1)' },
  { key: 'structure', icon: Layers, color: 'var(--color-phase-2)' },
  { key: 'comprehensiveness', icon: BookOpen, color: 'var(--color-phase-3)' },
  { key: 'authority', icon: Shield, color: 'var(--color-phase-4)' },
  { key: 'naturalLanguage', icon: Sparkles, color: 'var(--color-phase-5)' },
]

function getScoreColor(score) {
  if (score >= 70) return 'var(--color-success)'
  if (score >= 40) return 'var(--color-warning)'
  return 'var(--color-error)'
}

function ScoreRing({ score, size = 6 }) {
  const r = (size * 16 - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = getScoreColor(score)

  return (
    <div style={{ width: `${size}rem`, height: `${size}rem`, position: 'relative' }}>
      <svg viewBox={`0 0 ${size * 16} ${size * 16}`} style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
        <circle
          cx={size * 8} cy={size * 8} r={r}
          fill="none" stroke="var(--border-subtle)" strokeWidth="4"
        />
        <circle
          cx={size * 8} cy={size * 8} r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xl)', color }}>
          {score}
        </span>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>/100</span>
      </div>
    </div>
  )
}

function parseJSON(text) {
  try {
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    const raw = fenceMatch ? fenceMatch[1].trim() : text.trim()
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function ContentScorerView({ activeProject }) {
const [scorerMode, setScorerMode] = useState('text') // 'text' | 'url'
  const modeTabsRef = useRef(null)
  useScrollActiveTab(modeTabsRef, scorerMode)
  const [text, setText] = useState('')
  const [urlInput, setUrlInput] = useState(activeProject?.url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const loadingRef = useRef(false)

  const scoreContent = useCallback(async () => {
    if (!text.trim() || loadingRef.current) return
    if (!hasApiKey()) {
      setError('Please set your API key in Settings first.')
      return
    }

    setLoading(true)
    loadingRef.current = true
    setError(null)
    setResult(null)

    try {
      const industry = activeProject?.questionnaire?.industry || ''
      const context = industry ? `Industry context: ${industry}.` : ''

      const data = await callAI({
        maxTokens: 2000,
        system: `You are an AI content scoring expert specializing in Answer Engine Optimization (AEO).
Evaluate how well AI assistants (ChatGPT, Perplexity, Gemini, Claude) can extract and cite answers from content.
${context}
Return ONLY valid JSON — no markdown fences, no explanation outside JSON.`,
        messages: [{
          role: 'user',
          content: `Score this content for AEO answerability (0-100):

"""
${text.slice(0, 8000)}
"""

Return JSON:
{
  "overallScore": <number 0-100>,
  "scoreBreakdown": {
    "clarity": { "score": <0-100>, "feedback": "<1 sentence>" },
    "structure": { "score": <0-100>, "feedback": "<1 sentence>" },
    "comprehensiveness": { "score": <0-100>, "feedback": "<1 sentence>" },
    "authority": { "score": <0-100>, "feedback": "<1 sentence>" },
    "naturalLanguage": { "score": <0-100>, "feedback": "<1 sentence>" }
  },
  "improvements": ["<top 3-5 specific improvements>"],
  "aiCitationExample": "<How an AI might cite this content in an answer>"
}`,
        }],
      })

      const parsed = parseJSON(data.text)
      if (parsed?.overallScore !== undefined) {
        setResult(parsed)
      } else {
        setError('Could not parse the scoring results. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [text, activeProject])

  const scoreUrl = useCallback(async () => {
    if (!urlInput.trim() || loadingRef.current) return
    if (!hasApiKey()) {
      setError('Please set your API key in Settings first.')
      return
    }

    setLoading(true)
    loadingRef.current = true
    setError(null)
    setResult(null)

    try {
      const html = await fetchPageHtml(urlInput)
      const pageData = parsePageData(html, urlInput)
      // Extract main content text from the parsed page
      const main = html.replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000)

      const industry = activeProject?.questionnaire?.industry || ''
      const context = industry ? `Industry context: ${industry}.` : ''

      const data = await callAI({
        maxTokens: 2000,
        system: `You are an AI content scoring expert specializing in Answer Engine Optimization (AEO).
Evaluate how well AI assistants (ChatGPT, Perplexity, Gemini, Claude) can extract and cite answers from content.
${context}
Additional page data: ${pageData.headings.totalCount} headings, ${pageData.content.wordCount} words, ${pageData.schema.count} schema(s) found, ${pageData.content.qaPatterns.hasQuestionHeadings ? 'has' : 'no'} question headings.
Return ONLY valid JSON — no markdown fences, no explanation outside JSON.`,
        messages: [{
          role: 'user',
          content: `Score this web page content for AEO answerability (0-100):

URL: ${urlInput}

Content:
"""
${main}
"""

Return JSON:
{
  "overallScore": <number 0-100>,
  "scoreBreakdown": {
    "clarity": { "score": <0-100>, "feedback": "<1 sentence>" },
    "structure": { "score": <0-100>, "feedback": "<1 sentence>" },
    "comprehensiveness": { "score": <0-100>, "feedback": "<1 sentence>" },
    "authority": { "score": <0-100>, "feedback": "<1 sentence>" },
    "naturalLanguage": { "score": <0-100>, "feedback": "<1 sentence>" }
  },
  "improvements": ["<top 3-5 specific improvements>"],
  "aiCitationExample": "<How an AI might cite this content in an answer>"
}`,
        }],
      })

      const parsed = parseJSON(data.text)
      if (parsed?.overallScore !== undefined) {
        setResult(parsed)
      } else {
        setError('Could not parse the scoring results. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [urlInput, activeProject])

  const handleCopy = () => {
    if (!result) return
    const summary = `AEO Answerability Score: ${result.overallScore}/100\n\n` +
      DIMENSIONS.map(d => `${d.key}: ${result.scoreBreakdown?.[d.key]?.score}/100 — ${result.scoreBreakdown?.[d.key]?.feedback}`).join('\n') +
      `\n\nImprovements:\n${(result.improvements || []).map(s => `• ${s}`).join('\n')}` +
      `\n\nAI Citation Example:\n${result.aiCitationExample || '—'}`
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">{'Content Scorer'}</h2>
          <p className="view-subtitle">{'Paste text content and get an AI Answerability Score across 5 dimensions.'}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div ref={modeTabsRef} className="scrollable-tabs tab-bar-segmented">
        <button
          data-active={scorerMode === 'text' || undefined}
          onClick={() => setScorerMode('text')}
          className="tab-segmented"
        >
          <FileText size={14} />
          Paste Text
        </button>
        <button
          data-active={scorerMode === 'url' || undefined}
          onClick={() => setScorerMode('url')}
          className="tab-segmented"
        >
          <Globe size={14} />
          Score URL
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
        {/* Input Panel */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {scorerMode === 'text' ? (
            <>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
              }}>
                {'Paste Your Content'}
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={'Paste your article, page copy, or any text content here to score its AI answerability...'}
                className="input-field"
                style={{
                  width: '100%', minHeight: '14rem', resize: 'vertical',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.6,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>
                  {text.length.toLocaleString()} {'characters'}
                </span>
                <button
                  onClick={scoreContent}
                  disabled={!text.trim() || loading}
                  className="btn-primary btn-sm"
                  style={{ minWidth: '7rem' }}
                >
                  {loading ? (
                    <><Loader2 size={13} className="spin" /> {'Scoring…'}</>
                  ) : (
                    <><Star size={13} /> {'Score Content'}</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
              }}>
                Score a URL
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                Enter a URL to fetch its content and score it for AI answerability. The page will be crawled and its text content extracted automatically.
              </p>
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="input-field"
                style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}
                onKeyDown={e => e.key === 'Enter' && scoreUrl()}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={scoreUrl}
                  disabled={!urlInput.trim() || loading}
                  className="btn-primary btn-sm"
                  style={{ minWidth: '7rem' }}
                >
                  {loading ? (
                    <><Loader2 size={13} className="spin" /> {'Scoring…'}</>
                  ) : (
                    <><Globe size={13} /> Score URL</>
                  )}
                </button>
              </div>
            </>
          )}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.08)', color: 'var(--color-error)',
              fontSize: 'var(--text-xs)',
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Results Panel */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} className="fade-in-up">
            {/* Overall Score */}
            <div className="card" style={{
              padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'var(--space-3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
                }}>
                  {'Answerability Score'}
                </span>
                <button onClick={handleCopy} className="btn-ghost btn-sm" style={{ fontSize: 'var(--text-2xs)' }}>
                  {copied ? <><Check size={11} /> {'Copied!'}</> : <><Copy size={11} /> {'Copy'}</>}
                </button>
              </div>
              <ScoreRing score={result.overallScore} />
            </div>

            {/* Dimension Breakdown */}
            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-3)',
              }}>
                {'Dimension Breakdown'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {DIMENSIONS.map(dim => {
                  const d = result.scoreBreakdown?.[dim.key]
                  if (!d) return null
                  const Icon = dim.icon
                  return (
                    <div key={dim.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: dim.color + '15', color: dim.color, flexShrink: 0, marginTop: '0.0625rem',
                      }}>
                        <Icon size={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.125rem' }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                            {dim.key}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xs)',
                            color: getScoreColor(d.score),
                          }}>
                            {d.score}
                          </span>
                        </div>
                        <div style={{
                          height: '0.1875rem', background: 'var(--border-subtle)',
                          borderRadius: '0.125rem', overflow: 'hidden', marginBottom: '0.25rem',
                        }}>
                          <div style={{
                            width: `${d.score}%`, height: '100%', background: getScoreColor(d.score),
                            borderRadius: '0.125rem', transition: 'width 500ms',
                          }} />
                        </div>
                        <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                          {d.feedback}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <div className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
                  marginBottom: 'var(--space-3)',
                }}>
                  {'Suggested Improvements'}
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', margin: 0, paddingLeft: '1rem' }}>
                  {result.improvements.map((imp, i) => (
                    <li key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Citation Example */}
            {result.aiCitationExample && (
              <div className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
                  marginBottom: 'var(--space-2)',
                }}>
                  {'AI Citation Example'}
                </div>
                <div style={{
                  padding: 'var(--space-3)', background: 'var(--hover-bg)', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6,
                  fontStyle: 'italic', borderLeft: '0.1875rem solid var(--color-phase-1)',
                }}>
                  {result.aiCitationExample}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
