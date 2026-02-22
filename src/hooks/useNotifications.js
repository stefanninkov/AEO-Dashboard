import { useMemo, useCallback, useRef, useEffect } from 'react'
import { showNotification } from '../utils/browserNotifications'

const MAX_NOTIFICATIONS = 50

/**
 * useNotifications — manages per-user notifications stored in project data.
 *
 * Storage: project.notifications = { [uid]: [{ id, type, message, data, timestamp, read }] }
 *
 * Returns:
 *   notifications: array of current user's notifications (newest first)
 *   unreadCount: number of unread notifications
 *   addNotification(targetUid, type, message, data): add a notification for a user
 *   markRead(notificationId): mark one notification as read
 *   markAllRead(): mark all notifications as read
 *   clearAll(): remove all notifications for current user
 */
export function useNotifications({ user, activeProject, updateProject }) {
  const uid = user?.uid
  const projectId = activeProject?.id
  const allNotifications = activeProject?.notifications || {}

  const notifications = useMemo(() => {
    if (!uid) return []
    return (allNotifications[uid] || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )
  }, [uid, allNotifications])

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  // Trigger browser push notification when new unread items appear
  const prevUnreadRef = useRef(unreadCount)
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      const newest = notifications.find(n => !n.read)
      if (newest) {
        showNotification('AEO Dashboard', newest.message)
      }
    }
    prevUnreadRef.current = unreadCount
  }, [unreadCount, notifications])

  const addNotification = useCallback((targetUid, type, message, data = {}) => {
    if (!projectId || !updateProject || !targetUid) return

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false,
    }

    const userNotifs = allNotifications[targetUid] || []
    const updated = [entry, ...userNotifs].slice(0, MAX_NOTIFICATIONS)
    const newNotifications = { ...allNotifications, [targetUid]: updated }
    updateProject(projectId, { notifications: newNotifications })
  }, [projectId, updateProject, allNotifications])

  const markRead = useCallback((notificationId) => {
    if (!uid || !projectId || !updateProject) return

    const userNotifs = allNotifications[uid] || []
    const updated = userNotifs.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    )
    const newNotifications = { ...allNotifications, [uid]: updated }
    updateProject(projectId, { notifications: newNotifications })
  }, [uid, projectId, updateProject, allNotifications])

  const markAllRead = useCallback(() => {
    if (!uid || !projectId || !updateProject) return

    const userNotifs = allNotifications[uid] || []
    const updated = userNotifs.map(n => ({ ...n, read: true }))
    const newNotifications = { ...allNotifications, [uid]: updated }
    updateProject(projectId, { notifications: newNotifications })
  }, [uid, projectId, updateProject, allNotifications])

  const clearAll = useCallback(() => {
    if (!uid || !projectId || !updateProject) return

    const newNotifications = { ...allNotifications }
    delete newNotifications[uid]
    updateProject(projectId, { notifications: newNotifications })
  }, [uid, projectId, updateProject, allNotifications])

  return {
    notifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    clearAll,
  }
}
