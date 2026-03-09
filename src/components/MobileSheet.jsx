import { memo, useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * MobileSheet — Full-screen bottom sheet dialog for mobile.
 *
 * On mobile: slides up from bottom as a full-screen sheet.
 * On desktop: renders as a standard centered modal.
 */
function MobileSheet({ open, onClose, title, isMobile = false, children }) {
  // Lock body scroll when open on mobile
  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open, isMobile])

  if (!open) return null

  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 100ms',
      }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            animation: 'slideUp 200ms ease-out',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2) 0' }}>
            <div style={{
              width: '2rem', height: '0.25rem', borderRadius: '9999px',
              background: 'var(--border-subtle)',
            }} />
          </div>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 var(--space-4) var(--space-3)',
            borderBottom: '0.0625rem solid var(--border-subtle)',
          }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: 'var(--space-1)' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', WebkitOverflowScrolling: 'touch' }}>
            {children}
          </div>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        `}</style>
      </div>
    )
  }

  // Desktop: centered modal
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50000,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 100ms',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)', width: '32rem', maxWidth: '92vw',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
        }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: 'var(--space-1)' }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-5)' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}

export default memo(MobileSheet)
