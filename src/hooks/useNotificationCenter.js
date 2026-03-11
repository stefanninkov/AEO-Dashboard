import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

/**
 * useNotificationCenter — Unified notification management.
 *
 * Aggregates notifications from activity log, monitors, automations,
 * and system events. Supports read/unread, filtering, bulk actions,
 * and preference-based muting.
 *
 * Notification shape: {
 *   id, type, title, body, timestamp, read, source,
 *   priority ('low'|'normal'|'high'|'urgent'),
 *   actionLabel?, actionView?, authorName?, authorUid?,
 * }
 */
export function useNotificationCenter({ activeProject, user, updateProject }) {
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | type
  const [toasts, setToasts] = useState([])
  const prevCountRef = useRef(0)
  const toastTimersRef = useRef(new Set())

  // Clean up toast timeouts on unmount
  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach(id => clearTimeout(id))
      toastTimersRef.current.clear()
    }
  }, [])

  // User preferences (stored in project per-user)
  const prefs = useMemo(() => ({
    mutedTypes: [],
    showToasts: true,
    toastDuration: 5000,
    soundEnabled: false,
    digestEnabled: false,
    digestFrequency: 'daily',
    ...activeProject?.notificationPrefs?.[user?.uid],
  }), [activeProject?.notificationPrefs, user?.uid])

  // Build notification list from various sources
  const allNotifications = useMemo(() => {
    if (!activeProject) return []

    const notifs = []
    const userUid = user?.uid
    const readSet = new Set(activeProject?.readNotifications?.[userUid] || [])

    // From activity log — events relevant to this user
    ;(activeProject.activityLog || []).forEach(entry => {
      // Skip own actions
      if (entry.authorUid === userUid) return

      const notif = activityToNotification(entry)
      if (notif) {
        notif.read = readSet.has(notif.id)
        notifs.push(notif)
      }
    })

    // From monitor alerts
    ;(activeProject.monitorAlerts || []).forEach(alert => {
      notifs.push({
        id: `monitor-${alert.id || alert.timestamp}`,
        type: 'monitor_alert',
        title: 'Monitor Alert',
        body: alert.message || `${alert.metric}: ${alert.value}`,
        timestamp: alert.timestamp,
        read: readSet.has(`monitor-${alert.id || alert.timestamp}`),
        source: 'monitor',
        priority: alert.severity === 'critical' ? 'urgent' : alert.severity === 'warning' ? 'high' : 'normal',
      })
    })

    // From automation results
    ;(activeProject.automationLog || []).forEach(entry => {
      if (entry.status === 'error' || entry.notifyUser) {
        notifs.push({
          id: `auto-${entry.id || entry.timestamp}`,
          type: 'automation',
          title: entry.status === 'error' ? 'Automation Failed' : 'Automation Completed',
          body: entry.ruleName || entry.message || 'An automation ran',
          timestamp: entry.timestamp,
          read: readSet.has(`auto-${entry.id || entry.timestamp}`),
          source: 'automation',
          priority: entry.status === 'error' ? 'high' : 'low',
        })
      }
    })

    // Sort newest first
    notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    return notifs
  }, [activeProject, user?.uid])

  // Apply muted types and filter
  const notifications = useMemo(() => {
    let result = allNotifications.filter(n => !prefs.mutedTypes.includes(n.type))
    if (filter === 'unread') result = result.filter(n => !n.read)
    else if (filter !== 'all') result = result.filter(n => n.type === filter)
    return result
  }, [allNotifications, prefs.mutedTypes, filter])

  const unreadCount = useMemo(() =>
    allNotifications.filter(n => !n.read && !prefs.mutedTypes.includes(n.type)).length,
    [allNotifications, prefs.mutedTypes]
  )

  // Detect new notifications and show toasts
  useEffect(() => {
    if (!prefs.showToasts) return
    if (prevCountRef.current > 0 && allNotifications.length > prevCountRef.current) {
      const newOnes = allNotifications.slice(0, allNotifications.length - prevCountRef.current)
      newOnes.forEach(n => {
        if (!n.read) addToast(n)
      })
    }
    prevCountRef.current = allNotifications.length
  }, [allNotifications.length, prefs.showToasts])

  // Toast management
  const addToast = useCallback((notification) => {
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts(prev => [...prev, { ...notification, toastId }])
    const timerId = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.toastId !== toastId))
      toastTimersRef.current.delete(timerId)
    }, prefs.toastDuration)
    toastTimersRef.current.add(timerId)
  }, [prefs.toastDuration])

  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId))
  }, [])

  // Mark as read
  const markRead = useCallback((notifId) => {
    if (!activeProject?.id || !user?.uid) return
    const current = activeProject.readNotifications?.[user.uid] || []
    if (current.includes(notifId)) return
    updateProject(activeProject.id, {
      readNotifications: {
        ...activeProject.readNotifications,
        [user.uid]: [...current, notifId],
      },
    })
  }, [activeProject, user?.uid, updateProject])

  const markAllRead = useCallback(() => {
    if (!activeProject?.id || !user?.uid) return
    const allIds = allNotifications.filter(n => !n.read).map(n => n.id)
    const current = activeProject.readNotifications?.[user.uid] || []
    updateProject(activeProject.id, {
      readNotifications: {
        ...activeProject.readNotifications,
        [user.uid]: [...new Set([...current, ...allIds])],
      },
    })
  }, [activeProject, user?.uid, allNotifications, updateProject])

  // Update preferences
  const updatePrefs = useCallback((changes) => {
    if (!activeProject?.id || !user?.uid) return
    updateProject(activeProject.id, {
      notificationPrefs: {
        ...activeProject.notificationPrefs,
        [user.uid]: { ...prefs, ...changes },
      },
    })
  }, [activeProject, user?.uid, prefs, updateProject])

  // Unique types for filter dropdown
  const availableTypes = useMemo(() => {
    const types = new Set(allNotifications.map(n => n.type))
    return ['all', 'unread', ...Array.from(types).sort()]
  }, [allNotifications])

  return {
    notifications,
    unreadCount,
    filter, setFilter,
    availableTypes,
    markRead,
    markAllRead,
    prefs,
    updatePrefs,
    toasts,
    dismissToast,
    addToast,
  }
}

