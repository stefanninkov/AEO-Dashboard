import { create } from 'zustand'

/**
 * useAuthStore — auth state (user, loading, error)
 *
 * This store is populated by the existing useAuth() hook.
 * Components can read auth state from either the hook or this store.
 * The hook remains the source of truth and syncs into the store.
 */
export const useAuthStore = create((set, get) => ({
  // ── User state ──
  user: null,
  loading: true,
  error: null,

  // ── Actions (called by useAuth hook to sync) ──
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ── Derived ──
  isAuthenticated: () => !!get().user,
}))

/**
 * Sync hook — call this inside your useAuth() wrapper to keep the store in sync.
 * Example: useAuthStoreSync(user, loading, error)
 */
export function syncAuthStore(user, loading, error) {
  const store = useAuthStore.getState()
  if (store.user !== user) store.setUser(user)
  if (store.loading !== loading) store.setLoading(loading)
  if (store.error !== error) store.setError(error)
}
