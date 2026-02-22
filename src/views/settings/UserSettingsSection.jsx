/**
 * UserSettingsSection — Profile, Appearance, Keyboard Shortcuts, Tour.
 *
 * API Key and Google Integration have moved to ApiUsageSection and IntegrationsSection respectively.
 */
import { useState, useCallback, useRef } from 'react'
import {
  User, Palette, Globe, Save, Check,
  RotateCcw, ClipboardList, BellRing, Camera,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { SUPPORTED_LANGUAGES, loadLanguage } from '../../i18n'
import { getInitials, getAvatarColor } from '../../utils/avatar'
import logger from '../../utils/logger'
import {
  isSupported as browserNotifsSupported,
  isEnabled as browserNotifsEnabled,
  setEnabled as setBrowserNotifsEnabled,
  getPermission as getBrowserNotifsPermission,
  requestPermission as requestBrowserNotifsPermission,
} from '../../utils/browserNotifications'
import {
  ToggleSwitch, sectionTitleStyle, settingsRowStyle,
  lastRowStyle, labelStyle, inlineSaveBtnStyle, smallSelectStyle, flash,
} from './SettingsShared'

/* Resize image to square JPEG data URL for avatar storage */
function resizeImageToDataURL(file, maxSize = 128, quality = 0.8, maxBytes = 50000) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = maxSize
        canvas.height = maxSize
        const ctx = canvas.getContext('2d')
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, maxSize, maxSize)
        const dataURL = canvas.toDataURL('image/jpeg', quality)
        if (dataURL.length > maxBytes) {
          reject(new Error('Image too large after compression. Try a smaller image.'))
        } else {
          resolve(dataURL)
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function UserSettingsSection({ user, updateUserProfile }) {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation('app')

  // Language
  const [currentLang, setCurrentLang] = useState(i18n.language?.split('-')[0] || 'en')

  // Profile
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false)

  // Avatar
  const fileInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || null)
  const [avatarError, setAvatarError] = useState(null)
  const [avatarSaving, setAvatarSaving] = useState(false)

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

  // Browser push notifications
  const browserNotifsAvailable = browserNotifsSupported()
  const [browserNotifs, setBrowserNotifs] = useState(() => browserNotifsEnabled())
  const [browserNotifsPermission, setBrowserNotifsPermission] = useState(() => getBrowserNotifsPermission())

  // Derived
  const authProvider = user?.providerData?.[0]?.providerId
  const authMethodLabel = authProvider === 'google.com' ? 'Google' : 'Email/Password'
  const providerPhotoURL = user?.providerData?.[0]?.photoURL || null

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

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError(null)
    setAvatarSaving(true)
    try {
      const dataURL = await resizeImageToDataURL(file)
      setAvatarPreview(dataURL)
      if (updateUserProfile) await updateUserProfile({ photoURL: dataURL })
    } catch (err) {
      setAvatarError(err.message || 'Failed to process image')
    }
    setAvatarSaving(false)
    e.target.value = ''
  }, [updateUserProfile])

  const handleResetAvatar = useCallback(async () => {
    setAvatarError(null)
    setAvatarSaving(true)
    try {
      setAvatarPreview(providerPhotoURL)
      if (updateUserProfile) await updateUserProfile({ photoURL: providerPhotoURL })
    } catch (err) {
      setAvatarError(err.message || 'Failed to reset photo')
    }
    setAvatarSaving(false)
  }, [updateUserProfile, providerPhotoURL])

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

  const handleBrowserNotifsToggle = useCallback(async (val) => {
    if (val && browserNotifsPermission !== 'granted') {
      const result = await requestBrowserNotifsPermission()
      setBrowserNotifsPermission(result)
      if (result !== 'granted') {
        setBrowserNotifs(false)
        setBrowserNotifsEnabled(false)
        return
      }
    }
    setBrowserNotifs(val)
    setBrowserNotifsEnabled(val)
  }, [browserNotifsPermission])

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
      {/* ── Profile ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><User size={15} /> {t('userSettings.profile')}</div>

        {/* Avatar upload */}
        <div style={{
          padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
          borderBottom: '0.0625rem solid var(--border-subtle)',
        }}>
          <div
            onClick={() => !avatarSaving && fileInputRef.current?.click()}
            style={{
              width: '4rem', height: '4rem', borderRadius: '0.75rem',
              overflow: 'hidden', cursor: avatarSaving ? 'wait' : 'pointer', position: 'relative',
              background: avatarPreview ? 'transparent' : getAvatarColor(user?.displayName),
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              flexShrink: 0,
            }}
            role="button" tabIndex={0} aria-label="Change profile image"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.125rem', fontWeight: 700 }}>{getInitials(user?.displayName)}</span>
            }
            <div className="avatar-upload-overlay"><Camera size={16} /></div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarSaving}
              >
                <Camera size={12} /> Upload Photo
              </button>
              {avatarPreview && avatarPreview !== providerPhotoURL && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                  onClick={handleResetAvatar}
                  disabled={avatarSaving}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>
            {avatarError && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-error)' }}>{avatarError}</span>
            )}
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
              JPG, PNG, or GIF. Max 128x128px.
            </span>
          </div>
        </div>

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
          <span style={labelStyle}><Globe size={13} style={{ display: 'inline', verticalAlign: '-0.125rem', marginRight: '0.375rem' }} />{t('userSettings.language')}</span>
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

        {browserNotifsAvailable && (
          <div style={settingsRowStyle}>
            <span style={labelStyle}>
              <BellRing size={13} style={{ display: 'inline', verticalAlign: '-0.125rem', marginRight: '0.375rem' }} />
              {t('userSettings.browserNotifications')}
            </span>
            <ToggleSwitch
              checked={browserNotifs}
              onChange={handleBrowserNotifsToggle}
              label="Toggle browser notifications"
              disabled={browserNotifsPermission === 'denied'}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {browserNotifsPermission === 'denied'
                ? t('userSettings.browserNotifsDenied')
                : browserNotifs
                  ? t('userSettings.on')
                  : t('userSettings.off')}
            </span>
          </div>
        )}

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
          ['1 \u2013 9', t('userSettings.shortcutNavigateView')],
          ['Ctrl/Cmd + N', t('userSettings.shortcutNewProject')],
          ['Escape', t('userSettings.shortcutCloseModal')],
        ].map(([key, desc], i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : settingsRowStyle}>
            <kbd style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.5rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)', color: 'var(--text-tertiary)', minWidth: '6rem', textAlign: 'center' }}>{key}</kbd>
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
