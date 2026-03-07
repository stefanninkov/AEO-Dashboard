/**
 * PresenceHint — Subtle banner showing who else is viewing the same page.
 *
 * Shows "Name is also viewing this page" when teammates share your active view.
 * Also shows "Name edited this Xm ago" when recent activity matches the current view.
 */
import { useMemo } from 'react'
import { Eye, Edit3 } from 'lucide-react'

const VIEW_ACTIVITY_MAP = {
  checklist: ['check', 'uncheck', 'task_assign', 'task_unassign', 'comment', 'bulk_check', 'bulk_uncheck'],
  analyzer: ['analyze', 'generatePageFix', 'generateFix'],
  writer: ['contentWrite'],
  schema: ['schemaGenerate'],
  competitors: ['competitor_add', 'competitor_remove', 'competitor_monitor', 'citation_share_check'],
  monitoring: ['competitor_monitor'],
  settings: ['member_add', 'member_remove', 'role_change'],
}

const RECENT_THRESHOLD = 10 * 60 * 1000 // 10 minutes

function getRecentEditor(activityLog, activeView, currentUid) {
  if (!activityLog?.length) return null
  const relevantTypes = VIEW_ACTIVITY_MAP[activeView]
  if (!relevantTypes) return null

  const now = Date.now()
  for (const entry of activityLog) {
    if (!entry.authorUid || entry.authorUid === currentUid) continue
    if (!relevantTypes.includes(entry.type)) continue
    const age = now - new Date(entry.timestamp).getTime()
    if (age > RECENT_THRESHOLD) return null // list is sorted newest-first
    const mins = Math.floor(age / 60000)
    return { name: entry.authorName, mins }
  }
  return null
}

export default function PresenceHint({ onlineMembers = [], activeView, currentUid, activityLog = [] }) {
const viewers = useMemo(() => {
    return onlineMembers.filter(m =>
      m.uid !== currentUid && m.activeView === activeView
    )
  }, [onlineMembers, activeView, currentUid])

  const recentEditor = useMemo(() => {
    return getRecentEditor(activityLog, activeView, currentUid)
  }, [activityLog, activeView, currentUid])

  if (viewers.length === 0 && !recentEditor) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      padding: 'var(--space-2) var(--space-5)',
      background: 'var(--bg-input)',
      borderBottom: '0.0625rem solid var(--border-subtle)',
      fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)',
      flexWrap: 'wrap',
    }}>
      {/* Viewers */}
      {viewers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {viewers.slice(0, 3).map((v, i) => (
              <div
                key={v.uid}
                title={v.displayName}
                style={{
                  width: '1.25rem', height: '1.25rem',
                  borderRadius: 'var(--radius-full)',
                  background: `var(--color-phase-${(i % 7) + 1})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', fontWeight: 700, color: '#fff',
                  border: '0.125rem solid var(--bg-input)',
                  marginLeft: i > 0 ? '-0.375rem' : 0,
                  position: 'relative', zIndex: 3 - i,
                }}
              >
                {(v.displayName || '?')[0].toUpperCase()}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Eye size={10} style={{ color: 'var(--color-phase-4)', flexShrink: 0 }} />
            <span>
              {viewers.length === 1
                ? `${viewers[0].displayName} is also viewing this page`
                : `${viewers.length} others are also viewing this page`
              }
            </span>
            <span style={{
              width: '0.375rem', height: '0.375rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-phase-4)',
              animation: 'pulse 2s ease-in-out infinite',
              flexShrink: 0,
            }} />
          </div>
        </div>
      )}

      {/* Recent editor */}
      {recentEditor && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <Edit3 size={10} style={{ color: 'var(--color-phase-5)', flexShrink: 0 }} />
          <span>
            {recentEditor.mins < 1
              ? `${recentEditor.name} edited this just now`
              : `${recentEditor.name} edited this ${recentEditor.mins}m ago`
            }
          </span>
        </div>
      )}
    </div>
  )
}
