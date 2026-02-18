/**
 * ProgressBar — Reusable animated progress bar with stage text.
 *
 * Props:
 *   current  — current step (number)
 *   total    — total steps (number)
 *   stage    — current stage label (string)
 *   color    — fill color (CSS value, defaults to --color-phase-1)
 */

import { Loader2 } from 'lucide-react'

export default function ProgressBar({ current = 0, total = 0, stage = '', color }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const fill = color || 'var(--color-phase-1)'

  return (
    <div
      className="card fade-in-up"
      style={{
        padding: '0.875rem 1.125rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
      }}
    >
      {/* Stage label + percentage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Loader2 size={14} style={{ color: fill, animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <span style={{
            fontSize: '0.8125rem', fontWeight: 600,
            color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
          }}>
            {stage || 'Processing...'}
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700,
          fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)',
        }}>
          {pct}%
        </span>
      </div>

      {/* Progress bar track */}
      <div style={{
        width: '100%', height: '0.375rem', borderRadius: '0.1875rem',
        background: 'var(--hover-bg)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '0.1875rem',
          background: fill,
          width: `${pct}%`,
          transition: 'width 300ms ease',
        }} />
      </div>

      {/* Step counter */}
      <span style={{
        fontSize: '0.6875rem', color: 'var(--text-tertiary)',
        fontFamily: 'var(--font-heading)',
      }}>
        Step {current} of {total}
      </span>
    </div>
  )
}
