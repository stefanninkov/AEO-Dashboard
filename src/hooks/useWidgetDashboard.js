import { useState, useCallback, useMemo } from 'react'

/**
 * Widget types available for the custom dashboard.
 */
export const WIDGET_CATALOG = [
  { type: 'stat', label: 'Stat Card', description: 'Single metric with trend', minW: 1, minH: 1, defaultW: 1, defaultH: 1 },
  { type: 'line-chart', label: 'Line Chart', description: 'Time-series trend', minW: 2, minH: 2, defaultW: 2, defaultH: 2 },
  { type: 'pie-chart', label: 'Pie Chart', description: 'Distribution breakdown', minW: 2, minH: 2, defaultW: 2, defaultH: 2 },
  { type: 'score-history', label: 'Score History', description: 'AEO score over time', minW: 2, minH: 2, defaultW: 4, defaultH: 2 },
  { type: 'checklist-progress', label: 'Checklist Progress', description: 'Phase completion bars', minW: 2, minH: 1, defaultW: 2, defaultH: 1 },
  { type: 'activity-feed', label: 'Activity Feed', description: 'Recent activity', minW: 2, minH: 2, defaultW: 2, defaultH: 2 },
  { type: 'trend-summary', label: 'Trend Summary', description: 'Key trend indicators', minW: 2, minH: 1, defaultW: 4, defaultH: 1 },
  { type: 'engine-breakdown', label: 'Engine Breakdown', description: 'Citations by AI engine', minW: 2, minH: 2, defaultW: 2, defaultH: 2 },
]

const STORAGE_KEY = 'aeo-widget-layouts'

/**
 * useWidgetDashboard — Manages custom widget layouts with persistence.
 *
 * Layout model: [{
 *   id: string,
 *   type: string (from WIDGET_CATALOG),
 *   title: string,
 *   x: number (grid column 0-3),
 *   y: number (grid row),
 *   w: number (width in grid units 1-4),
 *   h: number (height in grid units 1-3),
 *   config: object (widget-specific settings),
 * }]
 */
export function useWidgetDashboard({ activeProject }) {
  const projectId = activeProject?.id

  // Load saved layouts per project
  const [layouts, setLayouts] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      return stored[projectId] || getDefaultLayout()
    } catch {
      return getDefaultLayout()
    }
  })

  // Persist on change
  const persistLayouts = useCallback((newLayouts) => {
    setLayouts(newLayouts)
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      stored[projectId] = newLayouts
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch { /* ignore storage errors */ }
  }, [projectId])

  const addWidget = useCallback((type, title, config = {}) => {
    const catalog = WIDGET_CATALOG.find(w => w.type === type)
    if (!catalog) return

    // Find next available position
    const maxY = layouts.reduce((max, w) => Math.max(max, w.y + w.h), 0)

    const widget = {
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type,
      title: title || catalog.label,
      x: 0,
      y: maxY,
      w: catalog.defaultW,
      h: catalog.defaultH,
      config,
    }

    persistLayouts([...layouts, widget])
    return widget
  }, [layouts, persistLayouts])

  const removeWidget = useCallback((widgetId) => {
    persistLayouts(layouts.filter(w => w.id !== widgetId))
  }, [layouts, persistLayouts])

  const updateWidget = useCallback((widgetId, changes) => {
    persistLayouts(layouts.map(w => w.id === widgetId ? { ...w, ...changes } : w))
  }, [layouts, persistLayouts])

  const moveWidget = useCallback((widgetId, x, y) => {
    persistLayouts(layouts.map(w => w.id === widgetId ? { ...w, x, y } : w))
  }, [layouts, persistLayouts])

  const resizeWidget = useCallback((widgetId, w, h) => {
    persistLayouts(layouts.map(wd => wd.id === widgetId ? { ...wd, w, h } : wd))
  }, [layouts, persistLayouts])

  const resetLayout = useCallback(() => {
    persistLayouts(getDefaultLayout())
  }, [persistLayouts])

  // Sorted by position for rendering
  const sortedWidgets = useMemo(() =>
    [...layouts].sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y),
    [layouts]
  )

  return {
    widgets: sortedWidgets,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    resizeWidget,
    resetLayout,
    widgetCount: layouts.length,
  }
}

function getDefaultLayout() {
  return [
    { id: 'w-default-1', type: 'stat', title: 'AEO Score', x: 0, y: 0, w: 1, h: 1, config: { metric: 'overallScore' } },
    { id: 'w-default-2', type: 'stat', title: 'Citations', x: 1, y: 0, w: 1, h: 1, config: { metric: 'citations' } },
    { id: 'w-default-3', type: 'stat', title: 'Prompts', x: 2, y: 0, w: 1, h: 1, config: { metric: 'prompts' } },
    { id: 'w-default-4', type: 'stat', title: 'Engines', x: 3, y: 0, w: 1, h: 1, config: { metric: 'engines' } },
    { id: 'w-default-5', type: 'score-history', title: 'Score History', x: 0, y: 1, w: 4, h: 2, config: {} },
    { id: 'w-default-6', type: 'trend-summary', title: 'Trend Summary', x: 0, y: 3, w: 4, h: 1, config: {} },
  ]
}
