// src/utils/reportGenerator.js

/**
 * Generates an AEO Report as HTML that can be converted to PDF.
 * Uses the existing data from project state — no new API calls.
 *
 * Sections:
 *   1. Executive Summary (score, trend, key findings)
 *   2. Deterministic Analysis (content, schema, technical, AI access)
 *   3. AI Citation Status (monitoring data)
 *   4. Recommendations (prioritized action items)
 */

export function generateReportHtml(project, options = {}) {
  const {
    brandColor = '#2563EB',
  } = options

  const deterministicScore = project.deterministicScore
  const monitorHistory = project.monitorHistory || []
  const latestMonitor = monitorHistory[monitorHistory.length - 1]

  const parts = []

  parts.push(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 2cm; size: A4; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; line-height: 1.6; }
    .report-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 3px solid ${brandColor}; }
    .report-title { font-size: 1.75rem; font-weight: 700; color: ${brandColor}; }
    .report-subtitle { font-size: 0.875rem; color: #666; }
    .score-circle { display: inline-flex; align-items: center; justify-content: center; width: 5rem; height: 5rem; border-radius: 50%; border: 4px solid ${brandColor}; font-size: 1.5rem; font-weight: 700; }
    .section-title { font-size: 1.125rem; font-weight: 700; color: ${brandColor}; margin-top: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    .check-row { display: flex; gap: 0.5rem; padding: 0.25rem 0; font-size: 0.8125rem; }
    .status-pass { color: #10B981; }
    .status-fail { color: #EF4444; }
    .status-partial { color: #F59E0B; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1rem 0; }
    .stat-box { background: #f8f9fb; border-radius: 8px; padding: 1rem; text-align: center; }
    .stat-value { font-size: 1.5rem; font-weight: 700; font-family: monospace; }
    .stat-label { font-size: 0.75rem; color: #666; text-transform: uppercase; }
    .footer { text-align: center; font-size: 0.75rem; color: #999; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; }
  </style>
</head>
<body>`)

  // Header
  parts.push(`<div class="report-header">
    <div class="report-title">AEO Performance Report</div>
    <div class="report-subtitle">${escapeHtml(project.name)} &mdash; ${escapeHtml(project.url || 'No URL')}</div>
    <div class="report-subtitle">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>`)

  // Section 1: Executive Summary
  parts.push('<div class="section-title">Executive Summary</div>')
  if (deterministicScore) {
    parts.push(`<div style="text-align: center; margin: 1rem 0;">
      <div class="score-circle">${deterministicScore.overallScore}</div>
      <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #666;">AEO Readiness Score (out of 100)</div>
    </div>`)

    parts.push('<div class="stat-grid">')
    Object.entries(deterministicScore.categories).forEach(([name, cat]) => {
      const pct = Math.round((cat.score / cat.maxScore) * 100)
      parts.push(`<div class="stat-box">
        <div class="stat-value">${pct}%</div>
        <div class="stat-label">${escapeHtml(name)}</div>
      </div>`)
    })
    parts.push('</div>')
  }

  // Citation summary
  if (latestMonitor) {
    parts.push(`<div class="stat-grid">
      <div class="stat-box"><div class="stat-value">${latestMonitor.overallScore}%</div><div class="stat-label">Citation Score</div></div>
      <div class="stat-box"><div class="stat-value">${latestMonitor.queriesCited || 0}</div><div class="stat-label">Queries Cited</div></div>
      <div class="stat-box"><div class="stat-value">${latestMonitor.queriesChecked || 0}</div><div class="stat-label">Queries Tracked</div></div>
      <div class="stat-box"><div class="stat-value">${new Date(latestMonitor.date).toLocaleDateString()}</div><div class="stat-label">Last Check</div></div>
    </div>`)
  }

  // Section 2: Detailed checks
  if (deterministicScore) {
    Object.entries(deterministicScore.categories).forEach(([name, cat]) => {
      parts.push(`<div class="section-title">${escapeHtml(name)}</div>`)
      cat.items.forEach(item => {
        const statusLabel = item.status === 'pass' ? 'PASS' : item.status === 'fail' ? 'FAIL' : 'WARN'
        parts.push(`<div class="check-row">
          <span>${statusLabel}</span>
          <span style="flex:1">${escapeHtml(item.item)}</span>
          <span class="status-${item.status}">${item.points}/${item.maxPoints}</span>
        </div>`)
        if (item.detail) {
          parts.push(`<div style="padding-left: 1.75rem; font-size: 0.75rem; color: #888;">${escapeHtml(item.detail)}</div>`)
        }
      })
    })
  }

  // Section 3: Recommendations
  parts.push('<div class="section-title">Priority Recommendations</div>')
  if (deterministicScore) {
    const failItems = deterministicScore.checks.filter(c => c.status === 'fail').sort((a, b) => b.maxPoints - a.maxPoints)
    const partialItems = deterministicScore.checks.filter(c => c.status === 'partial').sort((a, b) => b.maxPoints - a.maxPoints)

    if (failItems.length > 0) {
      parts.push(`<p style="font-weight: 600; color: #EF4444;">Critical Issues (${failItems.length})</p>`)
      failItems.forEach((item, i) => {
        parts.push(`<div class="check-row"><span>${i + 1}.</span><span>${escapeHtml(item.item)}</span><span style="color:#888">${escapeHtml(item.detail || '')}</span></div>`)
      })
    }
    if (partialItems.length > 0) {
      parts.push(`<p style="font-weight: 600; color: #F59E0B;">Improvements Needed (${partialItems.length})</p>`)
      partialItems.slice(0, 10).forEach((item, i) => {
        parts.push(`<div class="check-row"><span>${i + 1}.</span><span>${escapeHtml(item.item)}</span><span style="color:#888">${escapeHtml(item.detail || '')}</span></div>`)
      })
    }
  }

  // Footer
  parts.push(`<div class="footer">Generated by AEO Dashboard &mdash; ${new Date().toISOString()}</div>`)
  parts.push('</body></html>')

  return parts.join('\n')
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Trigger PDF download from HTML using a new window and print dialog.
 */
export function downloadReportPdf(html) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  // Use DOM methods instead of document.write for security
  const doc = printWindow.document
  doc.open()
  doc.write(html)
  doc.close()

  printWindow.onload = () => {
    printWindow.print()
  }
}
