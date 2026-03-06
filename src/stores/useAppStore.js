import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useAppStore — global app state
 *
 * Manages: active view, sidebar, modals, date range, refreshing state.
 * Theme is still managed by ThemeContext (View Transition API needs React context).
 */
export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Navigation ──
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),

      // ── Sidebar ──
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),

      // ── Date range (for metrics) ──
      dateRange: '7d',
      setDateRange: (range) => set({ dateRange: range }),

      // ── Refreshing state ──
      refreshing: false,
      setRefreshing: (val) => set({ refreshing: val }),

      // ── Splash screen ──
      splashVisible: true,
      hideSplash: () => set({ splashVisible: false }),

      // ── Doc overlay ──
      docItem: null,
      overlayClosing: false,
      setDocItem: (item) => set({ docItem: item, overlayClosing: false }),
      closeOverlay: () => set({ overlayClosing: true }),
      clearOverlay: () => set({ docItem: null, overlayClosing: false }),

      // ── Onboarding ──
      showOnboarding: localStorage.getItem('aeo-onboarding-completed') !== 'true',
      completeOnboarding: () => set({ showOnboarding: false }),
    }),
    {
      name: 'aeo-app-store',
      // Only persist specific fields
      partialize: (state) => ({
        dateRange: state.dateRange,
      }),
    }
  )
)
