import { useRef, useEffect } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Staggers children of the container into view on mount.
 * Targets direct children or elements matching `selector`.
 *
 * @param {object} [opts]
 * @param {string} [opts.selector] - CSS selector for children (default: direct children)
 * @param {number} [opts.stagger=0.06] - Stagger delay between items
 * @param {number} [opts.y=16] - Initial y offset
 * @param {number} [opts.duration=0.4] - Animation duration
 * @param {boolean} [opts.enabled=true]
 */
export function useStaggerReveal({ selector, stagger = 0.06, y = 16, duration = 0.4, enabled = true } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = selector ? el.querySelectorAll(selector) : el.children
    if (!targets || targets.length === 0) return

    gsap.fromTo(targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        stagger,
        duration,
        ease: 'power2.out',
        clearProps: 'transform',
      }
    )
  }, [selector, stagger, y, duration, enabled])

  return ref
}
