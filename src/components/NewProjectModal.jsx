import { useState, useCallback } from 'react'
import { X, Plus, Rocket, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '../hooks/useFocusTrap'

/**
 * Validate a URL string:
 * - Must not be empty (mandatory field)
 * - Must start with http:// or https://
 * - Must have a domain with at least one dot (e.g., example.com)
 * - TLD must be 2+ chars
 */
function isValidUrl(str) {
  if (!str || !str.trim()) return false
  try {
    const url = new URL(str)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    const host = url.hostname
    if (!host.includes('.')) return false
    const parts = host.split('.')
    const tld = parts[parts.length - 1]
    if (tld.length < 2) return false
    return true
  } catch {
    return false
  }
}

/**
 * Normalize a URL: auto-prepend https:// if missing
 */
function normalizeUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (!/^https?:\/\//i.test(trimmed) && trimmed.includes('.')) {
    return 'https://' + trimmed
  }
  return trimmed
}

/**
 * Check if a URL is reachable by attempting to load its favicon.
 * Falls back to an opaque fetch (mode: 'no-cors') if favicon fails.
 * Returns true if reachable, false if unreachable.
 */
async function checkUrlReachable(urlStr) {
  try {
    const url = new URL(urlStr)
    const origin = url.origin

    // Attempt 1: Try no-cors fetch to the origin (succeeds if server responds)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    try {
      await fetch(origin, { mode: 'no-cors', signal: controller.signal })
      clearTimeout(timeout)
      return true
    } catch {
      clearTimeout(timeout)
    }

    // Attempt 2: Try favicon load via Image (bypasses CORS)
    return new Promise((resolve) => {
      const img = new Image()
      const timer = setTimeout(() => { img.src = ''; resolve(false) }, 5000)
      img.onload = () => { clearTimeout(timer); resolve(true) }
      img.onerror = () => { clearTimeout(timer); resolve(false) }
      img.src = `${origin}/favicon.ico?_=${Date.now()}`
    })
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
  const [checking, setChecking] = useState(false)
  const trapRef = useFocusTrap(true)

  const validateUrl = useCallback((value) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setUrlError(t('newProject.urlRequired'))
      return false
    }
    const normalized = normalizeUrl(trimmed)
    if (!isValidUrl(normalized)) {
      setUrlError(t('newProject.invalidUrl'))
      return false
    }
    setUrlError('')
    return true
  }, [t])

  const handleUrlChange = (e) => {
    const val = e.target.value
    setUrl(val)
    if (urlTouched) validateUrl(val)
  }

  const handleUrlBlur = () => {
    setUrlTouched(true)
    const normalized = normalizeUrl(url)
    if (normalized !== url.trim() && normalized) {
      setUrl(normalized)
    }
    validateUrl(normalized || url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const finalUrl = normalizeUrl(url)
    if (!finalUrl || !validateUrl(finalUrl)) {
      setUrlTouched(true)
      if (!finalUrl) setUrlError(t('newProject.urlRequired'))
      return
    }

    // Check reachability
    setChecking(true)
    const reachable = await checkUrlReachable(finalUrl)
    setChecking(false)

    if (!reachable) {
      setUrlError(t('newProject.urlUnreachable'))
      return
    }

    onCreate(name.trim(), finalUrl)
  }

  const canSubmit = name.trim() && url.trim() && !urlError && !checking

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
              {t('newProject.websiteUrl')} <span style={{ fontWeight: 400, color: 'var(--color-error)', fontSize: 10 }}>*</span>
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
              required
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
              {checking ? (
                <Loader2 size={14} className="spin" />
              ) : required ? (
                <Rocket size={14} />
              ) : (
                <Plus size={14} />
              )}
              {checking ? t('newProject.checkingUrl') : required ? t('newProject.getStarted') : t('newProject.createProject')}
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
