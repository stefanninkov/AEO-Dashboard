import { useState, useEffect, useRef, useCallback } from 'react'

const HEARTBEAT_INTERVAL = 15000 // 15s
const STALE_THRESHOLD = 45000    // 45s — consider offline after 3 missed heartbeats

/**
 * Dev mode detection — same pattern as useAuth.js / useFirestoreProjects.js
 */
const isFirebaseConfigured = (() => {
  try {
    const key = import.meta.env.VITE_FIREBASE_API_KEY || ''
    return key.length > 0 && !key.startsWith('YOUR_')
  } catch {
    return false
  }
})()

/**
 * usePresence — tracks which team members are currently online for a project.
 *
 * Returns:
 *   onlineMembers: [{ uid, displayName, email, activeView, lastSeen }]
 *
 * Uses project.presence field (Firestore) or localStorage (dev mode).
 * Each user sends a heartbeat every 15s. Members missing 3+ heartbeats are pruned.
 */
export function usePresence({ user, activeProject, activeView, updateProject }) {
  const [onlineMembers, setOnlineMembers] = useState([])
  const heartbeatRef = useRef(null)
  const projectIdRef = useRef(null)

  const projectId = activeProject?.id
  const presenceData = activeProject?.presence

  // Build current user's presence entry
  const buildEntry = useCallback(() => ({
    uid: user?.uid,
    displayName: user?.displayName || user?.email || 'Unknown',
    email: user?.email || '',
    activeView: activeView || 'dashboard',
    lastSeen: new Date().toISOString(),
  }), [user?.uid, user?.displayName, user?.email, activeView])

  // Write heartbeat
  const sendHeartbeat = useCallback(() => {
    if (!user?.uid || !projectId || !updateProject) return

    if (isFirebaseConfigured) {
      // Firestore: update presence field on project doc
      const currentPresence = presenceData || {}
      const now = Date.now()

      // Prune stale entries while updating
      const cleaned = {}
      Object.entries(currentPresence).forEach(([uid, entry]) => {
        if (uid === user.uid) return // will re-add below
        const lastSeen = new Date(entry.lastSeen).getTime()
        if (now - lastSeen < STALE_THRESHOLD) {
          cleaned[uid] = entry
        }
      })

      cleaned[user.uid] = buildEntry()
      updateProject(projectId, { presence: cleaned })
    } else {
      // Dev mode: localStorage
      const key = `aeo-presence-${projectId}`
      const raw = localStorage.getItem(key)
      const current = raw ? JSON.parse(raw) : {}
      const now = Date.now()

      const cleaned = {}
      Object.entries(current).forEach(([uid, entry]) => {
        if (uid === user.uid) return
        const lastSeen = new Date(entry.lastSeen).getTime()
        if (now - lastSeen < STALE_THRESHOLD) {
          cleaned[uid] = entry
        }
      })

      cleaned[user.uid] = buildEntry()
      localStorage.setItem(key, JSON.stringify(cleaned))
    }
  }, [user?.uid, projectId, updateProject, presenceData, buildEntry])

  // Read presence and update onlineMembers
  const readPresence = useCallback(() => {
    if (!projectId) { setOnlineMembers([]); return }

    const now = Date.now()
    let presenceMap = {}

    if (isFirebaseConfigured) {
      presenceMap = presenceData || {}
    } else {
      const key = `aeo-presence-${projectId}`
      const raw = localStorage.getItem(key)
      presenceMap = raw ? JSON.parse(raw) : {}
    }

    const members = Object.values(presenceMap).filter(entry => {
      const lastSeen = new Date(entry.lastSeen).getTime()
      return now - lastSeen < STALE_THRESHOLD
    })

    setOnlineMembers(members)
  }, [projectId, presenceData])

  // Start/stop heartbeat when project changes
  useEffect(() => {
    if (!user?.uid || !projectId) {
      setOnlineMembers([])
      return
    }

    // Immediate heartbeat on mount / project change
    sendHeartbeat()
    readPresence()

    // Periodic heartbeat
    heartbeatRef.current = setInterval(() => {
      sendHeartbeat()
      if (!isFirebaseConfigured) readPresence() // dev mode: poll reads too
    }, HEARTBEAT_INTERVAL)

    projectIdRef.current = projectId

    return () => {
      clearInterval(heartbeatRef.current)
      // Remove self from presence on unmount
      if (isFirebaseConfigured && updateProject && projectIdRef.current) {
        const cleaned = { ...(presenceData || {}) }
        delete cleaned[user.uid]
        updateProject(projectIdRef.current, { presence: cleaned })
      } else if (projectIdRef.current) {
        const key = `aeo-presence-${projectIdRef.current}`
        const raw = localStorage.getItem(key)
        if (raw) {
          const current = JSON.parse(raw)
          delete current[user?.uid]
          localStorage.setItem(key, JSON.stringify(current))
        }
      }
    }
  }, [user?.uid, projectId])

  // Re-read presence when Firestore data changes (real-time via onSnapshot)
  useEffect(() => {
    if (isFirebaseConfigured) {
      readPresence()
    }
  }, [presenceData, readPresence])

  // Update heartbeat when activeView changes
  useEffect(() => {
    if (user?.uid && projectId) {
      sendHeartbeat()
    }
  }, [activeView])

  return { onlineMembers }
}
