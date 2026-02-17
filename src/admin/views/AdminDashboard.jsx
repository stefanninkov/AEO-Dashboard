import { useState } from 'react'
import {
  Users, FolderKanban, Activity, CheckSquare,
  RefreshCw, Clock, UserPlus, TrendingUp, Zap, AlertTriangle,
} from 'lucide-react'
import { useAdminStats } from '../hooks/useAdminStats'

/* ── Helpers ── */
function timeAgo(dateInput) {
  if (!dateInput) return 'Never'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function formatDate(dateInput) {
  if (!dateInput) return '—'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const AVATAR_COLORS = [
  '#FF6B35', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899',
  '#F59E0B', '#06B6D4', '#EF4444', '#84CC16', '#6366F1',
]

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/* ── Activity type labels & icons ── */
const ACTIVITY_LABELS = {
  check: 'Checked task',
  uncheck: 'Unchecked task',
  note: 'Updated notes',
  analyze: 'Ran analyzer',
  contentWrite: 'Generated content',
  schemaGenerate: 'Generated schema',
  generateFix: 'Generated fix',
  monitor: 'Ran monitor',
  competitor_add: 'Added competitor',
  competitor_remove: 'Removed competitor',
  competitor_analyze: 'Analyzed competitors',
  task_assign: 'Assigned task',
  task_unassign: 'Unassigned task',
  comment_add: 'Added comment',
  member_add: 'Added team member',
  member_remove: 'Removed member',
  role_change: 'Changed role',
  export_pdf: 'Exported PDF',
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sublabel, color }) {
  return (
    <div className="card" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.5rem',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'var(--text-disabled)',
          textTransform: 'uppercase',
          letterSpacing: '0.06rem',
        }}>
          {label}
        </span>
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}>
          {value}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}

