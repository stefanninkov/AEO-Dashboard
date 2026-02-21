import { useState, useEffect, useMemo, useCallback } from 'react'
import { UserPlus, Search, RefreshCw, Download, Mail, TrendingUp, Users } from 'lucide-react'
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'

function timeAgo(dateInput) {
  if (!dateInput) return 'Unknown'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  if (isNaN(date.getTime())) return 'Unknown'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function formatDate(dateInput) {
  if (!dateInput) return 'Unknown'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  if (isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminWaitlist({ user }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchEntries = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'waitlist'), orderBy('signedUpAt', 'desc')))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setEntries(items)
    } catch (err) {
      console.error('Failed to fetch waitlist:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEntries()
    setRefreshing(false)
  }

  const handleStatusChange = async (entryId, newStatus) => {
    try {
      await updateDoc(doc(db, 'waitlist', entryId), { status: newStatus })
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: newStatus } : e))
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleExportCsv = () => {
    const headers = ['Email', 'Signed Up', 'Status', 'Source']
    const rows = filtered.map(e => [
      e.email,
      formatDate(e.signedUpAt),
      e.status || 'active',
      e.source || 'direct',
    ])
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filtering
  const filtered = useMemo(() => {
    let result = entries
    if (statusFilter !== 'all') {
      result = result.filter(e => (e.status || 'active') === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(e => (e.email || '').toLowerCase().includes(q))
    }
    return result
  }, [entries, search, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const total = entries.length
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const dayAgo = now - 24 * 60 * 60 * 1000
    const thisWeek = entries.filter(e => {
      const date = e.signedUpAt?.toDate ? e.signedUpAt.toDate() : new Date(e.signedUpAt)
      return date.getTime() > weekAgo
    }).length
    const today = entries.filter(e => {
      const date = e.signedUpAt?.toDate ? e.signedUpAt.toDate() : new Date(e.signedUpAt)
      return date.getTime() > dayAgo
    }).length
    return { total, thisWeek, today }
  }, [entries])

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading waitlist...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Waitlist Signups
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {stats.total} total &middot; {stats.thisWeek} this week &middot; {stats.today} today
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportCsv} className="icon-btn" title="Export CSV" disabled={filtered.length === 0}>
            <Download size={16} />
          </button>
          <button onClick={handleRefresh} className="icon-btn" title="Refresh" disabled={refreshing} style={{ opacity: refreshing ? 0.5 : 1 }}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Total Signups', value: stats.total, icon: Users, color: '#FF6B35' },
          { label: 'This Week', value: stats.thisWeek, icon: TrendingUp, color: '#3B82F6' },
          { label: 'Today', value: stats.today, icon: UserPlus, color: '#10B981' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{
                width: '2.25rem', height: '2.25rem', borderRadius: 8,
                background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="card" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '12rem' }}>
          <Search size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)' }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {['all', 'active', 'converted', 'unsubscribed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.375rem 0.75rem', borderRadius: 99, fontSize: '0.6875rem',
                fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
                border: 'none', transition: 'all 150ms',
                background: statusFilter === status ? 'var(--color-phase-1)' : 'var(--hover-bg)',
                color: statusFilter === status ? '#fff' : 'var(--text-tertiary)',
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ maxHeight: '40rem', overflowY: 'auto' }}>
          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.75rem 1.25rem',
            borderBottom: '0.0625rem solid var(--border-subtle)',
            background: 'var(--hover-bg)',
            fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)',
            textTransform: 'uppercase', letterSpacing: '0.04rem',
          }}>
            <span style={{ flex: 1, minWidth: 0 }}>Email</span>
            <span style={{ width: '5rem', flexShrink: 0 }}>Date</span>
            <span style={{ width: '5.5rem', flexShrink: 0 }}>Status</span>
            <span style={{ width: '5rem', flexShrink: 0 }}>Actions</span>
          </div>

          {/* Rows */}
          {filtered.map(entry => {
            const status = entry.status || 'active'
            const statusColors = {
              active: { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
              converted: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
              unsubscribed: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
            }
            const sc = statusColors[status] || statusColors.active

            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: '0.0625rem solid var(--border-subtle)',
                  transition: 'background 150ms',
                }}
              >
                {/* Email */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '1.5rem', height: '1.5rem', borderRadius: 6,
                    background: 'rgba(255,107,53,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Mail size={11} style={{ color: 'var(--color-phase-1)' }} />
                  </div>
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {entry.email}
                  </span>
                </div>

                {/* Date */}
                <span style={{
                  width: '5rem', flexShrink: 0,
                  fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-disabled)',
                }}>
                  {timeAgo(entry.signedUpAt)}
                </span>

                {/* Status */}
                <span style={{
                  width: '5.5rem', flexShrink: 0,
                  fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.04rem',
                  padding: '0.125rem 0.5rem', borderRadius: 99,
                  background: sc.bg, color: sc.color,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {status}
                </span>

                {/* Actions */}
                <div style={{ width: '5rem', flexShrink: 0, display: 'flex', gap: '0.25rem' }}>
                  {status === 'active' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(entry.id, 'converted')}
                        style={{
                          background: 'none', border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                          padding: '0.125rem 0.375rem', fontSize: '0.5625rem', fontWeight: 600,
                          color: '#3B82F6', cursor: 'pointer', fontFamily: 'var(--font-body)',
                        }}
                      >
                        Convert
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
              {search || statusFilter !== 'all' ? 'No matching entries' : 'No waitlist signups yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
