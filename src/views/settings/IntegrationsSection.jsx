/**
 * IntegrationsSection — Consolidated integrations tab: Google, EmailJS, future integrations.
 */
import { useState } from 'react'
import { Plug, Loader2, RefreshCw, Unplug } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGoogleIntegration } from '../../hooks/useGoogleIntegration'
import { isGoogleOAuthConfigured } from '../../utils/googleAuth'
import { useToast } from '../../components/Toast'
import {
  sectionTitleStyle, settingsRowStyle, lastRowStyle, labelStyle,
} from './SettingsShared'

export default function IntegrationsSection({ user }) {
  const { t } = useTranslation('app')
  const { addToast } = useToast()
  const google = useGoogleIntegration(user)

  return (
    <>
      {/* ── Google Integration ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Plug size={15} /> {t('userSettings.googleIntegration')}</div>

        <div style={{ padding: '0 1.25rem 0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            {t('userSettings.googleIntegrationDesc')}
          </p>
        </div>

        {!isGoogleOAuthConfigured() ? (
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '0.625rem',
              background: 'rgba(245,158,11,0.08)', border: '0.0625rem solid rgba(245,158,11,0.15)',
              fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--text-secondary)' }}>{t('userSettings.setupRequired')}</strong>
              <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '0.25rem' }}>
                  Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-phase-1)', textDecoration: 'underline' }}>Google Cloud Console</a>
                </li>
                <li style={{ marginBottom: '0.25rem' }}>Create an OAuth 2.0 Client ID (Web application)</li>
                <li style={{ marginBottom: '0.25rem' }}>Add your site URL as an authorized redirect URI</li>
                <li style={{ marginBottom: '0.25rem' }}>Enable <em>Google Search Console API</em> and <em>Google Analytics Data API</em></li>
                <li>
                  Add <code style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                    padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'var(--hover-bg)',
                  }}>VITE_GOOGLE_CLIENT_ID=your_client_id</code> to your <code style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                    padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'var(--hover-bg)',
                  }}>.env</code> file and redeploy
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('userSettings.status')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {google.isLoading ? (
                  <>
                    <Loader2 size={13} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{t('userSettings.checking')}</span>
                  </>
                ) : google.isConnected ? (
                  <>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)' }}>{t('userSettings.connectedStatus')}</span>
                  </>
                ) : google.isExpired ? (
                  <>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)' }}>{t('userSettings.expired')}</span>
                  </>
                ) : (
                  <>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--text-disabled)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{t('userSettings.notConnected')}</span>
                  </>
                )}
              </div>
            </div>

            {google.connectedEmail && (
              <div style={settingsRowStyle}>
                <span style={labelStyle}>{t('userSettings.account')}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{google.connectedEmail}</span>
              </div>
            )}

            {google.connectedAt && google.isConnected && (
              <div style={settingsRowStyle}>
                <span style={labelStyle}>{t('userSettings.connectedLabel')}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {new Date(google.connectedAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            )}

            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('userSettings.scopes')}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{
                  fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                  background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontWeight: 500,
                }}>{t('userSettings.searchConsoleRead')}</span>
                <span style={{
                  fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                  background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 500,
                }}>{t('userSettings.analytics4Read')}</span>
              </div>
            </div>

            {google.error && (
              <div style={{ padding: '0 1.25rem 0.5rem' }}>
                <div style={{
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  background: 'rgba(239,68,68,0.08)', border: '0.0625rem solid rgba(239,68,68,0.15)',
                  fontSize: '0.75rem', color: 'var(--color-error)', lineHeight: 1.5,
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
                    <Unplug size={13} /> {t('userSettings.disconnect')}
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
                    {google.connecting ? t('userSettings.reconnecting') : t('userSettings.reconnect')}
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }}
                    onClick={async () => { await google.connect() }}
                    disabled={google.connecting}
                  >
                    {google.connecting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plug size={13} />}
                    {google.connecting ? t('userSettings.connecting') : t('userSettings.connectGoogleAccount')}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Future integrations placeholder ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Plug size={15} /> More Integrations</div>
        <div style={{
          padding: '1.5rem 1.25rem',
          textAlign: 'center',
          color: 'var(--text-disabled)',
          fontSize: '0.8125rem',
        }}>
          More integrations coming soon — Slack notifications, Zapier webhooks, and more.
        </div>
      </div>
    </>
  )
}
