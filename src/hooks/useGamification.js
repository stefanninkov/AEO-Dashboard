import { useState, useCallback, useRef } from 'react'
import {
  addPoints,
  getDefaultStats,
  getEarnedBadges,
  getNewBadges,
  calculateStreak,
} from '../utils/gamification'

const STORAGE_KEY = 'aeo-gamification-stats'

/**
 * Increment the relevant counter for each action type.
 * addPoints() only handles totalPoints — this bumps per-action counters
 * so badge conditions can fire.
 */
function incrementActionCounters(stats, actionType) {
  const updated = { ...stats }
  switch (actionType) {
    case 'analyzePage':
      updated.totalAnalyses = (updated.totalAnalyses || 0) + 1
      // Track daily analyses count
      {
        const today = new Date().toISOString().slice(0, 10)
        if (updated.lastAnalysisDate === today) {
          updated.analysesToday = (updated.analysesToday || 0) + 1
        } else {
          updated.analysesToday = 1
          updated.lastAnalysisDate = today
        }
      }
      break
    case 'completeCheckItem':
      // phasesCompleted is tracked separately when a whole phase completes;
      // individual check items don't bump it.
      break
    case 'generateSchema':
      updated.schemasGenerated = (updated.schemasGenerated || 0) + 1
      break
    case 'createBrief':
    case 'writeContent':
      updated.contentWritten = (updated.contentWritten || 0) + 1
      break
    case 'runSeoAudit':
    case 'runTest':
      updated.seoAuditTypes = (updated.seoAuditTypes || 0) + 1
      break
    case 'connectGsc':
    case 'connectIntegration':
      updated.gscConnected = true
      break
    case 'inviteTeamMember':
      updated.teamInvites = (updated.teamInvites || 0) + 1
      break
    default:
      break
  }
  return updated
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Merge with defaults so new fields are always present
      return { ...getDefaultStats(), ...parsed }
    }
  } catch {
    // corrupted — start fresh
  }
  return getDefaultStats()
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // quota exceeded — silently ignore
  }
}

/**
 * useGamification — reads / writes gamification stats from localStorage
 * and exposes a `trackAction(actionType)` helper that:
 *   1. Adds points via the pure `addPoints` function
 *   2. Increments action-specific counters
 *   3. Updates the activity streak
 *   4. Checks for newly earned badges
 *   5. Persists everything back to localStorage
 *
 * Returns { stats, trackAction, newBadges }
 */
export function useGamification() {
  const [stats, setStats] = useState(loadStats)
  const [newBadges, setNewBadges] = useState([])
  // Keep a ref to the latest stats so trackAction always sees current state
  const statsRef = useRef(stats)
  statsRef.current = stats

  const trackAction = useCallback((actionType) => {
    const current = statsRef.current
    const previousBadgeIds = current.earnedBadgeIds || []

    // 1. Add points
    let updated = addPoints(current, actionType)

    // 2. Increment action-specific counters
    updated = incrementActionCounters(updated, actionType)

    // 3. Update activity dates & streak
    const today = new Date().toISOString().slice(0, 10)
    const loginDates = [...(updated.loginDates || [])]
    if (!loginDates.includes(today)) {
      loginDates.push(today)
    }
    updated.loginDates = loginDates
    updated.lastLoginDate = today

    const { currentStreak, longestStreak } = calculateStreak(loginDates)
    updated.currentStreak = currentStreak
    updated.longestStreak = Math.max(longestStreak, updated.longestStreak || 0)

    // 4. Check for newly earned badges
    const freshBadges = getNewBadges(updated, previousBadgeIds)
    if (freshBadges.length > 0) {
      updated.earnedBadgeIds = [
        ...previousBadgeIds,
        ...freshBadges.map((b) => b.id),
      ]
      setNewBadges(freshBadges)
    }

    // 5. Persist
    saveStats(updated)
    setStats(updated)

    return { stats: updated, newBadges: freshBadges }
  }, [])

  return { stats, trackAction, newBadges }
}
