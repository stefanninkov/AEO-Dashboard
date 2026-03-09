import { useCallback, useMemo } from 'react'
import { createActivity, appendActivity } from '../utils/activityLogger'

/**
 * useAutomations — Rule-based workflow engine.
 *
 * Rules are stored in project.automationRules and evaluated when
 * events fire. Each rule has a condition and one or more actions.
 *
 * Data model: project.automationRules = [{
 *   id: string,
 *   name: string,
 *   enabled: boolean,
 *   trigger: { type: 'score_change' | 'checklist_progress' | 'monitor_run' | 'schedule',
 *              config: { threshold?, direction?, interval?, ... } },
 *   conditions: [{ field, operator, value }],
 *   actions: [{ type: 'notify' | 'webhook' | 'assign' | 'log', config }],
 *   createdAt: ISO string,
 *   lastTriggered: ISO string | null,
 *   triggerCount: number,
 * }]
 */
export function useAutomations({ activeProject, updateProject, user, addNotification }) {
  const rules = useMemo(() => activeProject?.automationRules || [], [activeProject?.automationRules])

  const enabledRules = useMemo(() => rules.filter(r => r.enabled), [rules])

  // Create a new automation rule
  const createRule = useCallback((ruleData) => {
    if (!activeProject?.id) return null
    const rule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: ruleData.name || 'Untitled Rule',
      enabled: true,
      trigger: ruleData.trigger,
      conditions: ruleData.conditions || [],
      actions: ruleData.actions || [],
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      triggerCount: 0,
    }

    const updated = [...rules, rule]
    const activity = createActivity('automation_create', { ruleName: rule.name }, user)
    updateProject(activeProject.id, {
      automationRules: updated,
      activityLog: appendActivity(activeProject.activityLog, activity),
    })
    return rule
  }, [activeProject, rules, updateProject, user])

  // Update an existing rule
  const updateRule = useCallback((ruleId, changes) => {
    if (!activeProject?.id) return
    const updated = rules.map(r => r.id === ruleId ? { ...r, ...changes } : r)
    updateProject(activeProject.id, { automationRules: updated })
  }, [activeProject, rules, updateProject])

  // Delete a rule
  const deleteRule = useCallback((ruleId) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      automationRules: rules.filter(r => r.id !== ruleId),
    })
  }, [activeProject, rules, updateProject])

  // Toggle rule enabled/disabled
  const toggleRule = useCallback((ruleId) => {
    const rule = rules.find(r => r.id === ruleId)
    if (rule) updateRule(ruleId, { enabled: !rule.enabled })
  }, [rules, updateRule])

  // Evaluate rules against an event
  const evaluateRules = useCallback((eventType, eventData = {}) => {
    if (!activeProject?.id || enabledRules.length === 0) return []

    const triggered = []
    const now = new Date().toISOString()

    for (const rule of enabledRules) {
      // Check trigger type match
      if (!matchesTrigger(rule.trigger, eventType, eventData)) continue

      // Check conditions
      if (!evaluateConditions(rule.conditions, eventData, activeProject)) continue

      // Execute actions
      const results = executeActions(rule.actions, eventData, {
        activeProject, user, addNotification,
      })

      triggered.push({ ruleId: rule.id, ruleName: rule.name, results })
    }

    // Update triggered rules
    if (triggered.length > 0) {
      const updatedRules = rules.map(r => {
        const match = triggered.find(t => t.ruleId === r.id)
        if (match) {
          return { ...r, lastTriggered: now, triggerCount: (r.triggerCount || 0) + 1 }
        }
        return r
      })
      updateProject(activeProject.id, { automationRules: updatedRules })
    }

    return triggered
  }, [activeProject, enabledRules, rules, updateProject, user, addNotification])

  // Stats
  const stats = useMemo(() => ({
    total: rules.length,
    enabled: enabledRules.length,
    disabled: rules.length - enabledRules.length,
    totalTriggers: rules.reduce((sum, r) => sum + (r.triggerCount || 0), 0),
  }), [rules, enabledRules])

  return {
    rules,
    enabledRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    evaluateRules,
    stats,
  }
}

// ── Trigger matching ──

