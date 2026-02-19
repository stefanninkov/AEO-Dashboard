import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('logger', () => {
  let originalDev

  beforeEach(() => {
    originalDev = import.meta.env.DEV
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports error, warn, and info methods', async () => {
    const logger = (await import('../logger')).default
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.info).toBe('function')
  })

  it('error() calls console.error with [AEO] prefix in dev mode', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logger = (await import('../logger')).default

    // In test environment, import.meta.env.DEV is true
    logger.error('test message', 42)

    if (import.meta.env.DEV) {
      expect(spy).toHaveBeenCalledWith('[AEO]', 'test message', 42)
    }
  })

  it('warn() calls console.warn with [AEO] prefix in dev mode', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const logger = (await import('../logger')).default

    logger.warn('warning here')

    if (import.meta.env.DEV) {
      expect(spy).toHaveBeenCalledWith('[AEO]', 'warning here')
    }
  })

  it('info() calls console.info with [AEO] prefix in dev mode', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const logger = (await import('../logger')).default

    logger.info('info msg')

    if (import.meta.env.DEV) {
      expect(spy).toHaveBeenCalledWith('[AEO]', 'info msg')
    }
  })

  it('does not throw when called with no arguments', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})

    const logger = (await import('../logger')).default

    expect(() => logger.error()).not.toThrow()
    expect(() => logger.warn()).not.toThrow()
    expect(() => logger.info()).not.toThrow()
  })
})
