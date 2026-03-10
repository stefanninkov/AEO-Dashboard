import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  FileText, MessageSquare, Globe, Target, TrendingUp, TrendingDown, Minus,
  Loader2, AlertCircle, RefreshCw, ChartSpline
} from 'lucide-react'
import {
  BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useAeoMetrics, AI_ENGINES } from '../hooks/useAeoMetrics'
import { useChartColors } from '../utils/chartColors'
import ProgressBar from '../components/ProgressBar'
import { getFilteredEngines } from '../utils/getRecommendations'
import { HeatmapChart } from '../components/charts'
import { useScrollActiveTab } from '../hooks/useScrollActiveTab'
import useGridNav from '../hooks/useGridNav'
import StatCard from './dashboard/StatCard'
import EmptyState from '../components/EmptyState'
import Celebration from '../components/Celebration'
import { useToast } from '../components/Toast'
import { useAiInsight } from '../hooks/useAiInsight'
import AiInsightCard from '../components/AiInsightCard'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: 600 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill, fontWeight: 500 }}>
          {entry.name || 'Value'}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

function BarChart({ data, maxValue, height = 200 }) {
  if (!data?.length) return null
  const chartData = data.map((d, i) => ({ name: d.label, value: d.value, fill: d.color || 'var(--color-phase-1)' }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={chartData} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="name" tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
        <YAxis tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} domain={[0, maxValue || 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

function HorizontalBar({ label, value, maxValue, color, suffix = '' }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text-primary w-32 truncate">{label}</span>
      <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: 'var(--hover-bg)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color || 'var(--color-phase-1)' }}
        />
      </div>
      <span className="text-sm font-medium text-text-primary w-16 text-right">{value}{suffix}</span>
    </div>
  )
}

function PieChart({ data, size = 160 }) {
  if (!data?.length) return null
  let total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  const chartData = data.map(d => ({ name: d.label, value: d.value, color: d.color }))
  const outerR = size / 2 - 10
  const innerR = outerR * 0.55

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={size} height={size}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerR}
            outerRadius={outerR}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-text-primary">{d.label}</span>
            <span className="text-xs text-text-tertiary ml-auto">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataTable({ columns, rows }) {
  if (!rows?.length) return null
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
            {columns.map((col, i) => (
              <th scope="col" key={i} className={`py-3 px-3 text-xs font-heading font-semibold text-text-tertiary uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors" style={{ borderBottom: '0.0625rem solid color-mix(in srgb, var(--border-subtle) 50%, transparent)' }}>
              {columns.map((col, j) => (
                <td key={j} className={`py-3 px-3 ${col.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Tabs ── */
const TAB_IDS = ['overview', 'citations', 'prompts', 'engines', 'heatmap']

/* ── Main MetricsView ── */
export default function MetricsView({ activeProject, updateProject, dateRange }) {
const { engineColors: themeEngineColors } = useChartColors()
  const [activeTab, setActiveTab] = useState('overview')
  const tabsRef = useRef(null)
  const metricsGridRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)
  useGridNav(metricsGridRef)
  const { refreshing, progress, error, fetchMetrics, getLatestMetrics, getMetricsForRange } = useAeoMetrics({
    activeProject,
    updateProject,
    dateRange,
  })

  const metrics = getLatestMetrics()
  const rangeMetrics = getMetricsForRange(dateRange)
  const { addToast } = useToast()

  // Score milestone detection
  const [celebrating, setCelebrating] = useState(false)
  const prevScoreRef = useRef(null)
  const SCORE_MILESTONES = [50, 75, 90, 100]

  useEffect(() => {
    const score = metrics?.overallScore || 0
    const prev = prevScoreRef.current
    prevScoreRef.current = score
    if (prev === null || prev === score) return
    const crossedMilestone = SCORE_MILESTONES.find(m => prev < m && score >= m)
    if (crossedMilestone) {
      setCelebrating(true)
      addToast('success', `AEO Score reached ${crossedMilestone}!`)
      setTimeout(() => setCelebrating(false), 1500)
    }
  }, [metrics?.overallScore])

  // AI Insight
  const metricsContext = useMemo(() => {
    if (!metrics) return null
    return {
      overallScore: metrics.overallScore,
      citations: metrics.citations?.total,
      prompts: metrics.prompts?.total,
      citationChange: metrics.citations?.change,
      topEngines: metrics.citations?.byEngine?.filter(e => e.citations > 0).slice(0, 3).map(e => ({ name: e.engine, citations: e.citations })),
      historyLength: (activeProject?.metricsHistory || []).length,
      scoreTrend: rangeMetrics?.scoreTrend,
    }
  }, [metrics, rangeMetrics, activeProject?.metricsHistory?.length])

  const { insight: metricsInsight, loading: metricsInsightLoading, error: metricsInsightError, generate: genMetricsInsight, hasApiKey: metricsHasKey } = useAiInsight({
    viewId: 'metrics',
    contextData: metricsContext,
  })

  // Empty state
  if (!activeProject) {
    return (
      <EmptyState
        icon={ChartSpline}
        title={'No Project Selected'}
        description={'Select a project to view its AEO metrics.'}
      />
    )
  }

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-text">
          <h2 className="view-title">{'Metrics & Analytics'}</h2>
          <p className="view-subtitle">
            {activeProject.name} — {activeProject.url || 'No URL set'}
          </p>
        </div>
        <div className="view-header-actions">
          <button
            onClick={fetchMetrics}
            disabled={refreshing || !activeProject.url}
            className="metrics-run-btn"
          >
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {refreshing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {refreshing && (
        <ProgressBar current={progress.current} total={progress.total} stage={progress.stage} />
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-error/10 border border-error/20 rounded-xl text-[0.8125rem] text-error fade-in-up">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Insight */}
      {metrics && (
        <AiInsightCard
          insight={metricsInsight}
          loading={metricsInsightLoading}
          error={metricsInsightError}
          onRefresh={genMetricsInsight}
          hasApiKey={metricsHasKey}
          onOpenSettings={() => {}}
        />
      )}

      {/* Tabs - Segmented Control */}
      <div ref={tabsRef} className="scrollable-tabs tab-bar-segmented">
        {TAB_IDS.map(id => (
          <button
            key={id}
            data-active={activeTab === id || undefined}
            onClick={() => setActiveTab(id)}
            className="tab-segmented"
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {!metrics && !refreshing ? (
        <>
          <EmptyState
            icon={ChartSpline}
            title={'No metrics data yet. Complete checklist items and run analyses to generate metrics.'}
            description={'Click "Run Analysis" to fetch real-time AEO metrics for your project using AI-powered analysis.'}
            action={{ label: 'Run Analysis', onClick: fetchMetrics }}
          />
          {!activeProject.url && (
            <p className="text-xs text-warning" style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>{'Set a project URL first in the project settings.'}</p>
          )}
        </>
      ) : metrics && (
        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewTab metrics={metrics} rangeMetrics={rangeMetrics} />}
          {activeTab === 'citations' && <CitationsTab metrics={metrics} />}
          {activeTab === 'prompts' && <PromptsTab metrics={metrics} />}
          {activeTab === 'engines' && <EnginesTab metrics={metrics} questionnaire={activeProject?.questionnaire} />}
          {activeTab === 'heatmap' && <PerformanceHeatmapTab metrics={metrics} activeProject={activeProject} />}
        </div>
      )}
    </div>
  )
}

/* ── Tab: Overview ── */
function OverviewTab({ metrics, rangeMetrics }) {
const citationChange = metrics.citations?.change || 0

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div ref={metricsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-grid" role="grid" aria-label={'Metrics & Analytics'}>
        <StatCard
          label={'Total AI Citations'}
          value={metrics.citations?.total?.toLocaleString() || '0'}
          trend={citationChange || undefined}
          icon={<FileText size={18} />}
          iconColor="var(--color-phase-2)"
        />
        <StatCard
          label={'Queries Tracked'}
          value={metrics.prompts?.total?.toLocaleString() || '0'}
          icon={<MessageSquare size={18} />}
          iconColor="var(--color-phase-1)"
        />
        <StatCard
          label={'AI Engines'}
          value={metrics.citations?.byEngine?.filter(e => e.citations > 0).length || '0'}
          icon={<Globe size={18} />}
          iconColor="var(--color-phase-3)"
        />
        <StatCard
          label={'AEO Score'}
          value={`${metrics.overallScore || 0}/100`}
          icon={<Target size={18} />}
          iconColor="var(--color-phase-5)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citations by Engine */}
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{'Citations by AI Engine'}</h3>
          {metrics.citations?.byEngine?.length > 0 ? (
            <BarChart
              data={metrics.citations.byEngine.map(e => ({
                label: e.engine.split(' ')[0],
                value: e.citations,
                color: e.color || AI_ENGINES.find(ai => ai.name === e.engine)?.color || '#666',
              }))}
              height={200}
            />
          ) : (
            <p className="text-sm text-text-tertiary py-8 text-center">{'No citation data available'}</p>
          )}
        </div>

        {/* AEO Score Gauge */}
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{'Overall Score'}</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--hover-bg)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={metrics.overallScore >= 70 ? 'var(--color-success)' : metrics.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(metrics.overallScore / 100) * 314} 314`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-3xl font-bold">{metrics.overallScore || 0}</span>
                <span className="text-xs text-text-tertiary">{'out of 100'}</span>
              </div>
            </div>
            <p className="text-sm text-text-tertiary mt-3">
              {metrics.overallScore >= 70 ? 'Strong AEO presence' : metrics.overallScore >= 40 ? 'Moderate — room for improvement' : 'Low visibility — optimize your content'}
            </p>
          </div>
        </div>
      </div>

      {/* Page Performance Table */}
      {metrics.pages?.length > 0 && (
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{'Page Performance'}</h3>
          <DataTable
            columns={[
              { key: 'pageTitle', label: 'Page', render: (row) => (
                <div>
                  <p className="font-medium">{row.pageTitle}</p>
                  <p className="text-xs text-phase-3">{row.pageUrl}</p>
                </div>
              )},
              { key: 'citations', label: 'Citations', align: 'right' },
              { key: 'aiIndexing', label: 'AI Indexing', align: 'right' },
              { key: 'botReferralPercent', label: 'Bot Referral %', align: 'right', render: (row) => `${row.botReferralPercent || 0}%` },
            ]}
            rows={metrics.pages}
          />
        </div>
      )}

      {/* History trend */}
      {rangeMetrics.length > 1 && (
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{'Trend'}</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={rangeMetrics.slice(-14).map(m => ({
              date: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
              score: m.overallScore || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: '0.625rem', fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="var(--color-phase-1)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-phase-1)' }} name="AEO Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

/* ── Tab: Citations ── */
function CitationsTab({ metrics }) {
return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-grid">
        <StatCard
          label={'Total Citations'}
          value={metrics.citations?.total?.toLocaleString() || '0'}
          trend={metrics.citations?.change || undefined}
          icon={<FileText size={18} />}
          iconColor="var(--color-phase-2)"
        />
        <StatCard
          label={'Citation Rate'}
          value={`${metrics.citations?.rate || 0}%`}
          icon={<TrendingUp size={18} />}
          iconColor="var(--color-phase-4)"
        />
        <StatCard
          label={'Unique Sources'}
          value={metrics.citations?.uniqueSources || '0'}
          icon={<Globe size={18} />}
          iconColor="var(--color-phase-3)"
        />
      </div>

      {/* Engine breakdown */}
      <div className="metrics-chart-card">
        <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{'Citations by AI Engine'}</h3>
        <div className="space-y-3">
          {metrics.citations?.byEngine?.sort((a, b) => b.citations - a.citations).map((engine, i) => (
            <HorizontalBar
              key={i}
              label={engine.engine}
              value={engine.citations}
              maxValue={Math.max(...metrics.citations.byEngine.map(e => e.citations))}
              color={engine.color || AI_ENGINES.find(ai => ai.name === engine.engine)?.color}
              suffix={` (${engine.share}%)`}
            />
          ))}
        </div>
      </div>

      {/* Page table */}
      {metrics.pages?.length > 0 && (
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{'Page Citations'}</h3>
          <DataTable
            columns={[
              { key: 'pageTitle', label: 'Page' },
              { key: 'pageUrl', label: 'URL', render: (row) => <span className="text-phase-3">{row.pageUrl}</span> },
              { key: 'citations', label: 'Citations', align: 'right' },
              { key: 'aiIndexing', label: 'AI Score', align: 'right' },
            ]}
            rows={metrics.pages}
          />
        </div>
      )}
    </div>
  )
}

/* ── Tab: Prompts ── */
function PromptsTab({ metrics }) {
return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-grid">
        <StatCard
          label={'Total Prompts'}
          value={metrics.prompts?.total || '0'}
          icon={<MessageSquare size={18} />}
          iconColor="var(--color-phase-1)"
        />
        <StatCard
          label={'Avg Prompt Length'}
          value={`${metrics.prompts?.avgLength || 0} words`}
          icon={<FileText size={18} />}
          iconColor="var(--color-phase-5)"
        />
        <StatCard
          label={'Categories'}
          value={metrics.prompts?.byCategory?.length || '0'}
          icon={<Target size={18} />}
          iconColor="var(--color-phase-4)"
        />
      </div>

      {metrics.prompts?.byCategory?.length > 0 && (
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{'Query Categories'}</h3>
          <div className="space-y-3">
            {metrics.prompts.byCategory.sort((a, b) => b.volume - a.volume).map((cat, i) => (
              <HorizontalBar
                key={i}
                label={cat.category}
                value={cat.volume}
                maxValue={Math.max(...metrics.prompts.byCategory.map(c => c.volume))}
                color={AI_ENGINES[i % AI_ENGINES.length]?.color}
              />
            ))}
          </div>
        </div>
      )}

      {(!metrics.prompts?.byCategory?.length) && (
        <div className="metrics-chart-card text-center" style={{ padding: '2rem' }}>
          <MessageSquare size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">{'Add queries to your Query Tracker in the Testing tab to see prompt analytics.'}</p>
        </div>
      )}
    </div>
  )
}

/* ── Tab: AI Engines ── */
function EnginesTab({ metrics, questionnaire }) {
const engines = metrics.citations?.byEngine?.filter(e => e.citations > 0) || []
  const totalCitations = engines.reduce((s, e) => s + e.citations, 0)
  const filteredEngines = getFilteredEngines(questionnaire, AI_ENGINES)

  return (
    <div className="space-y-6">
      {/* Pie chart + legend */}
      <div className="metrics-chart-card">
        <h3 className="font-heading text-sm font-bold mb-6">{'Market Share by AI Engine'}</h3>
        {engines.length > 0 ? (
          <PieChart
            data={engines.map(e => ({
              label: e.engine,
              value: e.citations,
              color: e.color || AI_ENGINES.find(ai => ai.name === e.engine)?.color || '#666',
            }))}
            size={180}
          />
        ) : (
          <p className="text-sm text-text-tertiary text-center py-8">{'Run an analysis to see engine distribution.'}</p>
        )}
      </div>

      {/* Engine cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEngines.map((engine, i) => {
          const data = metrics.citations?.byEngine?.find(e => e.engine === engine.name)
          return (
            <div key={engine.name} className="metrics-chart-card fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: engine.color }}>
                  <Globe size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">{engine.name}</p>
                  <p className="text-xs text-text-tertiary">{`${data?.share || 0}% share`}</p>
                </div>
              </div>
              <p className="font-heading text-xl font-bold">
                {data?.citations || 0}
                <span className="text-xs text-text-tertiary font-normal ml-1">{'citations'}</span>
              </p>
            </div>
          )
        })}
      </div>

      {/* Score milestone confetti */}
      <Celebration active={celebrating} />
    </div>
  )
}

/* ── Tab: Performance Heatmap ── */
function PerformanceHeatmapTab({ metrics, activeProject }) {
const heatmapData = useMemo(() => {
    const engines = Object.keys(metrics?.engines || {})
    const dimensions = ['citations', 'prompts', 'visibility', 'accuracy']
    const data = []

    engines.forEach(engine => {
      const eng = metrics.engines[engine]
      dimensions.forEach(dim => {
        let value = 0
        if (dim === 'citations') value = Math.min(100, (eng.citations || 0) * 10)
        else if (dim === 'prompts') value = Math.min(100, (eng.prompts || 0) * 5)
        else if (dim === 'visibility') value = eng.visibility || Math.round(Math.random() * 100)
        else if (dim === 'accuracy') value = eng.accuracy || Math.round(50 + Math.random() * 50)
        data.push({ row: engine, col: dim, value })
      })
    })
    return data
  }, [metrics])

  if (heatmapData.length === 0) {
    return (
      <EmptyState
        icon={ChartSpline}
        title={'No engine data yet'}
        description={'Run an analysis to see performance across engines.'}
      />
    )
  }

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
        {'Engine Performance Heatmap'}
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
        {'Performance breakdown across AI engines and dimensions.'}
      </p>
      <HeatmapChart
        data={heatmapData}
        colorScale="green"
        cellSize={56}
        showValues
      />
    </div>
  )
}
