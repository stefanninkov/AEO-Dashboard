import { useState, useMemo } from 'react'
import {
  FolderKanban, Search, RefreshCw, ChevronDown, ChevronUp,
  Users, CheckSquare, ExternalLink,
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

/* ── Project Detail ── */
function ProjectDetail({ project, onClose }) {
  const checked = project.checked || {}
  const total = Object.keys(checked).length
  const done = Object.values(checked).filter(Boolean).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const members = project.members || []

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {project.name || 'Untitled'}
          </div>
          {project.url && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ExternalLink size={10} />
              {project.url}
            </div>
          )}
        </div>
        <button onClick={onClose} className="icon-btn" title="Close" style={{ fontSize: '0.75rem' }}>
          &times;
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Owner</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{project._ownerName || 'Unknown'}</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Progress</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{done}/{total} tasks ({pct}%)</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Storage Path</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{project._path || '—'}</div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Created</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{formatDate(project.createdAt)}</div>
        </div>
      </div>

      {/* Members */}
      {members.length > 0 && (
        <>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
            Members ({members.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {members.map((m, i) => (
              <div key={m.uid || i} style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '1rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}>
                {m.displayName || m.email || m.uid}
                <span style={{ color: 'var(--text-disabled)', marginLeft: '0.375rem' }}>({m.role || 'member'})</span>
              </div>
            ))}
          </div>
        </>
      )}
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
    return [...list].sort((a, b) => {
      if (sortKey === 'name') {
        const av = (a.name || '').toLowerCase()
        const bv = (b.name || '').toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      if (sortKey === 'progress') {
        const aPct = Object.keys(a.checked || {}).length > 0 ? Object.values(a.checked).filter(Boolean).length / Object.keys(a.checked).length : 0
        const bPct = Object.keys(b.checked || {}).length > 0 ? Object.values(b.checked).filter(Boolean).length / Object.keys(b.checked).length : 0
        return sortDir === 'asc' ? aPct - bPct : bPct - aPct
      }
      if (sortKey === 'members') {
        const av = a.members?.length || a.memberIds?.length || 1
        const bv = b.members?.length || b.memberIds?.length || 1
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const av = parseDate(a[sortKey])?.getTime() || 0
      const bv = parseDate(b[sortKey])?.getTime() || 0
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [stats, search, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const selectedProject = stats?.projects?.find(p => p.id === selectedProjectId) || null

  if (loading && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            All Projects
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {stats?.totalProjects || 0} total projects
          </p>
        </div>
        <button onClick={handleRefresh} className="icon-btn" title="Refresh" disabled={refreshing} style={{ opacity: refreshing ? 0.5 : 1 }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

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

      {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProjectId(null)} />}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  { key: 'name', label: 'Project' },
                  { key: 'updatedAt', label: 'Owner' },
                  { key: 'progress', label: 'Progress' },
                  { key: 'members', label: 'Members' },
                  { key: 'updatedAt', label: 'Updated' },
                ].map((col, i) => (
                  <th
                    key={col.label}
                    onClick={() => handleSort(col.key)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06rem',
                      color: sortKey === col.key ? 'var(--text-primary)' : 'var(--text-disabled)',
                      textAlign: 'left', padding: '0.625rem 1.25rem',
                      borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} style={{ display: 'inline', verticalAlign: '-2px', marginLeft: '0.25rem' }} /> : <ChevronDown size={12} style={{ display: 'inline', verticalAlign: '-2px', marginLeft: '0.25rem' }} />)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(p => {
                const checked = p.checked || {}
                const total = Object.keys(checked).length
                const done = Object.values(checked).filter(Boolean).length
                const pct = total > 0 ? Math.round((done / total) * 100) : 0
                const memberCount = p.members?.length || p.memberIds?.length || 1
                const isSelected = selectedProjectId === p.id

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: isSelected ? 'var(--hover-bg)' : 'transparent' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                        {p.name || 'Untitled'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '15rem' }}>
                        {p.url || 'No URL'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {p._ownerName || 'Unknown'}
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
                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-disabled)' }}>{timeAgo(p.updatedAt)}</td>
                  </tr>
                )
              })}
              {filteredProjects.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                  {search ? 'No projects match your search' : 'No projects found'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
