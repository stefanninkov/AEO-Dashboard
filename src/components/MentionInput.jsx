import { useState, useRef, useCallback, useEffect, memo } from 'react'

/**
 * MentionInput — Text input with @mention autocomplete.
 *
 * Props:
 *   value        — controlled text value
 *   onChange      — callback(newValue)
 *   onSubmit      — callback(text) when Enter pressed
 *   members       — array of { uid, displayName, email }
 *   placeholder   — input placeholder
 *   autoFocus     — focus on mount
 *   multiline     — use textarea instead of input
 *   disabled      — disable input
 */
function MentionInput({ value, onChange, onSubmit, members = [], placeholder, autoFocus, multiline, disabled }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [dropdownIndex, setDropdownIndex] = useState(0)
  const inputRef = useRef(null)

  const filteredMembers = members.filter(m => {
    if (!mentionQuery) return true
    const q = mentionQuery.toLowerCase()
    return (m.displayName || '').toLowerCase().includes(q) ||
           (m.email || '').toLowerCase().includes(q)
  }).slice(0, 5)

  const handleChange = useCallback((e) => {
    const text = e.target.value
    onChange(text)

    // Detect @mention trigger
    const cursor = e.target.selectionStart
    const before = text.slice(0, cursor)
    const atMatch = before.match(/@(\w*)$/)
    if (atMatch && members.length > 0) {
      setMentionQuery(atMatch[1])
      setShowDropdown(true)
      setDropdownIndex(0)
    } else {
      setShowDropdown(false)
    }
  }, [onChange, members])

  const insertMention = useCallback((member) => {
    const cursor = inputRef.current?.selectionStart || value.length
    const before = value.slice(0, cursor)
    const after = value.slice(cursor)
    const atIndex = before.lastIndexOf('@')
    if (atIndex === -1) return

    const name = member.displayName || member.email?.split('@')[0] || 'user'
    const newText = before.slice(0, atIndex) + `@${name} ` + after
    onChange(newText)
    setShowDropdown(false)

    // Restore focus
    setTimeout(() => {
      const newCursor = atIndex + name.length + 2
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(newCursor, newCursor)
    }, 0)
  }, [value, onChange])

  const handleKeyDown = useCallback((e) => {
    if (showDropdown && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setDropdownIndex(i => (i + 1) % filteredMembers.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setDropdownIndex(i => (i - 1 + filteredMembers.length) % filteredMembers.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredMembers[dropdownIndex])
        return
      }
      if (e.key === 'Escape') {
        setShowDropdown(false)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !showDropdown) {
      e.preventDefault()
      if (value.trim() && onSubmit) onSubmit(value)
    }
  }, [showDropdown, filteredMembers, dropdownIndex, insertMention, value, onSubmit])

  // Close dropdown on click outside
  useEffect(() => {
    if (!showDropdown) return
    const handler = () => setShowDropdown(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showDropdown])

  const InputTag = multiline ? 'textarea' : 'input'

  return (
    <div style={{ position: 'relative' }}>
      <InputTag
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || (members.length > 0 ? 'Type @ to mention...' : 'Add a comment...')}
        autoFocus={autoFocus}
        disabled={disabled}
        rows={multiline ? 2 : undefined}
        style={{
          width: '100%', padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
          background: 'var(--hover-bg)',
          border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          outline: 'none', fontFamily: 'inherit',
          resize: multiline ? 'vertical' : 'none',
          transition: 'border-color 100ms',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
      />

      {/* Mention autocomplete dropdown */}
      {showDropdown && filteredMembers.length > 0 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: '100%',
          marginBottom: 'var(--space-1)',
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          zIndex: 50, maxHeight: '12rem', overflowY: 'auto',
        }}>
          {filteredMembers.map((m, i) => (
            <button
              key={m.uid}
              onClick={(e) => { e.stopPropagation(); insertMention(m) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                width: '100%', padding: 'var(--space-2) var(--space-3)',
                background: i === dropdownIndex ? 'var(--hover-bg)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
              }}
            >
              <div style={{
                width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.625rem', fontWeight: 700, flexShrink: 0,
              }}>
                {(m.displayName || m.email || '?')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.displayName || m.email?.split('@')[0]}
                </div>
                {m.email && (
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.email}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(MentionInput)
