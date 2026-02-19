import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2, XCircle, StickyNote, Zap, Download,
  UserPlus, UserMinus, Clock, MessageSquare, Shield,
  FileText, Code, Activity, Filter
} from 'lucide-react'

const TYPE_ICONS = {
  check: CheckCircle2,
  uncheck: XCircle,
  note: StickyNote,
  analyze: Zap,
  export: Download,
  competitor_add: UserPlus,
  competitor_remove: UserMinus,
  create_project: CheckCircle2,
  task_assign: UserPlus,
  task_unassign: UserMinus,
  comment: MessageSquare,
  member_add: UserPlus,
  member_remove: UserMinus,
  role_change: Shield,
  monitor: Activity,
  contentWrite: FileText,
  schemaGenerate: Code,
  generateFix: Zap,
}

const TYPE_COLORS = {
  check: 'var(--color-success)',
  uncheck: 'var(--text-disabled)',
  note: 'var(--color-phase-3)',
  analyze: 'var(--color-phase-1)',
  export: 'var(--color-phase-2)',
  competitor_add: 'var(--color-phase-4)',
  competitor_remove: 'var(--color-error)',
  create_project: 'var(--color-phase-5)',
  task_assign: 'var(--color-phase-2)',
  task_unassign: 'var(--text-disabled)',
  comment: 'var(--color-phase-4)',
  member_add: 'var(--color-success)',
  member_remove: 'var(--color-error)',
  role_change: 'var(--color-phase-5)',
  monitor: 'var(--color-phase-1)',
  contentWrite: 'var(--color-phase-3)',
  schemaGenerate: 'var(--color-phase-4)',
  generateFix: 'var(--color-phase-2)',
}

const TYPE_I18N_KEYS = {
  check: 'activity.typeCompleted',
  uncheck: 'activity.typeUnchecked',
  note: 'activity.typeAddedNote',
  analyze: 'activity.typeAnalyzed',
  export: 'activity.typeExported',
  competitor_add: 'activity.typeCompetitorAdd',
  competitor_remove: 'activity.typeCompetitorRemove',
  create_project: 'activity.typeCreatedProject',
  task_assign: 'activity.typeAssigned',
  task_unassign: 'activity.typeUnassigned',
  comment: 'activity.typeCommented',
  member_add: 'activity.typeMemberAdd',
  member_remove: 'activity.typeMemberRemove',
  role_change: 'activity.typeRoleChange',
  monitor: 'activity.typeMonitor',
  contentWrite: 'activity.typeContentWrite',
  schemaGenerate: 'activity.typeSchemaGenerate',
  generateFix: 'activity.typeGenerateFix',
}

