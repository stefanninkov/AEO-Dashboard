import { useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Auto-scrolls the active tab button to the center of a scrollable container.
 * @param {React.RefObject} containerRef - ref to the .scrollable-tabs wrapper
 * @param {string|number} activeTabId    - current active tab value (triggers scroll on change)
 */
export function useScrollActiveTab(containerRef, activeTabId) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!containerRef.current) return

    requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return

      const activeBtn = container.querySelector('[data-active="true"]')
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: reducedMotion ? 'instant' : 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    })
  }, [activeTabId, containerRef, reducedMotion])
}
