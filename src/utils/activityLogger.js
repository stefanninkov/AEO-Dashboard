/**
 * Activity Logger Utility
 * Creates and manages activity log entries for project event tracking.
 *
 * @param {string} type - Activity type (check, uncheck, note, task_assign, etc.)
 * @param {object} data - Type-specific data fields
 * @param {object} [author] - Optional author context { uid, displayName, email }
 */

export function createActivity(type, data = {}, author = null) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    timestamp: new Date().toISOString(),
    ...(author ? { authorUid: author.uid, authorName: author.displayName || author.email || 'Unknown', authorEmail: author.email || '' } : {}),
    ...data,
  }
}

export function appendActivity(existingLog = [], newEntry, maxEntries = 200) {
  const updated = [newEntry, ...existingLog]
  return updated.slice(0, maxEntries)
}
