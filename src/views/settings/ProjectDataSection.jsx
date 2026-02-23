/**
 * ProjectDataSection — Data management (export/import, clear data) + Danger Zone (reset, delete).
 */
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Database, AlertTriangle, Download, Upload, Trash2, RotateCcw } from 'lucide-react'
import logger from '../../utils/logger'
import { sanitizeImport } from '../../utils/importWhitelist'
import {
  sectionTitleStyle, settingsRowStyle, lastRowStyle, labelStyle,
} from './SettingsShared'

export default function ProjectDataSection({ activeProject, updateProject, deleteProject, setActiveView, permission }) {
  const canEdit = permission?.hasPermission?.('project:edit') !== false
  const canDelete = permission?.hasPermission?.('project:delete') !== false
  const { t } = useTranslation('app')
  const [clearMetricsConfirm, setClearMetricsConfirm] = useState(false)
  const [clearMonitorConfirm, setClearMonitorConfirm] = useState(false)
  const [resetChecklistConfirm, setResetChecklistConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteTypedName, setDeleteTypedName] = useState('')

  const metricsCount = activeProject?.metricsHistory?.length || 0
  const monitorCount = activeProject?.monitorHistory?.length || 0

  const handleExportProject = useCallback(() => {
    if (!activeProject) return
    const data = JSON.stringify(activeProject, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeProject.name || 'project'}-export.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [activeProject])

  const handleImportProject = useCallback(() => {
    if (!activeProject) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result)
          if (window.confirm(t('projectData.importConfirm', { fileName: file.name }))) {
            const mergeData = sanitizeImport(imported)
            updateProject(activeProject.id, mergeData)
          }
        } catch (err) {
          logger.warn('Invalid JSON file import attempted')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [activeProject, updateProject, t])

  const handleClearMetrics = useCallback(() => {
    if (!canEdit) return
    if (!clearMetricsConfirm) { setClearMetricsConfirm(true); setTimeout(() => setClearMetricsConfirm(false), 4000); return }
    if (activeProject) { updateProject(activeProject.id, { metricsHistory: [] }); setClearMetricsConfirm(false) }
  }, [clearMetricsConfirm, activeProject, updateProject, canEdit])

  const handleClearMonitor = useCallback(() => {
    if (!canEdit) return
    if (!clearMonitorConfirm) { setClearMonitorConfirm(true); setTimeout(() => setClearMonitorConfirm(false), 4000); return }
    if (activeProject) { updateProject(activeProject.id, { monitorHistory: [] }); setClearMonitorConfirm(false) }
  }, [clearMonitorConfirm, activeProject, updateProject, canEdit])

  const handleResetChecklist = useCallback(() => {
    if (!canEdit) return
    if (!resetChecklistConfirm) { setResetChecklistConfirm(true); return }
    if (activeProject) { updateProject(activeProject.id, { checked: {} }); setResetChecklistConfirm(false) }
  }, [resetChecklistConfirm, activeProject, updateProject, canEdit])

  const handleDeleteProject = useCallback(() => {
    if (!activeProject || !canDelete) return
    if (deleteTypedName !== activeProject.name) return
    deleteProject(activeProject.id)
    setDeleteConfirm(false)
    setDeleteTypedName('')
    setActiveView('dashboard')
  }, [activeProject, deleteTypedName, deleteProject, setActiveView])

  return (
    <>
      {/* ── Data ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Database size={15} /> {t('projectData.data')}</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectData.transfer')}</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary btn-sm" onClick={handleExportProject}>
              <Download size={13} /> {t('projectData.exportProjectData')}
            </button>
            <button className="btn-secondary btn-sm" onClick={handleImportProject}>
              <Upload size={13} /> {t('projectData.importProjectData')}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectData.stats')}</span>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <span>{t('projectData.metricsHistory', { count: metricsCount })}</span>
            <span>{t('projectData.monitorHistory', { count: monitorCount })}</span>
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>{t('projectData.clearData')}</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary btn-sm" style={clearMetricsConfirm ? { color: 'var(--color-error)', borderColor: 'var(--color-error)' } : undefined} onClick={handleClearMetrics}>
              <Trash2 size={13} /> {clearMetricsConfirm ? t('projectData.areYouSure') : t('projectData.clearMetricsHistory')}
            </button>
            <button className="btn-secondary btn-sm" style={clearMonitorConfirm ? { color: 'var(--color-error)', borderColor: 'var(--color-error)' } : undefined} onClick={handleClearMonitor}>
              <Trash2 size={13} /> {clearMonitorConfirm ? t('projectData.areYouSure') : t('projectData.clearMonitorHistory')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Danger Zone (hidden for users without edit/delete permission) ── */}
      {canEdit && <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--color-error)', borderWidth: 1 }}>
        <div style={{ ...sectionTitleStyle, color: 'var(--color-error)' }}><AlertTriangle size={15} /> {t('projectData.dangerZone')}</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectData.resetChecklist')}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!resetChecklistConfirm ? (
              <button className="btn-danger" onClick={handleResetChecklist}>
                <RotateCcw size={13} /> {t('projectData.resetAllChecklistProgress')}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>{t('projectData.areYouSure')}</span>
                <button className="btn-danger-fill" onClick={handleResetChecklist}>{t('projectData.confirmReset')}</button>
                <button className="btn-secondary btn-sm" onClick={() => setResetChecklistConfirm(false)}>{t('projectData.cancel')}</button>
              </div>
            )}
          </div>
        </div>

        {canDelete && (
          <div style={lastRowStyle}>
            <span style={labelStyle}>{t('projectData.deleteProject')}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {!deleteConfirm ? (
                <button className="btn-danger-fill" onClick={() => setDeleteConfirm(true)}>
                  <Trash2 size={13} /> {t('projectData.deleteProject')}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>
                    {t('projectData.typeNameToConfirm', { name: activeProject.name })}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input className="input-field" value={deleteTypedName} onChange={(e) => setDeleteTypedName(e.target.value)} placeholder={activeProject.name} aria-label="Type project name to confirm deletion" style={{ width: '13.75rem', borderColor: 'var(--color-error)' }} />
                    <button className="btn-danger-fill" onClick={handleDeleteProject} disabled={deleteTypedName !== activeProject.name}>{t('projectData.deleteForever')}</button>
                    <button className="btn-secondary btn-sm" onClick={() => { setDeleteConfirm(false); setDeleteTypedName('') }}>{t('projectData.cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>}
    </>
  )
}
