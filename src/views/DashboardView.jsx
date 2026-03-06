import { useState, useRef, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Sparkles, FileText, MessageSquare, Globe, Target, ChartColumnIncreasing, Activity, TrendingUp, TrendingDown, Shield, Bot, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import { getSmartRecommendations, getQuickWin, getProjectContextLine, INDUSTRY_LABELS, COUNTRY_LABELS, REGION_LABELS, AUDIENCE_LABELS, GOAL_LABELS } from '../utils/getRecommendations'
import { useScoreHistory } from '../hooks/useScoreHistory'
import { ScoreHistoryChart } from '../components/charts'
import ActivityTimeline from '../components/ActivityTimeline'
import {
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { PHASE_COLOR_ARRAY, PHASE_COLORS } from '../utils/chartColors'
import { useScrollActiveTab } from '../hooks/useScrollActiveTab'
import StatCard from './dashboard/StatCard'
import PhaseDonut from './dashboard/PhaseDonut'
import RecommendationsPanel from './dashboard/RecommendationsPanel'
import QuickActions from './dashboard/QuickActions'
import AnalyticsPanel from './dashboard/AnalyticsPanel'
import ProgressSummaryCard from './dashboard/ProgressSummaryCard'
import QuickWinCard from './dashboard/QuickWinCard'
import ActivityInsightsPanel from './dashboard/ActivityInsightsPanel'
import DashboardPresetSwitcher, { getStoredPreset, storePreset, isSectionVisible } from './dashboard/DashboardPresets'
import useGridNav from '../hooks/useGridNav'

const SUB_TAB_KEYS = [
  { id: 'overview', i18nKey: 'dashboard.overview' },
  { id: 'analytics', i18nKey: 'dashboard.analytics' },
  { id: 'citations', i18nKey: 'dashboard.citations' },
  { id: 'prompts', i18nKey: 'dashboard.prompts' },
  { id: 'chatbots', i18nKey: 'dashboard.chatbots' },
]

const ENGINE_COLORS = PHASE_COLOR_ARRAY

const CustomTooltip = memo(function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: 600 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontWeight: 500 }}>
          {entry.name}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
})

/* ── Competitor Alert Digest Widget ── */
function CompetitorAlertDigest({ alerts = [], setActiveView, t }) {
  const undismissed = useMemo(() => alerts.filter(a => !a.dismissed).slice(0, 5), [alerts])
  if (!undismissed.length) return null

  return (
    <div className="card card-lg">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--space-3)',
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        }}>
          <Activity size={13} style={{ color: 'var(--color-phase-2)' }} />
          {t('dashboard.competitorAlerts')}
          <span style={{
            background: 'var(--color-error)', color: '#fff', fontSize: '0.625rem',
            fontWeight: 700, padding: '0.0625rem 0.375rem', borderRadius: '0.5rem',
            fontFamily: 'var(--font-heading)',
          }}>
            {undismissed.length}
          </span>
        </div>
        <button
          onClick={() => setActiveView('competitors')}
          className="btn-ghost btn-sm"
          style={{ fontSize: 'var(--text-2xs)' }}
        >
          {t('dashboard.viewAll')}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {undismissed.map(alert => (
          <div
            key={alert.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--hover-bg)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div style={{
              width: '1.5rem', height: '1.5rem', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: alert.type === 'score_jump' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
            }}>
              {alert.type === 'score_jump'
                ? <TrendingUp size={11} style={{ color: 'var(--color-error)' }} />
                : <TrendingDown size={11} style={{ color: 'var(--color-success)' }} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alert.competitorName}</span>
              <span style={{ color: 'var(--text-tertiary)', marginLeft: 'var(--space-1)' }}>
                {alert.delta > 0 ? '+' : ''}{alert.delta} pts
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xs)',
              color: alert.type === 'score_jump' ? 'var(--color-error)' : 'var(--color-success)',
            }}>
              {alert.currentScore}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Score History Section ── */
function ScoreHistorySection({ activeProject, updateProject, t }) {
  const { trendData } = useScoreHistory({ activeProject, updateProject })

  return (
    <div className="card card-lg">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--space-3)',
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        }}>
          <TrendingUp size={13} style={{ color: 'var(--color-phase-4)' }} />
          {t('dashboard.scoreHistory', 'Score History')}
        </div>
      </div>
      <ScoreHistoryChart data={trendData} height={260} />
    </div>
  )
}

