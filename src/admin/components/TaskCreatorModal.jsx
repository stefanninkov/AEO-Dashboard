/**
 * TaskCreatorModal — Create a follow-up task linked to a lead.
 *
 * Quick date picks: Tomorrow, In 3 days, Next week.
 * Priority radio: High, Medium, Low.
 */
import { useState } from 'react'
import { X, Calendar, Flag } from 'lucide-react'
import { TASK_PRIORITIES } from '../constants/pipelineStages'

function getQuickDate(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export default function TaskCreatorModal({ isOpen, onClose, lead, onCreateTask }) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(getQuickDate(1))
  const [priority, setPriority] = useState('medium')
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)

  if (!isOpen) return null

  const handleCreate = async () => {
    if (!title.trim() || creating) return
    setCreating(true)
    try {
      await onCreateTask({
        leadId: lead?.id || null,
        leadName: lead?.name || '',
        leadEmail: lead?.email || '',
        title: title.trim(),
        dueDate,
        priority,
        notes: notes.trim(),
      })
      // Reset and close
      setTitle('')
      setDueDate(getQuickDate(1))
      setPriority('medium')
      setNotes('')
      onClose()
    } catch (err) {
      console.error('Create task error:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Modal */}
        <div onClick={(e) => e.stopPropagation()} style={{
          width: '24rem', maxWidth: '90vw', background: 'var(--card-bg)',
          borderRadius: '0.75rem', border: '0.0625rem solid var(--border-subtle)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
          }}>
            <div>
              <h3 style={{
                margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
              }}>
                Create Task
              </h3>
              {lead && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  for {lead.name || lead.email}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: '0.25rem',
            }}>
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Title */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.6875rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '0.25rem',
              }}>
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="e.g., Follow up on scorecard results"
                autoFocus
                style={{
                  width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.375rem',
                  border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                  color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Due Date */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.6875rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '0.25rem',
              }}>
                <Calendar size={10} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                Due Date
              </label>
              <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem' }}>
                {[
                  { label: 'Tomorrow', offset: 1 },
                  { label: 'In 3 days', offset: 3 },
                  { label: 'Next week', offset: 7 },
                ].map(({ label, offset }) => {
                  const val = getQuickDate(offset)
                  const isActive = dueDate === val
                  return (
                    <button
                      key={label}
                      onClick={() => setDueDate(val)}
                      style={{
                        padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem',
                        fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
                        border: isActive ? 'none' : '0.0625rem solid var(--border-subtle)',
                        background: isActive ? 'var(--accent)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--text-tertiary)',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%', padding: '0.375rem 0.625rem', borderRadius: '0.375rem',
                  border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                  color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Priority */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.6875rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '0.375rem',
              }}>
                <Flag size={10} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                Priority
              </label>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {TASK_PRIORITIES.map((p) => {
                  const isActive = priority === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                        padding: '0.375rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.6875rem',
                        fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
                        border: isActive ? 'none' : '0.0625rem solid var(--border-subtle)',
                        background: isActive ? `${p.color}15` : 'transparent',
                        color: isActive ? p.color : 'var(--text-tertiary)',
                      }}
                    >
                      {p.emoji} {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.6875rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '0.25rem',
              }}>
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional context..."
                rows={2}
                style={{
                  width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.375rem',
                  border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                  color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
            padding: '0.75rem 1.25rem', borderTop: '0.0625rem solid var(--border-subtle)',
          }}>
            <button onClick={onClose} style={{
              padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.75rem',
              fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
              border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
              color: 'var(--text-secondary)',
            }}>
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || creating}
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.75rem',
                fontWeight: 600, fontFamily: 'var(--font-body)', cursor: title.trim() ? 'pointer' : 'default',
                border: 'none', background: title.trim() ? 'var(--accent)' : 'var(--hover-bg)',
                color: title.trim() ? '#fff' : 'var(--text-disabled)',
                opacity: creating ? 0.5 : 1,
              }}
            >
              {creating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
