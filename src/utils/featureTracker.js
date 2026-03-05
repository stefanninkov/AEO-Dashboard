// src/utils/featureTracker.js

/**
 * Lightweight feature usage tracker.
 * Logs feature interactions to Firestore for admin analytics.
 * Batches writes to avoid excessive Firestore operations.
 *
 * In dev mode (no Firebase), uses localStorage for debugging.
 */

let eventQueue = []
let flushTimer = null
const BATCH_INTERVAL = 30000 // 30 seconds
let firestoreAvailable = false
let firestoreModules = null

// Lazy-load Firestore to avoid import errors in dev mode
async function getFirestore() {
  if (firestoreModules) return firestoreModules
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    const { db } = await import('../firebase')
    if (db) {
      firestoreModules = { collection, addDoc, serverTimestamp, db }
      firestoreAvailable = true
    }
  } catch {
    firestoreAvailable = false
  }
  return firestoreModules
}

export function trackFeature(userId, feature, action = 'view', meta = {}) {
  if (!userId) return

  eventQueue.push({
    userId,
    feature,
    action,
    meta,
    timestamp: new Date().toISOString(),
  })

  // Auto-flush after interval
  if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, BATCH_INTERVAL)
  }

  // Flush immediately if queue gets large
  if (eventQueue.length >= 20) {
    flushEvents()
  }
}

async function flushEvents() {
  if (eventQueue.length === 0) return
  const batch = [...eventQueue]
  eventQueue = []
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }

  const fs = await getFirestore()

  if (fs && firestoreAvailable) {
    try {
      for (const event of batch) {
        await fs.addDoc(fs.collection(fs.db, 'featureUsage'), {
          ...event,
          createdAt: fs.serverTimestamp(),
        })
      }
    } catch {
      // Re-queue failed events (limit to prevent infinite growth)
      if (eventQueue.length < 100) {
        eventQueue.push(...batch)
      }
    }
  } else {
    // Dev mode: store in localStorage for debugging
    try {
      const existing = JSON.parse(localStorage.getItem('aeo-feature-events') || '[]')
      localStorage.setItem('aeo-feature-events', JSON.stringify([...existing, ...batch].slice(-500)))
    } catch { /* non-critical */ }
  }
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushEvents)
}

// Feature names for consistency
export const FEATURES = {
  DASHBOARD: 'dashboard',
  CHECKLIST: 'checklist',
  ANALYZER: 'analyzer',
  ANALYZER_DETERMINISTIC: 'analyzer.deterministic',
  ANALYZER_AI: 'analyzer.ai',
  CONTENT_WRITER: 'content_writer',
  CONTENT_SCORER: 'content_scorer',
  CONTENT_OPS: 'content_ops',
  SCHEMA_GENERATOR: 'schema_generator',
  MONITORING: 'monitoring',
  METRICS: 'metrics',
  GSC: 'gsc',
  GA4: 'ga4',
  AEO_IMPACT: 'aeo_impact',
  COMPETITORS: 'competitors',
  TESTING: 'testing',
  DOCUMENTATION: 'documentation',
  SEO: 'seo',
  SETTINGS: 'settings',
  REPORT_EXPORT: 'report_export',
}
