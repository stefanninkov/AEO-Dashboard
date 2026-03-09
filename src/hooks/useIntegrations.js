import { useCallback, useMemo } from 'react'

/**
 * useIntegrations — External service integration management.
 *
 * Manages connected services (Slack, email, calendar, CI/CD, etc.),
 * connection status, and configuration.
 *
 * Stored in project.integrations = { [serviceId]: IntegrationConfig }
 */

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send AEO alerts and reports to Slack channels',
    category: 'Communication',
    icon: '💬',
    configFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' },
      { key: 'channel', label: 'Channel', type: 'text', placeholder: '#aeo-alerts' },
      { key: 'notifyOn', label: 'Notify On', type: 'multiselect', options: ['score_change', 'monitor_alert', 'report_ready', 'team_activity'] },
    ],
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'Send email digests and alerts to your team',
    category: 'Communication',
    icon: '📧',
    configFields: [
      { key: 'recipients', label: 'Recipients', type: 'text', placeholder: 'email1@example.com, email2@example.com' },
      { key: 'frequency', label: 'Frequency', type: 'select', options: ['realtime', 'hourly', 'daily', 'weekly'] },
      { key: 'includeReport', label: 'Include PDF Report', type: 'boolean' },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync monitoring schedules and deadlines to Calendar',
    category: 'Productivity',
    icon: '📅',
    configFields: [
      { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary' },
      { key: 'syncMonitoring', label: 'Sync Monitoring Schedule', type: 'boolean' },
      { key: 'syncDeadlines', label: 'Sync Task Deadlines', type: 'boolean' },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Create issues from AEO tasks and track implementation',
    category: 'Development',
    icon: '🐙',
    configFields: [
      { key: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' },
      { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...' },
      { key: 'autoCreateIssues', label: 'Auto-create Issues', type: 'boolean' },
      { key: 'labelPrefix', label: 'Issue Label Prefix', type: 'text', placeholder: 'aeo:' },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect AEO events to 5000+ apps via Zapier',
    category: 'Automation',
    icon: '⚡',
    configFields: [
      { key: 'webhookUrl', label: 'Zapier Webhook URL', type: 'url', placeholder: 'https://hooks.zapier.com/hooks/catch/...' },
      { key: 'triggerEvents', label: 'Trigger Events', type: 'multiselect', options: ['score_change', 'task_completed', 'monitor_alert', 'report_generated'] },
    ],
  },
  {
    id: 'analytics',
    name: 'Google Analytics',
    description: 'Import GA4 metrics for correlation with AEO data',
    category: 'Analytics',
    icon: '📊',
    configFields: [
      { key: 'propertyId', label: 'GA4 Property ID', type: 'text', placeholder: '123456789' },
      { key: 'importMetrics', label: 'Import Metrics', type: 'multiselect', options: ['organic_traffic', 'ai_referrals', 'engagement_rate', 'conversions'] },
    ],
  },
]

export function useIntegrations({ activeProject, updateProject }) {
  const integrations = useMemo(() =>
    activeProject?.integrations || {},
    [activeProject?.integrations]
  )

  const connectedIds = useMemo(() =>
    Object.keys(integrations).filter(id => integrations[id]?.enabled),
    [integrations]
  )

  const getConfig = useCallback((serviceId) =>
    integrations[serviceId] || { enabled: false, config: {} },
    [integrations]
  )

  const connect = useCallback((serviceId, config = {}) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      integrations: {
        ...integrations,
        [serviceId]: {
          enabled: true,
          config,
          connectedAt: new Date().toISOString(),
          lastSync: null,
        },
      },
    })
  }, [activeProject, integrations, updateProject])

  const disconnect = useCallback((serviceId) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      integrations: {
        ...integrations,
        [serviceId]: { ...integrations[serviceId], enabled: false, disconnectedAt: new Date().toISOString() },
      },
    })
  }, [activeProject, integrations, updateProject])

  const updateConfig = useCallback((serviceId, configChanges) => {
    if (!activeProject?.id) return
    const current = integrations[serviceId] || { enabled: false, config: {} }
    updateProject(activeProject.id, {
      integrations: {
        ...integrations,
        [serviceId]: {
          ...current,
          config: { ...current.config, ...configChanges },
        },
      },
    })
  }, [activeProject, integrations, updateProject])

  // Group available integrations by category
  const groupedIntegrations = useMemo(() => {
    const groups = {}
    AVAILABLE_INTEGRATIONS.forEach(int => {
      if (!groups[int.category]) groups[int.category] = []
      groups[int.category].push({
        ...int,
        connected: connectedIds.includes(int.id),
        config: integrations[int.id]?.config || {},
        connectedAt: integrations[int.id]?.connectedAt,
      })
    })
    return groups
  }, [connectedIds, integrations])

  return {
    integrations,
    connectedIds,
    connectedCount: connectedIds.length,
    totalAvailable: AVAILABLE_INTEGRATIONS.length,
    groupedIntegrations,
    getConfig,
    connect,
    disconnect,
    updateConfig,
    availableIntegrations: AVAILABLE_INTEGRATIONS,
  }
}
