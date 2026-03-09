import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @sentry/react so Vitest doesn't try to resolve it
vi.mock('@sentry/react', () => {
  throw new Error('not installed')
})

import {
  captureError, captureMessage, setUser, setTag,
  addBreadcrumb, startSpan, captureComponentError, getSentry,
} from '../errorTracking'

describe('errorTracking (console fallback)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('captureError logs to console when Sentry is not loaded', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('test error')
    captureError(err, { component: 'TestComp' })
    expect(spy).toHaveBeenCalledWith('[ErrorTracking]', err, { component: 'TestComp' })
  })

  it('captureMessage logs to console when Sentry is not loaded', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    captureMessage('test message', 'warning', { extra: { key: 'val' } })
    expect(spy).toHaveBeenCalledWith(
      '[ErrorTracking] [warning]',
      'test message',
      { extra: { key: 'val' } }
    )
  })

  it('setUser does not throw when Sentry is not loaded', () => {
    expect(() => setUser({ id: '123', email: 'test@test.com' })).not.toThrow()
  })

  it('setTag does not throw when Sentry is not loaded', () => {
    expect(() => setTag('env', 'test')).not.toThrow()
  })

  it('addBreadcrumb does not throw when Sentry is not loaded', () => {
    expect(() => addBreadcrumb({ category: 'test', message: 'msg' })).not.toThrow()
  })

  it('startSpan returns a no-op span with end() method', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const span = startSpan('test-operation', 'custom')
    expect(span).toHaveProperty('end')
    expect(typeof span.end).toBe('function')
    span.end()
    expect(spy).toHaveBeenCalled()
  })

  it('captureComponentError calls captureError with component context', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('component crash')
    const errorInfo = { componentStack: '\n    in MyComponent' }
    captureComponentError(err, errorInfo)
    expect(spy).toHaveBeenCalledWith(
      '[ErrorTracking]',
      err,
      expect.objectContaining({
        component: 'ErrorBoundary',
        extra: { componentStack: '\n    in MyComponent' },
      })
    )
  })

  it('getSentry returns null when not initialized with Sentry', () => {
    expect(getSentry()).toBeNull()
  })
})
