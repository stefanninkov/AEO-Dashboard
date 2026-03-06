import { create } from 'zustand'

/**
 * useProjectStore — project state
 *
 * This store is populated by the existing useFirestoreProjects() hook.
 * New components can read project state from this store directly.
 * The hook remains the source of truth and syncs into the store.
 */
export const useProjectStore = create((set, get) => ({
  // ── Projects list ──
  projects: [],
  activeProjectId: null,
  loading: true,
  firestoreError: null,

  // ── Actions (called by useFirestoreProjects hook to sync) ──
  setProjects: (projects) => set({ projects }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setLoading: (loading) => set({ loading }),
  setFirestoreError: (error) => set({ firestoreError: error }),

  // ── Derived ──
  getActiveProject: () => {
    const { projects, activeProjectId } = get()
    return projects.find((p) => p.id === activeProjectId) || projects[0] || null
  },

  // ── Score history (new feature — Phase 1.3) ──
  scoreHistory: {},
  addScoreSnapshot: (projectId, snapshot) =>
    set((state) => ({
      scoreHistory: {
        ...state.scoreHistory,
        [projectId]: [
          ...(state.scoreHistory[projectId] || []),
          { ...snapshot, timestamp: new Date().toISOString() },
        ].slice(-100), // Keep last 100 snapshots
      },
    })),

  // ── Competitor cache (new feature — Phase 1.4) ──
  competitorCache: {},
  setCompetitorCache: (projectId, data) =>
    set((state) => ({
      competitorCache: {
        ...state.competitorCache,
        [projectId]: { data, updatedAt: new Date().toISOString() },
      },
    })),
}))

/**
 * Sync function — called by useFirestoreProjects hook to keep store in sync.
 */
export function syncProjectStore(projects, activeProjectId, loading, firestoreError) {
  const store = useProjectStore.getState()
  if (store.projects !== projects) store.setProjects(projects)
  if (store.activeProjectId !== activeProjectId) store.setActiveProjectId(activeProjectId)
  if (store.loading !== loading) store.setLoading(loading)
  if (store.firestoreError !== firestoreError) store.setFirestoreError(firestoreError)
}
