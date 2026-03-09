import { memo, useState, useRef, useEffect } from 'react'
import {
  Bell, Check, CheckCheck, MessageSquare, AtSign, UserPlus,
  Users, BarChart3, Activity, Zap, AlertTriangle, X, Filter,
} from 'lucide-react'

const TYPE_CONFIG = {
  comment:       { icon: MessageSquare, color: 'var(--accent)' },
  mention:       { icon: AtSign,        color: 'var(--color-phase-2)' },
  assignment:    { icon: UserPlus,      color: 'var(--color-phase-3)' },
  team:          { icon: Users,         color: 'var(--color-phase-4)' },
  score:         { icon: BarChart3,     color: 'var(--color-phase-1)' },
  progress:      { icon: Check,         color: 'var(--color-success)' },
  monitor_alert: { icon: AlertTriangle, color: 'var(--color-warning)' },
  automation:    { icon: Zap,           color: 'var(--color-phase-5)' },
}

const PRIORITY_DOT = {
  urgent: 'var(--color-error)',
  high:   'var(--color-warning)',
}

/**
 * NotificationBell — Bell icon with badge + dropdown notification list.
 */
function NotificationBell({
  notifications = [], unreadCount = 0,
  filter, setFilter, availableTypes = [],
  markRead, markAllRead, onNavigate,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: 'var(--space-1)',
          color: open ? 'var(--accent)' : 'var(--text-secondary)',
          transition: 'color 100ms',
        }}
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -4,
            minWidth: '0.875rem', height: '0.875rem', borderRadius: '9999px',
            background: 'var(--color-error)', color: '#fff',
            fontSize: '0.5rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 0.1875rem', lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 'var(--space-1)',
          width: '22rem', maxHeight: '28rem',
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column', zIndex: 1000,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--space-3)', borderBottom: '0.0625rem solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Notifications
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              {/* Filter */}
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{
                  padding: '0.125rem var(--space-1)', fontSize: '0.5625rem',
                  border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)', color: 'var(--text-secondary)',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                {availableTypes.map(t => (
                  <option key={t} value={t}>
                    {t === 'all' ? 'All' : t === 'unread' ? 'Unread' : t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              {/* Mark all read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0.125rem', color: 'var(--accent)',
                  }}
                  title="Mark all read"
                >
                  <CheckCheck size={14} />
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.125rem', color: 'var(--text-disabled)',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: 'var(--space-6)', textAlign: 'center',
                color: 'var(--text-disabled)', fontSize: 'var(--text-xs)',
              }}>
                <Bell size={24} style={{ margin: '0 auto var(--space-2)', opacity: 0.3 }} />
                <div>No notifications</div>
              </div>
            ) : (
              notifications.slice(0, 50).map(notif => {
                const cfg = TYPE_CONFIG[notif.type] || { icon: Activity, color: 'var(--text-tertiary)' }
                const Icon = cfg.icon
                const priorityColor = PRIORITY_DOT[notif.priority]

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markRead(notif.id)
                      if (notif.actionView && onNavigate) {
                        onNavigate(notif.actionView)
                        setOpen(false)
                      }
                    }}
                    style={{
                      display: 'flex', gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderBottom: '0.0625rem solid var(--border-subtle)',
                      cursor: 'pointer',
                      background: notif.read ? 'transparent' : 'color-mix(in srgb, var(--accent) 4%, transparent)',
                      transition: 'background 100ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'color-mix(in srgb, var(--accent) 4%, transparent)'}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                      background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: '0.125rem', position: 'relative',
                    }}>
                      <Icon size={11} style={{ color: cfg.color }} />
                      {priorityColor && (
                        <div style={{
                          position: 'absolute', top: -1, right: -1,
                          width: 6, height: 6, borderRadius: '50%',
                          background: priorityColor,
                          border: '1px solid var(--bg-card)',
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 'var(--text-xs)', fontWeight: notif.read ? 400 : 600,
                        color: 'var(--text-primary)', lineHeight: 1.3,
                      }}>
                        {notif.title}
                      </div>
                      <div style={{
                        fontSize: '0.5625rem', color: 'var(--text-tertiary)',
                        lineHeight: 1.3, marginTop: '0.125rem',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {notif.body}
                      </div>
                      <div style={{
                        fontSize: '0.5rem', color: 'var(--text-disabled)',
                        marginTop: '0.1875rem',
                      }}>
                        {formatRelative(notif.timestamp)}
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--accent)', flexShrink: 0,
                        marginTop: '0.375rem',
                      }} />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 50 && (
            <div style={{
              padding: 'var(--space-2)', textAlign: 'center',
              borderTop: '0.0625rem solid var(--border-subtle)',
              fontSize: '0.5625rem', color: 'var(--text-disabled)',
            }}>
              Showing 50 of {notifications.length} notifications
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatRelative(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

export default memo(NotificationBell)
