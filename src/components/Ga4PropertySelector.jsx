/**
 * Ga4PropertySelector — Dropdown selector for GA4 properties.
 *
 * Groups properties by account, shows property name + account name.
 * Selected property's resource name (e.g. "properties/123456789") is stored on the project.
 */

import { useState } from 'react'
import { BarChart3, ChevronDown, Check, RefreshCw, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { useGa4Properties } from '../hooks/useGa4Properties'
import { getPropertyId } from '../utils/ga4Api'

export default function Ga4PropertySelector({
  accessToken,
  selectedProperty,
  onSelectProperty,
  compact = false,
}) {
  const { properties, loading, error, refresh } = useGa4Properties(accessToken)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!accessToken) return null

  const handleSelect = (propertyName) => {
    onSelectProperty(propertyName)
    setDropdownOpen(false)
  }

  // Find display name for selected
  const selectedProp = properties.find(p => p.name === selectedProperty)
  const selectedDisplay = selectedProp
    ? `${selectedProp.displayName} (${getPropertyId(selectedProp.name)})`
    : selectedProperty
      ? `Property ${getPropertyId(selectedProperty)}`
      : null

  // Group by account
  const grouped = {}
  for (const prop of properties) {
    const acct = prop.accountName || 'Unknown Account'
    if (!grouped[acct]) grouped[acct] = []
    grouped[acct].push(prop)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: compact ? '0.4375rem 0.75rem' : '0.5625rem 1rem',
          background: 'var(--bg-input)',
          border: '0.0625rem solid var(--border-default)',
          borderRadius: '0.625rem',
          color: selectedProperty ? 'var(--text-primary)' : 'var(--text-tertiary)',
          fontSize: compact ? '0.75rem' : '0.8125rem',
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          transition: 'border-color 150ms ease',
        }}
      >
        <BarChart3 size={compact ? 13 : 14} style={{ color: '#10B981', flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading properties...' : selectedDisplay || 'Select a GA4 property'}
        </span>
        {loading ? (
          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-tertiary)', flexShrink: 0 }} />
        ) : (
          <ChevronDown size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 150ms' }} />
        )}
      </button>

      {/* Dropdown */}
      {dropdownOpen && !loading && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setDropdownOpen(false)}
          />

          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            background: 'var(--bg-card)',
            border: '0.0625rem solid var(--border-subtle)',
            borderRadius: '0.75rem',
            boxShadow: '0 0.5rem 2rem rgba(0,0,0,0.25)',
            zIndex: 100,
            maxHeight: '18rem',
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.75rem',
              borderBottom: '0.0625rem solid var(--border-subtle)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06rem',
                color: 'var(--text-disabled)',
              }}>
                GA4 Properties ({properties.length})
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); refresh() }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', padding: '0.125rem', display: 'flex', alignItems: 'center',
                }}
                title="Refresh properties"
              >
                <RefreshCw size={11} />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem', color: 'var(--color-error)', fontSize: '0.75rem',
              }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Empty */}
            {!error && properties.length === 0 && (
              <div style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                  No GA4 properties found
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  Make sure you have GA4 properties set up in Google Analytics.
                </p>
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.75rem', color: '#10B981', textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={11} />
                  Open Analytics
                </a>
              </div>
            )}

            {/* Properties grouped by account */}
            {Object.entries(grouped).map(([accountName, props]) => (
              <div key={accountName}>
                <div style={{
                  padding: '0.5rem 0.75rem 0.25rem',
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06rem',
                  color: 'var(--text-disabled)',
                }}>
                  {accountName}
                </div>
                {props.map(prop => {
                  const isSelected = selectedProperty === prop.name
                  const propId = getPropertyId(prop.name)

                  return (
                    <button
                      key={prop.name}
                      onClick={() => handleSelect(prop.name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        width: '100%', padding: '0.5rem 0.75rem',
                        background: isSelected ? 'rgba(16,185,129,0.06)' : 'transparent',
                        border: 'none', borderBottom: '0.0625rem solid var(--border-subtle)',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
                        transition: 'background 100ms',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'rgba(16,185,129,0.06)' : 'transparent' }}
                    >
                      {isSelected ? (
                        <Check size={13} style={{ color: '#10B981', flexShrink: 0 }} />
                      ) : (
                        <BarChart3 size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                      )}

                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{
                          fontSize: '0.8125rem',
                          color: isSelected ? '#10B981' : 'var(--text-primary)',
                          fontWeight: isSelected ? 600 : 400,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {prop.displayName}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                          color: 'var(--text-disabled)',
                        }}>
                          {propId}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