/* ── Loading State ── */
function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.5rem', height: '5rem' }}>
        <div style={{ width: '12rem', height: '1rem', borderRadius: '0.25rem', background: 'var(--hover-bg)' }} />
        <div style={{ width: '20rem', height: '0.75rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', marginTop: '0.75rem' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: '1.25rem', height: '6rem' }}>
            <div style={{ width: '5rem', height: '0.75rem', borderRadius: '0.25rem', background: 'var(--hover-bg)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Dashboard ── */
export default function AdminDashboard({ user }) {
  const { stats, loading, error, permissionWarning, refresh } = useAdminStats(user)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  if (loading && !stats) return <DashboardSkeleton />

  if (error && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>
        <button onClick={handleRefresh} className="btn-primary">Retry</button>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}>
            Welcome, {user?.displayName || 'Admin'}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            Last updated: {stats.lastUpdated ? timeAgo(stats.lastUpdated) : '—'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="icon-btn"
          title="Refresh stats"
          disabled={refreshing}
          style={{ opacity: refreshing ? 0.5 : 1 }}
        >
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Permission Warning Banner */}
      {permissionWarning && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.875rem 1rem',
          borderRadius: '0.75rem',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}>
          <AlertTriangle size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Limited Admin Access
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {permissionWarning}
              {' '}Go to <strong>Firebase Console → Firestore → Rules</strong> and add a rule allowing your UID
              to read all collections. See below for the rule to add.
            </div>
            <details style={{ marginTop: '0.5rem' }}>
              <summary style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                Show Firestore rule snippet
              </summary>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginTop: '0.5rem',
                overflowX: 'auto',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                whiteSpace: 'pre',
              }}>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Super admin can read everything
    function isSuperAdmin() {
      return request.auth != null
        && request.auth.uid == '${user?.uid || 'YOUR_UID'}';
    }

    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
      allow read: if isSuperAdmin();

      match /projects/{projectId} {
        allow read, write: if request.auth != null
          && request.auth.uid == userId;
        allow read: if isSuperAdmin();
      }
    }

    match /projects/{projectId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.memberIds;
      allow read: if isSuperAdmin();
    }
  }
}`}</pre>
            </details>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
        gap: '1rem',
      }}>
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          sublabel={`${stats.signupsThisWeek} new this week`}
          color="#FF6B35"
        />
        <StatCard
          icon={Zap}
          label="Active Today"
          value={stats.activeToday}
          sublabel={`${stats.activeThisWeek} this week`}
          color="#3B82F6"
        />
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value={stats.totalProjects}
          sublabel={`${stats.activeProjects} active this week`}
          color="#0EA5E9"
        />
        <StatCard
          icon={CheckSquare}
          label="Tasks Completed"
          value={stats.completedTasks}
          sublabel={`of ${stats.totalTasks} total tasks`}
          color="#10B981"
        />
      </div>

      {/* Two-column layout: Recent Users + Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
      }}>
        {/* Recent Users */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04rem',
            }}>
              <UserPlus size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.5rem' }} />
              Recent Users
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
              {stats.totalUsers} total
            </span>
          </div>
          <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
            {stats.recentSignups.map(u => (
              <div key={u.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: u.photoURL ? 'transparent' : getAvatarColor(u.displayName || u.email),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {u.photoURL
                    ? <img src={u.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : getInitials(u.displayName || u.email)
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {u.displayName || u.email?.split('@')[0] || 'User'}
                  </div>
                  <div style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-disabled)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {u.email || ''}
                  </div>
                </div>
                {/* Meta */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                    {formatDate(u.createdAt)}
                  </div>
                  <div style={{
                    fontSize: '0.625rem',
                    color: 'var(--text-disabled)',
                  }}>
                    Last: {timeAgo(u.lastLoginAt)}
                  </div>
                </div>
              </div>
            ))}
            {stats.recentSignups.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                No users yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04rem',
            }}>
              <Activity size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.5rem' }} />
              Recent Activity
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
              {stats.recentActivity.length} events
            </span>
          </div>
          <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
            {stats.recentActivity.map((act, i) => (
              <div key={act.id || i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.625rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {/* Time */}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--text-disabled)',
                  minWidth: '3.5rem',
                  flexShrink: 0,
                  paddingTop: '0.125rem',
                }}>
                  {timeAgo(act.timestamp)}
                </span>
                {/* Description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                  }}>
                    {act.authorName && (
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {act.authorName}
                      </span>
                    )}{' '}
                    {ACTIVITY_LABELS[act.type] || act.type}
                    {act.itemText && (
                      <span style={{ color: 'var(--text-tertiary)' }}> — {act.itemText}</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.625rem',
                    color: 'var(--text-disabled)',
                    marginTop: '0.125rem',
                  }}>
                    {act._projectName}
                  </div>
                </div>
              </div>
            ))}
            {stats.recentActivity.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                No activity recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Projects Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04rem',
          }}>
            <FolderKanban size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.5rem' }} />
            All Projects
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
            {stats.totalProjects} total
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Project', 'Owner', 'Progress', 'Members', 'Updated'].map(h => (
                  <th key={h} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06rem',
                    color: 'var(--text-disabled)',
                    textAlign: 'left',
                    padding: '0.625rem 1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.projects
                .sort((a, b) => {
                  const at = a.updatedAt ? new Date(a.updatedAt.toDate ? a.updatedAt.toDate() : a.updatedAt).getTime() : 0
                  const bt = b.updatedAt ? new Date(b.updatedAt.toDate ? b.updatedAt.toDate() : b.updatedAt).getTime() : 0
                  return bt - at
                })
                .slice(0, 20)
                .map(project => {
                  const checked = project.checked || {}
                  const total = Object.keys(checked).length
                  const done = Object.values(checked).filter(Boolean).length
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0
                  const members = project.members?.length || project.memberIds?.length || 1

                  return (
                    <tr key={project.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {/* Project name + URL */}
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '0.125rem',
                        }}>
                          {project.name || 'Untitled'}
                        </div>
                        <div style={{
                          fontSize: '0.6875rem',
                          color: 'var(--text-disabled)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '15rem',
                        }}>
                          {project.url || 'No URL'}
                        </div>
                      </td>
                      {/* Owner */}
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {project._ownerName || 'Unknown'}
                        </div>
                      </td>
                      {/* Progress bar */}
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            flex: 1,
                            height: '0.375rem',
                            borderRadius: '0.1875rem',
                            background: 'var(--hover-bg)',
                            overflow: 'hidden',
                            maxWidth: '6rem',
                          }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              borderRadius: '0.1875rem',
                              background: pct >= 75 ? '#10B981' : pct >= 40 ? '#F59E0B' : pct > 0 ? '#3B82F6' : 'transparent',
                            }} />
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            color: 'var(--text-tertiary)',
                            minWidth: '2.5rem',
                          }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      {/* Members */}
                      <td style={{
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-tertiary)',
                      }}>
                        {members}
                      </td>
                      {/* Updated */}
                      <td style={{
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-disabled)',
                      }}>
                        {timeAgo(project.updatedAt)}
                      </td>
                    </tr>
                  )
                })
              }
              {stats.projects.length === 0 && (
                <tr>
                  <td colSpan={5} style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-disabled)',
                    fontSize: '0.8125rem',
                  }}>
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {stats.projects.length > 20 && (
          <div style={{
            padding: '0.75rem 1.25rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-disabled)',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            Showing 20 of {stats.projects.length} projects
          </div>
        )}
      </div>
    </div>
  )
}
