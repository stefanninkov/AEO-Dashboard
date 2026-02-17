import { useMemo } from 'react'
import { BarChart3, Users, FolderKanban, CheckSquare, Activity, TrendingUp } from 'lucide-react'
import { useAdminStats } from '../hooks/useAdminStats'

/* ── Helpers ── */
const parseDate = (d) => {
  if (!d) return null
  if (d.toDate) return d.toDate()
  if (typeof d === 'string') return new Date(d)
  return null
}

/* ── Simple bar component ── */
function BarItem({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0' }}>
      <div style={{ width: '7rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
        {label}
      </div>
      <div style={{ flex: 1, height: '1.25rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '0.25rem', background: color, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', width: '2.5rem', textAlign: 'right', flexShrink: 0 }}>
        {value}
      </div>
    </div>
  )
}

/* ── Stat box ── */
function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      padding: '1rem',
      borderRadius: '0.75rem',
      background: 'var(--hover-bg)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <Icon size={18} style={{ color, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>{label}</div>
      </div>
    </div>
  )
}

export default function AdminAnalytics({ user }) {
  const { stats, loading } = useAdminStats(user)

  const analytics = useMemo(() => {
    if (!stats) return null

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Activity type breakdown
    const typeCounts = {}
    for (const act of (stats.recentActivity || [])) {
      typeCounts[act.type] = (typeCounts[act.type] || 0) + 1
    }
    const topTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
    const maxTypeCount = topTypes.length > 0 ? topTypes[0][1] : 0

    // Projects by completion
    const completionBuckets = { '0%': 0, '1-25%': 0, '26-50%': 0, '51-75%': 0, '76-99%': 0, '100%': 0 }
    for (const p of (stats.projects || [])) {
      const checked = p.checked || {}
      const total = Object.keys(checked).length
      const done = Object.values(checked).filter(Boolean).length
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      if (pct === 0) completionBuckets['0%']++
      else if (pct <= 25) completionBuckets['1-25%']++
      else if (pct <= 50) completionBuckets['26-50%']++
      else if (pct <= 75) completionBuckets['51-75%']++
      else if (pct < 100) completionBuckets['76-99%']++
      else completionBuckets['100%']++
    }
    const maxBucket = Math.max(...Object.values(completionBuckets), 1)

    // Active users ratio
    const activeRatio = stats.totalUsers > 0 ? Math.round((stats.activeThisWeek / stats.totalUsers) * 100) : 0

    // Avg tasks per project
    const avgTasks = stats.totalProjects > 0 ? Math.round(stats.totalTasks / stats.totalProjects) : 0

    // Task completion rate
    const taskRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

    return { topTypes, maxTypeCount, completionBuckets, maxBucket, activeRatio, avgTasks, taskRate }
  }, [stats])

  if (loading && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading analytics...</p>
      </div>
    )
  }

  const ACTIVITY_LABELS = {
    check: 'Check task', uncheck: 'Uncheck task', note: 'Update notes',
    analyze: 'Run analyzer', contentWrite: 'Generate content', schemaGenerate: 'Generate schema',
    generateFix: 'Generate fix', monitor: 'Run monitor', task_assign: 'Assign task',
    comment_add: 'Add comment', member_add: 'Add member', export_pdf: 'Export PDF',
    competitor_add: 'Add competitor', competitor_analyze: 'Analyze competitors',
  }

  const BAR_COLORS = ['#FF6B35', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#EF4444']
  const BUCKET_COLORS = { '0%': '#6B7280', '1-25%': '#EF4444', '26-50%': '#F59E0B', '51-75%': '#3B82F6', '76-99%': '#10B981', '100%': '#8B5CF6' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Platform Analytics
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
          Usage patterns and platform health metrics
        </p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
        <StatBox icon={Users} label="Active Rate (7d)" value={`${analytics?.activeRatio || 0}%`} color="#3B82F6" />
        <StatBox icon={CheckSquare} label="Task Completion" value={`${analytics?.taskRate || 0}%`} color="#10B981" />
        <StatBox icon={FolderKanban} label="Avg Tasks/Project" value={analytics?.avgTasks || 0} color="#8B5CF6" />
        <StatBox icon={Activity} label="Recent Events" value={stats?.recentActivity?.length || 0} color="#FF6B35" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Activity type breakdown */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Top Activity Types
          </div>
          {analytics?.topTypes?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {analytics.topTypes.map(([type, count], i) => (
                <BarItem
                  key={type}
                  label={ACTIVITY_LABELS[type] || type}
                  value={count}
                  max={analytics.maxTypeCount}
                  color={BAR_COLORS[i % BAR_COLORS.length]}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>No activity data</p>
          )}
        </div>

        {/* Project completion distribution */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Project Completion Distribution
          </div>
          {stats?.totalProjects > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {Object.entries(analytics?.completionBuckets || {}).map(([bucket, count]) => (
                <BarItem
                  key={bucket}
                  label={bucket}
                  value={count}
                  max={analytics.maxBucket}
                  color={BUCKET_COLORS[bucket] || '#6B7280'}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>No project data</p>
          )}
        </div>
      </div>
    </div>
  )
}
