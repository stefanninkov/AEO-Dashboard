/**
 * CSV Export Utilities
 *
 * Generates CSV files from project data — checklist, metrics, activity, and competitors.
 * Uses native Blob + URL.createObjectURL for download (no external dependencies).
 */

/* ── Core helpers ── */

function escape(val) {
  const str = String(val ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(headers, rows) {
  const headerLine = headers.map(h => escape(h.label)).join(',')
  const dataLines = rows.map(row =>
    headers.map(h => escape(row[h.key])).join(',')
  )
  return [headerLine, ...dataLines].join('\n')
}

function downloadCsv(csvString, filename) {
  // BOM prefix for Excel UTF-8 detection
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return d.toLocaleString('en', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function slugify(str) {
  return (str || 'export').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/* ── Export functions ── */

export function exportChecklist({ project, phases, members = [] }) {
  const checked = project?.checked || {}
  const assignments = project?.assignments || {}
  const notes = project?.notes || {}
  const verifications = project?.verifications || {}

  const headers = [
    { key: 'phase', label: 'Phase' },
    { key: 'category', label: 'Category' },
    { key: 'item', label: 'Task' },
    { key: 'status', label: 'Status' },
    { key: 'assignee', label: 'Assignee' },
    { key: 'verified', label: 'Verified' },
    { key: 'notes', label: 'Notes' },
  ]

  const rows = []
  phases?.forEach(phase => {
    phase.categories.forEach(cat => {
      cat.items.forEach(item => {
        const assigneeUid = assignments[item.id]
        const member = assigneeUid ? members.find(m => m.uid === assigneeUid) : null
        const verification = verifications[item.id]
        rows.push({
          phase: `Phase ${phase.number}: ${phase.title}`,
          category: cat.name,
          item: item.text,
          status: checked[item.id] ? 'Complete' : 'Incomplete',
          assignee: member?.displayName || member?.email || '',
          verified: verification ? 'Yes' : 'No',
          notes: notes[item.id] || '',
        })
      })
    })
  })

  const csv = toCsv(headers, rows)
  const filename = `${slugify(project?.name)}-checklist.csv`
  downloadCsv(csv, filename)
  return filename
}

export function exportMetrics({ project }) {
  const history = project?.metricsHistory || []
  if (history.length === 0) return null

  // Collect all engine names across all entries
  const engineNames = new Set()
  history.forEach(entry => {
    const engines = entry.citations?.byEngine || []
    engines.forEach(e => engineNames.add(e.engine || 'Unknown'))
  })
  const sortedEngines = [...engineNames].sort()

  const headers = [
    { key: 'date', label: 'Date' },
    { key: 'overallScore', label: 'Overall Score' },
    { key: 'totalCitations', label: 'Total Citations' },
    { key: 'totalPrompts', label: 'Total Prompts' },
    ...sortedEngines.map(name => ({ key: `engine_${name}`, label: `${name} Citations` })),
  ]

  const rows = history.map(entry => {
    const engines = entry.citations?.byEngine || []
    const row = {
      date: formatDate(entry.timestamp),
      overallScore: entry.overallScore ?? '',
      totalCitations: entry.citations?.total ?? '',
      totalPrompts: entry.citations?.totalPrompts ?? '',
    }
    sortedEngines.forEach(name => {
      const eng = engines.find(e => e.engine === name)
      row[`engine_${name}`] = eng?.citations ?? 0
    })
    return row
  })

  const csv = toCsv(headers, rows)
  const filename = `${slugify(project?.name)}-metrics.csv`
  downloadCsv(csv, filename)
  return filename
}

export function exportActivity({ project }) {
  const log = project?.activityLog || []
  if (log.length === 0) return null

  const headers = [
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'author', label: 'Author' },
    { key: 'description', label: 'Description' },
  ]

  const TYPE_LABELS = {
    check: 'Task Checked',
    uncheck: 'Task Unchecked',
    bulk_check: 'Bulk Check',
    bulk_uncheck: 'Bulk Uncheck',
    export: 'Export',
    verify: 'Verification',
    note: 'Note Added',
    assign: 'Assignment',
    unassign: 'Unassignment',
    comment: 'Comment',
    delete_comment: 'Comment Deleted',
    project_create: 'Project Created',
    project_rename: 'Project Renamed',
    monitoring: 'Monitoring Run',
    metrics: 'Metrics Analysis',
    content: 'Content Generated',
    schema: 'Schema Generated',
    competitor_add: 'Competitor Added',
    competitor_remove: 'Competitor Removed',
  }

  const rows = log.map(entry => ({
    date: formatDate(entry.timestamp),
    type: TYPE_LABELS[entry.type] || entry.type || '',
    author: entry.authorName || entry.data?.authorName || '',
    description: entry.data?.taskText || entry.data?.message || entry.data?.filename || entry.data?.competitorName || '',
  }))

  const csv = toCsv(headers, rows)
  const filename = `${slugify(project?.name)}-activity.csv`
  downloadCsv(csv, filename)
  return filename
}

export function exportCompetitors({ project }) {
  const competitors = project?.competitors || []
  if (competitors.length === 0) return null

  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'url', label: 'URL' },
    { key: 'citationShare', label: 'Citation Share (%)' },
    { key: 'lastUpdated', label: 'Last Updated' },
  ]

  const rows = competitors.map(comp => ({
    name: comp.name || '',
    url: comp.url || '',
    citationShare: comp.citationShare != null ? comp.citationShare : '',
    lastUpdated: comp.lastAnalyzed ? formatDate(comp.lastAnalyzed) : '',
  }))

  const csv = toCsv(headers, rows)
  const filename = `${slugify(project?.name)}-competitors.csv`
  downloadCsv(csv, filename)
  return filename
}
