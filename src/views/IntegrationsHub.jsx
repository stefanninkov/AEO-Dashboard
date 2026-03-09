import { memo, useState } from 'react'
import {
  Plug, Key, Plus, Trash2, Eye, EyeOff, Copy,
  CheckCircle2, XCircle, AlertTriangle, Clock,
  Shield, RefreshCw, Settings,
} from 'lucide-react'
import { useApiKeys } from '../hooks/useApiKeys'
import { useIntegrations } from '../hooks/useIntegrations'

/**
 * IntegrationsHub — API keys management and external service connections.
 */
function IntegrationsHub({ activeProject, updateProject, user }) {
  const [tab, setTab] = useState('integrations')
  const apiKeys = useApiKeys({ activeProject, updateProject, user })
  const integrations = useIntegrations({ activeProject, updateProject })

  const TABS = [
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'api-keys', label: 'API Keys', icon: Key },
  ]

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '76rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
        <Plug size={18} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Integrations Hub
        </h1>
        <span style={{
          fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--accent)',
          background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          padding: '0.125rem var(--space-2)', borderRadius: 'var(--radius-full)',
        }}>
          {integrations.connectedCount}/{integrations.totalAvailable} connected
        </span>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: '0 0 var(--space-4)' }}>
        Connect external services and manage API access
      </p>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 'var(--space-1)',
        borderBottom: '0.0625rem solid var(--border-subtle)',
        marginBottom: 'var(--space-4)',
      }}>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-tertiary)',
                borderBottom: tab === t.id ? '0.125rem solid var(--accent)' : '0.125rem solid transparent',
                marginBottom: '-0.0625rem',
              }}
            >
              <Icon size={12} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'integrations' && <IntegrationsTab integrations={integrations} />}
      {tab === 'api-keys' && <ApiKeysTab apiKeys={apiKeys} />}
    </div>
  )
}

