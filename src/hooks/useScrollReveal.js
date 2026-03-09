import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * Reusable scroll-triggered reveal animation.
 * Attach the returned ref to a container — all children with
 * [data-reveal] will animate in when scrolled into view.
 */
export function useScrollReveal(options = {}) {
  const containerRef = useRef(null)

  const {
    y = 60,
    opacity = 0,
    stagger = 0.12,
    duration = 0.9,
    ease = 'power3.out',
    start = 'top 85%',
    once = true,
    scroller,
  } = options

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll('[data-reveal]')
    if (!elements.length) return

    gsap.set(elements, { y, opacity })

    ScrollTrigger.batch(elements, {
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          opacity: 1,
          stagger,
          duration,
          ease,
          overwrite: true,
        })
      },
      start,
      once,
      scroller: scroller || undefined,
    })
  }, { scope: containerRef, dependencies: [scroller] })

  return containerRef
}
