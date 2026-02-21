import { useState } from 'react'
import { hasApiKey } from '../../utils/aiProvider'
import {
  Search, Globe, Loader2, AlertCircle, Copy, Check,
  Trash2, Clock, FileText, ChevronRight, ExternalLink,
  BookOpen, Code2, Link2, Sparkles, ArrowLeft, Lightbulb,
} from 'lucide-react'
import useContentBrief from './useContentBrief'

/* ── Skeleton loader ── */
function BriefSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, var(--hover-bg) 25%, var(--border-subtle) 50%, var(--hover-bg) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '0.375rem',
  }
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ ...shimmer, height: '1.5rem', width: '60%' }} />
      <div style={{ ...shimmer, height: '1rem', width: '30%' }} />
      <div style={{ ...shimmer, height: '6rem', width: '100%' }} />
      <div style={{ ...shimmer, height: '4rem', width: '100%' }} />
      <div style={{ ...shimmer, height: '4rem', width: '100%' }} />
      <div style={{
        textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem',
        fontFamily: 'var(--font-body)', marginTop: '0.5rem',
      }}>
        Researching competitors and building outline...
      </div>
    </div>
  )
}

/* ── Section component ── */
function BriefSection({ icon: Icon, title, children, color }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--hover-bg)',
      }}>
        <Icon size={14} style={{ color: color || 'var(--color-phase-1)' }} />
        <span style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-primary)',
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '0.875rem 1rem' }}>
        {children}
      </div>
    </div>
  )
}

