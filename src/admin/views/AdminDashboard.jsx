import { useState } from 'react'
import {
  Users, FolderKanban, Activity, CheckSquare,
  RefreshCw, Clock, UserPlus, TrendingUp, Sparkles, AlertTriangle,
  Mail, MessageSquare, ArrowUpRight, ArrowDownRight, Minus,
  Shield, ShieldAlert, ShieldOff, UserX, AlertCircle,
  ChevronDown, ChevronUp, Cpu, ChartColumnIncreasing, Target,
  Heart, ThumbsUp, ThumbsDown,
} from 'lucide-react'
import { useAdminStats } from '../hooks/useAdminStats'
import NudgeEmailDialog from '../components/NudgeEmailDialog'

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

/* ── Activity type labels ── */
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

/* ── Health status colors & labels ── */
const HEALTH_STATUS = {
  active: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Active' },
  'at-risk': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'At Risk' },
  dormant: { color: '#F97316', bg: 'rgba(249,115,22,0.1)', label: 'Dormant' },
  churned: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Churned' },
}

const PROJECT_HEALTH = {
  thriving: { color: '#10B981', label: 'Thriving' },
  active: { color: '#3B82F6', label: 'Active' },
  stale: { color: '#F59E0B', label: 'Stale' },
  stuck: { color: '#F97316', label: 'Stuck' },
  abandoned: { color: '#EF4444', label: 'Abandoned' },
  'never-started': { color: '#6B7280', label: 'Never Started' },
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

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sublabel, color, trend, sparkData, badge }) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '0.5rem',
            background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} style={{ color }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06rem',
          }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {badge && (
            <span style={{
              fontSize: '0.5625rem', fontWeight: 700,
              padding: '0.125rem 0.375rem', borderRadius: 99,
              background: badge.bg, color: badge.color,
            }}>
              {badge.text}
            </span>
          )}
          {trend !== undefined && trend !== null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.125rem',
              fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
              color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : 'var(--text-disabled)',
            }}>
              {trend > 0 ? <ArrowUpRight size={10} /> : trend < 0 ? <ArrowDownRight size={10} /> : <Minus size={10} />}
              {trend > 0 ? '+' : ''}{trend}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '0.25rem',
          }}>
            {value}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {sublabel}
          </div>
        </div>
        {sparkData && <Sparkline data={sparkData} color={color} height={28} width={80} />}
      </div>
    </div>
  )
}

/* ── Trend Chart ── */
function TrendChart({ data, color, title, height = 80 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.count), 1)
  const barW = Math.floor(100 / data.length)

  return (
    <div>
      {title && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
          color: 'var(--text-disabled)', textTransform: 'uppercase',
          letterSpacing: '0.04rem', marginBottom: '0.75rem',
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
                  x={i * barW + 1} y={height - barH - 14}
                  width={barW - 2} height={Math.max(barH, 2)}
                  rx={2}
                  fill={d.count > 0 ? color : `${color}20`}
                  opacity={d.count > 0 ? 0.8 : 0.25}
                />
                {d.count > 0 && (
                  <text
                    x={i * barW + barW / 2} y={height - barH - 17}
                    textAnchor="middle" fill="var(--text-disabled)"
                    fontSize="7" fontFamily="var(--font-mono)"
                  >
                    {d.count}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
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

/* ── Funnel Step ── */
function FunnelStep({ label, count, total, prevCount, isLast }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const dropPct = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0
  const barColor = pct > 60 ? '#10B981' : pct > 30 ? '#F59E0B' : pct > 10 ? '#F97316' : '#EF4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {count}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
              ({pct}%)
            </span>
          </div>
        </div>
        <div style={{ height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: '0.1875rem', background: barColor, transition: 'width 0.3s ease' }} />
        </div>
      </div>
      {!isLast && dropPct > 0 && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
          color: '#EF4444', minWidth: '2.5rem', textAlign: 'right',
        }}>
          -{dropPct}%
        </span>
      )}
    </div>
  )
}

/* ── Section Header ── */
function SectionHeader({ icon: Icon, title, count, color, extra }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
        color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <Icon size={14} style={{ color: color || 'var(--text-disabled)' }} />
        {title}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {extra}
        {count !== undefined && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>{count}</span>
        )}
      </div>
    </div>
  )
}

