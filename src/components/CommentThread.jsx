import { useState, memo } from 'react'
import { MessageSquare, Send, Trash2, Pencil, X, Check } from 'lucide-react'
import MentionInput from './MentionInput'

/**
 * CommentThread — Inline comment thread for any item.
 *
 * Props:
 *   itemId       — unique identifier for the item being commented on
 *   itemLabel    — human-readable label for notifications
 *   comments     — array from getThread(itemId)
 *   onAdd        — callback(itemId, text, itemLabel)
 *   onEdit       — callback(itemId, commentId, newText)
 *   onDelete     — callback(itemId, commentId)
 *   currentUid   — current user's UID
 *   members      — project members for @mentions
 *   compact      — smaller layout for inline use
 */
function CommentThread({ itemId, itemLabel, comments = [], onAdd, onEdit, onDelete, currentUid, members = [], compact = false }) {
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const handleSubmit = (text) => {
    if (!text.trim()) return
    onAdd?.(itemId, text, itemLabel)
    setInput('')
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditText(comment.text)
  }

  const saveEdit = () => {
    if (editText.trim()) {
      onEdit?.(itemId, editingId, editText)
    }
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  return (
    <div style={{
      padding: compact ? 'var(--space-2)' : 'var(--space-3)',
      background: 'var(--bg-card)',
      border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        marginBottom: comments.length > 0 ? 'var(--space-2)' : 0,
      }}>
        <MessageSquare size={12} style={{ color: 'var(--text-tertiary)' }} />
        <span style={{
          fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.03rem',
        }}>
          {comments.length > 0 ? `${comments.length} comment${comments.length > 1 ? 's' : ''}` : 'Comments'}
        </span>
      </div>

      {/* Comments list */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          {comments.map(c => (
            <div key={c.id} style={{
              display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start',
            }}>
              {/* Avatar */}
              <div style={{
                width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                background: c.authorUid === currentUid ? 'var(--accent)' : 'var(--color-phase-3)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.5625rem', fontWeight: 700,
              }}>
                {(c.authorName || '?')[0].toUpperCase()}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.authorUid === currentUid ? 'You' : c.authorName}
                  </span>
                  <span style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
                    {formatTimeAgo(c.timestamp)}
                    {c.edited && ' (edited)'}
                  </span>
                  {/* Actions for own comments */}
                  {c.authorUid === currentUid && editingId !== c.id && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => startEdit(c)} className="btn-icon-sm" title="Edit" style={{ opacity: 0.5 }}>
                        <Pencil size={10} />
                      </button>
                      <button onClick={() => onDelete?.(itemId, c.id)} className="btn-icon-sm" title="Delete" style={{ opacity: 0.5 }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === c.id ? (
                  <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                    <input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                      style={{
                        flex: 1, padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)',
                        border: '0.0625rem solid var(--accent)', borderRadius: 'var(--radius-sm)',
                        background: 'var(--hover-bg)', color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                    <button onClick={saveEdit} className="btn-icon-sm" style={{ color: 'var(--color-success)' }}><Check size={12} /></button>
                    <button onClick={cancelEdit} className="btn-icon-sm" style={{ color: 'var(--text-tertiary)' }}><X size={12} /></button>
                  </div>
                ) : (
                  <p style={{
                    fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                    lineHeight: 1.4, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {renderTextWithMentions(c.text)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <MentionInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            members={members}
            placeholder="Add a comment..."
          />
        </div>
        <button
          onClick={() => handleSubmit(input)}
          disabled={!input.trim()}
          style={{
            width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
            background: input.trim() ? 'var(--accent)' : 'var(--border-subtle)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 100ms',
          }}
        >
          <Send size={12} style={{ color: input.trim() ? '#fff' : 'var(--text-disabled)' }} />
        </button>
      </div>
    </div>
  )
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

function renderTextWithMentions(text) {
  if (!text) return null
  // Highlight @mentions in blue
  const parts = text.split(/(@\w[\w\s.]*?)(?=\s|$|[,;!?])/g)
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} style={{ color: 'var(--accent)', fontWeight: 600 }}>{part}</span>
      )
    }
    return part
  })
}

/**
 * CommentButton — Small button that shows comment count and toggles thread.
 */
export function CommentButton({ count = 0, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className="btn-icon-sm"
      title={count > 0 ? `${count} comment${count > 1 ? 's' : ''}` : 'Add comment'}
      style={{
        color: active ? 'var(--accent)' : count > 0 ? 'var(--text-secondary)' : 'var(--text-disabled)',
        position: 'relative',
      }}
    >
      <MessageSquare size={14} />
      {count > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          fontSize: '0.5rem', fontWeight: 700,
          background: 'var(--accent)', color: '#fff',
          width: 14, height: 14, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}

export default memo(CommentThread)
