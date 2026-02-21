import { useState, useMemo } from 'react'
import {
  UserX, TrendingDown, AlertTriangle, SearchCheck, RefreshCw,
  ArrowRight, Users, FolderKanban, ChevronDown, ChevronUp,
  Eye, Mail,
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

/* ── Retention Cell Color ── */
function retentionColor(rate) {
  if (rate >= 80) return { bg: 'rgba(16,185,129,0.2)', color: '#10B981' }
  if (rate >= 60) return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' }
  if (rate >= 40) return { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' }
  if (rate >= 20) return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' }
  return { bg: 'rgba(239,68,68,0.06)', color: '#EF4444' }
}

/* ── Status Dot ── */
function StatusDot({ status }) {
  const colors = {
    active: '#10B981',
    'at-risk': '#F59E0B',
    dormant: '#F97316',
    churned: '#EF4444',
  }
  return (
    <span style={{
      display: 'inline-block', width: '0.5rem', height: '0.5rem',
      borderRadius: '50%', background: colors[status] || '#6B7280',
      flexShrink: 0,
    }} />
  )
}

/* ── Funnel Step ── */
function FunnelStep({ label, count, total, prevCount, isFirst, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const dropOff = !isFirst && prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: '8rem', textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          height: '1.75rem', borderRadius: '0.375rem',
          background: 'var(--hover-bg)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: '0.375rem',
            background: color || '#3B82F6', opacity: 0.7,
            transition: 'width 0.5s ease',
            minWidth: count > 0 ? '2rem' : 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
              color: 'white', textShadow: '0 0.0625rem 0.125rem rgba(0,0,0,0.3)',
            }}>
              {count}
            </span>
          </div>
        </div>
      </div>
      <div style={{ width: '4rem', textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pct}%</div>
        {!isFirst && dropOff > 0 && (
          <div style={{ fontSize: '0.5625rem', color: '#EF4444', fontWeight: 600 }}>-{dropOff}%</div>
        )}
      </div>
    </div>
  )
}

/* ── Churn Trend Mini Chart ── */
function ChurnTrendChart({ data }) {
  if (!data || data.length === 0) return null
  const maxVal = Math.max(...data.map(d => Math.max(d.new, d.churned)), 1)
  const barW = Math.floor(100 / data.length)

  // Show only last 14 days for readability
  const chartData = data.slice(-14)

  return (
    <div>
      <svg width="100%" height={100} viewBox={`0 0 ${chartData.length * barW} 100`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {chartData.map((d, i) => {
          const newH = (d.new / maxVal) * 70
          const churnH = (d.churned / maxVal) * 70
          return (
            <g key={i}>
              {/* New users bar (green) */}
              <rect
                x={i * barW + 1}
                y={80 - newH}
                width={barW / 2 - 1}
                height={Math.max(newH, 1)}
                rx={1.5}
                fill={d.new > 0 ? '#10B981' : '#10B98120'}
                opacity={0.7}
              />
              {/* Churned users bar (red) */}
              <rect
                x={i * barW + barW / 2}
                y={80 - churnH}
                width={barW / 2 - 1}
                height={Math.max(churnH, 1)}
                rx={1.5}
                fill={d.churned > 0 ? '#EF4444' : '#EF444420'}
                opacity={0.7}
              />
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
          {chartData[0]?.date}
        </span>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.5625rem', color: '#10B981', fontWeight: 600 }}>New</span>
          <span style={{ fontSize: '0.5625rem', color: '#EF4444', fontWeight: 600 }}>Churned</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
          {chartData[chartData.length - 1]?.date}
        </span>
      </div>
    </div>
  )
}

/* ── Main ── */
export default function AdminChurn({ user }) {
  const { stats, loading, error, refresh } = useAdminStats(user)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('daysSinceLogin')
  const [sortDir, setSortDir] = useState('desc')
  const [refreshing, setRefreshing] = useState(false)
  const [riskFilter, setRiskFilter] = useState('all')
  const [nudgeUser, setNudgeUser] = useState(null)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  // Churn risk list (sorted by inverse health score)
  const riskList = useMemo(() => {
    if (!stats?.userHealth) return []
    let list = stats.userHealth.filter(u => u.status !== 'active')
    if (riskFilter !== 'all') {
      list = list.filter(u => u.status === riskFilter)
    }
    const q = search.toLowerCase().trim()
    if (q) {
      list = list.filter(u =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      if (sortKey === 'name') {
        const av = (a.displayName || '').toLowerCase()
        const bv = (b.displayName || '').toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      if (sortKey === 'healthScore') {
        return sortDir === 'asc' ? a.healthScore - b.healthScore : b.healthScore - a.healthScore
      }
      if (sortKey === 'daysSinceLogin') {
        return sortDir === 'asc' ? a.daysSinceLogin - b.daysSinceLogin : b.daysSinceLogin - a.daysSinceLogin
      }
      if (sortKey === 'completionRate') {
        return sortDir === 'asc' ? a.completionRate - b.completionRate : b.completionRate - a.completionRate
      }
      return 0
    })
  }, [stats, search, sortKey, sortDir, riskFilter])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  // Compute summary numbers
  const totalUsers = stats?.totalUsers || 0
  const churnedCount = stats?.churnedUsers?.length || 0
  const atRiskCount = stats?.atRiskUsers?.length || 0
  const dormantCount = stats?.dormantUsers?.length || 0
  const activeCount = stats?.activeUsers?.length || 0
  const churnRate = totalUsers > 0 ? Math.round((churnedCount / totalUsers) * 100) : 0

  // Net growth from churn trend
  const netGrowth30d = useMemo(() => {
    if (!stats?.churnTrend) return 0
    return stats.churnTrend.reduce((sum, d) => sum + d.net, 0)
  }, [stats?.churnTrend])

  if (loading && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--color-phase-1)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading churn data...</p>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>
        <button onClick={handleRefresh} className="btn-primary">Retry</button>
      </div>
    )
  }

  const funnel = stats?.churnFunnel || {}
  const dropOff = stats?.dropOff || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Churn & Retention
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            Track user retention, identify churn risks, and analyze drop-off points
          </p>
        </div>
        <button onClick={handleRefresh} className="icon-btn" title="Refresh" disabled={refreshing} style={{ opacity: refreshing ? 0.5 : 1 }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Overview KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Churn Rate', value: `${churnRate}%`, sub: '30-day', color: '#EF4444', icon: TrendingDown },
          { label: 'Churned', value: churnedCount, sub: '30+ days inactive', color: '#EF4444', icon: UserX },
          { label: 'At Risk', value: atRiskCount, sub: '7-14 days', color: '#F59E0B', icon: AlertTriangle },
          { label: 'Dormant', value: dormantCount, sub: '14-30 days', color: '#F97316', icon: Eye },
          { label: 'Active', value: activeCount, sub: 'Last 7 days', color: '#10B981', icon: Users },
          { label: 'Net Growth (30d)', value: netGrowth30d >= 0 ? `+${netGrowth30d}` : netGrowth30d, sub: 'new - churned', color: netGrowth30d >= 0 ? '#10B981' : '#EF4444', icon: TrendingDown },
        ].map(item => (
          <div key={item.label} style={{
            padding: '1rem', borderRadius: '0.75rem',
            background: `${item.color}08`, border: `0.0625rem solid ${item.color}15`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <item.icon size={14} style={{ color: item.color }} />
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-disabled)', letterSpacing: '0.04rem' }}>{item.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Churn Trend Chart */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
          marginBottom: '1rem',
        }}>
          New vs Churned Users (14d)
        </div>
        <ChurnTrendChart data={stats?.churnTrend} />
      </div>

      {/* Two column: Funnel + Drop-off */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* User Journey Funnel */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
            marginBottom: '1rem',
          }}>
            User Journey Funnel
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Signed Up', count: funnel.signedUp, color: '#3B82F6' },
              { label: 'Created Project', count: funnel.createdProject, color: '#8B5CF6' },
              { label: 'Started Checklist', count: funnel.startedChecklist, color: '#06B6D4' },
              { label: '25% Complete', count: funnel.completed25pct, color: '#10B981' },
              { label: 'Used Analyzer', count: funnel.usedAnalyzer, color: '#F59E0B' },
              { label: '50% Complete', count: funnel.completed50pct, color: '#FF6B35' },
              { label: 'Advanced Features', count: funnel.usedAdvancedFeature, color: '#EC4899' },
              { label: '75% Complete', count: funnel.completed75pct, color: '#10B981' },
              { label: 'Retained 7d', count: funnel.retained7d, color: '#3B82F6' },
              { label: 'Retained 30d', count: funnel.retained30d, color: '#10B981' },
            ].map((step, i, arr) => (
              <FunnelStep
                key={step.label}
                label={step.label}
                count={step.count || 0}
                total={funnel.signedUp || 1}
                prevCount={i > 0 ? (arr[i - 1].count || 0) : 0}
                isFirst={i === 0}
                color={step.color}
              />
            ))}
          </div>
        </div>

        {/* Drop-Off Analysis */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
            marginBottom: '1rem',
          }}>
            Where Users Quit
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Never created project', count: dropOff.neverCreatedProject || 0, color: '#6B7280' },
              { label: 'Created but never checked', count: dropOff.createdButNeverChecked || 0, color: '#9CA3AF' },
              { label: 'Stuck in Phase 1 (0-15%)', count: dropOff.stuckPhase1 || 0, color: '#EF4444' },
              { label: 'Stuck in Phase 2 (15-25%)', count: dropOff.stuckPhase2 || 0, color: '#F97316' },
              { label: 'Stuck in Phase 3-4 (25-50%)', count: dropOff.stuckPhase3 || 0, color: '#F59E0B' },
              { label: 'Stuck late (50-75%)', count: dropOff.stuckLate || 0, color: '#3B82F6' },
              { label: 'Completed 75%+ but left', count: dropOff.completedButLeft || 0, color: '#8B5CF6' },
            ].map(item => {
              const maxCount = Math.max(
                dropOff.neverCreatedProject || 0,
                dropOff.createdButNeverChecked || 0,
                dropOff.stuckPhase1 || 0,
                dropOff.stuckPhase2 || 0,
                dropOff.stuckPhase3 || 0,
                dropOff.stuckLate || 0,
                dropOff.completedButLeft || 0,
                1
              )
              const pct = Math.round((item.count / maxCount) * 100)
              return (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '10rem', fontSize: '0.6875rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                    {item.label}
                  </div>
                  <div style={{ flex: 1, height: '1rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: '0.25rem', background: item.color, opacity: 0.7, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', width: '2rem', textAlign: 'right', flexShrink: 0 }}>
                    {item.count}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)', fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
            Shows inactive/churned users only. Active users progressing through these stages are excluded.
          </div>
        </div>
      </div>

      {/* Retention Cohorts Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
          marginBottom: '1rem',
        }}>
          Weekly Retention Cohorts
        </div>
        {stats?.retentionCohorts?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.04rem', color: 'var(--text-disabled)',
                    textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                  }}>
                    Cohort
                  </th>
                  <th style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.04rem', color: 'var(--text-disabled)',
                    textAlign: 'center', padding: '0.5rem 0.75rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                  }}>
                    Size
                  </th>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                    <th key={w} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.04rem', color: 'var(--text-disabled)',
                      textAlign: 'center', padding: '0.5rem 0.5rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                    }}>
                      W{w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.retentionCohorts.map((cohort, ci) => (
                  <tr key={ci} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {cohort.weekLabel}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {cohort.cohortSize}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => {
                      const weekData = cohort.retention.find(r => r.week === w)
                      if (!weekData) {
                        return <td key={w} style={{ padding: '0.375rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>--</span>
                        </td>
                      }
                      const rc = retentionColor(weekData.rate)
                      return (
                        <td key={w} style={{ padding: '0.25rem' }}>
                          <div style={{
                            padding: '0.25rem 0.375rem', borderRadius: '0.25rem',
                            background: rc.bg, textAlign: 'center',
                            fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                            color: rc.color,
                          }}>
                            {weekData.rate}%
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-disabled)', fontSize: '0.8125rem', textAlign: 'center', padding: '1rem' }}>
            Not enough data for retention cohorts yet
          </p>
        )}
      </div>

      {/* Churn Risk List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
            marginBottom: '0.75rem',
          }}>
            Churn Risk List
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {[
              { key: 'all', label: 'All at risk', count: (atRiskCount + dormantCount + churnedCount), color: 'var(--text-primary)' },
              { key: 'at-risk', label: 'At Risk', count: atRiskCount, color: '#F59E0B' },
              { key: 'dormant', label: 'Dormant', count: dormantCount, color: '#F97316' },
              { key: 'churned', label: 'Churned', count: churnedCount, color: '#EF4444' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setRiskFilter(p.key)}
                style={{
                  padding: '0.25rem 0.5rem', borderRadius: '1rem', border: 'none',
                  fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
                  background: riskFilter === p.key ? `${p.color}18` : 'var(--hover-bg)',
                  color: riskFilter === p.key ? p.color : 'var(--text-disabled)',
                }}
              >
                {p.label} ({p.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'var(--hover-bg)' }}>
            <SearchCheck size={14} style={{ color: 'var(--text-disabled)' }} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  { key: 'name', label: 'User' },
                  { key: 'daysSinceLogin', label: 'Last Login' },
                  { key: 'healthScore', label: 'Health' },
                  { key: 'completionRate', label: 'Completion' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06rem',
                      color: sortKey === col.key ? 'var(--text-primary)' : 'var(--text-disabled)',
                      textAlign: 'left', padding: '0.5rem 1rem',
                      borderBottom: '0.0625rem solid var(--border-subtle)', cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={10} style={{ display: 'inline', verticalAlign: '-0.0625rem', marginLeft: '0.25rem' }} /> : <ChevronDown size={10} style={{ display: 'inline', verticalAlign: '-0.0625rem', marginLeft: '0.25rem' }} />)}
                  </th>
                ))}
                <th style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)',
                  textAlign: 'left', padding: '0.5rem 1rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                }}>
                  Projects
                </th>
                <th style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)',
                  textAlign: 'left', padding: '0.5rem 0.5rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {riskList.map(u => (
                <tr key={u.id} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.625rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusDot status={u.status} />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {u.displayName || 'Anonymous'}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                          {u.email || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.625rem 1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: u.daysSinceLogin > 30 ? '#EF4444' : u.daysSinceLogin > 14 ? '#F59E0B' : 'var(--text-secondary)', fontWeight: 600 }}>
                      {u.daysSinceLogin}d ago
                    </div>
                    <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
                      {u.lastActivityType || 'No activity'}
                    </div>
                  </td>
                  <td style={{ padding: '0.625rem 1rem' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.125rem 0.5rem', borderRadius: '1rem',
                      fontSize: '0.6875rem', fontWeight: 700,
                      color: u.healthScore >= 50 ? '#10B981' : u.healthScore >= 25 ? '#F59E0B' : '#EF4444',
                      background: u.healthScore >= 50 ? 'rgba(16,185,129,0.08)' : u.healthScore >= 25 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                    }}>
                      {u.healthScore}
                    </div>
                  </td>
                  <td style={{ padding: '0.625rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '3rem', height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
                        <div style={{ width: `${u.completionRate}%`, height: '100%', borderRadius: '0.1875rem', background: u.completionRate >= 50 ? '#10B981' : u.completionRate > 0 ? '#3B82F6' : 'transparent' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{u.completionRate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.625rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {u.projectCount}
                  </td>
                  <td style={{ padding: '0.625rem 0.5rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setNudgeUser(u) }}
                      title="Send nudge email"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                        border: '0.0625rem solid var(--border-subtle)', background: 'none',
                        cursor: 'pointer', color: 'var(--text-tertiary)',
                        fontSize: '0.625rem', fontWeight: 500, transition: 'all 100ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#F59E0B' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
                    >
                      <Mail size={10} /> Nudge
                    </button>
                  </td>
                </tr>
              ))}
              {riskList.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
                  {search ? 'No matching users' : 'No at-risk users found'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
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
