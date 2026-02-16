import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus within a container while active.
 * Saves the previously-focused element and restores it on deactivation.
 *
 * @param {boolean} isActive — whether the trap is currently active
 * @returns {React.RefObject} — attach to the container element
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isActive) return

    // Save the currently focused element to restore later
    previousFocusRef.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      const focusable = [...container.querySelectorAll(FOCUSABLE)]
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // Focus the first focusable element (unless something inside is already focused)
    requestAnimationFrame(() => {
      if (!container.contains(document.activeElement)) {
        const focusable = container.querySelectorAll(FOCUSABLE)
        if (focusable.length > 0) focusable[0].focus()
      }
    })

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the element that was focused before the trap
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [isActive])

  return containerRef
}
