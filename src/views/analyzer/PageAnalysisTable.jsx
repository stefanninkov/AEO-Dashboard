/**
 * PageAnalysisTable — Sortable table of page-level AEO scores.
 *
 * Columns: Page URL, Score, Schema, Content, Technical, Authority, Analyzed, Actions
 * Features: sort, search filter, CSV export, click row → detail view
 */

import { useState, useMemo } from 'react'
import {
  ArrowUp, ArrowDown, Search, Download, RefreshCw, Trash2, ExternalLink,
} from 'lucide-react'
import { shortPageUrl } from './usePageAnalyzer'

/* ── Sort Header ── */
function SortHeader({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey
  const isAsc = isActive && currentSort.dir === 'asc'
  return (
    <button
      onClick={() => onSort(sortKey)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06rem',
        color: isActive ? 'var(--color-phase-1)' : 'var(--text-disabled)',
        padding: 0, whiteSpace: 'nowrap',
      }}
    >
      {label}
      {isActive && (isAsc ? <ArrowUp size={9} /> : <ArrowDown size={9} />)}
    </button>
  )
}

/* ── Score Badge ── */
function ScoreBadge({ score, size = 'normal' }) {
  const bg = score >= 70 ? 'rgba(16,185,129,0.12)' : score >= 40 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)'
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
  const fontSize = size === 'small' ? '0.625rem' : '0.75rem'
  const padding = size === 'small' ? '0.0625rem 0.25rem' : '0.125rem 0.375rem'

  return (
    <span style={{
      fontFamily: 'var(--font-heading)', fontSize, fontWeight: 700,
      padding, borderRadius: '0.25rem', background: bg, color,
      display: 'inline-block', textAlign: 'center', minWidth: size === 'small' ? '1.75rem' : '2rem',
    }}>
      {score}
    </span>
  )
}

/* ── Relative time ── */
function relativeTime(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ══════════════════════════════════════════════════════════════════ */

export default function PageAnalysisTable({ pages, onSelectPage, onReanalyze, onRemove, analyzing }) {
  const [sort, setSort] = useState({ key: 'overallScore', dir: 'asc' })
  const [searchFilter, setSearchFilter] = useState('')
  const [showTop, setShowTop] = useState(25)

  const handleSort = (key) => {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }))
  }

  const filteredRows = useMemo(() => {
    let rows = [...pages]
    if (searchFilter) {
      const q = searchFilter.toLowerCase()
      rows = rows.filter(p => p.url.toLowerCase().includes(q) || p.label?.toLowerCase().includes(q))
    }
    rows.sort((a, b) => {
      const aVal = a[sort.key] ?? 0
      const bVal = b[sort.key] ?? 0
      if (typeof aVal === 'string') {
        return sort.dir === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }
      return sort.dir === 'desc' ? bVal - aVal : aVal - bVal
    })
    return rows.slice(0, showTop)
  }, [pages, sort, searchFilter, showTop])

  // CSV export
  const handleExportCsv = () => {
    if (!pages.length) return
    let csv = 'URL,Score,Schema,Content,Technical,Authority,Analyzed\n'
    pages.forEach(p => {
      csv += `"${p.url}",${p.overallScore},${p.schemaScore},${p.contentScore},${p.technicalScore},${p.authorityScore},"${p.analyzedAt || ''}"\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-scores-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (pages.length === 0) return null

  const gridTemplate = '1fr 3.5rem 3rem 3rem 3rem 3rem 4.5rem 3.5rem'

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem', flex: 1,
          padding: '0.375rem 0.625rem', borderRadius: '0.5rem',
          background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
        }}>
          <Search size={13} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Filter pages..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: '0.75rem', color: 'var(--text-primary)', width: '100%',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
        <button className="icon-btn" onClick={handleExportCsv} title="Export CSV">
          <Download size={14} />
        </button>
      </div>

      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: gridTemplate,
        gap: '0.375rem', padding: '0.5rem 1rem', alignItems: 'center',
        background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-subtle)',
      }}>
        <SortHeader label="Page" sortKey="url" currentSort={sort} onSort={handleSort} />
        <SortHeader label="Score" sortKey="overallScore" currentSort={sort} onSort={handleSort} />
        <SortHeader label="Schema" sortKey="schemaScore" currentSort={sort} onSort={handleSort} />
        <SortHeader label="Content" sortKey="contentScore" currentSort={sort} onSort={handleSort} />
        <SortHeader label="Tech" sortKey="technicalScore" currentSort={sort} onSort={handleSort} />
        <SortHeader label="Auth" sortKey="authorityScore" currentSort={sort} onSort={handleSort} />
        <SortHeader label="Analyzed" sortKey="analyzedAt" currentSort={sort} onSort={handleSort} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)' }}>
          Actions
        </span>
      </div>

      {/* Rows */}
      {filteredRows.map(page => (
        <div
          key={page.key}
          onClick={() => onSelectPage(page.url)}
          style={{
            display: 'grid', gridTemplateColumns: gridTemplate,
            gap: '0.375rem', padding: '0.5rem 1rem', alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            cursor: 'pointer', transition: 'background 100ms',
            fontSize: '0.8125rem',
          }}
          className="page-table-row"
        >
          {/* URL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
            <span style={{
              fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }} title={page.url}>
              {shortPageUrl(page.url)}
            </span>
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: 'var(--text-disabled)', flexShrink: 0 }}
            >
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Overall Score */}
          <ScoreBadge score={page.overallScore} />

          {/* Category Scores */}
          <ScoreBadge score={page.schemaScore} size="small" />
          <ScoreBadge score={page.contentScore} size="small" />
          <ScoreBadge score={page.technicalScore} size="small" />
          <ScoreBadge score={page.authorityScore} size="small" />

          {/* Analyzed */}
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
            {relativeTime(page.analyzedAt)}
          </span>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
            <button
              className="icon-btn"
              style={{ width: '1.5rem', height: '1.5rem' }}
              onClick={() => onReanalyze(page.url)}
              disabled={analyzing}
              title="Re-analyze"
            >
              <RefreshCw size={11} />
            </button>
            <button
              className="icon-btn"
              style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-error)' }}
              onClick={() => onRemove(page.url)}
              title="Remove"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      ))}

      {/* Show more */}
      {pages.length > showTop && (
        <div style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowTop(prev => prev + 25)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', color: 'var(--color-phase-1)', fontWeight: 600,
              fontFamily: 'var(--font-body)',
            }}
          >
            Show more ({pages.length - showTop} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
