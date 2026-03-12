import { useState, useMemo, useEffect, memo } from 'react'
import { Activity, X, Filter, MessageSquare, UserPlus, CheckCircle2, BarChart3, Shield, Sparkles, RefreshCw, FileText } from 'lucide-react'

const ACTIVITY_ICONS = {
  check: CheckCircle2,
  uncheck: CheckCircle2,
  comment: MessageSquare,
  mention: MessageSquare,
  task_assign: UserPlus,
  task_unassign: UserPlus,
  member_add: UserPlus,
  member_remove: UserPlus,
  role_change: Shield,
  analyze: BarChart3,
  monitor: RefreshCw,
  score_change: Sparkles,
  note: FileText,
}

const ACTIVITY_COLORS = {
  check: 'var(--color-success)',
  uncheck: 'var(--text-disabled)',
  comment: 'var(--accent)',
  mention: 'var(--color-phase-2)',
  task_assign: 'var(--color-phase-3)',
  task_unassign: 'var(--text-tertiary)',
  member_add: 'var(--color-phase-4)',
  member_remove: 'var(--color-error)',
  role_change: 'var(--color-phase-5)',
  analyze: 'var(--color-phase-1)',
  monitor: 'var(--color-phase-6)',
  score_change: 'var(--color-phase-2)',
  note: 'var(--color-phase-7)',
}

const FILTER_GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'comments', label: 'Comments' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'team', label: 'Team' },
  { id: 'analysis', label: 'Analysis' },
]

const FILTER_MAP = {
  comments: ['comment', 'mention'],
  tasks: ['check', 'uncheck', 'task_assign', 'task_unassign'],
  team: ['member_add', 'member_remove', 'role_change'],
  analysis: ['analyze', 'monitor', 'score_change'],
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

function getActivityMessage(a) {
  switch (a.type) {
    case 'check': return `completed "${a.taskText || a.itemId || 'task'}"`
    case 'uncheck': return `unchecked "${a.taskText || a.itemId || 'task'}"`
    case 'comment': return `commented on "${a.itemLabel || a.itemId || 'item'}"`
    case 'mention': return `mentioned someone in "${a.itemLabel || a.itemId || 'item'}"`
    case 'task_assign': return `assigned "${a.taskText || 'task'}" to ${a.assigneeName || 'someone'}`
    case 'task_unassign': return `unassigned "${a.taskText || 'task'}" from ${a.assigneeName || 'someone'}`
    case 'member_add': return `added ${a.memberName || 'a member'} to the team`
    case 'member_remove': return `removed ${a.memberName || 'a member'}`
    case 'role_change': return `changed ${a.memberName || 'member'}'s role to ${a.newRole || 'new role'}`
    case 'analyze': return `ran analysis${a.url ? ` on ${a.url}` : ''}`
    case 'monitor': return `ran monitoring check (score: ${a.score || '?'}%)`
    case 'note': return `added a note`
    default: return a.type || 'performed an action'
  }
}

/**
 * GlobalActivityFeed — Sliding panel showing team activity across all projects.
 *
 * Props:
 *   isOpen          — whether panel is open
 *   onClose         — callback to close
 *   activities      — array of activity entries from project.activityLog
 *   currentUserUid  — current user's UID
 */
function GlobalActivityFeed({ isOpen, onClose, activities = [], currentUserUid }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = activities
    if (filter !== 'all' && FILTER_MAP[filter]) {
      list = list.filter(a => FILTER_MAP[filter].includes(a.type))
    }
    return list.slice(0, 50)
  }, [activities, filter])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.3)',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Activity Feed"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 999,
          width: 'min(22rem, 100vw)',
          background: 'var(--bg-page)',
          borderLeft: '0.0625rem solid var(--border-default)',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-2xl)',
          animation: 'slideInRight 200ms ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <Activity size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
            Activity Feed
          </span>
          <button onClick={onClose} className="btn-icon-sm" title="Close" style={{ color: 'var(--text-tertiary)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 'var(--space-1)', padding: 'var(--space-2) var(--space-4)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
          overflowX: 'auto', flexShrink: 0,
        }}>
          {FILTER_GROUPS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '0.25rem 0.625rem', fontSize: 'var(--text-2xs)',
                fontWeight: 600, borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                background: filter === f.id ? 'var(--accent)' : 'var(--hover-bg)',
                color: filter === f.id ? '#fff' : 'var(--text-tertiary)',
                transition: 'all 100ms',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Activity list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-4)' }}>
          {filtered.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 'var(--space-8)', textAlign: 'center',
            }}>
              <Activity size={24} style={{ color: 'var(--text-disabled)', marginBottom: 'var(--space-2)' }} />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>No activity yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {filtered.map(a => {
                const Icon = ACTIVITY_ICONS[a.type] || Activity
                const color = ACTIVITY_COLORS[a.type] || 'var(--text-tertiary)'
                const isMe = a.authorUid === currentUserUid
                return (
                  <div
                    key={a.id}
                    tabIndex={0}
                    role="article"
                    aria-label={`${isMe ? 'You' : (a.authorName || 'Someone')} ${getActivityMessage(a)}`}
                    style={{
                      display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start',
                      padding: 'var(--space-2)', borderRadius: 'var(--radius-md)',
                      transition: 'background 100ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onFocus={e => { e.currentTarget.style.background = 'var(--hover-bg)' }}
                    onBlur={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{
                      width: '1.75rem', height: '1.75rem', borderRadius: '50%', flexShrink: 0,
                      background: `color-mix(in srgb, ${color} 12%, transparent)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={12} style={{ color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                        margin: 0, lineHeight: 1.4,
                      }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {isMe ? 'You' : (a.authorName || 'Someone')}
                        </span>
                        {' '}{getActivityMessage(a)}
                      </p>
                      <span style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
                        {timeAgo(a.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

/**
 * ActivityFeedButton — Button for TopBar to toggle the feed.
 */
export function ActivityFeedButton({ onClick, recentCount = 0 }) {
  return (
    <button
      onClick={onClick}
      className="icon-btn"
      title="Activity Feed"
      aria-label="Activity Feed"
      style={{ position: 'relative' }}
    >
      <Activity size={16} />
      {recentCount > 0 && (
        <span style={{
          position: 'absolute', top: 2, right: 2,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent)',
        }} />
      )}
    </button>
  )
}

export default memo(GlobalActivityFeed)
