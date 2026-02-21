import { useState, useMemo } from 'react'
import {
  FolderKanban, Search, RefreshCw, ChevronDown, ChevronUp,
  Users, ExternalLink, Activity, Zap, FileText, BarChart3,
  Calendar, Target, Clock, AlertTriangle, CheckCircle2,
  XCircle, PauseCircle, Sparkles, Eye,
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
  if (!dateInput) return '--'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const HEALTH_CONFIG = {
  thriving:       { label: 'Thriving',       color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  active:         { label: 'Active',         color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  stale:          { label: 'Stale',          color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  stuck:          { label: 'Stuck',          color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  abandoned:      { label: 'Abandoned',      color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
  'never-started': { label: 'Never Started', color: '#9CA3AF', bg: 'rgba(156,163,175,0.08)' },
}

/* ── Health Badge ── */
function HealthBadge({ badge }) {
  const cfg = HEALTH_CONFIG[badge] || HEALTH_CONFIG.active
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.125rem 0.5rem', borderRadius: '1rem',
      fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.03rem', color: cfg.color, background: cfg.bg,
    }}>
      {cfg.label}
    </span>
  )
}

/* ── Feature Pill ── */
function FeaturePill({ used, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.1875rem 0.5rem', borderRadius: '1rem',
      fontSize: '0.625rem', fontWeight: 600,
      color: used ? '#10B981' : 'var(--text-disabled)',
      background: used ? 'rgba(16,185,129,0.08)' : 'var(--hover-bg)',
      border: `0.0625rem solid ${used ? 'rgba(16,185,129,0.15)' : 'var(--border-subtle)'}`,
    }}>
      {used ? '\u2713' : '\u2717'} {label}
    </span>
  )
}

/* ── Phase Progress Bar ── */
function PhaseProgressBar({ phase, pct }) {
  const color = pct >= 75 ? '#10B981' : pct >= 40 ? '#F59E0B' : pct > 0 ? '#3B82F6' : 'var(--hover-bg)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', width: '4.5rem', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Phase {phase}
      </div>
      <div style={{ flex: 1, height: '0.5rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '0.25rem', background: color, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-disabled)', width: '2.5rem', textAlign: 'right' }}>
        {pct}%
      </div>
    </div>
  )
}

