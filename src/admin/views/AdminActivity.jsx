import { useState, useMemo } from 'react'
import { Activity, Search, RefreshCw, Filter } from 'lucide-react'
import { useAdminStats } from '../hooks/useAdminStats'

/* ── Helpers ── */
function timeAgo(dateInput) {
  if (!dateInput) return 'Never'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

const ACTIVITY_LABELS = {
  check: 'Checked task',
  uncheck: 'Unchecked task',
  note: 'Updated notes',
  analyze: 'Ran analyzer',
  contentWrite: 'Generated content',
  schemaGenerate: 'Generated schema',
  generateFix: 'Generated fix',
  monitor: 'Ran monitor',
  competitor_add: 'Added competitor',
  competitor_remove: 'Removed competitor',
  competitor_analyze: 'Analyzed competitors',
  task_assign: 'Assigned task',
  task_unassign: 'Unassigned task',
  comment_add: 'Added comment',
  member_add: 'Added team member',
  member_remove: 'Removed member',
  role_change: 'Changed role',
  export_pdf: 'Exported PDF',
}

const ACTIVITY_COLORS = {
  check: '#10B981',
  uncheck: '#6B7280',
  note: '#3B82F6',
  analyze: '#8B5CF6',
  contentWrite: '#EC4899',
  schemaGenerate: '#06B6D4',
  generateFix: '#F59E0B',
  monitor: '#0EA5E9',
  task_assign: '#FF6B35',
  comment_add: '#6366F1',
  member_add: '#10B981',
  member_remove: '#EF4444',
  role_change: '#F59E0B',
}

/* ── Main ── */
export default function AdminActivity({ user }) {
  const { stats, loading, error, refresh } = useAdminStats(user)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const activityTypes = useMemo(() => {
    if (!stats?.recentActivity) return []
    const types = new Set(stats.recentActivity.map(a => a.type))
    return [...types].sort()
  }, [stats?.recentActivity])

  const filtered = useMemo(() => {
    if (!stats?.recentActivity) return []
    let list = stats.recentActivity
    if (typeFilter !== 'all') {
      list = list.filter(a => a.type === typeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        (a.authorName || '').toLowerCase().includes(q) ||
        (a._projectName || '').toLowerCase().includes(q) ||
        (a.itemText || '').toLowerCase().includes(q) ||
        (ACTIVITY_LABELS[a.type] || a.type || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [stats?.recentActivity, typeFilter, search])

  if (loading && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading activity...</p>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>
        <button onClick={handleRefresh} className="btn-primary">Retry</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Activity Log
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {stats?.recentActivity?.length || 0} recent events
          </p>
        </div>
        <button onClick={handleRefresh} className="icon-btn" title="Refresh" disabled={refreshing} style={{ opacity: refreshing ? 0.5 : 1 }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '12rem' }}>
          <Search size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
          />
        </div>
        <div className="card" style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={14} style={{ color: 'var(--text-disabled)' }} />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Types</option>
            {activityTypes.map(t => (
              <option key={t} value={t}>{ACTIVITY_LABELS[t] || t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ maxHeight: '40rem', overflowY: 'auto' }}>
          {filtered.map((act, i) => {
            const color = ACTIVITY_COLORS[act.type] || '#6B7280'
            return (
              <div key={act.id || i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {/* Dot */}
                <div style={{
                  width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                  background: color, flexShrink: 0, marginTop: '0.375rem',
                }} />
                {/* Time */}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                  color: 'var(--text-disabled)', minWidth: '4rem', flexShrink: 0, paddingTop: '0.0625rem',
                }}>
                  {timeAgo(act.timestamp)}
                </span>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {act.authorName && (
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.authorName}</span>
                    )}{' '}
                    {ACTIVITY_LABELS[act.type] || act.type}
                    {act.itemText && (
                      <span style={{ color: 'var(--text-tertiary)' }}> — {act.itemText}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                    {act._projectName}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
              {search || typeFilter !== 'all' ? 'No matching activity' : 'No activity recorded yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
