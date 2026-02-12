import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search, ChevronDown, Plus, Trash2, Pencil, Check, X,
  RefreshCw, Download, Mail
} from 'lucide-react'

export default function TopBar({
  projects,
  activeProject,
  setActiveProjectId,
  deleteProject,
  renameProject,
  phases,
  dateRange,
  setDateRange,
  onRefresh,
  onExport,
  onEmail,
  onNewProject,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRename = (id) => {
    if (editName.trim()) {
      renameProject(id, editName.trim())
      setEditingId(null)
    }
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete project "${name}"? This cannot be undone.`)) {
      deleteProject(id)
    }
  }

  // Compute overall progress
  const { totalItems, checkedItems, pct, phaseStats } = useMemo(() => {
    if (!phases || !activeProject) return { totalItems: 0, checkedItems: 0, pct: 0, phaseStats: [] }
    let total = 0, checked = 0
    const stats = phases.map(phase => {
      let phaseTotal = 0, phaseChecked = 0
      phase.categories.forEach(cat => {
        cat.items.forEach(item => {
          total++; phaseTotal++
          if (activeProject.checked?.[item.id]) { checked++; phaseChecked++ }
        })
      })
      return { id: phase.id, number: phase.number, color: phase.color, total: phaseTotal, checked: phaseChecked }
    })
    return { totalItems: total, checkedItems: checked, pct: total > 0 ? Math.round((checked / total) * 100) : 0, phaseStats: stats }
  }, [phases, activeProject])

  return (
    <div className="top-bar">
      {/* ── Row 1: Project switcher + Search + Actions ── */}
      <div className="top-bar-row-1">
        {/* Project switcher */}
        <div className="relative" ref={dropdownRef} style={{ minWidth: 0 }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderRadius: 8,
              background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              minWidth: 0, maxWidth: 220,
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {activeProject?.name || 'No Project'}
            </span>
            <ChevronDown size={12} style={{ flexShrink: 0, opacity: 0.5, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute', left: 0, top: '100%', marginTop: 6,
                width: 300, background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-md)',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-disabled)' }}>Projects</p>
              </div>
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="group"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px',
                      background: project.id === activeProject?.id ? 'var(--active-bg)' : 'transparent',
                      cursor: 'pointer', transition: 'background 100ms',
                    }}
                    onMouseEnter={e => { if (project.id !== activeProject?.id) e.currentTarget.style.background = 'var(--hover-bg)' }}
                    onMouseLeave={e => { if (project.id !== activeProject?.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    {editingId === project.id ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleRename(project.id)}
                          className="input-field"
                          style={{ flex: 1, minWidth: 0, padding: '5px 10px', fontSize: 13 }}
                          autoFocus
                        />
                        <button onClick={() => handleRename(project.id)} style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-success)' }}>
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setActiveProjectId(project.id); setDropdownOpen(false) }}
                          style={{ flex: 1, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', minWidth: 0, padding: 0, fontFamily: 'var(--font-body)' }}
                        >
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
                          {project.url && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{project.url}</p>}
                        </button>
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          <button
                            onClick={() => { setEditingId(project.id); setEditName(project.name) }}
                            style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 6 }}
                            title="Rename"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id, project.name)}
                            style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 6 }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 280, minWidth: 0 }} className="hidden md:block">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', borderRadius: 8,
            background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
          }}>
            <Search size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search... (Ctrl+K)"
              style={{
                flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="top-bar-actions">
          <button onClick={onNewProject} className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>
            <Plus size={13} />
            <span className="hidden sm:inline">New Project</span>
          </button>
          <button
            onClick={onRefresh}
            style={{ padding: 7, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onExport}
            style={{ padding: 7, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
            title="Export"
            className="hidden sm:flex"
          >
            <Download size={14} />
          </button>
          <button
            onClick={onEmail}
            style={{ padding: 7, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
            title="Email report"
          >
            <Mail size={14} />
          </button>
        </div>
      </div>

      {/* ── Row 2: Progress bar ── */}
      {activeProject && (
        <div className="top-bar-progress">
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
            {pct}%
          </span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
            {checkedItems}/{totalItems}
          </span>
        </div>
      )}

      {/* ── Row 3: Phase badges ── */}
      {activeProject && (
        <div className="phase-badges-row">
          {phaseStats.map(ps => {
            const phasePct = ps.total > 0 ? Math.round((ps.checked / ps.total) * 100) : 0
            const isComplete = phasePct === 100
            return (
              <div
                key={ps.id}
                className="phase-badge"
                style={isComplete ? { background: ps.color + '18', borderColor: ps.color + '30', color: ps.color } : {}}
                title={`Phase ${ps.number}: ${phasePct}% (${ps.checked}/${ps.total})`}
              >
                P{ps.number} {phasePct}%
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
