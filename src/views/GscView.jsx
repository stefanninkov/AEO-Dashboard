/**
 * GscView — Google Search Console Data Views
 *
 * Three tabs:
 *   1. Search Analytics — top queries with clicks, impressions, CTR, position
 *   2. AEO Queries — AI-relevant queries detected with classification
 *   3. Pages — top pages with drill-down potential
 *
 * Requires: Google integration connected + GSC property selected on the project.
 */

import { useState, useMemo } from 'react'
import {
  Search, TrendingUp, MousePointerClick, Eye, ArrowUpDown,
  Filter, Download, RefreshCw, Loader2, AlertCircle, Settings,
  Zap, Globe, ArrowUp, ArrowDown, ChevronRight, ExternalLink,
} from 'lucide-react'
import { useGoogleIntegration } from '../hooks/useGoogleIntegration'
import { useGscData } from '../hooks/useGscData'
import { formatSiteUrl } from '../utils/gscApi'

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginTop: '0.125rem' }}>
          {label}
        </div>
        {subValue && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sortable Table Header ── */
function SortHeader({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey
  const isAsc = isActive && currentSort.dir === 'asc'
  return (
    <button
      onClick={() => onSort(sortKey)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06rem',
        color: isActive ? 'var(--color-phase-1)' : 'var(--text-disabled)',
        padding: 0,
      }}
    >
      {label}
      {isActive && (isAsc ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
    </button>
  )
}

/* ── AEO Type Badge ── */
const AEO_TYPE_COLORS = {
  definition: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
  'how-to': { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
  comparison: { bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6' },
  listicle: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
  informational: { bg: 'rgba(6,182,212,0.1)', color: '#06B6D4' },
  question: { bg: 'rgba(236,72,153,0.1)', color: '#EC4899' },
}

function AeoTypeBadge({ type }) {
  if (!type) return null
  const style = AEO_TYPE_COLORS[type] || { bg: 'var(--hover-bg)', color: 'var(--text-tertiary)' }
  return (
    <span style={{
      fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04rem',
      padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
      background: style.bg, color: style.color, flexShrink: 0,
    }}>
      {type}
    </span>
  )
}

/* ── Mini Sparkline (CSS-only bar chart) ── */
function MiniSparkline({ data, dataKey = 'clicks', color = 'var(--color-phase-1)', height = 32 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d[dataKey] || 0), 1)
  const barWidth = Math.max(2, Math.min(6, 200 / data.length))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            width: barWidth,
            height: `${Math.max(1, (d[dataKey] / max) * 100)}%`,
            background: color,
            borderRadius: '1px',
            opacity: 0.7 + (i / data.length) * 0.3,
          }}
          title={`${d.date}: ${d[dataKey]} ${dataKey}`}
        />
      ))}
    </div>
  )
}

/* ── Not Connected / No Property Empty States ── */
function NotConnectedState({ setActiveView }) {
  return (
    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
        background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Globe size={24} style={{ color: '#3B82F6' }} />
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
          Connect Google Account
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '28rem' }}>
          Connect your Google account in Settings to view Search Console data. This will show real search performance, AEO query detection, and page analytics.
        </p>
      </div>
      <button className="btn-primary" style={{ fontSize: '0.8125rem' }} onClick={() => setActiveView('settings')}>
        <Settings size={14} />
        Go to Settings
      </button>
    </div>
  )
}

function NoPropertyState({ setActiveView }) {
  return (
    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
        background: 'rgba(255,107,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Search size={24} style={{ color: '#FF6B35' }} />
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
          Select a Search Console Property
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '28rem' }}>
          Your Google account is connected. Select a Search Console property in the project settings to start viewing data.
        </p>
      </div>
      <button className="btn-primary" style={{ fontSize: '0.8125rem' }} onClick={() => setActiveView('settings')}>
        <Settings size={14} />
        Select Property
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════════════════════════ */

