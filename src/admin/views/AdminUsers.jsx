import { useState, useMemo } from 'react'
import {
  Users, Search, Mail, Calendar, Clock, FolderKanban,
  ChevronDown, ChevronUp, Shield, RefreshCw,
} from 'lucide-react'
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

function formatDate(dateInput) {
  if (!dateInput) return '—'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const AVATAR_COLORS = [
  '#FF6B35', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899',
  '#F59E0B', '#06B6D4', '#EF4444', '#84CC16', '#6366F1',
]

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/* ── Sort options ── */
const SORT_OPTIONS = [
  { key: 'createdAt', label: 'Joined' },
  { key: 'lastLoginAt', label: 'Last Active' },
  { key: 'displayName', label: 'Name' },
  { key: 'projects', label: 'Projects' },
]

/* ── User Detail Panel ── */
function UserDetail({ user, projects, onClose }) {
  const userProjects = projects.filter(
    p => p._ownerUid === user.id || p.memberIds?.includes(user.id)
  )

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: user.photoURL ? 'transparent' : getAvatarColor(user.displayName || user.email),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(user.displayName || user.email)
            }
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {user.displayName || 'No Name'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{user.email || '—'}</div>
            {user.agency && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                {user.agency}
              </div>
            )}
          </div>
        </div>
        <button onClick={onClose} className="icon-btn" title="Close" style={{ fontSize: '0.75rem' }}>
          &times;
        </button>
      </div>

      {/* Info grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>
            UID
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
            {user.id}
          </div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>
            Joined
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {formatDate(user.createdAt)}
          </div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>
            Last Active
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {timeAgo(user.lastLoginAt)}
          </div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>
            Role
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {user.role || 'owner'}
          </div>
        </div>
      </div>

      {/* User's projects */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
        Projects ({userProjects.length})
      </div>
      {userProjects.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {userProjects.map(p => {
            const checked = p.checked || {}
            const total = Object.keys(checked).length
            const done = Object.values(checked).filter(Boolean).length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <div key={p.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
              }}>
                <FolderKanban size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name || 'Untitled'}
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-disabled)', padding: '0.5rem 0' }}>
          No projects
        </div>
      )}
    </div>
  )
}

/* ── Main ── */
export default function AdminUsers({ user }) {
  const { stats, loading, error, refresh } = useAdminStats(user)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const parseDate = (d) => {
    if (!d) return null
    if (d.toDate) return d.toDate()
    if (typeof d === 'string') return new Date(d)
    return null
  }

  const filteredUsers = useMemo(() => {
    if (!stats?.users) return []
    const q = search.toLowerCase().trim()
    let list = stats.users
    if (q) {
      list = list.filter(u =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q) ||
        (u.agency || '').toLowerCase().includes(q)
      )
    }
    // Sort
    return [...list].sort((a, b) => {
      let av, bv
      if (sortKey === 'displayName') {
        av = (a.displayName || a.email || '').toLowerCase()
        bv = (b.displayName || b.email || '').toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      if (sortKey === 'projects') {
        av = (stats.projectsByUser[a.id] || []).length
        bv = (stats.projectsByUser[b.id] || []).length
        return sortDir === 'asc' ? av - bv : bv - av
      }
      // Date fields
      av = parseDate(a[sortKey])?.getTime() || 0
      bv = parseDate(b[sortKey])?.getTime() || 0
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [stats, search, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const selectedUser = stats?.users?.find(u => u.id === selectedUserId) || null

  if (loading && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading users...</p>
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}>
            User Management
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {stats?.totalUsers || 0} registered users
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="icon-btn"
          title="Refresh"
          disabled={refreshing}
          style={{ opacity: refreshing ? 0.5 : 1 }}
        >
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search by name, email, UID, or agency..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-body)',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Selected user detail */}
      {selectedUser && (
        <UserDetail
          user={selectedUser}
          projects={stats?.projects || []}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {/* Users Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  { key: 'displayName', label: 'User' },
                  { key: 'createdAt', label: 'Joined' },
                  { key: 'lastLoginAt', label: 'Last Active' },
                  { key: 'projects', label: 'Projects' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06rem',
                      color: sortKey === col.key ? 'var(--text-primary)' : 'var(--text-disabled)',
                      textAlign: 'left',
                      padding: '0.625rem 1.25rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={12} style={{ display: 'inline', verticalAlign: '-2px', marginLeft: '0.25rem' }} />
                        : <ChevronDown size={12} style={{ display: 'inline', verticalAlign: '-2px', marginLeft: '0.25rem' }} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const projectCount = (stats.projectsByUser[u.id] || []).length
                const isSelected = selectedUserId === u.id
                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUserId(isSelected ? null : u.id)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--hover-bg)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* User */}
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          background: u.photoURL ? 'transparent' : getAvatarColor(u.displayName || u.email),
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {u.photoURL
                            ? <img src={u.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : getInitials(u.displayName || u.email)
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {u.displayName || u.email?.split('@')[0] || 'User'}
                          </div>
                          <div style={{
                            fontSize: '0.6875rem',
                            color: 'var(--text-disabled)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {u.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Joined */}
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    {/* Last Active */}
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {timeAgo(u.lastLoginAt)}
                    </td>
                    {/* Projects */}
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      {projectCount}
                    </td>
                  </tr>
                )
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-disabled)',
                    fontSize: '0.8125rem',
                  }}>
                    {search ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
