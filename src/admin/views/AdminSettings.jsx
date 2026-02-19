import { useState, useEffect, useCallback } from 'react'
import { Settings, Shield, Bell, Globe, Database, Copy, Check, Save, Loader } from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'

/* ── Toggle ── */
function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: '2.5rem', height: '1.375rem', borderRadius: '0.6875rem',
          background: checked ? 'var(--color-phase-1)' : 'var(--hover-bg)',
          border: '1px solid var(--border-subtle)',
          position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: '1rem', height: '1rem', borderRadius: '50%',
          background: 'white', position: 'absolute',
          top: '0.125rem', left: checked ? '1.25rem' : '0.125rem',
          transition: 'left 0.2s',
        }} />
      </div>
    </label>
  )
}

/* ── Section card ── */
function SettingSection({ icon: Icon, title, children }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem',
        paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)',
      }}>
        <Icon size={16} style={{ color: 'var(--color-phase-1)' }} />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

const CONFIG_DOC_ID = 'platform'

export default function AdminSettings({ user }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [signupsEnabled, setSignupsEnabled] = useState(true)
  const [waitlistEnabled, setWaitlistEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [saveStatus, setSaveStatus] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Load config from Firestore on mount
  const loadConfig = useCallback(async () => {
    try {
      const configDoc = await getDoc(doc(db, 'config', CONFIG_DOC_ID))
      if (configDoc.exists()) {
        const data = configDoc.data()
        if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode)
        if (data.signupsEnabled !== undefined) setSignupsEnabled(data.signupsEnabled)
        if (data.waitlistEnabled !== undefined) setWaitlistEnabled(data.waitlistEnabled)
        if (data.emailNotifications !== undefined) setEmailNotifications(data.emailNotifications)
      }
    } catch (err) {
      console.warn('Could not load config (may not have permissions):', err.message)
    } finally {
      setLoadingConfig(false)
    }
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  // Save config to Firestore
  const handleSave = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      await setDoc(doc(db, 'config', CONFIG_DOC_ID), {
        maintenanceMode,
        signupsEnabled,
        waitlistEnabled,
        emailNotifications,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'unknown',
      }, { merge: true })
      setSaveStatus('saved')
      setHasChanges(false)
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      console.error('Failed to save config:', err)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (setter) => (value) => {
    setter(value)
    setHasChanges(true)
  }

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user?.uid || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Admin Settings
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            Platform configuration and feature flags
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {saveStatus === 'saved' && (
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Check size={14} /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
              Failed to save (check Firestore rules)
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', fontSize: '0.8125rem',
              opacity: (!hasChanges && !saving) ? 0.5 : 1,
            }}
          >
            {saving ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Platform Settings */}
        <SettingSection icon={Globe} title="Platform">
          <Toggle
            label="Maintenance Mode"
            checked={maintenanceMode}
            onChange={handleToggle(setMaintenanceMode)}
            disabled={loadingConfig}
          />
          <Toggle
            label="Allow New Signups"
            checked={signupsEnabled}
            onChange={handleToggle(setSignupsEnabled)}
            disabled={loadingConfig}
          />
          <Toggle
            label="Waitlist Open"
            checked={waitlistEnabled}
            onChange={handleToggle(setWaitlistEnabled)}
            disabled={loadingConfig}
          />
          {loadingConfig && (
            <div style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.15)',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              lineHeight: 1.5,
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
              Loading settings...
            </div>
          )}
        </SettingSection>

        {/* Notifications */}
        <SettingSection icon={Bell} title="Notifications">
          <Toggle
            label="Email on new signups"
            checked={emailNotifications}
            onChange={handleToggle(setEmailNotifications)}
            disabled={loadingConfig}
          />
          <div style={{
            padding: '0.625rem 0.75rem',
            borderRadius: '0.5rem',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.15)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            lineHeight: 1.5,
            marginTop: '0.5rem',
          }}>
            Email notifications require a Cloud Function or third-party service (SendGrid, Resend, etc.). The toggle state is saved to Firestore and can be read by your backend.
          </div>
        </SettingSection>

        {/* Admin Info */}
        <SettingSection icon={Shield} title="Admin Account">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Name</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user?.displayName || '\u2014'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Email</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user?.email || '\u2014'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>UID</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                  {user?.uid || '\u2014'}
                </code>
                <button onClick={handleCopyUid} className="icon-btn" title="Copy UID" style={{ flexShrink: 0 }}>
                  {copied ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Database Info */}
        <SettingSection icon={Database} title="Database">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Project ID</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {import.meta.env.VITE_FIREBASE_PROJECT_ID || '\u2014'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Auth Domain</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '\u2014'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Storage</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '\u2014'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.25rem' }}>Config Path</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                config/{CONFIG_DOC_ID}
              </div>
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  )
}
