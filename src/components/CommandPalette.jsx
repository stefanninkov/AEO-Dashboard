import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Search, LayoutDashboard, Users, CheckSquare, GitBranch, Zap,
  BarChart3, BookOpen, FlaskConical, Settings, Sun, Moon,
  Plus, Download, FileText, CornerDownLeft
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useFocusTrap } from '../hooks/useFocusTrap'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
  { id: 'competitors', label: 'Competitors', icon: Users, shortcut: '2' },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare, shortcut: '3' },
  { id: 'process', label: 'Process Map', icon: GitBranch, shortcut: '4' },
  { id: 'analyzer', label: 'Analyzer', icon: Zap, shortcut: '5' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, shortcut: '6' },
  { id: 'docs', label: 'Documentation', icon: BookOpen, shortcut: '7' },
  { id: 'testing', label: 'Testing', icon: FlaskConical, shortcut: '8' },
  { id: 'settings', label: 'Settings', icon: Settings, shortcut: '9' },
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
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const { theme, toggleTheme } = useTheme()
  const trapRef = useFocusTrap(isOpen && !isClosing)

  // Build search index from all data sources
  const searchIndex = useMemo(() => {
    const items = []

    // 1. Navigation items
    NAV_ITEMS.forEach(nav => {
      items.push({
        id: `nav-${nav.id}`,
        type: 'Navigation',
        label: nav.label,
        icon: nav.icon,
        shortcut: nav.shortcut,
        action: () => setActiveView(nav.id),
      })
    })

    // 2. Actions
    items.push(
      {
        id: 'action-new-project',
        type: 'Action',
        label: 'Create New Project',
        icon: Plus,
        action: () => onNewProject(),
      },
      {
        id: 'action-analyzer',
        type: 'Action',
        label: 'Run Analyzer',
        icon: Zap,
        action: () => setActiveView('analyzer'),
      },
      {
        id: 'action-export',
        type: 'Action',
        label: 'Export Report',
        icon: Download,
        action: () => onExport(),
      },
      {
        id: 'action-toggle-theme',
        type: 'Action',
        label: theme === 'dark' ? 'Switch to Light Mode' : theme === 'light' ? 'Switch to Auto Mode' : 'Switch to Dark Mode',
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
  }, [phases, activeProject, projects, theme, setActiveView, onNewProject, onExport, toggleTheme, setDocItem, setActiveProjectId])

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return searchIndex.filter(item => item.type === 'Navigation' || item.type === 'Action')
    }

    const q = query.toLowerCase()
    return searchIndex
      .filter(item => {
        const label = item.label?.toLowerCase() || ''
        const detail = item.detail?.toLowerCase() || ''
        return label.includes(q) || detail.includes(q)
      })
      .slice(0, 12)
  }, [query, searchIndex])

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

  // Reset selectedIndex when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

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
        aria-label="Command palette"
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
            placeholder="Type a command or search..."
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
                          {item.checked ? 'Done' : 'Todo'}
                        </span>
                      )}
                      {item.isActive && (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-phase-1)' }}>
                          Active
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          ) : (
            <div className="cmd-palette-empty">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="cmd-palette-footer">
          <span className="cmd-palette-footer-hint">
            <CornerDownLeft size={12} /> Select
          </span>
          <span className="cmd-palette-footer-hint">
            <span style={{ fontSize: '0.6875rem' }}>&uarr;&darr;</span> Navigate
          </span>
          <span className="cmd-palette-footer-hint">
            <kbd className="cmd-palette-kbd-sm">ESC</kbd> Close
          </span>
        </div>
      </div>
    </div>
  )
}
