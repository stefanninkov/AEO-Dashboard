import { useState, useMemo } from 'react'
import {
  CheckCircle2, XCircle, StickyNote, Zap, Download,
  UserPlus, UserMinus, Clock, MessageSquare, Shield,
  FileText, Code, Activity, Filter
} from 'lucide-react'

const TYPE_CONFIG = {
  check: { icon: CheckCircle2, color: 'var(--color-success)', label: 'Completed' },
  uncheck: { icon: XCircle, color: 'var(--text-disabled)', label: 'Unchecked' },
  note: { icon: StickyNote, color: 'var(--color-phase-3)', label: 'Added note to' },
  analyze: { icon: Zap, color: 'var(--color-phase-1)', label: 'Analyzed' },
  export: { icon: Download, color: 'var(--color-phase-2)', label: 'Exported report' },
  competitor_add: { icon: UserPlus, color: 'var(--color-phase-4)', label: 'Added competitor' },
  competitor_remove: { icon: UserMinus, color: 'var(--color-error)', label: 'Removed competitor' },
  create_project: { icon: CheckCircle2, color: 'var(--color-phase-5)', label: 'Created project' },
  task_assign: { icon: UserPlus, color: 'var(--color-phase-2)', label: 'Assigned' },
  task_unassign: { icon: UserMinus, color: 'var(--text-disabled)', label: 'Unassigned' },
  comment: { icon: MessageSquare, color: 'var(--color-phase-4)', label: 'Commented on' },
  member_add: { icon: UserPlus, color: 'var(--color-success)', label: 'Added member' },
  member_remove: { icon: UserMinus, color: 'var(--color-error)', label: 'Removed member' },
  role_change: { icon: Shield, color: 'var(--color-phase-5)', label: 'Changed role' },
  monitor: { icon: Activity, color: 'var(--color-phase-1)', label: 'Ran monitoring' },
  contentWrite: { icon: FileText, color: 'var(--color-phase-3)', label: 'Generated content' },
  schemaGenerate: { icon: Code, color: 'var(--color-phase-4)', label: 'Generated schema' },
  generateFix: { icon: Zap, color: 'var(--color-phase-2)', label: 'Generated fix' },
}

const FILTER_GROUPS = {
  all: { label: 'All' },
  tasks: { label: 'Tasks', types: ['check', 'uncheck', 'note', 'task_assign', 'task_unassign', 'comment'] },
  team: { label: 'Team', types: ['member_add', 'member_remove', 'role_change'] },
  tools: { label: 'Tools', types: ['analyze', 'export', 'monitor', 'contentWrite', 'schemaGenerate', 'generateFix', 'competitor_add', 'competitor_remove'] },
}

