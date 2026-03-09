import { useState, useCallback } from 'react'

/**
 * useBulkExport — Multi-format data export system.
 *
 * Supports JSON, CSV, and Markdown exports for project data.
 *
 * @param {Object} options
 * @param {Object} options.activeProject
 * @param {Array}  options.projects
 * @param {Array}  options.projectSummaries
 */
export function useBulkExport({ activeProject, projects = [], projectSummaries = [] }) {
  const [exporting, setExporting] = useState(false)

  // Export single project as JSON
  const exportProjectJson = useCallback(() => {
    if (!activeProject) return
    const data = sanitizeForExport(activeProject)
    downloadFile(
      JSON.stringify(data, null, 2),
      `${slugify(activeProject.name)}-export-${dateStamp()}.json`,
      'application/json'
    )
  }, [activeProject])

  // Export metrics history as CSV
  const exportMetricsCsv = useCallback(() => {
    if (!activeProject?.metricsHistory?.length) return

    const headers = ['Date', 'Overall Score', 'Citations', 'Citation Rate', 'Prompts', 'Unique Sources']
    const rows = activeProject.metricsHistory.map(h => [
      h.timestamp ? new Date(h.timestamp).toISOString().slice(0, 10) : '',
      h.overallScore ?? '',
      h.citations?.total ?? '',
      h.citations?.rate ?? '',
      h.prompts?.total ?? '',
      h.citations?.uniqueSources ?? '',
    ])

    downloadCsv(headers, rows, `${slugify(activeProject.name)}-metrics-${dateStamp()}.csv`)
  }, [activeProject])

  // Export checklist status as CSV
  const exportChecklistCsv = useCallback((phases) => {
    if (!activeProject || !phases?.length) return

    const headers = ['Phase', 'Task', 'Completed']
    const rows = []
    phases.forEach(phase => {
      (phase.items || []).forEach(item => {
        rows.push([
          phase.title || phase.id,
          item.label || item.id,
          activeProject.checked?.[item.id] ? 'Yes' : 'No',
        ])
      })
    })

    downloadCsv(headers, rows, `${slugify(activeProject.name)}-checklist-${dateStamp()}.csv`)
  }, [activeProject])

  // Export portfolio summary as CSV
  const exportPortfolioCsv = useCallback(() => {
    if (projectSummaries.length === 0) return

    const headers = ['Project', 'URL', 'Score', 'Score Trend', 'Citations', 'Prompts', 'Checklist %', 'Engines', 'Team Size']
    const rows = projectSummaries.map(p => [
      p.name, p.url || '', p.overallScore, p.scoreTrend,
      p.citations, p.prompts, p.checklistPercent,
      p.engines, p.memberCount,
    ])

    downloadCsv(headers, rows, `portfolio-summary-${dateStamp()}.csv`)
  }, [projectSummaries])

  // Export activity log as CSV
  const exportActivityCsv = useCallback(() => {
    if (!activeProject?.activityLog?.length) return

    const headers = ['Timestamp', 'Type', 'Author', 'Details']
    const rows = activeProject.activityLog.map(a => [
      a.timestamp || '',
      a.type || '',
      a.authorName || a.authorEmail || '',
      summarizeActivity(a),
    ])

    downloadCsv(headers, rows, `${slugify(activeProject.name)}-activity-${dateStamp()}.csv`)
  }, [activeProject])

  // Export as Markdown report
  const exportMarkdownReport = useCallback(() => {
    if (!activeProject) return

    const history = activeProject.metricsHistory || []
    const latest = history[history.length - 1]
    const checked = Object.values(activeProject.checked || {}).filter(Boolean).length

    const lines = [
      `# AEO Report: ${activeProject.name}`,
      ``,
      `**Generated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `**URL:** ${activeProject.url || 'N/A'}`,
      ``,
      `## Key Metrics`,
      ``,
      `| Metric | Value |`,
      `|--------|-------|`,
      `| AEO Score | ${latest?.overallScore ?? 'N/A'}% |`,
      `| Total Citations | ${latest?.citations?.total ?? 'N/A'} |`,
      `| Total Prompts | ${latest?.prompts?.total ?? 'N/A'} |`,
      `| Checklist Completed | ${checked} tasks |`,
      `| History Snapshots | ${history.length} |`,
      ``,
    ]

    if (latest?.citations?.byEngine?.length) {
      lines.push(`## Engine Breakdown`, ``)
      lines.push(`| Engine | Citations | Share |`)
      lines.push(`|--------|-----------|-------|`)
      latest.citations.byEngine.forEach(e => {
        lines.push(`| ${e.engine} | ${e.citations} | ${e.share}% |`)
      })
      lines.push(``)
    }

    downloadFile(
      lines.join('\n'),
      `${slugify(activeProject.name)}-report-${dateStamp()}.md`,
      'text/markdown'
    )
  }, [activeProject])

  // Bulk export (all formats at once)
  const exportAll = useCallback(async (phases) => {
    setExporting(true)
    try {
      exportProjectJson()
      exportMetricsCsv()
      if (phases) exportChecklistCsv(phases)
      exportActivityCsv()
      exportMarkdownReport()
    } finally {
      setExporting(false)
    }
  }, [exportProjectJson, exportMetricsCsv, exportChecklistCsv, exportActivityCsv, exportMarkdownReport])

  return {
    exporting,
    exportProjectJson,
    exportMetricsCsv,
    exportChecklistCsv,
    exportPortfolioCsv,
    exportActivityCsv,
    exportMarkdownReport,
    exportAll,
  }
}

// ── Helpers ──

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadCsv(headers, rows, filename) {
  const escape = (v) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const lines = [headers.map(escape).join(',')]
  rows.forEach(row => lines.push(row.map(escape).join(',')))
  downloadFile(lines.join('\n'), filename, 'text/csv')
}

function slugify(name) {
  return (name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

function sanitizeForExport(project) {
  // Remove sensitive/internal fields
  const { notifications, presence, ...safe } = project || {}
  return safe
}

function summarizeActivity(a) {
  const parts = []
  if (a.taskText) parts.push(a.taskText)
  if (a.itemLabel) parts.push(a.itemLabel)
  if (a.assigneeName) parts.push(`→ ${a.assigneeName}`)
  if (a.score != null) parts.push(`score: ${a.score}`)
  if (a.url) parts.push(a.url)
  return parts.join(' | ') || a.type
}
