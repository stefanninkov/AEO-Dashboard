import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @sentry/react so Vitest doesn't try to resolve it
vi.mock('@sentry/react', () => {
  throw new Error('not installed')
})

import { measureAsync, trackViewChange, getMemoryUsage } from '../performanceMonitor'

describe('performanceMonitor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('measureAsync', () => {
    it('executes the function and returns its result', async () => {
      const result = await measureAsync('test-op', async () => 'hello')
      expect(result).toBe('hello')
    })

    it('works with failing functions', async () => {
      vi.spyOn(console, 'debug').mockImplementation(() => {})
      await expect(
        measureAsync('fail-op', async () => { throw new Error('fail') })
      ).rejects.toThrow('fail')
    })
  })

  describe('trackViewChange', () => {
    it('returns an object with viewReady method', () => {
      const tracker = trackViewChange('dashboard')
      expect(tracker).toHaveProperty('viewReady')
      expect(typeof tracker.viewReady).toBe('function')
      // Should not throw
      tracker.viewReady()
    })
  })

  describe('getMemoryUsage', () => {
    it('returns null when performance.memory is unavailable', () => {
      // jsdom doesn't have performance.memory
      const result = getMemoryUsage()
      expect(result).toBeNull()
    })
  })
})