/* ── Brief Display ── */
function BriefDisplay({ briefEntry, onCopy, onRemove }) {
  const [copied, setCopied] = useState(false)
  const b = briefEntry.brief

  const handleCopy = async () => {
    await onCopy(briefEntry)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const itemStyle = {
    fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6,
    padding: '0.3125rem 0',
    borderBottom: '1px solid var(--border-subtle)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Header */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
        borderRadius: '0.75rem', padding: '1rem 1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700,
              color: 'var(--text-primary)', margin: 0,
            }}>
              {b.title || briefEntry.targetQuery}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
              {b.targetWordCount && (
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
                  padding: '0.1875rem 0.5rem', borderRadius: '0.3125rem',
                  background: 'rgba(99,102,241,0.12)', color: '#6366F1',
                }}>
                  {b.targetWordCount.toLocaleString()} words
                </span>
              )}
              {b.toneAndStyle && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {b.toneAndStyle}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
            <button onClick={handleCopy} style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.3125rem 0.625rem', borderRadius: '0.375rem',
              border: '1px solid var(--border-subtle)', background: 'transparent',
              color: copied ? '#10B981' : 'var(--text-secondary)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Markdown</>}
            </button>
            <button onClick={() => onRemove(briefEntry.id)} style={{
              display: 'flex', alignItems: 'center', padding: '0.3125rem',
              borderRadius: '0.375rem', border: '1px solid var(--border-subtle)',
              background: 'transparent', color: 'var(--text-tertiary)',
              cursor: 'pointer',
            }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Heading Structure */}
      {b.headingStructure?.length > 0 && (
        <BriefSection icon={BookOpen} title="Heading Structure" color="#6366F1">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {b.headingStructure.map((h, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                paddingTop: '0.25rem', paddingBottom: '0.25rem',
                paddingLeft: h.level === 'H3' ? '1.25rem' : '0',
              }}>
                <span style={{
                  fontSize: '0.5625rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
                  color: h.level === 'H2' ? '#6366F1' : 'var(--text-tertiary)',
                  width: '1.5rem', flexShrink: 0,
                }}>
                  {h.level}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: h.level === 'H2' ? 600 : 400 }}>
                  {h.text}
                </span>
              </div>
            ))}
          </div>
        </BriefSection>
      )}

      {/* Questions to Answer */}
      {b.questionsToAnswer?.length > 0 && (
        <BriefSection icon={Search} title="Questions to Answer" color="#F59E0B">
          {b.questionsToAnswer.map((q, i) => (
            <div key={i} style={{ ...itemStyle, display: 'flex', gap: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                width: '1.25rem', flexShrink: 0, textAlign: 'right', marginTop: '0.125rem',
              }}>
                {i + 1}.
              </span>
              <span>{q}</span>
            </div>
          ))}
        </BriefSection>
      )}

      {/* Key Points */}
      {b.keyPoints?.length > 0 && (
        <BriefSection icon={Lightbulb} title="Key Points to Cover" color="#10B981">
          {b.keyPoints.map((p, i) => (
            <div key={i} style={{ ...itemStyle, display: 'flex', gap: '0.5rem' }}>
              <ChevronRight size={12} style={{ color: '#10B981', flexShrink: 0, marginTop: '0.25rem' }} />
              <span>{p}</span>
            </div>
          ))}
        </BriefSection>
      )}

      {/* Competitors */}
      {b.competitorsToOutrank?.length > 0 && (
        <BriefSection icon={Globe} title="Competitors to Outrank" color="#EF4444">
          {b.competitorsToOutrank.map((c, i) => (
            <div key={i} style={{ ...itemStyle, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" style={{
                fontSize: '0.8125rem', color: 'var(--color-phase-1)',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}>
                {c.url} <ExternalLink size={10} />
              </a>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {c.whyTheyRank}
              </span>
            </div>
          ))}
        </BriefSection>
      )}

      {/* Schema Recommendations */}
      {b.schemaRecommendations?.length > 0 && (
        <BriefSection icon={Code2} title="Schema Recommendations" color="#14B8A6">
          {b.schemaRecommendations.map((s, i) => (
            <div key={i} style={{ ...itemStyle, display: 'flex', gap: '0.5rem' }}>
              <Code2 size={12} style={{ color: '#14B8A6', flexShrink: 0, marginTop: '0.25rem' }} />
              <span>{s}</span>
            </div>
          ))}
        </BriefSection>
      )}

      {/* Internal Links */}
      {b.internalLinks?.length > 0 && (
        <BriefSection icon={Link2} title="Internal Links" color="#8B5CF6">
          {b.internalLinks.map((l, i) => (
            <div key={i} style={{ ...itemStyle, display: 'flex', gap: '0.5rem' }}>
              <Link2 size={12} style={{ color: '#8B5CF6', flexShrink: 0, marginTop: '0.25rem' }} />
              <span>"{l.text}" <span style={{ color: 'var(--text-tertiary)' }}> &rarr; {l.suggestedUrl}</span></span>
            </div>
          ))}
        </BriefSection>
      )}

      {/* AEO Tips */}
      {b.aeoTips?.length > 0 && (
        <BriefSection icon={Sparkles} title="AEO Optimization Tips" color="#FF6B35">
          {b.aeoTips.map((t, i) => (
            <div key={i} style={{ ...itemStyle, display: 'flex', gap: '0.5rem' }}>
              <Sparkles size={12} style={{ color: '#FF6B35', flexShrink: 0, marginTop: '0.25rem' }} />
              <span>{t}</span>
            </div>
          ))}
        </BriefSection>
      )}
    </div>
  )
}

