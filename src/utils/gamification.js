/**
 * Gamification system — points, badges, streaks, and levels.
 *
 * All logic is pure functions. State is stored in Firestore per user.
 */

// ── Points Configuration ──
export const POINTS = {
  analyzePage: 10,
  completeCheckItem: 5,
  runSeoAudit: 8,
  generateSchema: 6,
  writeContent: 12,
  connectGsc: 15,
  inviteTeamMember: 20,
  dailyLogin: 3,
  reachScore50: 25,
  reachScore75: 50,
  reachScore100: 100,
  completePhase: 30,
  firstAnalysis: 20,
}

// ── Badge Definitions ──
export const BADGES = [
  {
    id: 'first-analysis',
    name: 'First Steps',
    description: 'Run your first site analysis',
    icon: '🔍',
    condition: (stats) => stats.totalAnalyses >= 1,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete 5 analyses in one day',
    icon: '⚡',
    condition: (stats) => stats.analysesToday >= 5,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Achieve a 100% score on any analysis',
    icon: '💎',
    condition: (stats) => stats.maxScore >= 100,
  },
  {
    id: 'checklist-champion',
    name: 'Checklist Champion',
    description: 'Complete all 7 phases of the AEO checklist',
    icon: '🏆',
    condition: (stats) => stats.phasesCompleted >= 7,
  },
  {
    id: 'schema-master',
    name: 'Schema Master',
    description: 'Generate 10 schema markups',
    icon: '🧬',
    condition: (stats) => stats.schemasGenerated >= 10,
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Write 5 pieces of AI content',
    icon: '✍️',
    condition: (stats) => stats.contentWritten >= 5,
  },
  {
    id: 'streak-3',
    name: 'On a Roll',
    description: 'Maintain a 3-day login streak',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day login streak',
    icon: '🗓️',
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'streak-30',
    name: 'Dedicated',
    description: 'Maintain a 30-day login streak',
    icon: '🌟',
    condition: (stats) => stats.currentStreak >= 30,
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Invite a team member to your project',
    icon: '🤝',
    condition: (stats) => stats.teamInvites >= 1,
  },
  {
    id: 'connector',
    name: 'Connector',
    description: 'Connect Google Search Console',
    icon: '🔗',
    condition: (stats) => stats.gscConnected,
  },
  {
    id: 'seo-explorer',
    name: 'SEO Explorer',
    description: 'Run all 5 SEO audit types',
    icon: '🧭',
    condition: (stats) => stats.seoAuditTypes >= 5,
  },
]

// ── Level System ──
export const LEVELS = [
  { level: 1, name: 'Beginner', minPoints: 0, color: '#6B7280' },
  { level: 2, name: 'Learner', minPoints: 50, color: '#3B82F6' },
  { level: 3, name: 'Practitioner', minPoints: 150, color: '#8B5CF6' },
  { level: 4, name: 'Intermediate', minPoints: 300, color: '#10B981' },
  { level: 5, name: 'Advanced', minPoints: 500, color: '#F59E0B' },
  { level: 6, name: 'Expert', minPoints: 800, color: '#EF4444' },
  { level: 7, name: 'Master', minPoints: 1200, color: '#EC4899' },
  { level: 8, name: 'Grandmaster', minPoints: 2000, color: '#FF6B35' },
]

// ── Core Functions ──

export function getLevel(points) {
  let current = LEVELS[0]
  for (const level of LEVELS) {
    if (points >= level.minPoints) current = level
    else break
  }
  return current
}

export function getNextLevel(points) {
  for (const level of LEVELS) {
    if (points < level.minPoints) return level
  }
  return null // Max level reached
}

export function getLevelProgress(points) {
  const current = getLevel(points)
  const next = getNextLevel(points)
  if (!next) return 100
  const range = next.minPoints - current.minPoints
  const progress = points - current.minPoints
  return Math.round((progress / range) * 100)
}

export function getEarnedBadges(stats) {
  return BADGES.filter((badge) => badge.condition(stats))
}

export function getNewBadges(stats, previousBadgeIds = []) {
  const earned = getEarnedBadges(stats)
  return earned.filter((b) => !previousBadgeIds.includes(b.id))
}

// ── Streak Logic ──

export function calculateStreak(loginDates = []) {
  if (!loginDates.length) return { currentStreak: 0, longestStreak: 0 }

  const sorted = [...loginDates]
    .map((d) => new Date(d).toISOString().slice(0, 10))
    .filter((v, i, a) => a.indexOf(v) === i) // unique dates
    .sort()
    .reverse()

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let currentStreak = 0
  if (sorted[0] === today || sorted[0] === yesterday) {
    currentStreak = 1
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diff = (prev - curr) / 86400000
      if (diff === 1) currentStreak++
      else break
    }
  }

  // Longest streak
  let longestStreak = 1
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    if ((prev - curr) / 86400000 === 1) {
      streak++
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 1
    }
  }

  return { currentStreak, longestStreak }
}

// ── Default Stats ──

export function getDefaultStats() {
  return {
    totalPoints: 0,
    totalAnalyses: 0,
    analysesToday: 0,
    maxScore: 0,
    phasesCompleted: 0,
    schemasGenerated: 0,
    contentWritten: 0,
    currentStreak: 0,
    longestStreak: 0,
    teamInvites: 0,
    gscConnected: false,
    seoAuditTypes: 0,
    earnedBadgeIds: [],
    loginDates: [],
    lastLoginDate: null,
  }
}

// ── Add Points ──

export function addPoints(stats, action) {
  const pts = POINTS[action] || 0
  if (!pts) return stats
  return { ...stats, totalPoints: (stats.totalPoints || 0) + pts }
}
