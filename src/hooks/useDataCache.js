import { useState, useCallback, useRef } from 'react'

/**
 * useDataCache — In-memory data cache with TTL and stale-while-revalidate.
 *
 * Usage:
 *   const { get, set, invalidate, invalidateAll } = useDataCache({ ttl: 60000 })
 *   const data = get('key')
 *   set('key', fetchedData)
 *
 * Options:
 *   ttl                  — time-to-live in ms (default 5 min)
 *   staleWhileRevalidate — serve stale data while refetching (default true)
 *   maxEntries           — max cache entries (default 100, LRU eviction)
 */

// Shared cache across hook instances
const globalCache = new Map()

export function useDataCache({
  ttl = 5 * 60 * 1000,
  staleWhileRevalidate = true,
  maxEntries = 100,
} = {}) {
  const [, setTick] = useState(0)
  const revalidatingRef = useRef(new Set())

  const evictOldest = useCallback(() => {
    if (globalCache.size <= maxEntries) return
    // Evict oldest entry (first inserted)
    const oldest = globalCache.keys().next().value
    if (oldest !== undefined) globalCache.delete(oldest)
  }, [maxEntries])

  /**
   * Get a cached value.
   * Returns { data, isStale, isMissing }
   */
  const get = useCallback((key) => {
    const entry = globalCache.get(key)
    if (!entry) return { data: null, isStale: false, isMissing: true }

    const age = Date.now() - entry.timestamp
    const isStale = age > ttl

    if (isStale && !staleWhileRevalidate) {
      globalCache.delete(key)
      return { data: null, isStale: true, isMissing: true }
    }

    return { data: entry.data, isStale, isMissing: false }
  }, [ttl, staleWhileRevalidate])

  /**
   * Set a cache entry.
   */
  const set = useCallback((key, data) => {
    globalCache.set(key, { data, timestamp: Date.now() })
    evictOldest()
    revalidatingRef.current.delete(key)
    setTick(t => t + 1)
  }, [evictOldest])

  /**
   * Invalidate a specific key.
   */
  const invalidate = useCallback((key) => {
    globalCache.delete(key)
    setTick(t => t + 1)
  }, [])

  /**
   * Invalidate all entries matching a prefix.
   */
  const invalidateByPrefix = useCallback((prefix) => {
    for (const key of globalCache.keys()) {
      if (key.startsWith(prefix)) globalCache.delete(key)
    }
    setTick(t => t + 1)
  }, [])

  /**
   * Clear entire cache.
   */
  const invalidateAll = useCallback(() => {
    globalCache.clear()
    setTick(t => t + 1)
  }, [])

  /**
   * Fetch with cache — returns cached data if fresh, otherwise calls fetcher.
   * Implements stale-while-revalidate pattern.
   */
  const fetchWithCache = useCallback(async (key, fetcher) => {
    const cached = get(key)

    if (!cached.isMissing && !cached.isStale) {
      return cached.data
    }

    // Stale-while-revalidate: return stale data but trigger background refresh
    if (!cached.isMissing && cached.isStale && staleWhileRevalidate) {
      if (!revalidatingRef.current.has(key)) {
        revalidatingRef.current.add(key)
        fetcher().then(data => set(key, data)).catch(() => {
          revalidatingRef.current.delete(key)
        })
      }
      return cached.data
    }

    // No cached data, fetch synchronously
    const data = await fetcher()
    set(key, data)
    return data
  }, [get, set, staleWhileRevalidate])

  /**
   * Get cache stats for debugging.
   */
  const getStats = useCallback(() => ({
    size: globalCache.size,
    maxEntries,
    ttl,
    keys: [...globalCache.keys()],
  }), [maxEntries, ttl])

  return {
    get,
    set,
    invalidate,
    invalidateByPrefix,
    invalidateAll,
    fetchWithCache,
    getStats,
  }
}
