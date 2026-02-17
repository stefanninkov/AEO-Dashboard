import logger from './logger'

// ─── Event Group Constants ───────────────────────────────────
export const WEBHOOK_EVENT_GROUPS = {
  checklist:   { label: 'Checklist',         icon: 'CheckSquare', types: ['check', 'uncheck'] },
  phase:       { label: 'Phase Completion',  icon: 'Trophy',      types: ['phase_complete'] },
  analysis:    { label: 'Site Analysis',     icon: 'Search',      types: ['analyze', 'analyzePageUrl', 'analyzePageBatch', 'generateFix', 'generatePageFix'] },
  monitoring:  { label: 'Monitoring',        icon: 'Activity',    types: ['monitor'] },
  competitors: { label: 'Competitors',       icon: 'Users',       types: ['competitor_monitor', 'citation_share_check', 'competitor_add', 'competitor_remove'] },
  content:     { label: 'Content',           icon: 'FileText',    types: ['contentWrite', 'schemaGenerate', 'briefGenerate', 'calendarPublish'] },
  team:        { label: 'Team',              icon: 'UserPlus',    types: ['member_add', 'role_change', 'member_remove', 'task_assign', 'task_unassign', 'comment'] },
  alerts:      { label: 'Score Alerts',      icon: 'AlertTriangle', types: ['score_drop', 'score_improve'] },
  export:      { label: 'Export',            icon: 'Download',    types: ['export'] },
}

// Flat lookup: eventType → group key(s)
const TYPE_TO_GROUPS = {}
for (const [groupKey, group] of Object.entries(WEBHOOK_EVENT_GROUPS)) {
  for (const t of group.types) {
    if (!TYPE_TO_GROUPS[t]) TYPE_TO_GROUPS[t] = []
    TYPE_TO_GROUPS[t].push(groupKey)
  }
}

// ─── Human-Readable Event Messages ──────────────────────────
export function humanReadableEvent(eventType, data = {}) {
  const messages = {
    check: `Task completed: ${data.taskText || 'unknown task'}`,
    uncheck: `Task unchecked: ${data.taskText || 'unknown task'}`,
    note: `Note added to: ${data.taskText || 'a task'}`,
    task_assign: `Task assigned to ${data.assigneeName || 'a team member'}: ${data.taskText || ''}`,
    task_unassign: `Task unassigned from ${data.assigneeName || 'a team member'}: ${data.taskText || ''}`,
    comment: `Comment added on: ${data.taskText || 'a task'}`,
    analyze: `Site analyzed: score ${data.score || '?'}%`,
    analyzePageUrl: `Page analyzed: ${data.url || 'unknown'} — score ${data.score || '?'}`,
    analyzePageBatch: `Batch analysis: ${data.batchCount || '?'} pages analyzed`,
    generateFix: `Fix generated for: ${data.taskText || 'an issue'}`,
    generatePageFix: `Page fix generated for: ${data.pageUrl || 'a page'}`,
    monitor: `Monitoring check complete: ${data.queriesCited || 0}/${data.queriesChecked || 0} queries cited`,
    competitor_add: `Competitor added: ${data.url || ''}`,
    competitor_remove: `Competitor removed: ${data.url || ''}`,
    competitor_monitor: `Competitor monitoring: ${data.competitorsChecked || 0} competitors checked, ${data.alertsGenerated || 0} alerts`,
    citation_share_check: `Citation share check: ${data.queriesChecked || 0} queries, ${data.totalMentions || 0} total mentions`,
    contentWrite: `Content generated: ${data.type || 'article'} — "${data.topic || 'untitled'}"`,
    schemaGenerate: `Schema generated: ${data.type || 'JSON-LD'}`,
    briefGenerate: `Content brief generated: "${data.title || 'untitled'}"`,
    calendarPublish: `Content published: ${data.entryCount || 1} item(s)`,
    calendarAdd: `Calendar entry added: "${data.title || 'untitled'}"`,
    calendarRemove: `Calendar entry removed: "${data.title || 'untitled'}"`,
    member_add: `Team member invited: ${data.memberName || 'someone'}`,
    role_change: `Role changed: ${data.memberEmail || 'someone'} → ${data.newRole || '?'}`,
    member_remove: `Team member removed: ${data.memberEmail || 'someone'}`,
    export: `Project exported: ${data.filename || 'report'}`,
    phase_complete: `Phase ${data.phase || '?'} completed: ${data.phaseTitle || ''}! (${data.totalTasks || '?'} tasks)`,
    score_drop: `Score dropped by ${data.delta || '?'} points (${data.previousScore || '?'}% → ${data.currentScore || '?'}%)`,
    score_improve: `Score improved by ${data.delta || '?'} points (${data.previousScore || '?'}% → ${data.currentScore || '?'}%)`,
  }
  return messages[eventType] || `Event: ${eventType}`
}

