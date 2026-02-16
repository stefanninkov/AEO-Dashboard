import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Search, ChevronDown, Plus, Trash2, Pencil, Check, X,
  RefreshCw, Download, Mail, Menu
} from 'lucide-react'

const TYPE_COLORS = {
  Navigation: 'var(--color-phase-1)',
  Checklist: 'var(--color-phase-3)',
  Documentation: 'var(--color-phase-2)',
  Competitor: 'var(--color-phase-4)',
  Action: 'var(--color-phase-5)',
}

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
  setActiveView,
  setDocItem,
  onToggleSidebar,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const dropdownRef = useRef(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false)
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

  // Build search index
  const searchIndex = useMemo(() => {
    const items = []

    // Navigation items
    const navItems = [
      { label: 'Dashboard', view: 'dashboard', type: 'Navigation' },
      { label: 'Competitors', view: 'competitors', type: 'Navigation' },
      { label: 'Checklist', view: 'checklist', type: 'Navigation' },
      { label: 'Process Map', view: 'process', type: 'Navigation' },
      { label: 'Analyzer', view: 'analyzer', type: 'Navigation' },
      { label: 'Metrics', view: 'metrics', type: 'Navigation' },
      { label: 'Documentation', view: 'docs', type: 'Navigation' },
      { label: 'Testing', view: 'testing', type: 'Navigation' },
      { label: 'Settings', view: 'settings', type: 'Navigation' },
    ]
    items.push(...navItems)

    // Checklist items
    if (phases) {
      phases.forEach(phase => {
        phase.categories.forEach(cat => {
          cat.items.forEach(item => {
            items.push({
              label: item.text,
              detail: phase.title,
              type: 'Checklist',
              view: 'checklist',
              docItem: item.doc ? item : null,
            })
          })
        })
      })
    }

    // Documentation titles
    if (phases) {
      phases.forEach(phase => {
        phase.categories.forEach(cat => {
          cat.items.forEach(item => {
            if (item.doc) {
              items.push({
                label: item.doc.title,
                detail: phase.title,
                type: 'Documentation',
                view: 'docs',
                docItem: item,
              })
            }
          })
        })
      })
    }

    // Competitors
    if (activeProject?.competitors?.length) {
      activeProject.competitors.forEach(comp => {
        items.push({
          label: comp.name || comp.url,
          detail: comp.url,
          type: 'Competitor',
          view: 'competitors',
        })
      })
    }

    // Quick actions
    items.push(
      { label: 'Create New Project', type: 'Action', action: 'newProject' },
      { label: 'Run Analyzer', type: 'Action', view: 'analyzer' },
      { label: 'Run Metrics', type: 'Action', view: 'metrics' },
      { label: 'Export Report', type: 'Action', action: 'export' },
    )

    return items
  }, [phases, activeProject])

  // Filter results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return searchIndex
      .filter(item => {
        const label = item.label?.toLowerCase() || ''
        const detail = item.detail?.toLowerCase() || ''
        return label.includes(q) || detail.includes(q)
      })
      .slice(0, 8)
  }, [searchQuery, searchIndex])

  // Handle result selection
  const handleSelectResult = useCallback((result) => {
    setSearchQuery('')
    setSearchOpen(false)
    setActiveIndex(-1)
    if (result.action === 'newProject') { onNewProject(); return }
    if (result.action === 'export') { onExport(); return }
    if (result.view && setActiveView) setActiveView(result.view)
    if (result.docItem && setDocItem) setTimeout(() => setDocItem(result.docItem), 100)
  }, [onNewProject, onExport, setActiveView, setDocItem])

  // Keyboard navigation
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      setSearchQuery('')
      searchInputRef.current?.blur()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, searchResults.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, -1))
      return
    }
    if (e.key === 'Enter' && activeIndex >= 0 && searchResults[activeIndex]) {
      e.preventDefault()
      handleSelectResult(searchResults[activeIndex])
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
        {/* Hamburger menu (visible on tablet/mobile) */}
        <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>

        {/* Project switcher */}
        <div className="relative" ref={dropdownRef} style={{ minWidth: 0 }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4375rem 0.75rem', borderRadius: '0.5rem',
              background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
              cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              minWidth: 0, maxWidth: '13.75rem',
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
                position: 'absolute', left: 0, top: '100%', marginTop: '0.375rem',
                width: '18.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: '0.75rem', overflow: 'hidden', boxShadow: 'var(--shadow-md)',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.625rem', fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-disabled)' }}>Projects</p>
              </div>
              <div style={{ maxHeight: '15rem', overflowY: 'auto' }}>
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="group"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.625rem 0.875rem',
                      background: project.id === activeProject?.id ? 'var(--active-bg)' : 'transparent',
                      cursor: 'pointer', transition: 'background 100ms',
                    }}
                    onMouseEnter={e => { if (project.id !== activeProject?.id) e.currentTarget.style.background = 'var(--hover-bg)' }}
                    onMouseLeave={e => { if (project.id !== activeProject?.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    {editingId === project.id ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 0 }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleRename(project.id)}
                          className="input-field"
                          style={{ flex: 1, minWidth: 0, padding: '0.3125rem 0.625rem', fontSize: '0.8125rem' }}
                          autoFocus
                        />
                        <button onClick={() => handleRename(project.id)} className="icon-btn" style={{ color: 'var(--color-success)' }} aria-label="Confirm rename">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="icon-btn" aria-label="Cancel rename">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setActiveProjectId(project.id); setDropdownOpen(false) }}
                          style={{ flex: 1, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', minWidth: 0, padding: 0, fontFamily: 'var(--font-body)' }}
                        >
                          <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
                          {project.url && <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.125rem' }}>{project.url}</p>}
                        </button>
                        <div style={{ display: 'flex', gap: '0.125rem', flexShrink: 0 }}>
                          <button
                            onClick={() => { setEditingId(project.id); setEditName(project.name) }}
                            className="icon-btn"
                            title="Rename"
                            aria-label="Rename project"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id, project.name)}
                            className="icon-btn"
                            title="Delete"
                            aria-label="Delete project"
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
        <div
          ref={searchContainerRef}
          className="search-container hidden md:block"
          style={{ flex: 1, maxWidth: '20rem', minWidth: 0, position: 'relative' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4375rem 0.75rem', borderRadius: '0.5rem',
            background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
          }}>
            <Search size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search... (Ctrl+K)"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); setActiveIndex(-1) }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              style={{
                flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchOpen(false) }}
                className="icon-btn"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery.trim() && (
            <div className="search-dropdown">
              {searchResults.length > 0 ? (
                searchResults.map((result, i) => (
                  <div
                    key={i}
                    className={`search-result${i === activeIndex ? ' active' : ''}`}
                    onClick={() => handleSelectResult(result)}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span
                      className="search-result-type"
                      style={{
                        background: (TYPE_COLORS[result.type] || 'var(--text-tertiary)') + '18',
                        color: TYPE_COLORS[result.type] || 'var(--text-tertiary)',
                      }}
                    >
                      {result.type}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="search-result-label">{result.label}</div>
                      {result.detail && (
                        <div className="search-result-detail">{result.detail}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="search-empty">
                  No results for "{searchQuery}"
                </div>
              )}
            </div>
          )}
          <div className="sr-only" aria-live="polite">
            {searchOpen && searchQuery.trim() ? `${searchResults.length} results found` : ''}
          </div>
        </div>

        {/* Actions */}
        <div className="top-bar-actions">
          <button onClick={onNewProject} className="btn-primary" style={{ padding: '0.4375rem 0.875rem', fontSize: '0.75rem' }}>
            <Plus size={13} />
            <span className="hidden sm:inline">New Project</span>
          </button>
          <button onClick={onRefresh} className="icon-btn" title="Refresh" aria-label="Refresh data">
            <RefreshCw size={14} />
          </button>
          <button onClick={onExport} className="icon-btn hidden sm:flex" title="Export" aria-label="Export report">
            <Download size={14} />
          </button>
          <button onClick={onEmail} className="icon-btn" title="Email report" aria-label="Email report">
            <Mail size={14} />
          </button>
        </div>
      </div>

      {/* ── Row 2: Progress bar ── */}
      {activeProject && (
        <div className="top-bar-progress">
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
            {pct}%
          </span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
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
