import { useCallback } from 'react'
import { createActivity, appendActivity } from '../utils/activityLogger'
import { fireWebhooks } from '../utils/webhookDispatcher'

/**
 * useActivityWithWebhooks — wraps the createActivity + appendActivity + updateProject
 * pattern into a single `logAndDispatch` call that also fires matching webhooks.
 *
 * Usage:
 *   const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })
 *   logAndDispatch('check', { taskId, taskText, phase }, user)
 */
export function useActivityWithWebhooks({ activeProject, updateProject }) {
  const logAndDispatch = useCallback((type, data = {}, author = null) => {
    if (!activeProject?.id) return null

    // 1. Create and append the activity entry (existing behavior)
    const entry = createActivity(type, data, author)
    updateProject(activeProject.id, {
      activityLog: appendActivity(activeProject.activityLog, entry),
    })

    // 2. Fire matching webhooks (non-blocking, fire-and-forget)
    const webhookData = {
      ...data,
      ...(author ? { author: author.displayName || author.email || 'Unknown' } : {}),
    }
    fireWebhooks(activeProject, type, webhookData, updateProject)

    return entry
  }, [activeProject, updateProject])

  return { logAndDispatch }
}
