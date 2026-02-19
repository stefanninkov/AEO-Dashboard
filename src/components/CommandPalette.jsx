import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '../hooks/useDebounce'
import {
  Search, LayoutDashboard, Users, Zap,
  BarChart3, BookOpen, FlaskConical, Settings, Sun, Moon,
  Plus, Download, FileText, CornerDownLeft, PenTool,
  CalendarDays, Code2, Activity, Layers,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useFocusTrap } from '../hooks/useFocusTrap'

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  checklist: BookOpen,
  competitors: Users,
  analyzer: Zap,
  writer: PenTool,
  'content-ops': CalendarDays,
  schema: Code2,
  monitoring: Activity,
  metrics: BarChart3,
  gsc: Search,
  ga4: Zap,
  'aeo-impact': Layers,
  docs: BookOpen,
  testing: FlaskConical,
  settings: Settings,
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

export default function CommandPalette({
  isOpen,
  isClosing,
  onClose,
  onExited,
  phases,
  activeProject,
  projects,
  setActiveView,
  setActiveProjectId,
  onNewProject,
  onExport,
  setDocItem,
}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 100)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const { theme, toggleTheme } = useTheme()
  const trapRef = useFocusTrap(isOpen && !isClosing)

  // Build search index from all data sources
  const searchIndex = useMemo(() => {
    const items = []

    // 1. Navigation items
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

    // 2. Actions
    items.push(
      {
        id: 'action-new-project',
        type: 'Action',
        label: t('actions.createNewProject'),
        icon: Plus,
        action: () => onNewProject(),
      },
      {
        id: 'action-analyzer',
        type: 'Action',
        label: t('actions.runAnalyzer'),
        icon: Zap,
        action: () => setActiveView('analyzer'),
      },
      {
        id: 'action-export',
        type: 'Action',
        label: t('actions.exportReport'),
        icon: Download,
        action: () => onExport(),
      },
      {
        id: 'action-toggle-theme',
        type: 'Action',
        label: theme === 'dark' ? t('commandPalette.switchToLightMode') : theme === 'light' ? t('commandPalette.switchToAutoMode') : t('commandPalette.switchToDarkMode'),
        icon: theme === 'dark' ? Sun : theme === 'light' ? Sun : Moon,
        action: () => toggleTheme(),
      },
    )

    // 3. Checklist tasks
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
              action: () => {
                setActiveView('checklist')
              },
            })
          })
        })
      })
    }

    // 4. Documentation titles
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
                action: () => {
                  setDocItem(item)
                },
              })
            }
          })
        })
      })
    }

    // 5. Projects
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

  // Filter results based on debounced query
  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return searchIndex.filter(item => item.type === 'Navigation' || item.type === 'Action')
    }

    const q = debouncedQuery.toLowerCase()
    return searchIndex
      .filter(item => {
        const label = item.label?.toLowerCase() || ''
        const detail = item.detail?.toLowerCase() || ''
        return label.includes(q) || detail.includes(q)
      })
      .slice(0, 12)
  }, [debouncedQuery, searchIndex])

  // Group results by type for rendering
  const groupedResults = useMemo(() => {
    const groups = {}
    filteredResults.forEach(item => {
      if (!groups[item.type]) groups[item.type] = []
      groups[item.type].push(item)
    })
    return groups
  }, [filteredResults])

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  // Reset selectedIndex when debounced query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [debouncedQuery])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleKeyDown = useCallback((e) => {
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
      if (result) {
        result.action()
        onClose()
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }, [filteredResults, selectedIndex, onClose])

  const handleSelect = useCallback((item) => {
    item.action()
    onClose()
  }, [onClose])

  if (!isOpen && !isClosing) return null

  return (
    <div className="cmd-palette-backdrop" onClick={onClose}>
      {/* Overlay with blur */}
      <div
        className="cmd-palette-overlay"
        style={{
          animation: isClosing
            ? 'backdrop-fade-out 150ms ease-out forwards'
            : 'backdrop-fade-in 150ms ease-out both',
        }}
      />

      {/* Panel */}
      <div
        ref={trapRef}
        className="cmd-palette-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('commandPalette.placeholder')}
        onClick={e => e.stopPropagation()}
        style={{
          animation: isClosing
            ? 'dialog-scale-out 150ms ease-out forwards'
            : 'dialog-scale-in 200ms ease-out both',
        }}
        onAnimationEnd={() => isClosing && onExited?.()}
      >
        {/* Search Input Row */}
        <div className="cmd-palette-input-row">
          <Search size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('commandPalette.placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="cmd-palette-input"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="cmd-palette-kbd">ESC</kbd>
        </div>

        {/* Divider */}
        <div className="cmd-palette-divider" />

        {/* Results List */}
        <div className="cmd-palette-list" ref={listRef}>
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
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      {/* Left: icon or type badge */}
                      {Icon ? (
                        <Icon size={16} style={{ color: TYPE_COLORS[item.type], flexShrink: 0 }} />
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

                      {/* Center: label + detail */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="cmd-palette-item-label">{item.label}</div>
                        {item.detail && (
                          <div className="cmd-palette-item-detail">{item.detail}</div>
                        )}
                      </div>

                      {/* Right: shortcut / phase dot / status */}
                      {item.shortcut && (
                        <kbd className="cmd-palette-shortcut">{item.shortcut}</kbd>
                      )}
                      {item.phaseColor && (
                        <span
                          className="cmd-palette-phase-dot"
                          style={{ background: item.phaseColor }}
                        />
                      )}
                      {item.checked !== undefined && (
                        <span style={{
                          fontSize: '0.6875rem',
                          color: item.checked ? 'var(--color-success)' : 'var(--text-disabled)',
                        }}>
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
              {t('commandPalette.noResults', { query })}
            </div>
          )}
        </div>
        <div className="sr-only" aria-live="polite">
          {debouncedQuery.trim() ? t('topbar.resultsFound', { count: filteredResults.length }) : ''}
        </div>

        {/* Footer with keyboard hints */}
        <div className="cmd-palette-footer">
          <span className="cmd-palette-footer-hint">
            <CornerDownLeft size={12} /> {t('actions.select')}
          </span>
          <span className="cmd-palette-footer-hint">
            <span style={{ fontSize: '0.6875rem' }}>&uarr;&darr;</span> {t('actions.navigate')}
          </span>
          <span className="cmd-palette-footer-hint">
            <kbd className="cmd-palette-kbd-sm">ESC</kbd> {t('actions.close')}
          </span>
        </div>
      </div>
    </div>
  )
}
