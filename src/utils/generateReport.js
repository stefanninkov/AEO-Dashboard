/**
 * Generate a PDF report from AEO metrics data.
 * Uses the browser's print API via a hidden iframe — no library needed.
 */
export function generateReport(metrics, projectName, dateRange) {
  if (!metrics) {
    return
  }

  const dateRangeLabel = {
    today: 'Today',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
  }[dateRange] || 'Last 7 Days'

  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const engineRows = (metrics.citations?.byEngine || [])
    .sort((a, b) => b.citations - a.citations)
    .map(e => `<tr><td>${e.engine}</td><td style="text-align:right">${e.citations}</td><td style="text-align:right">${e.share}%</td></tr>`)
    .join('')

  const pageRows = (metrics.pages || [])
    .map(p => `<tr><td>${p.pageTitle}</td><td>${p.pageUrl}</td><td style="text-align:right">${p.citations}</td><td style="text-align:right">${p.aiIndexing || '-'}</td><td style="text-align:right">${p.botReferralPercent || 0}%</td></tr>`)
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>AEO Report - ${projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; padding: 2.5rem; max-width: 50rem; margin: auto; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1rem; margin: 1.5rem 0 0.75rem; color: #FF6B35; border-bottom: 0.125rem solid #FF6B35; padding-bottom: 0.25rem; }
    .subtitle { color: #5a5a6e; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .meta { color: #8c8c9a; font-size: 0.75rem; margin-bottom: 2rem; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    .card { border: 0.0625rem solid #e0d8cf; border-radius: 0.5rem; padding: 0.75rem; }
    .card-label { font-size: 0.6875rem; color: #8c8c9a; text-transform: uppercase; }
    .card-value { font-size: 1.375rem; font-weight: 700; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.8125rem; }
    th { text-align: left; padding: 0.5rem; border-bottom: 0.125rem solid #e0d8cf; font-size: 0.6875rem; text-transform: uppercase; color: #8c8c9a; }
    td { padding: 0.5rem; border-bottom: 0.0625rem solid #ede8e3; }
    .score { display: inline-block; font-size: 3rem; font-weight: 800; }
    .score-label { color: #8c8c9a; font-size: 0.875rem; }
    .footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 0.0625rem solid #e0d8cf; color: #8c8c9a; font-size: 0.6875rem; text-align: center; }
    @media print { body { padding: 1.25rem; } }
  </style>
</head>
<body>
  <h1>AEO Metrics Report</h1>
  <p class="subtitle">${projectName}</p>
  <p class="meta">Generated on ${now} | Period: ${dateRangeLabel}</p>

  <div class="cards">
    <div class="card">
      <div class="card-label">Total Citations</div>
      <div class="card-value">${metrics.citations?.total?.toLocaleString() || 0}</div>
    </div>
    <div class="card">
      <div class="card-label">Citation Rate</div>
      <div class="card-value">${metrics.citations?.rate || 0}%</div>
    </div>
    <div class="card">
      <div class="card-label">Queries Tracked</div>
      <div class="card-value">${metrics.prompts?.total || 0}</div>
    </div>
    <div class="card">
      <div class="card-label">AEO Score</div>
      <div class="card-value">${metrics.overallScore || 0}/100</div>
    </div>
  </div>

  <h2>AI Engine Citations</h2>
  <table>
    <thead><tr><th>Engine</th><th style="text-align:right">Citations</th><th style="text-align:right">Market Share</th></tr></thead>
    <tbody>${engineRows || '<tr><td colspan="3">No data</td></tr>'}</tbody>
  </table>

  ${pageRows ? `
  <h2>Page Performance</h2>
  <table>
    <thead><tr><th>Page</th><th>URL</th><th style="text-align:right">Citations</th><th style="text-align:right">AI Indexing</th><th style="text-align:right">Bot Referral</th></tr></thead>
    <tbody>${pageRows}</tbody>
  </table>
  ` : ''}

  <div style="text-align:center; margin: 2rem 0;">
    <div class="score" style="color: ${metrics.overallScore >= 70 ? '#10B981' : metrics.overallScore >= 40 ? '#F59E0B' : '#EF4444'}">${metrics.overallScore || 0}</div>
    <div class="score-label">Overall AEO Score</div>
  </div>

  <div class="footer">
    AEO Dashboard Report — Generated automatically
  </div>
</body>
</html>`

  // Create hidden iframe for print
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-625rem;left:-625rem;width:50rem;height:37.5rem;'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
  iframeDoc.open()
  iframeDoc.write(html)
  iframeDoc.close()

  // Wait for content to render, then print
  setTimeout(() => {
    iframe.contentWindow.print()
    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }, 500)
}

/**
 * Generate a plain-text report summary for email.
 */
export function generateEmailBody(metrics, projectName, dateRange) {
  if (!metrics) return 'No metrics data available.'

  const dateRangeLabel = {
    today: 'Today',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
  }[dateRange] || 'Last 7 Days'

  const engines = (metrics.citations?.byEngine || [])
    .filter(e => e.citations > 0)
    .sort((a, b) => b.citations - a.citations)
    .map(e => `  - ${e.engine}: ${e.citations} citations (${e.share}%)`)
    .join('\n')

  const pages = (metrics.pages || [])
    .slice(0, 5)
    .map(p => `  - ${p.pageTitle} (${p.pageUrl}): ${p.citations} citations`)
    .join('\n')

  return `AEO Metrics Report - ${projectName}
Period: ${dateRangeLabel}
Generated: ${new Date().toLocaleDateString()}

== Summary ==
Total Citations: ${metrics.citations?.total || 0}
Citation Rate: ${metrics.citations?.rate || 0}%
Unique Sources: ${metrics.citations?.uniqueSources || 0}
AEO Score: ${metrics.overallScore || 0}/100
Queries Tracked: ${metrics.prompts?.total || 0}

== AI Engine Citations ==
${engines || '  No data'}

== Top Pages ==
${pages || '  No data'}

--
Generated by AEO Dashboard`
}
