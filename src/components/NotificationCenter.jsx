import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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

const VIEW_MAP = {
  task_assign: 'checklist',
  task_unassign: 'checklist',
  comment: 'checklist',
  mention: 'checklist',
  phase_complete: 'checklist',
  score_change: 'metrics',
}

function getRelativeTime(dateStr, t) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return t('time.justNow')
  if (diffMins < 60) return t('time.minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('time.hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('time.daysAgo', { count: diffDays })
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function NotificationCenter({
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  setActiveView,
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const prevUnreadRef = useRef(unreadCount)

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Notification sound — play a subtle ping when new unread notifications arrive
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      try {
        const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
        if (prefs.notificationSound !== false) {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = 800
          osc.type = 'sine'
          gain.gain.value = 0.1
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
          osc.start(ctx.currentTime)
          osc.stop(ctx.currentTime + 0.15)
        }
      } catch { /* ignore audio errors */ }
    }
    prevUnreadRef.current = unreadCount
  }, [unreadCount])

  // Group similar notifications within 5 minutes
  const groupedNotifications = useMemo(() => {
    const groups = []
    const recentMap = new Map()

    notifications.forEach(notif => {
      const contextKey = `${notif.type}-${notif.data?.taskId || notif.data?.phase || ''}`
      const existing = recentMap.get(contextKey)

      if (existing && Math.abs(new Date(existing.timestamp) - new Date(notif.timestamp)) < 300000) {
        existing.count = (existing.count || 1) + 1
        existing.groupedIds = existing.groupedIds || [existing.id]
        existing.groupedIds.push(notif.id)
        return
      }

      const entry = { ...notif, count: 1 }
      groups.push(entry)
      recentMap.set(contextKey, entry)
    })
    return groups
  }, [notifications])

  // Click handler — mark as read + navigate to relevant view
  const handleNotifClick = useCallback((notif) => {
    if (!notif.read) onMarkRead(notif.id)
    // Mark grouped items as read too
    if (notif.groupedIds) {
      notif.groupedIds.forEach(id => onMarkRead(id))
    }
    const targetView = VIEW_MAP[notif.type] || 'dashboard'
    if (setActiveView) setActiveView(targetView)
    setOpen(false)
  }, [onMarkRead, setActiveView])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="notif-bell"
        title={unreadCount > 0 ? t('notifications.unreadCount', { count: unreadCount }) : t('notifications.title')}
        aria-label={`${t('notifications.title')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
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
            <span className="notif-panel-title">{t('notifications.title')}</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={() => { onMarkAllRead(); }}
                  className="notif-action-btn"
                  title={t('notifications.markAllRead')}
                  aria-label={t('notifications.markAllRead')}
                >
                  <CheckCheck size={13} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => { onClearAll(); setOpen(false) }}
                  className="notif-action-btn"
                  title={t('notifications.clearAll')}
                  aria-label={t('notifications.clearAll')}
                >
                  <Trash2 size={13} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="notif-action-btn"
                title={t('actions.close')}
                aria-label={t('actions.close')}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="notif-panel-list">
            {groupedNotifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={20} style={{ color: 'var(--text-disabled)', marginBottom: '0.375rem' }} />
                <p>{t('notifications.noNotifications')}</p>
                <p className="notif-empty-sub">{t('notifications.noNotificationsDesc')}</p>
              </div>
            ) : (
              groupedNotifications.map(notif => {
                const config = NOTIF_ICONS[notif.type] || { icon: Bell, color: 'var(--text-disabled)' }
                const Icon = config.icon
                return (
                  <div
                    key={notif.id}
                    className={`notif-item${notif.read ? '' : ' unread'}`}
                    onClick={() => handleNotifClick(notif)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotifClick(notif) } }}
                    role="button"
                    tabIndex={0}
                    aria-label={t('notifications.clickToNavigate', { message: notif.message })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="notif-icon"
                      style={{ background: config.color + '18', color: config.color }}
                    >
                      <Icon size={12} />
                    </div>
                    <div className="notif-content">
                      <p className="notif-message">
                        {notif.message}
                        {notif.count > 1 && (
                          <span style={{
                            fontSize: '0.5625rem', fontWeight: 700,
                            padding: '0.0625rem 0.3125rem', borderRadius: '0.25rem',
                            background: config.color + '18', color: config.color,
                            marginLeft: '0.375rem', whiteSpace: 'nowrap',
                          }}>
                            {t('notifications.moreCount', { count: notif.count - 1 })}
                          </span>
                        )}
                      </p>
                      <span className="notif-time">{getRelativeTime(notif.timestamp, t)}</span>
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
