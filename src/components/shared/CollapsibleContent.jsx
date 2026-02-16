import { useState, useRef, useEffect } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function CollapsibleContent({ expanded, children }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(expanded ? 'auto' : 0)
  const [overflow, setOverflow] = useState(expanded ? 'visible' : 'hidden')
  const reducedMotion = useReducedMotion()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (expanded) {
        setHeight('auto')
        setOverflow('visible')
      }
      return
    }

    if (expanded) {
      const h = contentRef.current?.scrollHeight || 0
      setHeight(h + 'px')
      setOverflow('hidden')
      const timer = setTimeout(() => {
        setHeight('auto')
        setOverflow('visible')
      }, reducedMotion ? 0 : 250)
      return () => clearTimeout(timer)
    } else {
      const h = contentRef.current?.scrollHeight || 0
      setHeight(h + 'px')
      setOverflow('hidden')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight('0px')
        })
      })
    }
  }, [expanded, reducedMotion])

  return (
    <div
      ref={contentRef}
      style={{
        height: height === 'auto' ? 'auto' : height,
        overflow,
        transition: reducedMotion ? 'none' : 'height 250ms ease-out',
      }}
    >
      {children}
    </div>
  )
}
