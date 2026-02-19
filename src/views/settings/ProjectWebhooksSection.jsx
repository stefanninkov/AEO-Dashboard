/**
 * ProjectWebhooksSection — Webhooks & Integrations management.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, Plus, Plug, Save, Send, Loader2, Trash2 } from 'lucide-react'
import { useWebhooks } from '../../hooks/useWebhooks'
import { WEBHOOK_EVENT_GROUPS } from '../../utils/webhookDispatcher'
import { useToast } from '../../components/Toast'
import {
  ToggleSwitch, sectionTitleStyle, settingsRowStyle, smallSelectStyle,
} from './SettingsShared'

export default function ProjectWebhooksSection({ activeProject, updateProject }) {
  const { t } = useTranslation('app')
  const { addToast } = useToast()
  const { webhooks, testing: webhookTesting, testResult, addWebhook, updateWebhook, removeWebhook, toggleWebhook, testWebhook } = useWebhooks({ activeProject, updateProject })

  const [webhookFormOpen, setWebhookFormOpen] = useState(false)
  const [webhookName, setWebhookName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookFormat, setWebhookFormat] = useState('json')
  const [webhookEvents, setWebhookEvents] = useState([])
  const [editingWebhookId, setEditingWebhookId] = useState(null)
  const [deleteWebhookConfirm, setDeleteWebhookConfirm] = useState(null)

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={sectionTitleStyle}><Zap size={15} /> {t('webhooks.title')}</div>

      {/* Info banner */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.625rem', lineHeight: 1.5 }}>
          {t('webhooks.description')}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(14, 165, 233, 0.06)', borderRadius: '0.5rem', border: '1px solid rgba(14, 165, 233, 0.12)', fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <Plug size={13} style={{ flexShrink: 0, marginTop: '0.125rem', color: 'var(--color-phase-3)' }} />
          <span>
            {t('webhooks.compatibilityInfo')}
          </span>
        </div>
      </div>

      {/* Add Webhook Button */}
      {!webhookFormOpen && !editingWebhookId && (
        <div style={settingsRowStyle}>
          <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={() => { setWebhookFormOpen(true); setWebhookName(''); setWebhookUrl(''); setWebhookFormat('json'); setWebhookEvents([]) }}>
            <Plus size={13} /> {t('webhooks.addWebhook')}
          </button>
        </div>
      )}

      {/* Webhook Form (Add or Edit) */}
      {(webhookFormOpen || editingWebhookId) && (
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '10rem' }}>
              <label style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>{t('webhooks.name')}</label>
              <input className="input-field" value={webhookName} onChange={(e) => setWebhookName(e.target.value)} placeholder="e.g. Slack — Phase Alerts" aria-label="Webhook name" style={{ fontSize: '0.8125rem' }} />
            </div>
            <div style={{ flex: 2, minWidth: '14rem' }}>
              <label style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>{t('webhooks.webhookUrl')}</label>
              <input className="input-field" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." aria-label="Webhook URL" style={{ fontSize: '0.8125rem' }} />
            </div>
            <div style={{ minWidth: '7rem' }}>
              <label style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>{t('webhooks.format')}</label>
              <select style={smallSelectStyle} value={webhookFormat} onChange={(e) => setWebhookFormat(e.target.value)} aria-label="Webhook format">
                <option value="json">{t('webhooks.formatJson')}</option>
                <option value="slack">{t('webhooks.formatSlack')}</option>
                <option value="discord">{t('webhooks.formatDiscord')}</option>
              </select>
            </div>
          </div>

          {/* Event checkboxes */}
          <div>
            <label style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>{t('webhooks.events')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: webhookEvents.includes('*') ? 'rgba(255, 107, 53, 0.1)' : 'var(--hover-bg)', border: `1px solid ${webhookEvents.includes('*') ? 'var(--color-phase-1)' : 'var(--border-subtle)'}` }}>
                <input type="checkbox" checked={webhookEvents.includes('*')} onChange={(e) => setWebhookEvents(e.target.checked ? ['*'] : [])} style={{ accentColor: 'var(--color-phase-1)' }} />
                {t('webhooks.allEvents')}
              </label>
              {!webhookEvents.includes('*') && Object.entries(WEBHOOK_EVENT_GROUPS).map(([key, group]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: webhookEvents.includes(key) ? 'rgba(14, 165, 233, 0.08)' : 'var(--hover-bg)', border: `1px solid ${webhookEvents.includes(key) ? 'var(--color-phase-3)' : 'var(--border-subtle)'}` }}>
                  <input type="checkbox" checked={webhookEvents.includes(key)} onChange={(e) => { if (e.target.checked) { setWebhookEvents([...webhookEvents, key]) } else { setWebhookEvents(webhookEvents.filter(ev => ev !== key)) } }} style={{ accentColor: 'var(--color-phase-3)' }} />
                  {group.label}
                </label>
              ))}
            </div>
          </div>

          {/* Save / Cancel */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} disabled={!webhookUrl.trim() || webhookEvents.length === 0}
              onClick={() => {
                if (editingWebhookId) {
                  updateWebhook(editingWebhookId, { name: webhookName.trim() || 'Untitled Webhook', url: webhookUrl.trim(), format: webhookFormat, events: webhookEvents })
                  setEditingWebhookId(null)
                } else {
                  addWebhook({ name: webhookName.trim(), url: webhookUrl.trim(), format: webhookFormat, events: webhookEvents })
                  setWebhookFormOpen(false)
                }
                addToast('success', editingWebhookId ? t('webhooks.webhookUpdated') : t('webhooks.webhookAdded'))
              }}>
              <Save size={13} /> {editingWebhookId ? t('webhooks.update') : t('webhooks.save')}
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={() => { setWebhookFormOpen(false); setEditingWebhookId(null) }}>
              {t('webhooks.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Webhook List */}
      {webhooks.map((webhook, idx) => (
        <div key={webhook.id} style={{ padding: '0.75rem 1.25rem', borderBottom: idx < webhooks.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            {/* Status dot */}
            <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: !webhook.enabled ? 'var(--text-disabled)' : webhook.lastStatus === 'success' ? 'var(--color-success)' : webhook.lastStatus === 'error' ? 'var(--color-error)' : 'var(--color-phase-5)' }} />

            {/* Name + URL */}
            <div style={{ flex: 1, minWidth: '8rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: webhook.enabled ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{webhook.name || t('webhooks.untitled')}</span>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', fontFamily: 'var(--font-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '18rem' }}>{webhook.url}</div>
            </div>

            {/* Format badge */}
            <span style={{ fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-heading)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: webhook.format === 'slack' ? 'rgba(74, 21, 75, 0.1)' : webhook.format === 'discord' ? 'rgba(88, 101, 242, 0.1)' : 'var(--hover-bg)', color: webhook.format === 'slack' ? '#4A154B' : webhook.format === 'discord' ? '#5865F2' : 'var(--text-tertiary)' }}>{webhook.format}</span>

            {/* Event count badge */}
            <span style={{ fontSize: '0.625rem', fontWeight: 600, fontFamily: 'var(--font-heading)', padding: '0.125rem 0.375rem', borderRadius: '0.625rem', background: 'rgba(14, 165, 233, 0.08)', color: 'var(--color-phase-3)' }}>
              {webhook.events.includes('*') ? t('webhooks.allEventsLabel') : t('webhooks.eventCount', { count: webhook.events.length })}
            </span>

            {/* Toggle */}
            <ToggleSwitch checked={webhook.enabled} onChange={() => toggleWebhook(webhook.id)} label={`Toggle webhook ${webhook.name || t('webhooks.untitled')}`} />

            {/* Test */}
            <button className="btn-secondary" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }} disabled={webhookTesting === webhook.id} onClick={() => testWebhook(webhook.id)} aria-label={`Test webhook ${webhook.name || t('webhooks.untitled')}`}>
              {webhookTesting === webhook.id ? <Loader2 size={11} className="spin" /> : <Send size={11} />} {t('webhooks.test')}
            </button>

            {/* Edit */}
            <button className="btn-secondary" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }} aria-label={`Edit webhook ${webhook.name || t('webhooks.untitled')}`}
              onClick={() => { setEditingWebhookId(webhook.id); setWebhookFormOpen(false); setWebhookName(webhook.name); setWebhookUrl(webhook.url); setWebhookFormat(webhook.format || 'json'); setWebhookEvents(webhook.events || []) }}>
              {t('webhooks.edit')}
            </button>

            {/* Delete */}
            <button style={{ padding: '0.25rem', borderRadius: '0.375rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: deleteWebhookConfirm === webhook.id ? 'var(--color-error)' : 'var(--text-tertiary)', transition: 'color 100ms' }}
              aria-label={deleteWebhookConfirm === webhook.id ? 'Confirm delete webhook' : `Delete webhook ${webhook.name || t('webhooks.untitled')}`}
              onClick={() => {
                if (deleteWebhookConfirm === webhook.id) { removeWebhook(webhook.id); setDeleteWebhookConfirm(null); addToast('success', t('webhooks.webhookRemoved')) }
                else { setDeleteWebhookConfirm(webhook.id); setTimeout(() => setDeleteWebhookConfirm(null), 3000) }
              }}
              title={deleteWebhookConfirm === webhook.id ? t('webhooks.clickToConfirm') : t('webhooks.removeWebhook')}>
              <Trash2 size={13} />
            </button>
          </div>

          {/* Status line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', paddingLeft: '1.375rem' }}>
            {webhook.lastTriggered && (
              <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                Last: {new Date(webhook.lastTriggered).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {webhook.lastStatus === 'success' && <span style={{ color: 'var(--color-success)', marginLeft: '0.25rem' }}>OK</span>}
              </span>
            )}
            {webhook.lastError && <span style={{ fontSize: '0.625rem', color: 'var(--color-error)' }}>{webhook.lastError}</span>}
            {testResult?.webhookId === webhook.id && (
              <span style={{ fontSize: '0.625rem', fontWeight: 600, color: testResult.success ? 'var(--color-success)' : 'var(--color-error)' }}>
                {testResult.success ? t('webhooks.testSuccess') : t('webhooks.testFailed', { error: testResult.error })}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {webhooks.length === 0 && !webhookFormOpen && (
        <div style={{ padding: '1.5rem 1.25rem', textAlign: 'center' }}>
          <Zap size={24} style={{ color: 'var(--text-disabled)', marginBottom: '0.375rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            {t('webhooks.emptyState')}
          </p>
        </div>
      )}
    </div>
  )
}
