import { sendEmail } from './emailService'
import { phases } from '../data/aeo-checklist'

/**
 * Generate and send a digest email for a project.
 */
export async function sendDigestEmail(project) {
  const settings = project.settings || {}
  const to = settings.digestEmail

  if (!to) throw new Error('No digest email configured')

  const subject = `AEO Digest — ${project.name} — ${new Date().toLocaleDateString()}`
  const body = generateDigestBody(project, settings)

  await sendEmail(to, subject, body)
}

/**
 * Build the digest email body as plain text.
 */
function generateDigestBody(project, settings) {
  const lines = []

  lines.push(`AEO Dashboard — Weekly Digest`)
  lines.push(`Project: ${project.name}`)
  if (project.url) lines.push(`URL: ${project.url}`)
  lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`)
  lines.push('')
  lines.push('━'.repeat(50))
  lines.push('')

  // ── Checklist Progress ──
  const totalItems = phases.reduce((sum, phase) =>
    sum + phase.categories.reduce((s, c) => s + c.items.length, 0), 0
  )
  const checkedCount = Object.values(project.checked || {}).filter(Boolean).length
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  lines.push(`✅ CHECKLIST PROGRESS: ${checkedCount}/${totalItems} (${progress}%)`)
  lines.push('')

  // Per-phase breakdown
  phases.forEach(phase => {
    let phaseTotal = 0, phaseChecked = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => {
        phaseTotal++
        if (project.checked?.[item.id]) phaseChecked++
      })
    })
    const pct = phaseTotal > 0 ? Math.round((phaseChecked / phaseTotal) * 100) : 0
    lines.push(`  ${phase.icon} ${phase.title}: ${phaseChecked}/${phaseTotal} (${pct}%)`)
  })
  lines.push('')

  // ── Metrics ──
  if (settings.digestIncludeMetrics !== false) {
    const latestMetrics = project.metricsHistory?.length > 0
      ? project.metricsHistory[project.metricsHistory.length - 1]
      : null

    lines.push('📊 AEO METRICS')
    lines.push('')

    if (latestMetrics) {
      lines.push(`  AEO Score: ${latestMetrics.overallScore ?? '—'}/100`)
      lines.push(`  Total Citations: ${latestMetrics.citations?.total ?? 0}`)
      lines.push(`  Citation Rate: ${latestMetrics.citations?.rate ?? 0}%`)
      lines.push(`  Unique Sources: ${latestMetrics.citations?.uniqueSources ?? 0}`)
      lines.push(`  Queries Tracked: ${latestMetrics.prompts?.total ?? 0}`)

      const engines = (latestMetrics.citations?.byEngine || [])
        .filter(e => e.citations > 0)
        .sort((a, b) => b.citations - a.citations)
        .slice(0, 5)

      if (engines.length > 0) {
        lines.push('')
        lines.push('  Top AI Engines:')
        engines.forEach(e => {
          lines.push(`    • ${e.engine}: ${e.citations} citations (${e.share}%)`)
        })
      }
    } else {
      lines.push('  No metrics data yet. Run a metrics check from the dashboard.')
    }
    lines.push('')
  }

  // ── Score Change Alerts ──
  if (settings.digestIncludeAlerts !== false) {
    const monitorHistory = project.monitorHistory || []

    if (monitorHistory.length >= 2) {
      const latest = monitorHistory[monitorHistory.length - 1]
      const previous = monitorHistory[monitorHistory.length - 2]
      const delta = latest.overallScore - previous.overallScore
      const threshold = settings.notifyThreshold || 10

      if (Math.abs(delta) >= threshold) {
        lines.push('🚨 SCORE CHANGE ALERT')
        lines.push('')
        lines.push(`  Citation score ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)} points`)
        lines.push(`  Previous: ${previous.overallScore}%  →  Current: ${latest.overallScore}%`)
        lines.push('')
      }
    }

    // Monitoring summary
    if (monitorHistory.length > 0) {
      const latest = monitorHistory[monitorHistory.length - 1]
      lines.push('📡 MONITORING SUMMARY')
      lines.push('')
      lines.push(`  Citation Score: ${latest.overallScore}%`)
      lines.push(`  Queries Cited: ${latest.queriesCited}/${latest.queriesChecked}`)
      lines.push(`  Total Checks: ${monitorHistory.length}`)
      lines.push(`  Last Check: ${new Date(latest.date).toLocaleDateString()}`)
      lines.push('')
    }
  }

  // ── Analyzer Summary ──
  if (project.analyzerResults) {
    lines.push('🔍 SITE ANALYSIS')
    lines.push('')
    lines.push(`  Overall Score: ${project.analyzerResults.overallScore}%`)
    if (project.analyzerResults.topPriorities?.length > 0) {
      lines.push('  Top Priorities:')
      project.analyzerResults.topPriorities.slice(0, 3).forEach((p, i) => {
        lines.push(`    ${i + 1}. ${p}`)
      })
    }
    lines.push('')
  }

  // ── Footer ──
  lines.push('━'.repeat(50))
  lines.push('')
  lines.push('View full dashboard: ' + (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''))
  lines.push('')
  lines.push('— Generated by AEO Dashboard')

  return lines.join('\n')
}
