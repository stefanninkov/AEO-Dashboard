import { useState, useEffect, useCallback } from 'react'
import {
  User, Key, Palette, FolderCog, Activity, Database, AlertTriangle,
  Save, Check, Eye, EyeOff, Download, Upload, Trash2, RotateCcw
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`toggle-switch ${checked ? 'active' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="toggle-switch-dot" />
    </button>
  )
}

export default function SettingsView({ activeProject, updateProject, deleteProject, user, setActiveView }) {
  const { theme, setTheme } = useTheme()

  // User settings state
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false)

  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic-api-key') || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)

  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
    return prefs.animationsEnabled !== false
  })
  const [defaultDateRange, setDefaultDateRange] = useState(() => {
    const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
    return prefs.defaultDateRange || '7d'
  })

  // Project settings state
  const [projectName, setProjectName] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [webflowSiteId, setWebflowSiteId] = useState('')
  const [projectNotes, setProjectNotes] = useState('')
  const [projectNameSaved, setProjectNameSaved] = useState(false)
  const [projectUrlSaved, setProjectUrlSaved] = useState(false)
  const [webflowSaved, setWebflowSaved] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  const [monitoringEnabled, setMonitoringEnabled] = useState(false)
  const [monitoringInterval, setMonitoringInterval] = useState('7d')
  const [alertThreshold, setAlertThreshold] = useState(10)

  const [clearMetricsConfirm, setClearMetricsConfirm] = useState(false)
  const [clearMonitorConfirm, setClearMonitorConfirm] = useState(false)
  const [resetChecklistConfirm, setResetChecklistConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteTypedName, setDeleteTypedName] = useState('')

  // Sync project data to local state
  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name || '')
      setProjectUrl(activeProject.url || '')
      setWebflowSiteId(activeProject.webflowSiteId || '')
      setProjectNotes(activeProject.notes || '')
      setMonitoringEnabled(activeProject.settings?.monitoringEnabled || false)
      setMonitoringInterval(activeProject.settings?.monitoringInterval || '7d')
      setAlertThreshold(activeProject.settings?.notifyThreshold || 10)
    }
  }, [activeProject?.id])

  // ── Style helpers ──
  const sectionLabelStyle = {
    fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-disabled)',
    padding: '24px 0 12px',
  }
  const sectionTitleStyle = {
    display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)',
    fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', padding: '18px 20px 14px',
    borderBottom: '1px solid var(--border-subtle)',
  }
  const settingsRowStyle = {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
    borderBottom: '1px solid var(--border-subtle)',
  }
  const lastRowStyle = {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
  }
  const labelStyle = {
    fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
    width: 130, flexShrink: 0,
  }
  const inlineSaveBtnStyle = {
    padding: '7px 14px', fontSize: 12, flexShrink: 0,
  }
  const smallSelectStyle = {
    padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)',
    borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-body)',
    outline: 'none', cursor: 'pointer',
  }

  // ── Handlers ──
  const flash = (setter) => {
    setter(true)
    setTimeout(() => setter(false), 1500)
  }

  const handleSaveDisplayName = useCallback(async () => {
    if (!displayName.trim()) return
    setNameSaving(true)
    try {
      // Firebase updateProfile if available
      if (user && typeof user.reload === 'function') {
        const { updateProfile } = await import('firebase/auth')
        await updateProfile(user, { displayName: displayName.trim() })
      }
      flash(setNameSaveSuccess)
    } catch (err) {
      console.error('Failed to update display name:', err)
    }
    setNameSaving(false)
  }, [displayName, user])

  const handleSaveApiKey = useCallback(() => {
    localStorage.setItem('anthropic-api-key', apiKey.trim())
    flash(setApiKeySaved)
  }, [apiKey])

  const handleThemeChange = useCallback((val) => {
    setTheme(val)
  }, [setTheme])

  const handleAnimationsToggle = useCallback((val) => {
    setAnimationsEnabled(val)
    const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
    localStorage.setItem('aeo-user-preferences', JSON.stringify({ ...prefs, animationsEnabled: val }))
  }, [])

  const handleDefaultDateRange = useCallback((val) => {
    setDefaultDateRange(val)
    const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
    localStorage.setItem('aeo-user-preferences', JSON.stringify({ ...prefs, defaultDateRange: val }))
  }, [])

  const handleSaveProjectName = useCallback(() => {
    if (!activeProject || !projectName.trim()) return
    updateProject(activeProject.id, { name: projectName.trim() })
    flash(setProjectNameSaved)
  }, [activeProject, projectName, updateProject])

  const handleSaveProjectUrl = useCallback(() => {
    if (!activeProject) return
    updateProject(activeProject.id, { url: projectUrl.trim() })
    flash(setProjectUrlSaved)
  }, [activeProject, projectUrl, updateProject])

  const handleSaveWebflowId = useCallback(() => {
    if (!activeProject) return
    updateProject(activeProject.id, { webflowSiteId: webflowSiteId.trim() })
    flash(setWebflowSaved)
  }, [activeProject, webflowSiteId, updateProject])

  const handleSaveNotes = useCallback(() => {
    if (!activeProject) return
    updateProject(activeProject.id, { notes: projectNotes })
    flash(setNotesSaved)
  }, [activeProject, projectNotes, updateProject])

  const handleMonitoringToggle = useCallback((val) => {
    setMonitoringEnabled(val)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, monitoringEnabled: val },
      })
    }
  }, [activeProject, updateProject])

  const handleMonitoringInterval = useCallback((val) => {
    setMonitoringInterval(val)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, monitoringInterval: val },
      })
    }
  }, [activeProject, updateProject])

  const handleAlertThreshold = useCallback((value) => {
    const num = Math.min(50, Math.max(1, parseInt(value) || 1))
    setAlertThreshold(num)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, notifyThreshold: num },
      })
    }
  }, [activeProject, updateProject])

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
          alert('Invalid JSON file.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [activeProject, updateProject])

  const handleClearMetrics = useCallback(() => {
    if (!clearMetricsConfirm) {
      setClearMetricsConfirm(true)
      setTimeout(() => setClearMetricsConfirm(false), 4000)
      return
    }
    if (activeProject) {
      updateProject(activeProject.id, { metricsHistory: [] })
      setClearMetricsConfirm(false)
    }
  }, [clearMetricsConfirm, activeProject, updateProject])

  const handleClearMonitor = useCallback(() => {
    if (!clearMonitorConfirm) {
      setClearMonitorConfirm(true)
      setTimeout(() => setClearMonitorConfirm(false), 4000)
      return
    }
    if (activeProject) {
      updateProject(activeProject.id, { monitorHistory: [] })
      setClearMonitorConfirm(false)
    }
  }, [clearMonitorConfirm, activeProject, updateProject])

  const handleResetChecklist = useCallback(() => {
    if (!resetChecklistConfirm) {
      setResetChecklistConfirm(true)
      return
    }
    if (activeProject) {
      updateProject(activeProject.id, { checked: {} })
      setResetChecklistConfirm(false)
    }
  }, [resetChecklistConfirm, activeProject, updateProject])

  const handleDeleteProject = useCallback(() => {
    if (!activeProject) return
    if (deleteTypedName !== activeProject.name) return
    deleteProject(activeProject.id)
    setDeleteConfirm(false)
    setDeleteTypedName('')
    setActiveView('dashboard')
  }, [activeProject, deleteTypedName, deleteProject, setActiveView])

  // ── Derived values ──
  const authProvider = user?.providerData?.[0]?.providerId
  const authMethodLabel = authProvider === 'google.com' ? 'Google' : 'Email/Password'
  const apiKeyExists = apiKey.trim().length > 0
  const metricsCount = activeProject?.metricsHistory?.length || 0
  const monitorCount = activeProject?.monitorHistory?.length || 0
  const lastMonitorRun = activeProject?.lastMonitorRun
    ? new Date(activeProject.lastMonitorRun).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ════ SECTION 1: USER SETTINGS ════ */}
      <div style={sectionLabelStyle}>User Settings</div>

      {/* ── Profile ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={sectionTitleStyle}>
          <User size={15} />
          Profile
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Display Name</span>
          <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              style={inlineSaveBtnStyle}
              onClick={handleSaveDisplayName}
              disabled={nameSaving || !displayName.trim()}
            >
              {nameSaveSuccess ? <Check size={13} /> : <Save size={13} />}
              {nameSaveSuccess ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Email</span>
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{user?.email || '--'}</span>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>Auth Method</span>
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{authMethodLabel}</span>
        </div>
      </div>

      {/* ── API Key ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={sectionTitleStyle}>
          <Key size={15} />
          API Key
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Anthropic API Key</span>
          <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                className="input-field"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                style={{ width: '100%', paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                  padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              className="btn-primary"
              style={inlineSaveBtnStyle}
              onClick={handleSaveApiKey}
            >
              {apiKeySaved ? <Check size={13} /> : <Save size={13} />}
              {apiKeySaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Status</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: apiKeyExists ? 'var(--color-success)' : 'var(--text-disabled)', flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: apiKeyExists ? 'var(--color-success)' : 'var(--text-tertiary)' }}>
              {apiKeyExists ? 'Connected' : 'Not set'}
            </span>
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle} />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Used by Analyzer, Metrics, Competitors, and Testing features
          </span>
        </div>
      </div>

      {/* ── Appearance ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={sectionTitleStyle}>
          <Palette size={15} />
          Appearance
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Theme</span>
          <select style={smallSelectStyle} value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Animations</span>
          <ToggleSwitch checked={animationsEnabled} onChange={handleAnimationsToggle} />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {animationsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>Default Date Range</span>
          <select style={smallSelectStyle} value={defaultDateRange} onChange={(e) => handleDefaultDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>

      {/* ════ SECTION 2: PROJECT SETTINGS ════ */}
      {activeProject && (
        <>
          <div style={sectionLabelStyle}>Project Settings</div>

          {/* ── General ── */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={sectionTitleStyle}>
              <FolderCog size={15} />
              General
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Project Name</span>
              <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="input-field" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" style={{ flex: 1 }} />
                <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveProjectName} disabled={!projectName.trim()}>
                  {projectNameSaved ? <Check size={13} /> : <Save size={13} />}
                  {projectNameSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Website URL</span>
              <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="input-field" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://example.com" style={{ flex: 1 }} />
                <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveProjectUrl}>
                  {projectUrlSaved ? <Check size={13} /> : <Save size={13} />}
                  {projectUrlSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Webflow Site ID</span>
              <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="input-field" value={webflowSiteId} onChange={(e) => setWebflowSiteId(e.target.value)} placeholder="Optional" style={{ flex: 1 }} />
                <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveWebflowId}>
                  {webflowSaved ? <Check size={13} /> : <Save size={13} />}
                  {webflowSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <div style={lastRowStyle}>
              <span style={{ ...labelStyle, alignSelf: 'flex-start', paddingTop: 10 }}>Notes</span>
              <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <textarea className="input-field" value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} placeholder="Add notes about this project..." rows={3} style={{ flex: 1, resize: 'vertical', minHeight: 60 }} />
                <button className="btn-primary" style={{ ...inlineSaveBtnStyle, alignSelf: 'flex-start', marginTop: 2 }} onClick={handleSaveNotes}>
                  {notesSaved ? <Check size={13} /> : <Save size={13} />}
                  {notesSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Monitoring ── */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={sectionTitleStyle}>
              <Activity size={15} />
              Monitoring
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Auto-monitoring</span>
              <ToggleSwitch checked={monitoringEnabled} onChange={handleMonitoringToggle} />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {monitoringEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Check Interval</span>
              <select style={smallSelectStyle} value={monitoringInterval} onChange={(e) => handleMonitoringInterval(e.target.value)}>
                <option value="1d">Every day</option>
                <option value="3d">Every 3 days</option>
                <option value="7d">Every 7 days</option>
                <option value="14d">Every 14 days</option>
                <option value="30d">Every 30 days</option>
              </select>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Alert Threshold</span>
              <input type="number" className="input-field" value={alertThreshold} onChange={(e) => handleAlertThreshold(e.target.value)} min={1} max={50} style={{ width: 80 }} />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>% change triggers alert</span>
            </div>

            <div style={lastRowStyle}>
              <span style={labelStyle}>Last Run</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{lastMonitorRun}</span>
            </div>
          </div>

          {/* ── Data ── */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={sectionTitleStyle}>
              <Database size={15} />
              Data
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Transfer</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={handleExportProject}>
                  <Download size={13} />
                  Export Project Data
                </button>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={handleImportProject}>
                  <Upload size={13} />
                  Import Project Data
                </button>
              </div>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Stats</span>
              <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Metrics history: <strong style={{ color: 'var(--text-primary)' }}>{metricsCount}</strong> entries</span>
                <span>Monitor history: <strong style={{ color: 'var(--text-primary)' }}>{monitorCount}</strong> entries</span>
              </div>
            </div>

            <div style={lastRowStyle}>
              <span style={labelStyle}>Clear Data</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  style={{
                    fontSize: 12, padding: '7px 14px',
                    color: clearMetricsConfirm ? 'var(--color-error)' : undefined,
                    borderColor: clearMetricsConfirm ? 'var(--color-error)' : undefined,
                  }}
                  onClick={handleClearMetrics}
                >
                  <Trash2 size={13} />
                  {clearMetricsConfirm ? 'Are you sure?' : 'Clear Metrics History'}
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    fontSize: 12, padding: '7px 14px',
                    color: clearMonitorConfirm ? 'var(--color-error)' : undefined,
                    borderColor: clearMonitorConfirm ? 'var(--color-error)' : undefined,
                  }}
                  onClick={handleClearMonitor}
                >
                  <Trash2 size={13} />
                  {clearMonitorConfirm ? 'Are you sure?' : 'Clear Monitor History'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="card" style={{ marginBottom: 16, borderColor: 'var(--color-error)', borderWidth: 1 }}>
            <div style={{ ...sectionTitleStyle, color: 'var(--color-error)' }}>
              <AlertTriangle size={15} />
              Danger Zone
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Reset Checklist</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!resetChecklistConfirm ? (
                  <button
                    onClick={handleResetChecklist}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                      background: 'none', border: '1px solid var(--color-error)', borderRadius: 10,
                      color: 'var(--color-error)', fontSize: 12, fontWeight: 500,
                      fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms ease',
                    }}
                  >
                    <RotateCcw size={13} />
                    Reset All Checklist Progress
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-error)', fontWeight: 500 }}>Are you sure?</span>
                    <button
                      onClick={handleResetChecklist}
                      style={{
                        padding: '6px 12px', background: 'var(--color-error)', border: 'none',
                        borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600,
                        fontFamily: 'var(--font-body)', cursor: 'pointer',
                      }}
                    >
                      Confirm Reset
                    </button>
                    <button onClick={() => setResetChecklistConfirm(false)} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={lastRowStyle}>
              <span style={labelStyle}>Delete Project</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                      background: 'var(--color-error)', border: 'none', borderRadius: 10,
                      color: '#fff', fontSize: 12, fontWeight: 600,
                      fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms ease',
                    }}
                  >
                    <Trash2 size={13} />
                    Delete Project
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-error)', fontWeight: 500 }}>
                      Type <strong>"{activeProject.name}"</strong> to confirm deletion:
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        className="input-field"
                        value={deleteTypedName}
                        onChange={(e) => setDeleteTypedName(e.target.value)}
                        placeholder={activeProject.name}
                        style={{ width: 220, borderColor: 'var(--color-error)' }}
                      />
                      <button
                        onClick={handleDeleteProject}
                        disabled={deleteTypedName !== activeProject.name}
                        style={{
                          padding: '7px 14px',
                          background: deleteTypedName === activeProject.name ? 'var(--color-error)' : 'var(--text-disabled)',
                          border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600,
                          fontFamily: 'var(--font-body)',
                          cursor: deleteTypedName === activeProject.name ? 'pointer' : 'not-allowed',
                          opacity: deleteTypedName === activeProject.name ? 1 : 0.5,
                        }}
                      >
                        Delete Forever
                      </button>
                      <button onClick={() => { setDeleteConfirm(false); setDeleteTypedName('') }} className="btn-secondary" style={{ fontSize: 12, padding: '7px 12px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toggle Switch CSS */}
      <style>{`
        .toggle-switch {
          position: relative;
          width: 40px;
          height: 22px;
          border-radius: 11px;
          border: none;
          cursor: pointer;
          transition: background 150ms ease;
          flex-shrink: 0;
          padding: 0;
          background: var(--border-strong);
        }
        .toggle-switch.active {
          background: var(--color-phase-1);
        }
        .toggle-switch-dot {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          transition: left 150ms ease;
          pointer-events: none;
        }
        .toggle-switch.active .toggle-switch-dot {
          left: 21px;
        }
      `}</style>
    </div>
  )
}
