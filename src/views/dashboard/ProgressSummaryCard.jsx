import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Award, Star, Trophy, Crown, ArrowRight, BarChart3, ChevronRight } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { useChartColors } from '../../utils/chartColors'

const MILESTONE_META = [
  { pct: 25, icon: Award },
  { pct: 50, icon: Star },
  { pct: 75, icon: Trophy },
  { pct: 100, icon: Crown },
]

/* ── Tooltip ── */
function MiniTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
      borderRadius: '0.375rem', padding: '0.375rem 0.5rem', fontSize: '0.6875rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.125rem' }}>{label}</p>
      <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{payload[0].value} task{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function ProgressSummaryCard({ activeProject, phases, setActiveView }) {
  const { t } = useTranslation('app')
  const { phaseColors } = useChartColors()
  const checked = activeProject?.checked || {}

  const MILESTONES = useMemo(() => [
    { ...MILESTONE_META[0], label: t('dashboard.progressSummary.gettingStarted') },
    { ...MILESTONE_META[1], label: t('dashboard.progressSummary.halfwayThere') },
    { ...MILESTONE_META[2], label: t('dashboard.progressSummary.almostDone') },
    { ...MILESTONE_META[3], label: t('dashboard.progressSummary.aeoMaster') },
  ], [t])

  /* ── Completion stats ── */
  const { total, done, pct } = useMemo(() => {
    let t = 0, d = 0
    phases?.forEach(p => p.categories.forEach(c => c.items.forEach(item => {
      t++; if (checked[item.id]) d++
    })))
    return { total: t, done: d, pct: t > 0 ? Math.round((d / t) * 100) : 0 }
  }, [phases, checked])

  /* ── Which milestones are unlocked ── */
  const highestUnlocked = MILESTONES.filter(m => pct >= m.pct).length

  /* ── Quick wins — easiest unchecked items ── */
  const quickWins = useMemo(() => {
    const unchecked = []
    phases?.forEach(phase => {
      phase.categories.forEach(cat => {
        cat.items.forEach(item => {
          if (!checked[item.id]) {
            unchecked.push({
              id: item.id,
              text: item.text,
              phase: phase.number,
              phaseTitle: phase.title,
              color: phase.color,
              detailLen: (item.detail || '').length,
            })
          }
        })
      })
    })
    // Shorter detail = easier, lower phase = more foundational
    return unchecked
      .sort((a, b) => (a.detailLen + a.phase * 20) - (b.detailLen + b.phase * 20))
      .slice(0, 5)
  }, [phases, checked])

  /* ── Completion timeline — tasks per day over last 14 days ── */
  const timeline = useMemo(() => {
    const log = activeProject?.activityLog || []
    const checks = log.filter(a => a.type === 'check')
    const now = Date.now()
    const days = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
      days[key] = 0
    }
    checks.forEach(c => {
      const key = new Date(c.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      if (days[key] !== undefined) days[key]++
    })
    return Object.entries(days).map(([day, count]) => ({ day, Tasks: count }))
  }, [activeProject?.activityLog])

  const hasTimelineData = timeline.some(d => d.Tasks > 0)

  const goToChecklist = useCallback(() => {
    setActiveView('checklist')
  }, [setActiveView])

  return (
    <div className="card fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>

      {/* ── Section 1: Milestones ── */}
      <div style={{ padding: '1.25rem 1.25rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Award size={14} style={{ color: phaseColors[1] }} />
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
          }}>
            {t('dashboard.progressSummary.milestones')}
          </h3>
          <span style={{
            marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--text-primary)', fontFamily: 'var(--font-heading)',
          }}>
            {t('dashboard.progressSummary.tasksProgress', { done, total })}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
          {MILESTONES.map((m, i) => {
            const Icon = m.icon
            const unlocked = i < highestUnlocked
            const isLatest = i === highestUnlocked - 1
            const colors = [phaseColors[1], phaseColors[2], phaseColors[3], 'var(--color-success)']
            const color = colors[i]
            return (
              <div
                key={m.pct}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
                  flex: 1, opacity: unlocked ? 1 : 0.3,
                  ...(isLatest ? { animation: 'pulse-subtle 2s ease-in-out infinite' } : {}),
                }}
              >
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: unlocked ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--hover-bg)',
                  border: `0.0938rem solid ${unlocked ? color : 'var(--border-subtle)'}`,
                  transition: 'all 300ms',
                }}>
                  <Icon size={16} style={{ color: unlocked ? color : 'var(--text-disabled)' }} />
                </div>
                <span style={{
                  fontSize: '0.5625rem', fontWeight: 600, color: unlocked ? 'var(--text-secondary)' : 'var(--text-disabled)',
                  textAlign: 'center', fontFamily: 'var(--font-heading)', letterSpacing: '0.0156rem',
                }}>
                  {m.pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '0.0625rem', background: 'var(--border-subtle)' }} />

      {/* ── Section 2: Quick Wins ── */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Star size={14} style={{ color: phaseColors[5] }} />
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
          }}>
            {t('dashboard.progressSummary.quickWins')}
          </h3>
        </div>

        {quickWins.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {quickWins.map(item => (
              <button
                key={item.id}
                onClick={goToChecklist}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.4375rem 0.5rem', borderRadius: '0.375rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'var(--font-body)', width: '100%',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{
                  fontSize: '0.5625rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
                  color: item.color, minWidth: '1.25rem', textAlign: 'center',
                  padding: '0.125rem 0.25rem', borderRadius: '0.1875rem',
                  background: item.color + '15',
                }}>
                  P{item.phase}
                </span>
                <span style={{
                  flex: 1, fontSize: '0.75rem', color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.text}
                </span>
                <ChevronRight size={10} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '0.5rem 0' }}>
            {t('dashboard.progressSummary.allComplete')}
          </p>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '0.0625rem', background: 'var(--border-subtle)' }} />

      {/* ── Section 3: Completion Timeline ── */}
      <div style={{ padding: '1rem 1.25rem 0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <BarChart3 size={14} style={{ color: phaseColors[4] }} />
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
          }}>
            {t('dashboard.progressSummary.activityLast14')}
          </h3>
        </div>
        {hasTimelineData ? (
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={timeline} barSize={12}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 8, fill: 'var(--text-disabled)' }}
                axisLine={false} tickLine={false}
                interval={Math.ceil(timeline.length / 5) - 1}
              />
              <Tooltip content={<MiniTooltip />} cursor={{ fill: 'var(--hover-bg)' }} />
              <Bar dataKey="Tasks" radius={[3, 3, 0, 0]} fill={phaseColors[4]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', textAlign: 'center', padding: '1rem 0' }}>
            {t('dashboard.progressSummary.completeTasksForActivity')}
          </p>
        )}
      </div>

      {/* ── Footer CTA ── */}
      <button
        onClick={goToChecklist}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          width: '100%', padding: '0.625rem', borderTop: '0.0625rem solid var(--border-subtle)',
          background: 'none', border: 'none', borderTopStyle: 'solid', borderTopWidth: '0.0625rem', borderTopColor: 'var(--border-subtle)',
          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
          color: phaseColors[1], fontFamily: 'var(--font-body)',
          transition: 'background 150ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        {t('dashboard.progressSummary.openChecklist')}
        <ArrowRight size={12} />
      </button>
    </div>
  )
}
