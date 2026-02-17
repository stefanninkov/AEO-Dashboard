import { useState, useEffect, useCallback } from 'react'
import {
  User, Key, Palette, FolderCog, Activity, Database, AlertTriangle,
  Save, Check, Eye, EyeOff, Download, Upload, Trash2, RotateCcw, ClipboardList,
  Share2, Copy, Loader2, Link2, X, Mail, Send, Plug, RefreshCw, Unplug
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import logger from '../utils/logger'
import { createShareLink, getProjectShares, revokeShareLink } from '../hooks/useShareLink'
import { getEmailConfig, saveEmailConfig, isEmailConfigured, sendEmail } from '../utils/emailService'
import { useGoogleIntegration } from '../hooks/useGoogleIntegration'
import { isGoogleOAuthConfigured } from '../utils/googleAuth'
import GscPropertySelector from '../components/GscPropertySelector'
import Ga4PropertySelector from '../components/Ga4PropertySelector'
import { useToast } from '../components/Toast'
import {
  INDUSTRY_LABELS, REGION_LABELS, AUDIENCE_LABELS,
  GOAL_LABELS, MATURITY_LABELS, CONTENT_LABELS, ENGINE_LABELS,
} from '../utils/getRecommendations'

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
  const { addToast } = useToast()

  // Google Integration
  const google = useGoogleIntegration(user)

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

  // Share link state
  const [shareLink, setShareLink] = useState('')
  const [generatingLink, setGeneratingLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [existingShares, setExistingShares] = useState([])

  // EmailJS config state
  const [emailServiceId, setEmailServiceId] = useState('')
  const [emailTemplateId, setEmailTemplateId] = useState('')
  const [emailPublicKey, setEmailPublicKey] = useState('')
  const [emailConfigSaved, setEmailConfigSaved] = useState(false)
  const [testingSend, setTestingSend] = useState(false)

  // Digest state
  const [digestEnabled, setDigestEnabled] = useState(false)
  const [digestInterval, setDigestInterval] = useState('weekly')
  const [digestEmail, setDigestEmail] = useState('')
  const [digestIncludeMetrics, setDigestIncludeMetrics] = useState(true)
  const [digestIncludeAlerts, setDigestIncludeAlerts] = useState(true)
  const [digestIncludeRecommendations, setDigestIncludeRecommendations] = useState(true)

  // Load EmailJS config from localStorage
  useEffect(() => {
    const config = getEmailConfig()
    setEmailServiceId(config.serviceId || '')
    setEmailTemplateId(config.templateId || '')
    setEmailPublicKey(config.publicKey || '')
  }, [])

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
      setExistingShares(getProjectShares(activeProject.id))
      setShareLink('')
      // Digest settings
      setDigestEnabled(activeProject.settings?.digestEnabled || false)
      setDigestInterval(activeProject.settings?.digestInterval || 'weekly')
      setDigestEmail(activeProject.settings?.digestEmail || '')
      setDigestIncludeMetrics(activeProject.settings?.digestIncludeMetrics !== false)
      setDigestIncludeAlerts(activeProject.settings?.digestIncludeAlerts !== false)
      setDigestIncludeRecommendations(activeProject.settings?.digestIncludeRecommendations !== false)
    }
  }, [activeProject?.id])

  // ── Share link handlers ──
  const handleGenerateShareLink = async () => {
    if (!activeProject) return
    setGeneratingLink(true)
    try {
      const link = await createShareLink(activeProject, user?.uid)
      setShareLink(link)
      setExistingShares(getProjectShares(activeProject.id))
    } catch (err) {
      logger.error('Failed to generate share link:', err)
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleRevokeShare = async (token) => {
    await revokeShareLink(token)
    setExistingShares(getProjectShares(activeProject.id))
  }

  // ── Style helpers ──
  const sectionLabelStyle = {
    fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-disabled)',
    padding: '1.5rem 0 0.75rem',
  }
  const sectionTitleStyle = {
    display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)',
    fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', padding: '1.125rem 1.25rem 0.875rem',
    borderBottom: '1px solid var(--border-subtle)',
  }
  const settingsRowStyle = {
    display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem',
    borderBottom: '1px solid var(--border-subtle)',
  }
  const lastRowStyle = {
    display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem',
  }
  const labelStyle = {
    fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500,
    width: '8.125rem', flexShrink: 0,
  }
  const inlineSaveBtnStyle = {
    padding: '0.4375rem 0.875rem', fontSize: '0.75rem', flexShrink: 0,
  }
  const smallSelectStyle = {
    padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-default)',
    borderRadius: '0.625rem', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
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
      logger.error('Failed to update display name:', err)
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

  // ── EmailJS handlers ──
  const handleSaveEmailConfig = useCallback(() => {
    saveEmailConfig({
      serviceId: emailServiceId.trim(),
      templateId: emailTemplateId.trim(),
      publicKey: emailPublicKey.trim(),
    })
    flash(setEmailConfigSaved)
    addToast('success', 'EmailJS configuration saved')
  }, [emailServiceId, emailTemplateId, emailPublicKey, addToast])

  const handleTestEmail = useCallback(async () => {
    if (!isEmailConfigured()) {
      addToast('error', 'Save your EmailJS credentials first')
      return
    }
    setTestingSend(true)
    try {
      await sendEmail(
        user?.email || 'test@example.com',
        'AEO Dashboard — Test Email',
        'This is a test email from AEO Dashboard.\n\nIf you received this, your EmailJS configuration is working correctly! 🎉'
      )
      addToast('success', 'Test email sent successfully!')
    } catch (err) {
      addToast('error', err.message || 'Failed to send test email')
    } finally {
      setTestingSend(false)
    }
  }, [user?.email, addToast])

  // ── Digest handlers ──
  const handleDigestToggle = useCallback((val) => {
    setDigestEnabled(val)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, digestEnabled: val },
      })
    }
  }, [activeProject, updateProject])

  const handleDigestInterval = useCallback((val) => {
    setDigestInterval(val)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, digestInterval: val },
      })
    }
  }, [activeProject, updateProject])

  const handleDigestEmail = useCallback((val) => {
    setDigestEmail(val)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, digestEmail: val },
      })
    }
  }, [activeProject, updateProject])

  const handleDigestIncludeMetrics = useCallback((val) => {
    setDigestIncludeMetrics(val)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, digestIncludeMetrics: val },
      })
    }
  }, [activeProject, updateProject])

  const handleDigestIncludeAlerts = useCallback((val) => {
    setDigestIncludeAlerts(val)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, digestIncludeAlerts: val },
      })
    }
  }, [activeProject, updateProject])

  const handleDigestIncludeRecommendations = useCallback((val) => {
    setDigestIncludeRecommendations(val)
    if (activeProject) {
      updateProject(activeProject.id, {
        settings: { ...activeProject.settings, digestIncludeRecommendations: val },
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
          logger.warn('Invalid JSON file import attempted')
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
  const emailConfigExists = emailServiceId.trim() && emailTemplateId.trim() && emailPublicKey.trim()
  const lastDigestSent = activeProject?.settings?.lastDigestSent
    ? new Date(activeProject.settings.lastDigestSent).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ════ SECTION 1: USER SETTINGS ════ */}
      <div style={sectionLabelStyle}>User Settings</div>

      {/* ── Profile ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}>
          <User size={15} />
          Profile
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Display Name</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              aria-label="Display name"
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
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{user?.email || '--'}</span>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>Auth Method</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{authMethodLabel}</span>
        </div>
      </div>

      {/* ── API Key ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}>
          <Key size={15} />
          API Key
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Anthropic API Key</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                className="input-field"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                aria-label="Anthropic API key"
                style={{ width: '100%', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                style={{
                  position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                  padding: '0.25rem', display: 'flex', alignItems: 'center',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '0.5rem', height: '0.5rem', borderRadius: '50%',
              background: apiKeyExists ? 'var(--color-success)' : 'var(--text-disabled)', flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.8125rem', color: apiKeyExists ? 'var(--color-success)' : 'var(--text-tertiary)' }}>
              {apiKeyExists ? 'Connected' : 'Not set'}
            </span>
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Used by Analyzer, Metrics, Competitors, and Testing features
          </span>
        </div>
      </div>

      {/* ── Google Integration (GSC + GA4) ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}>
          <Plug size={15} />
          Google Integration
        </div>

        <div style={{ padding: '0 1.25rem 0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            Connect your Google account to pull real data from Google Search Console and Google Analytics 4 into the dashboard.
          </p>
        </div>

        {!isGoogleOAuthConfigured() ? (
          /* Not configured — show setup instructions */
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.625rem',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.15)',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Setup Required</strong>
              <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '0.25rem' }}>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-phase-1)', textDecoration: 'underline' }}>Google Cloud Console</a></li>
                <li style={{ marginBottom: '0.25rem' }}>Create an OAuth 2.0 Client ID (Web application)</li>
                <li style={{ marginBottom: '0.25rem' }}>Add your site URL as an authorized redirect URI</li>
                <li style={{ marginBottom: '0.25rem' }}>Enable <em>Google Search Console API</em> and <em>Google Analytics Data API</em></li>
                <li>Add <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'var(--hover-bg)' }}>VITE_GOOGLE_CLIENT_ID=your_client_id</code> to your <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'var(--hover-bg)' }}>.env</code> file and redeploy</li>
              </ol>
            </div>
          </div>
        ) : (
          /* Configured — show connection UI */
          <>
            <div style={settingsRowStyle}>
              <span style={labelStyle}>Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {google.isLoading ? (
                  <>
                    <Loader2 size={13} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Checking...</span>
                  </>
                ) : google.isConnected ? (
                  <>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)' }}>Connected</span>
                  </>
                ) : google.isExpired ? (
                  <>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)' }}>Expired — reconnect needed</span>
                  </>
                ) : (
                  <>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--text-disabled)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Not connected</span>
                  </>
                )}
              </div>
            </div>

            {google.connectedEmail && (
              <div style={settingsRowStyle}>
                <span style={labelStyle}>Account</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{google.connectedEmail}</span>
              </div>
            )}

            {google.connectedAt && google.isConnected && (
              <div style={settingsRowStyle}>
                <span style={labelStyle}>Connected</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {new Date(google.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Scopes</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{
                  fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                  background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontWeight: 500,
                }}>Search Console (read)</span>
                <span style={{
                  fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                  background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 500,
                }}>Analytics 4 (read)</span>
              </div>
            </div>

            {google.error && (
              <div style={{ padding: '0 1.25rem 0.5rem' }}>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  fontSize: '0.75rem',
                  color: 'var(--color-error)',
                  lineHeight: 1.5,
                }}>
                  {google.error}
                </div>
              </div>
            )}

            <div style={lastRowStyle}>
              <span style={labelStyle} />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {google.isConnected ? (
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }}
                    onClick={async () => {
                      await google.disconnect()
                      addToast('success', 'Google account disconnected')
                    }}
                  >
                    <Unplug size={13} />
                    Disconnect
                  </button>
                ) : google.isExpired ? (
                  <button
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }}
                    onClick={async () => {
                      await google.reconnect()
                      if (google.status === 'connected') addToast('success', 'Google account reconnected')
                    }}
                    disabled={google.connecting}
                  >
                    {google.connecting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
                    {google.connecting ? 'Reconnecting...' : 'Reconnect'}
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }}
                    onClick={async () => {
                      await google.connect()
                      // Toast will show on next render if connected
                    }}
                    disabled={google.connecting}
                  >
                    {google.connecting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plug size={13} />}
                    {google.connecting ? 'Connecting...' : 'Connect Google Account'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Appearance ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}>
          <Palette size={15} />
          Appearance
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Theme</span>
          <select style={smallSelectStyle} value={theme} onChange={(e) => handleThemeChange(e.target.value)} aria-label="Theme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Animations</span>
          <ToggleSwitch checked={animationsEnabled} onChange={handleAnimationsToggle} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {animationsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>Default Date Range</span>
          <select style={smallSelectStyle} value={defaultDateRange} onChange={(e) => handleDefaultDateRange(e.target.value)} aria-label="Default date range">
            <option value="today">Today</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>

      {/* ── Keyboard Shortcuts ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}>
          <ClipboardList size={15} />
          Keyboard Shortcuts
        </div>
        {[
          ['Ctrl/Cmd + K', 'Command palette'],
          ['1 – 9', 'Navigate to view'],
          ['Ctrl/Cmd + N', 'New project'],
          ['Escape', 'Close modal / palette'],
        ].map(([key, desc], i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : settingsRowStyle}>
            <kbd style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 600,
              padding: '0.1875rem 0.5rem', borderRadius: '0.25rem',
              background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)', minWidth: '6rem', textAlign: 'center',
            }}>{key}</kbd>
            <span style={{ ...labelStyle, flex: 1 }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Tour ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={sectionTitleStyle}>
          <RotateCcw size={15} />
          Onboarding
        </div>
        <div style={lastRowStyle}>
          <span style={labelStyle}>Restart the guided tour to revisit all app sections</span>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }}
            onClick={() => {
              localStorage.removeItem('aeo-onboarding-completed')
              window.location.reload()
            }}
          >
            <RotateCcw size={12} />
            Restart Tour
          </button>
        </div>
      </div>

      {/* ════ SECTION 2: PROJECT SETTINGS ════ */}
      {activeProject && (
        <>
          <div style={sectionLabelStyle}>Project Settings</div>

          {/* ── General ── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={sectionTitleStyle}>
              <FolderCog size={15} />
              General
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Project Name</span>
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input className="input-field" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" aria-label="Project name" style={{ flex: 1 }} />
                <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveProjectName} disabled={!projectName.trim()}>
                  {projectNameSaved ? <Check size={13} /> : <Save size={13} />}
                  {projectNameSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Website URL</span>
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input className="input-field" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://example.com" aria-label="Website URL" style={{ flex: 1 }} />
                <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveProjectUrl}>
                  {projectUrlSaved ? <Check size={13} /> : <Save size={13} />}
                  {projectUrlSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Webflow Site ID</span>
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input className="input-field" value={webflowSiteId} onChange={(e) => setWebflowSiteId(e.target.value)} placeholder="Optional" aria-label="Webflow site ID" style={{ flex: 1 }} />
                <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveWebflowId}>
                  {webflowSaved ? <Check size={13} /> : <Save size={13} />}
                  {webflowSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <div style={lastRowStyle}>
              <span style={{ ...labelStyle, alignSelf: 'flex-start', paddingTop: '0.625rem' }}>Notes</span>
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <textarea className="input-field" value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} placeholder="Add notes about this project..." aria-label="Project notes" rows={3} style={{ flex: 1, resize: 'vertical', minHeight: '3.75rem' }} />
                <button className="btn-primary" style={{ ...inlineSaveBtnStyle, alignSelf: 'flex-start', marginTop: '0.125rem' }} onClick={handleSaveNotes}>
                  {notesSaved ? <Check size={13} /> : <Save size={13} />}
                  {notesSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Google Data Sources (per-project GSC + GA4 property selection) ── */}
          {google.isConnected && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={sectionTitleStyle}>
                <Plug size={15} />
                Google Data Sources
              </div>

              <div style={{ padding: '0 1.25rem 0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                  Select which Search Console and Analytics properties to use for this project.
                </p>
              </div>

              <div style={settingsRowStyle}>
                <span style={labelStyle}>Search Console</span>
                <div style={{ flex: 1 }}>
                  <GscPropertySelector
                    accessToken={google.accessToken}
                    selectedProperty={activeProject?.gscProperty || null}
                    onSelectProperty={(siteUrl) => {
                      if (activeProject) {
                        updateProject(activeProject.id, { gscProperty: siteUrl })
                        addToast('success', `Search Console property set: ${siteUrl}`)
                      }
                    }}
                  />
                </div>
              </div>

              <div style={lastRowStyle}>
                <span style={labelStyle}>Analytics 4</span>
                <div style={{ flex: 1 }}>
                  <Ga4PropertySelector
                    accessToken={google.accessToken}
                    selectedProperty={activeProject?.ga4Property || null}
                    onSelectProperty={(propertyName) => {
                      if (activeProject) {
                        updateProject(activeProject.id, { ga4Property: propertyName })
                        addToast('success', `GA4 property set: ${propertyName}`)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Project Profile (from Questionnaire) ── */}
          {activeProject?.questionnaire?.completedAt && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={sectionTitleStyle}>
                <ClipboardList size={15} />
                Project Profile
              </div>

              <div style={settingsRowStyle}>
                <span style={labelStyle}>Industry</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {INDUSTRY_LABELS[activeProject.questionnaire.industry] || activeProject.questionnaire.industry || '\u2014'}
                  {activeProject.questionnaire.industryOther ? ` (${activeProject.questionnaire.industryOther})` : ''}
                </span>
              </div>

              <div style={settingsRowStyle}>
                <span style={labelStyle}>Region</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {REGION_LABELS[activeProject.questionnaire.region] || activeProject.questionnaire.region || '\u2014'}
                </span>
              </div>

              <div style={settingsRowStyle}>
                <span style={labelStyle}>Audience</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {AUDIENCE_LABELS[activeProject.questionnaire.audience] || activeProject.questionnaire.audience || '\u2014'}
                </span>
              </div>

              <div style={settingsRowStyle}>
                <span style={labelStyle}>Primary Goal</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {GOAL_LABELS[activeProject.questionnaire.primaryGoal] || activeProject.questionnaire.primaryGoal || '\u2014'}
                </span>
              </div>

              <div style={settingsRowStyle}>
                <span style={labelStyle}>Target Engines</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {(activeProject.questionnaire.targetEngines || []).map(e => (
                    <span key={e} style={{
                      fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                      background: 'rgba(255,107,53,0.1)', color: 'var(--color-phase-1)',
                      fontWeight: 500,
                    }}>
                      {ENGINE_LABELS[e] || e}
                    </span>
                  ))}
                  {(!activeProject.questionnaire.targetEngines || activeProject.questionnaire.targetEngines.length === 0) && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{'\u2014'}</span>
                  )}
                </div>
              </div>

              {activeProject.questionnaire.maturity && (
                <div style={settingsRowStyle}>
                  <span style={labelStyle}>AEO Maturity</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {MATURITY_LABELS[activeProject.questionnaire.maturity] || activeProject.questionnaire.maturity}
                  </span>
                </div>
              )}

              {activeProject.questionnaire.contentType && (
                <div style={settingsRowStyle}>
                  <span style={labelStyle}>Content Type</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {CONTENT_LABELS[activeProject.questionnaire.contentType] || activeProject.questionnaire.contentType}
                  </span>
                </div>
              )}

              <div style={lastRowStyle}>
                <span style={labelStyle}>Completed</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {new Date(activeProject.questionnaire.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}

          {/* ── Monitoring ── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={sectionTitleStyle}>
              <Activity size={15} />
              Monitoring
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Auto-monitoring</span>
              <ToggleSwitch checked={monitoringEnabled} onChange={handleMonitoringToggle} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {monitoringEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Check Interval</span>
              <select style={smallSelectStyle} value={monitoringInterval} onChange={(e) => handleMonitoringInterval(e.target.value)} aria-label="Check interval">
                <option value="1d">Every day</option>
                <option value="3d">Every 3 days</option>
                <option value="7d">Every 7 days</option>
                <option value="14d">Every 14 days</option>
                <option value="30d">Every 30 days</option>
              </select>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Alert Threshold</span>
              <input type="number" className="input-field" value={alertThreshold} onChange={(e) => handleAlertThreshold(e.target.value)} min={1} max={50} aria-label="Alert threshold percentage" style={{ width: '5rem' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>% change triggers alert</span>
            </div>

            <div style={lastRowStyle}>
              <span style={labelStyle}>Last Run</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{lastMonitorRun}</span>
            </div>
          </div>

          {/* ── Client Portal ── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={sectionTitleStyle}>
              <Share2 size={15} />
              Client Portal
            </div>

            <div style={{ padding: '0 1.25rem 1rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                Generate a read-only link to share project progress, metrics, and analysis with clients — no login required.
              </p>

              <button
                className="btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', marginBottom: shareLink ? '0.75rem' : 0 }}
                onClick={handleGenerateShareLink}
                disabled={generatingLink}
              >
                {generatingLink ? <Loader2 size={14} className="portal-spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={14} />}
                {generatingLink ? 'Generating…' : 'Generate Share Link'}
              </button>

              {shareLink && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    style={{
                      flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)',
                      fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', outline: 'none',
                    }}
                    onClick={e => e.target.select()}
                  />
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.375rem 0.625rem', fontSize: '0.6875rem', flexShrink: 0 }}
                    onClick={handleCopyLink}
                  >
                    {linkCopied ? <Check size={13} /> : <Copy size={13} />}
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}

              {existingShares.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Active Links ({existingShares.length})
                  </span>
                  {existingShares.map(share => (
                    <div key={share.token} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0', fontSize: '0.75rem' }}>
                      <Link2 size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', flex: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6875rem' }}>
                        …{share.token.slice(-8)}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>
                        {new Date(share.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleRevokeShare(share.token)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem' }}
                        title="Revoke link"
                        aria-label="Revoke share link"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── EmailJS Configuration ── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={sectionTitleStyle}>
              <Mail size={15} />
              Email Service (EmailJS)
            </div>

            <div style={{ padding: '0 1.25rem 0.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                Configure EmailJS to send emails directly from the app — reports, digests, and notifications. Free at{' '}
                <a href="https://emailjs.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-phase-1)', textDecoration: 'underline' }}>emailjs.com</a>
                {' '}(200 emails/month).
              </p>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Service ID</span>
              <input className="input-field" value={emailServiceId} onChange={(e) => setEmailServiceId(e.target.value)} placeholder="service_xxxxxxx" aria-label="EmailJS Service ID" style={{ flex: 1 }} />
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Template ID</span>
              <input className="input-field" value={emailTemplateId} onChange={(e) => setEmailTemplateId(e.target.value)} placeholder="template_xxxxxxx" aria-label="EmailJS Template ID" style={{ flex: 1 }} />
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Public Key</span>
              <input className="input-field" value={emailPublicKey} onChange={(e) => setEmailPublicKey(e.target.value)} placeholder="Your public key" aria-label="EmailJS Public Key" style={{ flex: 1 }} />
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                  background: emailConfigExists ? 'var(--color-success)' : 'var(--text-disabled)', flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.8125rem', color: emailConfigExists ? 'var(--color-success)' : 'var(--text-tertiary)' }}>
                  {emailConfigExists ? 'Configured' : 'Not configured'}
                </span>
              </div>
            </div>

            <div style={lastRowStyle}>
              <span style={labelStyle} />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  style={inlineSaveBtnStyle}
                  onClick={handleSaveEmailConfig}
                >
                  {emailConfigSaved ? <Check size={13} /> : <Save size={13} />}
                  {emailConfigSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }}
                  onClick={handleTestEmail}
                  disabled={testingSend || !emailConfigExists}
                >
                  {testingSend ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                  {testingSend ? 'Sending…' : 'Send Test'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Email Digest ── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={sectionTitleStyle}>
              <Mail size={15} />
              Email Digest
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Auto-digest</span>
              <ToggleSwitch checked={digestEnabled} onChange={handleDigestToggle} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {digestEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Frequency</span>
              <select style={smallSelectStyle} value={digestInterval} onChange={(e) => handleDigestInterval(e.target.value)} aria-label="Digest frequency">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Recipient</span>
              <input
                className="input-field"
                type="email"
                value={digestEmail}
                onChange={(e) => handleDigestEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Digest recipient email"
                style={{ flex: 1 }}
              />
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Include</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={digestIncludeMetrics} onChange={(e) => handleDigestIncludeMetrics(e.target.checked)} style={{ accentColor: 'var(--color-phase-1)' }} />
                  AEO Metrics &amp; Scores
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={digestIncludeAlerts} onChange={(e) => handleDigestIncludeAlerts(e.target.checked)} style={{ accentColor: 'var(--color-phase-1)' }} />
                  Score Change Alerts
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={digestIncludeRecommendations} onChange={(e) => handleDigestIncludeRecommendations(e.target.checked)} style={{ accentColor: 'var(--color-phase-1)' }} />
                  Analysis &amp; Recommendations
                </label>
              </div>
            </div>

            <div style={lastRowStyle}>
              <span style={labelStyle}>Last Sent</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{lastDigestSent}</span>
            </div>
          </div>

          {/* ── Data ── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={sectionTitleStyle}>
              <Database size={15} />
              Data
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Transfer</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={handleExportProject}>
                  <Download size={13} />
                  Export Project Data
                </button>
                <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={handleImportProject}>
                  <Upload size={13} />
                  Import Project Data
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
                <button
                  className="btn-secondary"
                  style={{
                    fontSize: '0.75rem', padding: '0.4375rem 0.875rem',
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
                    fontSize: '0.75rem', padding: '0.4375rem 0.875rem',
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
          <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--color-error)', borderWidth: 1 }}>
            <div style={{ ...sectionTitleStyle, color: 'var(--color-error)' }}>
              <AlertTriangle size={15} />
              Danger Zone
            </div>

            <div style={settingsRowStyle}>
              <span style={labelStyle}>Reset Checklist</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {!resetChecklistConfirm ? (
                  <button
                    onClick={handleResetChecklist}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem',
                      background: 'none', border: '1px solid var(--color-error)', borderRadius: '0.625rem',
                      color: 'var(--color-error)', fontSize: '0.75rem', fontWeight: 500,
                      fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms ease',
                    }}
                  >
                    <RotateCcw size={13} />
                    Reset All Checklist Progress
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>Are you sure?</span>
                    <button
                      onClick={handleResetChecklist}
                      style={{
                        padding: '0.375rem 0.75rem', background: 'var(--color-error)', border: 'none',
                        borderRadius: '0.5rem', color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                        fontFamily: 'var(--font-body)', cursor: 'pointer',
                      }}
                    >
                      Confirm Reset
                    </button>
                    <button onClick={() => setResetChecklistConfirm(false)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={lastRowStyle}>
              <span style={labelStyle}>Delete Project</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem',
                      background: 'var(--color-error)', border: 'none', borderRadius: '0.625rem',
                      color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                      fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms ease',
                    }}
                  >
                    <Trash2 size={13} />
                    Delete Project
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>
                      Type <strong>"{activeProject.name}"</strong> to confirm deletion:
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        className="input-field"
                        value={deleteTypedName}
                        onChange={(e) => setDeleteTypedName(e.target.value)}
                        placeholder={activeProject.name}
                        aria-label="Type project name to confirm deletion"
                        style={{ width: '13.75rem', borderColor: 'var(--color-error)' }}
                      />
                      <button
                        onClick={handleDeleteProject}
                        disabled={deleteTypedName !== activeProject.name}
                        style={{
                          padding: '0.4375rem 0.875rem',
                          background: deleteTypedName === activeProject.name ? 'var(--color-error)' : 'var(--text-disabled)',
                          border: 'none', borderRadius: '0.5rem', color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                          fontFamily: 'var(--font-body)',
                          cursor: deleteTypedName === activeProject.name ? 'pointer' : 'not-allowed',
                          opacity: deleteTypedName === activeProject.name ? 1 : 0.5,
                        }}
                      >
                        Delete Forever
                      </button>
                      <button onClick={() => { setDeleteConfirm(false); setDeleteTypedName('') }} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.75rem' }}>
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
    </div>
  )
}
