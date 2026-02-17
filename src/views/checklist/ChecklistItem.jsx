import { useRef, useState, useEffect, memo } from 'react'
import { CheckCircle2, BookOpen, UserPlus, MessageSquare, Send, Trash2, ExternalLink, ArrowRight } from 'lucide-react'

/* ── Avatar helpers ── */
const AVATAR_COLORS = [
  '#FF6B35', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899',
  '#F59E0B', '#06B6D4', '#EF4444', '#84CC16', '#6366F1',
]

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

function formatCommentTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

/* ── Assign Dropdown ── */
function AssignDropdown({ members, assignedUid, onAssign, onUnassign, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        marginTop: '0.25rem',
        width: '12.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '0.625rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 'var(--z-dropdown)',
        overflow: 'hidden',
        animation: 'scale-in 120ms ease-out both',
      }}
    >
      <div style={{
        padding: '0.375rem 0.625rem',
        fontSize: '0.625rem',
        fontWeight: 700,
        color: 'var(--text-disabled)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        Assign to
      </div>

      {assignedUid && (
        <button
          onClick={() => { onUnassign(); onClose() }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.625rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: 'var(--color-error)',
            fontFamily: 'var(--font-body)',
            borderBottom: '1px solid var(--border-subtle)',
            transition: 'background 100ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          Unassign
        </button>
      )}

      <div style={{ maxHeight: '10rem', overflowY: 'auto' }}>
        {members.map((member) => {
          const isAssigned = member.uid === assignedUid
          return (
            <button
              key={member.uid}
              onClick={() => { if (!isAssigned) { onAssign(member.uid); onClose() } }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4375rem 0.625rem',
                border: 'none',
                background: isAssigned ? 'var(--hover-bg)' : 'none',
                cursor: isAssigned ? 'default' : 'pointer',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                transition: 'background 100ms',
              }}
              onMouseEnter={e => { if (!isAssigned) e.currentTarget.style.background = 'var(--hover-bg)' }}
              onMouseLeave={e => { if (!isAssigned) e.currentTarget.style.background = 'none' }}
            >
              <div style={{
                width: '1.25rem',
                height: '1.25rem',
                borderRadius: '0.3125rem',
                background: getAvatarColor(member.displayName),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.5rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                flexShrink: 0,
              }}>
                {getInitials(member.displayName)}
              </div>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {member.displayName || member.email}
              </span>
              {isAssigned && (
                <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--color-success)' }}>
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>

      {members.length === 0 && (
        <div style={{
          padding: '0.75rem 0.625rem',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          textAlign: 'center',
        }}>
          No team members yet
        </div>
      )}
    </div>
  )
}

export default memo(function ChecklistItem({
  item,
  phase,
  checked,
  bouncingId,
  verifications,
  assignments,
  comments,
  openCommentId,
  commentDraft,
  members,
  onToggle,
  onDocItem,
  onNavigate,
  onAssign,
  onUnassign,
  onToggleComments,
  onCommentChange,
  onCommentAdd,
  onCommentDelete,
}) {
  const isChecked = !!checked[item.id]
  const assignedUid = assignments?.[item.id]
  const assignedMember = assignedUid ? members?.find(m => m.uid === assignedUid) : null
  const taskComments = comments?.[item.id] || []
  const commentCount = taskComments.length
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)

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
            {commentCount > 0 && openCommentId !== item.id && (
              <span className="checklist-note-indicator" title={`${commentCount} comment${commentCount !== 1 ? 's' : ''}`}>
                <MessageSquare size={10} /> {commentCount}
              </span>
            )}
          </p>
          {/* Detail — always visible */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem', lineHeight: 1.5 }}>{item.detail}</p>
          {/* Action buttons — always visible */}
          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
            {item.doc && (
              <button
                onClick={() => onDocItem(item)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                  border: '1px solid var(--border-subtle)',
                  background: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', fontSize: '0.6875rem',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                title="View full documentation"
                aria-label={`Documentation for: ${item.text}`}
              >
                <BookOpen size={11} />
                Learn more
              </button>
            )}
            {item.action?.view && onNavigate && (
              <button
                onClick={() => onNavigate(item.action.view)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                  border: `1px solid ${phase.color}30`,
                  background: phase.color + '08', cursor: 'pointer',
                  color: phase.color, fontSize: '0.6875rem',
                  fontWeight: 500, fontFamily: 'var(--font-body)',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = phase.color + '15' }}
                onMouseLeave={e => { e.currentTarget.style.background = phase.color + '08' }}
                title={item.action.label}
              >
                {item.action.label}
                <ArrowRight size={11} />
              </button>
            )}
            {item.action?.external && (
              <a
                href={item.action.external}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                  border: `1px solid ${phase.color}30`,
                  background: phase.color + '08', cursor: 'pointer',
                  color: phase.color, fontSize: '0.6875rem',
                  fontWeight: 500, fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = phase.color + '15' }}
                onMouseLeave={e => { e.currentTarget.style.background = phase.color + '08' }}
              >
                {item.action.label}
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>

        {/* Assigned avatar (always visible when assigned) */}
        {assignedMember && (
          <button
            title={`Assigned to ${assignedMember.displayName || assignedMember.email}`}
            aria-label={`Assigned to ${assignedMember.displayName || assignedMember.email}. Click to reassign.`}
            style={{
              width: '1.375rem',
              height: '1.375rem',
              borderRadius: '0.3125rem',
              background: getAvatarColor(assignedMember.displayName),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.5rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              flexShrink: 0,
              marginTop: '0.0625rem',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
            }}
            onClick={() => setShowAssignDropdown(!showAssignDropdown)}
          >
            {getInitials(assignedMember.displayName)}
          </button>
        )}

        {/* Actions (hover) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, opacity: 0, position: 'relative' }} className="group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onToggleComments(item.id)}
            className={`checklist-comment-btn${commentCount > 0 ? ' has-comments' : ''}`}
            title={commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : 'Add comment'}
            aria-label={commentCount > 0 ? `${commentCount} comments` : 'Add comment'}
          >
            <MessageSquare size={13} />
          </button>
          {members && members.length > 0 && (
            <button
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              style={{
                padding: '0.375rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: assignedUid ? 'rgba(255,107,53,0.08)' : 'none',
                cursor: 'pointer',
                color: assignedUid ? 'var(--color-phase-1)' : 'var(--text-tertiary)',
              }}
              title={assignedMember ? `Assigned to ${assignedMember.displayName}` : 'Assign to member'}
              aria-label="Assign task"
            >
              <UserPlus size={13} />
            </button>
          )}

          {showAssignDropdown && (
            <AssignDropdown
              members={members || []}
              assignedUid={assignedUid}
              onAssign={(uid) => onAssign(item.id, uid, item, phase.number)}
              onUnassign={() => onUnassign(item.id, item, phase.number)}
              onClose={() => setShowAssignDropdown(false)}
            />
          )}
        </div>
      </div>
      {/* Comments Panel */}
      {openCommentId === item.id && (
        <div className="checklist-comments-panel" style={{ margin: '0.25rem 1rem 0.5rem 1.875rem' }}>
          <div className="checklist-note-header">
            <span className="checklist-note-label">Comments {commentCount > 0 && `(${commentCount})`}</span>
          </div>

          {taskComments.length > 0 && (
            <div className="checklist-comments-list">
              {taskComments.map(comment => (
                <div key={comment.id} className="checklist-comment-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{
                      width: '1.125rem', height: '1.125rem', borderRadius: '0.25rem',
                      background: getAvatarColor(comment.authorName),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.4375rem', fontWeight: 700,
                      fontFamily: 'var(--font-heading)', flexShrink: 0,
                    }}>
                      {getInitials(comment.authorName)}
                    </div>
                    <span className="checklist-comment-author">{comment.authorName}</span>
                    <span className="checklist-comment-time">{formatCommentTime(comment.timestamp)}</span>
                    <button
                      onClick={() => onCommentDelete(item.id, comment.id)}
                      className="checklist-comment-delete"
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <p className="checklist-comment-text">{comment.text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="checklist-comment-input-row">
            <textarea
              className="checklist-comment-textarea"
              value={commentDraft}
              onChange={e => onCommentChange(e.target.value)}
              placeholder="Write a comment..."
              aria-label={`Comment on "${item.text}"`}
              rows={2}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  onCommentAdd(item.id, commentDraft, item, phase.number)
                }
              }}
            />
            <button
              onClick={() => onCommentAdd(item.id, commentDraft, item, phase.number)}
              className="checklist-comment-send"
              disabled={!commentDraft.trim()}
              title="Send comment (Cmd+Enter)"
              aria-label="Send comment"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}, (prev, next) => {
  const id = prev.item.id
  return (
    prev.item === next.item &&
    prev.phase === next.phase &&
    prev.checked[id] === next.checked[id] &&
    prev.bouncingId === next.bouncingId &&
    prev.verifications?.[id] === next.verifications?.[id] &&
    prev.assignments?.[id] === next.assignments?.[id] &&
    prev.comments?.[id] === next.comments?.[id] &&
    prev.openCommentId === next.openCommentId &&
    prev.commentDraft === next.commentDraft &&
    prev.members === next.members
  )
})
