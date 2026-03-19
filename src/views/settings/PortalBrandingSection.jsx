import { useState, useEffect } from 'react'
import { Palette, Image, FileText } from 'lucide-react'

const sectionTitleStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  fontSize: '0.8125rem', fontWeight: 700,
  padding: '1.125rem 1.25rem 0.875rem',
  color: 'var(--text-primary)',
}
const settingsRowStyle = {
  display: 'flex', alignItems: 'center', gap: '0.875rem',
  padding: '0.875rem 1.25rem',
  borderBottom: '0.0625rem solid var(--border-subtle)',
}
const labelStyle = {
  fontSize: '0.8125rem', color: 'var(--text-secondary)', width: '8.125rem', flexShrink: 0,
}

export default function PortalBrandingSection({ activeProject, updateProject }) {
  const branding = activeProject?.portalBranding || {}
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || '')
  const [accentColor, setAccentColor] = useState(branding.accentColor || '#2563EB')
  const [footerText, setFooterText] = useState(branding.footerText || '')

  useEffect(() => {
    const b = activeProject?.portalBranding || {}
    setLogoUrl(b.logoUrl || '')
    setAccentColor(b.accentColor || '#2563EB')
    setFooterText(b.footerText || '')
  }, [activeProject?.portalBranding])

  function save() {
    updateProject({
      portalBranding: { logoUrl, accentColor, footerText },
    })
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={sectionTitleStyle}>
        <Palette size={14} />
        Portal Branding
      </div>

      <div style={settingsRowStyle}>
        <span style={labelStyle}>Logo URL</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Image size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            className="input-field"
            type="url"
            autoComplete="off"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="https://youragency.com/logo.png"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div style={settingsRowStyle}>
        <span style={labelStyle}>Accent Color</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="color"
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            style={{ width: '2rem', height: '2rem', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm, 0.25rem)' }}
          />
          <input
            className="input-field input-sm"
            type="text"
            autoComplete="off"
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            style={{ width: '6rem', fontFamily: 'var(--font-mono)' }}
          />
        </div>
      </div>

      <div style={settingsRowStyle}>
        <span style={labelStyle}>Footer Text</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            className="input-field"
            type="text"
            autoComplete="off"
            value={footerText}
            onChange={e => setFooterText(e.target.value)}
            placeholder="Powered by Your Agency Name"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary btn-sm" onClick={save}>
          Save Branding
        </button>
      </div>
    </div>
  )
}
