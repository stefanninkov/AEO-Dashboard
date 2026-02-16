import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
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
  analyzerResults: null,
  queryTracker: [],
  monitorHistory: [],
  lastMonitorRun: null,
  metricsHistory: [],
  lastMetricsRun: null,
  notes: '',
  competitors: [],
  competitorAnalysis: null,
  lastCompetitorRun: null,
  questionnaire: {
    industry: null,
    industryOther: '',
    region: null,
    audience: null,
    language: 'en',
    targetEngines: [],
    primaryGoal: null,
    maturity: null,
    contentType: null,
    hasSchema: null,
    updateCadence: null,
    completedAt: null,
  },
  settings: {
    monitoringEnabled: false,
    monitoringInterval: '7d',
    notifyOnScoreChange: false,
    notifyThreshold: 10,
  },
}

/* ── localStorage Projects (Dev Mode) ── */
function useLocalProjects(userId) {
  const storageKey = userId ? `aeo-projects-${userId}` : 'aeo-projects'
  const [projects, setProjects] = useLocalStorage(storageKey, [])
  const [activeProjectId, setActiveProjectId] = useLocalStorage(`${storageKey}-active`, null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null

  const createProject = useCallback(async (name, url = '') => {
    const newProject = {
      id: crypto.randomUUID(),
      ...DEFAULT_PROJECT_DATA,
      name,
      url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProjects(prev => [newProject, ...prev])
    setActiveProjectId(newProject.id)
    return newProject
  }, [setProjects, setActiveProjectId])

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
  }
}

/* ── Firestore Projects (Production) ── */
function useFirestoreProjectsImpl(userId) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [didAutoCreate, setDidAutoCreate] = useState(false)

  // Real-time listener for user's projects
  useEffect(() => {
    if (!userId) {
      setProjects([])
      setLoading(false)
      return
    }

    setLoading(true)
    let didSetLoading = false

    const projectsRef = collection(db, 'users', userId, 'projects')
    // No orderBy — avoids requiring a Firestore composite index.
    // We sort client-side instead.
    const q = query(projectsRef)

    // Safety timeout: if Firestore hasn't responded in 5 seconds, stop loading
    const timeoutId = setTimeout(() => {
      if (!didSetLoading) {
        didSetLoading = true
        setLoading(false)
      }
    }, 5000)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeoutId)
      didSetLoading = true

      const projectList = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })

      setProjects(projectList)

      // Set active project if none selected
      if (projectList.length > 0 && !activeProjectId) {
        setActiveProjectId(projectList[0].id)
      }

      // If active project was deleted, switch to first
      if (activeProjectId && !projectList.find(p => p.id === activeProjectId)) {
        setActiveProjectId(projectList[0]?.id || null)
      }

      setLoading(false)
    }, (err) => {
      clearTimeout(timeoutId)
      didSetLoading = true
      logger.error('Firestore projects error:', err)
      setLoading(false)
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [userId])

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null

  const createProject = useCallback(async (name, url = '') => {
    if (!userId) return null
    const projectData = {
      ...DEFAULT_PROJECT_DATA,
      name,
      url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    try {
      const projectsRef = collection(db, 'users', userId, 'projects')
      const docRef = await addDoc(projectsRef, projectData)
      setActiveProjectId(docRef.id)
      return { id: docRef.id, ...projectData }
    } catch (err) {
      logger.error('Create project error:', err)
      return null
    }
  }, [userId])

  const updateProject = useCallback(async (id, updates) => {
    if (!userId || !id) return
    try {
      const projectRef = doc(db, 'users', userId, 'projects', id)
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      logger.error('Update project error:', err)
    }
  }, [userId])

  const deleteProject = useCallback(async (id) => {
    if (!userId || !id) return
    try {
      const projectRef = doc(db, 'users', userId, 'projects', id)
      await deleteDoc(projectRef)
    } catch (err) {
      logger.error('Delete project error:', err)
    }
  }, [userId])

  const renameProject = useCallback(async (id, newName) => {
    await updateProject(id, { name: newName })
  }, [updateProject])

  const toggleCheckItem = useCallback(async (itemId) => {
    if (!activeProject) return
    const newChecked = { ...activeProject.checked, [itemId]: !activeProject.checked?.[itemId] }
    await updateProject(activeProject.id, { checked: newChecked })
  }, [activeProject, updateProject])

  // Auto-create a default project for new users with no projects
  useEffect(() => {
    if (!loading && !didAutoCreate && projects.length === 0 && userId) {
      setDidAutoCreate(true)
      createProject('My First Project', '')
    }
  }, [loading, projects.length, userId, didAutoCreate, createProject])

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
  }
}

/* ── Export: auto-select based on config ── */
// isFirebaseConfigured is a module-level constant (never changes at runtime),
// so this conditional hook call is safe and won't violate Rules of Hooks.
export function useFirestoreProjects(userId) {
  if (isFirebaseConfigured) {
    return useFirestoreProjectsImpl(userId)
  }
  return useLocalProjects(userId)
}
