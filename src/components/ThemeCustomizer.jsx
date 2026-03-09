import { memo } from 'react'
import { Palette, RotateCcw, Type, Circle, Square, Maximize2, Image } from 'lucide-react'

/**
 * ThemeCustomizer — Visual settings panel for theme colors, fonts, and branding.
 */
function ThemeCustomizer({
  config, updateConfig, resetToDefault, selectPreset, activeAccent,
  presets = [], fontOptions = [], sizeOptions = [], radiusOptions = [],
  densityOptions = [],
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Accent color presets */}
      <Section icon={Palette} title="Accent Color">
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset.id)}
              title={preset.name}
              style={{
                width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                background: preset.accent, border: config.preset === preset.id && !config.customAccent
                  ? '0.1875rem solid var(--text-primary)'
                  : '0.125rem solid var(--border-subtle)',
                cursor: 'pointer', transition: 'transform 100ms',
                transform: config.preset === preset.id ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Custom color */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Custom:</label>
          <input
            type="color"
            value={activeAccent}
            onChange={e => updateConfig({ customAccent: e.target.value })}
            style={{ width: '2rem', height: '1.5rem', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
          />
          <span style={{ fontSize: 'var(--text-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-disabled)' }}>
            {activeAccent}
          </span>
          {config.customAccent && (
            <button
              onClick={() => updateConfig({ customAccent: null })}
              style={{
                fontSize: '0.5625rem', color: 'var(--color-error)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Preview bar */}
        <div style={{
          marginTop: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)',
          background: activeAccent, borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: '#fff' }}>Preview</span>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'rgba(255,255,255,0.7)' }}>Button text</span>
        </div>
      </Section>

      {/* Font */}
      <Section icon={Type} title="Typography">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div>
            <label style={labelStyle}>Font Family</label>
            <select
              value={config.fontFamily || ''}
              onChange={e => updateConfig({ fontFamily: e.target.value || null })}
              style={selectStyle}
            >
              {fontOptions.map(f => (
                <option key={f.id} value={f.value || ''}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Font Size</label>
            <SegmentedControl
              options={sizeOptions}
              value={config.fontSize}
              onChange={v => updateConfig({ fontSize: v })}
            />
          </div>
        </div>
      </Section>

      {/* Layout */}
      <Section icon={Square} title="Layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div>
            <label style={labelStyle}>Border Radius</label>
            <SegmentedControl
              options={radiusOptions}
              value={config.borderRadius}
              onChange={v => updateConfig({ borderRadius: v })}
            />
          </div>
          <div>
            <label style={labelStyle}>Density</label>
            <SegmentedControl
              options={densityOptions}
              value={config.density}
              onChange={v => updateConfig({ density: v })}
            />
          </div>
        </div>
      </Section>

      {/* Branding */}
      <Section icon={Image} title="Branding">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div>
            <label style={labelStyle}>Brand Name</label>
            <input
              value={config.brandName || ''}
              onChange={e => updateConfig({ brandName: e.target.value || null })}
              placeholder="AEO Dashboard"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Logo URL</label>
            <input
              value={config.brandLogoUrl || ''}
              onChange={e => updateConfig({ brandLogoUrl: e.target.value || null })}
              placeholder="https://example.com/logo.png"
              style={inputStyle}
            />
          </div>
          {config.brandLogoUrl && (
            <div style={{
              padding: 'var(--space-2)', background: 'var(--hover-bg)',
              borderRadius: 'var(--radius-md)', textAlign: 'center',
            }}>
              <img
                src={config.brandLogoUrl}
                alt="Brand logo"
                style={{ maxHeight: '2rem', maxWidth: '100%' }}
                onError={e => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>
      </Section>

      {/* Reset */}
      <button
        onClick={resetToDefault}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1)',
          padding: 'var(--space-2) var(--space-3)', width: '100%',
          background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', cursor: 'pointer',
          fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)',
        }}
      >
        <RotateCcw size={12} />
        Reset to Defaults
      </button>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
    }}>
      <h3 style={{
        fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
        margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
      }}>
        <Icon size={14} style={{ color: 'var(--accent)' }} />
        {title}
      </h3>
      {children}
    </div>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.0625rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '0.0625rem solid var(--border-subtle)' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            flex: 1, padding: 'var(--space-1) var(--space-2)',
            fontSize: 'var(--text-2xs)', fontWeight: 600,
            border: 'none', cursor: 'pointer',
            background: value === opt ? 'var(--accent)' : 'var(--bg-input)',
            color: value === opt ? '#fff' : 'var(--text-tertiary)',
            textTransform: 'capitalize', transition: 'all 100ms',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

const labelStyle = {
  fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)',
  display: 'block', marginBottom: '0.25rem',
}

const selectStyle = {
  width: '100%', padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-xs)', border: '0.0625rem solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)', background: 'var(--bg-input)',
  color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
}

const inputStyle = {
  width: '100%', padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-xs)', border: '0.0625rem solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)', background: 'var(--bg-input)',
  color: 'var(--text-primary)', outline: 'none',
}

export default memo(ThemeCustomizer)
