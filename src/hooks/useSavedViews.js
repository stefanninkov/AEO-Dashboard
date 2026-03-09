import { useState, useCallback, useMemo } from 'react'

/**
 * useSavedViews — Save, load, and share view configurations.
 *
 * Stores bookmarked view+filter combos in project data.
 * Each saved view captures: view id, filters, date range, label, and sharing.
 *
 * Stored in project.savedViews = SavedView[]
 * SavedView: { id, label, view, filters, dateRange, createdBy, createdAt, shared, pinned }
 */
export function useSavedViews({ activeProject, updateProject, user }) {
  const [editingId, setEditingId] = useState(null)

  const views = useMemo(() =>
    activeProject?.savedViews || [],
    [activeProject?.savedViews]
  )

  // Views visible to current user (own + shared)
  const visibleViews = useMemo(() =>
    views.filter(v => v.shared || v.createdBy === user?.uid),
    [views, user?.uid]
  )

  const pinnedViews = useMemo(() =>
    visibleViews.filter(v => v.pinned),
    [visibleViews]
  )

  const saveView = useCallback(({ label, view, filters = {}, dateRange = null }) => {
    if (!activeProject?.id || !user?.uid) return null

    const newView = {
      id: `sv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: label || `${view} view`,
      view,
      filters,
      dateRange,
      createdBy: user.uid,
      createdByName: user.displayName || user.email || 'Unknown',
      createdAt: new Date().toISOString(),
      shared: false,
      pinned: false,
    }

    updateProject(activeProject.id, {
      savedViews: [...views, newView],
    })

    return newView.id
  }, [activeProject, views, user, updateProject])

  const deleteView = useCallback((viewId) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      savedViews: views.filter(v => v.id !== viewId),
    })
  }, [activeProject, views, updateProject])

  const updateView = useCallback((viewId, changes) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      savedViews: views.map(v =>
        v.id === viewId ? { ...v, ...changes } : v
      ),
    })
  }, [activeProject, views, updateProject])

  const togglePin = useCallback((viewId) => {
    const view = views.find(v => v.id === viewId)
    if (view) updateView(viewId, { pinned: !view.pinned })
  }, [views, updateView])

  const toggleShare = useCallback((viewId) => {
    const view = views.find(v => v.id === viewId)
    if (view) updateView(viewId, { shared: !view.shared })
  }, [views, updateView])

  const duplicateView = useCallback((viewId) => {
    const source = views.find(v => v.id === viewId)
    if (!source || !activeProject?.id || !user?.uid) return
    saveView({
      label: `${source.label} (copy)`,
      view: source.view,
      filters: { ...source.filters },
      dateRange: source.dateRange,
    })
  }, [views, activeProject, user, saveView])

  return {
    views: visibleViews,
    pinnedViews,
    saveView,
    deleteView,
    updateView,
    togglePin,
    toggleShare,
    duplicateView,
    editingId,
    setEditingId,
  }
}
