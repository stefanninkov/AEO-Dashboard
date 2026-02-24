// src/utils/activationTracker.js

/**
 * User milestone tracker for activation funnel analytics.
 * Tracks key moments in the user journey.
 */

export const MILESTONES = {
  SIGNED_UP: 'signed_up',
  COMPLETED_ONBOARDING: 'completed_onboarding',
  CREATED_PROJECT: 'created_project',
  COMPLETED_QUESTIONNAIRE: 'completed_questionnaire',
  FIRST_ANALYSIS: 'first_analysis',
  FIRST_CONTENT: 'first_content',
  FIRST_MONITORING: 'first_monitoring',
  FIRST_COMPETITOR: 'first_competitor',
  CONNECTED_GSC: 'connected_gsc',
  CONNECTED_GA4: 'connected_ga4',
  RETURN_DAY_1: 'return_day_1',
  RETURN_DAY_7: 'return_day_7',
  RETURN_DAY_30: 'return_day_30',
}

/**
 * Track a milestone for a user. Uses Firestore merge write.
 * Safe to call multiple times — the first timestamp wins.
 */
export async function trackMilestone(userId, milestone) {
  if (!userId || !milestone) return

  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    const { db } = await import('../firebase')

    if (!db) {
      // Dev mode: localStorage
      const key = `aeo-milestones-${userId}`
      const existing = JSON.parse(localStorage.getItem(key) || '{}')
      if (!existing[milestone]) {
        existing[milestone] = new Date().toISOString()
        localStorage.setItem(key, JSON.stringify(existing))
      }
      return
    }

    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      milestones: {
        [milestone]: serverTimestamp(),
      },
    }, { merge: true })
  } catch {
    // Non-critical — silently fail
  }
}
