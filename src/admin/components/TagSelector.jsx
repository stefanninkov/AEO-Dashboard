/**
 * TagSelector — Dropdown for adding tags to a lead.
 *
 * Shows registry tags + "Create new" option with color swatch picker.
 */
import { useState, useRef, useEffect } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { TAG_COLORS } from '../constants/pipelineStages'

export default function TagSelector({
  allTags,
  leadTags = [],
  onAddTag,
  onRemoveTag,
  onCreateTag,
  getTagColor,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const dropdownRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setCreating(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const availableTags = allTags.filter(t => !leadTags.includes(t.name))

  const handleCreate = async () => {
    if (!newTagName.trim()) return
    await onCreateTag?.({ name: newTagName.trim(), color: newTagColor })
    await onAddTag?.(newTagName.trim())
    setNewTagName('')
    setCreating(false)
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.125rem',
          padding: '0.125rem 0.375rem', borderRadius: 99,
          border: '0.0625rem dashed var(--border-subtle)', background: 'transparent',
          color: 'var(--text-disabled)', fontSize: '0.5625rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}
      >
        <Plus size={9} /> Tag
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: '0.25rem',
          zIndex: 210, minWidth: '10rem',
          background: 'var(--card-bg)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}>
          {/* Existing tags */}
          {availableTags.length > 0 && (
            <div style={{ maxHeight: '10rem', overflowY: 'auto' }}>
              {availableTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={async () => {
                    await onAddTag?.(tag.name)
                    setIsOpen(false)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    width: '100%', padding: '0.375rem 0.625rem', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: '0.6875rem',
                    fontFamily: 'var(--font-body)', color: 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <span style={{
                    width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                    background: tag.color, flexShrink: 0,
                  }} />
                  {tag.name}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          {availableTags.length > 0 && (
            <div style={{ borderTop: '0.0625rem solid var(--border-subtle)' }} />
          )}

          {/* Create new */}
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                width: '100%', padding: '0.375rem 0.625rem', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: '0.6875rem',
                fontFamily: 'var(--font-body)', color: 'var(--accent)',
                fontWeight: 600, textAlign: 'left',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <Plus size={11} /> Create new tag
            </button>
          ) : (
            <div style={{ padding: '0.5rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Tag name"
                autoFocus
                style={{
                  width: '100%', padding: '0.25rem 0.375rem', borderRadius: '0.25rem',
                  border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                  color: 'var(--text-primary)', fontSize: '0.6875rem', fontFamily: 'var(--font-body)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              {/* Color swatches */}
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {TAG_COLORS.slice(0, 10).map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewTagColor(c)}
                    style={{
                      width: '1rem', height: '1rem', borderRadius: '50%',
                      background: c, border: newTagColor === c ? '0.125rem solid var(--text-primary)' : '0.0625rem solid transparent',
                      cursor: 'pointer', padding: 0,
                    }}
                  />
                ))}
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={handleCreate}
                  disabled={!newTagName.trim()}
                  style={{
                    flex: 1, padding: '0.25rem', borderRadius: '0.25rem',
                    border: 'none', background: newTagName.trim() ? 'var(--accent)' : 'var(--hover-bg)',
                    color: newTagName.trim() ? '#fff' : 'var(--text-disabled)',
                    fontSize: '0.625rem', fontWeight: 600, cursor: newTagName.trim() ? 'pointer' : 'default',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Create
                </button>
                <button
                  onClick={() => { setCreating(false); setNewTagName('') }}
                  style={{
                    padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                    border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                    color: 'var(--text-tertiary)', fontSize: '0.625rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
