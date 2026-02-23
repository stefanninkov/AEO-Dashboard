/**
 * ProjectDigestSection — Dedicated digest email settings with live preview.
 *
 * Surfaces the existing digest infrastructure (emailDigest.js + useDigestScheduler)
 * with a proper UI: live preview of the email body, toggle/frequency/recipient
 * controls, content section toggles, and a "Send Test" button.
 */
import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Mail, Eye, EyeOff, Send, Loader2, Check, Clock, CalendarClock,
  BarChart3, AlertTriangle, Lightbulb, FileText,
} from 'lucide-react'
import { generateDigestBody } from '../../utils/emailDigest'
import { sendDigestEmail } from '../../utils/emailDigest'
import { isEmailConfigured } from '../../utils/emailService'
import { useToast } from '../../components/Toast'
import {
  ToggleSwitch, sectionTitleStyle, settingsRowStyle, lastRowStyle,
  labelStyle, flash,
} from './SettingsShared'

export default function ProjectDigestSection({ activeProject, updateProject, user }) {
  const { t } = useTranslation('app')
  const { addToast } = useToast()

  // ── Local state mirrors project.settings ──
  const [digestEnabled, setDigestEnabled] = useState(activeProject?.settings?.digestEnabled || false)
  const [digestInterval, setDigestInterval] = useState(activeProject?.settings?.digestInterval || 'weekly')
  const [digestEmail, setDigestEmail] = useState(activeProject?.settings?.digestEmail || '')
  const [digestIncludeMetrics, setDigestIncludeMetrics] = useState(activeProject?.settings?.digestIncludeMetrics !== false)
  const [digestIncludeAlerts, setDigestIncludeAlerts] = useState(activeProject?.settings?.digestIncludeAlerts !== false)
  const [digestIncludeRecommendations, setDigestIncludeRecommendations] = useState(activeProject?.settings?.digestIncludeRecommendations !== false)

  const [showPreview, setShowPreview] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [testSent, setTestSent] = useState(false)

  // ── Derived ──
  const emailConfigured = isEmailConfigured()
  const lastSent = activeProject?.settings?.lastDigestSent
    ? new Date(activeProject.settings.lastDigestSent).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : t('projectDigest.never')

  // ── Compute next scheduled send ──
  const nextSendLabel = useMemo(() => {
    if (!digestEnabled || !digestEmail) return null
    const lastSentTime = activeProject?.settings?.lastDigestSent
      ? new Date(activeProject.settings.lastDigestSent).getTime()
      : null

    const intervalMs = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    }[digestInterval] || 7 * 24 * 60 * 60 * 1000

    if (!lastSentTime) return t('projectDigest.nextSendSoon')
    const nextTime = lastSentTime + intervalMs
    if (nextTime < Date.now()) return t('projectDigest.nextSendSoon')

    const d = new Date(nextTime)
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }, [digestEnabled, digestEmail, digestInterval, activeProject?.settings?.lastDigestSent, t])

  // ── Live preview body ──
  const previewBody = useMemo(() => {
    if (!activeProject) return ''
    const settings = {
      ...(activeProject.settings || {}),
      digestIncludeMetrics,
      digestIncludeAlerts,
      digestIncludeRecommendations,
    }
    try {
      return generateDigestBody(activeProject, settings)
    } catch {
      return '(Unable to generate preview)'
    }
  }, [activeProject, digestIncludeMetrics, digestIncludeAlerts, digestIncludeRecommendations])

  // ── Helpers ──
  const updateSetting = useCallback((key, val) => {
    if (activeProject) {
      updateProject(activeProject.id, { settings: { ...activeProject.settings, [key]: val } })
    }
  }, [activeProject, updateProject])

  const handleToggle = useCallback((val) => { setDigestEnabled(val); updateSetting('digestEnabled', val) }, [updateSetting])
  const handleInterval = useCallback((val) => { setDigestInterval(val); updateSetting('digestInterval', val) }, [updateSetting])
  const handleEmail = useCallback((val) => { setDigestEmail(val); updateSetting('digestEmail', val) }, [updateSetting])
  const handleIncludeMetrics = useCallback((val) => { setDigestIncludeMetrics(val); updateSetting('digestIncludeMetrics', val) }, [updateSetting])
  const handleIncludeAlerts = useCallback((val) => { setDigestIncludeAlerts(val); updateSetting('digestIncludeAlerts', val) }, [updateSetting])
  const handleIncludeRecommendations = useCallback((val) => { setDigestIncludeRecommendations(val); updateSetting('digestIncludeRecommendations', val) }, [updateSetting])

  const handleSendTest = useCallback(async () => {
    if (!emailConfigured) {
      addToast('error', t('projectDigest.configureEmailFirst'))
      return
    }
    if (!digestEmail) {
      addToast('error', t('projectDigest.setRecipientFirst'))
      return
    }
    setSendingTest(true)
    try {
      await sendDigestEmail(activeProject)
      updateSetting('lastDigestSent', new Date().toISOString())
      flash(setTestSent)
      addToast('success', t('projectDigest.testSent'))
    } catch (err) {
      addToast('error', err.message || t('projectDigest.testFailed'))
    } finally {
      setSendingTest(false)
    }
  }, [emailConfigured, digestEmail, activeProject, updateSetting, addToast, t])

  // ── Section count for preview ──
  const sectionCount = [digestIncludeMetrics, digestIncludeAlerts, digestIncludeRecommendations].filter(Boolean).length + 1 // +1 for checklist (always included)

  return (
    <>
      {/* ── Schedule & Recipients ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}>
          <CalendarClock size={15} /> {t('projectDigest.schedule')}
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectDigest.autoDigest')}</span>
          <ToggleSwitch checked={digestEnabled} onChange={handleToggle} label="Toggle email digest" />
          <span style={{ fontSize: '0.75rem', color: digestEnabled ? 'var(--color-success)' : 'var(--text-tertiary)' }}>
            {digestEnabled ? t('projectDigest.enabled') : t('projectDigest.disabled')}
          </span>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectDigest.frequency')}</span>
          <select className="input-field input-sm" value={digestInterval} onChange={e => handleInterval(e.target.value)} aria-label="Digest frequency">
            <option value="daily">{t('projectDigest.daily')}</option>
            <option value="weekly">{t('projectDigest.weekly')}</option>
            <option value="monthly">{t('projectDigest.monthly')}</option>
          </select>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectDigest.recipient')}</span>
          <input
            className="input-field"
            type="email"
            value={digestEmail}
            onChange={e => handleEmail(e.target.value)}
            placeholder={user?.email || 'you@example.com'}
            aria-label="Digest recipient email"
            style={{ flex: 1 }}
          />
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectDigest.lastSent')}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
            {lastSent}
          </span>
        </div>

        {nextSendLabel && (
          <div style={lastRowStyle}>
            <span style={labelStyle}>{t('projectDigest.nextSend')}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-phase-1)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CalendarClock size={12} />
              {nextSendLabel}
            </span>
          </div>
        )}
      </div>

      {/* ── Content Sections ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}>
          <FileText size={15} /> {t('projectDigest.contentSections')}
        </div>

        <div style={{ padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6, borderBottom: '0.0625rem solid var(--border-subtle)' }}>
          {t('projectDigest.contentDesc')}
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Check size={12} style={{ color: 'var(--color-success)' }} />
              {t('projectDigest.checklistProgress')}
            </span>
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', fontStyle: 'italic' }}>{t('projectDigest.alwaysIncluded')}</span>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <BarChart3 size={12} style={{ color: 'var(--color-phase-1)' }} />
              {t('projectDigest.metricsScores')}
            </span>
          </span>
          <ToggleSwitch checked={digestIncludeMetrics} onChange={handleIncludeMetrics} label="Include metrics" />
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <AlertTriangle size={12} style={{ color: 'var(--color-phase-2)' }} />
              {t('projectDigest.scoreAlerts')}
            </span>
          </span>
          <ToggleSwitch checked={digestIncludeAlerts} onChange={handleIncludeAlerts} label="Include alerts" />
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lightbulb size={12} style={{ color: 'var(--color-phase-3)' }} />
              {t('projectDigest.recommendations')}
            </span>
          </span>
          <ToggleSwitch checked={digestIncludeRecommendations} onChange={handleIncludeRecommendations} label="Include recommendations" />
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div
          style={{ ...sectionTitleStyle, cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setShowPreview(p => !p)}
          role="button"
          tabIndex={0}
          aria-expanded={showPreview}
          aria-label="Toggle digest preview"
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPreview(p => !p) } }}
        >
          {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
          <span style={{ flex: 1 }}>{t('projectDigest.preview')}</span>
          <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 500, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
            {sectionCount} {t('projectDigest.sectionsIncluded')}
          </span>
        </div>

        {showPreview && (
          <div style={{ padding: '1rem 1.25rem' }}>
            <div className="digest-preview-container">
              <pre className="digest-preview-body">
                {previewBody}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}>
          <Send size={15} /> {t('projectDigest.actions')}
        </div>

        <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
          {!emailConfigured && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-3)',
              background: 'rgba(37, 99, 235, 0.08)', borderRadius: 'var(--radius-md)',
              border: '0.0625rem solid rgba(37, 99, 235, 0.2)',
              fontSize: 'var(--text-xs)', color: 'var(--accent)',
            }}>
              <Mail size={13} />
              {t('projectDigest.configureEmailHint')}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary btn-sm"
              onClick={handleSendTest}
              disabled={sendingTest || !emailConfigured || !digestEmail}
            >
              {sendingTest
                ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                : testSent
                  ? <Check size={13} />
                  : <Send size={13} />
              }
              {sendingTest
                ? t('projectDigest.sending')
                : testSent
                  ? t('projectDigest.sent')
                  : t('projectDigest.sendTestNow')
              }
            </button>

            <button
              className="btn-secondary btn-sm"
              onClick={() => setShowPreview(true)}
            >
              <Eye size={13} />
              {t('projectDigest.showPreview')}
            </button>
          </div>

          <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', marginTop: 'var(--space-3)', lineHeight: 1.5 }}>
            {t('projectDigest.actionHint')}
          </p>
        </div>
      </div>
    </>
  )
}