function matchesTrigger(trigger, eventType, eventData) {
  if (!trigger?.type) return false

  const TRIGGER_EVENT_MAP = {
    score_change: ['monitor', 'score_drop', 'score_improve'],
    checklist_progress: ['check', 'uncheck', 'phase_complete'],
    monitor_run: ['monitor'],
    team_change: ['member_add', 'member_remove', 'role_change'],
    comment: ['comment', 'mention'],
    assignment: ['task_assign', 'task_unassign'],
    analysis: ['analyze'],
    any: null, // matches everything
  }

  const validEvents = TRIGGER_EVENT_MAP[trigger.type]
  if (validEvents === null) return true // 'any' matches all
  if (!validEvents) return false
  return validEvents.includes(eventType)
}

// ── Condition evaluation ──

function evaluateConditions(conditions, eventData, project) {
  if (!conditions || conditions.length === 0) return true

  return conditions.every(c => {
    const value = resolveField(c.field, eventData, project)
    return evaluateOperator(value, c.operator, c.value)
  })
}

function resolveField(field, eventData, project) {
  // Support dot-notation: 'event.score', 'project.settings.monitoringEnabled'
  if (field.startsWith('event.')) {
    return getNestedValue(eventData, field.slice(6))
  }
  if (field.startsWith('project.')) {
    return getNestedValue(project, field.slice(8))
  }
  // Default: check eventData first, then project
  return eventData[field] ?? getNestedValue(project, field)
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

function evaluateOperator(value, operator, target) {
  const numValue = Number(value)
  const numTarget = Number(target)

  switch (operator) {
    case 'eq': return value == target // eslint-disable-line eqeqeq
    case 'neq': return value != target // eslint-disable-line eqeqeq
    case 'gt': return numValue > numTarget
    case 'gte': return numValue >= numTarget
    case 'lt': return numValue < numTarget
    case 'lte': return numValue <= numTarget
    case 'contains': return String(value).toLowerCase().includes(String(target).toLowerCase())
    case 'exists': return value != null
    case 'empty': return value == null || value === '' || (Array.isArray(value) && value.length === 0)
    default: return false
  }
}

// ── Action execution ──

function executeActions(actions, eventData, context) {
  if (!actions?.length) return []
  return actions.map(action => {
    switch (action.type) {
      case 'notify':
        return executeNotify(action.config, eventData, context)
      case 'log':
        return { type: 'log', success: true, message: action.config?.message || 'Rule triggered' }
      case 'assign':
        return { type: 'assign', success: true, assignee: action.config?.assigneeUid }
      default:
        return { type: action.type, success: false, error: 'Unknown action type' }
    }
  })
}

function executeNotify(config, eventData, { user, addNotification, activeProject }) {
  if (!addNotification) return { type: 'notify', success: false, error: 'No notification system' }

  const message = config?.message || 'Automation rule triggered'
  const targets = config?.targets || [] // array of UIDs, or empty for all members

  const members = activeProject?.members || []
  const recipientUids = targets.length > 0
    ? targets
    : members.map(m => m.uid).filter(uid => uid !== user?.uid)

  recipientUids.forEach(uid => {
    addNotification(uid, 'automation', message, {
      ruleName: config?.ruleName,
      eventType: eventData?.type,
    })
  })

  return { type: 'notify', success: true, notified: recipientUids.length }
}

// ── Rule templates ──

export const RULE_TEMPLATES = [
  {
    name: 'Alert on Score Drop',
    description: 'Notify team when AEO score drops below threshold',
    trigger: { type: 'score_change' },
    conditions: [{ field: 'event.overallScore', operator: 'lt', value: 50 }],
    actions: [{ type: 'notify', config: { message: 'AEO score dropped below 50%!' } }],
  },
  {
    name: 'Celebrate Phase Completion',
    description: 'Notify team when a checklist phase is fully completed',
    trigger: { type: 'checklist_progress' },
    conditions: [],
    actions: [{ type: 'notify', config: { message: 'A checklist phase was completed!' } }],
  },
  {
    name: 'New Team Member Welcome',
    description: 'Log when a new member joins the project',
    trigger: { type: 'team_change' },
    conditions: [],
    actions: [{ type: 'notify', config: { message: 'A new team member has joined the project' } }],
  },
  {
    name: 'High Score Achievement',
    description: 'Celebrate when score reaches 90% or above',
    trigger: { type: 'score_change' },
    conditions: [{ field: 'event.overallScore', operator: 'gte', value: 90 }],
    actions: [{ type: 'notify', config: { message: 'AEO score reached 90%+ — great work!' } }],
  },
]
