import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '../hooks/useDebounce'
import {
  SearchCheck, ChevronDown, Plus, Trash2, Pencil, Check, X,
  RotateCw, FileDown, Mail, Menu, Sheet,
  Gauge, Users, Sparkles, ChartColumnIncreasing, BookOpen, FlaskConical,
  SlidersHorizontal, Sun, Moon, Download, FileText, CornerDownLeft,
  PenTool, CalendarDays, Code2, Activity, Layers,
} from 'lucide-react'
import NotificationCenter from './NotificationCenter'
import LanguageSwitcher from './LanguageSwitcher'
import { useTheme } from '../contexts/ThemeContext'

const NAV_ICONS = {
  dashboard: Gauge,
  checklist: BookOpen,
  competitors: Users,
  analyzer: Sparkles,
  writer: PenTool,
  'content-ops': CalendarDays,
  schema: Code2,
  monitoring: Activity,
  metrics: ChartColumnIncreasing,
  gsc: SearchCheck,
  ga4: Sparkles,
  'aeo-impact': Layers,
  docs: BookOpen,
  testing: FlaskConical,
  settings: SlidersHorizontal,
}

const NAV_KEYS = [
  { id: 'dashboard', i18nKey: 'nav.dashboard', shortcut: '1' },
  { id: 'checklist', i18nKey: 'nav.checklist', shortcut: '2' },
  { id: 'competitors', i18nKey: 'nav.competitors', shortcut: '3' },
  { id: 'analyzer', i18nKey: 'nav.analyzer', shortcut: '4' },
  { id: 'writer', i18nKey: 'nav.writer', shortcut: '5' },
  { id: 'content-ops', i18nKey: 'nav.contentOps', shortcut: '6' },
  { id: 'schema', i18nKey: 'nav.schema', shortcut: '7' },
  { id: 'monitoring', i18nKey: 'nav.monitoring', shortcut: '8' },
  { id: 'metrics', i18nKey: 'nav.metrics', shortcut: '9' },
  { id: 'gsc', i18nKey: 'nav.searchConsole' },
  { id: 'ga4', i18nKey: 'nav.aiTraffic' },
  { id: 'aeo-impact', i18nKey: 'nav.aeoImpact' },
  { id: 'docs', i18nKey: 'nav.docs' },
  { id: 'testing', i18nKey: 'nav.testing' },
  { id: 'settings', i18nKey: 'nav.settings' },
]

const TYPE_COLORS = {
  Navigation: 'var(--color-phase-1)',
  Action: 'var(--color-phase-5)',
  Task: 'var(--color-phase-3)',
  Documentation: 'var(--color-phase-2)',
  Project: 'var(--color-phase-4)',
}

