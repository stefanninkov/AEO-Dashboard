import { useState, useCallback } from 'react'
import { X, Plus, Rocket, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '../hooks/useFocusTrap'

/**
 * Validate a URL string:
 * - Must start with http:// or https://
 * - Must have a domain with at least one dot (e.g., example.com)
 * - TLD must be 2+ chars
 */
function isValidUrl(str) {
  if (!str) return true // empty is fine (optional field)
  try {
    const url = new URL(str)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    // Must have a dot in the hostname (e.g., "example.com", not "localhost")
    const host = url.hostname
    if (!host.includes('.')) return false
    // TLD must be at least 2 characters
    const parts = host.split('.')
    const tld = parts[parts.length - 1]
    if (tld.length < 2) return false
    return true
  } catch {
    return false
  }
}

export default function NewProjectModal({ onClose, onCreate, required }) {
  const { t } = useTranslation('app')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [urlTouched, setUrlTouched] = useState(false)
  const trapRef = useFocusTrap(true)

  const validateUrl = useCallback((value) => {
    if (!value.trim()) {
      setUrlError('')
      return true
    }
    // Auto-fix: if user typed domain without protocol, prepend https://
    let testUrl = value.trim()
    if (!/^https?:\/\//i.test(testUrl) && testUrl.includes('.')) {
      testUrl = 'https://' + testUrl
    }
    if (!isValidUrl(testUrl)) {
      setUrlError(t('newProject.invalidUrl'))
      return false
    }
    setUrlError('')
    return true
  }, [])

  const handleUrlChange = (e) => {
    const val = e.target.value
    setUrl(val)
    if (urlTouched) validateUrl(val)
  }

  const handleUrlBlur = () => {
    setUrlTouched(true)
    const trimmed = url.trim()
    if (trimmed && !/^https?:\/\//i.test(trimmed) && trimmed.includes('.')) {
      // Auto-prepend https:// on blur
      setUrl('https://' + trimmed)
      validateUrl('https://' + trimmed)
    } else {
      validateUrl(trimmed)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const trimmedUrl = url.trim()
    if (trimmedUrl && !validateUrl(trimmedUrl)) return

    // Normalize: auto-prepend https:// if missing
    let finalUrl = trimmedUrl
    if (finalUrl && !/^https?:\/\//i.test(finalUrl) && finalUrl.includes('.')) {
      finalUrl = 'https://' + finalUrl
    }

    onCreate(name.trim(), finalUrl)
  }

  const canSubmit = name.trim() && !urlError

  return (
    <div className="modal-backdrop" onClick={required ? undefined : onClose}>
      <div
        ref={trapRef}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        style={{ maxWidth: 440, animation: 'dialog-scale-in 250ms ease-out both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: required ? 8 : 24 }}>
          <h2 id="new-project-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {required ? t('newProject.createFirst') : t('newProject.title')}
          </h2>
          {!required && (
            <button
              onClick={onClose}
              style={{
                padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
              }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {required && (
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24, lineHeight: 1.5 }}>
            {t('newProject.helpText')}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="project-name" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {t('newProject.projectName')}
            </label>
            <input
              id="project-name"
              type="text"
              placeholder={t('newProject.namePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="project-url" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {t('newProject.websiteUrl')} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>{t('newProject.urlOptional')}</span>
            </label>
            <input
              id="project-url"
              type="text"
              placeholder={t('newProject.urlPlaceholder')}
              value={url}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              className="input-field"
              style={urlError ? { borderColor: 'var(--color-error)' } : undefined}
            />
            {urlError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <AlertCircle size={12} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--color-error)' }}>{urlError}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary"
              style={{ flex: 1, opacity: canSubmit ? 1 : 0.5 }}
            >
              {required ? <Rocket size={14} /> : <Plus size={14} />}
              {required ? t('newProject.getStarted') : t('newProject.createProject')}
            </button>
            {!required && (
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                {t('newProject.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
