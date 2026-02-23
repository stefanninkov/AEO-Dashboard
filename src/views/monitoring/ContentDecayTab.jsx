import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingDown, AlertTriangle, AlertCircle, MinusCircle,
  CheckCircle2, XCircle, Sparkles, Loader2, ChevronDown, ChevronUp,
  Copy, Check,
} from 'lucide-react'
import { useContentDecay } from '../../hooks/useContentDecay'

const SEVERITY_CONFIG = {
  lost: { icon: AlertTriangle, color: 'var(--color-error)', bg: 'rgba(239,68,68,0.08)', label: 'Lost' },
  declining: { icon: TrendingDown, color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.08)', label: 'Declining' },
  dip: { icon: MinusCircle, color: 'var(--text-tertiary)', bg: 'var(--hover-bg)', label: 'Dip' },
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.dip
  const Icon = cfg.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.125rem 0.5rem', borderRadius: '6.1875rem',
      fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.03125rem',
      background: cfg.bg, color: cfg.color,
    }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

function TimelineDots({ timeline }) {
  if (!timeline || timeline.length === 0) return null
  // Show last 10 checks as dots
  const dots = timeline.slice(-10)
  return (
    <div style={{ display: 'flex', gap: '0.1875rem', alignItems: 'center' }}>
      {dots.map((point, i) => (
        <div
          key={i}
          title={`${new Date(point.date).toLocaleDateString()} — ${point.cited ? 'Cited' : 'Not cited'}`}
          style={{
            width: '0.4375rem', height: '0.4375rem', borderRadius: '50%',
            background: point.cited ? 'var(--color-success)' : 'var(--color-error)',
            opacity: point.cited ? 1 : 0.4,
            transition: 'transform 150ms',
          }}
        />
      ))}
    </div>
  )
}

