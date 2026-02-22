import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  MessageSquare, SearchCheck, RefreshCw, Filter, ChevronDown, ChevronUp,
  Monitor, Eye, CheckCircle, Bug, Lightbulb, MessageCircle,
  AlertTriangle, ArrowUp, Minus as MinusIcon, Clock,
  Heart, ThumbsUp, ThumbsDown,
} from 'lucide-react'
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import logger from '../../utils/logger'

const RATING_ICONS = {
  love: { Icon: Heart, color: '#EF4444' },
  good: { Icon: ThumbsUp, color: '#10B981' },
  okay: { Icon: MinusIcon, color: '#F59E0B' },
  frustrated: { Icon: ThumbsDown, color: '#EF4444' },
}
const RATING_LABELS = { love: 'Love it', good: 'Good', okay: 'Okay', frustrated: 'Frustrating' }

const CATEGORY_CONFIG = {
  bug: { label: 'Bug Report', icon: Bug, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  feature: { label: 'Feature Request', icon: Lightbulb, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  general: { label: 'General', icon: MessageCircle, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
}

const SEVERITY_CONFIG = {
  blocker: { label: 'Blocker', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  major: { label: 'Major', color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  minor: { label: 'Minor', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  cosmetic: { label: 'Cosmetic', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  nice: { label: 'Nice to Have', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  idea: { label: 'Just an Idea', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
}

const STATUS_CONFIG = {
  new: { label: 'New', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  reviewed: { label: 'Reviewed', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  planned: { label: 'Planned', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  'in-progress': { label: 'In Progress', color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  resolved: { label: 'Resolved', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  declined: { label: 'Declined', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
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

function Badge({ config, value }) {
  const c = config[value]
  if (!c) return null
  return (
    <span style={{
      fontSize: '0.625rem', fontWeight: 700,
      padding: '0.125rem 0.4375rem', borderRadius: 99,
      background: c.bg, color: c.color, whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  )
}

export default function AdminFeedback({ user }) {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [adminNotes, setAdminNotes] = useState({})

  const fetchFeedback = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setFeedback(items)
    } catch (err) {
      logger.error('Failed to fetch feedback:', err)
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
      logger.error('Failed to update status:', err)
    }
  }

  const handleSaveNote = async (id) => {
    const note = adminNotes[id] || ''
    try {
      await updateDoc(doc(db, 'feedback', id), { adminNote: note })
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, adminNote: note } : f))
    } catch (err) {
      logger.error('Failed to save note:', err)
    }
  }

  const filtered = useMemo(() => {
    let list = feedback
    if (statusFilter !== 'all') {
      list = list.filter(f => (f.status || 'new') === statusFilter)
    }
    if (categoryFilter !== 'all') {
      list = list.filter(f => f.category === categoryFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        (f.message || '').toLowerCase().includes(q) ||
        (f.displayName || '').toLowerCase().includes(q) ||
        (f.userEmail || '').toLowerCase().includes(q) ||
        (f.featureTitle || '').toLowerCase().includes(q) ||
        (f.fields?.what_happened || '').toLowerCase().includes(q) ||
        (f.fields?.description || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [feedback, statusFilter, categoryFilter, search])

  // Stats
  const stats = useMemo(() => {
    const total = feedback.length
    const newCount = feedback.filter(f => !f.status || f.status === 'new').length
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const thisWeek = feedback.filter(f => {
      const date = f.createdAt?.toDate ? f.createdAt.toDate() : new Date(f.createdAt)
      return date.getTime() > weekAgo
    }).length
    const bugs = feedback.filter(f => f.category === 'bug').length
    const features = feedback.filter(f => f.category === 'feature').length
    const general = feedback.filter(f => f.category === 'general' || !f.category).length
    const ratings = { love: 0, good: 0, okay: 0, frustrated: 0 }
    feedback.forEach(f => { if (f.rating && ratings[f.rating] !== undefined) ratings[f.rating]++ })
    // Severity breakdown for bugs
    const severities = { blocker: 0, major: 0, minor: 0, cosmetic: 0 }
    feedback.filter(f => f.category === 'bug').forEach(f => {
      if (f.severity && severities[f.severity] !== undefined) severities[f.severity]++
    })
    return { total, newCount, thisWeek, bugs, features, general, ratings, severities }
  }, [feedback])

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
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

      {/* Category Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: '0.75rem' }}>
        {/* Bug Reports */}
        <div
          className="card"
          onClick={() => setCategoryFilter(categoryFilter === 'bug' ? 'all' : 'bug')}
          style={{
            padding: '1rem', textAlign: 'center', cursor: 'pointer',
            border: categoryFilter === 'bug' ? '0.125rem solid #EF4444' : '0.125rem solid transparent',
            transition: 'border-color 150ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <Bug size={14} style={{ color: '#EF4444' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bugs</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            {stats.bugs}
          </div>
          {stats.severities.blocker > 0 && (
            <div style={{ fontSize: '0.5625rem', color: '#EF4444', fontWeight: 700, marginTop: '0.25rem' }}>
              {stats.severities.blocker} blocker{stats.severities.blocker > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Feature Requests */}
        <div
          className="card"
          onClick={() => setCategoryFilter(categoryFilter === 'feature' ? 'all' : 'feature')}
          style={{
            padding: '1rem', textAlign: 'center', cursor: 'pointer',
            border: categoryFilter === 'feature' ? '0.125rem solid #8B5CF6' : '0.125rem solid transparent',
            transition: 'border-color 150ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <Lightbulb size={14} style={{ color: '#8B5CF6' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Features</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            {stats.features}
          </div>
        </div>

        {/* General */}
        <div
          className="card"
          onClick={() => setCategoryFilter(categoryFilter === 'general' ? 'all' : 'general')}
          style={{
            padding: '1rem', textAlign: 'center', cursor: 'pointer',
            border: categoryFilter === 'general' ? '0.125rem solid #3B82F6' : '0.125rem solid transparent',
            transition: 'border-color 150ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <MessageCircle size={14} style={{ color: '#3B82F6' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>General</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            {stats.general}
          </div>
        </div>

        {/* Rating Distribution */}
        {Object.entries(RATING_ICONS).map(([key, { Icon, color }]) => (
          <div key={key} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}><Icon size={20} style={{ color }} /></div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              {stats.ratings[key]}
            </div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>{RATING_LABELS[key]}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '12rem' }}>
          <SearchCheck size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
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
              color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ maxHeight: '50rem', overflowY: 'auto' }}>
          {filtered.map(item => {
            const isExpanded = expandedId === item.id
            const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.general
            const CatIcon = cat.icon
            return (
              <div key={item.id}>
                {/* Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1.25rem',
                    borderBottom: '0.0625rem solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--hover-bg)' : 'transparent',
                    transition: 'background 150ms',
                  }}
                >
                  {/* Category icon */}
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem',
                    background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <CatIcon size={12} style={{ color: cat.color }} />
                  </div>

                  {/* Rating (for general) */}
                  {item.rating && RATING_ICONS[item.rating] && (() => {
                    const { Icon, color } = RATING_ICONS[item.rating]
                    return <span style={{ flexShrink: 0, display: 'flex' }}><Icon size={16} style={{ color }} /></span>
                  })()}

                  {/* Main content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.125rem', flexWrap: 'wrap' }}>
                      {/* Title or message preview */}
                      <span style={{
                        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '20rem',
                      }}>
                        {item.featureTitle || (item.message ? item.message.slice(0, 80) : 'No message')}
                      </span>
                      {/* Severity badge (bugs) */}
                      {item.severity && <Badge config={SEVERITY_CONFIG} value={item.severity} />}
                      {/* Priority badge (features) */}
                      {item.priority && <Badge config={PRIORITY_CONFIG} value={item.priority} />}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                      {item.displayName || item.userEmail || 'Anonymous'} &middot; {timeAgo(item.createdAt)}
                      {item.area && <> &middot; {item.area}</>}
                    </div>
                  </div>

                  {/* Status */}
                  <Badge config={STATUS_CONFIG} value={item.status || 'new'} />

                  {isExpanded
                    ? <ChevronUp size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
                    : <ChevronDown size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
                  }
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{
                    padding: '1rem 1.25rem 1rem 4rem',
                    background: 'var(--hover-bg)',
                    borderBottom: '0.0625rem solid var(--border-subtle)',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  }}>
                    {/* Category-specific fields */}
                    {item.category === 'bug' && (
                      <>
                        <div>
                          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#EF4444', marginBottom: '0.25rem', textTransform: 'uppercase' }}>What Happened</p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {item.fields?.what_happened || item.message || 'N/A'}
                          </p>
                        </div>
                        {item.fields?.expected && (
                          <div>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Expected Behavior</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {item.fields.expected}
                            </p>
                          </div>
                        )}
                        {item.fields?.steps && (
                          <div>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Steps to Reproduce</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {item.fields.steps}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {item.category === 'feature' && (
                      <>
                        {item.featureTitle && (
                          <div>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#8B5CF6', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Feature</p>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.featureTitle}</p>
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Description</p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {item.fields?.description || item.message || 'N/A'}
                          </p>
                        </div>
                        {item.fields?.use_case && (
                          <div>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Use Case</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {item.fields.use_case}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {(item.category === 'general' || !item.category) && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Message</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {item.fields?.message || item.message || 'N/A'}
                        </p>
                      </div>
                    )}

                    {/* Context */}
                    {item.context && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Context</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {item.context.view && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)' }}>
                              <Eye size={10} /> {item.context.view}
                            </span>
                          )}
                          {item.context.theme && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)' }}>
                              {item.context.theme}
                            </span>
                          )}
                          {item.context.screenSize && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)' }}>
                              <Monitor size={10} /> {item.context.screenSize}
                            </span>
                          )}
                          {item.context.projectName && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)' }}>
                              {item.context.projectName}
                            </span>
                          )}
                          {item.userEmail && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '0.125rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)' }}>
                              {item.userEmail}
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
                            padding: '0.5rem 0.75rem', borderRadius: 8, border: '0.0625rem solid var(--border-subtle)',
                            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {/* Status actions */}
                    <div>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Set Status</p>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {Object.entries(STATUS_CONFIG).map(([key, conf]) => {
                          const isCurrent = (item.status || 'new') === key
                          return (
                            <button
                              key={key}
                              onClick={() => !isCurrent && handleStatusChange(item.id, key)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '0.375rem 0.625rem', borderRadius: 6,
                                border: isCurrent ? `0.0938rem solid ${conf.color}` : '0.0938rem solid transparent',
                                background: isCurrent ? conf.bg : 'var(--hover-bg)',
                                color: isCurrent ? conf.color : 'var(--text-tertiary)',
                                cursor: isCurrent ? 'default' : 'pointer',
                                fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                                opacity: isCurrent ? 1 : 0.8,
                                transition: 'all 150ms',
                              }}
                            >
                              {isCurrent && <CheckCircle size={10} />}
                              {conf.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
              {search || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No matching feedback' : 'No feedback received yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
