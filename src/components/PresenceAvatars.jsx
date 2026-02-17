import { memo } from 'react'

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

const VIEW_LABELS = {
  dashboard: 'Dashboard',
  competitors: 'Competitors',
  checklist: 'Checklist',
  process: 'Process Map',
  analyzer: 'Analyzer',
  writer: 'Content Writer',
  schema: 'Schema Generator',
  monitoring: 'Monitoring',
  metrics: 'Metrics',
  docs: 'Documentation',
  testing: 'Testing',
  team: 'Team',
  webflow: 'Webflow',
  settings: 'Settings',
}

/**
 * Stacked avatar row showing online team members.
 * - compact: smaller avatars, overlapping (for sidebar)
 * - expanded: shows names + active view (for view headers)
 */
export default memo(function PresenceAvatars({ members = [], currentUserUid, variant = 'compact' }) {
  // Filter out current user, show others
  const others = members.filter(m => m.uid !== currentUserUid)

  if (others.length === 0) return null

  if (variant === 'compact') {
    return (
      <div className="presence-compact">
        <div className="presence-dot-pulse" />
        <div className="presence-stack">
          {others.slice(0, 5).map((member, i) => (
            <div
              key={member.uid}
              className="presence-avatar-sm"
              style={{
                background: getAvatarColor(member.displayName),
                zIndex: 5 - i,
              }}
              title={`${member.displayName} — ${VIEW_LABELS[member.activeView] || member.activeView}`}
            >
              {getInitials(member.displayName)}
            </div>
          ))}
          {others.length > 5 && (
            <div
              className="presence-avatar-sm presence-overflow"
              style={{ zIndex: 0 }}
              title={`${others.length - 5} more online`}
            >
              +{others.length - 5}
            </div>
          )}
        </div>
        <span className="presence-count">{others.length} online</span>
      </div>
    )
  }

  // variant === 'expanded'
  return (
    <div className="presence-expanded">
      {others.map(member => (
        <div key={member.uid} className="presence-member">
          <div className="presence-avatar-ring">
            <div
              className="presence-avatar-md"
              style={{ background: getAvatarColor(member.displayName) }}
            >
              {getInitials(member.displayName)}
            </div>
          </div>
          <div className="presence-member-info">
            <span className="presence-member-name">{member.displayName}</span>
            <span className="presence-member-view">
              {VIEW_LABELS[member.activeView] || member.activeView}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
})
