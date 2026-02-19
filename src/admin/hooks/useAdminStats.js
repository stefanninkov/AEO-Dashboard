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
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const parseDate = (d) => {
        if (!d) return null
        if (d.toDate) return d.toDate() // Firestore Timestamp
        if (typeof d === 'string') return new Date(d)
        return null
      }

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
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
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
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
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
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        const count = allActivities.filter(a => {
          const d = a.timestamp ? new Date(a.timestamp) : null
          return d && d >= dayStart && d < dayEnd
        }).length
        activityTrend.push({
          date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count,
        })
      }

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