function getDateLabel(dateStr, t) {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('time.today')
  if (diffDays === 1) return t('time.yesterday')
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function getRelativeTime(dateStr, t) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('time.justNow')
  if (diffMins < 60) return t('time.minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('time.hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('time.daysAgo', { count: diffDays })
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function getAuthorLabel(activity, currentUserUid, t) {
  if (!activity.authorUid && !activity.authorName) return null
  if (activity.authorUid === currentUserUid) return t('activity.you')
  return activity.authorName || t('activity.someone')
}

function getDescription(activity, currentUserUid, t) {
  const label = t(TYPE_I18N_KEYS[activity.type] || `activity.type${activity.type}`, { defaultValue: activity.type })
  const author = getAuthorLabel(activity, currentUserUid, t)
  const prefix = author ? `${author} — ` : ''

  switch (activity.type) {
    case 'check':
    case 'uncheck':
      return `${prefix}${label}: ${activity.taskText || 'task'}`
    case 'note':
      return `${prefix}${label}: ${activity.taskText || 'task'}`
    case 'analyze':
      return activity.score !== undefined
        ? `${prefix}${label} ${activity.url || 'site'} — Score: ${activity.score}`
        : `${prefix}${label} ${activity.url || 'site'}`
    case 'export':
      return `${prefix}${label}`
    case 'competitor_add':
      return `${prefix}${label}: ${activity.url || 'competitor'}`
    case 'competitor_remove':
      return `${prefix}${label}: ${activity.url || 'competitor'}`
    case 'create_project':
      return `${prefix}${label}`
    case 'task_assign':
      return `${prefix}${label} "${activity.taskText || 'task'}" to ${activity.assigneeName || 'member'}`
    case 'task_unassign':
      return `${prefix}${label} ${activity.assigneeName || 'member'} from "${activity.taskText || 'task'}"`
    case 'comment':
      return `${prefix}${label} "${activity.taskText || 'task'}"`
    case 'member_add':
      return `${prefix}${label}: ${activity.memberName || 'member'}`
    case 'member_remove':
      return `${prefix}${label}: ${activity.memberName || 'member'}`
    case 'role_change':
      return `${prefix}${label} for ${activity.memberName || 'member'} to ${activity.newRole || 'role'}`
    case 'monitor':
      return activity.score !== undefined
        ? `${prefix}${label} — Score: ${activity.score}`
        : `${prefix}${label}`
    case 'contentWrite':
      return `${prefix}${label}: ${activity.topic || 'content'}`
    case 'schemaGenerate':
      return `${prefix}${label}: ${activity.topic || 'schema'}`
    case 'generateFix':
      return `${prefix}${label} for ${activity.itemName || 'item'}`
    default:
      return `${prefix}${label}`
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
  const { t } = useTranslation()
  const [visibleCount, setVisibleCount] = useState(maxVisible)
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterUser, setFilterUser] = useState('all')

  const FILTER_GROUPS = useMemo(() => ({
    all: { label: t('activity.filterAll') },
    tasks: { label: t('activity.filterTasks'), types: ['check', 'uncheck', 'note', 'task_assign', 'task_unassign', 'comment'] },
    team: { label: t('activity.filterTeam'), types: ['member_add', 'member_remove', 'role_change'] },
    tools: { label: t('activity.filterTools'), types: ['analyze', 'export', 'monitor', 'contentWrite', 'schemaGenerate', 'generateFix', 'competitor_add', 'competitor_remove'] },
  }), [t])

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
  }, [activities, filterGroup, filterUser, FILTER_GROUPS])

  const visibleActivities = filteredActivities.slice(0, visibleCount)
  const hasMore = filteredActivities.length > visibleCount
  const showFilters = activities.length > 3

  // Group by date
  const grouped = useMemo(() => {
    const groups = []
    let currentLabel = null

    visibleActivities.forEach(activity => {
      const label = getDateLabel(activity.timestamp, t)
      if (label !== currentLabel) {
        currentLabel = label
        groups.push({ label, items: [] })
      }
      groups[groups.length - 1].items.push(activity)
    })

    return groups
  }, [visibleActivities, t])

  if (activities.length === 0) {
    return (
      <div className="activity-empty">
        <Clock size={20} style={{ color: 'var(--text-disabled)', marginBottom: '0.5rem' }} />
        <p>{t('activity.noActivity')}</p>
        <p className="activity-empty-sub">{t('activity.startChecking')}</p>
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
              <option value="all">{t('activity.allMembers')}</option>
              {authors.map(([uid, name]) => (
                <option key={uid} value={uid}>
                  {uid === currentUserUid ? t('activity.you') : name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <div className="activity-empty" style={{ padding: '1rem 0' }}>
          <Filter size={16} style={{ color: 'var(--text-disabled)', marginBottom: '0.375rem' }} />
          <p>{t('activity.noMatchingActivity')}</p>
        </div>
      ) : (
        <>
          {grouped.map((group, gi) => (
            <div key={`${group.label}-${gi}`} className="activity-date-group">
              <div className="activity-date-label">{group.label}</div>
              {group.items.map(activity => {
                const color = TYPE_COLORS[activity.type] || 'var(--text-disabled)'
                const Icon = TYPE_ICONS[activity.type] || Clock
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
                        style={{ background: color + '18', color }}
                      >
                        <Icon size={12} />
                      </div>
                    )}
                    <div className="activity-content">
                      <div className="activity-text">
                        {hasAuthor && (
                          <span className="activity-type-badge" style={{ background: color + '18', color }}>
                            <Icon size={9} />
                          </span>
                        )}
                        {getDescription(activity, currentUserUid, t)}
                      </div>
                      <div className="activity-time">{getRelativeTime(activity.timestamp, t)}</div>
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
              {t('actions.showMore', { count: filteredActivities.length - visibleCount })}
            </button>
          )}
        </>
      )}
    </div>
  )
}
