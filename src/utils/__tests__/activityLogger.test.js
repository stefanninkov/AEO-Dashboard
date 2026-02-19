import { describe, it, expect } from 'vitest'
import { createActivity, appendActivity } from '../activityLogger'

describe('createActivity', () => {
  it('creates an entry with id, type, and timestamp', () => {
    const entry = createActivity('check', { taskText: 'Test task' })
    expect(entry.id).toBeDefined()
    expect(entry.type).toBe('check')
    expect(entry.timestamp).toBeDefined()
    expect(new Date(entry.timestamp).getTime()).not.toBeNaN()
  })

  it('includes custom data fields', () => {
    const entry = createActivity('analyze', { score: 85, url: 'https://example.com' })
    expect(entry.score).toBe(85)
    expect(entry.url).toBe('https://example.com')
  })

  it('includes author info when provided', () => {
    const author = { uid: 'abc123', displayName: 'John Doe', email: 'john@test.com' }
    const entry = createActivity('check', {}, author)
    expect(entry.authorUid).toBe('abc123')
    expect(entry.authorName).toBe('John Doe')
    expect(entry.authorEmail).toBe('john@test.com')
  })

  it('omits author fields when author is null', () => {
    const entry = createActivity('check', {})
    expect(entry.authorUid).toBeUndefined()
    expect(entry.authorName).toBeUndefined()
  })

  it('uses email as fallback for authorName', () => {
    const author = { uid: 'x', email: 'test@test.com' }
    const entry = createActivity('check', {}, author)
    expect(entry.authorName).toBe('test@test.com')
  })

  it('generates unique IDs', () => {
    const ids = new Set()
    for (let i = 0; i < 20; i++) {
      ids.add(createActivity('check', {}).id)
    }
    // 20 IDs should all be unique (Date.now + 4-char random suffix)
    expect(ids.size).toBe(20)
  })
})

describe('appendActivity', () => {
  it('prepends new entry to existing log', () => {
    const existing = [{ id: '1', type: 'check' }, { id: '2', type: 'uncheck' }]
    const newEntry = { id: '3', type: 'analyze' }
    const result = appendActivity(existing, newEntry)
    expect(result[0]).toBe(newEntry)
    expect(result.length).toBe(3)
  })

  it('limits to maxEntries', () => {
    const existing = Array.from({ length: 200 }, (_, i) => ({ id: String(i) }))
    const newEntry = { id: 'new' }
    const result = appendActivity(existing, newEntry, 200)
    expect(result.length).toBe(200)
    expect(result[0].id).toBe('new')
    expect(result[199].id).toBe('198') // last old entry that fits
  })

  it('handles empty existing log', () => {
    const result = appendActivity([], { id: '1', type: 'check' })
    expect(result.length).toBe(1)
  })

  it('handles undefined existing log', () => {
    const result = appendActivity(undefined, { id: '1', type: 'check' })
    expect(result.length).toBe(1)
  })
})
