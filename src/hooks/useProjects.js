import { useLocalStorage } from './useLocalStorage'
import { useCallback } from 'react'

const DEFAULT_PROJECT = {
  id: 'default',
  name: 'My First Project',
  url: '',
  webflowSiteId: '',
  checked: {},
  verifications: {},
  analyzerResults: null,
  queryTracker: [],
  monitorHistory: [],
  lastMonitorRun: null,
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export function useProjects() {
  const [projects, setProjects] = useLocalStorage('aeo-projects', [DEFAULT_PROJECT])
  const [activeProjectId, setActiveProjectId] = useLocalStorage('aeo-active-project', 'default')

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0]

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ))
  }, [setProjects])

  const createProject = useCallback((name, url = '') => {
    const newProject = {
      id: crypto.randomUUID(),
      name,
      url,
      webflowSiteId: '',
      checked: {},
      analyzerResults: null,
      queryTracker: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProjects(prev => [...prev, newProject])
    setActiveProjectId(newProject.id)
    return newProject
  }, [setProjects, setActiveProjectId])

  const deleteProject = useCallback((id) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id)
      if (filtered.length === 0) {
        return [{ ...DEFAULT_PROJECT, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
      }
      return filtered
    })
    if (activeProjectId === id) {
      setProjects(prev => {
        setActiveProjectId(prev[0]?.id || 'default')
        return prev
      })
    }
  }, [setProjects, activeProjectId, setActiveProjectId])

  const renameProject = useCallback((id, newName) => {
    updateProject(id, { name: newName })
  }, [updateProject])

  const toggleCheckItem = useCallback((itemId) => {
    if (!activeProject) return
    const newChecked = { ...activeProject.checked, [itemId]: !activeProject.checked[itemId] }
    updateProject(activeProject.id, { checked: newChecked })
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
  }
}
