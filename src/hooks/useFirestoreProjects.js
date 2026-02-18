import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useLocalStorage } from './useLocalStorage'
import logger from '../utils/logger'

/*
 * Dev mode detection — matches useAuth.js
 * Falls back to localStorage when Firebase isn't configured.
 */
const isFirebaseConfigured = (() => {
  try {
    const key = import.meta.env.VITE_FIREBASE_API_KEY || ''
    return key.length > 0 && !key.startsWith('YOUR_')
  } catch {
    return false
  }
})()

const DEFAULT_PROJECT_DATA = {
  name: 'My First Project',
  url: '',
  webflowSiteId: '',
  checked: {},
  verifications: {},
  assignments: {},
  comments: {},
  notifications: {},
  analyzerResults: null,
  analyzerFixes: {},
  pageAnalyses: {},
  pageAnalyzerFixes: {},
  contentCalendar: [],
  contentBriefs: [],
  contentHistory: [],
  schemaHistory: [],
  queryTracker: [],
  monitorHistory: [],
  lastMonitorRun: null,
  metricsHistory: [],
  lastMetricsRun: null,
  notes: '',
  competitors: [],
  competitorAnalysis: null,
  lastCompetitorRun: null,
  competitorMonitorHistory: [],
  lastCompetitorMonitorRun: null,
  competitorAlerts: [],
  citationShareHistory: [],
  lastCitationShareRun: null,
  questionnaire: {
    industry: null,
    industryOther: '',
    region: null,
    countries: [],
    audience: null,
    language: 'en',
    languages: ['en'],
    targetEngines: [],
    primaryGoal: null,
    maturity: null,
    contentType: null,
    hasSchema: null,
    updateCadence: null,
    businessDescription: '',
    topServices: '',
    cms: null,
    completedAt: null,
  },
  settings: {
    monitoringEnabled: false,
    monitoringInterval: '7d',
    notifyOnScoreChange: false,
    notifyThreshold: 10,
    digestEnabled: false,
    digestInterval: 'weekly',
    digestEmail: '',
    digestIncludeMetrics: true,
    digestIncludeAlerts: true,
    digestIncludeRecommendations: true,
    lastDigestSent: null,
    competitorMonitorEnabled: false,
    competitorMonitorInterval: '7d',
    brandMonitorEnabled: false,
    brandMonitorInterval: '7d',
    competitorAlertThreshold: 15,
  },
  webhooks: [],
}

/* ── localStorage Projects (Dev Mode) ── */
function useLocalProjects(user) {
  const userId = user?.uid
  const storageKey = userId ? `aeo-projects-${userId}` : 'aeo-projects'
  const [projects, setProjects] = useLocalStorage(storageKey, [])
  const [activeProjectId, setActiveProjectId] = useLocalStorage(`${storageKey}-active`, null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null

  const createProject = useCallback(async (name, url = '') => {
    const now = new Date().toISOString()
    const newProject = {
      id: crypto.randomUUID(),
      ...DEFAULT_PROJECT_DATA,
      name,
      url,
      ownerId: userId,
      memberIds: [userId],
      members: [{
        uid: userId,
        email: user?.email || '',
        displayName: user?.displayName || '',
        role: 'admin',
        addedAt: now,
      }],
      invitations: [],
      createdAt: now,
      updatedAt: now,
    }
    setProjects(prev => [newProject, ...prev])
    setActiveProjectId(newProject.id)
    return newProject
  }, [setProjects, setActiveProjectId, userId, user?.email, user?.displayName])

  const updateProject = useCallback(async (id, updates) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ))
  }, [setProjects])

  const deleteProject = useCallback(async (id) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id)
      return filtered
    })
    if (activeProjectId === id) {
      setProjects(prev => {
        setActiveProjectId(prev[0]?.id || null)
        return prev
      })
    }
  }, [setProjects, activeProjectId, setActiveProjectId])

  const renameProject = useCallback(async (id, newName) => {
    await updateProject(id, { name: newName })
  }, [updateProject])

  const toggleCheckItem = useCallback(async (itemId) => {
    if (!activeProject) return
    const newChecked = { ...activeProject.checked, [itemId]: !activeProject.checked?.[itemId] }
    await updateProject(activeProject.id, { checked: newChecked })
  }, [activeProject, updateProject])

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    deleteProject,
    renameProject,
    updateProject,
    toggleCheckItem,
    loading,
    firestoreError: null,
  }
}

/* ── Firestore Projects (Production) ── */
/*
 * Dual-path strategy:
 *   OLD path: users/{uid}/projects/{projectId}  — where existing data lives
 *   NEW path: projects/{projectId} with memberIds — for team collaboration
 *
 * We listen to BOTH paths, merge the results, and tag each project with
 * `_path: 'legacy' | 'shared'` so CRUD operations target the right collection.
 * New projects are created at the OLD path (security rules already allow it).
 */
