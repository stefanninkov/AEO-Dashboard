import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

describe('useReducedMotion', () => {
  let listeners
  let matchMediaMock

  beforeEach(() => {
    listeners = []
    matchMediaMock = vi.fn((query) => ({
      matches: false,
      media: query,
      addEventListener: (event, handler) => { listeners.push(handler) },
      removeEventListener: (event, handler) => {
        listeners = listeners.filter(h => h !== handler)
      },
    }))
    Object.defineProperty(window, 'matchMedia', { value: matchMediaMock, writable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('returns false when prefers-reduced-motion is not set', async () => {
    const { useReducedMotion } = await import('../useReducedMotion')
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when prefers-reduced-motion: reduce is active', async () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: (event, handler) => { listeners.push(handler) },
      removeEventListener: () => {},
    })

    vi.resetModules()
    const { useReducedMotion } = await import('../useReducedMotion')
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates when media query changes', async () => {
    const { useReducedMotion } = await import('../useReducedMotion')
    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)

    // Simulate media query change
    act(() => {
      listeners.forEach(handler => handler({ matches: true }))
    })

    expect(result.current).toBe(true)
  })

  it('cleans up event listener on unmount', async () => {
    const removeSpy = vi.fn()
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: (event, handler) => { listeners.push(handler) },
      removeEventListener: removeSpy,
    })

    vi.resetModules()
    const { useReducedMotion } = await import('../useReducedMotion')
    const { unmount } = renderHook(() => useReducedMotion())

    unmount()
    expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