export default memo(function TopBar({
  projects,
  activeProject,
  setActiveProjectId,
  deleteProject,
  renameProject,
  phases,
  dateRange,
  setDateRange,
  onRefresh,
  refreshing,
  onExport,
  onCsvExport,
  onEmail,
  onNewProject,
  setActiveView,
  setDocItem,
  onToggleSidebar,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClearNotifications,
  onOpenCommandPalette,
}) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const dropdownRef = useRef(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 100)
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)
  const searchListRef = useRef(null)

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
    if (window.confirm(t('topbar.deleteConfirm', { name }))) {
      deleteProject(id)
    }
  }

  // Build search index (same data model as CommandPalette)
  const searchIndex = useMemo(() => {
    const items = []

    // Navigation items
    NAV_KEYS.forEach(nav => {
      items.push({
        id: `nav-${nav.id}`,
        type: 'Navigation',
        label: t(nav.i18nKey),
        icon: NAV_ICONS[nav.id],
        shortcut: nav.shortcut,
        action: () => setActiveView(nav.id),
      })
    })

    // Actions
    items.push(
      { id: 'action-new-project', type: 'Action', label: t('actions.createNewProject'), icon: Plus, action: () => onNewProject() },
      { id: 'action-analyzer', type: 'Action', label: t('actions.runAnalyzer'), icon: Sparkles, action: () => setActiveView('analyzer') },
      { id: 'action-export', type: 'Action', label: t('actions.exportReport'), icon: Download, action: () => onExport() },
      {
        id: 'action-toggle-theme', type: 'Action',
        label: theme === 'dark' ? t('commandPalette.switchToLightMode') : theme === 'light' ? t('commandPalette.switchToAutoMode') : t('commandPalette.switchToDarkMode'),
        icon: theme === 'dark' ? Sun : theme === 'light' ? Sun : Moon,
        action: () => toggleTheme(),
      },
    )

    // Checklist tasks
    if (phases) {
      phases.forEach(phase => {
        phase.categories.forEach(cat => {
          cat.items.forEach(item => {
            items.push({
              id: `task-${item.id}`,
              type: 'Task',
              label: item.text,
              detail: `${phase.title} > ${cat.name}`,
              phaseColor: phase.color,
              checked: !!activeProject?.checked?.[item.id],
              action: () => setActiveView('checklist'),
            })
          })
        })
      })
    }

    // Documentation
    if (phases) {
      phases.forEach(phase => {
        phase.categories.forEach(cat => {
          cat.items.forEach(item => {
            if (item.doc) {
              items.push({
                id: `doc-${item.id}`,
                type: 'Documentation',
                label: item.doc.title,
                detail: phase.title,
                icon: FileText,
                action: () => setDocItem(item),
              })
            }
          })
        })
      })
    }

    // Projects
    if (projects?.length) {
      projects.forEach(proj => {
        items.push({
          id: `project-${proj.id}`,
          type: 'Project',
          label: proj.name,
          detail: proj.url || '',
          isActive: proj.id === activeProject?.id,
          action: () => setActiveProjectId(proj.id),
        })
      })
    }

    return items
  }, [phases, activeProject, projects, theme, t, setActiveView, onNewProject, onExport, toggleTheme, setDocItem, setActiveProjectId])

  // Filter + group results
  const filteredResults = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return searchIndex.filter(item => item.type === 'Navigation' || item.type === 'Action')
    }
    const q = debouncedSearch.toLowerCase()
    return searchIndex
      .filter(item => {
        const label = item.label?.toLowerCase() || ''
        const detail = item.detail?.toLowerCase() || ''
        return label.includes(q) || detail.includes(q)
      })
      .slice(0, 12)
  }, [debouncedSearch, searchIndex])

  const groupedResults = useMemo(() => {
    const groups = {}
    filteredResults.forEach(item => {
      if (!groups[item.type]) groups[item.type] = []
      groups[item.type].push(item)
    })
    return groups
  }, [filteredResults])

  // Handle result selection
  const handleSelectResult = useCallback((result) => {
    setSearchQuery('')
    setSearchOpen(false)
    setSelectedIndex(0)
    result.action()
  }, [])

  // Reset selectedIndex when search changes
  useEffect(() => { setSelectedIndex(0) }, [debouncedSearch])

  // Scroll selected item into view
  useEffect(() => {
    if (!searchListRef.current) return
    const selected = searchListRef.current.querySelector('[data-selected="true"]')
    if (selected) selected.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  // Keyboard navigation
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      setSearchQuery('')
      searchInputRef.current?.blur()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const result = filteredResults[selectedIndex]
      if (result) handleSelectResult(result)
    }
  }, [filteredResults, selectedIndex, handleSelectResult])

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
        <button className="hamburger-btn" onClick={onToggleSidebar} aria-label={t('topbar.toggleSidebar')}>
          <Menu size={18} />
        </button>

        {/* Project switcher */}
        <div className="relative" ref={dropdownRef} style={{ minWidth: 0 }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4375rem 0.75rem', borderRadius: '0.5rem',
              background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
              cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              minWidth: 0, maxWidth: '13.75rem',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {activeProject?.name || t('topbar.noProject')}
            </span>
            <ChevronDown size={12} style={{ flexShrink: 0, opacity: 0.5, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute', left: 0, top: '100%', marginTop: '0.375rem',
                width: 'min(18.75rem, calc(100vw - 2rem))', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
                borderRadius: '0.75rem', overflow: 'hidden', boxShadow: 'var(--shadow-md)',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              <div style={{ padding: '0.625rem 0.875rem', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.625rem', fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075rem', color: 'var(--text-disabled)' }}>{t('topbar.projects')}</p>
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
                          aria-label={t('topbar.projectName')}
                          autoFocus
                        />
                        <button onClick={() => handleRename(project.id)} className="icon-btn" style={{ color: 'var(--color-success)' }} aria-label={t('actions.confirmRename')}>
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="icon-btn" aria-label={t('actions.cancelRename')}>
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
                            title={t('actions.rename')}
                            aria-label={t('actions.rename')}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id, project.name)}
                            className="icon-btn"
                            title={t('actions.delete')}
                            aria-label={t('actions.delete')}
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
          className="search-container search-desktop"
          style={{ flex: 1, maxWidth: '20rem', minWidth: 0, position: 'relative' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4375rem 0.75rem', borderRadius: '0.5rem',
            background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
          }}>
            <SearchCheck size={14} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('topbar.searchPlaceholder')}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); setSelectedIndex(0) }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              aria-label={t('actions.search')}
              style={{
                flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchOpen(false) }}
                className="icon-btn"
                aria-label={t('topbar.clearSearch')}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && (
            <div className="search-dropdown">
              <div className="search-dropdown-list" ref={searchListRef}>
                {filteredResults.length > 0 ? (
                  Object.entries(groupedResults).map(([type, items]) => (
                    <div key={type}>
                      <div className="cmd-palette-section-label">{type}</div>
                      {items.map(item => {
                        const globalIndex = filteredResults.indexOf(item)
                        const isSelected = globalIndex === selectedIndex
                        const Icon = item.icon
                        return (
                          <div
                            key={item.id}
                            className={`cmd-palette-item${isSelected ? ' selected' : ''}`}
                            data-selected={isSelected}
                            onClick={() => handleSelectResult(item)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            {Icon ? (
                              <Icon size={15} style={{ color: TYPE_COLORS[item.type], flexShrink: 0 }} />
                            ) : (
                              <span
                                className="cmd-palette-type-badge"
                                style={{
                                  background: (TYPE_COLORS[item.type] || 'var(--text-tertiary)') + '18',
                                  color: TYPE_COLORS[item.type] || 'var(--text-tertiary)',
                                }}
                              >
                                {item.type === 'Task' && item.checked ? '\u2713' : item.type[0]}
                              </span>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="cmd-palette-item-label">{item.label}</div>
                              {item.detail && (
                                <div className="cmd-palette-item-detail">{item.detail}</div>
                              )}
                            </div>
                            {item.shortcut && (
                              <kbd className="cmd-palette-shortcut">{item.shortcut}</kbd>
                            )}
                            {item.phaseColor && (
                              <span className="cmd-palette-phase-dot" style={{ background: item.phaseColor }} />
                            )}
                            {item.checked !== undefined && (
                              <span style={{ fontSize: '0.6875rem', color: item.checked ? 'var(--color-success)' : 'var(--text-disabled)' }}>
                                {item.checked ? t('status.done') : t('status.todo')}
                              </span>
                            )}
                            {item.isActive && (
                              <span style={{ fontSize: '0.6875rem', color: 'var(--color-phase-1)' }}>
                                {t('status.active')}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  <div className="cmd-palette-empty">
                    {t('topbar.noResults', { query: searchQuery })}
                  </div>
                )}
              </div>
              <div className="search-dropdown-footer">
                <span className="cmd-palette-footer-hint">
                  <CornerDownLeft size={11} /> {t('actions.select')}
                </span>
                <span className="cmd-palette-footer-hint">
                  <span style={{ fontSize: '0.6875rem' }}>&uarr;&darr;</span> {t('actions.navigate')}
                </span>
                <span className="cmd-palette-footer-hint">
                  <kbd className="cmd-palette-kbd-sm">ESC</kbd> {t('actions.close')}
                </span>
              </div>
            </div>
          )}
          <div className="sr-only" aria-live="polite">
            {searchOpen && debouncedSearch.trim() ? t('topbar.resultsFound', { count: filteredResults.length }) : ''}
          </div>
        </div>

        {/* Mobile search trigger — opens command palette */}
        {onOpenCommandPalette && (
          <button
            className="icon-btn search-mobile"
            onClick={onOpenCommandPalette}
            aria-label={t('actions.search')}
            title={t('actions.search')}
          >
            <SearchCheck size={14} />
          </button>
        )}

        {/* Actions */}
        <div className="top-bar-actions">
          <button onClick={onNewProject} className="btn-primary" style={{ padding: '0.4375rem 0.875rem', fontSize: '0.75rem' }}>
            <Plus size={13} />
            <span className="hidden sm:inline">{t('actions.newProject')}</span>
          </button>
          <button onClick={onRefresh} className="icon-btn" title={t('actions.refresh')} aria-label={t('topbar.refreshData')} disabled={refreshing}>
            <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={onExport} className="icon-btn hidden sm:flex" title={t('actions.exportPdf')} aria-label={t('actions.exportPdf')}>
            <FileDown size={14} />
          </button>
          <button onClick={onCsvExport} className="icon-btn hidden sm:flex" title={t('actions.exportCsv')} aria-label={t('actions.exportCsv')}>
            <Sheet size={14} />
          </button>
          <button onClick={onEmail} className="icon-btn" title={t('actions.emailReport')} aria-label={t('actions.emailReport')}>
            <Mail size={14} />
          </button>
          <LanguageSwitcher variant="app" />
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onClearAll={onClearNotifications}
            setActiveView={setActiveView}
          />
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
                title={t('topbar.phase', { number: ps.number, pct: phasePct, checked: ps.checked, total: ps.total })}
              >
                P{ps.number} {phasePct}%
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})