// ── Helpers ──

function activityToNotification(entry) {
  const base = {
    id: `activity-${entry.id}`,
    timestamp: entry.timestamp,
    source: 'activity',
    priority: 'normal',
    authorName: entry.authorName,
    authorUid: entry.authorUid,
  }

  switch (entry.type) {
    case 'comment':
      return { ...base, type: 'comment', title: 'New Comment', body: `${entry.authorName} commented: "${truncate(entry.commentText, 60)}"`, actionView: 'checklist' }
    case 'mention':
      return { ...base, type: 'mention', title: 'You were mentioned', body: `${entry.authorName} mentioned you in a comment`, priority: 'high', actionView: 'checklist' }
    case 'task_assign':
      return { ...base, type: 'assignment', title: 'Task Assigned', body: `${entry.authorName} assigned "${truncate(entry.taskText, 50)}" to ${entry.assigneeName}`, actionView: 'checklist' }
    case 'member_add':
      return { ...base, type: 'team', title: 'New Team Member', body: `${entry.authorName} added ${entry.memberName} to the project`, priority: 'low' }
    case 'member_remove':
      return { ...base, type: 'team', title: 'Member Removed', body: `${entry.authorName} removed ${entry.memberName}`, priority: 'low' }
    case 'role_change':
      return { ...base, type: 'team', title: 'Role Changed', body: `${entry.authorName} changed ${entry.memberName}'s role to ${entry.newRole}` }
    case 'score_change':
      return { ...base, type: 'score', title: 'Score Updated', body: `Score changed to ${entry.score}%`, priority: 'low' }
    case 'check':
    case 'uncheck':
      return { ...base, type: 'progress', title: entry.type === 'check' ? 'Item Completed' : 'Item Unchecked', body: `${entry.authorName} ${entry.type === 'check' ? 'completed' : 'unchecked'} "${truncate(entry.taskText, 50)}"`, priority: 'low', actionView: 'checklist' }
    default:
      return null
  }
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}
