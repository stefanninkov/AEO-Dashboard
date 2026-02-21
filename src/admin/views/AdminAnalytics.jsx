import { useMemo } from 'react'
import {
  ChartColumnIncreasing, Users, FolderKanban, CheckSquare, Activity,
  TrendingUp, Mail, MessageSquare, UserPlus, Sparkles,
  Target, Clock, Layers, Heart, ThumbsUp, Minus, ThumbsDown,
} from 'lucide-react'
import { useAdminStats } from '../hooks/useAdminStats'

/* ── Helpers ── */
const parseDate = (d) => {
  if (!d) return null
  if (d.toDate) return d.toDate()
  if (typeof d === 'string') return new Date(d)
  return null
}

/* ── Simple bar component ── */
function BarItem({ label, value, max, color, suffix }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0' }}>
      <div style={{ width: '7rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ flex: 1, height: '1.25rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '0.25rem', background: color, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', width: '3rem', textAlign: 'right', flexShrink: 0 }}>
        {value}{suffix || ''}
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

/* ── Trend Chart ── */
function TrendChart({ data, color, title, height = 100 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.count), 1)
  const barW = Math.floor(100 / data.length)
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color,
          fontWeight: 700,
        }}>
          {total} total
        </div>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${data.length * barW} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {data.map((d, i) => {
          const barH = (d.count / max) * (height - 20)
          return (
            <g key={i}>
              <rect
                x={i * barW + 1}
                y={height - barH - 16}
                width={barW - 2}
                height={Math.max(barH, 2)}
                rx={2}
                fill={d.count > 0 ? color : `${color}20`}
                opacity={d.count > 0 ? 0.8 : 0.25}
              />
              {d.count > 0 && (
                <text
                  x={i * barW + barW / 2}
                  y={height - barH - 19}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
          {data[0]?.date}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
          {data[Math.floor(data.length / 2)]?.date}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
          {data[data.length - 1]?.date}
        </span>
      </div>
    </div>
  )
}

/* ── Growth Metric ── */
function GrowthMetric({ label, thisWeek, lastWeek, color }) {
  const change = thisWeek - lastWeek
  const pctChange = lastWeek > 0 ? Math.round((change / lastWeek) * 100) : thisWeek > 0 ? 100 : 0
  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <div style={{
      padding: '1rem',
      borderRadius: '0.75rem',
      background: 'var(--hover-bg)',
    }}>
      <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.05rem', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {thisWeek}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>this week</span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem',
        fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
        color: isNeutral ? 'var(--text-disabled)' : isPositive ? '#10B981' : '#EF4444',
      }}>
        {isPositive ? '+' : ''}{change} ({isPositive ? '+' : ''}{pctChange}%)
        <span style={{ color: 'var(--text-disabled)', fontWeight: 400, marginLeft: '0.25rem' }}>vs last week ({lastWeek})</span>
      </div>
    </div>
  )
}

/* ── Engagement Depth Stacked Bar ── */
function EngagementDepthChart({ data }) {
  if (!data) return null
  const total = data.signedUpOnly + data.light + data.medium + data.heavy
  if (total === 0) return null

  const segments = [
    { key: 'signedUpOnly', label: 'Signed Up Only', color: '#6B7280', count: data.signedUpOnly },
    { key: 'light', label: 'Light (1-10)', color: '#3B82F6', count: data.light },
    { key: 'medium', label: 'Medium (11-50)', color: '#F59E0B', count: data.medium },
    { key: 'heavy', label: 'Heavy (50+)', color: '#10B981', count: data.heavy },
  ]

  return (
    <div>
      {/* Stacked bar */}
      <div style={{ display: 'flex', height: '2rem', borderRadius: '0.375rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
        {segments.map(s => {
          const pct = (s.count / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={s.key}
              style={{
                width: `${pct}%`,
                background: s.color,
                opacity: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: pct > 5 ? 'auto' : 0,
              }}
              title={`${s.label}: ${s.count} (${Math.round(pct)}%)`}
            >
              {pct > 8 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700, color: 'white' }}>
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {segments.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{s.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-disabled)', fontWeight: 600 }}>({s.count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminAnalytics({ user }) {
  const { stats, loading } = useAdminStats(user)

  const analytics = useMemo(() => {
    if (!stats) return null

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

    // Week-over-week growth comparisons from trend data
    const calcWeekComparison = (trend) => {
      if (!trend || trend.length < 14) return { thisWeek: 0, lastWeek: 0 }
      const thisWeek = trend.slice(7).reduce((s, d) => s + d.count, 0)
      const lastWeek = trend.slice(0, 7).reduce((s, d) => s + d.count, 0)
      return { thisWeek, lastWeek }
    }

    const signupGrowth = calcWeekComparison(stats.signupTrend)
    const waitlistGrowth = calcWeekComparison(stats.waitlistTrend)
    const activityGrowth = calcWeekComparison(stats.activityTrend)

    // Waitlist conversion
    const waitlistConverted = (stats.waitlistEntries || []).filter(e => e.status === 'converted').length
    const waitlistActive = (stats.waitlistEntries || []).filter(e => !e.status || e.status === 'active').length
    const conversionRate = stats.waitlistTotal > 0 ? Math.round((waitlistConverted / stats.waitlistTotal) * 100) : 0

    // Feedback sentiment
    const sentimentCounts = { love: 0, good: 0, okay: 0, frustrated: 0 }
    for (const fb of (stats.feedbackEntries || [])) {
      if (fb.rating && sentimentCounts[fb.rating] !== undefined) {
        sentimentCounts[fb.rating]++
      }
    }
    const totalFeedbackWithRating = Object.values(sentimentCounts).reduce((s, v) => s + v, 0)
    const satisfactionRate = totalFeedbackWithRating > 0
      ? Math.round(((sentimentCounts.love + sentimentCounts.good) / totalFeedbackWithRating) * 100)
      : 0

    // Top active projects
    const projectActivityCounts = {}
    for (const act of (stats.recentActivity || [])) {
      if (act._projectName) {
        projectActivityCounts[act._projectName] = (projectActivityCounts[act._projectName] || 0) + 1
      }
    }
    const topProjects = Object.entries(projectActivityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
    const maxProjectActivity = topProjects.length > 0 ? topProjects[0][1] : 0

    // Feature adoption (from featureUsage)
    const featureAdoption = stats.featureUsage ? Object.entries(stats.featureUsage).map(([key, val]) => ({
      key,
      label: {
        analyzer: 'Analyzer', contentWriter: 'Content Writer', competitors: 'Competitors',
        metrics: 'Metrics', schema: 'Schema Generator', calendar: 'Content Calendar',
        export: 'PDF Export', team: 'Team Members',
      }[key] || key,
      ...val,
    })).sort((a, b) => b.pct - a.pct) : []

    return {
      topTypes, maxTypeCount, completionBuckets, maxBucket,
      activeRatio, avgTasks, taskRate,
      signupGrowth, waitlistGrowth, activityGrowth,
      waitlistConverted, waitlistActive, conversionRate,
      sentimentCounts, satisfactionRate,
      topProjects, maxProjectActivity,
      featureAdoption,
    }
  }, [stats])

  if (loading && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
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
  const SENTIMENT_ICONS = { love: Heart, good: ThumbsUp, okay: Minus, frustrated: ThumbsDown }
  const SENTIMENT_COLORS = { love: '#10B981', good: '#3B82F6', okay: '#F59E0B', frustrated: '#EF4444' }
  const FEATURE_COLORS = {
    analyzer: '#FF6B35', contentWriter: '#3B82F6', competitors: '#8B5CF6',
    metrics: '#10B981', schema: '#EC4899', calendar: '#F59E0B',
    export: '#06B6D4', team: '#EF4444',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Platform Analytics
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
          Usage patterns, growth metrics, feature adoption, and engagement depth
        </p>
      </div>

      {/* Key Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
        <StatBox icon={Users} label="Active Rate (7d)" value={`${analytics?.activeRatio || 0}%`} color="#3B82F6" />
        <StatBox icon={CheckSquare} label="Task Completion" value={`${analytics?.taskRate || 0}%`} color="#10B981" />
        <StatBox icon={FolderKanban} label="Avg Tasks/Project" value={analytics?.avgTasks || 0} color="#8B5CF6" />
        <StatBox icon={Activity} label="Recent Events" value={stats?.recentActivity?.length || 0} color="#FF6B35" />
        <StatBox icon={Mail} label="Waitlist Convert" value={`${analytics?.conversionRate || 0}%`} color="#0EA5E9" />
        <StatBox icon={MessageSquare} label="Satisfaction" value={`${analytics?.satisfactionRate || 0}%`} color="#EC4899" />
      </div>

      {/* NEW: Feature Adoption Chart */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
          marginBottom: '1rem',
        }}>
          <Target size={14} style={{ display: 'inline', verticalAlign: '-0.125rem', marginRight: '0.5rem' }} />
          Feature Adoption (% of projects)
        </div>
        {analytics?.featureAdoption?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {analytics.featureAdoption.map(f => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0' }}>
                <div style={{ width: '8rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                  {f.label}
                </div>
                <div style={{ flex: 1, height: '1.5rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${f.pct}%`, height: '100%', borderRadius: '0.25rem',
                    background: FEATURE_COLORS[f.key] || '#6B7280',
                    opacity: 0.7, transition: 'width 0.3s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: f.pct > 0 ? '2rem' : 0,
                  }}>
                    {f.pct > 10 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700, color: 'white' }}>
                        {f.pct}%
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', width: '4rem', textAlign: 'right', flexShrink: 0 }}>
                  {f.used}/{f.total}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>No project data</p>
        )}
      </div>

      {/* NEW: Engagement Depth */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
          marginBottom: '1rem',
        }}>
          <Layers size={14} style={{ display: 'inline', verticalAlign: '-0.125rem', marginRight: '0.5rem' }} />
          Engagement Depth
        </div>
        <EngagementDepthChart data={stats?.engagementDepth} />
      </div>

      {/* NEW: Onboarding Time Metrics */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
          marginBottom: '1rem',
        }}>
          <Clock size={14} style={{ display: 'inline', verticalAlign: '-0.125rem', marginRight: '0.5rem' }} />
          Time to Value
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'var(--hover-bg)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#3B82F6' }}>
              {stats?.onboardingTimes?.avgToFirstCheck != null ? `${stats.onboardingTimes.avgToFirstCheck}d` : '--'}
            </div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.04rem', marginTop: '0.25rem' }}>
              Avg days to first check
            </div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
              {stats?.onboardingTimes?.rawToFirstCheck?.length || 0} users tracked
            </div>
          </div>
          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'var(--hover-bg)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#FF6B35' }}>
              {stats?.onboardingTimes?.avgToAnalyzer != null ? `${stats.onboardingTimes.avgToAnalyzer}d` : '--'}
            </div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.04rem', marginTop: '0.25rem' }}>
              Avg days to first analyzer
            </div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
              {stats?.onboardingTimes?.rawToAnalyzer?.length || 0} users tracked
            </div>
          </div>
          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'var(--hover-bg)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
              {stats?.avgAnalyzerScore != null ? stats.avgAnalyzerScore : '--'}
            </div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.04rem', marginTop: '0.25rem' }}>
              Avg analyzer score
            </div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
              Across all projects
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Aggregate Intelligence */}
      {((stats?.topIndustries?.length > 0) || (stats?.topCms?.length > 0)) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {stats?.topIndustries?.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginBottom: '1rem',
              }}>
                Top Industries
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {stats.topIndustries.slice(0, 6).map(([industry, count], i) => (
                  <BarItem
                    key={industry}
                    label={industry}
                    value={count}
                    max={stats.topIndustries[0]?.[1] || 1}
                    color={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </div>
            </div>
          )}
          {stats?.topCms?.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginBottom: '1rem',
              }}>
                Top CMS Platforms
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {stats.topCms.slice(0, 6).map(([cms, count], i) => (
                  <BarItem
                    key={cms}
                    label={cms}
                    value={count}
                    max={stats.topCms[0]?.[1] || 1}
                    color={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Growth Metrics */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
          marginBottom: '1rem',
        }}>
          <TrendingUp size={14} style={{ display: 'inline', verticalAlign: '-0.125rem', marginRight: '0.5rem' }} />
          Week-over-Week Growth
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))', gap: '0.75rem' }}>
          <GrowthMetric
            label="User Signups"
            thisWeek={analytics?.signupGrowth?.thisWeek || 0}
            lastWeek={analytics?.signupGrowth?.lastWeek || 0}
            color="#3B82F6"
          />
          <GrowthMetric
            label="Waitlist Signups"
            thisWeek={analytics?.waitlistGrowth?.thisWeek || 0}
            lastWeek={analytics?.waitlistGrowth?.lastWeek || 0}
            color="#FF6B35"
          />
          <GrowthMetric
            label="User Activity"
            thisWeek={analytics?.activityGrowth?.thisWeek || 0}
            lastWeek={analytics?.activityGrowth?.lastWeek || 0}
            color="#10B981"
          />
        </div>
      </div>

      {/* Trend Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <TrendChart
          data={stats?.signupTrend}
          color="#3B82F6"
          title="User Signups (14d)"
          height={90}
        />
        <TrendChart
          data={stats?.waitlistTrend}
          color="#FF6B35"
          title="Waitlist Signups (14d)"
          height={90}
        />
      </div>

      <TrendChart
        data={stats?.activityTrend}
        color="#10B981"
        title="Daily Activity (14d)"
        height={90}
      />

      {/* Charts Grid */}
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

      {/* Bottom row: Sentiment + Top Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Feedback Sentiment */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Feedback Sentiment
          </div>
          {stats?.feedbackTotal > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(analytics?.sentimentCounts || {}).map(([key, count]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '1.5rem', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: SENTIMENT_COLORS[key] }}>{(() => { const SIcon = SENTIMENT_ICONS[key]; return SIcon ? <SIcon size={18} /> : null })()}</span>
                  <div style={{ flex: 1, height: '1.25rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${stats.feedbackTotal > 0 ? (count / stats.feedbackTotal) * 100 : 0}%`,
                      height: '100%',
                      borderRadius: '0.25rem',
                      background: SENTIMENT_COLORS[key],
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', width: '2rem', textAlign: 'right' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>No feedback data</p>
          )}
        </div>

        {/* Most Active Projects */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginBottom: '1rem',
          }}>
            Most Active Projects
          </div>
          {analytics?.topProjects?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {analytics.topProjects.map(([name, count], i) => (
                <BarItem
                  key={name}
                  label={name}
                  value={count}
                  max={analytics.maxProjectActivity}
                  color={BAR_COLORS[i % BAR_COLORS.length]}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>No project activity</p>
          )}
        </div>
      </div>

      {/* Waitlist Funnel */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginBottom: '1rem',
        }}>
          <UserPlus size={14} style={{ display: 'inline', verticalAlign: '-0.125rem', marginRight: '0.5rem' }} />
          Waitlist Funnel
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {[
            { label: 'Total Signups', value: stats?.waitlistTotal || 0, color: '#FF6B35' },
            { label: 'Active', value: analytics?.waitlistActive || 0, color: '#3B82F6' },
            { label: 'Converted', value: analytics?.waitlistConverted || 0, color: '#10B981' },
            { label: 'Conversion Rate', value: `${analytics?.conversionRate || 0}%`, color: '#8B5CF6' },
          ].map((item, i) => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <div style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                background: `${item.color}08`,
                border: `0.0625rem solid ${item.color}20`,
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: item.color,
                  marginBottom: '0.25rem',
                }}>
                  {item.value}
                </div>
                <div style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--text-disabled)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04rem',
                }}>
                  {item.label}
                </div>
              </div>
              {i < 3 && (
                <div style={{
                  position: 'absolute',
                  right: '-0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-disabled)',
                  fontSize: '0.75rem',
                }}>
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
