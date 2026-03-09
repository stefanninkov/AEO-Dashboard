import { useCallback, useMemo } from 'react'
import { createActivity, appendActivity } from '../utils/activityLogger'

/**
 * useAssignments — Manages task assignments with optional due dates.
 *
 * Data model: project.assignments = {
 *   [itemId]: {
 *     assigneeUid: string,
 *     assigneeName: string,
 *     assigneeEmail: string,
 *     assignedBy: string (uid),
 *     assignedByName: string,
 *     dueDate: string | null,
 *     assignedAt: ISO string,
 *   }
 * }
 *
 * @param {Object} options
 * @param {Object} options.activeProject
 * @param {Function} options.updateProject
 * @param {Object} options.user
 * @param {Function} [options.addNotification]
 */
export function useAssignments({ activeProject, updateProject, user, addNotification }) {
  const allAssignments = useMemo(() => activeProject?.assignments || {}, [activeProject?.assignments])

  const getAssignment = useCallback((itemId) => {
    return allAssignments[itemId] || null
  }, [allAssignments])

  const assign = useCallback((itemId, assignee, itemLabel, dueDate = null) => {
    if (!activeProject?.id || !user?.uid || !assignee?.uid) return

    const assignment = {
      assigneeUid: assignee.uid,
      assigneeName: assignee.displayName || assignee.email?.split('@')[0] || 'Unknown',
      assigneeEmail: assignee.email || '',
      assignedBy: user.uid,
      assignedByName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      dueDate: dueDate || null,
      assignedAt: new Date().toISOString(),
    }

    const activity = createActivity('task_assign', {
      itemId,
      taskText: itemLabel || itemId,
      assigneeName: assignment.assigneeName,
      assigneeUid: assignee.uid,
      dueDate,
    }, user)

    updateProject(activeProject.id, {
      assignments: { ...allAssignments, [itemId]: assignment },
      activityLog: appendActivity(activeProject.activityLog, activity),
    })

    // Notify assignee
    if (addNotification && assignee.uid !== user.uid) {
      addNotification(
        assignee.uid,
        'task_assign',
        `${assignment.assignedByName} assigned you: "${(itemLabel || itemId).slice(0, 60)}"${dueDate ? ` (due ${new Date(dueDate).toLocaleDateString()})` : ''}`,
        { itemId }
      )
    }
  }, [activeProject, user, allAssignments, updateProject, addNotification])

  const unassign = useCallback((itemId, itemLabel) => {
    if (!activeProject?.id || !user?.uid) return

    const current = allAssignments[itemId]
    if (!current) return

    const activity = createActivity('task_unassign', {
      itemId,
      taskText: itemLabel || itemId,
      assigneeName: current.assigneeName,
    }, user)

    const updated = { ...allAssignments }
    delete updated[itemId]

    updateProject(activeProject.id, {
      assignments: updated,
      activityLog: appendActivity(activeProject.activityLog, activity),
    })

    // Notify former assignee
    if (addNotification && current.assigneeUid !== user.uid) {
      addNotification(
        current.assigneeUid,
        'task_unassign',
        `${user.displayName || 'Someone'} unassigned you from: "${(itemLabel || itemId).slice(0, 60)}"`,
        { itemId }
      )
    }
  }, [activeProject, user, allAssignments, updateProject, addNotification])

  const updateDueDate = useCallback((itemId, dueDate) => {
    if (!activeProject?.id || !allAssignments[itemId]) return

    updateProject(activeProject.id, {
      assignments: {
        ...allAssignments,
        [itemId]: { ...allAssignments[itemId], dueDate },
      },
    })
  }, [activeProject, allAssignments, updateProject])

  // Get all assignments for a given user
  const getMyAssignments = useCallback((uid) => {
    const targetUid = uid || user?.uid
    if (!targetUid) return []
    return Object.entries(allAssignments)
      .filter(([, a]) => a.assigneeUid === targetUid)
      .map(([itemId, a]) => ({ itemId, ...a }))
  }, [allAssignments, user?.uid])

  // Get overdue assignments
  const overdueAssignments = useMemo(() => {
    const now = new Date()
    return Object.entries(allAssignments)
      .filter(([, a]) => a.dueDate && new Date(a.dueDate) < now)
      .map(([itemId, a]) => ({ itemId, ...a }))
  }, [allAssignments])

  return {
    getAssignment,
    assign,
    unassign,
    updateDueDate,
    getMyAssignments,
    overdueAssignments,
    allAssignments,
  }
}