export default function ContentDecayTab({ activeProject }) {
  const { t } = useTranslation('app')
  const { decays, summary, generating, suggestions, error, getTimeline, generateSuggestions, hasData } = useContentDecay(activeProject)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [expandedQuery, setExpandedQuery] = useState(null)
  const [filter, setFilter] = useState('all') // all | lost | declining | dip
  const [copiedIdx, setCopiedIdx] = useState(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return decays
    return decays.filter(d => d.severity === filter)
  }, [decays, filter])

  const toggleSelect = (query) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(query)) next.delete(query)
      else next.add(query)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(d => d.query)))
    }
  }

  const handleGenerate = () => {
    const selected = decays.filter(d => selectedIds.has(d.query))
    if (selected.length > 0) generateSuggestions(selected)
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  // Empty / insufficient data state
  if (!hasData) {
    return (
      <div className="card" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '3rem 1.5rem',
        border: '0.125rem dashed var(--border-default)',
      }}>
        <div style={{
          width: '3rem', height: '3rem', borderRadius: '0.75rem',
          background: 'var(--hover-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem',
        }}>
          <TrendingDown size={20} style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.8125rem',
          fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)',
        }}>
          {t('monitoring.decay.emptyTitle')}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: '20rem' }}>
          {t('monitoring.decay.emptyDesc')}
        </p>
      </div>
    )
  }

  // No decays found (everything healthy)
  if (decays.length === 0) {
    return (
      <div className="card" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '2.5rem 1.5rem',
        border: '0.0625rem solid rgba(46,204,113,0.2)',
        background: 'rgba(46,204,113,0.03)',
      }}>
        <div style={{
          width: '3rem', height: '3rem', borderRadius: '50%',
          background: 'rgba(46,204,113,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem',
        }}>
          <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.875rem',
          fontWeight: 700, color: 'var(--color-success)', marginBottom: '0.25rem',
        }}>
          {t('monitoring.decay.healthyTitle')}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {t('monitoring.decay.healthyDesc')}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Summary stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))',
        gap: '0.75rem',
      }} className="stagger-grid">
        <div className="card" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03125rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
            {t('monitoring.decay.totalDecaying')}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: summary.total > 0 ? 'var(--color-warning)' : 'var(--text-primary)' }}>
            {summary.total}
          </div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03125rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
            {t('monitoring.decay.lost')}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: summary.lost > 0 ? 'var(--color-error)' : 'var(--text-disabled)' }}>
            {summary.lost}
          </div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03125rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
            {t('monitoring.decay.declining')}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: summary.declining > 0 ? 'var(--color-warning)' : 'var(--text-disabled)' }}>
            {summary.declining}
          </div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03125rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
            {t('monitoring.decay.dips')}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: summary.dip > 0 ? 'var(--text-tertiary)' : 'var(--text-disabled)' }}>
            {summary.dip}
          </div>
        </div>
      </div>

      {/* Filter + actions bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '0.5rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {['all', 'lost', 'declining', 'dip'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
              style={{ fontSize: '0.6875rem' }}
            >
              {f === 'all' ? t('monitoring.decay.filterAll') : t(`monitoring.decay.filter_${f}`)}
              {f !== 'all' && (
                <span style={{
                  marginLeft: '0.25rem', fontSize: '0.5625rem',
                  opacity: 0.7,
                }}>
                  {f === 'lost' ? summary.lost : f === 'declining' ? summary.declining : summary.dip}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {selectedIds.size > 0 && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary btn-sm"
              style={{ background: 'var(--color-phase-5)' }}
            >
              {generating ? (
                <><Loader2 size={13} className="mon-spinner" /> {t('monitoring.decay.generating')}</>
              ) : (
                <><Sparkles size={13} /> {t('monitoring.decay.getSuggestions', { count: selectedIds.size })}</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Decay list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Select all header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.625rem 1rem',
          borderBottom: '0.0625rem solid var(--border-subtle)',
          background: 'var(--hover-bg)',
        }}>
          <button
            onClick={handleSelectAll}
            style={{
              width: '1rem', height: '1rem', borderRadius: '0.1875rem',
              border: `0.0625rem solid ${selectedIds.size === filtered.length && filtered.length > 0 ? 'var(--color-phase-1)' : 'var(--border-default)'}`,
              background: selectedIds.size === filtered.length && filtered.length > 0 ? 'var(--color-phase-1)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {selectedIds.size === filtered.length && filtered.length > 0 && <Check size={10} style={{ color: '#fff' }} />}
          </button>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {t('monitoring.decay.queryCount', { count: filtered.length })}
          </span>
        </div>

        {/* Decay items */}
        {filtered.map(decay => {
          const timeline = getTimeline(decay.query)
          const isExpanded = expandedQuery === decay.query
          const isSelected = selectedIds.has(decay.query)

          return (
            <div key={decay.query} style={{
              borderBottom: '0.0625rem solid var(--border-subtle)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
                onClick={() => setExpandedQuery(isExpanded ? null : decay.query)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Checkbox */}
                <button
                  onClick={e => { e.stopPropagation(); toggleSelect(decay.query) }}
                  style={{
                    width: '1rem', height: '1rem', borderRadius: '0.1875rem',
                    border: `0.0625rem solid ${isSelected ? 'var(--color-phase-1)' : 'var(--border-default)'}`,
                    background: isSelected ? 'var(--color-phase-1)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && <Check size={10} style={{ color: '#fff' }} />}
                </button>

                {/* Query text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {decay.query}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginTop: '0.1875rem',
                  }}>
                    <span style={{
                      fontSize: '0.625rem', color: 'var(--text-tertiary)',
                    }}>
                      {t('monitoring.decay.citedRate', { rate: decay.citedRate })}
                    </span>
                    <TimelineDots timeline={timeline} />
                  </div>
                </div>

                {/* Severity badge */}
                <SeverityBadge severity={decay.severity} />

                {/* Expand chevron */}
                {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  padding: '0 1rem 0.75rem 2.75rem',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.03125rem' }}>
                        {t('monitoring.decay.checks')}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {decay.citedCount}/{decay.totalChecks}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.03125rem' }}>
                        {t('monitoring.decay.lastCited')}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {decay.lastCitedDate ? new Date(decay.lastCitedDate).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.03125rem' }}>
                        {t('monitoring.decay.firstSeen')}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {new Date(decay.firstSeenDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Last excerpt */}
                  {decay.lastExcerpt && (
                    <div style={{
                      padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
                      background: 'var(--hover-bg)', fontSize: '0.75rem',
                      color: 'var(--text-secondary)', lineHeight: 1.5,
                      fontStyle: 'italic',
                      borderLeft: `0.125rem solid ${SEVERITY_CONFIG[decay.severity]?.color || 'var(--border-default)'}`,
                    }}>
                      "{decay.lastExcerpt.length > 200 ? decay.lastExcerpt.slice(0, 197) + '...' : decay.lastExcerpt}"
                    </div>
                  )}

                  {/* Full timeline */}
                  <div>
                    <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.03125rem', marginBottom: '0.25rem' }}>
                      {t('monitoring.decay.timeline')}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {timeline.map((point, i) => (
                        <div
                          key={i}
                          title={`${new Date(point.date).toLocaleDateString()} — ${point.cited ? 'Cited' : 'Not cited'}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.1875rem',
                            padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
                            background: point.cited ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)',
                            fontSize: '0.5625rem', color: point.cited ? 'var(--color-success)' : 'var(--color-error)',
                          }}
                        >
                          {point.cited ? <CheckCircle2 size={8} /> : <XCircle size={8} />}
                          {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '0.5rem',
          background: 'rgba(239,68,68,0.08)', color: 'var(--color-error)',
          fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* AI Suggestions results */}
      {suggestions && suggestions.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderBottom: '0.0625rem solid var(--border-subtle)',
            background: 'var(--hover-bg)',
          }}>
            <Sparkles size={14} style={{ color: 'var(--color-phase-5)' }} />
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.8125rem',
              fontWeight: 700, color: 'var(--text-primary)',
            }}>
              {t('monitoring.decay.suggestionsTitle')}
            </span>
          </div>
          {suggestions.map((s, idx) => (
            <div key={idx} style={{
              padding: '0.75rem 1rem',
              borderBottom: idx < suggestions.length - 1 ? '0.0625rem solid var(--border-subtle)' : 'none',
              display: 'flex', flexDirection: 'column', gap: '0.375rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
                }}>
                  "{s.query}"
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{
                    fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                    padding: '0.0625rem 0.375rem', borderRadius: '6.1875rem',
                    background: s.priority === 'high' ? 'rgba(239,68,68,0.08)' : s.priority === 'medium' ? 'rgba(245,158,11,0.08)' : 'var(--hover-bg)',
                    color: s.priority === 'high' ? 'var(--color-error)' : s.priority === 'medium' ? 'var(--color-warning)' : 'var(--text-tertiary)',
                  }}>
                    {s.priority}
                  </span>
                  <button
                    onClick={() => handleCopy(s.action, idx)}
                    className="btn-icon"
                    style={{ width: '1.5rem', height: '1.5rem' }}
                    title="Copy action"
                  >
                    {copiedIdx === idx ? <Check size={11} style={{ color: 'var(--color-success)' }} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{t('monitoring.decay.action')}:</strong> {s.action}
              </p>
              {s.reason && (
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', lineHeight: 1.4, fontStyle: 'italic' }}>
                  {s.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
