import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase'
import logger from '../../utils/logger'

/**
 * Fetches platform-wide stats for the admin dashboard.
 * Queries:
 *   - users collection (all user profiles)
 *   - users/{uid}/projects subcollections (legacy projects)
 *   - projects collection (shared/team projects)
 */
export function useAdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Fetch all users
      const usersSnap = await getDocs(collection(db, 'users'))
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      // 2. Fetch legacy projects for each user (users/{uid}/projects)
      const allProjects = []
      const projectsByUser = {}

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
          // May fail for some users due to security rules — skip
          logger.error(`Failed to fetch projects for user ${user.id}:`, err)
        }
      }

      // 3. Also fetch shared/team projects (top-level collection)
      try {
        const sharedSnap = await getDocs(collection(db, 'projects'))
        const sharedProjects = sharedSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          _path: 'shared',
        }))
        // Add shared projects that aren't already in legacy list
        const legacyIds = new Set(allProjects.map(p => p.id))
        for (const sp of sharedProjects) {
          if (!legacyIds.has(sp.id)) {
            // Find owner info
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

      // 4. Compute stats
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

      // Active users (by lastLoginAt)
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

      // Project stats
      let activeProjects = 0
      let totalTasks = 0
      let completedTasks = 0

      for (const project of allProjects) {
        const updatedAt = parseDate(project.updatedAt)
        if (updatedAt && updatedAt >= weekAgo) activeProjects++

        // Count checked items
        if (project.checked && typeof project.checked === 'object') {
          const entries = Object.entries(project.checked)
          totalTasks += entries.length
          completedTasks += entries.filter(([, v]) => v).length
        }
      }

      // Recent activity — collect from all projects' activityLog
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
      // Sort by timestamp desc, take latest 50
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

        lastUpdated: new Date(),
      })
    } catch (err) {
      logger.error('Admin stats fetch error:', err)
      setError(err.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refresh: fetchStats }
}
