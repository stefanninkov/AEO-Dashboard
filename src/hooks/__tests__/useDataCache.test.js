import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDataCache } from '../useDataCache'

describe('useDataCache', () => {
  beforeEach(() => {
    // Clear global cache between tests
    const { result } = renderHook(() => useDataCache())
    act(() => result.current.invalidateAll())
  })

  it('returns isMissing for unknown keys', () => {
    const { result } = renderHook(() => useDataCache())
    const entry = result.current.get('nonexistent')
    expect(entry.isMissing).toBe(true)
    expect(entry.data).toBeNull()
  })

  it('stores and retrieves data', () => {
    const { result } = renderHook(() => useDataCache())
    act(() => result.current.set('key1', { value: 42 }))
    const entry = result.current.get('key1')
    expect(entry.isMissing).toBe(false)
    expect(entry.data).toEqual({ value: 42 })
    expect(entry.isStale).toBe(false)
  })

  it('invalidates a specific key', () => {
    const { result } = renderHook(() => useDataCache())
    act(() => result.current.set('a', 1))
    act(() => result.current.set('b', 2))
    act(() => result.current.invalidate('a'))
    expect(result.current.get('a').isMissing).toBe(true)
    expect(result.current.get('b').isMissing).toBe(false)
  })

  it('invalidates by prefix', () => {
    const { result } = renderHook(() => useDataCache())
    act(() => {
      result.current.set('project:1:data', 'a')
      result.current.set('project:1:meta', 'b')
      result.current.set('project:2:data', 'c')
    })
    act(() => result.current.invalidateByPrefix('project:1'))
    expect(result.current.get('project:1:data').isMissing).toBe(true)
    expect(result.current.get('project:1:meta').isMissing).toBe(true)
    expect(result.current.get('project:2:data').isMissing).toBe(false)
  })

  it('invalidateAll clears everything', () => {
    const { result } = renderHook(() => useDataCache())
    act(() => {
      result.current.set('x', 1)
      result.current.set('y', 2)
    })
    act(() => result.current.invalidateAll())
    expect(result.current.get('x').isMissing).toBe(true)
    expect(result.current.get('y').isMissing).toBe(true)
  })

  it('marks data as stale after TTL', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDataCache({ ttl: 1000 }))
    act(() => result.current.set('key', 'val'))

    expect(result.current.get('key').isStale).toBe(false)

    vi.advanceTimersByTime(1001)
    expect(result.current.get('key').isStale).toBe(true)

    vi.useRealTimers()
  })

  it('returns stale data with staleWhileRevalidate', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDataCache({ ttl: 100, staleWhileRevalidate: true }))
    act(() => result.current.set('k', 'old'))
    vi.advanceTimersByTime(200)

    const entry = result.current.get('k')
    expect(entry.isStale).toBe(true)
    expect(entry.isMissing).toBe(false)
    expect(entry.data).toBe('old')

    vi.useRealTimers()
  })

  it('returns missing for stale data without staleWhileRevalidate', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDataCache({ ttl: 100, staleWhileRevalidate: false }))
    act(() => result.current.set('k', 'old'))
    vi.advanceTimersByTime(200)

    const entry = result.current.get('k')
    expect(entry.isMissing).toBe(true)

    vi.useRealTimers()
  })

  it('fetchWithCache returns cached data when fresh', async () => {
    const { result } = renderHook(() => useDataCache())
    act(() => result.current.set('cached', 'hello'))

    const fetcher = vi.fn().mockResolvedValue('new')
    let data
    await act(async () => {
      data = await result.current.fetchWithCache('cached', fetcher)
    })

    expect(data).toBe('hello')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('fetchWithCache calls fetcher when missing', async () => {
    const { result } = renderHook(() => useDataCache())
    const fetcher = vi.fn().mockResolvedValue('fetched')

    let data
    await act(async () => {
      data = await result.current.fetchWithCache('new-key', fetcher)
    })

    expect(data).toBe('fetched')
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it('getStats returns cache info', () => {
    const { result } = renderHook(() => useDataCache({ ttl: 5000, maxEntries: 50 }))
    act(() => {
      result.current.set('a', 1)
      result.current.set('b', 2)
    })

    const stats = result.current.getStats()
    expect(stats.size).toBeGreaterThanOrEqual(2)
    expect(stats.maxEntries).toBe(50)
    expect(stats.ttl).toBe(5000)
  })
})
