import { useMemo, useCallback } from 'react'

/**
 * useDigestReport — Generates a structured digest report from project data.
 *
 * Builds a portable report object that can be rendered as HTML,
 * sent via email, or exported as JSON.
 *
 * @param {Object} options
 * @param {Object} options.activeProject
 * @param {Array}  options.projectSummaries - from usePortfolio (for multi-project)
 * @param {Object} options.portfolioStats
 */
export function useDigestReport({ activeProject, projectSummaries = [], portfolioStats = {} }) {
  // Single-project digest
  const projectReport = useMemo(() => {
    if (!activeProject) return null

    const history = activeProject.metricsHistory || []
    const latest = history[history.length - 1]
    const previous = history[history.length - 2]
    const settings = activeProject.settings || {}

    const score = latest?.overallScore ?? 0
    const prevScore = previous?.overallScore ?? 0
    const scoreDelta = previous ? score - prevScore : 0

    const citations = latest?.citations?.total ?? 0
    const prevCitations = previous?.citations?.total ?? 0
    const citationsDelta = prevCitations > 0
      ? Math.round(((citations - prevCitations) / prevCitations) * 100)
      : 0

    const checkedCount = Object.values(activeProject.checked || {}).filter(Boolean).length

    // Recent activity summary
    const recentActivity = (activeProject.activityLog || []).slice(0, 10)
    const activityByType = {}
    recentActivity.forEach(a => {
      activityByType[a.type] = (activityByType[a.type] || 0) + 1
    })

    // Automation rule stats
    const autoRules = activeProject.automationRules || []
    const rulesTriggered = autoRules.filter(r => {
      if (!r.lastTriggered) return false
      const ago = Date.now() - new Date(r.lastTriggered).getTime()
      return ago < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    }).length

    return {
      type: 'project',
      generatedAt: new Date().toISOString(),
      project: {
        name: activeProject.name,
        url: activeProject.url,
      },
      metrics: {
        score, prevScore, scoreDelta,
        citations, citationsDelta,
        prompts: latest?.prompts?.total ?? 0,
        engines: latest?.citations?.byEngine?.filter(e => e.citations > 0).length ?? 0,
        checkedCount,
        historyLength: history.length,
      },
      activity: {
        recent: recentActivity,
        byType: activityByType,
        total: recentActivity.length,
      },
      automation: {
        totalRules: autoRules.length,
        enabledRules: autoRules.filter(r => r.enabled).length,
        rulesTriggered,
      },
      settings: {
        monitoringEnabled: settings.monitoringEnabled,
        digestInterval: settings.digestInterval,
      },
    }
  }, [activeProject])

  // Multi-project digest
  const portfolioReport = useMemo(() => {
    if (projectSummaries.length === 0) return null

    return {
      type: 'portfolio',
      generatedAt: new Date().toISOString(),
      portfolio: {
        projectCount: portfolioStats.projectCount || 0,
        avgScore: portfolioStats.avgScore || 0,
        totalCitations: portfolioStats.totalCitations || 0,
        avgChecklist: portfolioStats.avgChecklist || 0,
        activeEngines: portfolioStats.activeEngines || 0,
      },
      projects: projectSummaries.map(p => ({
        name: p.name,
        score: p.overallScore,
        scoreTrend: p.scoreTrend,
        citations: p.citations,
        checklistPercent: p.checklistPercent,
      })),
      needsAttention: (portfolioStats.needsAttention || []).map(p => ({
        name: p.name, score: p.overallScore,
      })),
      topProject: projectSummaries[0] ? {
        name: projectSummaries[0].name,
        score: projectSummaries[0].overallScore,
      } : null,
    }
  }, [projectSummaries, portfolioStats])

  // Export as JSON
  const exportReportJson = useCallback((reportType = 'project') => {
    const report = reportType === 'portfolio' ? portfolioReport : projectReport
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aeo-digest-${reportType}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [projectReport, portfolioReport])

  return {
    projectReport,
    portfolioReport,
    exportReportJson,
  }
}
