import { memo, useEffect } from 'react'
import {
  X, MessageSquare, AtSign, UserPlus, Users,
  BarChart3, Check, AlertTriangle, Zap, Activity,
} from 'lucide-react'

const TYPE_ICONS = {
  comment: MessageSquare, mention: AtSign, assignment: UserPlus,
  team: Users, score: BarChart3, progress: Check,
  monitor_alert: AlertTriangle, automation: Zap,
}

const TYPE_COLORS = {
  comment: 'var(--accent)', mention: 'var(--color-phase-2)',
  assignment: 'var(--color-phase-3)', team: 'var(--color-phase-4)',
  score: 'var(--color-phase-1)', progress: 'var(--color-success)',
  monitor_alert: 'var(--color-warning)', automation: 'var(--color-phase-5)',
}

/**
 * ToastManager — Renders floating toast notifications.
 */
const AUTO_DISMISS_MS = 5000

function ToastManager({ toasts = [], dismissToast }) {
  // Auto-dismiss toasts after timeout
  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map(toast =>
      setTimeout(() => dismissToast(toast.toastId), AUTO_DISMISS_MS)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, dismissToast])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 'var(--space-4)', right: 'var(--space-4)',
      display: 'flex', flexDirection: 'column-reverse', gap: 'var(--space-2)',
      zIndex: 10000, pointerEvents: 'none',
      maxHeight: '50vh', overflow: 'hidden',
    }}>
      {toasts.slice(-5).map(toast => {
        const Icon = TYPE_ICONS[toast.type] || Activity
        const color = TYPE_COLORS[toast.type] || 'var(--text-tertiary)'

        return (
          <div
            key={toast.toastId}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
              padding: 'var(--space-3)', width: '18rem',
              background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderLeft: `0.1875rem solid ${color}`,
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'auto',
              animation: 'slideInRight 200ms ease-out',
            }}
          >
            <div style={{
              width: '1.25rem', height: '1.25rem', borderRadius: '50%', flexShrink: 0,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={10} style={{ color }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {toast.title}
              </div>
              <div style={{
                fontSize: '0.5625rem', color: 'var(--text-tertiary)', lineHeight: 1.3,
                marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {toast.body}
              </div>
            </div>

            <button
              onClick={() => dismissToast(toast.toastId)}
              aria-label="Dismiss notification"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, color: 'var(--text-disabled)', flexShrink: 0,
              }}
            >
              <X size={12} />
            </button>
          </div>
        )
      })}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default memo(ToastManager)
