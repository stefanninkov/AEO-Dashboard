/**
 * Generate a professional AEO report PDF.
 *
 * jsPDF + jspdf-autotable are lazy-loaded via dynamic import() so the
 * ~587 KB bundle is only fetched when the user actually generates a report.
 *
 * @param {Object} options
 * @param {Object} options.project - activeProject object
 * @param {Array} options.phases - phases data from aeo-checklist.js
 * @param {Object} options.sections - which sections to include { summary, phases, completed, remaining, notes, analyzer, competitors, metrics, contentCalendar }
 * @param {string} options.agencyName - agency branding name
 * @param {string} options.reportDate - formatted date string
 * @param {string} [options.logoDataUrl] - base64 data URL of agency logo
 * @param {string} [options.accentColor] - hex accent color (default: #FF6B35)
 */
export async function generatePdf({ project, phases, sections, agencyName, reportDate, logoDataUrl, accentColor }) {
  const [{ jsPDF }, { applyPlugin }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  // jspdf-autotable v5 requires explicit plugin application
  applyPlugin(jsPDF)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  if (typeof doc.autoTable !== 'function') {
    throw new Error('PDF table plugin failed to load. Please refresh the page and try again.')
  }
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentW = pageW - margin * 2

  const checked = project?.checked || {}
  const notes = project?.notes || {}
  const verifications = project?.verifications || {}

  // Parse accent color (default: #2563EB)
  function hexToRgb(hex) {
    const h = (hex || '#2563EB').replace('#', '')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const accent = hexToRgb(accentColor)

  // Phase colors (hex without #)
  const phaseColors = {
    1: [255, 107, 53],   // #FF6B35
    2: [123, 47, 190],   // #7B2FBE
    3: [14, 165, 233],   // #0EA5E9
    4: [16, 185, 129],   // #10B981
    5: [245, 158, 11],   // #F59E0B
    6: [236, 72, 153],   // #EC4899
    7: [99, 102, 241],   // #6366F1
  }

  // ═══ Branded report helpers ═══

  /** Branded footer — accent line, agency name, page numbers */
  function drawFooter(pageNum, totalPages) {
    doc.setDrawColor(...accent)
    doc.setLineWidth(0.35)
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(160, 160, 160)
    doc.text(agencyName || 'AEO Dashboard', margin, pageH - 9)
    doc.text('Generated with AEO Dashboard', pageW / 2, pageH - 9, { align: 'center' })
    doc.text(`${pageNum} / ${totalPages}`, pageW - margin, pageH - 9, { align: 'right' })
  }

  /** Section header — accent bar above title */
  function drawSectionHeader(text, y, color) {
    const c = color || accent
    doc.setFillColor(...c)
    doc.roundedRect(margin, y - 1, 28, 1.5, 0.75, 0.75, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(30, 30, 30)
    doc.text(text, margin, y + 8)
    return y + 14
  }

  /** Stat summary box — colored card with value + label */
  function drawStatBox(x, y, w, h, value, label, color) {
    // Light background (8% saturation of the color)
    doc.setFillColor(
      Math.min(255, color[0] + Math.round((255 - color[0]) * 0.92)),
      Math.min(255, color[1] + Math.round((255 - color[1]) * 0.92)),
      Math.min(255, color[2] + Math.round((255 - color[2]) * 0.92))
    )
    doc.roundedRect(x, y, w, h, 2, 2, 'F')
    // Accent top strip
    doc.setFillColor(...color)
    doc.roundedRect(x, y, w, 1.5, 0.75, 0.75, 'F')
    // Value
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...color)
    doc.text(String(value), x + w / 2, y + h / 2 + 1, { align: 'center' })
    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text(label, x + w / 2, y + h - 3, { align: 'center' })
  }

  // Compute progress
  let totalItems = 0, totalDone = 0
  const phaseProgress = (phases || []).map(phase => {
    let total = 0, done = 0
    ;(phase.categories || []).forEach(cat => {
      ;(cat.items || []).forEach(item => { total++; if (checked[item.id]) done++ })
    })
    totalItems += total
    totalDone += done
    return { phase, total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  })
  const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  // ════════════════════════════════════════
  // PAGE 1: COVER (always renders)
  // ════════════════════════════════════════
  try {
    // Background accent line (uses custom accent)
    doc.setFillColor(...accent)
    doc.rect(0, 0, 5, pageH, 'F')

    // Logo (if provided)
    let coverTextStart = 50
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'AUTO', margin, 25, 28, 28)
        coverTextStart = 58
      } catch { /* skip logo on error */ }
    }

    // Agency name
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(120, 120, 120)
    doc.text(agencyName || 'AEO Dashboard', margin, coverTextStart)

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(32)
    doc.setTextColor(30, 30, 30)
    doc.text('AEO Optimization', margin, coverTextStart + 22)
    doc.text('Report', margin, coverTextStart + 36)

    // Divider
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.5)
    doc.line(margin, coverTextStart + 45, margin + 60, coverTextStart + 45)

    // Project info
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    doc.text(`Project: ${project?.name || 'Untitled'}`, margin, coverTextStart + 60)
    if (project?.url) {
      doc.setTextColor(14, 165, 233)
      doc.text(project.url, margin, coverTextStart + 68)
    }

    // Date
    doc.setTextColor(120, 120, 120)
    doc.setFontSize(10)
    doc.text(reportDate || new Date().toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }), margin, coverTextStart + 80)

    // Overall score — big number (uses accent as fallback for low scores)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(64)
    const scoreColor = overallPercent >= 75 ? [16, 185, 129] : overallPercent >= 50 ? [245, 158, 11] : accent
    doc.setTextColor(...scoreColor)
    doc.text(`${overallPercent}%`, margin, 180)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(120, 120, 120)
    doc.text(`${totalDone} of ${totalItems} tasks complete`, margin, 192)

    // Cover stat boxes — 3 key metrics at a glance
    const phasesComplete = phaseProgress.filter(pp => pp.percent === 100).length
    const activePh = phaseProgress.filter(pp => pp.percent > 0 && pp.percent < 100).length
    const coverBoxW = (contentW - 6) / 3
    const coverBoxY = 204
    drawStatBox(margin, coverBoxY, coverBoxW, 22, phasesComplete + '/' + phaseProgress.length, 'Phases Complete', accent)
    drawStatBox(margin + coverBoxW + 3, coverBoxY, coverBoxW, 22, totalDone, 'Tasks Done', [14, 165, 233])
    drawStatBox(margin + (coverBoxW + 3) * 2, coverBoxY, coverBoxW, 22, activePh || (totalItems - totalDone), activePh ? 'In Progress' : 'Remaining', [245, 158, 11])

    // Cover footer
    doc.setDrawColor(...accent)
    doc.setLineWidth(0.35)
    doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
    doc.setFontSize(7)
    doc.setTextColor(160, 160, 160)
    doc.text(agencyName || 'AEO Dashboard', margin, pageH - 12)
    doc.text(reportDate || '', pageW - margin, pageH - 12, { align: 'right' })
  } catch { /* cover page error — continue anyway */ }

  // ════════════════════════════════════════
  // PAGE 2: EXECUTIVE SUMMARY
  // ════════════════════════════════════════

  if (sections.summary) {
    try {
      doc.addPage()
      let y = 28

      // Branded section header
      y = drawSectionHeader('Executive Summary', y)

      // Stat boxes — 4 key metrics
      const sumPhasesComplete = phaseProgress.filter(pp => pp.percent === 100).length
      const sumActivePh = phaseProgress.filter(pp => pp.percent > 0 && pp.percent < 100).length
      const sumScoreColor = overallPercent >= 75 ? [16, 185, 129] : overallPercent >= 50 ? [245, 158, 11] : accent
      const sumBoxW = (contentW - 9) / 4
      drawStatBox(margin, y, sumBoxW, 20, overallPercent + '%', 'Overall Score', sumScoreColor)
      drawStatBox(margin + sumBoxW + 3, y, sumBoxW, 20, totalDone + '/' + totalItems, 'Tasks Complete', [14, 165, 233])
      drawStatBox(margin + (sumBoxW + 3) * 2, y, sumBoxW, 20, sumPhasesComplete, 'Phases Done', [16, 185, 129])
      drawStatBox(margin + (sumBoxW + 3) * 3, y, sumBoxW, 20, sumActivePh, 'In Progress', [245, 158, 11])
      y += 28

      // Progress bar
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`${totalDone} of ${totalItems} tasks complete`, margin, y)
      y += 3
      doc.setFillColor(230, 230, 230)
      doc.roundedRect(margin, y, contentW, 3.5, 1.75, 1.75, 'F')
      if (overallPercent > 0) {
        doc.setFillColor(...sumScoreColor)
        doc.roundedRect(margin, y, contentW * (overallPercent / 100), 3.5, 1.75, 1.75, 'F')
      }
      y += 12

      // Phase breakdown table
      if (phaseProgress.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(30, 30, 30)
        doc.text('Phase Breakdown', margin, y)
        y += 6

        doc.autoTable({
          startY: y,
          head: [['Phase', 'Complete', 'Total', 'Progress', 'Status']],
          body: phaseProgress.map(pp => {
            const status = pp.percent === 100 ? 'Complete' : pp.percent >= 50 ? 'In Progress' : pp.percent > 0 ? 'Started' : 'Not Started'
            return [
              `Phase ${pp.phase.number}: ${pp.phase.title}`,
              pp.done.toString(),
              pp.total.toString(),
              `${pp.percent}%`,
              status,
            ]
          }),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8.5, cellPadding: 3, textColor: [60, 60, 60] },
          headStyles: { fillColor: [...accent], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 248, 248] },
          didParseCell: (data) => {
            // Color-code phase rows by their phase color
            if (data.section === 'body' && data.column.index === 0) {
              const phaseNum = data.row.index + 1
              const pColor = phaseColors[phaseNum]
              if (pColor) {
                data.cell.styles.textColor = pColor
                data.cell.styles.fontStyle = 'bold'
              }
            }
            if (data.section === 'body' && data.column.index === 4) {
              const status = data.cell.text[0]
              if (status === 'Complete') data.cell.styles.textColor = [16, 185, 129]
              else if (status === 'In Progress') data.cell.styles.textColor = [14, 165, 233]
              else if (status === 'Started') data.cell.styles.textColor = [245, 158, 11]
              else data.cell.styles.textColor = [180, 180, 180]
            }
          },
        })

        y = doc.lastAutoTable.finalY + 12
      }

      // Top priorities (next unchecked tasks)
      const priorities = []
      for (const pp of phaseProgress) {
        if (priorities.length >= 5) break
        for (const cat of pp.phase.categories) {
          if (priorities.length >= 5) break
          for (const item of cat.items) {
            if (priorities.length >= 5) break
            if (!checked[item.id]) {
              priorities.push({ text: item.text, phase: pp.phase.number, category: cat.name })
            }
          }
        }
      }

      if (priorities.length > 0 && y < pageH - 60) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(30, 30, 30)
        doc.text('Top Priorities', margin, y)
        y += 6

        doc.autoTable({
          startY: y,
          head: [['#', 'Task', 'Phase', 'Category']],
          body: priorities.map((p, i) => [(i + 1).toString(), p.text, `Phase ${p.phase}`, p.category]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 3, textColor: [60, 60, 60] },
          headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: 8 }, 2: { cellWidth: 22 } },
        })
      }
    } catch { /* skip summary section on error */ }
  }

  // ════════════════════════════════════════
  // PHASE DETAIL PAGES
  // ════════════════════════════════════════

  if (sections.phases || sections.completed || sections.remaining) {
    try {
      phaseProgress.forEach(pp => {
        // Skip phases with no activity unless we want remaining tasks
        const hasActivity = pp.done > 0
        if (!hasActivity && !sections.remaining) return

        doc.addPage()
        let y = 30

        // Phase header — colored card banner
        const color = phaseColors[pp.phase.number] || [100, 100, 100]
        // Light colored background banner
        doc.setFillColor(
          Math.min(255, color[0] + Math.round((255 - color[0]) * 0.92)),
          Math.min(255, color[1] + Math.round((255 - color[1]) * 0.92)),
          Math.min(255, color[2] + Math.round((255 - color[2]) * 0.92))
        )
        doc.roundedRect(margin, y - 6, contentW, 20, 2, 2, 'F')
        // Accent left bar
        doc.setFillColor(...color)
        doc.roundedRect(margin, y - 6, 2.5, 20, 1.25, 1.25, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(...color)
        doc.text(`Phase ${pp.phase.number}: ${pp.phase.title}`, margin + 8, y + 2)

        // Progress text right-aligned inside banner
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(`${pp.percent}%`, pageW - margin - 4, y + 2, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(`${pp.done}/${pp.total} tasks`, pageW - margin - 4, y + 8, { align: 'right' })
        y += 18

        // Progress bar
        doc.setFillColor(230, 230, 230)
        doc.roundedRect(margin, y, contentW, 3, 1.5, 1.5, 'F')
        if (pp.percent > 0) {
          doc.setFillColor(...color)
          doc.roundedRect(margin, y, contentW * (pp.percent / 100), 3, 1.5, 1.5, 'F')
        }
        y += 10

        // Task lists per category
        pp.phase.categories.forEach(cat => {
          // Check if we need a new page
          if (y > pageH - 40) {
            doc.addPage()
            y = 30
          }

          const catItems = (cat.items || []).filter(item => {
            if (sections.completed && sections.remaining) return true
            if (sections.completed && !sections.remaining) return checked[item.id]
            if (sections.remaining && !sections.completed) return !checked[item.id]
            return true
          })
          if (catItems.length === 0) return

          // Category header
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.setTextColor(120, 120, 120)
          doc.text(cat.name.toUpperCase(), margin, y)
          y += 5

          catItems.forEach(item => {
            if (y > pageH - 30) {
              doc.addPage()
              y = 30
            }

            const isChecked = checked[item.id]
            const mark = isChecked ? '\u2713' : '\u25CB'
            const markColor = isChecked ? [16, 185, 129] : [180, 180, 180]

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...markColor)
            doc.text(mark, margin + 2, y)

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(isChecked ? [100, 100, 100] : [40, 40, 40])

            // Wrap long task text
            const lines = doc.splitTextToSize(item.text, contentW - 12)
            doc.text(lines, margin + 10, y)
            y += lines.length * 4 + 1

            // Verification badge
            if (isChecked && verifications[item.id]) {
              doc.setFontSize(7)
              doc.setTextColor(14, 165, 233)
              doc.text(verifications[item.id].method === 'ai' ? '[AI Verified]' : '[Manual]', margin + 10, y)
              y += 3
            }

            // Notes (if included)
            if (sections.notes && notes[item.id]) {
              doc.setFontSize(8)
              doc.setTextColor(100, 100, 100)
              const noteLines = doc.splitTextToSize(`Note: ${notes[item.id]}`, contentW - 15)
              doc.text(noteLines, margin + 12, y)
              y += noteLines.length * 3.5 + 1
            }

            y += 2
          })

          y += 4
        })
      })
    } catch { /* skip phase detail pages on error */ }
  }

  // ════════════════════════════════════════
  // ANALYZER RESULTS PAGE (Optional)
  // ════════════════════════════════════════

  if (sections.analyzer && project?.analyzerResults) {
    try {
      doc.addPage()
      let y = 30
      const results = project.analyzerResults

      y = drawSectionHeader('Analyzer Results', y, [14, 165, 233])

      if (results.score !== undefined) {
        // Score badge + big number
        const aScoreColor = results.score >= 75 ? [16, 185, 129] : results.score >= 50 ? [245, 158, 11] : accent
        drawStatBox(margin, y, 36, 22, results.score, 'AEO Score', aScoreColor)

        if (results.summary) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9.5)
          doc.setTextColor(80, 80, 80)
          const summaryLines = doc.splitTextToSize(results.summary, contentW - 42)
          doc.text(summaryLines, margin + 42, y + 6)
        }
        y += 28
      }

      // Category results
      if (results.categories && y < pageH - 40) {
        results.categories.forEach(cat => {
          if (y > pageH - 30) {
            doc.addPage()
            y = 30
          }

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(30, 30, 30)
          doc.text(cat.name || cat.category || 'Category', margin, y)
          y += 6

          if (cat.items) {
            cat.items.forEach(item => {
              if (y > pageH - 20) { doc.addPage(); y = 30 }
              const statusIcon = item.status === 'pass' ? '\u2713' : item.status === 'partial' ? '\u25CB' : '\u2717'
              const statusColor = item.status === 'pass' ? [16, 185, 129] : item.status === 'partial' ? [245, 158, 11] : [239, 68, 68]

              doc.setFont('helvetica', 'bold')
              doc.setFontSize(9)
              doc.setTextColor(...statusColor)
              doc.text(statusIcon, margin + 2, y)

              doc.setFont('helvetica', 'normal')
              doc.setTextColor(60, 60, 60)
              const itemLines = doc.splitTextToSize(item.name || item.check || '', contentW - 12)
              doc.text(itemLines, margin + 10, y)
              y += itemLines.length * 4 + 2
            })
          }
          y += 4
        })
      }
    } catch { /* skip analyzer section on error */ }
  }

  // ════════════════════════════════════════
  // COMPETITOR ANALYSIS PAGE (Optional)
  // ════════════════════════════════════════

  if (sections.competitors && project?.competitors?.length > 0) {
    try {
      doc.addPage()
      let y = 30
      const competitors = [...project.competitors].sort((a, b) => (b.aeoScore || 0) - (a.aeoScore || 0))

      y = drawSectionHeader('Competitor Analysis', y, [123, 47, 190])

      // Competitor count summary
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`${competitors.length} competitors tracked`, margin, y)
      y += 6

      // Rankings table
      doc.autoTable({
        startY: y,
        head: [['Rank', 'Company', 'AEO Score', 'Mentions', 'Citation Share']],
        body: competitors.map((comp, i) => [
          (i + 1).toString(),
          comp.name || comp.url || 'Unknown',
          comp.aeoScore != null ? `${comp.aeoScore}` : '—',
          comp.mentions != null ? `${comp.mentions}` : '—',
          comp.citationShare != null ? `${comp.citationShare}%` : '—',
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8.5, cellPadding: 3, textColor: [60, 60, 60] },
        headStyles: { fillColor: [123, 47, 190], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 22 }, 3: { cellWidth: 22 }, 4: { cellWidth: 28 } },
        didParseCell: (data) => {
          // Highlight user's own site
          if (data.section === 'body' && competitors[data.row.index]?.isOwn) {
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.textColor = accent
          }
        },
      })

      y = doc.lastAutoTable.finalY + 10

      // AI Summary (if available)
      const analysis = project.competitorAnalysis
      if (analysis?.aiSummary && y < pageH - 40) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(30, 30, 30)
        doc.text('Key Insights', margin, y)
        y += 6

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        const insightLines = doc.splitTextToSize(analysis.aiSummary, contentW)
        doc.text(insightLines, margin, y)
        y += insightLines.length * 4 + 4
      }
    } catch { /* skip competitors section on error */ }
  }

  // ════════════════════════════════════════
  // PERFORMANCE METRICS PAGE (Optional)
  // ════════════════════════════════════════

  if (sections.metrics && project?.metricsHistory?.length > 0) {
    try {
      doc.addPage()
      let y = 30
      const history = project.metricsHistory

      y = drawSectionHeader('Performance Metrics', y)

      // Latest metrics as stat boxes
      const latest = history[history.length - 1]
      if (latest?.overallScore != null) {
        const mScoreColor = latest.overallScore >= 75 ? [16, 185, 129] : latest.overallScore >= 50 ? [245, 158, 11] : accent
        const metBoxW = (contentW - 6) / 3

        // Score box
        drawStatBox(margin, y, metBoxW, 22, latest.overallScore, 'Latest Score', mScoreColor)

        // Citations box
        const totalCitations = latest.citations?.total
        drawStatBox(margin + metBoxW + 3, y, metBoxW, 22,
          totalCitations != null ? totalCitations : '—', 'Total Citations', [14, 165, 233])

        // Trend box
        if (history.length >= 2) {
          const prev = history[history.length - 2]
          const diff = (latest.overallScore || 0) - (prev.overallScore || 0)
          const trendColor = diff > 0 ? [16, 185, 129] : diff < 0 ? [239, 68, 68] : [120, 120, 120]
          drawStatBox(margin + (metBoxW + 3) * 2, y, metBoxW, 22,
            (diff > 0 ? '+' : '') + diff, 'Score Trend', trendColor)
        } else {
          drawStatBox(margin + (metBoxW + 3) * 2, y, metBoxW, 22,
            history.length, 'Data Points', [120, 120, 120])
        }
        y += 30
      }

      // Collect engine names dynamically
      const engineNames = new Set()
      history.forEach(entry => {
        const engines = entry.citations?.byEngine || []
        engines.forEach(e => engineNames.add(e.engine || 'Unknown'))
      })
      const sortedEngines = [...engineNames].sort()

      // History table
      const headCols = ['Date', 'Score', 'Citations', 'Prompts', ...sortedEngines]
      doc.autoTable({
        startY: y,
        head: [headCols],
        body: history.slice().reverse().slice(0, 20).map(entry => {
          const engines = entry.citations?.byEngine || []
          const ts = entry.timestamp
          const date = ts ? new Date(ts.seconds ? ts.seconds * 1000 : ts).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'
          const engineCols = sortedEngines.map(name => {
            const found = engines.find(e => e.engine === name)
            return found ? `${found.citations || 0}` : '—'
          })
          return [
            date,
            entry.overallScore != null ? `${entry.overallScore}` : '—',
            entry.citations?.total != null ? `${entry.citations.total}` : '—',
            entry.citations?.totalPrompts != null ? `${entry.citations.totalPrompts}` : '—',
            ...engineCols,
          ]
        }),
        margin: { left: margin, right: margin },
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [60, 60, 60] },
        headStyles: { fillColor: [...accent], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 248, 248] },
      })
    } catch { /* skip metrics section on error */ }
  }

  // ════════════════════════════════════════
  // CONTENT CALENDAR PAGE (Optional)
  // ════════════════════════════════════════

  if (sections.contentCalendar && project?.contentCalendar?.length > 0) {
    try {
      doc.addPage()
      let y = 30
      const calendar = [...project.contentCalendar].sort((a, b) => {
        const da = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0)
        const db = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0)
        return da - db
      })

      y = drawSectionHeader('Content Calendar', y, [16, 185, 129])

      // Status breakdown
      const statusCounts = { scheduled: 0, 'in-progress': 0, review: 0, published: 0 }
      calendar.forEach(item => {
        const s = (item.status || 'scheduled').toLowerCase()
        if (statusCounts[s] !== undefined) statusCounts[s]++
        else statusCounts.scheduled++
      })

      // Status stat boxes
      const statusColors = {
        published: [16, 185, 129],
        'in-progress': [14, 165, 233],
        review: [245, 158, 11],
        scheduled: [120, 120, 120],
      }
      const calBoxW = (contentW - 9) / 4
      drawStatBox(margin, y, calBoxW, 18, calendar.length, 'Total Items', accent)
      drawStatBox(margin + calBoxW + 3, y, calBoxW, 18, statusCounts.published, 'Published', statusColors.published)
      drawStatBox(margin + (calBoxW + 3) * 2, y, calBoxW, 18, statusCounts['in-progress'], 'In Progress', statusColors['in-progress'])
      drawStatBox(margin + (calBoxW + 3) * 3, y, calBoxW, 18, statusCounts.review + statusCounts.scheduled, 'Upcoming', statusColors.review)
      y += 26

      doc.autoTable({
        startY: y,
        head: [['Title', 'Scheduled Date', 'Status', 'Page URL']],
        body: calendar.map(item => {
          const date = item.scheduledDate
            ? new Date(item.scheduledDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'
          const url = item.pageUrl ? (item.pageUrl.length > 40 ? item.pageUrl.slice(0, 40) + '...' : item.pageUrl) : '—'
          return [item.title || 'Untitled', date, item.status || 'scheduled', url]
        }),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3, textColor: [60, 60, 60] },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: { 0: { cellWidth: 60 }, 3: { cellWidth: 50 } },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const status = (data.cell.text[0] || '').toLowerCase()
            data.cell.styles.textColor = statusColors[status] || [120, 120, 120]
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })
    } catch { /* skip calendar section on error */ }
  }

  // ════════════════════════════════════════
  // SEO ANALYSIS PAGE (Optional)
  // ════════════════════════════════════════

  if (sections.seo && project?.seo) {
    try {
      const seoData = project.seo
      const scans = seoData.scans || {}
      const lastScanUrl = seoData.lastScanUrl
      const lastScan = lastScanUrl ? scans[lastScanUrl] : null

      if (lastScan) {
        doc.addPage()
        let y = 30

        y = drawSectionHeader('SEO Analysis', y, [14, 165, 233])

        const seoScore = lastScan.seoScore
        const aeoScore = lastScan.aeoScore
        const healthScore = seoScore && aeoScore
          ? Math.round((seoScore.overallScore + aeoScore.overallScore) / 2)
          : seoScore?.overallScore || 0

        // Score stat boxes
        const seoBoxW = (contentW - 6) / 3
        const seoScoreColor = seoScore.overallScore >= 70 ? [16, 185, 129] : seoScore.overallScore >= 40 ? [245, 158, 11] : [239, 68, 68]
        const aeoScoreColor = aeoScore ? (aeoScore.overallScore >= 70 ? [16, 185, 129] : aeoScore.overallScore >= 40 ? [245, 158, 11] : [239, 68, 68]) : [120, 120, 120]
        const healthColor = healthScore >= 70 ? [16, 185, 129] : healthScore >= 40 ? [245, 158, 11] : [239, 68, 68]

        drawStatBox(margin, y, seoBoxW, 22, seoScore.overallScore, 'SEO Score', seoScoreColor)
        drawStatBox(margin + seoBoxW + 3, y, seoBoxW, 22, aeoScore ? aeoScore.overallScore : '—', 'AEO Score', aeoScoreColor)
        drawStatBox(margin + (seoBoxW + 3) * 2, y, seoBoxW, 22, healthScore, 'Site Health', healthColor)
        y += 30

        // URL info
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(`URL: ${lastScan.url}`, margin, y)
        y += 4
        doc.text(`Scanned: ${new Date(lastScan.timestamp).toLocaleString()}`, margin, y)
        y += 8

        // Category breakdown table
        if (seoScore.categories) {
          doc.autoTable({
            startY: y,
            head: [['Category', 'Score', 'Max', 'Percentage', 'Status']],
            body: Object.entries(seoScore.categories).map(([name, cat]) => {
              const pct = cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0
              const status = pct >= 90 ? 'Excellent' : pct >= 70 ? 'Good' : pct >= 40 ? 'Needs Work' : 'Poor'
              return [name, cat.score.toString(), cat.maxScore.toString(), `${pct}%`, status]
            }),
            margin: { left: margin, right: margin },
            styles: { fontSize: 8.5, cellPadding: 3, textColor: [60, 60, 60] },
            headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 248, 248] },
            didParseCell: (data) => {
              if (data.section === 'body' && data.column.index === 4) {
                const status = data.cell.text[0]
                if (status === 'Excellent') data.cell.styles.textColor = [16, 185, 129]
                else if (status === 'Good') data.cell.styles.textColor = [16, 185, 129]
                else if (status === 'Needs Work') data.cell.styles.textColor = [245, 158, 11]
                else data.cell.styles.textColor = [239, 68, 68]
              }
            },
          })
          y = doc.lastAutoTable.finalY + 10
        }

        // Failing checks table
        const failingChecks = (seoScore.checks || []).filter(c => c.status === 'fail')
        if (failingChecks.length > 0 && y < pageH - 40) {
          if (y > pageH - 60) { doc.addPage(); y = 30 }

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(30, 30, 30)
          doc.text('Failing Checks', margin, y)
          y += 6

          doc.autoTable({
            startY: y,
            head: [['Check', 'Category', 'Points Lost', 'Fix']],
            body: failingChecks.slice(0, 15).map(c => [
              c.item || '',
              c.category || '',
              `${c.maxPoints - c.points}`,
              Array.isArray(c.fix) ? c.fix[0] || '' : (c.fix || '').substring(0, 80),
            ]),
            margin: { left: margin, right: margin },
            styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [60, 60, 60] },
            headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
            alternateRowStyles: { fillColor: [248, 248, 248] },
            columnStyles: { 0: { cellWidth: 45 }, 3: { cellWidth: 55 } },
          })
        }
      }
    } catch { /* skip SEO section on error */ }
  }

  // ════════════════════════════════════════
  // BRANDED FOOTERS — on every page except cover
  // ════════════════════════════════════════

  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(i, totalPages)
  }

  // ════════════════════════════════════════
  // DOWNLOAD — always runs, even if sections failed
  // ════════════════════════════════════════

  const safeName = (project?.name || 'Project').replace(/[^a-zA-Z0-9]/g, '-')
  const dateStr = new Date().toISOString().split('T')[0]
  doc.save(`AEO-Report-${safeName}-${dateStr}.pdf`)
}