/* ── Project Detail Panel ── */
function ProjectDetail({ project, healthData, onClose }) {
  const checked = project.checked || {}
  const total = Object.keys(checked).length
  const done = Object.values(checked).filter(Boolean).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const members = project.members || []

  const h = healthData || {}

  // Compute per-phase progress (7 phases, items keyed like "1-1-1", "2-1-1" etc)
  const phaseProgress = useMemo(() => {
    const phases = {}
    for (const [key, val] of Object.entries(checked)) {
      const phaseNum = key.split('-')[0]
      if (!phases[phaseNum]) phases[phaseNum] = { total: 0, done: 0 }
      phases[phaseNum].total++
      if (val) phases[phaseNum].done++
    }
    return Object.entries(phases)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([num, data]) => ({
        phase: num,
        pct: data.total > 0 ? Math.round((data.done / data.total) * 100) : 0,
        done: data.done,
        total: data.total,
      }))
  }, [checked])

  // Activity timeline (last 30 events)
  const timeline = useMemo(() => {
    if (!Array.isArray(project.activityLog)) return []
    return [...project.activityLog]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 30)
  }, [project.activityLog])

  const ACTIVITY_LABELS = {
    check: 'Checked task', uncheck: 'Unchecked task', note: 'Updated notes',
    analyze: 'Ran analyzer', contentWrite: 'Generated content', schemaGenerate: 'Generated schema',
    generateFix: 'Generated fix', monitor: 'Ran monitor', task_assign: 'Assigned task',
    comment_add: 'Added comment', member_add: 'Added member', export_pdf: 'Exported PDF',
    competitor_add: 'Added competitor', competitor_analyze: 'Analyzed competitors',
  }

  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {project.name || 'Untitled'}
            </div>
            <HealthBadge badge={h.healthBadge || 'active'} />
          </div>
          {project.url && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ExternalLink size={10} />
              {project.url}
            </div>
          )}
        </div>
        <button onClick={onClose} className="icon-btn" title="Close" style={{ fontSize: '0.875rem' }}>
          &times;
        </button>
      </div>

      {/* Info Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
        gap: '0.75rem', marginBottom: '1.25rem',
      }}>
        {[
          { label: 'Owner', value: project._ownerName || 'Unknown', icon: Users },
          { label: 'Progress', value: `${done}/${total} tasks (${pct}%)`, icon: CheckCircle2 },
          { label: 'Created', value: formatDate(project.createdAt), icon: Calendar },
          { label: 'Last Updated', value: timeAgo(project.updatedAt), icon: Clock },
          { label: 'Days Inactive', value: h.daysSinceActivity != null ? `${h.daysSinceActivity}d` : '--', icon: AlertTriangle },
          { label: 'Storage', value: project._path || '--', icon: FolderKanban },
        ].map(item => (
          <div key={item.label} style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
            <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <item.icon size={10} /> {item.label}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: item.label === 'Storage' ? 'var(--font-mono)' : 'inherit', fontSize: item.label === 'Storage' ? '0.6875rem' : '0.8125rem' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Phase Breakdown */}
      {phaseProgress.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
            Phase Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {phaseProgress.map(p => (
              <PhaseProgressBar key={p.phase} phase={p.phase} pct={p.pct} />
            ))}
          </div>
        </div>
      )}

      {/* Feature Usage */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
          Feature Usage
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          <FeaturePill used={h.usedAnalyzer} label="Analyzer" />
          <FeaturePill used={h.usedContentWriter} label="Content Writer" />
          <FeaturePill used={h.usedSchema} label="Schema" />
          <FeaturePill used={h.usedCompetitors} label="Competitors" />
          <FeaturePill used={h.usedCalendar} label="Calendar" />
          <FeaturePill used={h.usedMetrics} label="Metrics" />
        </div>
      </div>

      {/* Members */}
      {members.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
            Team ({members.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {members.map((m, i) => (
              <div key={m.uid || i} style={{
                padding: '0.375rem 0.75rem', borderRadius: '1rem',
                background: 'var(--bg-input)', border: '0.0625rem solid var(--border-subtle)',
                fontSize: '0.75rem', color: 'var(--text-secondary)',
              }}>
                {m.displayName || m.email || m.uid}
                <span style={{ color: 'var(--text-disabled)', marginLeft: '0.375rem' }}>({m.role || 'member'})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {timeline.length > 0 && (
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
            Recent Activity ({timeline.length})
          </div>
          <div style={{ maxHeight: '15rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {timeline.map((act, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.375rem 0.5rem', borderRadius: '0.375rem',
                background: i % 2 === 0 ? 'transparent' : 'var(--hover-bg)',
              }}>
                <Activity size={12} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600 }}>{act.authorName || 'User'}</span>
                  {' '}{ACTIVITY_LABELS[act.type] || act.type}
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', flexShrink: 0 }}>
                  {act.timestamp ? timeAgo(act.timestamp) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Health Filter Pills ── */
function HealthFilters({ filter, setFilter, counts }) {
  const pills = [
    { key: 'all', label: 'All', count: counts.all, color: 'var(--text-primary)' },
    { key: 'thriving', label: 'Thriving', count: counts.thriving, color: '#10B981' },
    { key: 'active', label: 'Active', count: counts.active, color: '#3B82F6' },
    { key: 'stale', label: 'Stale', count: counts.stale, color: '#F59E0B' },
    { key: 'stuck', label: 'Stuck', count: counts.stuck, color: '#EF4444' },
    { key: 'abandoned', label: 'Abandoned', count: counts.abandoned, color: '#6B7280' },
    { key: 'never-started', label: 'Never Started', count: counts['never-started'], color: '#9CA3AF' },
  ]

  return (
    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
      {pills.map(p => (
        <button
          key={p.key}
          onClick={() => setFilter(p.key)}
          style={{
            padding: '0.25rem 0.625rem', borderRadius: '1rem', border: 'none',
            fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
            background: filter === p.key ? `${p.color}18` : 'var(--hover-bg)',
            color: filter === p.key ? p.color : 'var(--text-disabled)',
            outline: filter === p.key ? `0.0625rem solid ${p.color}40` : 'none',
          }}
        >
          {p.label} ({p.count || 0})
        </button>
      ))}
    </div>
  )
}

/* ── Main ── */
export default function AdminProjects({ user }) {
  const { stats, loading, error, refresh } = useAdminStats(user)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('updatedAt')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [healthFilter, setHealthFilter] = useState('all')

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

  // Build health lookup from projectHealth
  const healthMap = useMemo(() => {
    const map = {}
    if (stats?.projectHealth) {
      for (const p of stats.projectHealth) {
        map[p.id] = p
      }
    }
    return map
  }, [stats?.projectHealth])

  // Filter counts
  const healthCounts = useMemo(() => {
    const counts = { all: 0, thriving: 0, active: 0, stale: 0, stuck: 0, abandoned: 0, 'never-started': 0 }
    if (stats?.projectHealth) {
      counts.all = stats.projectHealth.length
      for (const p of stats.projectHealth) {
        if (counts[p.healthBadge] !== undefined) counts[p.healthBadge]++
      }
    }
    return counts
  }, [stats?.projectHealth])

  const filteredProjects = useMemo(() => {
    if (!stats?.projects) return []
    const q = search.toLowerCase().trim()
    let list = stats.projects
    if (q) {
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.url || '').toLowerCase().includes(q) ||
        (p._ownerName || '').toLowerCase().includes(q)
      )
    }
    // Apply health filter
    if (healthFilter !== 'all') {
      list = list.filter(p => {
        const h = healthMap[p.id]
        return h && h.healthBadge === healthFilter
      })
    }
    return [...list].sort((a, b) => {
      if (sortKey === 'name') {
        const av = (a.name || '').toLowerCase()
        const bv = (b.name || '').toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      if (sortKey === 'progress') {
        const ah = healthMap[a.id]
        const bh = healthMap[b.id]
        const aPct = ah?.progress || 0
        const bPct = bh?.progress || 0
        return sortDir === 'asc' ? aPct - bPct : bPct - aPct
      }
      if (sortKey === 'members') {
        const av = a.members?.length || a.memberIds?.length || 1
        const bv = b.members?.length || b.memberIds?.length || 1
        return sortDir === 'asc' ? av - bv : bv - av
      }
      if (sortKey === 'health') {
        const order = { thriving: 0, active: 1, stale: 2, stuck: 3, abandoned: 4, 'never-started': 5 }
        const av = order[healthMap[a.id]?.healthBadge] ?? 6
        const bv = order[healthMap[b.id]?.healthBadge] ?? 6
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const av = parseDate(a[sortKey])?.getTime() || 0
      const bv = parseDate(b[sortKey])?.getTime() || 0
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [stats, search, sortKey, sortDir, healthFilter, healthMap])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const selectedProject = stats?.projects?.find(p => p.id === selectedProjectId) || null

  if (loading && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading projects...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            All Projects
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {stats?.totalProjects || 0} total &middot; {healthCounts.thriving || 0} thriving &middot; {(healthCounts.stale || 0) + (healthCounts.stuck || 0) + (healthCounts.abandoned || 0)} need attention
          </p>
        </div>
        <button onClick={handleRefresh} className="icon-btn" title="Refresh" disabled={refreshing} style={{ opacity: refreshing ? 0.5 : 1 }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Health overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: '0.5rem' }}>
        {[
          { label: 'Thriving', count: healthCounts.thriving, color: '#10B981', icon: Sparkles },
          { label: 'Active', count: healthCounts.active, color: '#3B82F6', icon: Zap },
          { label: 'Stale', count: healthCounts.stale, color: '#F59E0B', icon: PauseCircle },
          { label: 'Stuck', count: healthCounts.stuck, color: '#EF4444', icon: AlertTriangle },
          { label: 'Abandoned', count: healthCounts.abandoned, color: '#6B7280', icon: XCircle },
          { label: 'Never Started', count: healthCounts['never-started'], color: '#9CA3AF', icon: Eye },
        ].map(item => (
          <div key={item.label} style={{
            padding: '0.75rem', borderRadius: '0.75rem',
            background: `${item.color}08`, border: `0.0625rem solid ${item.color}15`,
            textAlign: 'center', cursor: 'pointer',
          }}
          onClick={() => setHealthFilter(healthFilter === item.label.toLowerCase().replace(' ', '-') ? 'all' : item.label.toLowerCase().replace(' ', '-'))}
          >
            <item.icon size={16} style={{ color: item.color, marginBottom: '0.25rem' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: item.color }}>
              {item.count || 0}
            </div>
            <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.04rem' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <HealthFilters filter={healthFilter} setFilter={setHealthFilter} counts={healthCounts} />

        {/* Search */}
        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by project name, URL, or owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Clear</button>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          healthData={healthMap[selectedProjectId]}
          onClose={() => setSelectedProjectId(null)}
        />
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  { key: 'name', label: 'Project' },
                  { key: 'health', label: 'Health' },
                  { key: 'progress', label: 'Progress' },
                  { key: 'members', label: 'Members' },
                  { key: 'updatedAt', label: 'Updated' },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={() => handleSort(col.key)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06rem',
                      color: sortKey === col.key ? 'var(--text-primary)' : 'var(--text-disabled)',
                      textAlign: 'left', padding: '0.625rem 1.25rem',
                      borderBottom: '0.0625rem solid var(--border-subtle)', cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} style={{ display: 'inline', verticalAlign: '-0.125rem', marginLeft: '0.25rem' }} /> : <ChevronDown size={12} style={{ display: 'inline', verticalAlign: '-0.125rem', marginLeft: '0.25rem' }} />)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(p => {
                const h = healthMap[p.id] || {}
                const pct = h.progress || 0
                const memberCount = h.memberCount || p.members?.length || p.memberIds?.length || 1
                const isSelected = selectedProjectId === p.id

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                    style={{ borderBottom: '0.0625rem solid var(--border-subtle)', cursor: 'pointer', background: isSelected ? 'var(--hover-bg)' : 'transparent' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                        {p.name || 'Untitled'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '15rem' }}>
                        {p._ownerName || 'Unknown'} {p.url ? `\u00B7 ${p.url}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <HealthBadge badge={h.healthBadge || 'active'} />
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--hover-bg)', overflow: 'hidden', maxWidth: '6rem' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: '0.1875rem', background: pct >= 75 ? '#10B981' : pct >= 40 ? '#F59E0B' : pct > 0 ? '#3B82F6' : 'transparent' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', minWidth: '2.5rem' }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{memberCount}</td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>{timeAgo(p.updatedAt)}</div>
                      {h.daysSinceActivity >= 14 && (
                        <div style={{ fontSize: '0.5625rem', color: '#EF4444', fontWeight: 600, marginTop: '0.125rem' }}>
                          {h.daysSinceActivity}d inactive
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredProjects.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                  {search ? 'No projects match your search' : healthFilter !== 'all' ? `No ${healthFilter} projects` : 'No projects found'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
