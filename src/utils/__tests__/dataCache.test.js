import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cacheKey, getCache, setCache, clearCache, clearAllCache, clearPropertyCache, getCacheStats } from '../dataCache'

// dataCache uses a module-level Map — we need to clear it between tests
// clearAllCache() clears both memory + localStorage
beforeEach(() => {
  clearAllCache()
})

/* ══════════════════════════════════════════
   cacheKey
   ══════════════════════════════════════════ */

describe('cacheKey', () => {
  it('generates key with prefix and type', () => {
    expect(cacheKey('gscQueries')).toBe('aeo-cache:gscQueries:')
  })

  it('joins multiple parts with colons', () => {
    expect(cacheKey('gscQueries', 'prop123', '7d')).toBe('aeo-cache:gscQueries:prop123:7d')
  })
})

/* ══════════════════════════════════════════
   getCache / setCache
   ══════════════════════════════════════════ */

describe('getCache + setCache', () => {
  it('returns isMiss for unknown key', () => {
    const result = getCache('aeo-cache:test:missing')
    expect(result.isMiss).toBe(true)
    expect(result.data).toBeNull()
    expect(result.isStale).toBe(false)
  })

  it('returns fresh data within TTL', () => {
    setCache('aeo-cache:test:fresh', { value: 42 })
    const result = getCache('aeo-cache:test:fresh', 60_000) // 60s TTL
    expect(result.isMiss).toBe(false)
    expect(result.isStale).toBe(false)
    expect(result.data).toEqual({ value: 42 })
  })

  it('returns stale data after TTL expires', () => {
    const key = 'aeo-cache:test:stale'

    // Write a backdated entry directly to localStorage (simulating old session data)
    const entry = { data: { value: 'old' }, time: Date.now() - 120_000 } // 2 minutes ago
    localStorage.setItem(key, JSON.stringify(entry))

    // getCache will find nothing in memory, fall back to localStorage
    const result = getCache(key, 60_000) // 60s TTL
    expect(result.isMiss).toBe(false)
    expect(result.isStale).toBe(true)
    expect(result.data).toEqual({ value: 'old' })
  })

  it('falls back to localStorage when memory cache misses', () => {
    const key = 'aeo-cache:test:localStorage-fallback'
    // Write directly to localStorage (simulating a previous session)
    const entry = { data: { restored: true }, time: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))

    const result = getCache(key, 60_000)
    expect(result.isMiss).toBe(false)
    expect(result.data).toEqual({ restored: true })
  })

  it('handles corrupted localStorage gracefully', () => {
    const key = 'aeo-cache:test:corrupt'
    localStorage.setItem(key, 'NOT_JSON{{{')

    const result = getCache(key, 60_000)
    expect(result.isMiss).toBe(true)
    expect(result.data).toBeNull()
  })
})

/* ══════════════════════════════════════════
   clearCache
   ══════════════════════════════════════════ */

describe('clearCache', () => {
  it('removes a specific key from both tiers', () => {
    const key = 'aeo-cache:test:clear'
    setCache(key, { x: 1 })

    // Verify it exists
    expect(getCache(key, 60_000).isMiss).toBe(false)

    clearCache(key)

    // Now it should be a miss
    expect(getCache(key, 60_000).isMiss).toBe(true)
    expect(localStorage.getItem(key)).toBeNull()
  })
})

/* ══════════════════════════════════════════
   clearAllCache
   ══════════════════════════════════════════ */

describe('clearAllCache', () => {
  it('clears all aeo-cache entries but not other localStorage keys', () => {
    setCache('aeo-cache:a:1', { a: 1 })
    setCache('aeo-cache:b:2', { b: 2 })
    localStorage.setItem('non-cache-key', 'keep-me')

    clearAllCache()

    expect(getCache('aeo-cache:a:1', 60_000).isMiss).toBe(true)
    expect(getCache('aeo-cache:b:2', 60_000).isMiss).toBe(true)
    expect(localStorage.getItem('non-cache-key')).toBe('keep-me')
  })
})

/* ══════════════════════════════════════════
   clearPropertyCache
   ══════════════════════════════════════════ */

describe('clearPropertyCache', () => {
  it('clears only entries matching the property ID', () => {
    setCache('aeo-cache:gscQueries:prop123:7d', { q: 1 })
    setCache('aeo-cache:gscPages:prop123:7d', { p: 1 })
    setCache('aeo-cache:gscQueries:prop456:7d', { q: 2 })

    clearPropertyCache('prop123')

    expect(getCache('aeo-cache:gscQueries:prop123:7d', 60_000).isMiss).toBe(true)
    expect(getCache('aeo-cache:gscPages:prop123:7d', 60_000).isMiss).toBe(true)
    // Other property's cache should remain
    expect(getCache('aeo-cache:gscQueries:prop456:7d', 60_000).data).toEqual({ q: 2 })
  })
})

/* ══════════════════════════════════════════
   getCacheStats
   ══════════════════════════════════════════ */

describe('getCacheStats', () => {
  it('returns zero counts when empty', () => {
    const stats = getCacheStats()
    expect(stats.memoryEntries).toBe(0)
    expect(stats.localStorageEntries).toBe(0)
    expect(stats.totalSizeKB).toBe(0)
  })

  it('returns correct counts after adding entries', () => {
    setCache('aeo-cache:test:s1', { x: 1 })
    setCache('aeo-cache:test:s2', { y: 2 })

    const stats = getCacheStats()
    expect(stats.memoryEntries).toBe(2)
    expect(stats.localStorageEntries).toBe(2)
    expect(stats.totalSizeKB).toBeGreaterThanOrEqual(0)
  })
})
