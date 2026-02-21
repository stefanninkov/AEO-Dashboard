import { useState, useMemo } from 'react'
import {
  Users, SearchCheck, Mail, Calendar, Clock, FolderKanban,
  ChevronDown, ChevronUp, Shield, RefreshCw, CheckSquare,
  Activity, Sparkles, ChartColumnIncreasing,
} from 'lucide-react'
import { useAdminStats } from '../hooks/useAdminStats'
import NudgeEmailDialog from '../components/NudgeEmailDialog'

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
  if (!dateInput) return '\u2014'
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

const HEALTH_STATUS = {
  active: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Active' },
  'at-risk': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'At Risk' },
  dormant: { color: '#F97316', bg: 'rgba(249,115,22,0.1)', label: 'Dormant' },
  churned: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Churned' },
}

function HealthBadge({ status }) {
  const hs = HEALTH_STATUS[status] || HEALTH_STATUS.active
  return (
    <span style={{
      fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
      padding: '0.125rem 0.375rem', borderRadius: 99,
      background: hs.bg, color: hs.color,
    }}>
      {hs.label}
    </span>
  )
}

const ACTIVITY_LABELS = {
  check: 'Checked task', uncheck: 'Unchecked task', note: 'Updated notes',
  analyze: 'Ran analyzer', contentWrite: 'Generated content', schemaGenerate: 'Generated schema',
  generateFix: 'Generated fix', monitor: 'Ran monitor', competitor_add: 'Added competitor',
  task_assign: 'Assigned task', comment_add: 'Added comment', member_add: 'Added member',
  export_pdf: 'Exported PDF',
}

/* ── Feature Badge ── */
function FeatureBadge({ label, used }) {
  return (
    <span style={{
      fontSize: '0.625rem', fontWeight: 600,
      padding: '0.125rem 0.5rem', borderRadius: 6,
      background: used ? 'rgba(16,185,129,0.1)' : 'var(--hover-bg)',
      color: used ? '#10B981' : 'var(--text-disabled)',
      border: `0.0625rem solid ${used ? 'rgba(16,185,129,0.2)' : 'var(--border-subtle)'}`,
    }}>
      {used ? '\u2713' : '\u2717'} {label}
    </span>
  )
}

