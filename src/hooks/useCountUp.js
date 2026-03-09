import { useRef, useEffect, useState } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Animates a number from 0 (or `from`) to `to` using GSAP.
 * Returns the current display value.
 *
 * @param {number} to - Target value
 * @param {object} [opts]
 * @param {number} [opts.from=0] - Start value
 * @param {number} [opts.duration=1] - Animation duration in seconds
 * @param {number} [opts.decimals=0] - Decimal places
 * @param {boolean} [opts.enabled=true] - Whether to animate
 */
export function useCountUp(to, { from = 0, duration = 1, decimals = 0, enabled = true } = {}) {
  const [display, setDisplay] = useState(enabled ? from : to)
  const objRef = useRef({ val: from })
  const tweenRef = useRef(null)

  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(to)
      return
    }

    // Kill previous tween
    if (tweenRef.current) tweenRef.current.kill()

    objRef.current.val = from
    tweenRef.current = gsap.to(objRef.current, {
      val: to,
      duration,
      ease: 'power2.out',
      onUpdate() {
        setDisplay(
          decimals > 0
            ? parseFloat(objRef.current.val.toFixed(decimals))
            : Math.round(objRef.current.val)
        )
      },
    })

    return () => {
      if (tweenRef.current) tweenRef.current.kill()
    }
  }, [to, from, duration, decimals, enabled])

  return display
}