export default function GscView({ activeProject, updateProject, user, setActiveView }) {
  const google = useGoogleIntegration(user)
  const gscProperty = activeProject?.gscProperty || null

  const [activeTab, setActiveTab] = useState('queries') // queries | aeo | pages
  const [datePreset, setDatePreset] = useState('28d')
  const [searchFilter, setSearchFilter] = useState('')
  const [sort, setSort] = useState({ key: 'clicks', dir: 'desc' })
  const [showTop, setShowTop] = useState(50)

  const { queryData, pageData, dateData, loading, error, refresh } = useGscData(
    google.accessToken,
    gscProperty,
    { datePreset, enabled: google.isConnected && !!gscProperty }
  )

  // ── Sort handler ──
  const handleSort = (key) => {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }))
  }

  // ── Filtered & sorted rows ──
  const filteredQueryRows = useMemo(() => {
    if (!queryData?.rows) return []
    let rows = activeTab === 'aeo' ? queryData.aeoRows : queryData.rows
    if (searchFilter) {
      const q = searchFilter.toLowerCase()
      rows = rows.filter(r => r.query?.toLowerCase().includes(q))
    }
    rows = [...rows].sort((a, b) => {
      const aVal = a[sort.key] || 0
      const bVal = b[sort.key] || 0
      return sort.dir === 'desc' ? bVal - aVal : aVal - bVal
    })
    return rows.slice(0, showTop)
  }, [queryData, activeTab, searchFilter, sort, showTop])

  const filteredPageRows = useMemo(() => {
    if (!pageData?.rows) return []
    let rows = pageData.rows
    if (searchFilter) {
      const q = searchFilter.toLowerCase()
      rows = rows.filter(r => r.page?.toLowerCase().includes(q))
    }
    rows = [...rows].sort((a, b) => {
      const aVal = a[sort.key] || 0
      const bVal = b[sort.key] || 0
      return sort.dir === 'desc' ? bVal - aVal : aVal - bVal
    })
    return rows.slice(0, showTop)
  }, [pageData, searchFilter, sort, showTop])

  // ── Export to CSV ──
  const handleExportCsv = () => {
    const rows = activeTab === 'pages' ? filteredPageRows : filteredQueryRows
    if (!rows.length) return

    let csv
    if (activeTab === 'pages') {
      csv = 'Page,Clicks,Impressions,CTR,Position\n'
      rows.forEach(r => {
        csv += `"${r.page}",${r.clicks},${r.impressions},${(r.ctr * 100).toFixed(2)}%,${r.position.toFixed(1)}\n`
      })
    } else {
      csv = 'Query,Clicks,Impressions,CTR,Position,AEO Query,AEO Type\n'
      rows.forEach(r => {
        csv += `"${r.query}",${r.clicks},${r.impressions},${(r.ctr * 100).toFixed(2)}%,${r.position.toFixed(1)},${r.isAeoQuery},${r.aeoType || ''}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gsc-${activeTab}-${datePreset}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Empty states ──
  if (!google.isConnected && !google.isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Search Console
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            Real search performance data from Google Search Console
          </p>
        </div>
        <NotConnectedState setActiveView={setActiveView} />
      </div>
    )
  }

  if (google.isConnected && !gscProperty) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Search Console
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            Real search performance data from Google Search Console
          </p>
        </div>
        <NoPropertyState setActiveView={setActiveView} />
      </div>
    )
  }

  const fmt = (n) => typeof n === 'number' ? n.toLocaleString() : '—'
  const fmtPct = (n) => typeof n === 'number' ? `${(n * 100).toFixed(1)}%` : '—'
  const fmtPos = (n) => typeof n === 'number' ? n.toFixed(1) : '—'

  const TABS = [
    { id: 'queries', label: 'All Queries', icon: Search },
    { id: 'aeo', label: 'AEO Queries', icon: Zap },
    { id: 'pages', label: 'Pages', icon: Globe },
  ]

  const DATE_PRESETS = [
    { value: '7d', label: '7d' },
    { value: '28d', label: '28d' },
    { value: '3m', label: '3m' },
    { value: '6m', label: '6m' },
    { value: '12m', label: '12m' },
    { value: '16m', label: '16m' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Search Console
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {formatSiteUrl(gscProperty)} — real search performance data
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Date range */}
          <div style={{ display: 'flex', gap: '0.125rem', background: 'var(--hover-bg)', borderRadius: '0.5rem', padding: '0.125rem' }}>
            {DATE_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => setDatePreset(p.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  background: datePreset === p.value ? 'var(--color-phase-1)' : 'transparent',
                  color: datePreset === p.value ? '#fff' : 'var(--text-tertiary)',
                  transition: 'all 100ms',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={refresh} title="Refresh data" disabled={loading}>
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
          </button>
          <button className="icon-btn" onClick={handleExportCsv} title="Export CSV">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}>
          <AlertCircle size={14} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-error)' }}>{error}</span>
        </div>
      )}

      {/* Stat cards */}
      {queryData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '0.75rem' }}>
          <StatCard
            icon={MousePointerClick}
            label="Total Clicks"
            value={fmt(queryData.totalClicks)}
            color="#FF6B35"
          />
          <StatCard
            icon={Eye}
            label="Total Impressions"
            value={fmt(queryData.totalImpressions)}
            color="#3B82F6"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg CTR"
            value={fmtPct(queryData.avgCtr)}
            color="#10B981"
          />
          <StatCard
            icon={ArrowUpDown}
            label="Avg Position"
            value={fmtPos(queryData.avgPosition)}
            color="#8B5CF6"
          />
          <StatCard
            icon={Zap}
            label="AEO Queries"
            value={fmt(queryData.aeoQueryCount)}
            subValue={`${fmtPct(queryData.aeoClickShare)} of clicks`}
            color="#F59E0B"
          />
        </div>
      )}

      {/* Sparkline */}
      {dateData && dateData.rows.length > 0 && (
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)',
            }}>
              Daily Clicks
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
              {dateData.rows[0]?.date} — {dateData.rows[dateData.rows.length - 1]?.date}
            </span>
          </div>
          <MiniSparkline data={dateData.rows} dataKey="clicks" height={48} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchFilter(''); setSort({ key: 'clicks', dir: 'desc' }); setShowTop(50) }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.4375rem 0.75rem',
              fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
              border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
              background: activeTab === tab.id ? 'var(--color-phase-1)' : 'var(--hover-bg)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 100ms',
            }}
          >
            <tab.icon size={13} />
            {tab.label}
            {tab.id === 'aeo' && queryData && (
              <span style={{
                fontSize: '0.5625rem', fontWeight: 700,
                padding: '0.0625rem 0.3125rem', borderRadius: '0.25rem',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,107,53,0.1)',
                color: activeTab === tab.id ? '#fff' : 'var(--color-phase-1)',
              }}>
                {queryData.aeoQueryCount}
              </span>
            )}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Search filter */}
        <div style={{ position: 'relative', width: '14rem' }}>
          <Filter size={12} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="input-field"
            placeholder={activeTab === 'pages' ? 'Filter pages...' : 'Filter queries...'}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ paddingLeft: '1.75rem', fontSize: '0.75rem', height: '2rem' }}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && !queryData && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 size={24} style={{ color: 'var(--color-phase-1)', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading Search Console data...</p>
        </div>
      )}

      {/* Query / AEO Table */}
      {(activeTab === 'queries' || activeTab === 'aeo') && queryData && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: activeTab === 'aeo' ? '1fr 5.5rem auto 4.5rem 4.5rem 4.5rem 4.5rem' : '1fr 4.5rem 4.5rem 4.5rem 4.5rem',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--hover-bg)',
            alignItems: 'center',
          }}>
            <SortHeader label="Query" sortKey="query" currentSort={sort} onSort={(k) => handleSort(k)} />
            {activeTab === 'aeo' && (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)' }}>Type</span>
                <span />
              </>
            )}
            <SortHeader label="Clicks" sortKey="clicks" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Impr" sortKey="impressions" currentSort={sort} onSort={handleSort} />
            <SortHeader label="CTR" sortKey="ctr" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Pos" sortKey="position" currentSort={sort} onSort={handleSort} />
          </div>

          {/* Rows */}
          {filteredQueryRows.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
              {searchFilter ? 'No matching queries' : 'No query data available'}
            </div>
          ) : (
            filteredQueryRows.map((row, i) => (
              <div
                key={row.query + i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: activeTab === 'aeo' ? '1fr 5.5rem auto 4.5rem 4.5rem 4.5rem 4.5rem' : '1fr 4.5rem 4.5rem 4.5rem 4.5rem',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  alignItems: 'center',
                  fontSize: '0.8125rem',
                  transition: 'background 100ms',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}>
                  {row.isAeoQuery && activeTab !== 'aeo' && (
                    <Zap size={11} style={{ color: '#F59E0B', flexShrink: 0 }} />
                  )}
                  {row.query}
                </div>
                {activeTab === 'aeo' && (
                  <>
                    <AeoTypeBadge type={row.aeoType} />
                    <span />
                  </>
                )}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {fmt(row.clicks)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {fmt(row.impressions)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {fmtPct(row.ctr)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: row.position <= 3 ? '#10B981' : row.position <= 10 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                  {fmtPos(row.position)}
                </div>
              </div>
            ))
          )}

          {/* Show more */}
          {((activeTab === 'aeo' ? queryData.aeoRows.length : queryData.rows.length) > showTop) && (
            <button
              onClick={() => setShowTop(prev => prev + 50)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                width: '100%', padding: '0.75rem',
                background: 'none', border: 'none', borderTop: '1px solid var(--border-subtle)',
                color: 'var(--color-phase-1)', fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
              }}
            >
              Show more
              <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
            </button>
          )}
        </div>
      )}

      {/* Pages Table */}
      {activeTab === 'pages' && pageData && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 4.5rem 4.5rem 4.5rem 4.5rem 2rem',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--hover-bg)',
            alignItems: 'center',
          }}>
            <SortHeader label="Page" sortKey="page" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Clicks" sortKey="clicks" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Impr" sortKey="impressions" currentSort={sort} onSort={handleSort} />
            <SortHeader label="CTR" sortKey="ctr" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Pos" sortKey="position" currentSort={sort} onSort={handleSort} />
            <span />
          </div>

          {filteredPageRows.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
              {searchFilter ? 'No matching pages' : 'No page data available'}
            </div>
          ) : (
            filteredPageRows.map((row, i) => {
              let displayUrl
              try {
                const u = new URL(row.page)
                displayUrl = u.pathname + u.search
              } catch {
                displayUrl = row.page
              }

              return (
                <div
                  key={row.page + i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 4.5rem 4.5rem 4.5rem 4.5rem 2rem',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    alignItems: 'center',
                    fontSize: '0.8125rem',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {displayUrl}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {fmt(row.clicks)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {fmt(row.impressions)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {fmtPct(row.ctr)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: row.position <= 3 ? '#10B981' : row.position <= 10 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {fmtPos(row.position)}
                  </div>
                  <a
                    href={row.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
                    title="Open page"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              )
            })
          )}

          {pageData.rows.length > showTop && (
            <button
              onClick={() => setShowTop(prev => prev + 50)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                width: '100%', padding: '0.75rem',
                background: 'none', border: 'none', borderTop: '1px solid var(--border-subtle)',
                color: 'var(--color-phase-1)', fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
              }}
            >
              Show more
              <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
