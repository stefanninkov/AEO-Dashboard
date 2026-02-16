import { useRef } from 'react'
import { CheckCircle2, Info, BookOpen, StickyNote } from 'lucide-react'

export default function ChecklistItem({
  item,
  phase,
  checked,
  bouncingId,
  notes,
  openNoteId,
  noteDraft,
  noteSaveStatus,
  noteTimestamps,
  verifications,
  quickViewItem,
  onToggle,
  onQuickView,
  onDocItem,
  onToggleNote,
  onNoteChange,
  onNoteSave,
}) {
  const isChecked = !!checked[item.id]
  const hasNote = !!notes[item.id]

  return (
    <div className="group" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem' }}>
        {/* Checkbox */}
        <div style={{ position: 'relative', flexShrink: 0, marginTop: '0.125rem' }}>
          <button
            onClick={() => onToggle(item.id, item, phase.number)}
            className={bouncingId === item.id ? 'check-bounce' : ''}
            aria-label={`${isChecked ? 'Uncheck' : 'Check'}: ${item.text}`}
            style={{
              width: '1.125rem', height: '1.125rem', borderRadius: '0.25rem',
              border: `2px solid ${isChecked ? phase.color : 'var(--border-default)'}`,
              background: isChecked ? phase.color : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 150ms', padding: 0,
            }}
          >
            {isChecked && <CheckCircle2 size={11} style={{ color: '#fff' }} />}
          </button>
          {bouncingId === item.id && (
            <span className="check-ripple" style={{ backgroundColor: phase.color }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.8125rem', color: isChecked ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: isChecked ? 'line-through' : 'none', transition: 'all 200ms' }}>
            {item.text}
            {isChecked && verifications?.[item.id] && (
              <span
                style={{
                  display: 'inline-block', fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '6.1875rem', fontWeight: 500, marginLeft: '0.5rem', verticalAlign: 'middle',
                  background: verifications[item.id].method === 'ai' ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.06)',
                  color: verifications[item.id].method === 'ai' ? 'var(--color-phase-3)' : 'var(--text-tertiary)',
                }}
                title={verifications[item.id].note}
              >
                {verifications[item.id].method === 'ai' ? 'AI Verified' : 'Manual'}
              </span>
            )}
            {hasNote && openNoteId !== item.id && (
              <span className="checklist-note-indicator" title="Has notes">
                <StickyNote size={10} />
              </span>
            )}
          </p>
          {quickViewItem === item.id && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem', lineHeight: 1.5 }}>{item.detail}</p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, opacity: 0 }} className="group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onQuickView(item.id)}
            style={{ padding: '0.375rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
            title="Quick view"
            aria-label="Quick view"
          >
            <Info size={13} />
          </button>
          <button
            onClick={() => onDocItem(item)}
            style={{ padding: '0.375rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
            title="Full documentation"
            aria-label="Full documentation"
          >
            <BookOpen size={13} />
          </button>
          <button
            onClick={() => onToggleNote(item.id)}
            className={`checklist-note-btn${hasNote ? ' has-notes' : ''}`}
            title={hasNote ? 'Edit notes' : 'Add notes'}
            aria-label={hasNote ? 'Edit notes' : 'Add notes'}
          >
            <StickyNote size={13} />
          </button>
        </div>
      </div>
      {/* Notes Panel */}
      {openNoteId === item.id && (
        <div className="checklist-note-panel" style={{ margin: '0.25rem 1rem 0.5rem 1.875rem' }}>
          <div className="checklist-note-header">
            <span className="checklist-note-label">Notes</span>
            {noteSaveStatus === 'saved' && (
              <span className="checklist-note-saved">Saved ✓</span>
            )}
          </div>
          <textarea
            className="checklist-note-textarea"
            value={noteDraft}
            onChange={e => onNoteChange(item.id, e.target.value)}
            onBlur={() => onNoteSave(item.id, noteDraft)}
            placeholder="Add notes about this task..."
            aria-label={`Notes for "${item.text}"`}
            rows={3}
            autoFocus
          />
          {noteTimestamps[item.id] && (
            <span className="checklist-note-timestamp">
              Updated: {new Date(noteTimestamps[item.id]).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