function getDateLabel(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function getRelativeTime(dateStr) {
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
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function getAuthorLabel(activity, currentUserUid) {
  if (!activity.authorUid && !activity.authorName) return null
  if (activity.authorUid === currentUserUid) return 'You'
  return activity.authorName || 'Someone'
}

function getDescription(activity, currentUserUid) {
  const config = TYPE_CONFIG[activity.type] || { label: activity.type }
  const author = getAuthorLabel(activity, currentUserUid)
  const prefix = author ? `${author} — ` : ''

  switch (activity.type) {
    case 'check':
    case 'uncheck':
      return `${prefix}${config.label}: ${activity.taskText || 'task'}`
    case 'note':
      return `${prefix}${config.label}: ${activity.taskText || 'task'}`
    case 'analyze':
      return activity.score !== undefined
        ? `${prefix}${config.label} ${activity.url || 'site'} — Score: ${activity.score}`
        : `${prefix}${config.label} ${activity.url || 'site'}`
    case 'export':
      return `${prefix}${config.label}`
    case 'competitor_add':
      return `${prefix}${config.label}: ${activity.url || 'competitor'}`
    case 'competitor_remove':
      return `${prefix}${config.label}: ${activity.url || 'competitor'}`
    case 'create_project':
      return `${prefix}${config.label}`
    case 'task_assign':
      return `${prefix}${config.label} "${activity.taskText || 'task'}" to ${activity.assigneeName || 'member'}`
    case 'task_unassign':
      return `${prefix}${config.label} ${activity.assigneeName || 'member'} from "${activity.taskText || 'task'}"`
    case 'comment':
      return `${prefix}${config.label} "${activity.taskText || 'task'}"`
    case 'member_add':
      return `${prefix}${config.label}: ${activity.memberName || 'member'}`
    case 'member_remove':
      return `${prefix}${config.label}: ${activity.memberName || 'member'}`
    case 'role_change':
      return `${prefix}${config.label} for ${activity.memberName || 'member'} to ${activity.newRole || 'role'}`
    case 'monitor':
      return activity.score !== undefined
        ? `${prefix}${config.label} — Score: ${activity.score}`
        : `${prefix}${config.label}`
    case 'contentWrite':
      return `${prefix}${config.label}: ${activity.topic || 'content'}`
    case 'schemaGenerate':
      return `${prefix}${config.label}: ${activity.topic || 'schema'}`
    case 'generateFix':
      return `${prefix}${config.label} for ${activity.itemName || 'item'}`
    default:
      return `${prefix}${config.label}`
  }
}

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
]

function getAvatarColor(uid) {
  if (!uid) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < uid.length; i++) hash = ((hash << 5) - hash + uid.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function ActivityTimeline({ activities = [], maxVisible = 10, currentUserUid }) {
  const [visibleCount, setVisibleCount] = useState(maxVisible)
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterUser, setFilterUser] = useState('all')

  // Collect unique authors for user filter
  const authors = useMemo(() => {
    const map = new Map()
    activities.forEach(a => {
      if (a.authorUid && a.authorName && !map.has(a.authorUid)) {
        map.set(a.authorUid, a.authorName)
      }
    })
    return Array.from(map.entries())
  }, [activities])

  // Filter activities
  const filteredActivities = useMemo(() => {
    let list = activities
    if (filterGroup !== 'all') {
      const types = FILTER_GROUPS[filterGroup]?.types || []
      list = list.filter(a => types.includes(a.type))
    }
    if (filterUser !== 'all') {
      list = list.filter(a => a.authorUid === filterUser)
    }
    return list
  }, [activities, filterGroup, filterUser])

  const visibleActivities = filteredActivities.slice(0, visibleCount)
  const hasMore = filteredActivities.length > visibleCount
  const showFilters = activities.length > 3

  // Group by date
  const grouped = useMemo(() => {
    const groups = []
    let currentLabel = null

    visibleActivities.forEach(activity => {
      const label = getDateLabel(activity.timestamp)
      if (label !== currentLabel) {
        currentLabel = label
        groups.push({ label, items: [] })
      }
      groups[groups.length - 1].items.push(activity)
    })

    return groups
  }, [visibleActivities])

  if (activities.length === 0) {
    return (
      <div className="activity-empty">
        <Clock size={20} style={{ color: 'var(--text-disabled)', marginBottom: '0.5rem' }} />
        <p>No activity yet</p>
        <p className="activity-empty-sub">Start checking off tasks to see your progress here.</p>
      </div>
    )
  }

  return (
    <div className="activity-timeline">
      {showFilters && (
        <div className="activity-filters">
          <div className="activity-filter-group">
            {Object.entries(FILTER_GROUPS).map(([key, { label }]) => (
              <button
                key={key}
                className={`activity-filter-chip${filterGroup === key ? ' active' : ''}`}
                onClick={() => { setFilterGroup(key); setVisibleCount(maxVisible) }}
              >
                {label}
              </button>
            ))}
          </div>
          {authors.length > 1 && (
            <select
              className="activity-user-filter"
              value={filterUser}
              onChange={e => { setFilterUser(e.target.value); setVisibleCount(maxVisible) }}
            >
              <option value="all">All members</option>
              {authors.map(([uid, name]) => (
                <option key={uid} value={uid}>
                  {uid === currentUserUid ? 'You' : name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <div className="activity-empty" style={{ padding: '1rem 0' }}>
          <Filter size={16} style={{ color: 'var(--text-disabled)', marginBottom: '0.375rem' }} />
          <p>No matching activity</p>
        </div>
      ) : (
        <>
          {grouped.map((group, gi) => (
            <div key={`${group.label}-${gi}`} className="activity-date-group">
              <div className="activity-date-label">{group.label}</div>
              {group.items.map(activity => {
                const config = TYPE_CONFIG[activity.type] || { icon: Clock, color: 'var(--text-disabled)' }
                const Icon = config.icon
                const hasAuthor = activity.authorUid || activity.authorName
                return (
                  <div key={activity.id} className="activity-item">
                    {hasAuthor ? (
                      <div
                        className="activity-avatar"
                        style={{ background: getAvatarColor(activity.authorUid) }}
                        title={activity.authorName || 'Unknown'}
                      >
                        {(activity.authorName || '?').charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div
                        className="activity-dot"
                        style={{ background: config.color + '18', color: config.color }}
                      >
                        <Icon size={12} />
                      </div>
                    )}
                    <div className="activity-content">
                      <div className="activity-text">
                        {hasAuthor && (
                          <span className="activity-type-badge" style={{ background: config.color + '18', color: config.color }}>
                            <Icon size={9} />
                          </span>
                        )}
                        {getDescription(activity, currentUserUid)}
                      </div>
                      <div className="activity-time">{getRelativeTime(activity.timestamp)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {hasMore && (
            <button
              className="activity-show-more"
              onClick={() => setVisibleCount(prev => prev + 10)}
            >
              Show more ({filteredActivities.length - visibleCount} remaining)
            </button>
          )}
        </>
      )}
    </div>
  )
}
