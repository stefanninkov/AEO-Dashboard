/**
 * ActivityInsightsPanel — Team activity intelligence dashboard.
 *
 * Transforms raw activityLog into:
 *  1. GitHub-style contribution heatmap (12 weeks)
 *  2. Activity-by-type donut chart
 *  3. Per-member contribution stats
 *  4. 30-day velocity sparkline
 */
import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
} from 'recharts'
import {
  Users, CheckCircle2, Search, FileText, MessageSquare,
  UserPlus, Shield, Zap,
} from 'lucide-react'

const TYPE_GROUPS = {
  tasks: ['check', 'uncheck', 'task_assign', 'task_unassign'],
  analysis: ['analyze', 'generatePageFix'],
  content: ['contentWrite', 'schemaGenerate', 'export'],
  social: ['comment', 'member_add', 'member_remove', 'role_change'],
  competitors: ['competitor_add', 'competitor_remove'],
}

const TYPE_GROUP_META = {
  tasks: { color: 'var(--color-phase-4)', icon: CheckCircle2 },
  analysis: { color: 'var(--color-phase-1)', icon: Search },
  content: { color: 'var(--color-phase-3)', icon: FileText },
  social: { color: 'var(--color-phase-2)', icon: MessageSquare },
  competitors: { color: 'var(--color-phase-5)', icon: Shield },
}

const HEATMAP_WEEKS = 12
const VELOCITY_DAYS = 30

function getWeekday(date) {
  const d = date.getDay()
  return d === 0 ? 6 : d - 1 // Mon=0 ... Sun=6
}

function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getHeatmapData(activities) {
  const counts = {}
  activities.forEach(a => {
    const d = new Date(a.timestamp)
    const k = dayKey(d)
    counts[k] = (counts[k] || 0) + 1
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayDay = getWeekday(today)
  const totalDays = (HEATMAP_WEEKS - 1) * 7 + todayDay + 1
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - totalDays + 1)

  const cells = []
  let maxCount = 0
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const k = dayKey(d)
    const count = counts[k] || 0
    if (count > maxCount) maxCount = count
    cells.push({ date: k, count, weekday: getWeekday(d), week: Math.floor(i / 7) })
  }
  return { cells, maxCount }
}

function heatColor(count, maxCount) {
  if (count === 0) return 'var(--hover-bg)'
  const intensity = Math.min(count / Math.max(maxCount, 1), 1)
  if (intensity < 0.25) return 'rgba(16, 185, 129, 0.2)'
  if (intensity < 0.5) return 'rgba(16, 185, 129, 0.4)'
  if (intensity < 0.75) return 'rgba(16, 185, 129, 0.65)'
  return 'rgba(16, 185, 129, 0.9)'
}

function getTypeBreakdown(activities) {
  const result = []
  for (const [group, types] of Object.entries(TYPE_GROUPS)) {
    const count = activities.filter(a => types.includes(a.type)).length
    if (count > 0) {
      const meta = TYPE_GROUP_META[group]
      result.push({ name: group, value: count, color: meta.color })
    }
  }
  return result
}

function getMemberStats(activities) {
  const members = {}
  activities.forEach(a => {
    if (!a.authorUid) return
    if (!members[a.authorUid]) {
      members[a.authorUid] = { name: a.authorName || 'Unknown', count: 0, lastActive: a.timestamp }
    }
    members[a.authorUid].count++
    if (a.timestamp > members[a.authorUid].lastActive) {
      members[a.authorUid].lastActive = a.timestamp
    }
  })
  return Object.values(members).sort((a, b) => b.count - a.count).slice(0, 5)
}

function getVelocityData(activities) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const data = []
  for (let i = VELOCITY_DAYS - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const k = dayKey(d)
    const count = activities.filter(a => {
      const ad = new Date(a.timestamp)
      return dayKey(ad) === k
    }).length
    data.push({
      day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count,
    })
  }
  return data
}

