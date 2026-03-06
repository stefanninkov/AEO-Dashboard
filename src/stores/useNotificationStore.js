import { create } from 'zustand'

/**
 * useNotificationStore — notification state
 *
 * This store mirrors the existing useNotifications hook.
 * New components can read notification state from this store directly.
 *
 * Also manages toast notifications (ephemeral UI messages).
 */
export const useNotificationStore = create((set, get) => ({
  // ── Project notifications (synced from useNotifications hook) ──
  notifications: [],
  unreadCount: 0,

  // Sync actions (called by useNotifications hook)
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),

  // ── Toast notifications (ephemeral UI messages) ──
  toasts: [],

  addToast: (message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }))
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
    return id
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}))

/**
 * Convenience functions for toast types
 */
export const toast = {
  success: (message, duration) =>
    useNotificationStore.getState().addToast(message, 'success', duration),
  error: (message, duration) =>
    useNotificationStore.getState().addToast(message, 'error', duration),
  warning: (message, duration) =>
    useNotificationStore.getState().addToast(message, 'warning', duration),
  info: (message, duration) =>
    useNotificationStore.getState().addToast(message, 'info', duration),
}
