/**
 * ConnectionBanner — Shows a non-intrusive banner when Firestore
 * connection is lost or permission is denied.
 */
import { WifiOff, ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ConnectionBanner({ error }) {
  const [dismissed, setDismissed] = useState(false)
  const { t } = useTranslation()

  if (!error || dismissed) return null

  const isPermission = error === 'permission'
  const Icon = isPermission ? ShieldAlert : WifiOff
  const message = isPermission
    ? t('connection.permissionDenied')
    : t('connection.connectionLost')
  const bgColor = isPermission
    ? 'rgba(239, 68, 68, 0.08)'
    : 'rgba(245, 158, 11, 0.08)'
  const borderColor = isPermission
    ? 'rgba(239, 68, 68, 0.2)'
    : 'rgba(245, 158, 11, 0.2)'
  const textColor = isPermission
    ? 'var(--color-error)'
    : 'var(--color-warning)'

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: bgColor,
        borderBottom: `0.0625rem solid ${borderColor}`,
        fontSize: '0.75rem',
        color: textColor,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      <Icon size={14} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label={t('connection.dismiss')}
        style={{
          padding: '0.25rem',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: textColor,
          borderRadius: '0.25rem',
          display: 'flex',
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}
