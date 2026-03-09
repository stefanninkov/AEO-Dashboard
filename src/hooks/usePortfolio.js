import { useMemo } from 'react'

/**
 * usePortfolio — Aggregates metrics across all projects for portfolio-level views.
 *
 * @param {Object} options
 * @param {Array} options.projects - All user projects
 * @param {Array} options.phases - Translated phase definitions for checklist progress
 */
export function usePortfolio({ projects = [], phases = [] }) {
  // Total checklist items (same across all projects)
  const totalChecklistItems = useMemo(() => {
    if (!phases?.length) return 0
    return phases.reduce((sum, p) => sum + (p.items?.length || 0), 0)
  }, [phases])

  // Per-project summary
  const projectSummaries = useMemo(() => {
    return projects.map(p => {
      const history = p.metricsHistory || []
      const latest = history[history.length - 1] || null
      const previous = history[history.length - 2] || null

      const checkedCount = Object.values(p.checked || {}).filter(Boolean).length
      const checklistPercent = totalChecklistItems > 0
        ? Math.round((checkedCount / totalChecklistItems) * 100)
        : 0

      const overallScore = latest?.overallScore ?? 0
      const prevScore = previous?.overallScore ?? 0
      const scoreTrend = previous ? overallScore - prevScore : 0

      const citations = latest?.citations?.total ?? 0
      const prevCitations = previous?.citations?.total ?? 0
      const citationsTrend = prevCitations > 0
        ? Math.round(((citations - prevCitations) / prevCitations) * 100)
        : 0

      const prompts = latest?.prompts?.total ?? 0
      const engines = latest?.citations?.byEngine?.filter(e => e.citations > 0).length ?? 0

      return {
        id: p.id,
        name: p.name,
        url: p.url,
        overallScore,
        scoreTrend,
        citations,
        citationsTrend,
        prompts,
        engines,
        checkedCount,
        checklistPercent,
        totalChecklistItems,
        lastUpdated: p.updatedAt || p.createdAt,
        lastMetricsRun: p.lastMetricsRun,
        memberCount: (p.members || []).length,
        historyLength: history.length,
        // Sparkline data (last 14 scores)
        scoreSparkline: history.slice(-14).map(s => s.overallScore ?? 0),
        citationsSparkline: history.slice(-14).map(s => s.citations?.total ?? 0),
      }
    }).sort((a, b) => b.overallScore - a.overallScore)
  }, [projects, totalChecklistItems])

  // Aggregated portfolio stats
  const portfolioStats = useMemo(() => {
    if (projectSummaries.length === 0) {
      return { avgScore: 0, totalCitations: 0, totalPrompts: 0, avgChecklist: 0, projectCount: 0, activeEngines: 0 }
    }
    const s = projectSummaries
    return {
      projectCount: s.length,
      avgScore: Math.round(s.reduce((a, p) => a + p.overallScore, 0) / s.length),
      totalCitations: s.reduce((a, p) => a + p.citations, 0),
      totalPrompts: s.reduce((a, p) => a + p.prompts, 0),
      avgChecklist: Math.round(s.reduce((a, p) => a + p.checklistPercent, 0) / s.length),
      activeEngines: Math.max(...s.map(p => p.engines), 0),
      topProject: s[0] || null,
      needsAttention: s.filter(p => p.overallScore < 50 || p.checklistPercent < 25),
    }
  }, [projectSummaries])

  // Score distribution (for histogram)
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { label: '0-25', min: 0, max: 25, count: 0, color: 'var(--color-error)' },
      { label: '26-50', min: 26, max: 50, count: 0, color: 'var(--color-warning)' },
      { label: '51-75', min: 51, max: 75, count: 0, color: 'var(--color-phase-3)' },
      { label: '76-100', min: 76, max: 100, count: 0, color: 'var(--color-success)' },
    ]
    projectSummaries.forEach(p => {
      const bucket = buckets.find(b => p.overallScore >= b.min && p.overallScore <= b.max)
      if (bucket) bucket.count++
    })
    return buckets
  }, [projectSummaries])

  return {
    projectSummaries,
    portfolioStats,
    scoreDistribution,
    totalChecklistItems,
  }
}
