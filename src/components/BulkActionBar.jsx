import { useState, useRef, useEffect } from 'react'
import { CheckCircle2, XCircle, UserPlus, X, ChevronUp } from 'lucide-react'

const actionBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '0.375rem',
  padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
  background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
  color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
  transition: 'background 150ms, border-color 150ms',
  whiteSpace: 'nowrap',
}

/* ── Assign Dropdown (opens upward) ── */
function AssignDropdown({ members, onAssign }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!members || members.length === 0) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={actionBtnStyle}
        title="Assign selected to team member"
      >
        <UserPlus size={13} />
        <span>Assign</span>
        <ChevronUp size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: '0.375rem', minWidth: '10rem',
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: '0.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          overflow: 'hidden', zIndex: 196,
        }}>
          <div style={{
            padding: '0.375rem 0.625rem', fontSize: '0.625rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.5px',
            color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)',
          }}>
            Assign to
          </div>
          {members.map(m => (
            <button
              key={m.uid}
              onClick={() => { onAssign(m.uid); setOpen(false) }}
              style={{
                display: 'block', width: '100%', padding: '0.4375rem 0.625rem',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)',
                textAlign: 'left', fontFamily: 'var(--font-body)',
                transition: 'background 100ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {m.displayName || m.email || 'Team Member'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BulkActionBar({
  selectedCount,
  onCheckAll,
  onUncheckAll,
  onAssignAll,
  onClearSelection,
  members,
}) {
  return (
    <div
      className="fade-in-up"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 195,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '0.75rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }}
    >
      {/* Selection count */}
      <span style={{
        fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700,
        color: 'var(--color-phase-1)', whiteSpace: 'nowrap',
      }}>
        {selectedCount} selected
      </span>

      {/* Divider */}
      <div style={{ width: '1px', height: '1.25rem', background: 'var(--border-subtle)' }} />

      {/* Complete */}
      <button onClick={onCheckAll} style={actionBtnStyle} title="Mark selected as complete">
        <CheckCircle2 size={13} style={{ color: 'var(--color-success)' }} />
        <span>Complete</span>
      </button>

      {/* Clear */}
      <button onClick={onUncheckAll} style={actionBtnStyle} title="Clear selected">
        <XCircle size={13} style={{ color: 'var(--color-error)' }} />
        <span>Clear</span>
      </button>

      {/* Assign */}
      <AssignDropdown members={members} onAssign={onAssignAll} />

      {/* Close */}
      <button
        onClick={onClearSelection}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem',
          background: 'none', border: '1px solid var(--border-subtle)',
          cursor: 'pointer', color: 'var(--text-tertiary)',
          transition: 'background 150ms',
        }}
        title="Exit selection mode"
        aria-label="Exit selection mode"
        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <X size={12} />
      </button>
    </div>
  )
}
