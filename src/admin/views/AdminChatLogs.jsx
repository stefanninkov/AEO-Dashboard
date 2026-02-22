import { useState, useEffect, useMemo, useCallback } from 'react'
import { BotMessageSquare, SearchCheck, RefreshCw, ChevronDown, ChevronUp, User, Bot, MessageCircle } from 'lucide-react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import logger from '../../utils/logger'

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

export default function AdminChatLogs({ user }) {
  const [chatLogs, setChatLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const fetchChatLogs = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'chatLogs'), orderBy('createdAt', 'desc')))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChatLogs(items)
    } catch (err) {
      logger.error('Failed to fetch chat logs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchChatLogs() }, [fetchChatLogs])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchChatLogs()
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return chatLogs
    const q = search.toLowerCase()
    return chatLogs.filter(log =>
      (log.displayName || '').toLowerCase().includes(q) ||
      (log.userEmail || '').toLowerCase().includes(q) ||
      (log.messages || []).some(m => (m.content || '').toLowerCase().includes(q))
    )
  }, [chatLogs, search])

  // Stats
  const stats = useMemo(() => {
    const total = chatLogs.length
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const thisWeek = chatLogs.filter(log => {
      const date = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt)
      return date.getTime() > weekAgo
    }).length
    const totalMessages = chatLogs.reduce((sum, log) => sum + (log.messages?.length || 0), 0)
    const avgMessages = total > 0 ? (totalMessages / total).toFixed(1) : 0
    const uniqueUsers = new Set(chatLogs.map(log => log.userId)).size
    return { total, thisWeek, avgMessages, uniqueUsers }
  }, [chatLogs])

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading chat logs...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            AI Chat Logs
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {stats.total} sessions &middot; {stats.uniqueUsers} unique users &middot; {stats.thisWeek} this week
          </p>
        </div>
        <button onClick={handleRefresh} className="icon-btn" title="Refresh" disabled={refreshing} style={{ opacity: refreshing ? 0.5 : 1 }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(7rem, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Total Sessions', value: stats.total, color: '#FF6B35' },
          { label: 'This Week', value: stats.thisWeek, color: '#3B82F6' },
          { label: 'Avg Messages', value: stats.avgMessages, color: '#8B5CF6' },
          { label: 'Unique Users', value: stats.uniqueUsers, color: '#10B981' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <SearchCheck size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
        />
      </div>

      {/* Chat Log List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ maxHeight: '40rem', overflowY: 'auto' }}>
          {filtered.map(log => {
            const isExpanded = expandedId === log.id
            const userMessages = (log.messages || []).filter(m => m.role === 'user')
            const firstQuestion = userMessages[0]?.content || 'No messages'
            const msgCount = log.messages?.length || 0

            return (
              <div key={log.id}>
                {/* Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem 1.25rem',
                    borderBottom: '0.0625rem solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--hover-bg)' : 'transparent',
                    transition: 'background 150ms',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '1.5rem', height: '1.5rem', borderRadius: 6,
                    background: 'rgba(255,107,53,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <MessageCircle size={12} style={{ color: 'var(--color-phase-1)' }} />
                  </div>

                  {/* Time */}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                    color: 'var(--text-disabled)', minWidth: '4rem', flexShrink: 0,
                  }}>
                    {timeAgo(log.createdAt)}
                  </span>

                  {/* User */}
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: 'var(--text-primary)', minWidth: '6rem', flexShrink: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {log.displayName || log.userEmail || 'Anonymous'}
                  </span>

                  {/* First question preview */}
                  <span style={{
                    flex: 1, fontSize: '0.8125rem', color: 'var(--text-tertiary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}>
                    {firstQuestion}
                  </span>

                  {/* Message count */}
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600,
                    padding: '0.125rem 0.5rem', borderRadius: 99,
                    background: 'rgba(139,92,246,0.1)', color: '#8B5CF6',
                    flexShrink: 0,
                  }}>
                    {msgCount} msg{msgCount !== 1 ? 's' : ''}
                  </span>

                  {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />}
                </div>

                {/* Expanded: Full conversation */}
                {isExpanded && (
                  <div style={{
                    padding: '1rem 1.25rem 1rem 3.5rem',
                    background: 'var(--hover-bg)',
                    borderBottom: '0.0625rem solid var(--border-subtle)',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  }}>
                    {(log.messages || []).map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                        }}
                      >
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: msg.role === 'user' ? 'var(--color-phase-4)' : 'rgba(255,107,53,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {msg.role === 'user'
                            ? <User size={11} style={{ color: '#fff' }} />
                            : <Bot size={11} style={{ color: 'var(--color-phase-1)' }} />
                          }
                        </div>
                        <div style={{
                          flex: 1, fontSize: '0.8125rem', color: 'var(--text-primary)',
                          lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                          {msg.content}
                        </div>
                        <span style={{
                          fontSize: '0.625rem', color: 'var(--text-disabled)',
                          flexShrink: 0, fontFamily: 'var(--font-mono)',
                        }}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    ))}
                    {(!log.messages || log.messages.length === 0) && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-disabled)' }}>No messages in this session</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
              {search ? 'No matching conversations' : 'No chat sessions yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
