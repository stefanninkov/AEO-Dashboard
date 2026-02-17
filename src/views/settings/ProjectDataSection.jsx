/**
 * ProjectDataSection — Data management (export/import, clear data) + Danger Zone (reset, delete).
 */
import { useState, useCallback } from 'react'
import { Database, AlertTriangle, Download, Upload, Trash2, RotateCcw } from 'lucide-react'
import logger from '../../utils/logger'
import {
  sectionTitleStyle, settingsRowStyle, lastRowStyle, labelStyle,
} from './SettingsShared'

export default function ProjectDataSection({ activeProject, updateProject, deleteProject, setActiveView }) {
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
          if (window.confirm(`Import data from "${file.name}" into this project? This will merge the imported data.`)) {
            const { id, userId, createdAt, ...mergeData } = imported
            updateProject(activeProject.id, mergeData)
          }
        } catch (err) {
          logger.warn('Invalid JSON file import attempted')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [activeProject, updateProject])

  const handleClearMetrics = useCallback(() => {
    if (!clearMetricsConfirm) { setClearMetricsConfirm(true); setTimeout(() => setClearMetricsConfirm(false), 4000); return }
    if (activeProject) { updateProject(activeProject.id, { metricsHistory: [] }); setClearMetricsConfirm(false) }
  }, [clearMetricsConfirm, activeProject, updateProject])

  const handleClearMonitor = useCallback(() => {
    if (!clearMonitorConfirm) { setClearMonitorConfirm(true); setTimeout(() => setClearMonitorConfirm(false), 4000); return }
    if (activeProject) { updateProject(activeProject.id, { monitorHistory: [] }); setClearMonitorConfirm(false) }
  }, [clearMonitorConfirm, activeProject, updateProject])

  const handleResetChecklist = useCallback(() => {
    if (!resetChecklistConfirm) { setResetChecklistConfirm(true); return }
    if (activeProject) { updateProject(activeProject.id, { checked: {} }); setResetChecklistConfirm(false) }
  }, [resetChecklistConfirm, activeProject, updateProject])

  const handleDeleteProject = useCallback(() => {
    if (!activeProject) return
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
        <div style={sectionTitleStyle}><Database size={15} /> Data</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Transfer</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={handleExportProject}>
              <Download size={13} /> Export Project Data
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={handleImportProject}>
              <Upload size={13} /> Import Project Data
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Stats</span>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <span>Metrics history: <strong style={{ color: 'var(--text-primary)' }}>{metricsCount}</strong> entries</span>
            <span>Monitor history: <strong style={{ color: 'var(--text-primary)' }}>{monitorCount}</strong> entries</span>
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>Clear Data</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem', color: clearMetricsConfirm ? 'var(--color-error)' : undefined, borderColor: clearMetricsConfirm ? 'var(--color-error)' : undefined }} onClick={handleClearMetrics}>
              <Trash2 size={13} /> {clearMetricsConfirm ? 'Are you sure?' : 'Clear Metrics History'}
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem', color: clearMonitorConfirm ? 'var(--color-error)' : undefined, borderColor: clearMonitorConfirm ? 'var(--color-error)' : undefined }} onClick={handleClearMonitor}>
              <Trash2 size={13} /> {clearMonitorConfirm ? 'Are you sure?' : 'Clear Monitor History'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--color-error)', borderWidth: 1 }}>
        <div style={{ ...sectionTitleStyle, color: 'var(--color-error)' }}><AlertTriangle size={15} /> Danger Zone</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Reset Checklist</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!resetChecklistConfirm ? (
              <button onClick={handleResetChecklist} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'none', border: '1px solid var(--color-error)', borderRadius: '0.625rem', color: 'var(--color-error)', fontSize: '0.75rem', fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms ease' }}>
                <RotateCcw size={13} /> Reset All Checklist Progress
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>Are you sure?</span>
                <button onClick={handleResetChecklist} style={{ padding: '0.375rem 0.75rem', background: 'var(--color-error)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>Confirm Reset</button>
                <button onClick={() => setResetChecklistConfirm(false)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>Delete Project</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'var(--color-error)', border: 'none', borderRadius: '0.625rem', color: '#fff', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms ease' }}>
                <Trash2 size={13} /> Delete Project
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>
                  Type <strong>"{activeProject.name}"</strong> to confirm deletion:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input className="input-field" value={deleteTypedName} onChange={(e) => setDeleteTypedName(e.target.value)} placeholder={activeProject.name} aria-label="Type project name to confirm deletion" style={{ width: '13.75rem', borderColor: 'var(--color-error)' }} />
                  <button onClick={handleDeleteProject} disabled={deleteTypedName !== activeProject.name} style={{ padding: '0.4375rem 0.875rem', background: deleteTypedName === activeProject.name ? 'var(--color-error)' : 'var(--text-disabled)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: deleteTypedName === activeProject.name ? 'pointer' : 'not-allowed', opacity: deleteTypedName === activeProject.name ? 1 : 0.5 }}>Delete Forever</button>
                  <button onClick={() => { setDeleteConfirm(false); setDeleteTypedName('') }} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.75rem' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
