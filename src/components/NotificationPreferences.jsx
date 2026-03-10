import { memo } from 'react'
import { Bell, Volume2, VolumeX, Clock, Mail } from 'lucide-react'

const NOTIFICATION_TYPES = [
  { id: 'comment', label: 'Comments', desc: 'New comments on items' },
  { id: 'mention', label: 'Mentions', desc: 'When someone @mentions you' },
  { id: 'assignment', label: 'Assignments', desc: 'Task assignment changes' },
  { id: 'team', label: 'Team Changes', desc: 'Member additions and removals' },
  { id: 'score', label: 'Score Updates', desc: 'AEO score changes' },
  { id: 'progress', label: 'Progress', desc: 'Checklist items checked/unchecked' },
  { id: 'monitor_alert', label: 'Monitor Alerts', desc: 'Monitoring threshold alerts' },
  { id: 'automation', label: 'Automations', desc: 'Automation results and errors' },
]

/**
 * NotificationPreferences — Settings panel for notification behavior.
 */
function NotificationPreferences({ prefs, updatePrefs }) {
  const toggleStyle = (active) => ({
    width: '2rem', height: '1.125rem', borderRadius: '9999px',
    background: active ? 'var(--accent)' : 'var(--border-subtle)',
    border: 'none', cursor: 'pointer', position: 'relative',
    transition: 'background 150ms', flexShrink: 0,
  })

  const dotStyle = (active) => ({
    position: 'absolute', top: '0.125rem',
    left: active ? '1rem' : '0.125rem',
    width: '0.875rem', height: '0.875rem', borderRadius: '50%',
    background: '#fff', transition: 'left 150ms',
    border: '0.0625rem solid var(--border-subtle)',
  })

  const Toggle = ({ value, onChange }) => (
    <button style={toggleStyle(value)} onClick={() => onChange(!value)}>
      <div style={dotStyle(value)} />
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* General settings */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <Bell size={14} style={{ color: 'var(--accent)' }} />
          General Settings
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)' }}>Show Toast Notifications</div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Display floating alerts for new notifications</div>
            </div>
            <Toggle value={prefs.showToasts} onChange={v => updatePrefs({ showToasts: v })} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                {prefs.soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                Sound Alerts
              </div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Play a sound for new notifications</div>
            </div>
            <Toggle value={prefs.soundEnabled} onChange={v => updatePrefs({ soundEnabled: v })} />
          </div>

          {prefs.showToasts && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <Clock size={12} />
                  Toast Duration
                </div>
                <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>How long toasts stay visible</div>
              </div>
              <select
                value={prefs.toastDuration}
                onChange={e => updatePrefs({ toastDuration: parseInt(e.target.value) })}
                style={{
                  padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-2xs)',
                  border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
                }}
              >
                <option value={3000}>3 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={8000}>8 seconds</option>
                <option value={10000}>10 seconds</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Type-level muting */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)' }}>
          Notification Types
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {NOTIFICATION_TYPES.map(type => {
            const muted = prefs.mutedTypes.includes(type.id)
            return (
              <div key={type.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-2)', borderRadius: 'var(--radius-md)',
                background: muted ? 'transparent' : 'var(--hover-bg)',
                opacity: muted ? 0.5 : 1, transition: 'all 150ms',
              }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
                    {type.desc}
                  </div>
                </div>
                <Toggle
                  value={!muted}
                  onChange={() => {
                    const mutedTypes = muted
                      ? prefs.mutedTypes.filter(t => t !== type.id)
                      : [...prefs.mutedTypes, type.id]
                    updatePrefs({ mutedTypes })
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Digest settings */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <Mail size={14} style={{ color: 'var(--accent)' }} />
          Email Digest
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)' }}>Enable Email Digest</div>
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Receive a summary of notifications by email</div>
          </div>
          <Toggle value={prefs.digestEnabled} onChange={v => updatePrefs({ digestEnabled: v })} />
        </div>

        {prefs.digestEnabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Frequency:</span>
            {['daily', 'weekly'].map(freq => (
              <button
                key={freq}
                onClick={() => updatePrefs({ digestFrequency: freq })}
                style={{
                  padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-2xs)',
                  fontWeight: 600, border: '0.0625rem solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: prefs.digestFrequency === freq ? 'var(--accent)' : 'var(--bg-input)',
                  color: prefs.digestFrequency === freq ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 100ms',
                }}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(NotificationPreferences)
