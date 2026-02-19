/**
 * UserSettingsSection — Profile, API Key, Google Integration, Appearance, Keyboard Shortcuts, Tour.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  User, Key, Palette, Globe, Save, Check, Eye, EyeOff, Plug, Loader2, RefreshCw,
  Unplug, RotateCcw, ClipboardList,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { SUPPORTED_LANGUAGES, loadLanguage } from '../../i18n'
import { useGoogleIntegration } from '../../hooks/useGoogleIntegration'
import { isGoogleOAuthConfigured } from '../../utils/googleAuth'
import { useToast } from '../../components/Toast'
import logger from '../../utils/logger'
import {
  ToggleSwitch, sectionLabelStyle, sectionTitleStyle, settingsRowStyle,
  lastRowStyle, labelStyle, inlineSaveBtnStyle, smallSelectStyle, flash,
} from './SettingsShared'

export default function UserSettingsSection({ user }) {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation('app')
  const { addToast } = useToast()
  const google = useGoogleIntegration(user)

  // Language
  const [currentLang, setCurrentLang] = useState(i18n.language?.split('-')[0] || 'en')

  // Profile
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false)

  // API Key
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic-api-key') || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)

  // Preferences
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
    return prefs.animationsEnabled !== false
  })
  const [defaultDateRange, setDefaultDateRange] = useState(() => {
    const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
    return prefs.defaultDateRange || '7d'
  })
  const [notificationSound, setNotificationSound] = useState(() => {
    const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
    return prefs.notificationSound !== false
  })

  // Derived
  const authProvider = user?.providerData?.[0]?.providerId
  const authMethodLabel = authProvider === 'google.com' ? 'Google' : 'Email/Password'
  const apiKeyExists = apiKey.trim().length > 0

  // Handlers
  const handleSaveDisplayName = useCallback(async () => {
    if (!displayName.trim()) return
    setNameSaving(true)
    try {
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

  const handleThemeChange = useCallback((val) => setTheme(val), [setTheme])

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

  const handleNotificationSoundToggle = useCallback((val) => {
    setNotificationSound(val)
    const prefs = JSON.parse(localStorage.getItem('aeo-user-preferences') || '{}')
    localStorage.setItem('aeo-user-preferences', JSON.stringify({ ...prefs, notificationSound: val }))
  }, [])

  const handleLanguageChange = useCallback(async (code) => {
    setCurrentLang(code)
    try {
      await loadLanguage(code)
    } catch (err) {
      logger.warn('Failed to load language:', err)
      setCurrentLang('en')
    }
  }, [])

  return (
    <>
      <div style={sectionLabelStyle}>{t('userSettings.title')}</div>

      {/* ── Profile ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><User size={15} /> {t('userSettings.profile')}</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('userSettings.displayName')}</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="input-field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('userSettings.namePlaceholder')} aria-label="Display name" style={{ flex: 1 }} />
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveDisplayName} disabled={nameSaving || !displayName.trim()}>
              {nameSaveSuccess ? <Check size={13} /> : <Save size={13} />}
              {nameSaveSuccess ? t('userSettings.saved') : t('userSettings.save')}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('userSettings.email')}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{user?.email || '--'}</span>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>{t('userSettings.authMethod')}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{authMethodLabel}</span>
        </div>
      </div>

      {/* ── API Key ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Key size={15} /> {t('userSettings.apiKey')}</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('userSettings.anthropicApiKey')}</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input className="input-field" type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-ant-..." aria-label="Anthropic API key" style={{ width: '100%', paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowApiKey(!showApiKey)} aria-label={showApiKey ? t('userSettings.hideApiKey') : t('userSettings.showApiKey')} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0.25rem', display: 'flex', alignItems: 'center' }}>
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveApiKey}>
              {apiKeySaved ? <Check size={13} /> : <Save size={13} />}
              {apiKeySaved ? t('userSettings.saved') : t('userSettings.save')}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('userSettings.status')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: apiKeyExists ? 'var(--color-success)' : 'var(--text-disabled)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: apiKeyExists ? 'var(--color-success)' : 'var(--text-tertiary)' }}>
              {apiKeyExists ? t('userSettings.connected') : t('userSettings.notSet')}
            </span>
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            {t('userSettings.apiKeyDesc')}
          </span>
        </div>
      </div>

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
            <div style={{ padding: '0.75rem 1rem', borderRadius: '0.625rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>{t('userSettings.setupRequired')}</strong>
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
          <>
            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('userSettings.status')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {google.isLoading ? (
                  <><Loader2 size={13} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} /><span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{t('userSettings.checking')}</span></>
                ) : google.isConnected ? (
                  <><div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} /><span style={{ fontSize: '0.8125rem', color: 'var(--color-success)' }}>{t('userSettings.connectedStatus')}</span></>
                ) : google.isExpired ? (
                  <><div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} /><span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)' }}>{t('userSettings.expired')}</span></>
                ) : (
                  <><div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--text-disabled)', flexShrink: 0 }} /><span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{t('userSettings.notConnected')}</span></>
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
                  {new Date(google.connectedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('userSettings.scopes')}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontWeight: 500 }}>{t('userSettings.searchConsoleRead')}</span>
                <span style={{ fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 500 }}>{t('userSettings.analytics4Read')}</span>
              </div>
            </div>

            {google.error && (
              <div style={{ padding: '0 1.25rem 0.5rem' }}>
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '0.75rem', color: 'var(--color-error)', lineHeight: 1.5 }}>
                  {google.error}
                </div>
              </div>
            )}

            <div style={lastRowStyle}>
              <span style={labelStyle} />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {google.isConnected ? (
                  <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={async () => { await google.disconnect(); addToast('success', 'Google account disconnected') }}>
                    <Unplug size={13} /> {t('userSettings.disconnect')}
                  </button>
                ) : google.isExpired ? (
                  <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={async () => { await google.reconnect(); if (google.status === 'connected') addToast('success', 'Google account reconnected') }} disabled={google.connecting}>
                    {google.connecting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
                    {google.connecting ? t('userSettings.reconnecting') : t('userSettings.reconnect')}
                  </button>
                ) : (
                  <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={async () => { await google.connect() }} disabled={google.connecting}>
                    {google.connecting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plug size={13} />}
                    {google.connecting ? t('userSettings.connecting') : t('userSettings.connectGoogleAccount')}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Appearance ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><Palette size={15} /> {t('userSettings.appearance')}</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('userSettings.theme')}</span>
          <select style={smallSelectStyle} value={theme} onChange={(e) => handleThemeChange(e.target.value)} aria-label={t('userSettings.theme')}>
            <option value="dark">{t('userSettings.dark')}</option>
            <option value="light">{t('userSettings.light')}</option>
            <option value="auto">{t('userSettings.autoSystem')}</option>
          </select>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}><Globe size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.375rem' }} />{t('userSettings.language')}</span>
          <select style={smallSelectStyle} value={currentLang} onChange={(e) => handleLanguageChange(e.target.value)} aria-label="Language">
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.nativeLabel}</option>
            ))}
          </select>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('userSettings.animations')}</span>
          <ToggleSwitch checked={animationsEnabled} onChange={handleAnimationsToggle} label="Toggle animations" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{animationsEnabled ? t('userSettings.enabled') : t('userSettings.disabled')}</span>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('userSettings.notificationSound')}</span>
          <ToggleSwitch checked={notificationSound} onChange={handleNotificationSoundToggle} label="Toggle notification sound" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{notificationSound ? t('userSettings.on') : t('userSettings.off')}</span>
        </div>

        <div style={lastRowStyle}>
          <span style={labelStyle}>{t('userSettings.defaultDateRange')}</span>
          <select style={smallSelectStyle} value={defaultDateRange} onChange={(e) => handleDefaultDateRange(e.target.value)} aria-label={t('userSettings.defaultDateRange')}>
            <option value="today">{t('userSettings.today')}</option>
            <option value="7d">{t('userSettings.days7')}</option>
            <option value="30d">{t('userSettings.days30')}</option>
            <option value="90d">{t('userSettings.days90')}</option>
          </select>
        </div>
      </div>

      {/* ── Keyboard Shortcuts ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><ClipboardList size={15} /> {t('userSettings.keyboardShortcuts')}</div>
        {[
          ['Ctrl/Cmd + K', t('userSettings.shortcutCommandPalette')],
          ['1 – 9', t('userSettings.shortcutNavigateView')],
          ['Ctrl/Cmd + N', t('userSettings.shortcutNewProject')],
          ['Escape', t('userSettings.shortcutCloseModal')],
        ].map(([key, desc], i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : settingsRowStyle}>
            <kbd style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.5rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', minWidth: '6rem', textAlign: 'center' }}>{key}</kbd>
            <span style={{ ...labelStyle, flex: 1 }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Tour ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={sectionTitleStyle}><RotateCcw size={15} /> {t('userSettings.onboarding')}</div>
        <div style={lastRowStyle}>
          <span style={labelStyle}>{t('userSettings.restartTourDesc')}</span>
          <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem' }} onClick={() => { localStorage.removeItem('aeo-onboarding-completed'); window.location.reload() }}>
            <RotateCcw size={12} /> {t('userSettings.restartTour')}
          </button>
        </div>
      </div>
    </>
  )
}
