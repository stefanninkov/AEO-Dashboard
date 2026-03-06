/**
 * SeoApiKeysSection — Manage API keys for SEO providers (SEMrush, Ahrefs, Moz).
 */
import { useState, useCallback } from 'react'
import { Key, Eye, EyeOff, Save, Check, ExternalLink, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSeoStore } from '../../stores/useSeoStore'
import { sectionTitleStyle, settingsRowStyle, lastRowStyle, labelStyle } from './SettingsShared'

const SEO_PROVIDERS = [
  {
    id: 'semrush',
    name: 'SEMrush',
    placeholder: 'Enter SEMrush API key...',
    docsUrl: 'https://developer.semrush.com/api/',
    description: 'Domain analytics, keyword research, backlink analysis',
  },
  {
    id: 'ahrefs',
    name: 'Ahrefs',
    placeholder: 'Enter Ahrefs API key...',
    docsUrl: 'https://ahrefs.com/api',
    description: 'Domain rating, organic keywords, backlink profiles',
  },
  {
    id: 'moz',
    name: 'Moz',
    placeholder: 'Enter Moz API credentials (accessId:secretKey)...',
    docsUrl: 'https://moz.com/products/api',
    description: 'Domain authority, page authority, spam score',
  },
]

function flash(setter) {
  setter(true)
  setTimeout(() => setter(false), 2000)
}

export default function SeoApiKeysSection() {
  const { t } = useTranslation('app')
  const apiKeys = useSeoStore((s) => s.apiKeys)
  const setApiKey = useSeoStore((s) => s.setApiKey)
  const useProxy = useSeoStore((s) => s.useProxy)
  const setUseProxy = useSeoStore((s) => s.setUseProxy)

  const [visibleKeys, setVisibleKeys] = useState({})
  const [savedKeys, setSavedKeys] = useState({})
  const [localValues, setLocalValues] = useState(() => ({ ...apiKeys }))

  const toggleVisibility = (id) =>
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleSave = useCallback(
    (id) => {
      setApiKey(id, localValues[id] || '')
      flash((v) => setSavedKeys((prev) => ({ ...prev, [id]: v })))
    },
    [setApiKey, localValues]
  )

  const handleChange = useCallback((id, value) => {
    setLocalValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  const configuredCount = Object.values(apiKeys).filter((k) => k.length > 0).length

  return (
    <div className="card fade-in-up" style={{ overflow: 'hidden' }}>
      <div style={sectionTitleStyle}>
        <Key size={14} style={{ color: 'var(--color-phase-3)' }} />
        {t('settings.seoApiKeys', 'SEO API Keys')}
        {configuredCount > 0 && (
          <span style={{
            marginLeft: 'auto', fontSize: '0.6875rem',
            color: 'var(--color-success)', fontWeight: 600,
          }}>
            {configuredCount}/3 configured
          </span>
        )}
      </div>

      <div style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
        {t('settings.seoApiKeysDesc', 'Connect SEO data providers for real keyword, backlink, and domain authority data. Without API keys, AI-powered estimates are used instead.')}
      </div>

      {SEO_PROVIDERS.map((provider, i) => {
        const isLast = i === SEO_PROVIDERS.length - 1
        const rowStyle = isLast ? lastRowStyle : settingsRowStyle
        const value = localValues[provider.id] || ''
        const isConfigured = apiKeys[provider.id]?.length > 0
        const isSaved = savedKeys[provider.id]

        return (
          <div key={provider.id} style={{ ...rowStyle, flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                flex: 1,
              }}>
                {provider.name}
                {isConfigured && (
                  <Check size={12} style={{ color: 'var(--color-success)', marginLeft: '0.375rem', verticalAlign: 'middle' }} />
                )}
              </span>
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.6875rem', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  textDecoration: 'none',
                }}
              >
                Docs <ExternalLink size={10} />
              </a>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: 0 }}>
              {provider.description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type={visibleKeys[provider.id] ? 'text' : 'password'}
                  className="input-field"
                  value={value}
                  onChange={(e) => handleChange(provider.id, e.target.value)}
                  placeholder={provider.placeholder}
                  style={{ paddingRight: '2.5rem', fontSize: '0.8125rem' }}
                />
                <button
                  onClick={() => toggleVisibility(provider.id)}
                  style={{
                    position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                    padding: '0.25rem',
                  }}
                  title={visibleKeys[provider.id] ? 'Hide' : 'Show'}
                >
                  {visibleKeys[provider.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                className="btn-primary btn-sm"
                onClick={() => handleSave(provider.id)}
                disabled={value === apiKeys[provider.id]}
                style={{ flexShrink: 0 }}
              >
                {isSaved ? <Check size={14} /> : <Save size={14} />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        )
      })}

      {/* Proxy option */}
      <div style={{ ...lastRowStyle, borderTop: '0.0625rem solid var(--border-subtle)' }}>
        <Shield size={14} style={{ color: 'var(--text-tertiary)' }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {t('settings.useBackendProxy', 'Use Backend Proxy')}
          </span>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.125rem 0 0' }}>
            {t('settings.proxyDesc', 'Route API calls through a backend proxy for security. Requires server setup.')}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={useProxy}
          className={`toggle-switch ${useProxy ? 'active' : ''}`}
          onClick={() => setUseProxy(!useProxy)}
        >
          <div className="toggle-switch-dot" />
        </button>
      </div>
    </div>
  )
}
