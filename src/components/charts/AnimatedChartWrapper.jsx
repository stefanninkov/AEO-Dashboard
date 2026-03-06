import { useState, useEffect, useRef, memo } from 'react'

/**
 * Wraps chart components with smooth fade/scale transitions when data changes.
 * Also handles initial mount animation.
 *
 * @param {boolean} [animate=true] - Enable/disable animations
 * @param {number}  [duration=400] - Transition duration in ms
 * @param {*}       dataKey        - Key to watch for changes (triggers re-animation)
 */
const AnimatedChartWrapper = memo(function AnimatedChartWrapper({
  children, animate = true, duration = 400, dataKey, style,
}) {
  const [visible, setVisible] = useState(!animate)
  const [transitioning, setTransitioning] = useState(false)
  const prevDataRef = useRef(dataKey)

  // Mount animation
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setVisible(true), 50)
      return () => clearTimeout(timer)
    }
  }, [animate])

  // Data change animation
  useEffect(() => {
    if (!animate) return
    if (prevDataRef.current !== undefined && prevDataRef.current !== dataKey) {
      setTransitioning(true)
      const timer = setTimeout(() => setTransitioning(false), duration)
      prevDataRef.current = dataKey
      return () => clearTimeout(timer)
    }
    prevDataRef.current = dataKey
  }, [dataKey, animate, duration])

  const animStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.97)',
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    ...(transitioning ? {
      animation: `chart-data-update ${duration}ms ease-out`,
    } : {}),
    ...style,
  }

  return (
    <div style={animStyle}>
      {children}
    </div>
  )
})

// Inject chart animation keyframes once
if (typeof document !== 'undefined') {
  const styleId = 'aeo-chart-animations'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes chart-data-update {
        0% { opacity: 0.6; transform: scale(0.98); }
        100% { opacity: 1; transform: scale(1); }
      }
    `
    document.head.appendChild(style)
  }
}

export default AnimatedChartWrapper
