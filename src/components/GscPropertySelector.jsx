/**
 * GscPropertySelector — Dropdown selector for Google Search Console properties.
 *
 * Shows:
 *  - List of verified properties from user's GSC account
 *  - Currently selected property (stored on project)
 *  - Permission level badges
 *  - Loading / error / empty states
 *  - Link to add a property in GSC if none found
 */

import { useState } from 'react'
import { Globe, ChevronDown, Check, RefreshCw, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { useGscProperties } from '../hooks/useGscProperties'
import { formatSiteUrl } from '../utils/gscApi'

/* Permission badge colors */
const PERMISSION_COLORS = {
  siteOwner: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'Owner' },
  siteFullUser: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', label: 'Full' },
  siteRestrictedUser: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Restricted' },
  siteUnverifiedUser: { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', label: 'Unverified' },
}

export default function GscPropertySelector({
  accessToken,
  selectedProperty,
  onSelectProperty,
  compact = false,
}) {
  const { properties, loading, error, refresh } = useGscProperties(accessToken)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!accessToken) return null

  const handleSelect = (siteUrl) => {
    onSelectProperty(siteUrl)
    setDropdownOpen(false)
  }

  const selectedDisplay = selectedProperty ? formatSiteUrl(selectedProperty) : null

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
        <Globe size={compact ? 13 : 14} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading properties...' : selectedDisplay || 'Select a Search Console property'}
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
          {/* Backdrop */}
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
            maxHeight: '16rem',
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
                Search Console Properties ({properties.length})
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); refresh() }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: '0.125rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Refresh properties"
              >
                <RefreshCw size={11} />
              </button>
            </div>

            {/* Error state */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                color: 'var(--color-error)',
                fontSize: '0.75rem',
              }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Empty state */}
            {!error && properties.length === 0 && (
              <div style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                  No properties found
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  Make sure you have verified properties in Google Search Console.
                </p>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-phase-1)',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={11} />
                  Open Search Console
                </a>
              </div>
            )}

            {/* Property list */}
            {properties.map((prop) => {
              const isSelected = selectedProperty === prop.siteUrl
              const perm = PERMISSION_COLORS[prop.permissionLevel] || PERMISSION_COLORS.siteUnverifiedUser
              const display = formatSiteUrl(prop.siteUrl)

              return (
                <button
                  key={prop.siteUrl}
                  onClick={() => handleSelect(prop.siteUrl)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    background: isSelected ? 'rgba(255,107,53,0.06)' : 'transparent',
                    border: 'none',
                    borderBottom: '0.0625rem solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'rgba(255,107,53,0.06)' : 'transparent' }}
                >
                  {isSelected ? (
                    <Check size={13} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />
                  ) : (
                    <Globe size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  )}

                  <span style={{
                    flex: 1,
                    fontSize: '0.8125rem',
                    color: isSelected ? 'var(--color-phase-1)' : 'var(--text-primary)',
                    fontWeight: isSelected ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {display}
                  </span>

                  <span style={{
                    fontSize: '0.5625rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    background: perm.bg,
                    color: perm.color,
                    flexShrink: 0,
                  }}>
                    {perm.label}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
