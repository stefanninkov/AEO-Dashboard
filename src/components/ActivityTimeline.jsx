import { useState, useMemo } from 'react'
import {
  CheckCircle2, XCircle, StickyNote, Zap, Download,
  UserPlus, UserMinus, Clock
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

function getDescription(activity) {
  const config = TYPE_CONFIG[activity.type] || { label: activity.type }

  switch (activity.type) {
    case 'check':
    case 'uncheck':
      return `${config.label}: ${activity.taskText || 'task'}`
    case 'note':
      return `${config.label}: ${activity.taskText || 'task'}`
    case 'analyze':
      return activity.score !== undefined
        ? `${config.label} ${activity.url || 'site'} — Score: ${activity.score}`
        : `${config.label} ${activity.url || 'site'}`
    case 'export':
      return config.label
    case 'competitor_add':
      return `${config.label}: ${activity.url || 'competitor'}`
    case 'competitor_remove':
      return `${config.label}: ${activity.url || 'competitor'}`
    case 'create_project':
      return config.label
    default:
      return config.label
  }
}

export default function ActivityTimeline({ activities = [], maxVisible = 10 }) {
  const [visibleCount, setVisibleCount] = useState(maxVisible)

  const visibleActivities = activities.slice(0, visibleCount)
  const hasMore = activities.length > visibleCount

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
      {grouped.map((group, gi) => (
        <div key={`${group.label}-${gi}`} className="activity-date-group">
          <div className="activity-date-label">{group.label}</div>
          {group.items.map(activity => {
            const config = TYPE_CONFIG[activity.type] || { icon: Clock, color: 'var(--text-disabled)' }
            const Icon = config.icon
            return (
              <div key={activity.id} className="activity-item">
                <div
                  className="activity-dot"
                  style={{ background: config.color + '18', color: config.color }}
                >
                  <Icon size={12} />
                </div>
                <div className="activity-content">
                  <div className="activity-text">{getDescription(activity)}</div>
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
          Show more ({activities.length - visibleCount} remaining)
        </button>
      )}
    </div>
  )
}
