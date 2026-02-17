/**
 * Data Cache — Persistent caching layer for Google API data
 *
 * Two tiers:
 *  1. Memory cache — instant, cleared on page refresh
 *  2. localStorage cache — persists across sessions
 *
 * Each cache entry has a TTL. Stale data is served while refreshing
 * in the background (stale-while-revalidate pattern).
 *
 * Cache key format: `aeo-cache:{type}:{propertyId}:{datePreset}:{extra}`
 */

import logger from './logger'

// ── Memory Cache ──
const memoryCache = new Map()

// ── TTL defaults (milliseconds) ──
const TTL = {
  gscQueries: 10 * 60 * 1000,    // 10 minutes (changes infrequently)
  gscPages: 10 * 60 * 1000,      // 10 minutes
  gscDates: 10 * 60 * 1000,      // 10 minutes
  ga4Traffic: 10 * 60 * 1000,    // 10 minutes
  ga4Pages: 10 * 60 * 1000,      // 10 minutes
  ga4Trend: 10 * 60 * 1000,      // 10 minutes
  gscProperties: 30 * 60 * 1000, // 30 minutes (rarely changes)
  ga4Properties: 30 * 60 * 1000, // 30 minutes
  default: 5 * 60 * 1000,        // 5 minutes
}

// ── localStorage size management ──
const MAX_LOCALSTORAGE_ENTRIES = 50
const CACHE_PREFIX = 'aeo-cache:'

/**
 * Generate a cache key
 */
export function cacheKey(type, ...parts) {
  return `${CACHE_PREFIX}${type}:${parts.join(':')}`
}

/**
 * Get cached data. Returns { data, isStale, isMiss }
 *
 * - data: the cached value (or null if miss)
 * - isStale: true if the cache has expired but data is available
 * - isMiss: true if no cached data exists at all
 */
export function getCache(key, ttlMs) {
  const ttl = ttlMs || TTL.default

  // 1. Check memory cache first
  const memEntry = memoryCache.get(key)
  if (memEntry) {
    const age = Date.now() - memEntry.time
    if (age < ttl) {
      return { data: memEntry.data, isStale: false, isMiss: false }
    }
    // Stale but usable
    return { data: memEntry.data, isStale: true, isMiss: false }
  }

  // 2. Check localStorage
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const entry = JSON.parse(raw)
      const age = Date.now() - entry.time

      // Populate memory cache
      memoryCache.set(key, entry)

      if (age < ttl) {
        return { data: entry.data, isStale: false, isMiss: false }
      }
      return { data: entry.data, isStale: true, isMiss: false }
    }
  } catch {
    // Corrupted localStorage entry
  }

  return { data: null, isStale: false, isMiss: true }
}

/**
 * Set cache data in both memory and localStorage
 */
export function setCache(key, data) {
  const entry = { data, time: Date.now() }

  // Memory cache
  memoryCache.set(key, entry)

  // localStorage (with size management)
  try {
    localStorage.setItem(key, JSON.stringify(entry))

    // Prune old entries if too many
    pruneLocalStorage()
  } catch (err) {
    // localStorage full — clear old cache entries and try again
    if (err.name === 'QuotaExceededError') {
      clearOldCacheEntries(10)
      try {
        localStorage.setItem(key, JSON.stringify(entry))
      } catch {
        // Still failing — just use memory cache
        logger.warn('localStorage full, using memory cache only')
      }
    }
  }
}

/**
 * Clear a specific cache key
 */
export function clearCache(key) {
  memoryCache.delete(key)
  try {
    localStorage.removeItem(key)
  } catch { /* ignore */ }
}

/**
 * Clear all AEO cache entries
 */
export function clearAllCache() {
  // Memory
  memoryCache.clear()

  // localStorage
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(CACHE_PREFIX)) keys.push(k)
    }
    for (const k of keys) {
      localStorage.removeItem(k)
    }
  } catch { /* ignore */ }
}

/**
 * Clear cache entries for a specific property
 */
export function clearPropertyCache(propertyId) {
  // Memory
  for (const [key] of memoryCache) {
    if (key.includes(propertyId)) {
      memoryCache.delete(key)
    }
  }

  // localStorage
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(CACHE_PREFIX) && k.includes(propertyId)) keys.push(k)
    }
    for (const k of keys) {
      localStorage.removeItem(k)
    }
  } catch { /* ignore */ }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  let memoryEntries = memoryCache.size
  let localStorageEntries = 0
  let totalSize = 0

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(CACHE_PREFIX)) {
        localStorageEntries++
        totalSize += (localStorage.getItem(k) || '').length
      }
    }
  } catch { /* ignore */ }

  return {
    memoryEntries,
    localStorageEntries,
    totalSizeKB: Math.round(totalSize / 1024),
  }
}

/* ── Internal Helpers ── */

function pruneLocalStorage() {
  try {
    const entries = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const raw = localStorage.getItem(key)
          const parsed = JSON.parse(raw)
          entries.push({ key, time: parsed.time || 0 })
        } catch {
          entries.push({ key, time: 0 })
        }
      }
    }

    if (entries.length > MAX_LOCALSTORAGE_ENTRIES) {
      // Sort oldest first
      entries.sort((a, b) => a.time - b.time)
      const toRemove = entries.slice(0, entries.length - MAX_LOCALSTORAGE_ENTRIES)
      for (const { key } of toRemove) {
        localStorage.removeItem(key)
      }
    }
  } catch { /* ignore */ }
}

function clearOldCacheEntries(count) {
  try {
    const entries = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key))
          entries.push({ key, time: parsed.time || 0 })
        } catch {
          entries.push({ key, time: 0 })
        }
      }
    }

    entries.sort((a, b) => a.time - b.time)
    const toRemove = entries.slice(0, count)
    for (const { key } of toRemove) {
      localStorage.removeItem(key)
      memoryCache.delete(key)
    }
  } catch { /* ignore */ }
}
