/**
 * ContentHistoryTab — Browsable timeline of all AI-generated content.
 *
 * Merges contentHistory (Writer) + schemaHistory (Schema Generator)
 * into a unified, filterable card grid with type badges, dates,
 * preview snippets, expand/copy, and delete.
 */
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HelpCircle, ClipboardList, Scale, ShoppingBag, BookText,
  Newspaper, MapPin, Building2, Link2, Clapperboard,
  Copy, Check, Trash2, ChevronDown, ChevronUp, Filter, Clock,
} from 'lucide-react'
import { useToast } from '../../components/Toast'

const CONTENT_ICONS = {
  faq: HelpCircle,
  howto: ClipboardList,
  comparison: Scale,
  product: ShoppingBag,
  definition: BookText,
}

const SCHEMA_ICONS = {
  faqPage: HelpCircle,
  howTo: ClipboardList,
  article: Newspaper,
  product: ShoppingBag,
  localBusiness: MapPin,
  organization: Building2,
  breadcrumb: Link2,
  video: Clapperboard,
}

function relativeDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getPreviewSnippet(entry) {
  if (entry._source === 'content') {
    if (typeof entry.content === 'string') return entry.content.slice(0, 120)
    if (entry.content?.introduction) return entry.content.introduction.slice(0, 120)
    if (entry.content?.answer) return entry.content.answer.slice(0, 120)
    return entry.topic || ''
  }
  // schema
  if (entry.content?.description) return entry.content.description.slice(0, 120)
  if (entry.content?.jsonLd) return entry.content.jsonLd.slice(0, 120)
  return entry.topic || ''
}

function getFullContent(entry) {
  if (entry._source === 'content') {
    if (typeof entry.content === 'string') return entry.content
    return JSON.stringify(entry.content, null, 2)
  }
  if (entry.content?.jsonLd) return entry.content.jsonLd
  return JSON.stringify(entry.content, null, 2)
}

