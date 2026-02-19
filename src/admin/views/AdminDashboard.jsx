import { useState } from 'react'
import {
  Users, FolderKanban, Activity, CheckSquare,
  RefreshCw, Clock, UserPlus, TrendingUp, Zap, AlertTriangle,
  Mail, MessageSquare, ArrowUpRight, ArrowDownRight, Minus,
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
  if (!dateInput) return '\u2014'
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

/* ── Sparkline (SVG mini bar chart) ── */
function Sparkline({ data, color, height = 32, width = 120 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.count), 1)
  const barW = width / data.length - 1
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {data.map((d, i) => {
        const barH = (d.count / max) * (height - 2)
        return (
          <rect
            key={i}
            x={i * (barW + 1)}
            y={height - barH - 1}
            width={barW}
            height={Math.max(barH, 1)}
            rx={1}
            fill={d.count > 0 ? color : `${color}30`}
            opacity={d.count > 0 ? 0.85 : 0.3}
          />
        )
      })}
    </svg>
  )
}

/* ── Stat Card (enhanced) ── */
function StatCard({ icon: Icon, label, value, sublabel, color, trend, sparkData }) {
  return (
    <div className="card" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        {trend !== undefined && trend !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.125rem',
            fontSize: '0.625rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : 'var(--text-disabled)',
          }}>
            {trend > 0 ? <ArrowUpRight size={10} /> : trend < 0 ? <ArrowDownRight size={10} /> : <Minus size={10} />}
            {trend > 0 ? '+' : ''}{trend}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
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
        {sparkData && (
          <Sparkline data={sparkData} color={color} height={28} width={80} />
        )}
      </div>
    </div>
  )
}

