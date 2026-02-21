import { useState, useEffect, useCallback } from 'react'
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import logger from '../../utils/logger'

/**
 * Fetches platform-wide stats for the admin dashboard.
 *
 * Strategy:
 *   1. Try reading all users (requires Firestore rules granting admin read access)
 *   2. If that fails (permission denied), fall back to reading only the current user's data
 *   3. Projects: try both legacy subcollections and shared top-level collection
 *   4. Waitlist + Feedback: fetched from their own top-level collections
 *
 * To enable full admin access, update Firestore security rules to allow
 * the super admin UID to read the entire `users` and `projects` collections.
 */
export function useAdminStats(currentUser) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [permissionWarning, setPermissionWarning] = useState(null)

  const fetchStats = useCallback(async () => {
    if (!currentUser?.uid) return

    setLoading(true)
    setError(null)
    setPermissionWarning(null)

    try {
      let users = []
      let fullAccess = false

      // 1. Try fetching ALL users (needs admin Firestore rules)
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        fullAccess = true
      } catch (err) {
        // Permission denied — fall back to current user only
        logger.warn('Cannot read all users (permission denied). Falling back to own profile.')
        setPermissionWarning(
          'Limited access: Firestore security rules need updating for full admin access. ' +
          'Currently showing only your own data.'
        )

        try {
          const myDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (myDoc.exists()) {
            users = [{ id: myDoc.id, ...myDoc.data() }]
          } else {
            // Build from auth object
            users = [{
              id: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            }]
          }
        } catch (innerErr) {
          logger.error('Failed to read own user doc:', innerErr)
          users = [{
            id: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          }]
        }
      }

      // 2. Fetch projects
      const allProjects = []
      const projectsByUser = {}

      // 2a. Legacy projects: users/{uid}/projects
      if (fullAccess) {
        // Read all users' projects
        for (const user of users) {
          try {
            const projSnap = await getDocs(collection(db, 'users', user.id, 'projects'))
            const userProjects = projSnap.docs.map(d => ({
              id: d.id,
              ...d.data(),
              _ownerUid: user.id,
              _ownerName: user.displayName || user.email || 'Unknown',
              _ownerEmail: user.email || '',
              _path: 'legacy',
            }))
            allProjects.push(...userProjects)
            projectsByUser[user.id] = userProjects
          } catch (err) {
            logger.error(`Failed to fetch projects for user ${user.id}:`, err)
          }
        }
      } else {
        // Limited: only current user's legacy projects
        try {
          const projSnap = await getDocs(collection(db, 'users', currentUser.uid, 'projects'))
          const userProjects = projSnap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            _ownerUid: currentUser.uid,
            _ownerName: currentUser.displayName || currentUser.email || 'You',
            _ownerEmail: currentUser.email || '',
            _path: 'legacy',
          }))
          allProjects.push(...userProjects)
          projectsByUser[currentUser.uid] = userProjects
        } catch (err) {
          logger.error('Failed to fetch own legacy projects:', err)
        }
      }

      // 2b. Shared/team projects (top-level collection)
      try {
        let sharedSnap
        if (fullAccess) {
          sharedSnap = await getDocs(collection(db, 'projects'))
        } else {
          // Limited: only projects where current user is a member
          sharedSnap = await getDocs(
            query(collection(db, 'projects'), where('memberIds', 'array-contains', currentUser.uid))
          )
        }
        const sharedProjects = sharedSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          _path: 'shared',
        }))
        // Add shared projects that aren't already in legacy list
        const legacyIds = new Set(allProjects.map(p => p.id))
        for (const sp of sharedProjects) {
          if (!legacyIds.has(sp.id)) {
            const owner = users.find(u => u.id === sp.ownerId)
            sp._ownerUid = sp.ownerId || ''
            sp._ownerName = owner?.displayName || owner?.email || sp.ownerId || 'Unknown'
            sp._ownerEmail = owner?.email || ''
            allProjects.push(sp)
          }
        }
      } catch (err) {
        logger.error('Failed to fetch shared projects:', err)
      }

      // 3. Fetch waitlist entries
      let waitlistEntries = []
      try {
        const waitlistSnap = await getDocs(
          query(collection(db, 'waitlist'), orderBy('signedUpAt', 'desc'))
        )
        waitlistEntries = waitlistSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      } catch (err) {
        logger.warn('Failed to fetch waitlist:', err)
      }

      // 4. Fetch feedback entries
      let feedbackEntries = []
      try {
        const feedbackSnap = await getDocs(
          query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
        )
        feedbackEntries = feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      } catch (err) {
        logger.warn('Failed to fetch feedback:', err)
      }

      // 5. Compute stats
      const now = new Date()
      const DAY_MS = 24 * 60 * 60 * 1000
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * DAY_MS)
      const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS)
      const monthAgo = new Date(now.getTime() - 30 * DAY_MS)

      const parseDate = (d) => {
        if (!d) return null
        if (d.toDate) return d.toDate() // Firestore Timestamp
        if (typeof d === 'string') return new Date(d)
        return null
      }

      const daysBetween = (a, b) => Math.floor(Math.abs((a - b) / DAY_MS))

      let activeToday = 0
      let activeThisWeek = 0
      let signupsThisWeek = 0
      let signupsThisMonth = 0

      for (const user of users) {
        const lastLogin = parseDate(user.lastLoginAt)
        const created = parseDate(user.createdAt)

        if (lastLogin && lastLogin >= todayStart) activeToday++
        if (lastLogin && lastLogin >= weekAgo) activeThisWeek++
        if (created && created >= weekAgo) signupsThisWeek++
        if (created && created >= monthAgo) signupsThisMonth++
      }

      let activeProjects = 0
      let totalTasks = 0
      let completedTasks = 0

      for (const project of allProjects) {
        const updatedAt = parseDate(project.updatedAt)
        if (updatedAt && updatedAt >= weekAgo) activeProjects++

        if (project.checked && typeof project.checked === 'object') {
          const entries = Object.entries(project.checked)
          totalTasks += entries.length
          completedTasks += entries.filter(([, v]) => v).length
        }
      }

      // Recent activity from all projects' activityLog
      const allActivities = []
      for (const project of allProjects) {
        if (Array.isArray(project.activityLog)) {
          for (const act of project.activityLog) {
            allActivities.push({
              ...act,
              _projectName: project.name || 'Untitled',
              _projectId: project.id,
              _ownerUid: project._ownerUid,
            })
          }
        }
      }
      allActivities.sort((a, b) => {
        const at = a.timestamp ? new Date(a.timestamp).getTime() : 0
        const bt = b.timestamp ? new Date(b.timestamp).getTime() : 0
        return bt - at
      })
      const recentActivity = allActivities.slice(0, 50)

      // Recent signups (last 10)
      const recentSignups = [...users]
        .sort((a, b) => {
          const at = parseDate(a.createdAt)?.getTime() || 0
          const bt = parseDate(b.createdAt)?.getTime() || 0
          return bt - at
        })
        .slice(0, 10)

      // Waitlist stats
      const waitlistTotal = waitlistEntries.length
      const waitlistThisWeek = waitlistEntries.filter(e => {
        const d = parseDate(e.signedUpAt)
        return d && d >= weekAgo
      }).length
      const waitlistToday = waitlistEntries.filter(e => {
        const d = parseDate(e.signedUpAt)
        return d && d >= todayStart
      }).length

      // Feedback stats
      const feedbackTotal = feedbackEntries.length
      const feedbackNew = feedbackEntries.filter(f => !f.status || f.status === 'new').length
      const feedbackThisWeek = feedbackEntries.filter(f => {
        const d = parseDate(f.createdAt)
        return d && d >= weekAgo
      }).length

      // Daily signup trend (last 14 days)
      const signupTrend = []
      for (let i = 13; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        const dayEnd = new Date(dayStart.getTime() + DAY_MS)
        const count = users.filter(u => {
          const d = parseDate(u.createdAt)
          return d && d >= dayStart && d < dayEnd
        }).length
        signupTrend.push({
          date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count,
        })
      }

      // Daily waitlist trend (last 14 days)
      const waitlistTrend = []
      for (let i = 13; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        const dayEnd = new Date(dayStart.getTime() + DAY_MS)
        const count = waitlistEntries.filter(e => {
          const d = parseDate(e.signedUpAt)
          return d && d >= dayStart && d < dayEnd
        }).length
        waitlistTrend.push({
          date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count,
        })
      }

      // Daily activity trend (last 14 days)
      const activityTrend = []
      for (let i = 13; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        const dayEnd = new Date(dayStart.getTime() + DAY_MS)
        const count = allActivities.filter(a => {
          const d = a.timestamp ? new Date(a.timestamp) : null
          return d && d >= dayStart && d < dayEnd
        }).length
        activityTrend.push({
          date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count,
        })
      }

      /* ═══════════════════════════════════════════════════
         DEEP ANALYTICS — User Health, Churn, Heatmap, etc.
         ═══════════════════════════════════════════════════ */

      // ── 1a. User Health Scoring ──
      const userHealth = users.map(u => {
        const lastLogin = parseDate(u.lastLoginAt)
        const created = parseDate(u.createdAt)
        const daysSinceLogin = lastLogin ? daysBetween(now, lastLogin) : 999
        const daysSinceSignup = created ? daysBetween(now, created) : 0

        // Find user's projects
        const userProjects = allProjects.filter(p =>
          p._ownerUid === u.id || (p.memberIds && p.memberIds.includes(u.id))
        )
        const projectCount = userProjects.length

        // Completion rate across user's projects
        let userChecked = 0
        let userTotal = 0
        for (const p of userProjects) {
          if (p.checked && typeof p.checked === 'object') {
            const entries = Object.entries(p.checked)
            userTotal += entries.length
            userChecked += entries.filter(([, v]) => v).length
          }
        }
        const completionRate = userTotal > 0 ? Math.round((userChecked / userTotal) * 100) : 0

        // Activity frequency (last 30 days)
        const userActivities = allActivities.filter(a =>
          a.authorUid === u.id && a.timestamp && new Date(a.timestamp) >= monthAgo
        )
        const activityCount = userActivities.length
        const lastActivity = userActivities[0]
        const daysSinceActivity = lastActivity?.timestamp
          ? daysBetween(now, new Date(lastActivity.timestamp))
          : 999

        // Health score (0-100)
        let healthScore = 0
        if (daysSinceLogin <= 1) healthScore += 35
        else if (daysSinceLogin <= 3) healthScore += 28
        else if (daysSinceLogin <= 7) healthScore += 20
        else if (daysSinceLogin <= 14) healthScore += 10
        else if (daysSinceLogin <= 30) healthScore += 3

        if (projectCount >= 2) healthScore += 15
        else if (projectCount === 1) healthScore += 10

        if (completionRate >= 50) healthScore += 20
        else if (completionRate >= 25) healthScore += 12
        else if (completionRate > 0) healthScore += 5

        if (activityCount >= 20) healthScore += 20
        else if (activityCount >= 10) healthScore += 15
        else if (activityCount >= 3) healthScore += 8
        else if (activityCount >= 1) healthScore += 3

        if (daysSinceActivity <= 3) healthScore += 10
        else if (daysSinceActivity <= 7) healthScore += 6
        else if (daysSinceActivity <= 14) healthScore += 2

        healthScore = Math.min(100, healthScore)

        // Status
        let status = 'active'
        if (daysSinceLogin > 30 || (daysSinceLogin > 14 && activityCount === 0)) status = 'churned'
        else if (daysSinceLogin > 14) status = 'dormant'
        else if (daysSinceLogin > 7 || daysSinceActivity > 7) status = 'at-risk'

        // Feature usage for this user
        const usedAnalyzer = userProjects.some(p => p.analyzerResults)
        const usedContentWriter = userProjects.some(p => p.contentHistory?.length > 0)
        const usedCompetitors = userProjects.some(p => p.competitors?.length > 0)
        const usedSchema = userProjects.some(p => p.schemaHistory?.length > 0)
        const usedCalendar = userProjects.some(p => p.contentCalendar?.length > 0)
        const usedMetrics = userProjects.some(p => p.metricsHistory?.length > 0)
        const usedExport = userActivities.some(a => a.type === 'export_pdf' || a.type === 'export')

        return {
          ...u,
          healthScore,
          status,
          daysSinceLogin,
          daysSinceSignup,
          daysSinceActivity,
          projectCount,
          completionRate,
          activityCount,
          lastActivityType: lastActivity?.type || null,
          lastProjectWorkedOn: lastActivity?._projectName || null,
          features: {
            checklist: userChecked > 0,
            analyzer: usedAnalyzer,
            contentWriter: usedContentWriter,
            competitors: usedCompetitors,
            schema: usedSchema,
            calendar: usedCalendar,
            metrics: usedMetrics,
            export: usedExport,
          },
          _projects: userProjects,
        }
      })

      const atRiskUsers = userHealth.filter(u => u.status === 'at-risk')
      const dormantUsers = userHealth.filter(u => u.status === 'dormant')
      const churnedUsers = userHealth.filter(u => u.status === 'churned')
      const activeUsers = userHealth.filter(u => u.status === 'active')

      // ── 1b. Checklist Stuck-Point Heatmap ──
      const projectsWithChecks = allProjects.filter(p =>
        p.checked && typeof p.checked === 'object' && Object.values(p.checked).some(Boolean)
      )
      const totalProjectsWithChecks = projectsWithChecks.length

      // Build item completion map: itemId → count of projects that checked it
      const itemCompletionMap = {}
      for (const p of projectsWithChecks) {
        for (const [itemId, val] of Object.entries(p.checked)) {
          if (val) {
            itemCompletionMap[itemId] = (itemCompletionMap[itemId] || 0) + 1
          }
        }
      }

      // We don't have phases data in the hook, so export raw map for views to combine with phases
      // Views will import phases from aeo-checklist.js and merge

      // ── 1c. Project Health ──
      const projectHealth = allProjects.map(p => {
        const updatedAt = parseDate(p.updatedAt)
        const createdAt = parseDate(p.createdAt)
        const daysSinceUpdate = updatedAt ? daysBetween(now, updatedAt) : 999
        const age = createdAt ? daysBetween(now, createdAt) : 0

        const checked = p.checked && typeof p.checked === 'object' ? p.checked : {}
        const checkedCount = Object.values(checked).filter(Boolean).length
        const progress = checkedCount > 0 ? Math.round((checkedCount / 99) * 100) : 0

        // Last activity from project log
        const lastAct = Array.isArray(p.activityLog) && p.activityLog.length > 0
          ? p.activityLog.reduce((latest, a) => {
            const lt = latest?.timestamp ? new Date(latest.timestamp).getTime() : 0
            const ct = a.timestamp ? new Date(a.timestamp).getTime() : 0
            return ct > lt ? a : latest
          }, p.activityLog[0])
          : null
        const daysSinceActivity = lastAct?.timestamp
          ? daysBetween(now, new Date(lastAct.timestamp))
          : daysSinceUpdate

        // Health badge
        let healthBadge = 'active'
        if (progress === 0 && age > 7) healthBadge = 'never-started'
        else if (daysSinceUpdate > 30 && progress < 20) healthBadge = 'abandoned'
        else if (daysSinceUpdate > 14) healthBadge = 'stale'
        else if (daysSinceActivity > 14 && progress > 0 && progress < 75) healthBadge = 'stuck'
        else if (daysSinceUpdate <= 7 && progress > 10) healthBadge = 'thriving'

        // Inactivity level
        let inactivityLevel = 'active'
        if (daysSinceActivity > 30) inactivityLevel = 'frozen'
        else if (daysSinceActivity > 14) inactivityLevel = 'cold'
        else if (daysSinceActivity > 7) inactivityLevel = 'cooling'

        return {
          ...p,
          progress,
          checkedCount,
          daysSinceUpdate,
          daysSinceActivity,
          lastActivityType: lastAct?.type || null,
          lastActiveUser: lastAct?.authorName || null,
          healthBadge,
          inactivityLevel,
          usedAnalyzer: !!p.analyzerResults,
          usedCompetitors: (p.competitors?.length || 0) > 0,
          usedCalendar: (p.contentCalendar?.length || 0) > 0,
          usedMetrics: (p.metricsHistory?.length || 0) > 0,
          usedContentWriter: (p.contentHistory?.length || 0) > 0,
          usedSchema: (p.schemaHistory?.length || 0) > 0,
          memberCount: p.members?.length || p.memberIds?.length || 1,
        }
      })

      const staleProjects = projectHealth.filter(p => p.healthBadge === 'stale')
      const abandonedProjects = projectHealth.filter(p => p.healthBadge === 'abandoned')
      const stuckProjects = projectHealth.filter(p => p.healthBadge === 'stuck')
      const neverStartedProjects = projectHealth.filter(p => p.healthBadge === 'never-started')
      const thrivingProjects = projectHealth.filter(p => p.healthBadge === 'thriving')

      // ── 1d. Feature Usage Map (across all projects) ──
      const featureUsage = {
        analyzer: { used: allProjects.filter(p => p.analyzerResults).length, total: allProjects.length },
        contentWriter: { used: allProjects.filter(p => p.contentHistory?.length > 0).length, total: allProjects.length },
        competitors: { used: allProjects.filter(p => p.competitors?.length > 0).length, total: allProjects.length },
        metrics: { used: allProjects.filter(p => p.metricsHistory?.length > 0).length, total: allProjects.length },
        schema: { used: allProjects.filter(p => p.schemaHistory?.length > 0).length, total: allProjects.length },
        calendar: { used: allProjects.filter(p => p.contentCalendar?.length > 0).length, total: allProjects.length },
        export: { used: allActivities.filter(a => a.type === 'export_pdf' || a.type === 'export').length > 0 ? 1 : 0, total: allProjects.length },
        team: { used: allProjects.filter(p => (p.memberIds?.length || 0) > 1).length, total: allProjects.length },
      }
      // Add percentages
      for (const key of Object.keys(featureUsage)) {
        const f = featureUsage[key]
        f.pct = f.total > 0 ? Math.round((f.used / f.total) * 100) : 0
      }

      // ── 1e. Churn / User Journey Funnel ──
      const usersWithProjects = userHealth.filter(u => u.projectCount > 0).length
      const usersWithChecks = userHealth.filter(u => u.completionRate > 0).length
      const usersAbove25 = userHealth.filter(u => u.completionRate >= 25).length
      const usersAbove50 = userHealth.filter(u => u.completionRate >= 50).length
      const usersAbove75 = userHealth.filter(u => u.completionRate >= 75).length
      const usersWhoAnalyzed = userHealth.filter(u => u.features.analyzer).length
      const usersWhoUsedAdvanced = userHealth.filter(u =>
        u.features.contentWriter || u.features.schema || u.features.competitors
      ).length
      const retained7d = userHealth.filter(u => u.daysSinceLogin <= 7).length
      const retained30d = userHealth.filter(u => u.daysSinceLogin <= 30).length

      const churnFunnel = {
        signedUp: users.length,
        createdProject: usersWithProjects,
        startedChecklist: usersWithChecks,
        completed25pct: usersAbove25,
        completed50pct: usersAbove50,
        completed75pct: usersAbove75,
        usedAnalyzer: usersWhoAnalyzed,
        usedAdvancedFeature: usersWhoUsedAdvanced,
        retained7d,
        retained30d,
      }

      // ── Retention Cohorts (weekly, last 8 weeks) ──
      const retentionCohorts = []
      for (let w = 7; w >= 0; w--) {
        const cohortStart = new Date(now.getTime() - (w + 1) * 7 * DAY_MS)
        const cohortEnd = new Date(now.getTime() - w * 7 * DAY_MS)
        const cohortUsers = users.filter(u => {
          const d = parseDate(u.createdAt)
          return d && d >= cohortStart && d < cohortEnd
        })
        if (cohortUsers.length === 0) continue

        const weekLabel = cohortStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const retention = []
        for (let wk = 1; wk <= Math.min(8 - w, 8); wk++) {
          const checkDate = new Date(cohortEnd.getTime() + wk * 7 * DAY_MS)
          if (checkDate > now) break
          const retainedCount = cohortUsers.filter(u => {
            const lastLogin = parseDate(u.lastLoginAt)
            return lastLogin && lastLogin >= checkDate
          }).length
          retention.push({
            week: wk,
            retained: retainedCount,
            rate: Math.round((retainedCount / cohortUsers.length) * 100),
          })
        }

        retentionCohorts.push({
          weekLabel,
          cohortSize: cohortUsers.length,
          retention,
        })
      }

      // ── Drop-Off Analysis ──
      const dropOff = {
        neverCreatedProject: users.length - usersWithProjects,
        createdButNeverChecked: usersWithProjects - usersWithChecks,
        stuckPhase1: userHealth.filter(u => u.completionRate > 0 && u.completionRate < 15 && u.status !== 'active').length,
        stuckPhase2: userHealth.filter(u => u.completionRate >= 15 && u.completionRate < 25 && u.status !== 'active').length,
        stuckPhase3: userHealth.filter(u => u.completionRate >= 25 && u.completionRate < 50 && u.status !== 'active').length,
        stuckLate: userHealth.filter(u => u.completionRate >= 50 && u.completionRate < 75 && u.status !== 'active').length,
        completedButLeft: userHealth.filter(u => u.completionRate >= 75 && u.status !== 'active').length,
      }

      // ── Engagement Depth ──
      const engagementDepth = {
        signedUpOnly: userHealth.filter(u => u.activityCount === 0).length,
        light: userHealth.filter(u => u.activityCount >= 1 && u.activityCount <= 10).length,
        medium: userHealth.filter(u => u.activityCount > 10 && u.activityCount <= 50).length,
        heavy: userHealth.filter(u => u.activityCount > 50).length,
      }

      // ── Onboarding Time Metrics ──
      const onboardingTimes = { toProject: [], toFirstCheck: [], toAnalyzer: [] }
      for (const u of userHealth) {
        const signupDate = parseDate(u.createdAt)
        if (!signupDate) continue
        const uActivities = allActivities
          .filter(a => a.authorUid === u.id)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

        // Time to first check
        const firstCheck = uActivities.find(a => a.type === 'check')
        if (firstCheck) {
          onboardingTimes.toFirstCheck.push(daysBetween(new Date(firstCheck.timestamp), signupDate))
        }
        // Time to first analyzer
        const firstAnalyze = uActivities.find(a => a.type === 'analyze')
        if (firstAnalyze) {
          onboardingTimes.toAnalyzer.push(daysBetween(new Date(firstAnalyze.timestamp), signupDate))
        }
      }
      // Average helper
      const avg = arr => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null

      // ── Aggregate Intelligence ──
      const industries = {}
      const cmsPlatforms = {}
      const analyzerScores = []
      for (const p of allProjects) {
        if (p.questionnaire?.industry) {
          industries[p.questionnaire.industry] = (industries[p.questionnaire.industry] || 0) + 1
        }
        if (p.questionnaire?.cms) {
          cmsPlatforms[p.questionnaire.cms] = (cmsPlatforms[p.questionnaire.cms] || 0) + 1
        }
        if (p.analyzerResults?.overallScore) {
          analyzerScores.push(p.analyzerResults.overallScore)
        }
      }

      // ── Churn Trend (30 days, daily: new vs churned) ──
      const churnTrend = []
      for (let i = 29; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        const dayEnd = new Date(dayStart.getTime() + DAY_MS)
        const newCount = users.filter(u => {
          const d = parseDate(u.createdAt)
          return d && d >= dayStart && d < dayEnd
        }).length
        // "Churned" on a day = users whose last login was on that day and haven't returned in 30 days
        // Simplified: users who last logged in exactly 30 days before that day
        const churnedCount = users.filter(u => {
          const d = parseDate(u.lastLoginAt)
          if (!d) return false
          const daysSince = daysBetween(now, d)
          return daysSince >= 30 && d >= dayStart && d < dayEnd
        }).length
        churnTrend.push({
          date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          new: newCount,
          churned: churnedCount,
          net: newCount - churnedCount,
        })
      }

      // ── API Usage (from activity events) ──
      const apiActivityTypes = ['analyze', 'contentWrite', 'generateFix', 'monitor', 'competitor_analyze', 'schemaGenerate', 'briefGenerate']
      const apiUsageToday = allActivities.filter(a => {
        const d = a.timestamp ? new Date(a.timestamp) : null
        return d && d >= todayStart && apiActivityTypes.includes(a.type)
      }).length
      const apiUsageThisWeek = allActivities.filter(a => {
        const d = a.timestamp ? new Date(a.timestamp) : null
        return d && d >= weekAgo && apiActivityTypes.includes(a.type)
      }).length

      // ── Alerts (things that need attention) ──
      const alerts = []
      if (atRiskUsers.length > 0) {
        alerts.push({ type: 'warning', icon: 'users', message: `${atRiskUsers.length} user${atRiskUsers.length > 1 ? 's' : ''} at risk (inactive 7-14 days)`, link: 'users' })
      }
      if (dormantUsers.length > 0) {
        alerts.push({ type: 'warning', icon: 'users', message: `${dormantUsers.length} dormant user${dormantUsers.length > 1 ? 's' : ''} (inactive 14-30 days)`, link: 'users' })
      }
      if (churnedUsers.length > 0) {
        alerts.push({ type: 'error', icon: 'users', message: `${churnedUsers.length} churned user${churnedUsers.length > 1 ? 's' : ''} (30+ days)`, link: 'churn' })
      }
      if (abandonedProjects.length > 0) {
        alerts.push({ type: 'error', icon: 'projects', message: `${abandonedProjects.length} abandoned project${abandonedProjects.length > 1 ? 's' : ''}`, link: 'projects' })
      }
      if (stuckProjects.length > 0) {
        alerts.push({ type: 'warning', icon: 'projects', message: `${stuckProjects.length} stuck project${stuckProjects.length > 1 ? 's' : ''} (no progress 14+ days)`, link: 'projects' })
      }
      if (feedbackNew > 0) {
        alerts.push({ type: 'info', icon: 'feedback', message: `${feedbackNew} unreviewed feedback item${feedbackNew > 1 ? 's' : ''}`, link: 'feedback' })
      }
      if (waitlistThisWeek > 0) {
        alerts.push({ type: 'info', icon: 'waitlist', message: `${waitlistThisWeek} new waitlist signup${waitlistThisWeek > 1 ? 's' : ''} this week`, link: 'waitlist' })
      }

      // ── "Needs Attention" lists (users & projects cold 14+ days) ──
      const coldUsers = userHealth
        .filter(u => u.daysSinceActivity >= 14 && u.status !== 'churned')
        .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity)

      const coldProjects = projectHealth
        .filter(p => p.daysSinceActivity >= 14 && p.healthBadge !== 'abandoned' && p.healthBadge !== 'never-started')
        .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity)

      setStats({
        users,
        totalUsers: users.length,
        activeToday,
        activeThisWeek,
        signupsThisWeek,
        signupsThisMonth,

        projects: allProjects,
        totalProjects: allProjects.length,
        activeProjects,
        totalTasks,
        completedTasks,
        projectsByUser,

        recentActivity,
        recentSignups,

        // Waitlist
        waitlistEntries,
        waitlistTotal,
        waitlistThisWeek,
        waitlistToday,

        // Feedback
        feedbackEntries,
        feedbackTotal,
        feedbackNew,
        feedbackThisWeek,

        // Trends
        signupTrend,
        waitlistTrend,
        activityTrend,

        // ── Deep Analytics (NEW) ──

        // User health
        userHealth,
        activeUsers,
        atRiskUsers,
        dormantUsers,
        churnedUsers,

        // Checklist stuck-point heatmap data
        itemCompletionMap,
        totalProjectsWithChecks,

        // Project health
        projectHealth,
        staleProjects,
        abandonedProjects,
        stuckProjects,
        neverStartedProjects,
        thrivingProjects,

        // Feature usage
        featureUsage,

        // Churn funnel
        churnFunnel,
        retentionCohorts,
        dropOff,
        churnTrend,

        // Engagement
        engagementDepth,

        // Onboarding times
        onboardingTimes: {
          avgToFirstCheck: avg(onboardingTimes.toFirstCheck),
          avgToAnalyzer: avg(onboardingTimes.toAnalyzer),
          rawToFirstCheck: onboardingTimes.toFirstCheck,
          rawToAnalyzer: onboardingTimes.toAnalyzer,
        },

        // Intelligence
        topIndustries: Object.entries(industries).sort((a, b) => b[1] - a[1]).slice(0, 10),
        topCms: Object.entries(cmsPlatforms).sort((a, b) => b[1] - a[1]).slice(0, 10),
        avgAnalyzerScore: avg(analyzerScores),

        // API usage
        apiUsageToday,
        apiUsageThisWeek,

        // Alerts
        alerts,

        // Needs attention
        coldUsers,
        coldProjects,

        fullAccess,
        lastUpdated: new Date(),
      })
    } catch (err) {
      logger.error('Admin stats fetch error:', err)
      setError(err.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.uid])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, permissionWarning, refresh: fetchStats }
}
