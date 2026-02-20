import { useState, useMemo } from 'react'
import { X, FileText, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from './Toast'
import { generatePdf } from '../utils/generatePdf'
import { useActivityWithWebhooks } from '../hooks/useActivityWithWebhooks'
import { useFocusTrap } from '../hooks/useFocusTrap'
import logger from '../utils/logger'

export default function PdfExportDialog({ activeProject, phases, updateProject, user, onClose, isClosing, onExited }) {
  const { t } = useTranslation('app')
  const { addToast } = useToast()
  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })
  const trapRef = useFocusTrap(!isClosing)

  const SECTIONS = useMemo(() => [
    { key: 'summary', label: t('pdfExport.sections.summary'), desc: t('pdfExport.sections.summaryDesc'), default: true },
    { key: 'phases', label: t('pdfExport.sections.phases'), desc: t('pdfExport.sections.phasesDesc'), default: true },
    { key: 'completed', label: t('pdfExport.sections.completed'), desc: t('pdfExport.sections.completedDesc'), default: true },
    { key: 'remaining', label: t('pdfExport.sections.remaining'), desc: t('pdfExport.sections.remainingDesc'), default: true },
    { key: 'notes', label: t('pdfExport.sections.notes'), desc: t('pdfExport.sections.notesDesc'), default: false },
    { key: 'analyzer', label: t('pdfExport.sections.analyzer'), desc: t('pdfExport.sections.analyzerDesc'), default: false },
  ], [t])

  const [agencyName, setAgencyName] = useState('')
  const [reportDate, setReportDate] = useState(
    new Date().toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
  )
  const [selectedSections, setSelectedSections] = useState(() => {
    const init = {}
    SECTIONS.forEach(s => { init[s.key] = s.default })
    return init
  })
  const [generating, setGenerating] = useState(false)

  const toggleSection = (key) => {
    setSelectedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectAll = () => {
    const all = {}
    SECTIONS.forEach(s => { all[s.key] = true })
    setSelectedSections(all)
  }

  const hasAnalyzer = !!activeProject?.analyzerResults

  // Compute quick stats
  const checked = activeProject?.checked || {}
  let totalItems = 0, totalDone = 0
  phases?.forEach(phase => {
    phase.categories.forEach(cat => {
      cat.items.forEach(item => { totalItems++; if (checked[item.id]) totalDone++ })
    })
  })
  const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generatePdf({
        project: activeProject,
        phases,
        sections: selectedSections,
        agencyName: agencyName.trim() || 'AEO Dashboard',
        reportDate,
      })
      addToast('success', t('pdfExport.success'))
      // Log export activity
      if (updateProject && activeProject?.id) {
        logAndDispatch('export', { filename: `AEO-Report-${(activeProject.name || 'Project').replace(/[^a-zA-Z0-9]/g, '-')}` }, user)
      }
      onClose()
    } catch (err) {
      logger.error('PDF generation error:', err)
      addToast('error', t('pdfExport.error'))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="email-modal-backdrop" onClick={onClose}>
      {/* Backdrop */}
      <div
        className="email-modal-overlay"
        style={{
          animation: isClosing
            ? 'backdrop-fade-out 200ms ease-out forwards'
            : 'backdrop-fade-in 200ms ease-out both',
        }}
      />

      {/* Dialog */}
      <div
        ref={trapRef}
        className="email-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-export-title"
        onClick={e => e.stopPropagation()}
        style={{
          animation: isClosing
            ? 'dialog-scale-out 200ms ease-out forwards'
            : 'dialog-scale-in 250ms ease-out both',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
        onAnimationEnd={() => isClosing && onExited?.()}
      >
        {/* Close button */}
        <button className="email-modal-close" onClick={onClose} aria-label="Close export dialog">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="email-modal-header">
          <div className="email-modal-header-icon">
            <FileText size={16} style={{ color: 'var(--color-phase-3)' }} />
          </div>
          <div className="email-modal-header-text">
            <h3 id="pdf-export-title" className="email-modal-title">{t('pdfExport.title')}</h3>
            <p className="email-modal-subtitle">{t('pdfExport.subtitle')}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="email-modal-divider" />

        {/* Body */}
        <div className="email-modal-body">
          {/* Project Info */}
          <div style={{ padding: '0.75rem', background: 'var(--bg-page)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.75px', color: 'var(--text-tertiary)', marginBottom: '0.375rem' }}>{t('pdfExport.project')}</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeProject?.name || 'Untitled'}</div>
            {activeProject?.url && <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{activeProject.url}</div>}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
              {totalDone}/{totalItems} {t('pdfExport.tasksComplete')} ({overallPercent}%)
            </div>
          </div>

          {/* Sections */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="email-modal-label">{t('pdfExport.includeInReport')}</label>
              <button onClick={selectAll} className="checklist-bulk-link">{t('pdfExport.selectAll')}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {SECTIONS.map(section => {
                const disabled = section.key === 'analyzer' && !hasAnalyzer
                return (
                  <label
                    key={section.key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem',
                      borderRadius: '0.5rem', cursor: disabled ? 'not-allowed' : 'pointer',
                      background: selectedSections[section.key] && !disabled ? 'var(--hover-bg)' : 'transparent',
                      opacity: disabled ? 0.4 : 1,
                      transition: 'background 150ms',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections[section.key] && !disabled}
                      onChange={() => !disabled && toggleSection(section.key)}
                      disabled={disabled}
                      style={{ accentColor: 'var(--color-phase-3)', width: '0.875rem', height: '0.875rem', cursor: disabled ? 'not-allowed' : 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{section.label}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        {section.desc}
                        {section.key === 'analyzer' && !hasAnalyzer && ' (no data)'}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Branding */}
          <div>
            <label htmlFor="agency-name" className="email-modal-label">{t('pdfExport.agencyName')}</label>
            <input
              id="agency-name"
              type="text"
              placeholder={t('pdfExport.agencyPlaceholder')}
              value={agencyName}
              onChange={e => setAgencyName(e.target.value)}
              className="email-modal-input"
            />
          </div>

          <div>
            <label htmlFor="report-date" className="email-modal-label">{t('pdfExport.reportDate')}</label>
            <input
              id="report-date"
              type="text"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              className="email-modal-input"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="email-modal-actions">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="email-modal-send-btn"
            style={{ flex: 1 }}
          >
            <Download size={14} />
            {generating ? t('pdfExport.generating') : t('pdfExport.generate')}
          </button>
          <button onClick={onClose} className="email-modal-cancel-btn">
            {t('pdfExport.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
