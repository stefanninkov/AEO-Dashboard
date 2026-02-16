/**
 * Activity Logger Utility
 * Creates and manages activity log entries for project event tracking.
 */

export function createActivity(type, data = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    timestamp: new Date().toISOString(),
    ...data,
  }
}

export function appendActivity(existingLog = [], newEntry, maxEntries = 200) {
  const updated = [newEntry, ...existingLog]
  return updated.slice(0, maxEntries)
}
