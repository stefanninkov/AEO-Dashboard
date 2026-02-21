import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X, Keyboard } from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'

const kbdStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '0.6875rem',
  fontWeight: 600,
  padding: '0.1875rem 0.4375rem',
  borderRadius: '0.25rem',
  background: 'var(--hover-bg)',
  border: '0.0625rem solid var(--border-subtle)',
  color: 'var(--text-secondary)',
  minWidth: '1.5rem',
  textAlign: 'center',
  display: 'inline-block',
  lineHeight: 1.4,
}

export default function KeyboardShortcutsModal({ isOpen, isClosing, onClose, onExited }) {
  const { t } = useTranslation()
  const trapRef = useFocusTrap(isOpen && !isClosing)

  const SHORTCUT_GROUPS = [
    {
      title: t('shortcuts.navigation'),
      shortcuts: [
        { keys: ['1'], desc: t('nav.dashboard') },
        { keys: ['2'], desc: t('nav.checklist') },
        { keys: ['3'], desc: t('nav.competitors') },
        { keys: ['4'], desc: t('nav.analyzer') },
        { keys: ['5'], desc: t('nav.writer') },
        { keys: ['6'], desc: t('nav.contentOps') },
        { keys: ['7'], desc: t('nav.schema') },
        { keys: ['8'], desc: t('nav.monitoring') },
        { keys: ['9'], desc: t('nav.metrics') },
      ],
    },
    {
      title: t('shortcuts.actions'),
      shortcuts: [
        { keys: ['⌘', 'K'], desc: t('shortcuts.openCommandPalette') },
        { keys: ['Esc'], desc: t('shortcuts.closeModalOverlay') },
      ],
    },
    {
      title: t('shortcuts.helpGroup'),
      shortcuts: [
        { keys: ['?'], desc: t('shortcuts.toggleShortcuts') },
      ],
    },
  ]

  if (!isOpen && !isClosing) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal-backdrop)' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--bg-overlay)',
          backdropFilter: 'blur(0.5rem)',
          WebkitBackdropFilter: 'blur(0.5rem)',
          animation: isClosing
            ? 'backdrop-fade-out 150ms ease-out forwards'
            : 'backdrop-fade-in 200ms ease-out both',
        }}
      />

      {/* Panel */}
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '26rem',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)',
          borderRadius: '0.75rem',
          boxShadow: '0 1.5625rem 3.125rem -0.75rem rgba(0,0,0,0.25)',
          zIndex: 'var(--z-modal)',
          animation: isClosing
            ? 'dialog-scale-out 150ms ease-out forwards'
            : 'dialog-scale-in 200ms ease-out both',
        }}
        onAnimationEnd={() => isClosing && onExited?.()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Keyboard size={16} style={{ color: 'var(--color-phase-1)' }} />
            <h2 id="shortcuts-title" style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.875rem',
              fontWeight: 700, color: 'var(--text-primary)', margin: 0,
            }}>
              {t('shortcuts.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t('actions.close')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'var(--text-tertiary)', transition: 'all 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1rem 1.25rem' }}>
          {SHORTCUT_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: gi < SHORTCUT_GROUPS.length - 1 ? '1.25rem' : 0 }}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.625rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--text-disabled)', marginBottom: '0.5rem',
              }}>
                {group.title}
              </div>
              {group.shortcuts.map((s, si) => (
                <div key={si} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.375rem 0',
                  borderBottom: si < group.shortcuts.length - 1 ? '0.0625rem solid var(--border-subtle)' : 'none',
                }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.desc}</span>
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    {s.keys.map((k, ki) => (
                      <span key={ki}>
                        <kbd style={kbdStyle}>{k}</kbd>
                        {ki < s.keys.length - 1 && (
                          <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', margin: '0 0.125rem' }}>+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem', borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
            {t('shortcuts.pressToToggle', { key: '?' })}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}
