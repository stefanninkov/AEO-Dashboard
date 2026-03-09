import { useCallback, useMemo } from 'react'

/**
 * useDataRetention — Data retention policy management and enforcement.
 *
 * Manages retention settings, calculates data age, and provides
 * cleanup functions for old data.
 *
 * Data stored in project.retentionPolicy = {
 *   activityLogDays: number (default 90),
 *   metricsHistoryDays: number (default 365),
 *   monitorHistoryDays: number (default 180),
 *   notificationDays: number (default 30),
 *   autoCleanup: boolean (default false),
 *   lastCleanup: ISO string | null,
 * }
 */
export function useDataRetention({ activeProject, updateProject }) {
  const policy = useMemo(() => ({
    activityLogDays: 90,
    metricsHistoryDays: 365,
    monitorHistoryDays: 180,
    notificationDays: 30,
    autoCleanup: false,
    lastCleanup: null,
    ...activeProject?.retentionPolicy,
  }), [activeProject?.retentionPolicy])

  // Calculate data sizes and ages
  const dataInventory = useMemo(() => {
    if (!activeProject) return []

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    const items = [
      {
        id: 'activityLog',
        label: 'Activity Log',
        count: (activeProject.activityLog || []).length,
        retentionDays: policy.activityLogDays,
        oldestTimestamp: getOldestTimestamp(activeProject.activityLog),
        expiredCount: countExpired(activeProject.activityLog, policy.activityLogDays),
        estimatedSizeKb: estimateSize(activeProject.activityLog),
      },
      {
        id: 'metricsHistory',
        label: 'Metrics History',
        count: (activeProject.metricsHistory || []).length,
        retentionDays: policy.metricsHistoryDays,
        oldestTimestamp: getOldestTimestamp(activeProject.metricsHistory),
        expiredCount: countExpired(activeProject.metricsHistory, policy.metricsHistoryDays),
        estimatedSizeKb: estimateSize(activeProject.metricsHistory),
      },
      {
        id: 'monitorHistory',
        label: 'Monitor History',
        count: (activeProject.monitorHistory || []).length,
        retentionDays: policy.monitorHistoryDays,
        oldestTimestamp: getOldestTimestamp(activeProject.monitorHistory, 'date'),
        expiredCount: countExpired(activeProject.monitorHistory, policy.monitorHistoryDays, 'date'),
        estimatedSizeKb: estimateSize(activeProject.monitorHistory),
      },
      {
        id: 'notifications',
        label: 'Notifications',
        count: countAllNotifications(activeProject.notifications),
        retentionDays: policy.notificationDays,
        oldestTimestamp: null,
        expiredCount: 0,
        estimatedSizeKb: estimateSize(activeProject.notifications),
      },
    ]

    return items
  }, [activeProject, policy])

  const totalSizeKb = useMemo(() =>
    dataInventory.reduce((sum, i) => sum + i.estimatedSizeKb, 0),
    [dataInventory]
  )

  const totalExpired = useMemo(() =>
    dataInventory.reduce((sum, i) => sum + i.expiredCount, 0),
    [dataInventory]
  )

  // Update retention policy
  const updatePolicy = useCallback((changes) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      retentionPolicy: { ...policy, ...changes },
    })
  }, [activeProject, policy, updateProject])

  // Clean up expired data
  const cleanupExpired = useCallback(() => {
    if (!activeProject?.id) return

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const updates = {}

    // Clean activity log
    if (activeProject.activityLog?.length) {
      const cutoff = now - policy.activityLogDays * day
      const cleaned = activeProject.activityLog.filter(e =>
        new Date(e.timestamp).getTime() >= cutoff
      )
      if (cleaned.length < activeProject.activityLog.length) {
        updates.activityLog = cleaned
      }
    }

    // Clean metrics history
    if (activeProject.metricsHistory?.length) {
      const cutoff = now - policy.metricsHistoryDays * day
      const cleaned = activeProject.metricsHistory.filter(e =>
        new Date(e.timestamp).getTime() >= cutoff
      )
      if (cleaned.length < activeProject.metricsHistory.length) {
        updates.metricsHistory = cleaned
      }
    }

    // Clean monitor history
    if (activeProject.monitorHistory?.length) {
      const cutoff = now - policy.monitorHistoryDays * day
      const cleaned = activeProject.monitorHistory.filter(e =>
        new Date(e.date || e.timestamp).getTime() >= cutoff
      )
      if (cleaned.length < activeProject.monitorHistory.length) {
        updates.monitorHistory = cleaned
      }
    }

    if (Object.keys(updates).length > 0) {
      updates.retentionPolicy = {
        ...policy,
        lastCleanup: new Date().toISOString(),
      }
      updateProject(activeProject.id, updates)
    }

    return Object.keys(updates).length - 1 // subtract retentionPolicy key
  }, [activeProject, policy, updateProject])

  return {
    policy,
    updatePolicy,
    dataInventory,
    totalSizeKb,
    totalExpired,
    cleanupExpired,
  }
}

// ── Helpers ──

function getOldestTimestamp(arr, tsField = 'timestamp') {
  if (!arr?.length) return null
  const timestamps = arr.map(e => new Date(e[tsField] || e.timestamp).getTime()).filter(t => !isNaN(t))
  return timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null
}

function countExpired(arr, retentionDays, tsField = 'timestamp') {
  if (!arr?.length) return 0
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
  return arr.filter(e => new Date(e[tsField] || e.timestamp).getTime() < cutoff).length
}

function countAllNotifications(notifications) {
  if (!notifications || typeof notifications !== 'object') return 0
  return Object.values(notifications).reduce((sum, arr) =>
    sum + (Array.isArray(arr) ? arr.length : 0), 0)
}

function estimateSize(data) {
  if (!data) return 0
  try {
    return Math.round(JSON.stringify(data).length / 1024)
  } catch {
    return 0
  }
}
