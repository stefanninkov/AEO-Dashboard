import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

const TOAST_ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

const MAX_TOASTS = 3
const AUTO_DISMISS_MS = 3000

let toastCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timersRef.current[id])
    delete timersRef.current[id]
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    timersRef.current[`exit-${id}`] = setTimeout(() => removeToast(id), 200)
  }, [removeToast])

  const addToast = useCallback((type, message) => {
    const id = ++toastCounter

    setToasts(prev => {
      let next = [...prev, { id, type, message, exiting: false }]
      // Enforce max — dismiss oldest if over limit
      while (next.filter(t => !t.exiting).length > MAX_TOASTS) {
        const oldest = next.find(t => !t.exiting)
        if (oldest) {
          next = next.map(t => t.id === oldest.id ? { ...t, exiting: true } : t)
          timersRef.current[`exit-${oldest.id}`] = setTimeout(() => removeToast(oldest.id), 200)
        }
      }
      return next
    })

    // Auto-dismiss
    timersRef.current[id] = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)

    return id
  }, [dismissToast, removeToast])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div className="toast-container" aria-live="polite" role="status">
          {toasts.map(toast => {
            const Icon = TOAST_ICONS[toast.type] || Info
            return (
              <div
                key={toast.id}
                className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exiting' : 'toast-entering'}`}
              >
                <div className="toast-color-bar" />
                <Icon size={16} className="toast-icon" style={{ flexShrink: 0 }} />
                <span className="toast-message">{toast.message}</span>
                <button className="toast-close" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">
                  <X size={12} />
                </button>
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return no-op if used outside provider (safety)
    return { addToast: () => {} }
  }
  return context
}
