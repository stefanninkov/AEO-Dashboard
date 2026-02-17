import { useState, useRef, useEffect } from 'react'
import {
  Bell, CheckCircle2, MessageSquare, UserPlus, UserMinus,
  Zap, X, CheckCheck, Trash2
} from 'lucide-react'

const NOTIF_ICONS = {
  task_assign: { icon: UserPlus, color: 'var(--color-phase-2)' },
  task_unassign: { icon: UserMinus, color: 'var(--text-disabled)' },
  comment: { icon: MessageSquare, color: 'var(--color-phase-4)' },
  mention: { icon: MessageSquare, color: 'var(--color-phase-4)' },
  phase_complete: { icon: CheckCircle2, color: 'var(--color-success)' },
  score_change: { icon: Zap, color: 'var(--color-phase-1)' },
}

function getRelativeTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function NotificationCenter({
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="notif-bell"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={() => { onMarkAllRead(); }}
                  className="notif-action-btn"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => { onClearAll(); setOpen(false) }}
                  className="notif-action-btn"
                  title="Clear all"
                >
                  <Trash2 size={13} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="notif-action-btn"
                title="Close"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="notif-panel-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={20} style={{ color: 'var(--text-disabled)', marginBottom: '0.375rem' }} />
                <p>No notifications</p>
                <p className="notif-empty-sub">You'll be notified about team activity here.</p>
              </div>
            ) : (
              notifications.map(notif => {
                const config = NOTIF_ICONS[notif.type] || { icon: Bell, color: 'var(--text-disabled)' }
                const Icon = config.icon
                return (
                  <div
                    key={notif.id}
                    className={`notif-item${notif.read ? '' : ' unread'}`}
                    onClick={() => { if (!notif.read) onMarkRead(notif.id) }}
                  >
                    <div
                      className="notif-icon"
                      style={{ background: config.color + '18', color: config.color }}
                    >
                      <Icon size={12} />
                    </div>
                    <div className="notif-content">
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-time">{getRelativeTime(notif.timestamp)}</span>
                    </div>
                    {!notif.read && <div className="notif-unread-dot" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
