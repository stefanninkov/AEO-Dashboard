import { useEffect, useRef } from 'react'

/**
 * useSwipeGesture — Detects horizontal swipe gestures for sidebar open/close.
 *
 * @param {Object} options
 * @param {Function} options.onSwipeRight — Called when user swipes right (open sidebar)
 * @param {Function} options.onSwipeLeft  — Called when user swipes left (close sidebar)
 * @param {number}   options.threshold    — Min distance in px to trigger (default: 50)
 * @param {number}   options.edgeWidth    — Max start-x in px for right swipe (default: 30)
 * @param {boolean}  options.enabled      — Whether gesture detection is active
 */
export function useSwipeGesture({ onSwipeRight, onSwipeLeft, threshold = 50, edgeWidth = 30, enabled = true }) {
  const touchStart = useRef(null)

  useEffect(() => {
    if (!enabled) return

    function handleTouchStart(e) {
      const touch = e.touches[0]
      touchStart.current = { x: touch.clientX, y: touch.clientY }
    }

    function handleTouchEnd(e) {
      if (!touchStart.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStart.current.x
      const dy = touch.clientY - touchStart.current.y

      // Only trigger if horizontal movement dominates vertical
      if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) {
        touchStart.current = null
        return
      }

      if (dx > 0 && touchStart.current.x < edgeWidth) {
        // Swipe right from left edge → open sidebar
        onSwipeRight?.()
      } else if (dx < 0) {
        // Swipe left → close sidebar
        onSwipeLeft?.()
      }

      touchStart.current = null
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, onSwipeRight, onSwipeLeft, threshold, edgeWidth])
}
