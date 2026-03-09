import { useRef, useEffect, useCallback } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Animates view content in when `activeView` changes.
 * Returns a ref to attach to the view container.
 */
export function usePageTransition(activeView) {
  const containerRef = useRef(null)
  const prevView = useRef(activeView)

  useEffect(() => {
    const el = containerRef.current
    if (!el || activeView === prevView.current) {
      prevView.current = activeView
      return
    }
    prevView.current = activeView

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Quick fade+slide entrance
    gsap.fromTo(el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
    )
  }, [activeView])

  return containerRef
}
