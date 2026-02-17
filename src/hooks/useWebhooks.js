import { useState, useCallback } from 'react'
import { fireWebhooks, testWebhook as testWebhookUrl } from '../utils/webhookDispatcher'

/**
 * useWebhooks — CRUD for webhook configurations + dispatch.
 */
export function useWebhooks({ activeProject, updateProject }) {
  const [testing, setTesting] = useState(null) // id of webhook being tested
  const [testResult, setTestResult] = useState(null) // { webhookId, success, error }

  const webhooks = activeProject?.webhooks || []

  const addWebhook = useCallback(({ name, url, events, format }) => {
    if (!activeProject) return
    const newWebhook = {
      id: crypto.randomUUID(),
      name: name || 'Untitled Webhook',
      url: url.trim(),
      events: events || ['*'],
      enabled: true,
      format: format || 'json',
      lastTriggered: null,
      lastStatus: null,
      lastError: null,
      createdAt: new Date().toISOString(),
    }
    const updated = [...webhooks, newWebhook]
    updateProject(activeProject.id, { webhooks: updated })
  }, [activeProject, webhooks, updateProject])

  const updateWebhook = useCallback((id, updates) => {
    if (!activeProject) return
    const updated = webhooks.map(w =>
      w.id === id ? { ...w, ...updates } : w
    )
    updateProject(activeProject.id, { webhooks: updated })
  }, [activeProject, webhooks, updateProject])

  const removeWebhook = useCallback((id) => {
    if (!activeProject) return
    const updated = webhooks.filter(w => w.id !== id)
    updateProject(activeProject.id, { webhooks: updated })
  }, [activeProject, webhooks, updateProject])

  const toggleWebhook = useCallback((id) => {
    if (!activeProject) return
    const updated = webhooks.map(w =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    )
    updateProject(activeProject.id, { webhooks: updated })
  }, [activeProject, webhooks, updateProject])

  const testWebhook = useCallback(async (id) => {
    const webhook = webhooks.find(w => w.id === id)
    if (!webhook) return

    setTesting(id)
    setTestResult(null)

    const result = await testWebhookUrl(webhook.url, webhook.format)

    // Update webhook status
    const now = new Date().toISOString()
    const updated = webhooks.map(w =>
      w.id === id
        ? { ...w, lastTriggered: now, lastStatus: result.success ? 'success' : 'error', lastError: result.error }
        : w
    )
    updateProject(activeProject.id, { webhooks: updated })

    setTesting(null)
    setTestResult({ webhookId: id, success: result.success, error: result.error })

    // Clear test result after 5 seconds
    setTimeout(() => setTestResult(null), 5000)
    return result
  }, [activeProject, webhooks, updateProject])

  const dispatchEvent = useCallback((eventType, eventData) => {
    fireWebhooks(activeProject, eventType, eventData, updateProject)
  }, [activeProject, updateProject])

  return {
    webhooks,
    testing,
    testResult,
    addWebhook,
    updateWebhook,
    removeWebhook,
    toggleWebhook,
    testWebhook,
    dispatchEvent,
  }
}
