import { useState, useEffect, useMemo, useCallback } from 'react'
import { MessageSquare, Search, RefreshCw, Filter, ChevronDown, ChevronUp, Monitor, Globe, Eye, CheckCircle } from 'lucide-react'
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'

const RATING_EMOJI = {
  love: '\uD83D\uDE0D',
  good: '\uD83D\uDE0A',
  okay: '\uD83D\uDE10',
  frustrated: '\uD83D\uDE1F',
}

const RATING_LABELS = {
  love: 'Love it',
  good: 'Good',
  okay: 'Okay',
  frustrated: 'Frustrating',
}

const CATEGORY_LABELS = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  general: 'General',
}

const CATEGORY_COLORS = {
  bug: '#EF4444',
  feature: '#8B5CF6',
  general: '#3B82F6',
}

const STATUS_LABELS = {
  new: 'New',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
}

const STATUS_COLORS = {
  new: '#F59E0B',
  reviewed: '#3B82F6',
  resolved: '#10B981',
}

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

export default function AdminFeedback({ user }) {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [adminNotes, setAdminNotes] = useState({})

  const fetchFeedback = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setFeedback(items)
    } catch (err) {
      console.error('Failed to fetch feedback:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFeedback() }, [fetchFeedback])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchFeedback()
    setRefreshing(false)
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'feedback', id), { status: newStatus })
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f))
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleSaveNote = async (id) => {
    const note = adminNotes[id] || ''
    try {
      await updateDoc(doc(db, 'feedback', id), { adminNote: note })
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, adminNote: note } : f))
    } catch (err) {
      console.error('Failed to save note:', err)
    }
  }

  const filtered = useMemo(() => {
    let list = feedback
    if (statusFilter !== 'all') {
      list = list.filter(f => f.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        (f.message || '').toLowerCase().includes(q) ||
        (f.displayName || '').toLowerCase().includes(q) ||
        (f.userEmail || '').toLowerCase().includes(q) ||
        (CATEGORY_LABELS[f.category] || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [feedback, statusFilter, search])

  // Stats
  const stats = useMemo(() => {
    const total = feedback.length
    const newCount = feedback.filter(f => f.status === 'new').length
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const thisWeek = feedback.filter(f => {
      const date = f.createdAt?.toDate ? f.createdAt.toDate() : new Date(f.createdAt)
      return date.getTime() > weekAgo
    }).length
    const ratings = { love: 0, good: 0, okay: 0, frustrated: 0 }
    feedback.forEach(f => { if (f.rating && ratings[f.rating] !== undefined) ratings[f.rating]++ })
    return { total, newCount, thisWeek, ratings }
  }, [feedback])

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading feedback...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            User Feedback
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {stats.total} total &middot; {stats.newCount} unreviewed &middot; {stats.thisWeek} this week
          </p>
        </div>
        <button onClick={handleRefresh} className="icon-btn" title="Refresh" disabled={refreshing} style={{ opacity: refreshing ? 0.5 : 1 }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {Object.entries(RATING_EMOJI).map(([key, emoji]) => (
          <div key={key} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              {stats.ratings[key]}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>{RATING_LABELS[key]}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '12rem' }}>
          <Search size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
          />
        </div>
        <div className="card" style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={14} style={{ color: 'var(--text-disabled)' }} />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ maxHeight: '40rem', overflowY: 'auto' }}>
          {filtered.map(item => {
            const isExpanded = expandedId === item.id
            return (
              <div key={item.id}>
                {/* Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem 1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--hover-bg)' : 'transparent',
                    transition: 'background 150ms',
                  }}
                >
                  {/* Rating */}
                  <span style={{ fontSize: 20, flexShrink: 0 }}>
                    {RATING_EMOJI[item.rating] || '\u2753'}
                  </span>

                  {/* Time */}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                    color: 'var(--text-disabled)', minWidth: '4rem', flexShrink: 0,
                  }}>
                    {timeAgo(item.createdAt)}
                  </span>

                  {/* User */}
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: 'var(--text-primary)', minWidth: '6rem', flexShrink: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.displayName || item.userEmail || 'Anonymous'}
                  </span>

                  {/* Category */}
                  {item.category && (
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600,
                      padding: '0.125rem 0.5rem', borderRadius: 99,
                      background: `${CATEGORY_COLORS[item.category] || '#6B7280'}15`,
                      color: CATEGORY_COLORS[item.category] || '#6B7280',
                      flexShrink: 0,
                    }}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  )}

                  {/* Message preview */}
                  <span style={{
                    flex: 1, fontSize: '0.8125rem', color: 'var(--text-tertiary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}>
                    {item.message}
                  </span>

                  {/* Status */}
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600,
                    padding: '0.125rem 0.5rem', borderRadius: 99,
                    background: `${STATUS_COLORS[item.status] || '#6B7280'}15`,
                    color: STATUS_COLORS[item.status] || '#6B7280',
                    flexShrink: 0,
                  }}>
                    {STATUS_LABELS[item.status] || item.status || 'new'}
                  </span>

                  {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />}
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{
                    padding: '1rem 1.25rem 1rem 4rem',
                    background: 'var(--hover-bg)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  }}>
                    {/* Full message */}
                    <div>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Message</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.message}</p>
                    </div>

                    {/* Context */}
                    {item.context && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Context</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {item.context.view && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                              <Eye size={10} /> {item.context.view}
                            </span>
                          )}
                          {item.context.theme && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                              {item.context.theme}
                            </span>
                          )}
                          {item.context.screenSize && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                              <Monitor size={10} /> {item.context.screenSize}
                            </span>
                          )}
                          {item.context.projectName && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                              {item.context.projectName}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin note */}
                    <div>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Admin Note</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Add a note..."
                          value={adminNotes[item.id] !== undefined ? adminNotes[item.id] : item.adminNote || ''}
                          onChange={e => setAdminNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="input-field"
                          style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                        />
                        <button
                          onClick={() => handleSaveNote(item.id)}
                          style={{
                            padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)',
                            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Status actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {item.status !== 'reviewed' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'reviewed')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '0.375rem 0.75rem', borderRadius: 8, border: 'none',
                            background: `${STATUS_COLORS.reviewed}15`, color: STATUS_COLORS.reviewed,
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                          }}
                        >
                          <Eye size={12} /> Mark Reviewed
                        </button>
                      )}
                      {item.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'resolved')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '0.375rem 0.75rem', borderRadius: 8, border: 'none',
                            background: `${STATUS_COLORS.resolved}15`, color: STATUS_COLORS.resolved,
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                          }}
                        >
                          <CheckCircle size={12} /> Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
              {search || statusFilter !== 'all' ? 'No matching feedback' : 'No feedback received yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
