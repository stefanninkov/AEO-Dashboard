import { useEffect, useCallback, useState, useMemo, useRef } from 'react'

/**
 * useKeyboardShortcuts — Global keyboard shortcut manager.
 *
 * Registers keyboard shortcuts with modifier key support,
 * tracks active shortcuts, and provides a cheatsheet data model.
 * Shortcuts are suppressed when focus is in an input/textarea/select.
 */

const DEFAULT_SHORTCUTS = [
  // Navigation
  { id: 'nav-dashboard', keys: 'alt+1', label: 'Go to Dashboard', category: 'Navigation', action: { type: 'navigate', view: 'dashboard' } },
  { id: 'nav-checklist', keys: 'alt+2', label: 'Go to AEO Guide', category: 'Navigation', action: { type: 'navigate', view: 'checklist' } },
  { id: 'nav-competitors', keys: 'alt+3', label: 'Go to Competitors', category: 'Navigation', action: { type: 'navigate', view: 'competitors' } },
  { id: 'nav-analyzer', keys: 'alt+4', label: 'Go to Analyzer', category: 'Navigation', action: { type: 'navigate', view: 'analyzer' } },
  { id: 'nav-metrics', keys: 'alt+5', label: 'Go to Metrics', category: 'Navigation', action: { type: 'navigate', view: 'metrics' } },
  { id: 'nav-monitoring', keys: 'alt+6', label: 'Go to Monitoring', category: 'Navigation', action: { type: 'navigate', view: 'monitoring' } },
  { id: 'nav-settings', keys: 'alt+0', label: 'Go to Settings', category: 'Navigation', action: { type: 'navigate', view: 'settings' } },

  // Actions
  { id: 'cmd-palette', keys: 'ctrl+k', label: 'Open Command Palette', category: 'Actions', action: { type: 'command', id: 'palette' } },
  { id: 'search-focus', keys: '/', label: 'Focus Search', category: 'Actions', action: { type: 'command', id: 'search' } },
  { id: 'refresh', keys: 'ctrl+shift+r', label: 'Refresh Data', category: 'Actions', action: { type: 'command', id: 'refresh' } },
  { id: 'export', keys: 'ctrl+shift+e', label: 'Export Report', category: 'Actions', action: { type: 'command', id: 'export' } },
  { id: 'new-project', keys: 'ctrl+shift+n', label: 'New Project', category: 'Actions', action: { type: 'command', id: 'new-project' } },

  // UI
  { id: 'toggle-sidebar', keys: 'ctrl+b', label: 'Toggle Sidebar', category: 'UI', action: { type: 'command', id: 'toggle-sidebar' } },
  { id: 'toggle-theme', keys: 'ctrl+shift+t', label: 'Toggle Theme', category: 'UI', action: { type: 'command', id: 'toggle-theme' } },
  { id: 'show-shortcuts', keys: 'shift+?', label: 'Show Shortcuts', category: 'UI', action: { type: 'command', id: 'show-shortcuts' } },
  { id: 'escape', keys: 'Escape', label: 'Close Modal / Cancel', category: 'UI', action: { type: 'command', id: 'escape' } },
]

export function useKeyboardShortcuts({ setActiveView, handlers = {} }) {
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  // Parse shortcut keys into matcher
  const matchers = useMemo(() =>
    DEFAULT_SHORTCUTS.map(sc => ({
      ...sc,
      match: parseKeys(sc.keys),
    })),
    []
  )

  // Grouped for display
  const groupedShortcuts = useMemo(() => {
    const groups = {}
    DEFAULT_SHORTCUTS.forEach(sc => {
      if (!groups[sc.category]) groups[sc.category] = []
      groups[sc.category].push(sc)
    })
    return groups
  }, [])

  const handleKeyDown = useCallback((e) => {
    // Skip when in input elements
    const tag = e.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
      // Allow Escape always
      if (e.key !== 'Escape') return
    }

    for (const sc of matchers) {
      if (matchEvent(e, sc.match)) {
        e.preventDefault()
        e.stopPropagation()

        if (sc.action.type === 'navigate') {
          setActiveView(sc.action.view)
        } else if (sc.action.type === 'command') {
          if (sc.action.id === 'show-shortcuts') {
            setCheatsheetOpen(prev => !prev)
          } else if (sc.action.id === 'escape') {
            setCheatsheetOpen(false)
            handlersRef.current.onEscape?.()
          } else if (handlersRef.current[sc.action.id]) {
            handlersRef.current[sc.action.id]()
          }
        }
        return
      }
    }
  }, [matchers, setActiveView])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    cheatsheetOpen,
    setCheatsheetOpen,
    groupedShortcuts,
    shortcuts: DEFAULT_SHORTCUTS,
  }
}

// ── Key parsing helpers ──

function parseKeys(keys) {
  const parts = keys.toLowerCase().split('+')
  return {
    ctrl: parts.includes('ctrl') || parts.includes('cmd'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    key: parts.filter(p => !['ctrl', 'cmd', 'shift', 'alt'].includes(p))[0] || '',
  }
}

function matchEvent(e, match) {
  const ctrl = e.ctrlKey || e.metaKey
  if (match.ctrl !== ctrl) return false
  if (match.shift !== e.shiftKey) return false
  if (match.alt !== e.altKey) return false

  const key = e.key.toLowerCase()
  // Handle special keys
  if (match.key === '?' && key === '?' && e.shiftKey) return true
  if (match.key === '/') return key === '/'
  if (match.key === 'escape') return key === 'escape'
  return key === match.key
}
