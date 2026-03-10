import { useState, useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function CollapsibleContent({ expanded, children }) {
  const contentRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const prevExpanded = useRef(expanded)
  const [animState, setAnimState] = useState(expanded ? 'open' : 'closed')

  useEffect(() => {
    // Skip if expanded hasn't actually changed
    if (prevExpanded.current === expanded) return
    prevExpanded.current = expanded

    const el = contentRef.current
    if (!el) return

    if (expanded) {
      // Measure the target height while collapsed
      const h = el.scrollHeight
      setAnimState('expanding')
      el.style.height = h + 'px'
      el.style.overflow = 'hidden'

      const timer = setTimeout(() => {
        el.style.height = 'auto'
        el.style.overflow = 'visible'
        setAnimState('open')
      }, reducedMotion ? 0 : 260)
      return () => clearTimeout(timer)
    } else {
      // Set explicit height first so CSS transition can animate from it
      const h = el.scrollHeight
      el.style.height = h + 'px'
      el.style.overflow = 'hidden'
      setAnimState('collapsing')

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.height = '0px'
        })
      })
    }
  }, [expanded, reducedMotion])

  // Determine inline styles based on state
  const isOpen = animState === 'open'
  const isClosed = animState === 'closed'

  return (
    <div
      ref={contentRef}
      style={{
        height: isClosed ? 0 : isOpen ? 'auto' : undefined,
        overflow: isOpen ? 'visible' : 'hidden',
        transition: reducedMotion ? 'none' : 'height 250ms ease-out',
      }}
    >
      {children}
    </div>
  )
}