function useFirestoreProjectsImpl(user) {
  const userId = user?.uid
  const [legacyProjects, setLegacyProjects] = useState([])
  const [sharedProjects, setSharedProjects] = useState([])
  const [legacyLoaded, setLegacyLoaded] = useState(false)
  const [sharedLoaded, setSharedLoaded] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState(null)

  const [firestoreError, setFirestoreError] = useState(null)

  const loading = !legacyLoaded || !sharedLoaded

  // ── Listener 1: Legacy path (users/{uid}/projects) ──
  useEffect(() => {
    if (!userId) {
      setLegacyProjects([])
      setLegacyLoaded(true)
      return
    }

    setLegacyLoaded(false)

    const legacyRef = collection(db, 'users', userId, 'projects')

    const timeoutId = setTimeout(() => setLegacyLoaded(true), 5000)

    const unsubscribe = onSnapshot(legacyRef, (snapshot) => {
      clearTimeout(timeoutId)
      setFirestoreError(null)
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        _path: 'legacy',
      }))
      setLegacyProjects(list)
      setLegacyLoaded(true)
    }, (err) => {
      clearTimeout(timeoutId)
      logger.error('Legacy projects listener error:', err)
      setFirestoreError(err.code === 'permission-denied' ? 'permission' : 'connection')
      setLegacyLoaded(true)
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [userId])

  // ── Listener 2: Shared/team path (top-level projects collection) ──
  useEffect(() => {
    if (!userId) {
      setSharedProjects([])
      setSharedLoaded(true)
      return
    }

    setSharedLoaded(false)

    const sharedRef = collection(db, 'projects')
    const q = query(sharedRef, where('memberIds', 'array-contains', userId))

    const timeoutId = setTimeout(() => setSharedLoaded(true), 5000)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeoutId)
      setFirestoreError(null)
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        _path: 'shared',
      }))
      setSharedProjects(list)
      setSharedLoaded(true)
    }, (err) => {
      clearTimeout(timeoutId)
      // Shared collection may not exist yet or rules may block — that's OK
      logger.error('Shared projects listener error:', err)
      if (err.code !== 'permission-denied') {
        setFirestoreError('connection')
      }
      setSharedProjects([])
      setSharedLoaded(true)
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [userId])

  // ── Merge & deduplicate (shared wins if same id exists in both) ──
  const projects = useMemo(() => {
    const sharedIds = new Set(sharedProjects.map(p => p.id))
    const merged = [
      ...sharedProjects,
      ...legacyProjects.filter(p => !sharedIds.has(p.id)),
    ]
    return merged.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
  }, [legacyProjects, sharedProjects])

  // ── Set / fix active project when list changes ──
  useEffect(() => {
    if (loading) return
    if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id)
    }
    if (activeProjectId && !projects.find(p => p.id === activeProjectId)) {
      setActiveProjectId(projects[0]?.id || null)
    }
  }, [loading, projects, activeProjectId])

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null

  // ── Helper: resolve Firestore doc ref for a project ──
  const getProjectRef = useCallback((id) => {
    const project = projects.find(p => p.id === id)
    if (project?._path === 'shared') {
      return doc(db, 'projects', id)
    }
    // Default to legacy path
    return doc(db, 'users', userId, 'projects', id)
  }, [projects, userId])

  const createProject = useCallback(async (name, url = '') => {
    if (!userId) return null
    const now = new Date().toISOString()
    const projectData = {
      ...DEFAULT_PROJECT_DATA,
      name,
      url,
      ownerId: userId,
      memberIds: [userId],
      members: [{
        uid: userId,
        email: user?.email || '',
        displayName: user?.displayName || '',
        role: 'admin',
        addedAt: now,
      }],
      invitations: [],
      createdAt: now,
      updatedAt: now,
    }
    try {
      // Write to legacy path (security rules allow it)
      const legacyRef = collection(db, 'users', userId, 'projects')
      const docRef = await addDoc(legacyRef, projectData)
      setActiveProjectId(docRef.id)
      return { id: docRef.id, ...projectData }
    } catch (err) {
      logger.error('Create project error:', err)
      return null
    }
  }, [userId, user?.email, user?.displayName])

  const updateProject = useCallback(async (id, updates) => {
    if (!userId || !id) return
    try {
      const projectRef = getProjectRef(id)
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      logger.error('Update project error:', err)
    }
  }, [userId, getProjectRef])

  const deleteProject = useCallback(async (id) => {
    if (!userId || !id) return
    try {
      const projectRef = getProjectRef(id)
      await deleteDoc(projectRef)
    } catch (err) {
      logger.error('Delete project error:', err)
    }
  }, [userId, getProjectRef])

  const renameProject = useCallback(async (id, newName) => {
    await updateProject(id, { name: newName })
  }, [updateProject])

  const toggleCheckItem = useCallback(async (itemId) => {
    if (!activeProject) return
    const newChecked = { ...activeProject.checked, [itemId]: !activeProject.checked?.[itemId] }
    await updateProject(activeProject.id, { checked: newChecked })
  }, [activeProject, updateProject])

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    deleteProject,
    renameProject,
    updateProject,
    toggleCheckItem,
    loading,
    firestoreError,
  }
}

/* ── Export: auto-select based on config ── */
// isFirebaseConfigured is a module-level constant (never changes at runtime),
// so this conditional hook call is safe and won't violate Rules of Hooks.
export function useFirestoreProjects(user) {
  if (isFirebaseConfigured) {
    return useFirestoreProjectsImpl(user)
  }
  return useLocalProjects(user)
}
