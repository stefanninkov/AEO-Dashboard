import { useState } from 'react'
import {
  CheckCircle2, XCircle, MinusCircle, ExternalLink, FileSearch,
  ChevronDown, ChevronUp, Lightbulb, Copy, Check, Sparkles, Loader2,
} from 'lucide-react'
import { callAI } from '../../utils/apiClient'
import { hasApiKey } from '../../utils/aiProvider'

/* ── Copy Button ── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e) => {
    e.stopPropagation()
    const copyText = Array.isArray(text) ? text.join('\n') : text
    navigator.clipboard.writeText(copyText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy'}
      style={{
        background: 'none', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)', padding: '0.25rem', cursor: 'pointer',
        color: copied ? 'var(--color-success)' : 'var(--text-tertiary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'color 200ms',
      }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  )
}

/* ── Check Item Row with expandable fix guidance + AI fix ── */
function CheckRow({ check, pageUrl }) {
const [expanded, setExpanded] = useState(false)
  const [aiFix, setAiFix] = useState(null)
  const [generating, setGenerating] = useState(false)
  const icon = check.status === 'pass' ? <CheckCircle2 size={14} /> : check.status === 'fail' ? <XCircle size={14} /> : <MinusCircle size={14} />
  const color = check.status === 'pass' ? 'var(--color-success)' : check.status === 'fail' ? 'var(--color-error)' : 'var(--color-warning)'
  const hasFix = check.status !== 'pass' && check.fix
  const showAiButton = check.status !== 'pass' && hasApiKey()

  const generateAiFix = async (e) => {
    e.stopPropagation()
    if (generating) return
    setGenerating(true)
    try {
      const response = await callAI({
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Generate a specific, actionable code fix for the given SEO issue. Return JSON with { "explanation": "brief explanation", "code": "the exact code or content fix", "language": "html|meta|text" }. Keep the code concise and ready to copy-paste.',
          },
          {
            role: 'user',
            content: `Fix this SEO issue for the page at ${pageUrl || 'unknown URL'}:\n\nCheck: ${check.item}\nStatus: ${check.status}\nDetail: ${check.detail || 'N/A'}\nCategory: ${check.category || 'N/A'}\n\nCurrent fix guidance: ${Array.isArray(check.fix) ? check.fix.join('; ') : check.fix || 'None'}\n\nGenerate the exact code fix.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      })
      try {
        const parsed = JSON.parse(response.text)
        setAiFix(parsed)
      } catch {
        setAiFix({ explanation: response.text || String(response), code: '', language: 'text' })
      }
    } catch (err) {
      setAiFix({ explanation: `Error: ${err.message}`, code: '', language: 'text' })
    }
    setGenerating(false)
    setExpanded(true)
  }

  return (
    <div style={{ padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: hasFix ? 'pointer' : 'default' }}
        onClick={() => hasFix && setExpanded(prev => !prev)}
      >
        <span style={{ color, flexShrink: 0, marginTop: '0.0625rem' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{check.item}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {showAiButton && (
                <button
                  onClick={generateAiFix}
                  disabled={generating}
                  title={'Generate AI Fix'}
                  style={{
                    background: 'none', border: '0.0625rem solid color-mix(in srgb, var(--accent) 30%, transparent)',
                    borderRadius: 'var(--radius-sm)', padding: '0.125rem 0.375rem', cursor: generating ? 'wait' : 'pointer',
                    color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.5625rem', fontWeight: 600,
                  }}
                >
                  {generating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  AI Fix
                </button>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, fontWeight: 600 }}>
                {check.points}/{check.maxPoints}
              </span>
              {hasFix && (
                expanded
                  ? <ChevronUp size={12} style={{ color: 'var(--text-tertiary)' }} />
                  : <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
          </div>
          {check.detail && (
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem', lineHeight: 1.4 }}>{check.detail}</p>
          )}
        </div>
      </div>
      {/* Expandable fix guidance */}
      {expanded && check.fix && (
        <div style={{
          marginTop: '0.5rem', marginLeft: '1.375rem', padding: '0.625rem 0.75rem',
          background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--accent) 12%, transparent)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lightbulb size={12} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)' }}>How to fix</span>
            </div>
            <CopyButton text={check.fix} />
          </div>
          {Array.isArray(check.fix) ? (
            <ol style={{ margin: 0, paddingLeft: '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {check.fix.map((step, i) => (
                <li key={i} style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{check.fix}</p>
          )}

          {/* AI-generated fix */}
          {aiFix && (
            <div style={{
              marginTop: '0.625rem', padding: '0.625rem 0.75rem',
              background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
              border: '0.0625rem solid color-mix(in srgb, var(--accent) 20%, transparent)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)' }}>AI-Generated Fix</span>
                </div>
                {aiFix.code && <CopyButton text={aiFix.code} />}
              </div>
              {aiFix.explanation && (
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.375rem 0' }}>{aiFix.explanation}</p>
              )}
              {aiFix.code && (
                <pre style={{
                  fontSize: '0.625rem', color: 'var(--text-primary)', background: 'var(--bg-page)',
                  padding: '0.5rem', borderRadius: 'var(--radius-sm)', overflow: 'auto',
                  fontFamily: 'var(--font-mono)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap',
                  border: '0.0625rem solid var(--border-subtle)',
                }}>
                  {aiFix.code}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CategorySection({ title, checks, pageUrl }) {
  if (!checks || checks.length === 0) return null
  const score = checks.reduce((s, c) => s + c.points, 0)
  const maxScore = checks.reduce((s, c) => s + c.maxPoints, 0)
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const color = pct >= 90 ? '#10b981' : pct >= 70 ? 'var(--color-success)' : pct >= 40 ? 'var(--color-warning)' : 'var(--color-error)'

  return (
    <div style={{
      padding: '1.25rem', background: 'var(--bg-card)',
      border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color }}>{pct}%</span>
      </div>
      {checks.map((check, i) => <CheckRow key={i} check={check} pageUrl={pageUrl} />)}
    </div>
  )
}

export default function OnPageSeoTab({ analyzer, activeProject }) {
const { lastScan } = analyzer

  if (!lastScan) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-tertiary)' }}>
        <FileSearch size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {'No SEO scans yet'}
        </h3>
        <p style={{ fontSize: '0.875rem' }}>{'Run an SEO audit first from the SEO Audit tab.'}</p>
      </div>
    )
  }

  const seoScore = lastScan.seoScore
  const checks = seoScore?.checks || []
  const pageUrl = lastScan.url

  // Group by category
  const keywordChecks = checks.filter(c => c.category === 'Keyword Optimization')
  const readabilityChecks = checks.filter(c => c.category === 'Readability & UX')
  const imageChecks = checks.filter(c => c.category === 'Image Optimization')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 0' }}>
      {/* AEO note */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1rem', background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
        border: '0.0625rem solid color-mix(in srgb, var(--accent) 15%, transparent)',
        borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)',
      }}>
        <ExternalLink size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        {'Title, meta description, headings, schema markup, and link analysis are covered in the AEO Analyzer tab.'}
      </div>

      {/* AI Fix hint */}
      {hasApiKey() && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 1rem', background: 'color-mix(in srgb, var(--accent) 4%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--accent) 10%, transparent)',
          borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-tertiary)',
        }}>
          <Sparkles size={12} style={{ color: 'var(--accent)' }} />
          {'Click the "AI Fix" button on any failing check to generate a specific code fix using AI.'}
        </div>
      )}

      {/* Target Keyword */}
      {seoScore.targetKeyword && (
        <div style={{
          padding: '0.75rem 1rem', background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{'Target Keyword'}:</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600,
            color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)',
          }}>
            {seoScore.targetKeyword}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
            ({'auto-detected from title + H1'})
          </span>
        </div>
      )}

      <CategorySection title={'Keyword Optimization'} checks={keywordChecks} pageUrl={pageUrl} />
      <CategorySection title={'Readability & UX'} checks={readabilityChecks} pageUrl={pageUrl} />
      <CategorySection title={'Image Optimization'} checks={imageChecks} pageUrl={pageUrl} />
    </div>
  )
}
