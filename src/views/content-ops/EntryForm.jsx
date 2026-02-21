import { useState, useEffect, useMemo } from 'react'
import { X, Trash2, Link2, CheckSquare, Calendar as CalendarIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { STATUS_OPTIONS, formatDateKey } from './useContentCalendar'

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
  members,        // activeProject.members array
  briefs,         // contentBriefs array for linking
  onSave,
  onDelete,
  onClose,
}) {
  const { t } = useTranslation('app')
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

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: '0.0625rem solid var(--border-subtle)',
    background: 'var(--hover-bg)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    outline: 'none',
  }

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
              {isEditing ? t('contentOps.form.editEntry') : t('contentOps.form.newEntry')}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: '0.25rem',
          }}>
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
            <label style={labelStyle}>{t('contentOps.form.titleLabel')}</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('contentOps.form.titlePlaceholder')}
              style={inputStyle}
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>{t('contentOps.form.scheduledDate')}</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Linked checklist task */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckSquare size={11} /> {t('contentOps.form.linkedTask')}
              </span>
            </label>
            <select
              value={checklistItemId}
              onChange={e => handleChecklistSelect(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">{t('contentOps.form.none')}</option>
              {/* Group by phase */}
              {phases?.map(phase => (
                <optgroup key={phase.id} label={`${t('contentOps.form.phase')} ${phase.number}: ${phase.title}`}>
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

          {/* Page URL */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Link2 size={11} /> {t('contentOps.form.pageUrl')}
              </span>
            </label>
            <input
              value={pageUrl}
              onChange={e => setPageUrl(e.target.value)}
              placeholder="https://example.com/services"
              style={inputStyle}
            />
          </div>

          {/* Assignee */}
          {members?.length > 0 && (
            <div>
              <label style={labelStyle}>{t('contentOps.form.assignedTo')}</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">{t('contentOps.form.unassigned')}</option>
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
            <label style={labelStyle}>{t('contentOps.form.status')}</label>
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
                  {t('contentOps.status.' + opt.value)}
                </button>
              ))}
            </div>
          </div>

          {/* Linked brief */}
          {briefs?.length > 0 && (
            <div>
              <label style={labelStyle}>{t('contentOps.form.linkedBrief')}</label>
              <select
                value={briefId}
                onChange={e => setBriefId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">{t('contentOps.form.none')}</option>
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
            <label style={labelStyle}>{t('contentOps.form.notes')}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('contentOps.form.notesPlaceholder')}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '4rem' }}
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
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4375rem 0.75rem', borderRadius: '0.5rem',
                border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                color: '#EF4444', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Trash2 size={13} /> {t('contentOps.form.delete')}
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onClose} style={{
              padding: '0.4375rem 0.875rem', borderRadius: '0.5rem',
              border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>
              {t('contentOps.form.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              style={{
                padding: '0.4375rem 0.875rem', borderRadius: '0.5rem',
                border: 'none', background: 'var(--color-phase-1)',
                color: '#fff', fontSize: '0.8125rem', fontWeight: 600,
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                opacity: title.trim() ? 1 : 0.5,
                fontFamily: 'var(--font-body)',
              }}
            >
              {isEditing ? t('contentOps.form.saveChanges') : t('contentOps.form.addEntry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
