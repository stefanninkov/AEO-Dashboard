import { useState, useEffect, useMemo } from 'react'
import { X, Trash2, Link2, CheckSquare, Calendar as CalendarIcon, Lightbulb, Check } from 'lucide-react'
import { STATUS_OPTIONS, formatDateKey } from './useContentCalendar'
import { generateLinkedTasks } from '../../utils/calendarBridge'

/* ── Flatten all checklist items from phases for the task dropdown ── */
function getAllChecklistItems(phases) {
  const items = []
  if (!phases) return items
  phases.forEach(phase => {
    phase.categories.forEach(cat => {
      cat.items.forEach(item => {
        items.push({
          id: item.id,
          text: item.text,
          phase: phase.number,
          phaseTitle: phase.title,
          category: cat.name,
        })
      })
    })
  })
  return items
}

export default function EntryForm({
  entry,          // null = new entry, object = editing
  initialDate,    // pre-filled date for new entries (from clicking a day)
  phases,
  checked,        // project.checked state for checklist items
  members,        // activeProject.members array
  briefs,         // contentBriefs array for linking
  onSave,
  onDelete,
  onClose,
}) {
const isEditing = !!entry

  const [title, setTitle] = useState(entry?.title || '')
  const [scheduledDate, setScheduledDate] = useState(
    entry?.scheduledDate || (initialDate ? formatDateKey(initialDate) : formatDateKey(new Date()))
  )
  const [checklistItemId, setChecklistItemId] = useState(entry?.checklistItemId || '')
  const [pageUrl, setPageUrl] = useState(entry?.pageUrl || '')
  const [assignedTo, setAssignedTo] = useState(entry?.assignedTo || '')
  const [status, setStatus] = useState(entry?.status || 'scheduled')
  const [notes, setNotes] = useState(entry?.notes || '')
  const [briefId, setBriefId] = useState(entry?.briefId || '')

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '')
      setScheduledDate(entry.scheduledDate || formatDateKey(new Date()))
      setChecklistItemId(entry.checklistItemId || '')
      setPageUrl(entry.pageUrl || '')
      setAssignedTo(entry.assignedTo || '')
      setStatus(entry.status || 'scheduled')
      setNotes(entry.notes || '')
      setBriefId(entry.briefId || '')
    }
  }, [entry])

  const allItems = useMemo(() => getAllChecklistItems(phases), [phases])
  const suggestedTasks = useMemo(() => generateLinkedTasks(title, phases, checked), [title, phases, checked])

  // When a checklist item is selected, auto-fill title if empty
  const handleChecklistSelect = (itemId) => {
    setChecklistItemId(itemId)
    if (!title && itemId) {
      const item = allItems.find(i => i.id === itemId)
      if (item) setTitle(item.text)
    }
  }

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      ...(entry || {}),
      title: title.trim(),
      scheduledDate,
      checklistItemId: checklistItemId || null,
      pageUrl: pageUrl.trim(),
      assignedTo: assignedTo || null,
      status,
      notes: notes.trim(),
      briefId: briefId || null,
    })
    onClose()
  }

  /* inputs use className="input-field" */

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.0313rem',
    color: 'var(--text-tertiary)',
    marginBottom: '0.375rem',
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '28rem',
        background: 'var(--card-bg)',
        borderLeft: '0.0625rem solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '0.0625rem solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={16} style={{ color: 'var(--color-phase-1)' }} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              {isEditing ? 'Edit Entry' : 'New Calendar Entry'}
            </span>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Form body */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>{'Title *'}</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={'e.g. Rewrite /services answer paragraphs'}
              className="input-field"
              style={{ width: '100%' }}
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>{'Scheduled Date'}</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>

          {/* Linked checklist task */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckSquare size={11} /> {'Linked Checklist Task'}
              </span>
            </label>
            <select
              value={checklistItemId}
              onChange={e => handleChecklistSelect(e.target.value)}
              className="input-field"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="">{'None'}</option>
              {/* Group by phase */}
              {phases?.map(phase => (
                <optgroup key={phase.id} label={`${'Phase'} ${phase.number}: ${phase.title}`}>
                  {phase.categories.flatMap(cat =>
                    cat.items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.text.length > 60 ? item.text.slice(0, 57) + '...' : item.text}
                      </option>
                    ))
                  )}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Suggested AEO tasks */}
          {suggestedTasks.length > 0 && !checklistItemId && (
            <div>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Lightbulb size={11} /> {'Suggested AEO Tasks'}
                </span>
              </label>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 'var(--space-1)',
                padding: 'var(--space-2)',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '0.0625rem solid var(--border-subtle)',
              }}>
                {suggestedTasks.map(task => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleChecklistSelect(task.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: task.isChecked ? 'transparent' : 'var(--hover-bg)',
                      cursor: task.isChecked ? 'default' : 'pointer',
                      opacity: task.isChecked ? 0.5 : 1,
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 150ms',
                    }}
                    disabled={task.isChecked}
                  >
                    <div style={{
                      width: '0.875rem', height: '0.875rem', borderRadius: '0.1875rem',
                      border: task.isChecked ? 'none' : `0.0625rem solid ${task.phaseColor || 'var(--border-default)'}`,
                      background: task.isChecked ? 'var(--color-success)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '0.0625rem',
                    }}>
                      {task.isChecked && <Check size={9} style={{ color: '#fff' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 'var(--text-2xs)', color: 'var(--text-primary)',
                        lineHeight: 1.4,
                        textDecoration: task.isChecked ? 'line-through' : 'none',
                      }}>
                        {task.text.length > 60 ? task.text.slice(0, 57) + '...' : task.text}
                      </div>
                      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', marginTop: '0.0625rem' }}>
                        Phase {task.phase} · {task.reason}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Page URL */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Link2 size={11} /> {'Page URL'}
              </span>
            </label>
            <input
              value={pageUrl}
              onChange={e => setPageUrl(e.target.value)}
              placeholder="https://example.com/services"
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>

          {/* Assignee */}
          {members?.length > 0 && (
            <div>
              <label style={labelStyle}>{'Assigned To'}</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="input-field"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="">{'Unassigned'}</option>
                {members.map(m => (
                  <option key={m.uid} value={m.uid}>
                    {m.displayName || m.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          <div>
            <label style={labelStyle}>{'Status'}</label>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  style={{
                    padding: '0.3125rem 0.625rem',
                    borderRadius: '0.375rem',
                    border: status === opt.value ? `0.125rem solid ${opt.color}` : '0.125rem solid var(--border-subtle)',
                    background: status === opt.value ? `${opt.color}18` : 'transparent',
                    color: status === opt.value ? opt.color : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 150ms',
                  }}
                >
                  {opt.value === 'in-progress' ? 'In Progress' : opt.value === 'review' ? 'Review' : opt.value === 'published' ? 'Published' : opt.value === 'scheduled' ? 'Scheduled' : opt.value}
                </button>
              ))}
            </div>
          </div>

          {/* Linked brief */}
          {briefs?.length > 0 && (
            <div>
              <label style={labelStyle}>{'Linked Content Brief'}</label>
              <select
                value={briefId}
                onChange={e => setBriefId(e.target.value)}
                className="input-field"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="">{'None'}</option>
                {briefs.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.targetQuery} ({new Date(b.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={labelStyle}>{'Notes'}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={'Additional notes...'}
              rows={3}
              className="input-field"
              style={{ width: '100%', resize: 'vertical', minHeight: '4rem' }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          borderTop: '0.0625rem solid var(--border-subtle)',
          gap: '0.5rem',
        }}>
          {isEditing && onDelete ? (
            <button
              onClick={() => { onDelete(entry.id); onClose() }}
              className="btn-danger btn-sm"
            >
              <Trash2 size={13} /> {'Delete'}
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onClose} className="btn-secondary btn-sm">
              {'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="btn-primary btn-sm"
            >
              {isEditing ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
