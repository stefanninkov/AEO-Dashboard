/**
 * errorTracking.js — Sentry-compatible error tracking abstraction.
 *
 * Provides a thin wrapper that works with or without @sentry/react.
 * When Sentry is not installed, errors are logged to console.
 * When installed, uses Sentry's full capture and context APIs.
 *
 * Usage:
 *   import { initErrorTracking, captureError, setUser } from './errorTracking'
 *   initErrorTracking({ dsn: '...', environment: 'production' })
 *   captureError(error, { context: 'MyComponent' })
 *   setUser({ id: 'uid', email: 'user@example.com' })
 */

let sentry = null
let initialized = false

/**
 * Initialize error tracking.
 * Attempts to load @sentry/react dynamically.
 * Falls back to console logging if not installed.
 */
export async function initErrorTracking(config = {}) {
  if (initialized) return

  try {
    // Dynamic import — only loads if @sentry/react is installed
    const Sentry = await import('@sentry/react')
    Sentry.init({
      dsn: config.dsn || '',
      environment: config.environment || (import.meta.env.MODE === 'production' ? 'production' : 'development'),
      release: config.release || `aeo-dashboard@${import.meta.env.VITE_APP_VERSION || '0.0.0'}`,
      tracesSampleRate: config.tracesSampleRate ?? 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
      // Don't send in dev by default
      enabled: config.enabled ?? import.meta.env.MODE === 'production',
      beforeSend(event) {
        // Strip sensitive data
        if (event.request?.cookies) delete event.request.cookies
        if (event.request?.headers?.['Authorization']) delete event.request.headers['Authorization']
        return event
      },
    })
    sentry = Sentry
    initialized = true
    console.debug('[ErrorTracking] Sentry initialized')
  } catch {
    // Sentry not installed — use console fallback
    initialized = true
    console.debug('[ErrorTracking] Sentry not available, using console fallback')
  }
}

/**
 * Capture an error with optional context.
 */
export function captureError(error, context = {}) {
  if (sentry) {
    sentry.withScope(scope => {
      if (context.component) scope.setTag('component', context.component)
      if (context.view) scope.setTag('view', context.view)
      if (context.projectId) scope.setTag('projectId', context.projectId)
      if (context.extra) scope.setExtras(context.extra)
      if (context.level) scope.setLevel(context.level)
      sentry.captureException(error)
    })
  } else {
    console.error('[ErrorTracking]', error, context)
  }
}

/**
 * Capture a message (non-error event).
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (sentry) {
    sentry.withScope(scope => {
      if (context.extra) scope.setExtras(context.extra)
      sentry.captureMessage(message, level)
    })
  } else {
    console.log(`[ErrorTracking] [${level}]`, message, context)
  }
}

/**
 * Set user context for error reports.
 */
export function setUser(user) {
  if (sentry) {
    sentry.setUser(user ? { id: user.uid || user.id, email: user.email, username: user.displayName } : null)
  }
}

/**
 * Set tag for filtering.
 */
export function setTag(key, value) {
  if (sentry) sentry.setTag(key, value)
}

/**
 * Add breadcrumb for debugging.
 */
export function addBreadcrumb({ category, message, level = 'info', data }) {
  if (sentry) {
    sentry.addBreadcrumb({ category, message, level, data })
  }
}

/**
 * Start a performance transaction span.
 */
export function startSpan(name, op = 'custom') {
  if (sentry?.startSpan) {
    return sentry.startSpan({ name, op })
  }
  // Fallback: return a no-op span
  const start = performance.now()
  return {
    end() {
      const duration = performance.now() - start
      console.debug(`[Perf] ${name}: ${duration.toFixed(1)}ms`)
    },
  }
}

/**
 * React ErrorBoundary integration helper.
 * Use in ErrorBoundary componentDidCatch:
 *   captureComponentError(error, errorInfo)
 */
export function captureComponentError(error, errorInfo) {
  captureError(error, {
    component: 'ErrorBoundary',
    extra: {
      componentStack: errorInfo?.componentStack,
    },
  })
}

/**
 * Get the Sentry SDK instance (if loaded).
 */
export function getSentry() {
  return sentry
}
