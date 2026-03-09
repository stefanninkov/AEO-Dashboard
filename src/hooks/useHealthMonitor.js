import { useState, useEffect, useMemo, useCallback } from 'react'

/**
 * useHealthMonitor — App health, performance metrics, and system status.
 *
 * Tracks: page load time, render performance, data freshness,
 * error rates, and component-level metrics.
 */
export function useHealthMonitor({ activeProject, projects = [] }) {
  const [perfMetrics, setPerfMetrics] = useState(null)

  // Collect browser performance metrics on mount
  useEffect(() => {
    const collect = () => {
      if (!window.performance) return

      const nav = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')

      const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || null
      const lcp = getLargestContentfulPaint()

      setPerfMetrics({
        pageLoadTime: nav ? Math.round(nav.loadEventEnd - nav.fetchStart) : null,
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.fetchStart) : null,
        firstContentfulPaint: fcp ? Math.round(fcp) : null,
        largestContentfulPaint: lcp ? Math.round(lcp) : null,
        jsHeapSize: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
        jsHeapLimit: performance.memory ? Math.round(performance.memory.jsHeapSizeLimit / 1048576) : null,
        resourceCount: performance.getEntriesByType('resource').length,
        totalTransferSize: performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0),
        collectedAt: new Date().toISOString(),
      })
    }

    // Delay to ensure all metrics are available
    const timer = setTimeout(collect, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Data health indicators
  const dataHealth = useMemo(() => {
    if (!activeProject) return []

    const now = Date.now()
    const day = 86400000

    const checks = [
      {
        id: 'project-data',
        label: 'Project Data',
        status: activeProject.url ? 'healthy' : 'warning',
        detail: activeProject.url ? `Tracking ${activeProject.url}` : 'No URL configured',
      },
      {
        id: 'activity-log',
        label: 'Activity Log',
        status: (activeProject.activityLog?.length || 0) > 0 ? 'healthy' : 'info',
        detail: `${(activeProject.activityLog?.length || 0)} entries`,
        freshness: getNewestAge(activeProject.activityLog, 'timestamp'),
      },
      {
        id: 'monitoring',
        label: 'Monitoring Data',
        status: getMonitorStatus(activeProject.monitorHistory),
        detail: `${(activeProject.monitorHistory?.length || 0)} data points`,
        freshness: getNewestAge(activeProject.monitorHistory, 'date'),
      },
      {
        id: 'checklist',
        label: 'Checklist Progress',
        status: getChecklistStatus(activeProject),
        detail: getChecklistDetail(activeProject),
      },
      {
        id: 'team',
        label: 'Team Members',
        status: (activeProject.members?.length || 0) > 1 ? 'healthy' : 'info',
        detail: `${(activeProject.members?.length || 0)} members`,
      },
    ]

    return checks
  }, [activeProject])

  // System status summary
  const systemStatus = useMemo(() => {
    const issues = dataHealth.filter(c => c.status === 'error').length
    const warnings = dataHealth.filter(c => c.status === 'warning').length
    const healthy = dataHealth.filter(c => c.status === 'healthy').length

    if (issues > 0) return { level: 'error', label: 'Issues Detected', color: 'var(--color-error)' }
    if (warnings > 0) return { level: 'warning', label: 'Warnings', color: 'var(--color-warning)' }
    return { level: 'healthy', label: 'All Systems Healthy', color: 'var(--color-success)' }
  }, [dataHealth])

  // Portfolio-wide stats
  const portfolioHealth = useMemo(() => ({
    totalProjects: projects.length,
    projectsWithUrl: projects.filter(p => p.url).length,
    projectsWithMonitoring: projects.filter(p => p.monitorHistory?.length > 0).length,
    totalDataPoints: projects.reduce((s, p) => s + (p.activityLog?.length || 0) + (p.monitorHistory?.length || 0), 0),
    totalMembers: new Set(projects.flatMap(p => (p.members || []).map(m => m.uid))).size,
  }), [projects])

  return {
    perfMetrics,
    dataHealth,
    systemStatus,
    portfolioHealth,
  }
}

// ── Helpers ──

function getLargestContentfulPaint() {
  // LCP is only available via PerformanceObserver, return null for now
  return null
}

function getNewestAge(arr, field) {
  if (!arr?.length) return null
  const newest = Math.max(...arr.map(e => new Date(e[field] || e.timestamp).getTime()).filter(t => !isNaN(t)))
  if (!newest) return null
  const ageMs = Date.now() - newest
  if (ageMs < 3600000) return `${Math.round(ageMs / 60000)}m ago`
  if (ageMs < 86400000) return `${Math.round(ageMs / 3600000)}h ago`
  return `${Math.round(ageMs / 86400000)}d ago`
}

function getMonitorStatus(history) {
  if (!history?.length) return 'info'
  const newest = Math.max(...history.map(e => new Date(e.date || e.timestamp).getTime()))
  const age = Date.now() - newest
  if (age < 86400000 * 2) return 'healthy'
  if (age < 86400000 * 7) return 'warning'
  return 'error'
}

function getChecklistStatus(project) {
  const checked = project?.checkedItems?.length || 0
  if (checked === 0) return 'info'
  return 'healthy'
}

function getChecklistDetail(project) {
  const checked = project?.checkedItems?.length || 0
  return `${checked} items completed`
}
