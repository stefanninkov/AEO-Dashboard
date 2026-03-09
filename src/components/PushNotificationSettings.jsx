import { memo, useState, useEffect } from 'react'
import { Bell, BellOff, Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import {
  isPushSupported, getPermissionState, requestPermission,
  loadPushPrefs, savePushPrefs, PUSH_TRIGGER_TYPES,
} from '../utils/pushNotifications'

/**
 * PushNotificationSettings — Browser push notification preferences UI.
 */
function PushNotificationSettings() {
  const [supported] = useState(isPushSupported)
  const [permission, setPermission] = useState(getPermissionState)
  const [prefs, setPrefs] = useState(loadPushPrefs)

  const updatePrefs = (changes) => {
    const next = { ...prefs, ...changes }
    setPrefs(next)
    savePushPrefs(next)
  }

  const handleEnable = async () => {
    const result = await requestPermission(true)
    setPermission(result)
    if (result === 'granted') {
      updatePrefs({ enabled: true })
    }
  }

  if (!supported) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-disabled)' }}>
          <BellOff size={14} />
          <span style={{ fontSize: 'var(--text-xs)' }}>Browser push notifications are not supported in this browser.</span>
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <h3 style={{
        fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
        margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
      }}>
        <Bell size={14} style={{ color: 'var(--accent)' }} />
        Browser Push Notifications
      </h3>

      {/* Permission status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: permission === 'granted'
          ? 'color-mix(in srgb, var(--color-success) 8%, transparent)'
          : permission === 'denied'
            ? 'color-mix(in srgb, var(--color-error) 8%, transparent)'
            : 'var(--hover-bg)',
        borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)',
      }}>
        {permission === 'granted' && <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />}
        {permission === 'denied' && <XCircle size={14} style={{ color: 'var(--color-error)' }} />}
        {permission === 'default' && <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)' }}>
            {permission === 'granted' ? 'Push notifications enabled' :
             permission === 'denied' ? 'Push notifications blocked' :
             'Push notifications not configured'}
          </div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
            {permission === 'denied'
              ? 'You can re-enable in your browser settings'
              : permission === 'default'
                ? 'Click enable to receive browser notifications'
                : prefs.enabled ? 'Notifications will appear even when the tab is in background' : 'Toggle on to start receiving notifications'}
          </div>
        </div>
        {permission === 'default' && (
          <button onClick={handleEnable} style={enableBtnStyle}>Enable</button>
        )}
        {permission === 'granted' && (
          <button
            onClick={() => updatePrefs({ enabled: !prefs.enabled })}
            style={{
              ...enableBtnStyle,
              background: prefs.enabled ? 'var(--color-success)' : 'var(--hover-bg)',
              color: prefs.enabled ? '#fff' : 'var(--text-secondary)',
              border: prefs.enabled ? 'none' : '0.0625rem solid var(--border-subtle)',
            }}
          >
            {prefs.enabled ? 'On' : 'Off'}
          </button>
        )}
      </div>

      {/* Trigger preferences */}
      {permission === 'granted' && prefs.enabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
            Notification Triggers
          </div>
          {Object.entries(PUSH_TRIGGER_TYPES).map(([key, config]) => (
            <label key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', transition: 'background 100ms',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {config.label}
                </span>
                {config.priority === 'high' && (
                  <span style={{
                    fontSize: '0.5rem', fontWeight: 600, padding: '0 0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
                    color: 'var(--color-warning)',
                  }}>
                    Important
                  </span>
                )}
              </div>
              <input
                type="checkbox"
                checked={prefs.triggers[key] !== false}
                onChange={() => {
                  updatePrefs({
                    triggers: { ...prefs.triggers, [key]: !prefs.triggers[key] },
                  })
                }}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const cardStyle = {
  background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
  borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
}

const enableBtnStyle = {
  padding: 'var(--space-1) var(--space-3)',
  background: 'var(--accent)', border: 'none',
  borderRadius: 'var(--radius-md)', cursor: 'pointer',
  fontSize: 'var(--text-2xs)', fontWeight: 600, color: '#fff',
  flexShrink: 0,
}

export default memo(PushNotificationSettings)
