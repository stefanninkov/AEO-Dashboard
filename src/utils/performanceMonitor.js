/**
 * performanceMonitor.js — Lightweight performance tracking utilities.
 *
 * Measures and reports key web vitals and custom metrics.
 * Works standalone or integrates with errorTracking (Sentry).
 */

import { addBreadcrumb, startSpan } from './errorTracking'

/**
 * Measure a named operation and log its duration.
 */
export function measureAsync(name, fn) {
  const span = startSpan(name, 'function')
  const start = performance.now()
  return fn().finally(() => {
    const duration = performance.now() - start
    span.end()
    addBreadcrumb({
      category: 'performance',
      message: `${name}: ${duration.toFixed(1)}ms`,
      level: duration > 1000 ? 'warning' : 'info',
      data: { name, durationMs: duration },
    })
  })
}

/**
 * Track route/view change timing.
 */
export function trackViewChange(viewName) {
  const start = performance.now()
  addBreadcrumb({
    category: 'navigation',
    message: `Navigate to ${viewName}`,
    level: 'info',
  })
  return {
    viewReady() {
      const duration = performance.now() - start
      addBreadcrumb({
        category: 'performance',
        message: `View ${viewName} ready: ${duration.toFixed(0)}ms`,
        level: duration > 3000 ? 'warning' : 'info',
        data: { viewName, durationMs: duration },
      })
    },
  }
}

/**
 * Report Web Vitals (if PerformanceObserver is available).
 * Call once on app init.
 */
export function observeWebVitals(callback) {
  if (typeof PerformanceObserver === 'undefined') return

  const vitals = {}

  // Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver(entries => {
      const last = entries.getEntries().at(-1)
      if (last) {
        vitals.lcp = last.startTime
        callback?.({ name: 'LCP', value: last.startTime })
      }
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {}

  // First Input Delay
  try {
    const fidObserver = new PerformanceObserver(entries => {
      const first = entries.getEntries()[0]
      if (first) {
        vitals.fid = first.processingStart - first.startTime
        callback?.({ name: 'FID', value: vitals.fid })
      }
    })
    fidObserver.observe({ type: 'first-input', buffered: true })
  } catch {}

  // Cumulative Layout Shift
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver(entries => {
      for (const entry of entries.getEntries()) {
        if (!entry.hadRecentInput) clsValue += entry.value
      }
      vitals.cls = clsValue
      callback?.({ name: 'CLS', value: clsValue })
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
  } catch {}

  return vitals
}

/**
 * Simple memory usage tracker (Chrome only).
 */
export function getMemoryUsage() {
  if (!performance.memory) return null
  return {
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    usedMB: (performance.memory.usedJSHeapSize / 1048576).toFixed(1),
  }
}