/* ── Trend Chart (larger, for sections) ── */
function TrendChart({ data, color, title, height = 80 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.count), 1)
  const barW = Math.floor(100 / data.length)

  return (
    <div>
      {title && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'var(--text-disabled)',
          textTransform: 'uppercase',
          letterSpacing: '0.04rem',
          marginBottom: '0.75rem',
        }}>
          {title}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${data.length * barW} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          {data.map((d, i) => {
            const barH = (d.count / max) * (height - 16)
            return (
              <g key={i}>
                <rect
                  x={i * barW + 1}
                  y={height - barH - 14}
                  width={barW - 2}
                  height={Math.max(barH, 2)}
                  rx={2}
                  fill={d.count > 0 ? color : `${color}20`}
                  opacity={d.count > 0 ? 0.8 : 0.25}
                />
                {d.count > 0 && (
                  <text
                    x={i * barW + barW / 2}
                    y={height - barH - 17}
                    textAnchor="middle"
                    fill="var(--text-disabled)"
                    fontSize="7"
                    fontFamily="var(--font-mono)"
                  >
                    {d.count}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.25rem',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
            {data[0]?.date}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
            {data[data.length - 1]?.date}
          </span>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '1rem' }}>
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

  // Calculate weekly trends (this week vs last week)
  const calcWeeklyTrend = (trend) => {
    if (!trend || trend.length < 14) return null
    const thisWeek = trend.slice(7).reduce((s, d) => s + d.count, 0)
    const lastWeek = trend.slice(0, 7).reduce((s, d) => s + d.count, 0)
    return thisWeek - lastWeek
  }

  const signupWeeklyTrend = calcWeeklyTrend(stats.signupTrend)
  const waitlistWeeklyTrend = calcWeeklyTrend(stats.waitlistTrend)

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
            Last updated: {stats.lastUpdated ? timeAgo(stats.lastUpdated) : '\u2014'}
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
              {' '}Go to <strong>Firebase Console &rarr; Firestore &rarr; Rules</strong> and add a rule allowing your UID
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

    match /waitlist/{docId} {
      allow read: if isSuperAdmin();
      allow create: if true;
    }

    match /feedback/{docId} {
      allow read, write: if isSuperAdmin();
      allow create: if request.auth != null;
    }

    match /config/{docId} {
      allow read, write: if isSuperAdmin();
    }
  }
}`}</pre>
            </details>
          </div>
        </div>
      )}

      {/* Primary Stat Cards — 3+3 grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
        gap: '1rem',
      }}>
        <StatCard
          icon={Mail}
          label="Waitlist"
          value={stats.waitlistTotal}
          sublabel={`${stats.waitlistThisWeek} this week \u00B7 ${stats.waitlistToday} today`}
          color="#FF6B35"
          trend={waitlistWeeklyTrend}
          sparkData={stats.waitlistTrend}
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          sublabel={`${stats.signupsThisWeek} new this week`}
          color="#3B82F6"
          trend={signupWeeklyTrend}
          sparkData={stats.signupTrend}
        />
        <StatCard
          icon={Zap}
          label="Active Today"
          value={stats.activeToday}
          sublabel={`${stats.activeThisWeek} this week`}
          color="#10B981"
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
          color="#8B5CF6"
        />
        <StatCard
          icon={MessageSquare}
          label="Feedback"
          value={stats.feedbackTotal}
          sublabel={stats.feedbackNew > 0 ? `${stats.feedbackNew} unreviewed` : 'All reviewed'}
          color={stats.feedbackNew > 0 ? '#F59E0B' : '#10B981'}
        />
      </div>

      {/* Trend Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
        gap: '1rem',
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <TrendChart
            data={stats.waitlistTrend}
            color="#FF6B35"
            title="Waitlist Signups (14d)"
            height={70}
          />
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <TrendChart
            data={stats.activityTrend}
            color="#3B82F6"
            title="User Activity (14d)"
            height={70}
          />
        </div>
      </div>

      {/* Two-column layout: Recent Users + Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
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
            {stats.recentActivity.slice(0, 20).map((act, i) => (
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
                      <span style={{ color: 'var(--text-tertiary)' }}> \u2014 {act.itemText}</span>
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

      {/* Recent Waitlist + Feedback summary side by side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
        gap: '1rem',
      }}>
        {/* Recent Waitlist Entries */}
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
              <Mail size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.5rem' }} />
              Latest Waitlist
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
              {stats.waitlistTotal} total
            </span>
          </div>
          <div style={{ maxHeight: '14rem', overflowY: 'auto' }}>
            {(stats.waitlistEntries || []).slice(0, 8).map(entry => (
              <div key={entry.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  width: '1.5rem', height: '1.5rem', borderRadius: 6,
                  background: 'rgba(255,107,53,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Mail size={10} style={{ color: '#FF6B35' }} />
                </div>
                <span style={{
                  flex: 1, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
                }}>
                  {entry.email}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-disabled)', flexShrink: 0,
                }}>
                  {timeAgo(entry.signedUpAt)}
                </span>
              </div>
            ))}
            {(!stats.waitlistEntries || stats.waitlistEntries.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                No waitlist signups yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
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
              <MessageSquare size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.5rem' }} />
              Latest Feedback
            </span>
            {stats.feedbackNew > 0 && (
              <span style={{
                fontSize: '0.625rem', fontWeight: 700,
                padding: '0.125rem 0.5rem', borderRadius: 99,
                background: 'rgba(245,158,11,0.15)', color: '#F59E0B',
              }}>
                {stats.feedbackNew} new
              </span>
            )}
          </div>
          <div style={{ maxHeight: '14rem', overflowY: 'auto' }}>
            {(stats.feedbackEntries || []).slice(0, 8).map(fb => {
              const RATING_EMOJI = { love: '\uD83D\uDE0D', good: '\uD83D\uDE0A', okay: '\uD83D\uDE10', frustrated: '\uD83D\uDE1F' }
              const STATUS_COLORS = { new: '#F59E0B', reviewed: '#3B82F6', resolved: '#10B981' }
              const fbStatus = fb.status || 'new'
              return (
                <div key={fb.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                    {RATING_EMOJI[fb.rating] || '\u2753'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8125rem', color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {fb.message || 'No message'}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.0625rem' }}>
                      {fb.displayName || fb.userEmail || 'Anonymous'} \u00B7 {timeAgo(fb.createdAt)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                    padding: '0.125rem 0.375rem', borderRadius: 99,
                    background: `${STATUS_COLORS[fbStatus] || '#6B7280'}15`,
                    color: STATUS_COLORS[fbStatus] || '#6B7280',
                    flexShrink: 0,
                  }}>
                    {fbStatus}
                  </span>
                </div>
              )
            })}
            {(!stats.feedbackEntries || stats.feedbackEntries.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                No feedback yet
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
                  <th scope="col" key={h} style={{
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