export default function ContentHistoryTab({ activeProject, updateProject }) {
  const { t } = useTranslation('app')
  const { addToast } = useToast()

  const [filter, setFilter] = useState('all') // 'all' | 'content' | 'schema'
  const [typeFilter, setTypeFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // ── Merge and sort both histories ──
  const allEntries = useMemo(() => {
    const content = (activeProject?.contentHistory || []).map(e => ({ ...e, _source: 'content' }))
    const schema = (activeProject?.schemaHistory || []).map(e => ({ ...e, _source: 'schema' }))
    return [...content, ...schema].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [activeProject?.contentHistory, activeProject?.schemaHistory])

  // ── Filtered entries ──
  const filteredEntries = useMemo(() => {
    let items = allEntries
    if (filter !== 'all') items = items.filter(e => e._source === filter)
    if (typeFilter !== 'all') items = items.filter(e => e.type === typeFilter)
    return items
  }, [allEntries, filter, typeFilter])

  // ── Unique types for filter dropdown ──
  const availableTypes = useMemo(() => {
    const types = new Set()
    allEntries.forEach(e => types.add(e.type))
    return Array.from(types).sort()
  }, [allEntries])

  // ── Handlers ──
  const handleCopy = (entry) => {
    const text = getFullContent(entry)
    navigator.clipboard.writeText(text)
    setCopiedId(entry.id)
    setTimeout(() => setCopiedId(null), 2000)
    addToast('success', t('contentOps.history.copied'))
  }

  const handleDelete = (entry) => {
    if (entry._source === 'content') {
      const updated = (activeProject?.contentHistory || []).filter(e => e.id !== entry.id)
      updateProject(activeProject.id, { contentHistory: updated })
    } else {
      const updated = (activeProject?.schemaHistory || []).filter(e => e.id !== entry.id)
      updateProject(activeProject.id, { schemaHistory: updated })
    }
    if (expandedId === entry.id) setExpandedId(null)
  }

  const contentCount = (activeProject?.contentHistory || []).length
  const schemaCount = (activeProject?.schemaHistory || []).length

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-5)', flexWrap: 'wrap',
        }}>
          <Filter size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {[
              { id: 'all', label: t('contentOps.history.all'), count: allEntries.length },
              { id: 'content', label: t('contentOps.history.contentOnly'), count: contentCount },
              { id: 'schema', label: t('contentOps.history.schemaOnly'), count: schemaCount },
            ].map(f => (
              <button
                key={f.id}
                className={`btn-ghost btn-sm ${filter === f.id ? 'history-filter-active' : ''}`}
                style={{
                  background: filter === f.id ? 'var(--hover-bg)' : 'transparent',
                  border: filter === f.id ? '0.0625rem solid var(--border-default)' : '0.0625rem solid transparent',
                }}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="tab-badge">{f.count}</span>
              </button>
            ))}
          </div>

          {availableTypes.length > 1 && (
            <select
              className="input-field input-sm"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ marginLeft: 'auto', width: 'auto' }}
              aria-label="Filter by type"
            >
              <option value="all">{t('contentOps.history.allTypes')}</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {filteredEntries.length === 0 && (
        <div className="card" style={{
          padding: 'var(--space-12) var(--space-5)',
          textAlign: 'center',
        }}>
          <Clock size={24} style={{ color: 'var(--text-disabled)', marginBottom: 'var(--space-3)' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
            {allEntries.length === 0
              ? t('contentOps.history.emptyTitle')
              : t('contentOps.history.noMatch')
            }
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>
            {allEntries.length === 0
              ? t('contentOps.history.emptyDesc')
              : t('contentOps.history.adjustFilters')
            }
          </p>
        </div>
      )}

      {/* ── History cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {filteredEntries.map(entry => {
          const isContent = entry._source === 'content'
          const IconMap = isContent ? CONTENT_ICONS : SCHEMA_ICONS
          const Icon = IconMap[entry.type] || ClipboardList
          const isExpanded = expandedId === entry.id
          const isCopied = copiedId === entry.id
          const snippet = getPreviewSnippet(entry)

          return (
            <div key={entry.id} className="card">
              {/* ── Header row ── */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-5)', cursor: 'pointer',
                }}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${entry.topic || 'content'} details`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : entry.id) } }}
              >
                {/* Icon */}
                <div style={{
                  width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: isContent ? 'rgba(255, 107, 53, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                }}>
                  <Icon size={13} style={{ color: isContent ? 'var(--color-phase-1)' : 'var(--color-phase-3)' }} />
                </div>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {entry.topic || entry.content?.name || t('contentOps.history.untitled')}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', display: 'flex', gap: 'var(--space-2)', marginTop: '0.125rem' }}>
                    <span style={{
                      padding: '0 var(--space-2)', borderRadius: 'var(--radius-full)',
                      background: isContent ? 'rgba(255, 107, 53, 0.08)' : 'rgba(14, 165, 233, 0.08)',
                      color: isContent ? 'var(--color-phase-1)' : 'var(--color-phase-3)',
                      fontWeight: 600,
                    }}>
                      {entry.type}
                    </span>
                    <span>{relativeDate(entry.createdAt)}</span>
                    {entry.tone && <span>{entry.tone}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                  <button
                    className="btn-icon"
                    style={{ width: '1.5rem', height: '1.5rem' }}
                    onClick={e => { e.stopPropagation(); handleCopy(entry) }}
                    title={t('contentOps.history.copy')}
                    aria-label={t('contentOps.history.copy')}
                  >
                    {isCopied ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                  </button>
                  <button
                    className="btn-icon"
                    style={{ width: '1.5rem', height: '1.5rem' }}
                    onClick={e => { e.stopPropagation(); handleDelete(entry) }}
                    title={t('contentOps.history.delete')}
                    aria-label={t('contentOps.history.delete')}
                  >
                    <Trash2 size={12} />
                  </button>
                  {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
                </div>
              </div>

              {/* ── Preview snippet (collapsed) ── */}
              {!isExpanded && snippet && (
                <div style={{
                  padding: '0 var(--space-5) var(--space-3)',
                  fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {snippet}...
                </div>
              )}

              {/* ── Expanded content ── */}
              {isExpanded && (
                <div style={{
                  padding: 'var(--space-3) var(--space-5) var(--space-4)',
                  borderTop: '0.0625rem solid var(--border-subtle)',
                }}>
                  <pre style={{
                    margin: 0, padding: 'var(--space-4)',
                    background: 'var(--bg-page)', borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)',
                    lineHeight: 1.6, color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    maxHeight: '20rem', overflowY: 'auto',
                    border: '0.0625rem solid var(--border-subtle)',
                  }}>
                    {getFullContent(entry)}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
