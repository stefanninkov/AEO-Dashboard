/**
 * LanguageSwitcher — Compact globe-icon dropdown for switching languages.
 *
 * Props:
 *   variant  'app' (dashboard TopBar) | 'landing' (landing/waitlist nav)
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { SUPPORTED_LANGUAGES, loadLanguage } from '../i18n'

export default function LanguageSwitcher({ variant = 'app' }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const currentLang = i18n.language?.split('-')[0] || 'en'
  const currentLabel = SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.nativeLabel || 'English'

  // Click-outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleSelect = useCallback(async (code) => {
    setOpen(false)
    if (code !== currentLang) {
      await loadLanguage(code)
    }
  }, [currentLang])

  const isApp = variant === 'app'

  /* ── Styles ── */

  const btnStyle = isApp
    ? {
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.375rem 0.625rem', borderRadius: '0.5rem',
        background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
        color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
        transition: 'color 150ms, border-color 150ms',
      }
    : {
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
        background: 'transparent', border: '0.0625rem solid transparent',
        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
        color: 'rgba(160,160,176,1)', fontFamily: 'inherit',
        transition: 'color 200ms, background 200ms',
      }

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 0.375rem)',
    right: 0,
    minWidth: '10rem',
    background: isApp ? 'var(--bg-card)' : '#16161e',
    border: isApp ? '0.0625rem solid var(--border-default)' : '0.0625rem solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: isApp ? 'var(--shadow-md)' : '0 0.5rem 1.5rem rgba(0,0,0,0.4)',
    zIndex: 50,
  }

  const itemBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '0.5rem 0.875rem',
    border: 'none', cursor: 'pointer',
    fontSize: '0.8125rem', fontFamily: 'inherit',
    transition: 'background 100ms',
  }

  const itemStyle = (isActive) => ({
    ...itemBase,
    background: isActive
      ? (isApp ? 'var(--active-bg)' : 'rgba(255,255,255,0.06)')
      : 'transparent',
    color: isActive
      ? (isApp ? 'var(--text-primary)' : '#f0f0f2')
      : (isApp ? 'var(--text-secondary)' : 'rgba(160,160,176,1)'),
    fontWeight: isActive ? 600 : 400,
  })

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Language: ${currentLabel}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={btnStyle}
        onMouseEnter={(e) => {
          if (!isApp) {
            e.currentTarget.style.color = '#f0f0f2'
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isApp) {
            e.currentTarget.style.color = 'rgba(160,160,176,1)'
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        <Globe size={isApp ? 14 : 15} />
        <span className="hidden sm:inline">{currentLabel}</span>
      </button>

      {open && (
        <div role="listbox" aria-label="Select language" style={dropdownStyle}>
          {SUPPORTED_LANGUAGES.map(lang => {
            const active = lang.code === currentLang
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(lang.code)}
                style={itemStyle(active)}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = isApp ? 'var(--hover-bg)' : 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.0625rem' }}>
                  <span>{lang.nativeLabel}</span>
                  <span style={{ fontSize: '0.6875rem', opacity: 0.45 }}>{lang.label}</span>
                </div>
                {active && <Check size={14} style={{ flexShrink: 0, opacity: 0.7 }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
