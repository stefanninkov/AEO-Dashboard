import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Check, X, Undo2, Redo2 } from 'lucide-react'
import useUndoRedo from '../hooks/useUndoRedo'

/**
 * Inline editor component — edit text in-place without navigating away.
 *
 * @param {string}   value       - The current value
 * @param {function} onSave      - Callback with new value: (newValue) => void
 * @param {string}   [as='span'] - Render as span or textarea
 * @param {string}   [placeholder] - Placeholder when empty
 * @param {boolean}  [multiline]  - Use textarea
 * @param {number}   [maxLength]  - Maximum character length
 * @param {object}   [style]      - Additional inline styles
 */
const InlineEditor = memo(function InlineEditor({
  value, onSave, as = 'span', placeholder = 'Click to edit...',
  multiline = false, maxLength, style: customStyle,
}) {
  const { t } = useTranslation('app')
  const [editing, setEditing] = useState(false)
  const { state: editValue, setState: setEditValue, undo, redo, canUndo, canRedo, reset } = useUndoRedo(value)
  const inputRef = useRef(null)

  // Sync external value changes
  useEffect(() => {
    if (!editing) reset(value)
  }, [value, editing, reset])

  const startEdit = useCallback(() => {
    reset(value)
    setEditing(true)
  }, [value, reset])

  const handleSave = useCallback(() => {
    const trimmed = editValue?.trim()
    if (trimmed !== value) {
      onSave(trimmed)
    }
    setEditing(false)
  }, [editValue, value, onSave])

  const handleCancel = useCallback(() => {
    reset(value)
    setEditing(false)
  }, [value, reset])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault()
      redo()
    }
  }, [multiline, handleSave, handleCancel, undo, redo])

  // Auto-focus
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current.select) inputRef.current.select()
    }
  }, [editing])

  if (!editing) {
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={startEdit}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEdit() } }}
        style={{
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
          gap: 'var(--space-1)', borderRadius: 'var(--radius-sm)',
          padding: '1px var(--space-1)',
          transition: 'background 0.15s',
          ...customStyle,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        aria-label={t('inlineEditor.clickToEdit', 'Click to edit')}
      >
        {value || <span style={{ color: 'var(--text-disabled)' }}>{placeholder}</span>}
        <Pencil size={11} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
      </span>
    )
  }

  const InputTag = multiline ? 'textarea' : 'input'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'flex-start', gap: 'var(--space-1)',
      ...customStyle,
    }}>
      <InputTag
        ref={inputRef}
        value={editValue || ''}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        style={{
          background: 'var(--bg-page)', border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)', padding: '2px var(--space-2)',
          fontSize: 'inherit', fontFamily: 'inherit', color: 'var(--text-primary)',
          outline: 'none', width: multiline ? '100%' : '12rem',
          resize: multiline ? 'vertical' : 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
        {canUndo && (
          <button
            onClick={(e) => { e.preventDefault(); undo() }}
            onMouseDown={(e) => e.preventDefault()}
            className="btn-ghost"
            style={{ padding: '2px' }}
            aria-label={t('inlineEditor.undo', 'Undo')}
          >
            <Undo2 size={12} />
          </button>
        )}
        {canRedo && (
          <button
            onClick={(e) => { e.preventDefault(); redo() }}
            onMouseDown={(e) => e.preventDefault()}
            className="btn-ghost"
            style={{ padding: '2px' }}
            aria-label={t('inlineEditor.redo', 'Redo')}
          >
            <Redo2 size={12} />
          </button>
        )}
        <button
          onClick={(e) => { e.preventDefault(); handleSave() }}
          onMouseDown={(e) => e.preventDefault()}
          className="btn-ghost"
          style={{ padding: '2px', color: 'var(--color-success)' }}
          aria-label={t('inlineEditor.save', 'Save')}
        >
          <Check size={14} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); handleCancel() }}
          onMouseDown={(e) => e.preventDefault()}
          className="btn-ghost"
          style={{ padding: '2px', color: 'var(--color-error)' }}
          aria-label={t('inlineEditor.cancel', 'Cancel')}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
})

export default InlineEditor