function IntegrationsTab({ integrations }) {
  const [configuring, setConfiguring] = useState(null)
  const [formData, setFormData] = useState({})

  const handleConnect = (service) => {
    integrations.connect(service.id, formData)
    setConfiguring(null)
    setFormData({})
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {Object.entries(integrations.groupedIntegrations).map(([category, services]) => (
        <div key={category}>
          <h3 style={{
            fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.04rem',
            margin: '0 0 var(--space-2)',
          }}>
            {category}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))', gap: 'var(--space-3)' }}>
            {services.map(service => (
              <div key={service.id} style={{
                background: 'var(--bg-card)',
                border: `0.0625rem solid ${service.connected ? 'var(--color-success)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
                display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-lg)' }}>{service.icon}</span>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {service.name}
                      </div>
                      {service.connected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '0.5625rem', color: 'var(--color-success)' }}>
                          <CheckCircle2 size={10} /> Connected
                        </div>
                      )}
                    </div>
                  </div>
                  {service.connected ? (
                    <button
                      onClick={() => integrations.disconnect(service.id)}
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--color-error)',
                      }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => { setConfiguring(service.id); setFormData({}) }}
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        background: 'var(--accent)', border: 'none',
                        borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        fontSize: 'var(--text-2xs)', fontWeight: 600, color: '#fff',
                      }}
                    >
                      Connect
                    </button>
                  )}
                </div>

                <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.4 }}>
                  {service.description}
                </p>

                {/* Config form */}
                {configuring === service.id && (
                  <div style={{
                    padding: 'var(--space-3)', marginTop: 'var(--space-1)',
                    background: 'var(--hover-bg)', borderRadius: 'var(--radius-md)',
                    display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
                  }}>
                    {service.configFields.map(field => (
                      <div key={field.key}>
                        <label style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>
                          {field.label}
                        </label>
                        {field.type === 'boolean' ? (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={formData[field.key] || false}
                              onChange={e => setFormData(d => ({ ...d, [field.key]: e.target.checked }))}
                            />
                            Enabled
                          </label>
                        ) : field.type === 'select' ? (
                          <select
                            value={formData[field.key] || ''}
                            onChange={e => setFormData(d => ({ ...d, [field.key]: e.target.value }))}
                            style={inputStyle}
                          >
                            <option value="">Select...</option>
                            {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={field.type === 'password' ? 'password' : 'text'}
                            value={formData[field.key] || ''}
                            onChange={e => setFormData(d => ({ ...d, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            style={inputStyle}
                          />
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <button onClick={() => setConfiguring(null)} style={cancelBtnStyle}>Cancel</button>
                      <button onClick={() => handleConnect(service)} style={saveBtnStyle}>Connect</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ApiKeysTab({ apiKeys }) {
  const [showCreate, setShowCreate] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [keyPerms, setKeyPerms] = useState(['read'])
  const [keyExpiry, setKeyExpiry] = useState('')

  const handleCreate = () => {
    if (!keyName.trim()) return
    apiKeys.createKey({
      name: keyName.trim(),
      permissions: keyPerms,
      expiresInDays: keyExpiry ? parseInt(keyExpiry) : null,
    })
    setKeyName('')
    setKeyPerms(['read'])
    setKeyExpiry('')
    setShowCreate(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* New key reveal */}
      {apiKeys.showNewKey && (
        <div style={{
          background: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
          border: '0.0625rem solid var(--color-success)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
            <Shield size={14} style={{ color: 'var(--color-success)' }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              API Key Created
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-warning)', margin: '0 0 var(--space-2)', fontWeight: 600 }}>
            Copy this key now — it won't be shown again!
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-2)', background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
          }}>
            <code style={{ flex: 1, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {apiKeys.showNewKey.fullKey}
            </code>
            <button
              onClick={() => { navigator.clipboard?.writeText(apiKeys.showNewKey.fullKey) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', flexShrink: 0 }}
            >
              <Copy size={14} />
            </button>
          </div>
          <button
            onClick={apiKeys.dismissNewKey}
            style={{ ...saveBtnStyle, marginTop: 'var(--space-2)' }}
          >
            I've copied the key
          </button>
        </div>
      )}

      {/* Create button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          {apiKeys.activeKeys.length} active key{apiKeys.activeKeys.length !== 1 ? 's' : ''}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--accent)', border: 'none',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            fontSize: 'var(--text-xs)', fontWeight: 600, color: '#fff',
          }}
        >
          <Plus size={12} /> Create Key
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--accent)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        }}>
          <div>
            <label style={labelStyle}>Key Name</label>
            <input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="My API Key" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Permissions</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['read', 'write', 'admin'].map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={keyPerms.includes(p)}
                    onChange={() => setKeyPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Expires In (days, blank for never)</label>
            <input type="number" value={keyExpiry} onChange={e => setKeyExpiry(e.target.value)} placeholder="Never" min="1" style={{ ...inputStyle, width: '8rem' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleCreate} disabled={!keyName.trim()} style={{ ...saveBtnStyle, opacity: keyName.trim() ? 1 : 0.4 }}>
              Create
            </button>
          </div>
        </div>
      )}

      {/* Keys table */}
      {apiKeys.activeKeys.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Key</th>
                <th style={thStyle}>Permissions</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Expires</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.activeKeys.map(key => (
                <tr key={key.id} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{key.name}</span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
                    {key.hashedKey}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.1875rem' }}>
                      {key.permissions.map(p => (
                        <span key={p} style={{
                          fontSize: '0.5rem', fontWeight: 600, padding: '0 0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          background: p === 'admin' ? 'color-mix(in srgb, var(--color-error) 12%, transparent)' : 'var(--hover-bg)',
                          color: p === 'admin' ? 'var(--color-error)' : 'var(--text-tertiary)',
                        }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>
                    {key.expiresAt ? (
                      <span style={{ fontSize: '0.5625rem', color: new Date(key.expiresAt) < new Date() ? 'var(--color-error)' : 'var(--text-disabled)' }}>
                        {new Date(key.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>Never</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => apiKeys.revokeKey(key.id)}
                      style={{
                        padding: '0.125rem var(--space-1)', background: 'none',
                        border: '0.0625rem solid var(--color-error)',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontSize: '0.5rem', fontWeight: 600, color: 'var(--color-error)',
                      }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Revoked keys */}
      {apiKeys.revokedKeys.length > 0 && (
        <details>
          <summary style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', cursor: 'pointer', marginBottom: 'var(--space-2)' }}>
            {apiKeys.revokedKeys.length} revoked key{apiKeys.revokedKeys.length !== 1 ? 's' : ''}
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {apiKeys.revokedKeys.map(key => (
              <div key={key.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)',
                background: 'var(--hover-bg)', opacity: 0.6,
                fontSize: 'var(--text-2xs)',
              }}>
                <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{key.name}</span>
                <button onClick={() => apiKeys.deleteKey(key.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)' }}>
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-xs)', border: '0.0625rem solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)', background: 'var(--bg-input)',
  color: 'var(--text-primary)', outline: 'none',
}
const labelStyle = {
  fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)',
  display: 'block', marginBottom: '0.25rem',
}
const saveBtnStyle = {
  padding: 'var(--space-1) var(--space-3)', background: 'var(--accent)',
  border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
  fontSize: 'var(--text-2xs)', fontWeight: 600, color: '#fff',
}
const cancelBtnStyle = {
  padding: 'var(--space-1) var(--space-2)', background: 'var(--hover-bg)',
  border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
  cursor: 'pointer', fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)',
}
const thStyle = {
  padding: 'var(--space-2) var(--space-3)', textAlign: 'left',
  fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)',
  textTransform: 'uppercase', letterSpacing: '0.03rem',
}
const tdStyle = { padding: 'var(--space-2) var(--space-3)' }

export default memo(IntegrationsHub)
