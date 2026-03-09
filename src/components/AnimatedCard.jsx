import { useRef, useEffect, memo } from 'react'
import { gsap } from '../lib/gsap'

/**
 * A card wrapper that animates in on mount (fade + slide up)
 * and scales subtly on hover.
 *
 * @param {number} [delay=0] - Entrance delay (for staggering manually)
 * @param {string} [className='card'] - CSS class
 * @param {ReactNode} children
 */
export default memo(function AnimatedCard({ delay = 0, className = 'card', children, style, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        delay,
        ease: 'power2.out',
        clearProps: 'transform',
      }
    )
  }, [delay])

  return (
    <div ref={ref} className={className} style={{ opacity: 0, ...style }} {...rest}>
      {children}
    </div>
  )
})