/* ── Health Badge ── */
function HealthBadge({ status }) {
  const hs = HEALTH_STATUS[status] || HEALTH_STATUS.active
  return (
    <span style={{
      fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
      padding: '0.125rem 0.375rem', borderRadius: 99,
      background: hs.bg, color: hs.color,
    }}>
      {hs.label}
    </span>
  )
}

/* ── Project Health Badge ── */
function ProjectBadge({ badge }) {
  const ph = PROJECT_HEALTH[badge] || PROJECT_HEALTH.active
  return (
    <span style={{
      fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
      padding: '0.125rem 0.375rem', borderRadius: 99,
      background: `${ph.color}15`, color: ph.color,
    }}>
      {ph.label}
    </span>
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
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card" style={{ padding: '1.25rem', height: '6rem' }}>
            <div style={{ width: '5rem', height: '0.75rem', borderRadius: '0.25rem', background: 'var(--hover-bg)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD — Command Center
   ═══════════════════════════════════════════ */
export default function AdminDashboard({ user, onNavigate }) {
  const { stats, loading, error, permissionWarning, refresh } = useAdminStats(user)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)
  const [nudgeUser, setNudgeUser] = useState(null)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const nav = (view) => onNavigate && onNavigate(view)

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

  // Weekly trends
  const calcWeeklyTrend = (trend) => {
    if (!trend || trend.length < 14) return null
    const thisWeek = trend.slice(7).reduce((s, d) => s + d.count, 0)
    const lastWeek = trend.slice(0, 7).reduce((s, d) => s + d.count, 0)
    return thisWeek - lastWeek
  }
  const signupWeeklyTrend = calcWeeklyTrend(stats.signupTrend)
  const waitlistWeeklyTrend = calcWeeklyTrend(stats.waitlistTrend)

  // Platform health score (composite)
  const platformHealthScore = Math.min(100, Math.round(
    (stats.activeUsers?.length || 0) / Math.max(stats.totalUsers, 1) * 40 +
    (stats.thrivingProjects?.length || 0) / Math.max(stats.totalProjects, 1) * 30 +
    (stats.totalUsers > 0 ? (1 - (stats.churnedUsers?.length || 0) / stats.totalUsers) * 30 : 30)
  ))

  // Churn rate (30d)
  const churnRate = stats.totalUsers > 0
    ? Math.round((stats.churnedUsers?.length || 0) / stats.totalUsers * 100)
    : 0

  // DAU/WAU ratio
  const dauWauRatio = stats.activeThisWeek > 0
    ? Math.round(stats.activeToday / stats.activeThisWeek * 100)
    : 0

  // Avg project progress
  const avgProgress = stats.projectHealth?.length > 0
    ? Math.round(stats.projectHealth.reduce((s, p) => s + p.progress, 0) / stats.projectHealth.length)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '0.25rem',
          }}>
            Command Center
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

      {/* Permission Warning */}
      {permissionWarning && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.875rem 1rem', borderRadius: '0.75rem',
          background: 'rgba(245,158,11,0.08)', border: '0.0625rem solid rgba(245,158,11,0.2)',
        }}>
          <AlertTriangle size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Limited Admin Access
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {permissionWarning}
              {' '}Go to <strong>Firebase Console &rarr; Firestore &rarr; Rules</strong> and add a rule allowing your UID
              to read all collections.
            </div>
          </div>
        </div>
      )}

      {/* ── Alert Banner ── */}
      {stats.alerts && stats.alerts.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(239,68,68,0.04)',
            borderBottom: '0.0625rem solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <AlertCircle size={14} style={{ color: '#EF4444' }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
              color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
            }}>
              Needs Attention ({stats.alerts.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stats.alerts.map((alert, i) => {
              const alertColors = { error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' }
              return (
                <div
                  key={i}
                  onClick={() => nav(alert.link)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 1.25rem',
                    borderBottom: i < stats.alerts.length - 1 ? '0.0625rem solid var(--border-subtle)' : 'none',
                    cursor: alert.link ? 'pointer' : 'default',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: alertColors[alert.type] || '#6B7280', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1 }}>
                    {alert.message}
                  </span>
                  {alert.link && (
                    <ArrowUpRight size={12} style={{ color: 'var(--text-disabled)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Health Summary Cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem',
      }}>
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          sublabel={`${stats.signupsThisWeek} new this week`}
          color="#3B82F6"
          trend={signupWeeklyTrend}
          sparkData={stats.signupTrend}
          badge={stats.atRiskUsers?.length > 0 ? { text: `${stats.atRiskUsers.length} at risk`, bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' } : null}
        />
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={stats.totalProjects}
          sublabel={`${stats.thrivingProjects?.length || 0} thriving \u00B7 ${stats.staleProjects?.length || 0} stale \u00B7 ${stats.abandonedProjects?.length || 0} abandoned`}
          color="#0EA5E9"
        />
        <StatCard
          icon={Sparkles}
          label="Engagement"
          value={`${stats.activeToday} / ${stats.activeThisWeek}`}
          sublabel={`DAU/WAU: ${dauWauRatio}%`}
          color="#10B981"
        />
        <StatCard
          icon={CheckSquare}
          label="Avg Progress"
          value={`${avgProgress}%`}
          sublabel={`${stats.stuckProjects?.length || 0} stuck projects`}
          color="#8B5CF6"
        />
        <StatCard
          icon={UserX}
          label="Churn Rate"
          value={`${churnRate}%`}
          sublabel={`${stats.churnedUsers?.length || 0} churned (30d)`}
          color={churnRate > 20 ? '#EF4444' : churnRate > 10 ? '#F59E0B' : '#10B981'}
        />
        <StatCard
          icon={Shield}
          label="Platform Health"
          value={platformHealthScore}
          sublabel={platformHealthScore >= 70 ? 'Healthy' : platformHealthScore >= 40 ? 'Needs attention' : 'Critical'}
          color={platformHealthScore >= 70 ? '#10B981' : platformHealthScore >= 40 ? '#F59E0B' : '#EF4444'}
          badge={stats.apiUsageToday > 0 ? { text: `${stats.apiUsageToday} API calls today`, bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' } : null}
        />
      </div>

      {/* ── User Journey Funnel + Feature Usage — side by side ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem',
      }}>
        {/* Funnel */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader icon={Target} title="User Journey Funnel" color="#8B5CF6" />
          <div style={{ padding: '1rem 1.25rem' }}>
            {stats.churnFunnel && (() => {
              const f = stats.churnFunnel
              const steps = [
                { label: 'Signed Up', count: f.signedUp },
                { label: 'Created Project', count: f.createdProject },
                { label: 'Started Checklist', count: f.startedChecklist },
                { label: '25% Complete', count: f.completed25pct },
                { label: 'Used Analyzer', count: f.usedAnalyzer },
                { label: '50% Complete', count: f.completed50pct },
                { label: 'Used Advanced Feature', count: f.usedAdvancedFeature },
                { label: 'Retained 7d', count: f.retained7d },
                { label: 'Retained 30d', count: f.retained30d },
              ]
              return steps.map((step, i) => (
                <FunnelStep
                  key={step.label}
                  label={step.label}
                  count={step.count}
                  total={f.signedUp}
                  prevCount={i > 0 ? steps[i - 1].count : f.signedUp}
                  isLast={i === steps.length - 1}
                />
              ))
            })()}
          </div>
        </div>

        {/* Feature Adoption */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader icon={ChartColumnIncreasing} title="Feature Adoption" color="#3B82F6" />
          <div style={{ padding: '1rem 1.25rem' }}>
            {stats.featureUsage && Object.entries(stats.featureUsage).map(([key, val]) => {
              const featureLabels = {
                analyzer: 'AEO Analyzer',
                contentWriter: 'Content Writer',
                competitors: 'Competitors',
                metrics: 'Metrics',
                schema: 'Schema Generator',
                calendar: 'Content Calendar',
                export: 'PDF Export',
                team: 'Team Collaboration',
              }
              const barColor = val.pct > 50 ? '#10B981' : val.pct > 25 ? '#F59E0B' : val.pct > 0 ? '#F97316' : '#6B7280'
              return (
                <div key={key} style={{ padding: '0.375rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {featureLabels[key] || key}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
                      {val.used}/{val.total} ({val.pct}%)
                    </span>
                  </div>
                  <div style={{ height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${val.pct}%`, height: '100%', borderRadius: '0.1875rem',
                      background: barColor, transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Needs Attention: Cold Users + Cold Projects ── */}
      {((stats.coldUsers?.length || 0) > 0 || (stats.coldProjects?.length || 0) > 0) && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem',
        }}>
          {/* Cold Users */}
          {stats.coldUsers?.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <SectionHeader
                icon={ShieldAlert}
                title="Users Going Cold"
                color="#F59E0B"
                count={`${stats.coldUsers.length} users`}
              />
              <div style={{ maxHeight: '16rem', overflowY: 'auto' }}>
                {stats.coldUsers.slice(0, 10).map(u => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                      background: u.photoURL ? 'transparent' : getAvatarColor(u.displayName || u.email),
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.625rem', fontWeight: 700, flexShrink: 0, overflow: 'hidden',
                    }}>
                      {u.photoURL
                        ? <img src={u.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : getInitials(u.displayName || u.email)
                      }
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {u.displayName || u.email?.split('@')[0] || 'User'}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                        {u.projectCount} projects \u00B7 {u.completionRate}% complete \u00B7 last: {u.lastActivityType || 'login'}
                      </div>
                    </div>
                    {/* Nudge + Days idle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setNudgeUser(u) }}
                      title="Send nudge email"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem',
                        border: '0.0625rem solid var(--border-subtle)', background: 'none',
                        cursor: 'pointer', color: 'var(--text-tertiary)', flexShrink: 0,
                        transition: 'all 100ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.borderColor = '#F59E0B' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                    >
                      <Mail size={11} />
                    </button>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                        color: u.daysSinceActivity > 21 ? '#EF4444' : '#F59E0B',
                      }}>
                        {u.daysSinceActivity}d idle
                      </div>
                      <HealthBadge status={u.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cold Projects */}
          {stats.coldProjects?.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <SectionHeader
                icon={ShieldOff}
                title="Projects Going Cold"
                color="#F97316"
                count={`${stats.coldProjects.length} projects`}
              />
              <div style={{ maxHeight: '16rem', overflowY: 'auto' }}>
                {stats.coldProjects.slice(0, 10).map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {p.name || 'Untitled'}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                        by {p._ownerName || 'Unknown'} \u00B7 {p.progress}% \u00B7 last: {p.lastActivityType || 'update'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                        color: p.daysSinceActivity > 21 ? '#EF4444' : '#F59E0B',
                      }}>
                        {p.daysSinceActivity}d idle
                      </div>
                      <ProjectBadge badge={p.healthBadge} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Trend Charts Row ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem',
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <TrendChart data={stats.waitlistTrend} color="#FF6B35" title="Waitlist Signups (14d)" height={70} />
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <TrendChart data={stats.activityTrend} color="#3B82F6" title="User Activity (14d)" height={70} />
        </div>
      </div>

      {/* ── At-Risk Users (sorted by urgency) + Recent Activity ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem',
      }}>
        {/* At-Risk Users */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader
            icon={UserPlus}
            title="Users by Health"
            count={`${stats.totalUsers} total`}
          />
          <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
            {(stats.userHealth || [])
              .sort((a, b) => {
                // Sort: churned, dormant, at-risk, active
                const order = { churned: 0, dormant: 1, 'at-risk': 2, active: 3 }
                if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
                return a.healthScore - b.healthScore
              })
              .slice(0, 15)
              .map(u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                }}>
                  {/* Status dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: HEALTH_STATUS[u.status]?.color || '#10B981',
                  }} />
                  {/* Avatar */}
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    background: u.photoURL ? 'transparent' : getAvatarColor(u.displayName || u.email),
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0, overflow: 'hidden',
                  }}>
                    {u.photoURL
                      ? <img src={u.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(u.displayName || u.email)
                    }
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {u.displayName || u.email?.split('@')[0] || 'User'}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
                      {u.projectCount} projects \u00B7 {u.completionRate}% \u00B7 Last login: {timeAgo(u.lastLoginAt)}
                    </div>
                  </div>
                  {/* Score + badge */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                      color: u.healthScore >= 60 ? '#10B981' : u.healthScore >= 30 ? '#F59E0B' : '#EF4444',
                      marginBottom: '0.125rem',
                    }}>
                      {u.healthScore}
                    </div>
                    <HealthBadge status={u.status} />
                  </div>
                </div>
              ))}
            {(!stats.userHealth || stats.userHealth.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                No users yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader
            icon={Activity}
            title="Recent Activity"
            count={`${stats.recentActivity.length} events`}
          />
          <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
            {stats.recentActivity.slice(0, 20).map((act, i) => (
              <div key={act.id || i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.625rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                  color: 'var(--text-disabled)', minWidth: '3.5rem', flexShrink: 0, paddingTop: '0.125rem',
                }}>
                  {timeAgo(act.timestamp)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
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
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
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

      {/* ── Engagement & Onboarding ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem',
      }}>
        {/* Engagement Depth */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase',
            letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Engagement Depth
          </div>
          {stats.engagementDepth && (() => {
            const ed = stats.engagementDepth
            const total = Math.max(ed.signedUpOnly + ed.light + ed.medium + ed.heavy, 1)
            const segments = [
              { label: 'Signed up only', count: ed.signedUpOnly, color: '#6B7280' },
              { label: 'Light (1-10)', count: ed.light, color: '#3B82F6' },
              { label: 'Medium (11-50)', count: ed.medium, color: '#8B5CF6' },
              { label: 'Heavy (50+)', count: ed.heavy, color: '#10B981' },
            ]
            return (
              <>
                {/* Stacked bar */}
                <div style={{ display: 'flex', height: '1.25rem', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  {segments.map((s, i) => (
                    <div key={i} style={{
                      width: `${(s.count / total) * 100}%`,
                      background: s.color, minWidth: s.count > 0 ? 4 : 0,
                      transition: 'width 0.3s ease',
                    }} />
                  ))}
                </div>
                {/* Legend */}
                {segments.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s.count} ({Math.round(s.count / total * 100)}%)
                    </span>
                  </div>
                ))}
              </>
            )
          })()}
        </div>

        {/* Onboarding Times + API Usage */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase',
            letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Onboarding & System
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Onboarding times */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                background: 'var(--hover-bg)', textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {stats.onboardingTimes?.avgToFirstCheck != null ? `${stats.onboardingTimes.avgToFirstCheck}d` : '\u2014'}
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                  Avg to first check
                </div>
              </div>
              <div style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                background: 'var(--hover-bg)', textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {stats.onboardingTimes?.avgToAnalyzer != null ? `${stats.onboardingTimes.avgToAnalyzer}d` : '\u2014'}
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                  Avg to first analyzer
                </div>
              </div>
            </div>
            {/* API Usage */}
            <div style={{
              display: 'flex', gap: '1rem',
            }}>
              <div style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                background: 'var(--hover-bg)', textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                  <Cpu size={12} style={{ color: '#3B82F6' }} />
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}>
                    {stats.apiUsageToday}
                  </span>
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                  API calls today
                </div>
              </div>
              <div style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                background: 'var(--hover-bg)', textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {stats.apiUsageThisWeek}
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                  API calls this week
                </div>
              </div>
            </div>
            {/* Avg Analyzer Score */}
            {stats.avgAnalyzerScore != null && (
              <div style={{
                padding: '0.75rem', borderRadius: '0.5rem',
                background: 'var(--hover-bg)', textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
                  color: stats.avgAnalyzerScore >= 60 ? '#10B981' : stats.avgAnalyzerScore >= 40 ? '#F59E0B' : '#EF4444',
                }}>
                  {stats.avgAnalyzerScore}
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                  Avg analyzer score
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Waitlist + Feedback Summaries ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem',
      }}>
        {/* Recent Waitlist */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader
            icon={Mail}
            title="Latest Waitlist"
            color="#FF6B35"
            count={`${stats.waitlistTotal} total`}
            extra={waitlistWeeklyTrend > 0 ? (
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#10B981' }}>
                +{waitlistWeeklyTrend} this week
              </span>
            ) : null}
          />
          <div style={{ maxHeight: '14rem', overflowY: 'auto' }}>
            {(stats.waitlistEntries || []).slice(0, 8).map(entry => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
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
          <SectionHeader
            icon={MessageSquare}
            title="Latest Feedback"
            extra={stats.feedbackNew > 0 ? (
              <span style={{
                fontSize: '0.625rem', fontWeight: 700,
                padding: '0.125rem 0.5rem', borderRadius: 99,
                background: 'rgba(245,158,11,0.15)', color: '#F59E0B',
              }}>
                {stats.feedbackNew} new
              </span>
            ) : null}
          />
          <div style={{ maxHeight: '14rem', overflowY: 'auto' }}>
            {(stats.feedbackEntries || []).slice(0, 8).map(fb => {
              const RATING_ICONS = { love: { Icon: Heart, color: '#EF4444' }, good: { Icon: ThumbsUp, color: '#10B981' }, okay: { Icon: Minus, color: '#F59E0B' }, frustrated: { Icon: ThumbsDown, color: '#EF4444' } }
              const CATEGORY_COLORS = { bug: '#EF4444', feature: '#8B5CF6', general: '#3B82F6' }
              const CATEGORY_LABELS = { bug: 'Bug', feature: 'Feature', general: 'General' }
              const STATUS_COLORS = { new: '#F59E0B', reviewed: '#3B82F6', resolved: '#10B981' }
              const fbStatus = fb.status || 'new'
              return (
                <div key={fb.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                }}>
                  <span style={{ flexShrink: 0, display: 'flex' }}>
                    {(() => { const r = RATING_ICONS[fb.rating]; return r ? <r.Icon size={16} style={{ color: r.color }} /> : <Minus size={16} style={{ color: 'var(--text-tertiary)' }} /> })()}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.125rem' }}>
                      {fb.category && (
                        <span style={{
                          fontSize: '0.5625rem', fontWeight: 700,
                          padding: '0.0625rem 0.3125rem', borderRadius: 99,
                          background: `${CATEGORY_COLORS[fb.category] || '#6B7280'}15`,
                          color: CATEGORY_COLORS[fb.category] || '#6B7280',
                        }}>
                          {CATEGORY_LABELS[fb.category] || fb.category}
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.8125rem', color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {fb.message || 'No message'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                      {fb.displayName || fb.userEmail || 'Anonymous'} \u00B7 {timeAgo(fb.createdAt)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                    padding: '0.125rem 0.375rem', borderRadius: 99,
                    background: `${STATUS_COLORS[fbStatus] || '#6B7280'}15`,
                    color: STATUS_COLORS[fbStatus] || '#6B7280', flexShrink: 0,
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

      {/* ── All Projects Table (with health column) ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <SectionHeader
          icon={FolderKanban}
          title="All Projects"
          count={`${stats.totalProjects} total`}
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Project', 'Owner', 'Progress', 'Health', 'Members', 'Updated'].map(h => (
                  <th scope="col" key={h} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)',
                    textAlign: 'left', padding: '0.625rem 1.25rem',
                    borderBottom: '0.0625rem solid var(--border-subtle)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats.projectHealth || stats.projects || [])
                .sort((a, b) => {
                  const at = a.updatedAt ? new Date(a.updatedAt.toDate ? a.updatedAt.toDate() : a.updatedAt).getTime() : 0
                  const bt = b.updatedAt ? new Date(b.updatedAt.toDate ? b.updatedAt.toDate() : b.updatedAt).getTime() : 0
                  return bt - at
                })
                .slice(0, 20)
                .map(project => {
                  const progress = project.progress != null
                    ? project.progress
                    : (() => {
                      const checked = project.checked || {}
                      const total = Object.keys(checked).length
                      const done = Object.values(checked).filter(Boolean).length
                      return total > 0 ? Math.round((done / total) * 100) : 0
                    })()
                  const members = project.memberCount || project.members?.length || project.memberIds?.length || 1

                  return (
                    <tr key={project.id} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                          {project.name || 'Untitled'}
                        </div>
                        <div style={{
                          fontSize: '0.6875rem', color: 'var(--text-disabled)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '15rem',
                        }}>
                          {project.url || 'No URL'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {project._ownerName || 'Unknown'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            flex: 1, height: '0.375rem', borderRadius: '0.1875rem',
                            background: 'var(--hover-bg)', overflow: 'hidden', maxWidth: '6rem',
                          }}>
                            <div style={{
                              width: `${progress}%`, height: '100%', borderRadius: '0.1875rem',
                              background: progress >= 75 ? '#10B981' : progress >= 40 ? '#F59E0B' : progress > 0 ? '#3B82F6' : 'transparent',
                            }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', minWidth: '2.5rem' }}>
                            {progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <ProjectBadge badge={project.healthBadge || 'active'} />
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                        {members}
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
                        {timeAgo(project.updatedAt)}
                      </td>
                    </tr>
                  )
                })
              }
              {(stats.projectHealth || stats.projects || []).length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {(stats.projectHealth || stats.projects || []).length > 20 && (
          <div style={{
            padding: '0.75rem 1.25rem', textAlign: 'center',
            fontSize: '0.75rem', color: 'var(--text-disabled)',
            borderTop: '0.0625rem solid var(--border-subtle)',
          }}>
            Showing 20 of {(stats.projectHealth || stats.projects || []).length} projects
          </div>
        )}
      </div>

      {/* Nudge Email Dialog */}
      <NudgeEmailDialog
        isOpen={!!nudgeUser}
        onClose={() => setNudgeUser(null)}
        targetUser={nudgeUser}
        adminUser={user}
      />
    </div>
  )
}
