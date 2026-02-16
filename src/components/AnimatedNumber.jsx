import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function AnimatedNumber({ value, duration = 500, formatter }) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  const rafRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const from = prevValueRef.current
    const to = value
    prevValueRef.current = value

    if (reducedMotion || from === to) {
      setDisplayValue(to)
      return
    }

    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Cubic ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (to - from) * eased)
      setDisplayValue(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration, reducedMotion])

  return <>{formatter ? formatter(displayValue) : displayValue}</>
}