/* ── User Detail Panel ── */
function UserDetail({ user, healthData, projects, onClose, onNudge }) {
  const userProjects = projects.filter(
    p => p._ownerUid === user.id || p.memberIds?.includes(user.id)
  )

  // Build timeline from project activity logs
  const timeline = useMemo(() => {
    const events = []
    // Signup event
    if (user.createdAt) {
      events.push({ date: user.createdAt, type: 'signup', text: 'Signed up' })
    }
    // Project creation events
    for (const p of userProjects) {
      if (p.createdAt) {
        events.push({ date: p.createdAt, type: 'project', text: `Created project "${p.name || 'Untitled'}"` })
      }
      // Activity log events
      for (const act of (p.activityLog || []).slice(-20)) {
        const authorMatch = !act.author || act.author.uid === user.id
        if (authorMatch) {
          events.push({
            date: act.timestamp,
            type: act.type,
            text: `${ACTIVITY_LABELS[act.type] || act.type}${act.itemText ? ` \u2014 ${act.itemText}` : ''}`,
            projectName: p.name,
          })
        }
      }
    }
    // Sort by date descending
    return events
      .filter(e => e.date)
      .sort((a, b) => {
        const ad = a.date.toDate ? a.date.toDate() : new Date(a.date)
        const bd = b.date.toDate ? b.date.toDate() : new Date(b.date)
        return bd.getTime() - ad.getTime()
      })
      .slice(0, 30)
  }, [user, userProjects])

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '3rem', height: '3rem', borderRadius: '50%',
            background: user.photoURL ? 'transparent' : getAvatarColor(user.displayName || user.email),
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, flexShrink: 0, overflow: 'hidden',
          }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(user.displayName || user.email)
            }
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {user.displayName || 'No Name'}
              </span>
              {healthData && <HealthBadge status={healthData.status} />}
              {healthData && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                  color: healthData.healthScore >= 60 ? '#10B981' : healthData.healthScore >= 30 ? '#F59E0B' : '#EF4444',
                }}>
                  Score: {healthData.healthScore}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{user.email || '\u2014'}</div>
            {user.agency && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>{user.agency}</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => onNudge?.(user)}
            title="Send nudge email"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.625rem', borderRadius: '0.375rem',
              border: '0.0625rem solid var(--border-subtle)', background: 'none',
              cursor: 'pointer', color: 'var(--text-secondary)',
              fontSize: '0.6875rem', fontWeight: 500, transition: 'all 100ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#F59E0B' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <Mail size={12} /> Nudge
          </button>
          <button onClick={onClose} className="icon-btn" title="Close" style={{ fontSize: '0.75rem' }}>
            &times;
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Joined</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{formatDate(user.createdAt)}</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Last Login</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{timeAgo(user.lastLoginAt)}</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Projects</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{healthData?.projectCount ?? userProjects.length}</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Completion</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{healthData?.completionRate ?? 0}%</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Days Since Login</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{healthData?.daysSinceLogin ?? '\u2014'}</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>UID</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{user.id}</div>
        </div>
      </div>

      {/* Feature Usage */}
      {healthData && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
            Feature Usage
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            <FeatureBadge label="Checklist" used={healthData.completionRate > 0} />
            <FeatureBadge label="Analyzer" used={healthData.usedAnalyzer} />
            <FeatureBadge label="Content Writer" used={healthData.usedContentWriter} />
            <FeatureBadge label="Schema" used={healthData.usedSchema} />
            <FeatureBadge label="Competitors" used={healthData.usedCompetitors} />
            <FeatureBadge label="PDF Export" used={healthData.usedExport} />
            <FeatureBadge label="Team" used={healthData.usedTeam} />
          </div>
        </div>
      )}

      {/* Projects */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
        Projects ({userProjects.length})
      </div>
      {userProjects.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
          {userProjects.map(p => {
            const checked = p.checked || {}
            const total = Object.keys(checked).length
            const done = Object.values(checked).filter(Boolean).length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                background: 'var(--bg-input)', border: '0.0625rem solid var(--border-subtle)',
              }}>
                <FolderKanban size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name || 'Untitled'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '3rem', height: '0.25rem', borderRadius: 2, background: 'var(--hover-bg)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct >= 75 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#3B82F6' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', minWidth: '2rem', textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                  {timeAgo(p.updatedAt)}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-disabled)', padding: '0.5rem 0', marginBottom: '1rem' }}>
          No projects
        </div>
      )}

      {/* Journey Timeline */}
      {timeline.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
            Activity Timeline
          </div>
          <div style={{ maxHeight: '14rem', overflowY: 'auto', borderLeft: '0.125rem solid var(--border-subtle)', marginLeft: '0.5rem', paddingLeft: '1rem' }}>
            {timeline.map((event, i) => (
              <div key={i} style={{ padding: '0.375rem 0', position: 'relative' }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', left: '-1.325rem', top: '0.6rem',
                  width: 8, height: 8, borderRadius: '50%',
                  background: event.type === 'signup' ? '#10B981' : event.type === 'project' ? '#3B82F6' : 'var(--text-disabled)',
                  border: '0.125rem solid var(--bg-card)',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {event.text}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', flexShrink: 0 }}>
                    {timeAgo(event.date)}
                  </span>
                </div>
                {event.projectName && (
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                    {event.projectName}
                  </div>
                )}
              </div>
            ))}
          </div>
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
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [nudgeUser, setNudgeUser] = useState(null)

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

  // Map user health data by id
  const healthMap = useMemo(() => {
    const map = {}
    for (const uh of (stats?.userHealth || [])) {
      map[uh.id] = uh
    }
    return map
  }, [stats?.userHealth])

  const filteredUsers = useMemo(() => {
    if (!stats?.users) return []
    const q = search.toLowerCase().trim()
    let list = stats.users

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(u => (healthMap[u.id]?.status || 'active') === statusFilter)
    }

    if (q) {
      list = list.filter(u =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q) ||
        (u.agency || '').toLowerCase().includes(q)
      )
    }
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
      if (sortKey === 'healthScore') {
        av = healthMap[a.id]?.healthScore || 0
        bv = healthMap[b.id]?.healthScore || 0
        return sortDir === 'asc' ? av - bv : bv - av
      }
      av = parseDate(a[sortKey])?.getTime() || 0
      bv = parseDate(b[sortKey])?.getTime() || 0
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [stats, search, sortKey, sortDir, healthMap, statusFilter])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const selectedUser = stats?.users?.find(u => u.id === selectedUserId) || null

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { active: 0, 'at-risk': 0, dormant: 0, churned: 0 }
    for (const uh of (stats?.userHealth || [])) {
      if (counts[uh.status] !== undefined) counts[uh.status]++
    }
    return counts
  }, [stats?.userHealth])

  if (loading && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            User Management
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {stats?.totalUsers || 0} registered users
          </p>
        </div>
        <button onClick={handleRefresh} className="icon-btn" title="Refresh" disabled={refreshing} style={{ opacity: refreshing ? 0.5 : 1 }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All (${stats?.totalUsers || 0})` },
          { key: 'active', label: `Active (${statusCounts.active})`, color: '#10B981' },
          { key: 'at-risk', label: `At Risk (${statusCounts['at-risk']})`, color: '#F59E0B' },
          { key: 'dormant', label: `Dormant (${statusCounts.dormant})`, color: '#F97316' },
          { key: 'churned', label: `Churned (${statusCounts.churned})`, color: '#EF4444' },
        ].map(pill => (
          <button
            key={pill.key}
            onClick={() => setStatusFilter(pill.key)}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: 99,
              fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              background: statusFilter === pill.key ? (pill.color ? `${pill.color}15` : 'var(--hover-bg)') : 'transparent',
              color: statusFilter === pill.key ? (pill.color || 'var(--text-primary)') : 'var(--text-tertiary)',
              border: statusFilter === pill.key ? `0.0938rem solid ${pill.color || 'var(--border-subtle)'}` : '0.0938rem solid transparent',
              transition: 'all 150ms',
            }}
          >
            {pill.color && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: pill.color, marginRight: 4, verticalAlign: 'middle' }} />}
            {pill.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <SearchCheck size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search by name, email, UID, or agency..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
            Clear
          </button>
        )}
      </div>

      {/* Selected user detail */}
      {selectedUser && (
        <UserDetail
          user={selectedUser}
          healthData={healthMap[selectedUser.id]}
          projects={stats?.projects || []}
          onClose={() => setSelectedUserId(null)}
          onNudge={(u) => setNudgeUser(u)}
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
                  { key: 'healthScore', label: 'Health' },
                  { key: 'createdAt', label: 'Joined' },
                  { key: 'lastLoginAt', label: 'Last Active' },
                  { key: 'projects', label: 'Projects' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06rem',
                      color: sortKey === col.key ? 'var(--text-primary)' : 'var(--text-disabled)',
                      textAlign: 'left', padding: '0.625rem 1.25rem',
                      borderBottom: '0.0625rem solid var(--border-subtle)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={12} style={{ display: 'inline', verticalAlign: '-0.125rem', marginLeft: '0.25rem' }} />
                        : <ChevronDown size={12} style={{ display: 'inline', verticalAlign: '-0.125rem', marginLeft: '0.25rem' }} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const projectCount = (stats.projectsByUser[u.id] || []).length
                const isSelected = selectedUserId === u.id
                const health = healthMap[u.id]
                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUserId(isSelected ? null : u.id)}
                    style={{
                      borderBottom: '0.0625rem solid var(--border-subtle)', cursor: 'pointer',
                      background: isSelected ? 'var(--hover-bg)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Status dot */}
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: HEALTH_STATUS[health?.status]?.color || '#10B981',
                        }} />
                        <div style={{
                          width: '2rem', height: '2rem', borderRadius: '50%',
                          background: u.photoURL ? 'transparent' : getAvatarColor(u.displayName || u.email),
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0, overflow: 'hidden',
                        }}>
                          {u.photoURL
                            ? <img src={u.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : getInitials(u.displayName || u.email)
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.displayName || u.email?.split('@')[0] || 'User'}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                          color: (health?.healthScore || 0) >= 60 ? '#10B981' : (health?.healthScore || 0) >= 30 ? '#F59E0B' : '#EF4444',
                        }}>
                          {health?.healthScore ?? '\u2014'}
                        </span>
                        {health && <HealthBadge status={health.status} />}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {timeAgo(u.lastLoginAt)}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      {projectCount}
                    </td>
                  </tr>
                )
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                    {search || statusFilter !== 'all' ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nudge Email Dialog */}
      <NudgeEmailDialog
        isOpen={!!nudgeUser}
        onClose={() => setNudgeUser(null)}
        targetUser={nudgeUser}
        adminUser={user}
      />
    </div>
  )
}
