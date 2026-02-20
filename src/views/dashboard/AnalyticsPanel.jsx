import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp, TrendingDown, Activity, Zap, PenTool, Code2, Eye,
  BarChart3, Users, CheckCircle2, Clock, ArrowUpRight, Shield, Minus,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, RadialBarChart, RadialBar,
} from 'recharts'
import { PHASE_COLORS, getScoreColor, useChartColors } from '../../utils/chartColors'
import EmptyState from '../../components/EmptyState'

/* ── Tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: 600 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill, fontWeight: 500 }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

/* ── Mini Stat ── */
function MiniStat({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1rem', borderRadius: '0.625rem',
      background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '0.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '18', color, flexShrink: 0,
      }}>
        <Icon size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      </div>
      {sub && (
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{sub}</span>
      )}
    </div>
  )
}

/* ── Section Header ── */
function SectionHeader({ icon: Icon, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <Icon size={14} style={{ color }} />
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.75px', color: 'var(--text-tertiary)',
      }}>
        {label}
      </h3>
    </div>
  )
}

/* ── Main Component ── */
export default function AnalyticsPanel({ activeProject, phases }) {
  const { t } = useTranslation('app')
  const { phaseColors, getScore: getThemeScoreColor } = useChartColors()
  const checked = activeProject?.checked || {}
  const metricsHistory = activeProject?.metricsHistory || []
  const monitorHistory = activeProject?.monitorHistory || []
  const contentHistory = activeProject?.contentHistory || []
  const schemaHistory = activeProject?.schemaHistory || []
  const competitors = activeProject?.competitors || []
  const analyzerResults = activeProject?.analyzerResults
  const competitorAnalysis = activeProject?.competitorAnalysis
  const activityLog = activeProject?.activityLog || []

  /* ── AEO Health Score (composite) ── */
  const healthScore = useMemo(() => {
    let score = 0
    let factors = 0

    // 1. Checklist progress (0-25 pts)
    if (phases) {
      const totalItems = phases.reduce((s, p) => s + p.categories.reduce((s2, c) => s2 + c.items.length, 0), 0)
      const totalChecked = Object.values(checked).filter(Boolean).length
      const pct = totalItems > 0 ? totalChecked / totalItems : 0
      score += pct * 25
      factors++
    }

    // 2. Latest AEO score (0-25 pts)
    if (metricsHistory.length > 0) {
      const latest = metricsHistory[metricsHistory.length - 1]
      score += ((latest.overallScore || 0) / 100) * 25
      factors++
    }

    // 3. Analyzer score (0-25 pts)
    if (analyzerResults) {
      score += ((analyzerResults.overallScore || 0) / 100) * 25
      factors++
    }

    // 4. Feature usage (0-25 pts)
    let usage = 0
    if (metricsHistory.length > 0) usage += 4
    if (monitorHistory.length > 0) usage += 4
    if (contentHistory.length > 0) usage += 4
    if (schemaHistory.length > 0) usage += 4
    if (analyzerResults) usage += 4
    if (competitors.length > 0) usage += 3
    if (activeProject?.questionnaire?.completedAt) usage += 2
    score += Math.min(usage, 25)
    factors++

    return factors > 0 ? Math.round(score) : 0
  }, [checked, metricsHistory, monitorHistory, contentHistory, schemaHistory, analyzerResults, competitors, activeProject, phases])

  const healthColor = getThemeScoreColor(healthScore)

  /* ── Radial gauge data ── */
  const gaugeData = [{ name: 'Health', value: healthScore, fill: healthColor }]

  /* ── Score trend (sparkline) ── */
  const scoreTrend = useMemo(() => {
    return metricsHistory.slice(-12).map(m => ({
      date: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      Score: m.overallScore || 0,
    }))
  }, [metricsHistory])

  /* ── Project velocity: tasks completed per week ── */
  const velocity = useMemo(() => {
    const completions = activityLog
      .filter(a => a.type === 'check')
      .map(a => ({ date: new Date(a.timestamp), ...a }))

    if (completions.length === 0) return []

    // Group by week
    const weeks = {}
    completions.forEach(c => {
      const weekStart = new Date(c.date)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const key = weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })
      weeks[key] = (weeks[key] || 0) + 1
    })

    return Object.entries(weeks).slice(-8).map(([week, count]) => ({
      week,
      Tasks: count,
    }))
  }, [activityLog])

  /* ── Feature usage stats ── */
  const featureUsage = useMemo(() => {
    const features = [
      { name: t('dashboard.analyticsPanel.featureAnalyzer'), used: !!analyzerResults, count: analyzerResults ? 1 : 0, icon: Zap, color: phaseColors[1] },
      { name: t('dashboard.analyticsPanel.featureWriter'), used: contentHistory.length > 0, count: contentHistory.length, icon: PenTool, color: phaseColors[3] },
      { name: t('dashboard.analyticsPanel.featureSchema'), used: schemaHistory.length > 0, count: schemaHistory.length, icon: Code2, color: phaseColors[4] },
      { name: t('dashboard.analyticsPanel.featureMonitoring'), used: monitorHistory.length > 0, count: monitorHistory.length, icon: Eye, color: phaseColors[6] },
      { name: t('dashboard.analyticsPanel.featureMetrics'), used: metricsHistory.length > 0, count: metricsHistory.length, icon: BarChart3, color: phaseColors[2] },
      { name: t('dashboard.analyticsPanel.featureCompetitors'), used: competitors.length > 0, count: competitors.length, icon: Users, color: phaseColors[5] },
    ]
    return features
  }, [analyzerResults, contentHistory, schemaHistory, monitorHistory, metricsHistory, competitors, phaseColors, t])

  const featuresUsed = featureUsage.filter(f => f.used).length
  const totalFeatures = featureUsage.length

  /* ── Phase radar data ── */
  const radarData = useMemo(() => {
    if (!phases) return []
    return phases.map(phase => {
      let total = 0, done = 0
      phase.categories.forEach(cat => {
        cat.items.forEach(item => { total++; if (checked[item.id]) done++ })
      })
      return {
        phase: phase.title.replace('Phase ', 'P').replace(': ', '\n'),
        shortName: `P${phase.number}`,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
        fullMark: 100,
      }
    })
  }, [phases, checked])

  /* ── Engine coverage ── */
  const engineCoverage = useMemo(() => {
    if (metricsHistory.length === 0) return { citing: 0, total: 0, engines: [] }
    const latest = metricsHistory[metricsHistory.length - 1]
    const engines = latest.citations?.byEngine || []
    const citing = engines.filter(e => e.citations > 0).length
    return { citing, total: engines.length, engines }
  }, [metricsHistory])

  /* ── Score delta ── */
  const scoreDelta = useMemo(() => {
    if (metricsHistory.length < 2) return null
    const latest = metricsHistory[metricsHistory.length - 1]
    const previous = metricsHistory[metricsHistory.length - 2]
    return (latest.overallScore || 0) - (previous.overallScore || 0)
  }, [metricsHistory])

  /* ── Content pipeline ── */
  const contentCount = contentHistory.length
  const schemaCount = schemaHistory.length

  /* ── Days since project creation ── */
  const projectAge = useMemo(() => {
    if (!activeProject?.createdAt) return 0
    return Math.max(1, Math.floor((Date.now() - new Date(activeProject.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
  }, [activeProject?.createdAt])

  /* ── Checklist stats ── */
  const checklistStats = useMemo(() => {
    if (!phases) return { total: 0, done: 0, pct: 0 }
    const total = phases.reduce((s, p) => s + p.categories.reduce((s2, c) => s2 + c.items.length, 0), 0)
    const done = Object.values(checked).filter(Boolean).length
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [phases, checked])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ═══ ROW 1: Health Score + Score Trend ═══ */}
      <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* AEO Health Score — Radial Gauge */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SectionHeader icon={Shield} label={t('dashboard.analyticsPanel.healthScore')} color={healthColor} />
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart
                cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                barSize={14} data={gaugeData} startAngle={210} endAngle={-30}
              >
                <RadialBar
                  background={{ fill: 'var(--border-subtle)' }}
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '-2.5rem' }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800,
              color: healthColor, lineHeight: 1,
            }}>
              {healthScore}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              {t('dashboard.analyticsPanel.outOf100')}
            </div>
          </div>
          <div style={{
            display: 'flex', gap: '1.25rem', marginTop: '1rem',
            padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
            background: 'var(--hover-bg)', width: '100%', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t('dashboard.analyticsPanel.checklist')}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {checklistStats.pct}%
              </div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t('dashboard.analyticsPanel.features')}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {featuresUsed}/{totalFeatures}
              </div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t('dashboard.analyticsPanel.days')}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {projectAge}
              </div>
            </div>
          </div>
        </div>

        {/* Score Trend Sparkline */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <SectionHeader icon={TrendingUp} label={t('dashboard.analyticsPanel.scoreTrend')} color={phaseColors[2]} />
          {scoreTrend.length > 1 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {metricsHistory[metricsHistory.length - 1]?.overallScore || 0}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>/100</span>
                {scoreDelta !== null && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.125rem',
                    fontSize: '0.75rem', fontWeight: 600,
                    color: scoreDelta > 0 ? 'var(--color-success)' : scoreDelta < 0 ? 'var(--color-error)' : 'var(--text-tertiary)',
                    marginLeft: '0.25rem',
                  }}>
                    {scoreDelta > 0 ? <TrendingUp size={12} /> : scoreDelta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={scoreTrend}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={phaseColors[2]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={phaseColors[2]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone" dataKey="Score" stroke={phaseColors[2]}
                    strokeWidth={2.5} fill="url(#scoreGradient)"
                    dot={{ r: 3, fill: phaseColors[2] }} activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <EmptyState
              icon={BarChart3}
              title={t('dashboard.analyticsPanel.noTrendData')}
              description={t('dashboard.analyticsPanel.noTrendDataDesc')}
              color="var(--color-phase-1)"
              compact
            />
          )}
        </div>
      </div>

      {/* ═══ ROW 2: Mini Stats Strip ═══ */}
      <div className="resp-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        <MiniStat
          label={t('dashboard.analyticsPanel.checklist')}
          value={`${checklistStats.done}/${checklistStats.total}`}
          icon={CheckCircle2}
          color={phaseColors[4]}
          sub={`${checklistStats.pct}%`}
        />
        <MiniStat
          label={t('dashboard.analyticsPanel.contentPieces')}
          value={contentCount + schemaCount}
          icon={PenTool}
          color={phaseColors[3]}
          sub={t('dashboard.analyticsPanel.contentPiecesSub', { articles: contentCount, schemas: schemaCount })}
        />
        <MiniStat
          label={t('dashboard.analyticsPanel.aiEngines')}
          value={`${engineCoverage.citing}/${engineCoverage.total || '—'}`}
          icon={Activity}
          color={phaseColors[6]}
          sub={t('dashboard.analyticsPanel.citingYou')}
        />
        <MiniStat
          label={t('dashboard.analyticsPanel.projectAge')}
          value={`${projectAge}d`}
          icon={Clock}
          color={phaseColors[5]}
          sub={t('dashboard.analyticsPanel.actionsCount', { count: activityLog.length })}
        />
      </div>

      {/* ═══ ROW 3: Feature Usage + Phase Radar ═══ */}
      <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Feature Usage */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <SectionHeader icon={Zap} label={t('dashboard.analyticsPanel.featureUsage')} color={phaseColors[1]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {featureUsage.map(feat => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
                    background: feat.used ? `${feat.color}08` : 'transparent',
                    border: `1px solid ${feat.used ? feat.color + '20' : 'var(--border-subtle)'}`,
                  }}
                >
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: feat.color + '18', color: feat.color, flexShrink: 0,
                  }}>
                    <Icon size={13} />
                  </div>
                  <span style={{
                    flex: 1, fontSize: '0.8125rem', fontWeight: 500,
                    color: feat.used ? 'var(--text-primary)' : 'var(--text-disabled)',
                  }}>
                    {feat.name}
                  </span>
                  {feat.used ? (
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, color: feat.color,
                      fontFamily: 'var(--font-heading)',
                    }}>
                      {t('dashboard.analyticsPanel.runCount', { count: feat.count })}
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.6875rem', color: 'var(--text-disabled)',
                      fontStyle: 'italic',
                    }}>
                      {t('dashboard.analyticsPanel.notUsedYet')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t('dashboard.analyticsPanel.featureAdoption')}</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {featuresUsed}/{totalFeatures}
              </span>
            </div>
            <div style={{ height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--border-subtle)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '0.1875rem', transition: 'width 500ms ease',
                background: `linear-gradient(90deg, ${phaseColors[1]}, ${phaseColors[3]})`,
                width: `${totalFeatures > 0 ? (featuresUsed / totalFeatures) * 100 : 0}%`,
              }} />
            </div>
          </div>
        </div>

        {/* Phase Radar Chart */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <SectionHeader icon={Activity} label={t('dashboard.analyticsPanel.phaseRadar')} color={phaseColors[3]} />
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="var(--border-subtle)" />
                <PolarAngleAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: 'var(--text-tertiary)', fontWeight: 600 }}
                />
                <Radar
                  name="Progress"
                  dataKey="progress"
                  stroke={phaseColors[3]}
                  fill={phaseColors[3]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={Shield}
              title={t('dashboard.analyticsPanel.noPhaseData')}
              description={t('dashboard.analyticsPanel.noPhaseDataDesc')}
              color="var(--color-phase-2)"
              compact
            />
          )}
        </div>
      </div>

      {/* ═══ ROW 4: Velocity + Engine Coverage ═══ */}
      <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Project Velocity */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <SectionHeader icon={ArrowUpRight} label={t('dashboard.analyticsPanel.projectVelocity')} color={phaseColors[4]} />
          {velocity.length > 0 ? (
            <>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                {t('dashboard.analyticsPanel.tasksPerWeek')}
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={velocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Tasks" radius={[4, 4, 0, 0]}>
                    {velocity.map((_, i) => (
                      <Cell key={i} fill={phaseColors[(i % 7) + 1]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div style={{
              height: '13rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '0.5rem',
            }}>
              <CheckCircle2 size={28} style={{ color: 'var(--text-disabled)' }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                {t('dashboard.analyticsPanel.completeForVelocity')}
              </p>
            </div>
          )}
        </div>

        {/* Engine Coverage */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <SectionHeader icon={Activity} label={t('dashboard.analyticsPanel.engineCoverage')} color={phaseColors[6]} />
          {engineCoverage.total > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {engineCoverage.citing}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  {t('dashboard.analyticsPanel.ofEnginesCiting', { total: engineCoverage.total })}
                </span>
              </div>
              {engineCoverage.engines.map((engine, i) => {
                const maxCitations = Math.max(...engineCoverage.engines.map(e => e.citations || 0), 1)
                const pct = ((engine.citations || 0) / maxCitations) * 100
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{
                      fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '5.5rem',
                      fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {(engine.engine || 'Unknown').split(' ')[0]}
                    </span>
                    <div style={{
                      flex: 1, height: '0.5rem', borderRadius: '0.25rem',
                      background: 'var(--border-subtle)', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '0.25rem',
                        background: engine.citations > 0
                          ? phaseColors[(i % 7) + 1]
                          : 'var(--text-disabled)',
                        width: `${Math.max(pct, engine.citations > 0 ? 4 : 0)}%`,
                        transition: 'width 500ms ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, minWidth: '2rem', textAlign: 'right',
                      fontFamily: 'var(--font-heading)',
                      color: engine.citations > 0 ? 'var(--text-primary)' : 'var(--text-disabled)',
                    }}>
                      {engine.citations || 0}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title={t('dashboard.analyticsPanel.noEngineData')}
              description={t('dashboard.analyticsPanel.noEngineDataDesc')}
              color="var(--color-phase-3)"
              compact
            />
          )}
        </div>
      </div>

      {/* ═══ ROW 5: Insights Summary ═══ */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <SectionHeader icon={BarChart3} label={t('dashboard.analyticsPanel.keyInsights')} color={phaseColors[5]} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))', gap: '0.75rem' }}>
          {/* Dynamic insights based on data */}
          {checklistStats.pct === 100 && (
            <InsightCard
              type="success"
              text={t('dashboard.analyticsPanel.insightChecklistComplete')}
              detail={t('dashboard.analyticsPanel.insightChecklistCompleteDesc')}
            />
          )}
          {checklistStats.pct > 0 && checklistStats.pct < 100 && (
            <InsightCard
              type="info"
              text={t('dashboard.analyticsPanel.insightTasksRemaining', { count: checklistStats.total - checklistStats.done })}
              detail={t('dashboard.analyticsPanel.insightTasksRemainingDesc', { pct: checklistStats.pct, done: checklistStats.done, total: checklistStats.total })}
            />
          )}
          {scoreDelta !== null && scoreDelta > 0 && (
            <InsightCard
              type="success"
              text={t('dashboard.analyticsPanel.insightScoreUp', { delta: scoreDelta })}
              detail={t('dashboard.analyticsPanel.insightScoreUpDesc')}
            />
          )}
          {scoreDelta !== null && scoreDelta < 0 && (
            <InsightCard
              type="warning"
              text={t('dashboard.analyticsPanel.insightScoreDown', { delta: Math.abs(scoreDelta) })}
              detail={t('dashboard.analyticsPanel.insightScoreDownDesc')}
            />
          )}
          {engineCoverage.total > 0 && engineCoverage.citing < engineCoverage.total && (
            <InsightCard
              type="info"
              text={t('dashboard.analyticsPanel.insightEnginesNotCiting', { count: engineCoverage.total - engineCoverage.citing })}
              detail={t('dashboard.analyticsPanel.insightEnginesNotCitingDesc')}
            />
          )}
          {contentCount === 0 && schemaCount === 0 && (
            <InsightCard
              type="info"
              text={t('dashboard.analyticsPanel.insightNoContent')}
              detail={t('dashboard.analyticsPanel.insightNoContentDesc')}
            />
          )}
          {competitors.length === 0 && (
            <InsightCard
              type="info"
              text={t('dashboard.analyticsPanel.insightNoCompetitors')}
              detail={t('dashboard.analyticsPanel.insightNoCompetitorsDesc')}
            />
          )}
          {projectAge > 30 && metricsHistory.length < 2 && (
            <InsightCard
              type="warning"
              text={t('dashboard.analyticsPanel.insightLowMetrics')}
              detail={t('dashboard.analyticsPanel.insightLowMetricsDesc', { age: projectAge, count: metricsHistory.length })}
            />
          )}
          {featuresUsed === totalFeatures && (
            <InsightCard
              type="success"
              text={t('dashboard.analyticsPanel.insightFullAdoption')}
              detail={t('dashboard.analyticsPanel.insightFullAdoptionDesc')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Insight Card ── */
function InsightCard({ type, text, detail }) {
  const config = {
    success: { color: 'var(--color-success)', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle2 },
    warning: { color: 'var(--color-error)', bg: 'rgba(239,68,68,0.08)', icon: TrendingDown },
    info: { color: 'var(--color-phase-2)', bg: 'color-mix(in srgb, var(--color-phase-2) 8%, transparent)', icon: Activity },
  }
  const c = config[type] || config.info
  const Icon = c.icon
  return (
    <div style={{
      display: 'flex', gap: '0.625rem', padding: '0.75rem',
      borderRadius: '0.625rem', background: c.bg, border: `1px solid ${c.color}20`,
    }}>
      <Icon size={15} style={{ color: c.color, flexShrink: 0, marginTop: '0.0625rem' }} />
      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{text}</p>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{detail}</p>
      </div>
    </div>
  )
}
