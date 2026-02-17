import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  WEBHOOK_EVENT_GROUPS,
  humanReadableEvent,
  formatPayload,
  eventMatchesWebhook,
} from '../webhookDispatcher'

describe('WEBHOOK_EVENT_GROUPS', () => {
  it('has correct group keys', () => {
    const keys = Object.keys(WEBHOOK_EVENT_GROUPS)
    expect(keys).toContain('checklist')
    expect(keys).toContain('phase')
    expect(keys).toContain('analysis')
    expect(keys).toContain('monitoring')
    expect(keys).toContain('competitors')
    expect(keys).toContain('content')
    expect(keys).toContain('team')
    expect(keys).toContain('alerts')
    expect(keys).toContain('export')
  })

  it('each group has label and types', () => {
    for (const [key, group] of Object.entries(WEBHOOK_EVENT_GROUPS)) {
      expect(group.label).toBeDefined()
      expect(Array.isArray(group.types)).toBe(true)
      expect(group.types.length).toBeGreaterThan(0)
    }
  })
})

describe('humanReadableEvent', () => {
  it('formats check event', () => {
    const msg = humanReadableEvent('check', { taskText: 'Add FAQ schema' })
    expect(msg).toBe('Task completed: Add FAQ schema')
  })

  it('formats analyze event with score', () => {
    const msg = humanReadableEvent('analyze', { score: 85 })
    expect(msg).toBe('Site analyzed: score 85%')
  })

  it('formats phase_complete event', () => {
    const msg = humanReadableEvent('phase_complete', {
      phase: 1, phaseTitle: 'Foundation', totalTasks: 12,
    })
    expect(msg).toBe('Phase 1 completed: Foundation! (12 tasks)')
  })

  it('formats score_drop event', () => {
    const msg = humanReadableEvent('score_drop', {
      delta: 15, previousScore: 80, currentScore: 65,
    })
    expect(msg).toContain('Score dropped')
    expect(msg).toContain('15')
  })

  it('handles unknown event type', () => {
    const msg = humanReadableEvent('some_new_event', {})
    expect(msg).toBe('Event: some_new_event')
  })

  it('handles missing data gracefully', () => {
    const msg = humanReadableEvent('check', {})
    expect(msg).toBe('Task completed: unknown task')
  })
})

describe('formatPayload', () => {
  const project = { name: 'Test Project', url: 'https://example.com' }
  const eventData = { taskText: 'Test task', author: 'John' }

  describe('JSON format', () => {
    it('includes event, message, project, data, timestamp, source', () => {
      const payload = formatPayload('json', 'check', eventData, project)
      expect(payload.event).toBe('check')
      expect(payload.message).toContain('Task completed')
      expect(payload.project.name).toBe('Test Project')
      expect(payload.project.url).toBe('https://example.com')
      expect(payload.timestamp).toBeDefined()
      expect(payload.source).toBe('AEO Dashboard')
    })
  })

  describe('Slack format', () => {
    it('includes text and blocks', () => {
      const payload = formatPayload('slack', 'check', eventData, project)
      expect(payload.text).toContain('Test Project')
      expect(payload.blocks).toBeDefined()
      expect(payload.blocks.length).toBeGreaterThan(0)
      expect(payload.blocks[0].type).toBe('section')
      expect(payload.blocks[0].text.type).toBe('mrkdwn')
    })
  })

  describe('Discord format', () => {
    it('includes content and embeds', () => {
      const payload = formatPayload('discord', 'check', eventData, project)
      expect(payload.content).toContain('Test Project')
      expect(payload.embeds).toBeDefined()
      expect(payload.embeds[0].title).toContain('Task completed')
      expect(payload.embeds[0].color).toBeDefined()
      expect(payload.embeds[0].footer.text).toContain('AEO Dashboard')
    })

    it('includes author in description', () => {
      const payload = formatPayload('discord', 'check', { author: 'John' }, project)
      expect(payload.embeds[0].description).toBe('By: John')
    })
  })

  describe('fallback', () => {
    it('defaults to JSON for unknown format', () => {
      const payload = formatPayload('xml', 'check', eventData, project)
      expect(payload.source).toBe('AEO Dashboard')
      expect(payload.event).toBe('check')
    })
  })
})

describe('eventMatchesWebhook', () => {
  it('matches wildcard (*)', () => {
    const webhook = { events: ['*'], enabled: true }
    expect(eventMatchesWebhook(webhook, 'check')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'analyze')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'unknown_event')).toBe(true)
  })

  it('matches by group key', () => {
    const webhook = { events: ['checklist'], enabled: true }
    expect(eventMatchesWebhook(webhook, 'check')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'uncheck')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'analyze')).toBe(false)
  })

  it('matches multiple groups', () => {
    const webhook = { events: ['checklist', 'analysis'], enabled: true }
    expect(eventMatchesWebhook(webhook, 'check')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'analyze')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'monitor')).toBe(false)
  })

  it('returns false for empty events', () => {
    expect(eventMatchesWebhook({ events: [] }, 'check')).toBe(false)
  })

  it('returns false for null webhook', () => {
    expect(eventMatchesWebhook(null, 'check')).toBe(false)
  })

  it('returns false for undefined events', () => {
    expect(eventMatchesWebhook({}, 'check')).toBe(false)
  })

  it('matches team events correctly', () => {
    const webhook = { events: ['team'] }
    expect(eventMatchesWebhook(webhook, 'member_add')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'task_assign')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'comment')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'check')).toBe(false)
  })

  it('matches alert events', () => {
    const webhook = { events: ['alerts'] }
    expect(eventMatchesWebhook(webhook, 'score_drop')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'score_improve')).toBe(true)
    expect(eventMatchesWebhook(webhook, 'check')).toBe(false)
  })
})
