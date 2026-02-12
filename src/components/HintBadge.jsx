import { useState } from 'react'

export default function HintBadge({ hint, children, position = 'top', active = true }) {
  const [show, setShow] = useState(false)

  // When hints mode is off, just render children
  if (!active || !hint) return children

  return (
    <div
      className="hint-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {/* Small pulsing dot indicator */}
      <div className="hint-dot" />
      {/* Tooltip on hover */}
      {show && (
        <div className={`hint-tooltip hint-tooltip-${position}`}>
          {hint}
        </div>
      )}
    </div>
  )
}