// ─── Event Color (for Discord embeds) ───────────────────────
function getEventColor(eventType) {
  const colors = {
    check: 0x10B981, uncheck: 0xF59E0B, phase_complete: 0x10B981,
    analyze: 0x0EA5E9, analyzePageUrl: 0x0EA5E9, analyzePageBatch: 0x0EA5E9,
    monitor: 0x7B2FBE, score_drop: 0xEF4444, score_improve: 0x10B981,
    competitor_monitor: 0x8B5CF6, citation_share_check: 0x8B5CF6,
    contentWrite: 0xF59E0B, schemaGenerate: 0x14B8A6, briefGenerate: 0xF59E0B,
    member_add: 0x6366F1, role_change: 0x6366F1, member_remove: 0xEF4444,
    task_assign: 0x6366F1, export: 0xFF6B35,
  }
  return colors[eventType] || 0x6B7280
}

// ─── Payload Formatters ─────────────────────────────────────
export function formatPayload(format, eventType, eventData, project) {
  const readable = humanReadableEvent(eventType, eventData)
  const projectName = project?.name || 'Unknown Project'
  const projectUrl = project?.url || ''
  const timestamp = new Date().toISOString()
  const author = eventData?.author || ''

  if (format === 'slack') {
    const authorLine = author ? `\n_by ${author}_` : ''
    return {
      text: `[${projectName}] ${readable}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${readable}*\nProject: <${projectUrl}|${projectName}>${authorLine}`,
          },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `_AEO Dashboard · ${new Date().toLocaleString()}_` },
          ],
        },
      ],
    }
  }

  if (format === 'discord') {
    return {
      content: `**${projectName}** — ${readable}`,
      embeds: [{
        title: readable,
        description: author ? `By: ${author}` : undefined,
        color: getEventColor(eventType),
        timestamp,
        footer: { text: `AEO Dashboard · ${projectName}` },
        ...(projectUrl ? { url: projectUrl } : {}),
      }],
    }
  }

  // Default: JSON
  return {
    event: eventType,
    message: readable,
    project: { name: projectName, url: projectUrl },
    data: eventData,
    timestamp,
    source: 'AEO Dashboard',
  }
}

// ─── Check if event matches webhook ─────────────────────────
export function eventMatchesWebhook(webhook, eventType) {
  if (!webhook?.events?.length) return false
  if (webhook.events.includes('*')) return true

  const eventGroups = TYPE_TO_GROUPS[eventType] || []
  return webhook.events.some(ev => eventGroups.includes(ev))
}

// ─── Send a single webhook ──────────────────────────────────
async function sendWebhook(url, payload) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      mode: 'cors',
    })
    clearTimeout(timeoutId)
    return { success: response.ok, status: response.status, error: response.ok ? null : `HTTP ${response.status}` }
  } catch (err) {
    clearTimeout(timeoutId)
    return { success: false, status: 0, error: err.name === 'AbortError' ? 'Timeout (5s)' : err.message }
  }
}

// ─── Fire all matching webhooks (non-blocking) ──────────────
export function fireWebhooks(project, eventType, eventData, updateProject) {
  if (!project?.webhooks?.length) return
  if (!project?.id) return

  const matching = project.webhooks.filter(
    w => w.enabled && eventMatchesWebhook(w, eventType)
  )
  if (matching.length === 0) return

  // Fire-and-forget: don't block the caller
  Promise.allSettled(
    matching.map(async (webhook) => {
      const payload = formatPayload(webhook.format || 'json', eventType, eventData, project)
      const result = await sendWebhook(webhook.url, payload)

      return {
        webhookId: webhook.id,
        success: result.success,
        error: result.error,
      }
    })
  ).then((results) => {
    // Batch update all webhook statuses in one updateProject call
    const now = new Date().toISOString()
    const updatedWebhooks = project.webhooks.map(w => {
      const result = results.find(r => r.status === 'fulfilled' && r.value.webhookId === w.id)
      if (!result) return w
      const { success, error } = result.value
      return {
        ...w,
        lastTriggered: now,
        lastStatus: success ? 'success' : 'error',
        lastError: error,
      }
    })

    updateProject(project.id, { webhooks: updatedWebhooks }).catch(() => {
      logger.warn('Failed to update webhook status after dispatch')
    })
  }).catch(() => {
    logger.warn('Webhook dispatch batch failed')
  })
}

// ─── Test a webhook ─────────────────────────────────────────
export async function testWebhook(url, format = 'json') {
  const testProject = { name: 'Test Project', url: 'https://example.com' }
  const testData = { taskText: 'This is a test webhook from AEO Dashboard', score: 85 }
  const payload = formatPayload(format, 'check', testData, testProject)
  return sendWebhook(url, payload)
}