/* ── Main Brief View ── */
export default function BriefView({ activeProject, updateProject, user }) {
  const brief = useContentBrief({ activeProject, updateProject, user })
  const [query, setQuery] = useState('')
  const [pageUrl, setPageUrl] = useState('')

  const handleGenerate = async () => {
    if (!query.trim()) return
    await brief.generateBrief(query.trim(), pageUrl.trim())
    setQuery('')
    setPageUrl('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const handleCopy = async (briefEntry) => {
    const md = brief.briefToMarkdown(briefEntry)
    await navigator.clipboard.writeText(md)
  }

  const apiKeyAvailable = hasApiKey()

  return (
    <div style={{ display: 'flex', gap: '1rem', minHeight: '24rem' }}>
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* API key warning */}
        {!apiKeyAvailable && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: '#EF4444', fontSize: '0.8125rem',
          }}>
            <AlertCircle size={14} />
            Set your Anthropic API key in Settings to generate briefs.
          </div>
        )}

        {/* Input row */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 14rem' }}>
              <label style={{
                display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-heading)',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                color: 'var(--text-tertiary)', marginBottom: '0.25rem',
              }}>
                Target Query *
              </label>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g. "how to choose a CRM for small business"'
                disabled={brief.generating}
                style={{
                  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  border: '1px solid var(--border-subtle)', background: 'var(--hover-bg)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem', outline: 'none',
                }}
              />
            </div>
            <div style={{ flex: '1 1 10rem' }}>
              <label style={{
                display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-heading)',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                color: 'var(--text-tertiary)', marginBottom: '0.25rem',
              }}>
                Page URL (optional)
              </label>
              <input
                value={pageUrl}
                onChange={e => setPageUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/page"
                disabled={brief.generating}
                style={{
                  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  border: '1px solid var(--border-subtle)', background: 'var(--hover-bg)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem', outline: 'none',
                }}
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                onClick={handleGenerate}
                disabled={!query.trim() || brief.generating || !apiKeyAvailable}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 1rem', borderRadius: '0.5rem',
                  border: 'none', background: 'var(--color-phase-1)',
                  color: '#fff', fontSize: '0.8125rem', fontWeight: 600,
                  cursor: (!query.trim() || brief.generating || !apiKeyAvailable) ? 'not-allowed' : 'pointer',
                  opacity: (!query.trim() || brief.generating || !apiKeyAvailable) ? 0.5 : 1,
                  fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                }}
              >
                {brief.generating ? <><Loader2 size={14} className="spin" /> Generating...</> : <><Sparkles size={14} /> Generate Brief</>}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {brief.error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.8125rem', color: '#EF4444',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <AlertCircle size={14} /> {brief.error}
            </div>
            <button onClick={() => brief.setError(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444',
              fontSize: '0.75rem', fontWeight: 600,
            }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {brief.generating && <BriefSkeleton />}

        {/* Brief display */}
        {!brief.generating && brief.selectedBrief && (
          <div>
            <button
              onClick={() => brief.setSelectedBriefId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', fontSize: '0.8125rem',
                fontFamily: 'var(--font-body)', marginBottom: '0.75rem',
                padding: 0,
              }}
            >
              <ArrowLeft size={14} /> All Briefs
            </button>
            <BriefDisplay
              briefEntry={brief.selectedBrief}
              onCopy={handleCopy}
              onRemove={brief.removeBrief}
            />
          </div>
        )}

        {/* Brief list (when no brief selected and not generating) */}
        {!brief.generating && !brief.selectedBrief && brief.briefs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              fontSize: '0.6875rem', fontFamily: 'var(--font-heading)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)',
              marginBottom: '0.25rem',
            }}>
              Generated Briefs ({brief.briefs.length})
            </div>
            {brief.briefs.map(b => (
              <div
                key={b.id}
                onClick={() => brief.setSelectedBriefId(b.id)}
                className="content-cal-entry"
                style={{
                  background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
                  borderRadius: '0.625rem', padding: '0.75rem 1rem',
                  cursor: 'pointer', transition: 'border-color 150ms',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <FileText size={13} style={{ color: 'var(--color-phase-1)' }} />
                    {b.brief?.title || b.targetQuery}
                  </div>
                  <div style={{
                    fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span>"{b.targetQuery}"</span>
                    {b.pageUrl && <span> &middot; {b.pageUrl}</span>}
                    <span> &middot; <Clock size={10} style={{ display: 'inline', verticalAlign: '-1px' }} /> {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                  {b.brief?.targetWordCount && (
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
                      padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
                      background: 'rgba(99,102,241,0.1)', color: '#6366F1',
                    }}>
                      {b.brief.targetWordCount} words
                    </span>
                  )}
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!brief.generating && !brief.selectedBrief && brief.briefs.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem 1.5rem',
            color: 'var(--text-tertiary)',
          }}>
            <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.9375rem',
              fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.375rem',
            }}>
              No content briefs yet
            </div>
            <div style={{ fontSize: '0.8125rem', maxWidth: '28rem', margin: '0 auto', lineHeight: 1.5 }}>
              Enter a target query (e.g. "how to choose a CRM") and optionally a page URL.
              The AI will research competitors, analyze top-ranking content, and generate
              a complete brief with heading structure, questions to answer, schema recommendations, and more.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
