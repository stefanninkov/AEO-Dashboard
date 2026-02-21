import { useState, useMemo } from 'react'
import { X, Table2, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from './Toast'
import { exportChecklist, exportMetrics, exportActivity, exportCompetitors } from '../utils/generateCsv'
import { useActivityWithWebhooks } from '../hooks/useActivityWithWebhooks'
import { useFocusTrap } from '../hooks/useFocusTrap'
import logger from '../utils/logger'

export default function CsvExportDialog({ activeProject, phases, updateProject, user, onClose, isClosing, onExited }) {
  const { t } = useTranslation('app')
  const { addToast } = useToast()
  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })
  const trapRef = useFocusTrap(!isClosing)

  const SECTIONS = useMemo(() => [
    { key: 'checklist', label: t('csvExport.sections.checklist'), desc: t('csvExport.sections.checklistDesc'), default: true },
    { key: 'metrics', label: t('csvExport.sections.metrics'), desc: t('csvExport.sections.metricsDesc'), default: true, dataKey: 'metricsHistory' },
    { key: 'activity', label: t('csvExport.sections.activity'), desc: t('csvExport.sections.activityDesc'), default: false, dataKey: 'activityLog' },
    { key: 'competitors', label: t('csvExport.sections.competitors'), desc: t('csvExport.sections.competitorsDesc'), default: false, dataKey: 'competitors' },
  ], [t])
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

  const hasData = (key) => {
    const section = SECTIONS.find(s => s.key === key)
    if (!section?.dataKey) return true // checklist always available
    const data = activeProject?.[section.dataKey]
    return Array.isArray(data) && data.length > 0
  }

  // Quick stats
  const checked = activeProject?.checked || {}
  const members = activeProject?.members || []
  let totalItems = 0, totalDone = 0
  phases?.forEach(phase => {
    phase.categories.forEach(cat => {
      cat.items.forEach(() => { totalItems++; if (checked[cat.items[totalItems - 1]?.id]) totalDone++ })
    })
  })
  // Recount properly
  totalItems = 0; totalDone = 0
  phases?.forEach(phase => {
    phase.categories.forEach(cat => {
      cat.items.forEach(item => { totalItems++; if (checked[item.id]) totalDone++ })
    })
  })
  const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  const handleGenerate = () => {
    setGenerating(true)
    try {
      const exported = []
      const selectedKeys = Object.keys(selectedSections).filter(k => selectedSections[k] && hasData(k))

      if (selectedKeys.length === 0) {
        addToast('error', t('csvExport.noSectionsSelected'))
        setGenerating(false)
        return
      }

      if (selectedSections.checklist && hasData('checklist')) {
        const f = exportChecklist({ project: activeProject, phases, members })
        if (f) exported.push(f)
      }
      if (selectedSections.metrics && hasData('metrics')) {
        const f = exportMetrics({ project: activeProject })
        if (f) exported.push(f)
      }
      if (selectedSections.activity && hasData('activity')) {
        const f = exportActivity({ project: activeProject })
        if (f) exported.push(f)
      }
      if (selectedSections.competitors && hasData('competitors')) {
        const f = exportCompetitors({ project: activeProject })
        if (f) exported.push(f)
      }

      if (exported.length > 0) {
        addToast('success', t('csvExport.downloadedCount', { count: exported.length }))
        if (updateProject && activeProject?.id) {
          logAndDispatch('export', { format: 'csv', files: exported }, user)
        }
      }
      onClose()
    } catch (err) {
      logger.error('CSV export error:', err)
      addToast('error', t('csvExport.error'))
    } finally {
      setGenerating(false)
    }
  }

  const selectedCount = Object.keys(selectedSections).filter(k => selectedSections[k] && hasData(k)).length

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
        aria-labelledby="csv-export-title"
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
            <Table2 size={16} style={{ color: 'var(--color-phase-4)' }} />
          </div>
          <div className="email-modal-header-text">
            <h3 id="csv-export-title" className="email-modal-title">{t('csvExport.title')}</h3>
            <p className="email-modal-subtitle">{t('csvExport.subtitle')}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="email-modal-divider" />

        {/* Body */}
        <div className="email-modal-body">
          {/* Project Info */}
          <div style={{ padding: '0.75rem', background: 'var(--bg-page)', borderRadius: '0.5rem', border: '0.0625rem solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)', marginBottom: '0.375rem' }}>{t('pdfExport.project')}</div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeProject?.name || 'Untitled'}</div>
            {activeProject?.url && <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{activeProject.url}</div>}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
              {totalDone}/{totalItems} {t('pdfExport.tasksComplete')} ({overallPercent}%)
            </div>
          </div>

          {/* Sections */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="email-modal-label">{t('csvExport.exportSections')}</label>
              <button onClick={selectAll} className="checklist-bulk-link">{t('csvExport.selectAll')}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {SECTIONS.map(section => {
                const disabled = !hasData(section.key)
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
                      style={{ accentColor: 'var(--color-phase-4)', width: '0.875rem', height: '0.875rem', cursor: disabled ? 'not-allowed' : 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{section.label}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        {section.desc}
                        {disabled && ` ${t('csvExport.noData')}`}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="email-modal-actions">
          <button
            onClick={handleGenerate}
            disabled={generating || selectedCount === 0}
            className="email-modal-send-btn"
            style={{ flex: 1 }}
          >
            <Download size={14} />
            {generating ? t('csvExport.exporting') : (selectedCount !== 1 ? t('csvExport.downloadPlural', { count: selectedCount }) : t('csvExport.download', { count: selectedCount }))}
          </button>
          <button onClick={onClose} className="email-modal-cancel-btn">
            {t('csvExport.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
