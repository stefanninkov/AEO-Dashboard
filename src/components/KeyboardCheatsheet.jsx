import { memo } from 'react'
import { X, Keyboard } from 'lucide-react'

/**
 * KeyboardCheatsheet — Modal overlay showing all keyboard shortcuts.
 */
function KeyboardCheatsheet({ open, onClose, groupedShortcuts = {} }) {
  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 150ms',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)', width: '36rem', maxWidth: '92vw',
          maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          animation: 'scaleIn 150ms ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Keyboard size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: 'var(--space-1)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-5)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: 'var(--space-4)' }}>
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 style={{
                  fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.04rem',
                  margin: '0 0 var(--space-2)',
                }}>
                  {category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {shortcuts.map(sc => (
                    <div key={sc.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {sc.label}
                      </span>
                      <KeyCombo keys={sc.keys} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-3) var(--space-5)',
          borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 'var(--space-1)',
        }}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>
            Press
          </span>
          <KeyCombo keys="shift+?" />
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>
            to toggle this cheatsheet
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  )
}

function KeyCombo({ keys }) {
  const parts = keys.split('+')
  return (
    <div style={{ display: 'flex', gap: '0.1875rem', flexShrink: 0 }}>
      {parts.map((part, i) => (
        <kbd key={i} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: '1.25rem', padding: '0.0625rem 0.3125rem',
          fontSize: '0.5625rem', fontFamily: 'var(--font-mono)',
          fontWeight: 600, color: 'var(--text-tertiary)',
          background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: '0.1875rem', lineHeight: 1.4,
          boxShadow: '0 1px 0 var(--border-subtle)',
          textTransform: part.length > 1 ? 'capitalize' : 'uppercase',
        }}>
          {formatKey(part)}
        </kbd>
      ))}
    </div>
  )
}

function formatKey(key) {
  const map = { ctrl: 'Ctrl', shift: 'Shift', alt: 'Alt', cmd: 'Cmd', escape: 'Esc' }
  return map[key.toLowerCase()] || key
}

export default memo(KeyboardCheatsheet)
