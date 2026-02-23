/**
 * useHashRouter — Syncs activeView with window.location.hash.
 *
 * Gives the app deep-linking, back/forward support, and shareable URLs
 * without adding a router library.
 *
 * Hash format: #/view-name  (e.g. #/dashboard, #/checklist, #/settings)
 * Falls back to 'dashboard' for unknown or empty hashes.
 */
import { useState, useEffect, useCallback, useRef } from 'react'

const VALID_VIEWS = new Set([
  'dashboard', 'checklist', 'competitors', 'analyzer', 'writer', 'scorer',
  'content-ops', 'schema', 'monitoring', 'metrics', 'gsc',
  'ga4', 'aeo-impact', 'docs', 'testing', 'settings',
])

const DEFAULT_VIEW = 'dashboard'

function getViewFromHash() {
  const hash = window.location.hash
  if (!hash || hash.length < 3) return DEFAULT_VIEW
  const view = hash.replace(/^#\/?/, '')
  return VALID_VIEWS.has(view) ? view : DEFAULT_VIEW
}

export default function useHashRouter() {
  const [activeView, setActiveViewState] = useState(() => getViewFromHash())
  const isInternalChange = useRef(false)

  // Update hash when view changes programmatically
  const setActiveView = useCallback((view) => {
    if (!VALID_VIEWS.has(view)) return
    isInternalChange.current = true
    setActiveViewState(view)
    const newHash = `#/${view}`
    if (window.location.hash !== newHash) {
      window.location.hash = newHash
    }
    // Reset flag after microtask (hashchange fires async)
    queueMicrotask(() => { isInternalChange.current = false })
  }, [])

  // Listen for browser back/forward
  useEffect(() => {
    function onHashChange() {
      if (isInternalChange.current) return
      const view = getViewFromHash()
      setActiveViewState(view)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Set initial hash if empty
  useEffect(() => {
    if (!window.location.hash || window.location.hash.length < 3) {
      window.location.hash = `#/${DEFAULT_VIEW}`
    }
  }, [])

  return { activeView, setActiveView }
}