function DashboardEmptyState({ message, onAction, t }) {
  return (
    <div className="card card-xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <ChartColumnIncreasing size={28} style={{ color: 'var(--text-disabled)' }} />
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textAlign: 'center' }}>{message}</p>
      <button onClick={onAction} className="btn-primary btn-sm" style={{ marginTop: 'var(--space-1)' }}>
        {t('dashboard.runMetricsAnalysis')}
      </button>
    </div>
  )
}

export default function DashboardView({ projects, activeProject, setActiveProjectId, setActiveView, onNewProject, phases, userName, currentUserUid, updateProject }) {
  const { t } = useTranslation('app')
  const [subTab, setSubTab] = useState('overview')
  const [activePreset, setActivePreset] = useState(() => getStoredPreset())
  const subTabsRef = useRef(null)
  const statsGridRef = useRef(null)
  useScrollActiveTab(subTabsRef, subTab)
  useGridNav(statsGridRef)

  const handlePresetChange = useCallback((presetId) => {
    setActivePreset(presetId)
    storePreset(presetId)
  }, [])

  const showSection = useCallback((name) => isSectionVisible(activePreset, name), [activePreset])

  const getPhaseProgress = useCallback((phase) => {
    if (!activeProject) return { total: 0, checked: 0, percent: 0 }
    let total = 0, checked = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => {
        total++
        if (activeProject.checked?.[item.id]) checked++
      })
    })
    return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }, [activeProject])

  // Metrics data from project history
  const metricsHistory = activeProject?.metricsHistory || []
  const latestMetrics = metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : null
  const prevMetrics = metricsHistory.length > 1 ? metricsHistory[metricsHistory.length - 2] : null

  // Memoize all derived metrics data
  const { totalCitations, totalPrompts, activeEngines, aeoScore, citationsTrend, promptsTrend, scoreTrend } = useMemo(() => {
    const calcTrend = (curr, prev) => {
      if (!curr || !prev || prev === 0) return 0
      return Math.round(((curr - prev) / prev) * 100 * 10) / 10
    }
    const tc = latestMetrics?.citations?.total || 0
    const tp = latestMetrics?.prompts?.total || 0
    const ae = latestMetrics?.citations?.byEngine?.filter(e => e.citations > 0).length || 0
    const as_ = latestMetrics?.overallScore || 0
    return {
      totalCitations: tc,
      totalPrompts: tp,
      activeEngines: ae,
      aeoScore: as_,
      citationsTrend: calcTrend(tc, prevMetrics?.citations?.total),
      promptsTrend: calcTrend(tp, prevMetrics?.prompts?.total),
      scoreTrend: calcTrend(as_, prevMetrics?.overallScore),
    }
  }, [latestMetrics, prevMetrics])

  // Chart data: last 14 snapshots
  const chartData = useMemo(() => metricsHistory.slice(-14).map(m => ({
    date: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Citations: m.citations?.total || 0,
    Prompts: m.prompts?.total || 0,
  })), [metricsHistory])

  // Pie data: engine distribution
  const engineData = useMemo(() => latestMetrics?.citations?.byEngine?.filter(e => e.citations > 0).map((e, i) => ({
    name: e.engine?.split(' ')[0] || 'Other',
    value: e.citations || 0,
    color: ENGINE_COLORS[i % ENGINE_COLORS.length],
  })) || [], [latestMetrics])

  // All engines (including zero) for detail tables
  const allEngineData = useMemo(() => latestMetrics?.citations?.byEngine?.map((e, i) => ({
    name: e.engine || 'Unknown',
    citations: e.citations || 0,
    color: ENGINE_COLORS[i % ENGINE_COLORS.length],
  })) || [], [latestMetrics])

  // Top prompts
  const topPrompts = useMemo(() => latestMetrics?.prompts?.topPrompts || latestMetrics?.prompts?.byCategory || [], [latestMetrics])

  // Prompts chart data
  const promptsChartData = useMemo(() => metricsHistory.slice(-14).map(m => ({
    date: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Prompts: m.prompts?.total || 0,
  })), [metricsHistory])

  // Citations-only chart data
  const citationsChartData = useMemo(() => metricsHistory.slice(-14).map(m => ({
    date: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Citations: m.citations?.total || 0,
  })), [metricsHistory])

  // Smart Recommendations — uses full project state, not just questionnaire
  const recommendations = useMemo(() => getSmartRecommendations(activeProject, phases, setActiveView), [activeProject, phases, setActiveView])

  // Quick Win — single highest-impact next action
  const quickWin = useMemo(() => getQuickWin(activeProject, phases, setActiveView), [activeProject, phases, setActiveView])

  const emptyStateAction = useCallback(() => setActiveView('metrics'), [setActiveView])

  return (
    <div className="view-wrapper">
      {/* Welcome */}
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title" style={{ fontSize: 'var(--text-2xl)' }}>
            {userName ? t('dashboard.welcomeBackName', { name: userName }) : t('dashboard.welcomeBack')}
          </h2>
          {activeProject?.questionnaire?.completedAt ? (() => {
            const q = activeProject.questionnaire
            const industry = INDUSTRY_LABELS[q.industry] || q.industry
            const audience = AUDIENCE_LABELS[q.audience] || q.audience
            const ctrs = q.countries?.length > 0 ? q.countries : q.country ? [q.country] : []
            const location = ctrs.length > 0
              ? `${ctrs.map(c => COUNTRY_LABELS[c] || c).join(', ')}${q.region ? `, ${REGION_LABELS[q.region]}` : ''}`
              : REGION_LABELS[q.region] || null
            const goal = GOAL_LABELS[q.primaryGoal] || null
            return (
              <p className="view-subtitle">
                Optimizing <strong style={{ color: 'var(--text-secondary)' }}>{industry}</strong>
                {audience && <> for <strong style={{ color: 'var(--text-secondary)' }}>{audience}</strong> audiences</>}
                {location && <> in <strong style={{ color: 'var(--text-secondary)' }}>{location}</strong></>}
                {goal && <> — focused on <strong style={{ color: 'var(--text-secondary)' }}>{goal.toLowerCase()}</strong></>}
                .
              </p>
            )
          })() : (
            <p className="view-subtitle">{t('dashboard.overviewSubtitle')}</p>
          )}
        </div>
      </div>

      {/* Sub-tabs + Preset Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <div ref={subTabsRef} className="tab-bar-segmented scrollable-tabs" role="tablist" style={{ flex: 1 }}>
          {SUB_TAB_KEYS.map(tab => (
            <button
              key={tab.id}
              className="tab-segmented"
              role="tab"
              aria-selected={subTab === tab.id}
              data-active={subTab === tab.id || undefined}
              onClick={() => setSubTab(tab.id)}
            >
              {t(tab.i18nKey)}
            </button>
          ))}
        </div>
        {subTab === 'overview' && (
          <DashboardPresetSwitcher activePreset={activePreset} onSelect={handlePresetChange} />
        )}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {subTab === 'overview' && (
        <>
          {/* 4 Stat Cards */}
          {showSection('stats') && (
          <div ref={statsGridRef} className="stats-grid-4 stagger-grid" role="grid" aria-label={t('dashboard.overview')} data-tour="dashboard-stats">
            <StatCard label={t('dashboard.totalCitations')} value={totalCitations.toLocaleString()} trend={citationsTrend} icon={<FileText size={18} />} iconColor="var(--color-phase-2)" />
            <StatCard label={t('dashboard.totalPrompts')} value={totalPrompts.toLocaleString()} trend={promptsTrend} icon={<MessageSquare size={18} />} iconColor="var(--color-phase-1)" />
            <StatCard label={t('dashboard.activeAiEngines')} value={activeEngines} trend={null} icon={<Globe size={18} />} iconColor="var(--color-phase-3)" />
            <StatCard label={t('dashboard.aeoScore')} value={`${aeoScore}/100`} trend={scoreTrend} icon={<Target size={18} />} iconColor="var(--color-phase-5)" />
          </div>
          )}

          {/* Site Health + AI Crawler Access — from deterministic analysis */}
          {showSection('siteHealth') && activeProject?.deterministicScore && (
            <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {/* Site Health Card */}
              <div className="card card-lg">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  marginBottom: 'var(--space-3)',
                }}>
                  <Shield size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
                  }}>
                    {t('dashboard.siteHealth', 'Site Health')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{
                    width: '4rem', height: '4rem', borderRadius: '50%',
                    border: `3px solid ${activeProject.deterministicScore.overallScore >= 70 ? 'var(--color-success)' : activeProject.deterministicScore.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}>
                    {activeProject.deterministicScore.overallScore}
                  </div>
                  <div style={{ flex: 1 }}>
                    {Object.entries(activeProject.deterministicScore.categories).map(([name, cat]) => {
                      const pct = Math.round((cat.score / cat.maxScore) * 100)
                      return (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', minWidth: '5.5rem' }}>{name}</span>
                          <div style={{ flex: 1, height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--border-subtle)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '0.1875rem',
                              background: pct >= 70 ? 'var(--color-success)' : pct >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
                              width: `${pct}%`, transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: 'var(--text-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', minWidth: '2rem', textAlign: 'right' }}>{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setActiveView('analyzer')}
                  className="btn-ghost btn-sm"
                  style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-2xs)', width: '100%' }}
                >
                  {t('dashboard.viewFullAnalysis', 'View Full Analysis →')}
                </button>
              </div>

              {/* AI Crawler Access Card */}
              {activeProject.robotsData && (
                <div className="card card-lg">
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    marginBottom: 'var(--space-3)',
                  }}>
                    <Bot size={14} style={{ color: 'var(--color-phase-3)' }} />
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
                    }}>
                      {t('dashboard.aiCrawlerAccess', 'AI Crawler Access')}
                    </span>
                    {activeProject.robotsData.summary && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 'var(--text-2xs)', fontWeight: 600,
                        color: activeProject.robotsData.summary.blocked === 0 ? 'var(--color-success)' : 'var(--color-error)',
                      }}>
                        {activeProject.robotsData.summary.allowed}/{activeProject.robotsData.summary.total} allowed
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    {activeProject.robotsData.crawlers?.slice(0, 6).map(crawler => (
                      <div key={crawler.name} style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        fontSize: 'var(--text-xs)', padding: 'var(--space-1) 0',
                      }}>
                        {crawler.status === 'allowed' ? (
                          <CheckCircle2 size={12} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                        ) : crawler.status === 'blocked' ? (
                          <XCircle size={12} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                        ) : (
                          <MinusCircle size={12} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
                        )}
                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{crawler.name}</span>
                        <span style={{
                          fontSize: 'var(--text-2xs)', fontWeight: 600,
                          color: crawler.status === 'allowed' ? 'var(--color-success)' : crawler.status === 'blocked' ? 'var(--color-error)' : 'var(--text-disabled)',
                        }}>
                          {crawler.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveView('analyzer')}
                    className="btn-ghost btn-sm"
                    style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-2xs)', width: '100%' }}
                  >
                    {t('dashboard.viewDetails', 'View Details →')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Win — #1 highest-impact action */}
          {showSection('quickWin') && (
          <div data-tour="quick-win">
            <QuickWinCard quickWin={quickWin} />
          </div>
          )}

          {/* Score History Timeline */}
          {showSection('scoreHistory') && activeProject && (
            <ScoreHistorySection activeProject={activeProject} updateProject={updateProject} t={t} />
          )}

          {/* Donut Chart — Phase Progress */}
          {showSection('donut') && activeProject && phases && (
            <PhaseDonut phases={phases} getPhaseProgress={getPhaseProgress} onNavigate={() => setActiveView('checklist')} />
          )}

          {/* Progress Summary — Milestones, Quick Wins, Timeline */}
          {showSection('progress') && activeProject && phases && (
            <ProgressSummaryCard activeProject={activeProject} phases={phases} setActiveView={setActiveView} />
          )}

          {/* Personalized Recommendations */}
          {showSection('recommendations') && (
          <div data-tour="recommendations">
            <RecommendationsPanel recommendations={recommendations} contextLine={activeProject?.questionnaire?.completedAt ? getProjectContextLine(activeProject.questionnaire, t) : null} />
          </div>
          )}

          {/* Charts Row */}
          {showSection('charts') && latestMetrics && (
            <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="card card-lg">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                  {t('dashboard.aiCitationsOverTime')}
                </h3>
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                      <Line type="monotone" dataKey="Citations" stroke={PHASE_COLORS[2]} strokeWidth={2} dot={{ r: 3, fill: PHASE_COLORS[2] }} />
                      <Line type="monotone" dataKey="Prompts" stroke={PHASE_COLORS[1]} strokeWidth={2} dot={{ r: 3, fill: PHASE_COLORS[1] }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '13.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                    {t('dashboard.runMultipleForTrends')}
                  </div>
                )}
              </div>

              <div className="card card-lg">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                  {t('dashboard.botTypeDistribution')}
                </h3>
                {engineData.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie data={engineData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {engineData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {engineData.map((entry, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '0.1875rem', background: entry.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{entry.name}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '12.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                    {t('dashboard.runAnalysisForDistribution')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phase Progress Card */}
          {showSection('phaseProgress') && activeProject && phases && (
            <div className="phase-progress-card">
              <div className="phase-progress-card-header">{t('dashboard.phaseProgress')}</div>
              {phases.map(phase => {
                const pp = getPhaseProgress(phase)
                return (
                  <div key={phase.id} className="phase-progress-row" onClick={() => setActiveView('checklist')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveView('checklist') } }} role="button" tabIndex={0} aria-label={`${phase.title} — click to view checklist`}>
                    <div className="phase-row-icon" style={{ background: phase.color + '15', color: phase.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{phase.Icon ? <phase.Icon size={16} /> : null}</div>
                    <div className="phase-row-name">{phase.title}</div>
                    <div className="phase-row-count">{pp.checked}/{pp.total}</div>
                    <div className="phase-row-percent" style={{ color: phase.color }}>{pp.percent}%</div>
                    <div className="phase-row-bar">
                      <div className="phase-row-bar-fill" style={{ width: `${pp.percent}%`, backgroundColor: phase.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Recent Activity */}
          {showSection('activity') && <div className="card card-lg">
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-3)',
            }}>
              {t('dashboard.recentActivity')}
            </div>
            <ActivityTimeline activities={activeProject?.activityLog || []} currentUserUid={currentUserUid} />
          </div>}

          {/* Team Activity Insights */}
          {showSection('activityInsights') && (
            <ActivityInsightsPanel activities={activeProject?.activityLog || []} />
          )}

          {/* Competitor Alert Digest */}
          {showSection('competitorAlerts') && <CompetitorAlertDigest
            alerts={activeProject?.competitorAlerts}
            setActiveView={setActiveView}
            t={t}
          />}

          {showSection('quickActions') && <QuickActions setActiveView={setActiveView} />}
        </>
      )}

      {/* ═══ ANALYTICS TAB ═══ */}
      {subTab === 'analytics' && activeProject && (
        <AnalyticsPanel activeProject={activeProject} phases={phases} />
      )}

      {/* ═══ CITATIONS TAB ═══ */}
      {subTab === 'citations' && (
        <>
          {latestMetrics ? (
            <>
              <div className="stats-grid-4 stagger-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <StatCard label={t('dashboard.totalCitations')} value={totalCitations.toLocaleString()} trend={citationsTrend} icon={<FileText size={18} />} iconColor="var(--color-phase-2)" />
                <StatCard label={t('dashboard.activeAiEngines')} value={activeEngines} trend={null} icon={<Globe size={18} />} iconColor="var(--color-phase-3)" />
                <StatCard label={t('dashboard.aeoScore')} value={`${aeoScore}/100`} trend={scoreTrend} icon={<Target size={18} />} iconColor="var(--color-phase-5)" />
              </div>

              <div className="card card-lg">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                  {t('dashboard.citationsOverTime')}
                </h3>
                {citationsChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={citationsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Citations" stroke={PHASE_COLORS[2]} strokeWidth={2.5} dot={{ r: 4, fill: PHASE_COLORS[2] }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '17.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                    {t('dashboard.runMultipleForCitationTrends')}
                  </div>
                )}
              </div>

              <div className="card card-lg">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                  {t('dashboard.citationsByAiEngine')}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                        <th scope="col" style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.0313rem' }}>{t('dashboard.engine')}</th>
                        <th scope="col" style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.0313rem' }}>{t('dashboard.totalCitations')}</th>
                        <th scope="col" style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.0313rem', width: '40%' }}>{t('dashboard.share')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allEngineData.map((engine, i) => (
                        <tr key={i} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '0.125rem', background: engine.color, flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{engine.name}</span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '0.625rem 0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{engine.citations.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', padding: '0.625rem 0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <div style={{ flex: 1, maxWidth: '7.5rem', height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--border-subtle)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: '0.1875rem', background: engine.color, width: `${totalCitations > 0 ? (engine.citations / totalCitations) * 100 : 0}%` }} />
                              </div>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', minWidth: '2.25rem', fontFamily: 'var(--font-mono)' }}>
                                {totalCitations > 0 ? Math.round((engine.citations / totalCitations) * 100) : 0}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <DashboardEmptyState onAction={emptyStateAction} message={t('dashboard.runMetricsForCitations')} t={t} />
          )}
        </>
      )}

      {/* ═══ PROMPTS TAB ═══ */}
      {subTab === 'prompts' && (
        <>
          {latestMetrics ? (
            <>
              <div className="stats-grid-4 stagger-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatCard label={t('dashboard.totalPrompts')} value={totalPrompts.toLocaleString()} trend={promptsTrend} icon={<MessageSquare size={18} />} iconColor="var(--color-phase-1)" />
                <StatCard label={t('dashboard.aeoScore')} value={`${aeoScore}/100`} trend={scoreTrend} icon={<Target size={18} />} iconColor="var(--color-phase-5)" />
              </div>

              <div className="card card-lg">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                  {t('dashboard.promptsOverTime')}
                </h3>
                {promptsChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={promptsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Prompts" stroke={PHASE_COLORS[1]} strokeWidth={2.5} dot={{ r: 4, fill: PHASE_COLORS[1] }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '17.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                    {t('dashboard.runMultipleForPromptTrends')}
                  </div>
                )}
              </div>

              {topPrompts.length > 0 && (
                <div className="card card-lg">
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                    {t('dashboard.topPromptCategories')}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {topPrompts.slice(0, 10).map((prompt, i) => {
                      const label = typeof prompt === 'string' ? prompt : (prompt.category || prompt.text || prompt.name || 'Unknown')
                      const count = typeof prompt === 'object' ? (prompt.count || prompt.total || 0) : 0
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < topPrompts.length - 1 ? '0.0625rem solid var(--border-subtle)' : 'none' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-disabled)', minWidth: '1.5rem', fontFamily: 'var(--font-mono)' }}>#{i + 1}</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', flex: 1 }}>{label}</span>
                          {count > 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{count.toLocaleString()}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <DashboardEmptyState onAction={emptyStateAction} message={t('dashboard.runMetricsForPrompts')} t={t} />
          )}
        </>
      )}

      {/* ═══ CHATBOTS TAB ═══ */}
      {subTab === 'chatbots' && (
        <>
          {latestMetrics ? (
            <>
              <div className="stats-grid-4 stagger-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatCard label={t('dashboard.activeAiEngines')} value={activeEngines} trend={null} icon={<Globe size={18} />} iconColor="var(--color-phase-3)" />
                <StatCard label={t('dashboard.totalCitations')} value={totalCitations.toLocaleString()} trend={citationsTrend} icon={<FileText size={18} />} iconColor="var(--color-phase-2)" />
              </div>

              <div className="card card-lg">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                  {t('dashboard.aiEngineDistribution')}
                </h3>
                {engineData.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'center' }}>
                    <ResponsiveContainer width="45%" height={260}>
                      <PieChart>
                        <Pie data={engineData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                          {engineData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {engineData.map((entry, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '0.1875rem', background: entry.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{entry.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '16.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                    {t('dashboard.runAnalysisForEngineDistribution')}
                  </div>
                )}
              </div>

              <div className="card card-lg">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                  {t('dashboard.engineDetails')}
                </h3>
                <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12.5rem, 1fr))', gap: 'var(--space-3)' }}>
                  {allEngineData.map((engine, i) => (
                    <div key={i} className="card card-md" style={{ border: engine.citations > 0 ? `0.0625rem solid ${engine.color}30` : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '0.1875rem', background: engine.color }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{engine.name}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: engine.citations > 0 ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                        {engine.citations.toLocaleString()}
                      </div>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                        {engine.citations > 0 ? t('dashboard.citationsFound') : t('dashboard.noCitationsYet')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <DashboardEmptyState onAction={emptyStateAction} message={t('dashboard.runMetricsForChatbots')} t={t} />
          )}
        </>
      )}

      {/* No project empty state */}
      {!activeProject && projects.length === 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12) var(--space-6)' }}>
          <Sparkles size={32} className="text-phase-1" style={{ marginBottom: 'var(--space-4)' }} />
          <h3 className="view-title" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>{t('dashboard.noProjectsYet')}</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)', textAlign: 'center', maxWidth: '18.75rem' }}>
            {t('dashboard.createFirstProject')}
          </p>
          <button onClick={onNewProject} className="btn-primary">
            <Plus size={14} />
            {t('dashboard.createProject')}
          </button>
        </div>
      )}
    </div>
  )
}
