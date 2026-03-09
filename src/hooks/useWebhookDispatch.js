import { useCallback, useMemo } from 'react'
import { fireWebhooks } from '../utils/webhookDispatcher'

/**
 * useWebhookDispatch — Enhanced webhook dispatch with automation integration.
 *
 * Wraps fireWebhooks to additionally trigger automation rule evaluation.
 * This hook acts as the central event bus — all events flow through here
 * so automation rules can evaluate them.
 *
 * @param {Object} options
 * @param {Object} options.activeProject
 * @param {Function} options.updateProject
 * @param {Function} [options.evaluateRules] - from useAutomations
 */
export function useWebhookDispatch({ activeProject, updateProject, evaluateRules }) {
  const webhooks = useMemo(() => activeProject?.webhooks || [], [activeProject?.webhooks])

  const dispatch = useCallback(async (eventType, eventData = {}) => {
    if (!activeProject?.id) return { webhooks: 0, rules: 0 }

    // 1. Fire webhooks (existing infrastructure)
    let webhookCount = 0
    if (webhooks.length > 0) {
      try {
        await fireWebhooks(activeProject, eventType, eventData, updateProject)
        webhookCount = webhooks.filter(w => w.enabled).length
      } catch {
        // fireWebhooks handles its own errors
      }
    }

    // 2. Evaluate automation rules
    let ruleResults = []
    if (evaluateRules) {
      try {
        ruleResults = evaluateRules(eventType, { ...eventData, type: eventType })
      } catch {
        // Rule evaluation shouldn't break the event flow
      }
    }

    return {
      webhooks: webhookCount,
      rules: ruleResults.length,
      ruleResults,
    }
  }, [activeProject, webhooks, updateProject, evaluateRules])

  // Stats
  const stats = useMemo(() => {
    const enabled = webhooks.filter(w => w.enabled)
    const recentlyFired = webhooks.filter(w => {
      if (!w.lastTriggered) return false
      return Date.now() - new Date(w.lastTriggered).getTime() < 24 * 60 * 60 * 1000
    })
    return {
      totalWebhooks: webhooks.length,
      enabledWebhooks: enabled.length,
      recentlyFired: recentlyFired.length,
      hasErrors: webhooks.some(w => w.lastStatus === 'error'),
    }
  }, [webhooks])

  return {
    dispatch,
    stats,
    webhooks,
  }
}
