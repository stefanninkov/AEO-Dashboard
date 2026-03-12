import { memo, useState, useEffect, useRef } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

/**
 * FeatureTour — Tooltip-based guided tour of a view's key features.
 *
 * Renders a floating tooltip that follows data-tour target elements.
 * Falls back to a centered card if the target isn't found.
 */
function FeatureTour({ steps = [], onDismiss, onFeatureSeen }) {
  const [current, setCurrent] = useState(0)
  const [pos, setPos] = useState(null)
  const tooltipRef = useRef(null)

  const step = steps[current]

  // Position tooltip near target element
  useEffect(() => {
    if (!step?.target) { setPos(null); return }

    const el = document.querySelector(step.target)
    if (!el) { setPos(null); return }

    const tooltipW = 260
    const tooltipH = 120
    const gap = 12

    const updatePos = () => {
      const rect = el.getBoundingClientRect()
      let top, left
      switch (step.position) {
        case 'bottom':
          top = rect.bottom + gap
          left = rect.left + rect.width / 2 - tooltipW / 2
          break
        case 'top':
          top = rect.top - tooltipH - gap
          left = rect.left + rect.width / 2 - tooltipW / 2
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipH / 2
          left = rect.left - tooltipW - gap
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipH / 2
          left = rect.right + gap
          break
        default:
          top = rect.bottom + gap
          left = rect.left
      }
      // Clamp to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8))
      top = Math.max(8, Math.min(top, window.innerHeight - tooltipH - 8))
      setPos({ top, left })
    }

    updatePos()

    // Highlight target
    el.style.outline = '2px solid var(--accent)'
    el.style.outlineOffset = '3px'
    el.style.borderRadius = 'var(--radius-md)'
    el.style.transition = 'outline 200ms'

    window.addEventListener('resize', updatePos)
    window.addEventListener('scroll', updatePos, true)

    return () => {
      el.style.outline = ''
      el.style.outlineOffset = ''
      el.style.borderRadius = ''
      el.style.transition = ''
      window.removeEventListener('resize', updatePos)
      window.removeEventListener('scroll', updatePos, true)
    }
  }, [step])

  // Notify feature seen
  useEffect(() => {
    if (step && onFeatureSeen) onFeatureSeen(step.target || step.title)
  }, [step, onFeatureSeen])

  if (!step) return null

  const isLast = current === steps.length - 1

  const tooltipStyle = pos
    ? { position: 'fixed', top: pos.top, left: pos.left, zIndex: 50001 }
    : { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50001 }

  return (
    <>
      {/* Backdrop (subtle) */}
      <div
        onClick={onDismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 50000,
          background: 'rgba(0,0,0,0.15)',
          pointerEvents: 'auto',
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          ...tooltipStyle,
          width: '16.25rem', padding: 'var(--space-3)',
          background: 'var(--bg-card)', border: '0.0625rem solid var(--accent)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 150ms ease-out',
          pointerEvents: 'auto',
        }}
      >
        {/* Close */}
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute', top: 'var(--space-1)', right: 'var(--space-1)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-disabled)', padding: 2,
          }}
        >
          <X size={12} />
        </button>

        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {step.title}
        </div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', lineHeight: 1.4, marginBottom: 'var(--space-2)' }}>
          {step.body}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
            {current + 1} / {steps.length}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            {current > 0 && (
              <button
                onClick={() => setCurrent(c => c - 1)}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0.125rem var(--space-1)', background: 'var(--hover-bg)',
                  border: '0.0625rem solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontSize: '0.5625rem', color: 'var(--text-secondary)',
                }}
              >
                <ChevronLeft size={10} /> Prev
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) onDismiss()
                else setCurrent(c => c + 1)
              }}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '0.125rem var(--space-2)',
                background: 'var(--accent)', border: 'none',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontSize: '0.5625rem', fontWeight: 600, color: '#fff',
              }}
            >
              {isLast ? 'Done' : 'Next'} {!isLast && <ChevronRight size={10} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </>
  )
}

export default memo(FeatureTour)
