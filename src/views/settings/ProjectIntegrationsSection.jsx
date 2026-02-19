/**
 * ProjectIntegrationsSection — Monitoring, Client Portal, EmailJS, Email Digest.
 */
import { useState, useCallback, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import {
  Activity, Share2, Mail, Link2, Copy, Check, Loader2, Save, Send, X,
} from 'lucide-react'
import { createShareLink, getProjectShares, revokeShareLink } from '../../hooks/useShareLink'
import { getEmailConfig, saveEmailConfig, isEmailConfigured, sendEmail } from '../../utils/emailService'
import { useToast } from '../../components/Toast'
import logger from '../../utils/logger'
import {
  ToggleSwitch, sectionTitleStyle, settingsRowStyle, lastRowStyle,
  labelStyle, inlineSaveBtnStyle, smallSelectStyle, flash,
} from './SettingsShared'

export default function ProjectIntegrationsSection({ activeProject, updateProject, user }) {
  const { t } = useTranslation('app')
  const { addToast } = useToast()

  // Monitoring
  const [monitoringEnabled, setMonitoringEnabled] = useState(activeProject?.settings?.monitoringEnabled || false)
  const [monitoringInterval, setMonitoringInterval] = useState(activeProject?.settings?.monitoringInterval || '7d')
  const [alertThreshold, setAlertThreshold] = useState(activeProject?.settings?.notifyThreshold || 10)

  // Share link
  const [shareLink, setShareLink] = useState('')
  const [generatingLink, setGeneratingLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [existingShares, setExistingShares] = useState(() => getProjectShares(activeProject?.id))

  // EmailJS
  const [emailServiceId, setEmailServiceId] = useState('')
  const [emailTemplateId, setEmailTemplateId] = useState('')
  const [emailPublicKey, setEmailPublicKey] = useState('')
  const [emailConfigSaved, setEmailConfigSaved] = useState(false)
  const [testingSend, setTestingSend] = useState(false)

  // Digest
  const [digestEnabled, setDigestEnabled] = useState(activeProject?.settings?.digestEnabled || false)
  const [digestInterval, setDigestInterval] = useState(activeProject?.settings?.digestInterval || 'weekly')
  const [digestEmail, setDigestEmail] = useState(activeProject?.settings?.digestEmail || '')
  const [digestIncludeMetrics, setDigestIncludeMetrics] = useState(activeProject?.settings?.digestIncludeMetrics !== false)
  const [digestIncludeAlerts, setDigestIncludeAlerts] = useState(activeProject?.settings?.digestIncludeAlerts !== false)
  const [digestIncludeRecommendations, setDigestIncludeRecommendations] = useState(activeProject?.settings?.digestIncludeRecommendations !== false)

  // Load EmailJS config
  useEffect(() => {
    const config = getEmailConfig()
    setEmailServiceId(config.serviceId || '')
    setEmailTemplateId(config.templateId || '')
    setEmailPublicKey(config.publicKey || '')
  }, [])

  // Derived
  const lastMonitorRun = activeProject?.lastMonitorRun
    ? new Date(activeProject.lastMonitorRun).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : t('integrations.never')
  const emailConfigExists = emailServiceId.trim() && emailTemplateId.trim() && emailPublicKey.trim()
  const lastDigestSent = activeProject?.settings?.lastDigestSent
    ? new Date(activeProject.settings.lastDigestSent).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : t('integrations.never')

  // Helpers to update settings
  const updateSetting = useCallback((key, val) => {
    if (activeProject) updateProject(activeProject.id, { settings: { ...activeProject.settings, [key]: val } })
  }, [activeProject, updateProject])

  // ── Monitoring handlers ──
  const handleMonitoringToggle = useCallback((val) => { setMonitoringEnabled(val); updateSetting('monitoringEnabled', val) }, [updateSetting])
  const handleMonitoringInterval = useCallback((val) => { setMonitoringInterval(val); updateSetting('monitoringInterval', val) }, [updateSetting])
  const handleAlertThreshold = useCallback((value) => {
    const num = Math.min(50, Math.max(1, parseInt(value) || 1))
    setAlertThreshold(num)
    updateSetting('notifyThreshold', num)
  }, [updateSetting])

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

  // ── EmailJS handlers ──
  const handleSaveEmailConfig = useCallback(() => {
    saveEmailConfig({ serviceId: emailServiceId.trim(), templateId: emailTemplateId.trim(), publicKey: emailPublicKey.trim() })
    flash(setEmailConfigSaved)
    addToast('success', 'EmailJS configuration saved')
  }, [emailServiceId, emailTemplateId, emailPublicKey, addToast])

  const handleTestEmail = useCallback(async () => {
    if (!isEmailConfigured()) { addToast('error', 'Save your EmailJS credentials first'); return }
    setTestingSend(true)
    try {
      await sendEmail(user?.email || 'test@example.com', 'AEO Dashboard — Test Email', 'This is a test email from AEO Dashboard.\n\nIf you received this, your EmailJS configuration is working correctly!')
      addToast('success', 'Test email sent successfully!')
    } catch (err) { addToast('error', err.message || 'Failed to send test email') }
    finally { setTestingSend(false) }
  }, [user?.email, addToast])

  // ── Digest handlers ──
  const handleDigestToggle = useCallback((val) => { setDigestEnabled(val); updateSetting('digestEnabled', val) }, [updateSetting])
  const handleDigestInterval = useCallback((val) => { setDigestInterval(val); updateSetting('digestInterval', val) }, [updateSetting])
  const handleDigestEmail = useCallback((val) => { setDigestEmail(val); updateSetting('digestEmail', val) }, [updateSetting])
  const handleDigestIncludeMetrics = useCallback((val) => { setDigestIncludeMetrics(val); updateSetting('digestIncludeMetrics', val) }, [updateSetting])
  const handleDigestIncludeAlerts = useCallback((val) => { setDigestIncludeAlerts(val); updateSetting('digestIncludeAlerts', val) }, [updateSetting])
  const handleDigestIncludeRecommendations = useCallback((val) => { setDigestIncludeRecommendations(val); updateSetting('digestIncludeRecommendations', val) }, [updateSetting])

  return (
    <>
      {/* ── Monitoring ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Activity size={15} /> {t('integrations.monitoring')}</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.autoMonitoring')}</span>
          <ToggleSwitch checked={monitoringEnabled} onChange={handleMonitoringToggle} label="Toggle auto-monitoring" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{monitoringEnabled ? t('integrations.enabled') : t('integrations.disabled')}</span>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.checkInterval')}</span>
          <select style={smallSelectStyle} value={monitoringInterval} onChange={(e) => handleMonitoringInterval(e.target.value)} aria-label="Check interval">
            <option value="1d">{t('integrations.everyDay')}</option>
            <option value="3d">{t('integrations.every3Days')}</option>
            <option value="7d">{t('integrations.every7Days')}</option>
            <option value="14d">{t('integrations.every14Days')}</option>
            <option value="30d">{t('integrations.every30Days')}</option>
          </select>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.alertThreshold')}</span>
          <input type="number" className="input-field" value={alertThreshold} onChange={(e) => handleAlertThreshold(e.target.value)} min={1} max={50} aria-label="Alert threshold percentage" style={{ width: '5rem' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('integrations.changeTriggers')}</span>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>{t('integrations.lastRun')}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{lastMonitorRun}</span>
        </div>
      </div>

      {/* ── Client Portal ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Share2 size={15} /> {t('integrations.clientPortal')}</div>
        <div style={{ padding: '0 1.25rem 1rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
            {t('integrations.clientPortalDesc')}
          </p>

          <button className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', marginBottom: shareLink ? '0.75rem' : 0 }} onClick={handleGenerateShareLink} disabled={generatingLink}>
            {generatingLink ? <Loader2 size={14} className="portal-spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={14} />}
            {generatingLink ? t('integrations.generating') : t('integrations.generateShareLink')}
          </button>

          {shareLink && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <input type="text" value={shareLink} readOnly style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', outline: 'none' }} onClick={e => e.target.select()} />
              <button className="btn-secondary" style={{ padding: '0.375rem 0.625rem', fontSize: '0.6875rem', flexShrink: 0 }} onClick={handleCopyLink}>
                {linkCopied ? <Check size={13} /> : <Copy size={13} />}
                {linkCopied ? t('integrations.copied') : t('common:actions.copy')}
              </button>
            </div>
          )}

          {existingShares.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {t('integrations.activeLinks', { count: existingShares.length })}
              </span>
              {existingShares.map(share => (
                <div key={share.token} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0', fontSize: '0.75rem' }}>
                  <Link2 size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', flex: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6875rem' }}>{'\u2026'}{share.token.slice(-8)}</span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>{new Date(share.createdAt).toLocaleDateString()}</span>
                  <button onClick={() => handleRevokeShare(share.token)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem' }} title={t('integrations.revokeLink')} aria-label={t('integrations.revokeLink')}><X size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── EmailJS ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Mail size={15} /> {t('integrations.emailService')}</div>
        <div style={{ padding: '0 1.25rem 0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            <Trans i18nKey="integrations.emailServiceDesc" t={t} components={{ link: <a href="https://emailjs.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-phase-1)', textDecoration: 'underline' }} /> }} />
          </p>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.serviceId')}</span>
          <input className="input-field" value={emailServiceId} onChange={(e) => setEmailServiceId(e.target.value)} placeholder="service_xxxxxxx" aria-label="EmailJS Service ID" style={{ flex: 1 }} />
        </div>
        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.templateId')}</span>
          <input className="input-field" value={emailTemplateId} onChange={(e) => setEmailTemplateId(e.target.value)} placeholder="template_xxxxxxx" aria-label="EmailJS Template ID" style={{ flex: 1 }} />
        </div>
        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.publicKey')}</span>
          <input className="input-field" value={emailPublicKey} onChange={(e) => setEmailPublicKey(e.target.value)} placeholder="Your public key" aria-label="EmailJS Public Key" style={{ flex: 1 }} />
        </div>
        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.status')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: emailConfigExists ? 'var(--color-success)' : 'var(--text-disabled)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: emailConfigExists ? 'var(--color-success)' : 'var(--text-tertiary)' }}>{emailConfigExists ? t('integrations.configured') : t('integrations.notConfigured')}</span>
          </div>
        </div>
        <div style={lastRowStyle}>
          <span style={labelStyle} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveEmailConfig}>
              {emailConfigSaved ? <Check size={13} /> : <Save size={13} />}
              {emailConfigSaved ? t('integrations.saved') : t('common:actions.save')}
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={handleTestEmail} disabled={testingSend || !emailConfigExists}>
              {testingSend ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
              {testingSend ? t('integrations.sending') : t('integrations.sendTest')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Email Digest ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Mail size={15} /> {t('integrations.emailDigest')}</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.autoDigest')}</span>
          <ToggleSwitch checked={digestEnabled} onChange={handleDigestToggle} label="Toggle email digest" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{digestEnabled ? t('integrations.enabled') : t('integrations.disabled')}</span>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.frequency')}</span>
          <select style={smallSelectStyle} value={digestInterval} onChange={(e) => handleDigestInterval(e.target.value)} aria-label="Digest frequency">
            <option value="daily">{t('integrations.daily')}</option>
            <option value="weekly">{t('integrations.weekly')}</option>
            <option value="monthly">{t('integrations.monthly')}</option>
          </select>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.recipient')}</span>
          <input className="input-field" type="email" value={digestEmail} onChange={(e) => handleDigestEmail(e.target.value)} placeholder="you@example.com" aria-label="Digest recipient email" style={{ flex: 1 }} />
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('integrations.include')}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={digestIncludeMetrics} onChange={(e) => handleDigestIncludeMetrics(e.target.checked)} style={{ accentColor: 'var(--color-phase-1)' }} />
              {t('integrations.aeoMetricsScores')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={digestIncludeAlerts} onChange={(e) => handleDigestIncludeAlerts(e.target.checked)} style={{ accentColor: 'var(--color-phase-1)' }} />
              {t('integrations.scoreChangeAlerts')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={digestIncludeRecommendations} onChange={(e) => handleDigestIncludeRecommendations(e.target.checked)} style={{ accentColor: 'var(--color-phase-1)' }} />
              {t('integrations.analysisRecommendations')}
            </label>
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>{t('integrations.lastSent')}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{lastDigestSent}</span>
        </div>
      </div>
    </>
  )
}