function relativeTime(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(diff / 3600000)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(diff / 86400000)
  if (day < 7) return `${day}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
      fontSize: 'var(--text-xs)', boxShadow: 'var(--shadow-md)',
    }}>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{payload[0].payload.day}</span>
      <span style={{ color: 'var(--text-tertiary)', marginLeft: 'var(--space-2)' }}>{payload[0].value} actions</span>
    </div>
  )
}

const sectionLabel = {
  fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
  marginBottom: 'var(--space-3)',
}

export default function ActivityInsightsPanel({ activities = [], t: tOverride }) {
  const heatmap = useMemo(() => getHeatmapData(activities), [activities])
  const typeBreakdown = useMemo(() => getTypeBreakdown(activities), [activities])
  const memberStats = useMemo(() => getMemberStats(activities), [activities])
  const velocity = useMemo(() => getVelocityData(activities), [activities])

  const totalThisWeek = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    return activities.filter(a => new Date(a.timestamp) >= weekAgo).length
  }, [activities])

  if (activities.length === 0) return null

  return (
    <div className="card card-lg">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={sectionLabel}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Users size={13} />
            {'Team Activity'}
          </span>
        </div>
        <div style={{
          fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        }}>
          <Zap size={11} style={{ color: 'var(--color-phase-4)' }} />
          {totalThisWeek} {'this week'}
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', marginBottom: 'var(--space-2)' }}>
          {'Last 12 weeks'}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${HEATMAP_WEEKS}, 1fr)`,
          gridTemplateRows: 'repeat(7, 1fr)',
          gap: '0.1875rem',
          gridAutoFlow: 'column',
        }}>
          {heatmap.cells.map((cell, i) => (
            <div
              key={i}
              title={`${cell.date}: ${cell.count} actions`}
              style={{
                width: '100%', aspectRatio: '1',
                borderRadius: '0.125rem',
                background: heatColor(cell.count, heatmap.maxCount),
                minWidth: '0.5rem',
              }}
            />
          ))}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          marginTop: 'var(--space-2)', justifyContent: 'flex-end',
        }}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>{'Less'}</span>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
            <div key={i} style={{
              width: '0.625rem', height: '0.625rem', borderRadius: '0.125rem',
              background: intensity === 0 ? 'var(--hover-bg)' :
                `rgba(16, 185, 129, ${intensity < 0.5 ? intensity * 1.6 : intensity < 0.75 ? 0.65 : 0.9})`,
            }} />
          ))}
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>{'More'}</span>
        </div>
      </div>

      {/* ── Type breakdown + Member stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        {/* Activity by type */}
        <div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', marginBottom: 'var(--space-2)' }}>
            {'Activity by type'}
          </div>
          {typeBreakdown.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '5rem', height: '5rem', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius="55%" outerRadius="95%" strokeWidth={0}>
                      {typeBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {typeBreakdown.map(item => {
                  const meta = TYPE_GROUP_META[item.name]
                  const Icon = meta?.icon || CheckCircle2
                  return (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-2xs)' }}>
                      <Icon size={10} style={{ color: item.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {item.name}
                      </span>
                      <span style={{ color: 'var(--text-disabled)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{item.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>
              {'No activity data yet'}
            </div>
          )}
        </div>

        {/* Top contributors */}
        <div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', marginBottom: 'var(--space-2)' }}>
            {'Top contributors'}
          </div>
          {memberStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {memberStats.map((member, i) => {
                const pct = Math.round((member.count / activities.length) * 100)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{
                      width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-full)',
                      background: `var(--color-phase-${(i % 7) + 1})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'var(--text-2xs)', fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {(member.name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 'var(--text-2xs)', color: 'var(--text-primary)', fontWeight: 600,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {member.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                        <div style={{
                          flex: 1, height: '0.1875rem', borderRadius: '0.125rem',
                          background: 'var(--hover-bg)',
                        }}>
                          <div style={{
                            width: `${pct}%`, height: '100%', borderRadius: '0.125rem',
                            background: `var(--color-phase-${(i % 7) + 1})`,
                          }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                          {member.count}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>
              <UserPlus size={12} />
              {'Invite team members to see contributions'}
            </div>
          )}
        </div>
      </div>

      {/* ── Velocity sparkline ── */}
      <div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', marginBottom: 'var(--space-2)' }}>
          {'30-day velocity'}
        </div>
        <div style={{ height: '4rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocity} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-phase-4)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-phase-4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-phase-4)"
                strokeWidth={1.5}
                fill="url(#velocityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
