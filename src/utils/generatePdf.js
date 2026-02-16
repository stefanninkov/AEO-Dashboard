import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Generate a professional AEO report PDF
 * @param {Object} options
 * @param {Object} options.project - activeProject object
 * @param {Array} options.phases - phases data from aeo-checklist.js
 * @param {Object} options.sections - which sections to include { summary, phases, completed, remaining, notes, analyzer }
 * @param {string} options.agencyName - agency branding name
 * @param {string} options.reportDate - formatted date string
 */
export function generatePdf({ project, phases, sections, agencyName, reportDate }) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentW = pageW - margin * 2

  const checked = project?.checked || {}
  const notes = project?.notes || {}
  const verifications = project?.verifications || {}

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

  // Compute progress
  let totalItems = 0, totalDone = 0
  const phaseProgress = phases.map(phase => {
    let total = 0, done = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => { total++; if (checked[item.id]) done++ })
    })
    totalItems += total
    totalDone += done
    return { phase, total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  })
  const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  // ════════════════════════════════════════
  // PAGE 1: COVER
  // ════════════════════════════════════════

  // Background accent line
  doc.setFillColor(255, 107, 53)
  doc.rect(0, 0, 5, pageH, 'F')

  // Agency name
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(120, 120, 120)
  doc.text(agencyName || 'AEO Dashboard', margin, 50)

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(30, 30, 30)
  doc.text('AEO Optimization', margin, 72)
  doc.text('Report', margin, 86)

  // Divider
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, 95, margin + 60, 95)

  // Project info
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(`Project: ${project?.name || 'Untitled'}`, margin, 110)
  if (project?.url) {
    doc.setTextColor(14, 165, 233)
    doc.text(project.url, margin, 118)
  }

  // Date
  doc.setTextColor(120, 120, 120)
  doc.setFontSize(10)
  doc.text(reportDate || new Date().toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }), margin, 130)

  // Overall score — big number
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(64)
  const scoreColor = overallPercent >= 75 ? [16, 185, 129] : overallPercent >= 50 ? [245, 158, 11] : [255, 107, 53]
  doc.setTextColor(...scoreColor)
  doc.text(`${overallPercent}%`, margin, 180)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(120, 120, 120)
  doc.text(`${totalDone} of ${totalItems} tasks complete`, margin, 192)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text('Generated with AEO Dashboard', margin, pageH - 15)

  // ════════════════════════════════════════
  // PAGE 2: EXECUTIVE SUMMARY
  // ════════════════════════════════════════

  if (sections.summary) {
    doc.addPage()
    let y = 30

    // Section header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(30, 30, 30)
    doc.text('Executive Summary', margin, y)
    y += 12

    // Overall progress text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    doc.text(`Overall Progress: ${totalDone}/${totalItems} tasks complete (${overallPercent}%)`, margin, y)
    y += 4

    // Progress bar
    doc.setFillColor(230, 230, 230)
    doc.roundedRect(margin, y, contentW, 4, 2, 2, 'F')
    if (overallPercent > 0) {
      doc.setFillColor(...scoreColor)
      doc.roundedRect(margin, y, contentW * (overallPercent / 100), 4, 2, 2, 'F')
    }
    y += 14

    // Phase breakdown table
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
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
      styles: { fontSize: 9, cellPadding: 3, textColor: [60, 60, 60] },
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      didParseCell: (data) => {
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
  }

  // ════════════════════════════════════════
  // PHASE DETAIL PAGES
  // ════════════════════════════════════════

  if (sections.phases || sections.completed || sections.remaining) {
    phaseProgress.forEach(pp => {
      // Skip phases with no activity unless we want remaining tasks
      const hasActivity = pp.done > 0
      const hasRemaining = pp.done < pp.total
      if (!hasActivity && !sections.remaining) return

      doc.addPage()
      let y = 30

      // Phase header with color bar
      const color = phaseColors[pp.phase.number] || [100, 100, 100]
      doc.setFillColor(...color)
      doc.rect(margin, y - 5, 3, 12, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(30, 30, 30)
      doc.text(`Phase ${pp.phase.number}: ${pp.phase.title}`, margin + 8, y + 3)
      y += 12

      // Phase progress
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      doc.text(`${pp.done}/${pp.total} tasks complete (${pp.percent}%)`, margin + 8, y)
      y += 4

      // Progress bar
      doc.setFillColor(230, 230, 230)
      doc.roundedRect(margin + 8, y, contentW - 8, 3, 1.5, 1.5, 'F')
      if (pp.percent > 0) {
        doc.setFillColor(...color)
        doc.roundedRect(margin + 8, y, (contentW - 8) * (pp.percent / 100), 3, 1.5, 1.5, 'F')
      }
      y += 12

      // Task lists per category
      pp.phase.categories.forEach(cat => {
        // Check if we need a new page
        if (y > pageH - 40) {
          doc.addPage()
          y = 30
        }

        const catItems = cat.items.filter(item => {
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
  }

  // ════════════════════════════════════════
  // ANALYZER RESULTS PAGE (Optional)
  // ════════════════════════════════════════

  if (sections.analyzer && project?.analyzerResults) {
    doc.addPage()
    let y = 30
    const results = project.analyzerResults

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(30, 30, 30)
    doc.text('Analyzer Results', margin, y)
    y += 10

    if (results.score !== undefined) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      const aScoreColor = results.score >= 75 ? [16, 185, 129] : results.score >= 50 ? [245, 158, 11] : [255, 107, 53]
      doc.setTextColor(...aScoreColor)
      doc.text(`${results.score}/100`, margin, y + 8)
      y += 18

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      if (results.summary) {
        const summaryLines = doc.splitTextToSize(results.summary, contentW)
        doc.text(summaryLines, margin, y)
        y += summaryLines.length * 4 + 8
      }
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
  }

  // ════════════════════════════════════════
  // DOWNLOAD
  // ════════════════════════════════════════

  const safeName = (project?.name || 'Project').replace(/[^a-zA-Z0-9]/g, '-')
  const dateStr = new Date().toISOString().split('T')[0]
  doc.save(`AEO-Report-${safeName}-${dateStr}.pdf`)
}
