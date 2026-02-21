import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText, MessageSquare, Globe, Target, TrendingUp, TrendingDown, Minus,
  Loader2, AlertCircle, RefreshCw, ArrowUp, ArrowDown, BarChart3
} from 'lucide-react'
import {
  BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useAeoMetrics, AI_ENGINES } from '../hooks/useAeoMetrics'
import { useChartColors } from '../utils/chartColors'
import ProgressBar from '../components/ProgressBar'
import { getFilteredEngines } from '../utils/getRecommendations'

/* ── Reusable Components ── */

function MetricCard({ title, value, change, changeLabel, icon, iconBg, iconColor, delay = 0 }) {
  return (
    <div
      className="rounded-xl p-[1.125rem] transition-all duration-200 fade-in-up"
      style={{ backgroundColor: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.6875rem] text-text-tertiary uppercase tracking-[0.0313rem]">{title}</span>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="font-mono text-[1.75rem] font-bold leading-none text-text-primary">{value}</p>
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1 mt-2">
          {change > 0 ? (
            <ArrowUp size={12} className="text-success" />
          ) : change < 0 ? (
            <ArrowDown size={12} className="text-error" />
          ) : (
            <Minus size={12} className="text-text-tertiary" />
          )}
          <span className={`text-[0.6875rem] ${change > 0 ? 'text-success' : change < 0 ? 'text-error' : 'text-text-tertiary'}`}>
            {Math.abs(change)}% {changeLabel || 'vs last period'}
          </span>
        </div>
      )}
    </div>
  )
}

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
const TAB_IDS = ['overview', 'citations', 'prompts', 'engines']

/* ── Main MetricsView ── */
export default function MetricsView({ activeProject, updateProject, dateRange }) {
  const { t } = useTranslation('app')
  const { engineColors: themeEngineColors } = useChartColors()
  const [activeTab, setActiveTab] = useState('overview')
  const { refreshing, progress, error, fetchMetrics, getLatestMetrics, getMetricsForRange } = useAeoMetrics({
    activeProject,
    updateProject,
    dateRange,
  })

  const metrics = getLatestMetrics()
  const rangeMetrics = getMetricsForRange(dateRange)

  // Empty state
  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24 fade-in-up">
        <BarChart3 size={48} className="text-text-tertiary mb-4" />
        <h3 className="font-heading text-lg font-bold mb-2">{t('metrics.noProjectSelected')}</h3>
        <p className="text-sm text-text-tertiary">{t('metrics.noProjectSelectedDesc')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="metrics-header">
        <div>
          <h2 className="view-title">{t('metrics.title')}</h2>
          <p className="view-subtitle">
            {activeProject.name} — {activeProject.url || t('metrics.noUrlSet')}
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={refreshing || !activeProject.url}
          className="metrics-run-btn"
        >
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {refreshing ? t('metrics.analyzing') : t('metrics.runAnalysis')}
        </button>
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

      {/* Tabs - Segmented Control */}
      <div className="metrics-tabs">
        {TAB_IDS.map(id => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`metrics-tab ${activeTab === id ? 'active' : ''}`}
          >
            {t(`metrics.tabs.${id}`)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {!metrics && !refreshing ? (
        <div className="metrics-empty-card fade-in-up">
          <div className="metrics-empty-icon">
            <BarChart3 size={24} className="text-text-tertiary" />
          </div>
          <h3 className="font-heading text-base font-bold mb-2">{t('metrics.noData')}</h3>
          <p className="text-sm text-text-tertiary mb-4 text-center max-w-sm">
            {t('metrics.clickRunAnalysis')}
          </p>
          {!activeProject.url && (
            <p className="text-xs text-warning">{t('metrics.setUrlFirst')}</p>
          )}
          <button
            onClick={fetchMetrics}
            disabled={refreshing || !activeProject.url}
            className="metrics-run-btn mt-2"
          >
            <RefreshCw size={14} />
            {t('metrics.runAnalysis')}
          </button>
        </div>
      ) : metrics && (
        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewTab metrics={metrics} rangeMetrics={rangeMetrics} />}
          {activeTab === 'citations' && <CitationsTab metrics={metrics} />}
          {activeTab === 'prompts' && <PromptsTab metrics={metrics} />}
          {activeTab === 'engines' && <EnginesTab metrics={metrics} questionnaire={activeProject?.questionnaire} />}
        </div>
      )}
    </div>
  )
}

/* ── Tab: Overview ── */
function OverviewTab({ metrics, rangeMetrics }) {
  const { t } = useTranslation('app')
  const citationChange = metrics.citations?.change || 0

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('metrics.totalAiCitations')}
          value={metrics.citations?.total?.toLocaleString() || '0'}
          change={citationChange}
          changeLabel={t('metrics.vsLastPeriod')}
          icon={<FileText size={18} className="text-phase-2" />}
          iconBg="bg-phase-2/15"
          delay={0}
        />
        <MetricCard
          title={t('metrics.queriesTracked')}
          value={metrics.prompts?.total?.toLocaleString() || '0'}
          icon={<MessageSquare size={18} className="text-phase-1" />}
          iconBg="bg-phase-1/15"
          delay={80}
        />
        <MetricCard
          title={t('metrics.aiEnginesLabel')}
          value={metrics.citations?.byEngine?.filter(e => e.citations > 0).length || '0'}
          icon={<Globe size={18} className="text-phase-3" />}
          iconBg="bg-phase-3/15"
          delay={160}
        />
        <MetricCard
          title={t('metrics.aeoScoreLabel')}
          value={`${metrics.overallScore || 0}/100`}
          icon={<Target size={18} className="text-phase-5" />}
          iconBg="bg-phase-5/15"
          delay={240}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citations by Engine */}
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{t('metrics.citationsByEngine')}</h3>
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
            <p className="text-sm text-text-tertiary py-8 text-center">{t('metrics.noCitationData')}</p>
          )}
        </div>

        {/* AEO Score Gauge */}
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{t('metrics.overallScore')}</h3>
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
                <span className="text-xs text-text-tertiary">{t('metrics.outOf100')}</span>
              </div>
            </div>
            <p className="text-sm text-text-tertiary mt-3">
              {metrics.overallScore >= 70 ? t('metrics.scoreStrong') : metrics.overallScore >= 40 ? t('metrics.scoreModerate') : t('metrics.scoreLow')}
            </p>
          </div>
        </div>
      </div>

      {/* Page Performance Table */}
      {metrics.pages?.length > 0 && (
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{t('metrics.pagePerformance')}</h3>
          <DataTable
            columns={[
              { key: 'pageTitle', label: t('metrics.colPage'), render: (row) => (
                <div>
                  <p className="font-medium">{row.pageTitle}</p>
                  <p className="text-xs text-phase-3">{row.pageUrl}</p>
                </div>
              )},
              { key: 'citations', label: t('metrics.colCitations'), align: 'right' },
              { key: 'aiIndexing', label: t('metrics.colAiIndexing'), align: 'right' },
              { key: 'botReferralPercent', label: t('metrics.colBotReferral'), align: 'right', render: (row) => `${row.botReferralPercent || 0}%` },
            ]}
            rows={metrics.pages}
          />
        </div>
      )}

      {/* History trend */}
      {rangeMetrics.length > 1 && (
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{t('metrics.trend')}</h3>
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
  const { t } = useTranslation('app')
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title={t('metrics.totalCitationsLabel')}
          value={metrics.citations?.total?.toLocaleString() || '0'}
          change={metrics.citations?.change}
          icon={<FileText size={18} className="text-phase-2" />}
          iconBg="bg-phase-2/15"
        />
        <MetricCard
          title={t('metrics.citationRateLabel')}
          value={`${metrics.citations?.rate || 0}%`}
          icon={<TrendingUp size={18} className="text-phase-4" />}
          iconBg="bg-phase-4/15"
          delay={80}
        />
        <MetricCard
          title={t('metrics.uniqueSources')}
          value={metrics.citations?.uniqueSources || '0'}
          icon={<Globe size={18} className="text-phase-3" />}
          iconBg="bg-phase-3/15"
          delay={160}
        />
      </div>

      {/* Engine breakdown */}
      <div className="metrics-chart-card">
        <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{t('metrics.citationsByEngine')}</h3>
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
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{t('metrics.pageCitations')}</h3>
          <DataTable
            columns={[
              { key: 'pageTitle', label: t('metrics.colPage') },
              { key: 'pageUrl', label: t('metrics.colUrl'), render: (row) => <span className="text-phase-3">{row.pageUrl}</span> },
              { key: 'citations', label: t('metrics.colCitations'), align: 'right' },
              { key: 'aiIndexing', label: t('metrics.colAiScore'), align: 'right' },
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
  const { t } = useTranslation('app')
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title={t('metrics.totalPrompts')}
          value={metrics.prompts?.total || '0'}
          icon={<MessageSquare size={18} className="text-phase-1" />}
          iconBg="bg-phase-1/15"
        />
        <MetricCard
          title={t('metrics.avgPromptLength')}
          value={t('metrics.wordsCount', { count: metrics.prompts?.avgLength || 0 })}
          icon={<FileText size={18} className="text-phase-5" />}
          iconBg="bg-phase-5/15"
          delay={80}
        />
        <MetricCard
          title={t('metrics.categories')}
          value={metrics.prompts?.byCategory?.length || '0'}
          icon={<Target size={18} className="text-phase-4" />}
          iconBg="bg-phase-4/15"
          delay={160}
        />
      </div>

      {metrics.prompts?.byCategory?.length > 0 && (
        <div className="metrics-chart-card">
          <h3 className="font-heading text-[0.8125rem] font-bold mb-4 text-text-primary">{t('metrics.queryCategories')}</h3>
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
          <p className="text-sm text-text-tertiary">{t('metrics.addQueriesToSee')}</p>
        </div>
      )}
    </div>
  )
}

/* ── Tab: AI Engines ── */
function EnginesTab({ metrics, questionnaire }) {
  const { t } = useTranslation('app')
  const engines = metrics.citations?.byEngine?.filter(e => e.citations > 0) || []
  const totalCitations = engines.reduce((s, e) => s + e.citations, 0)
  const filteredEngines = getFilteredEngines(questionnaire, AI_ENGINES)

  return (
    <div className="space-y-6">
      {/* Pie chart + legend */}
      <div className="metrics-chart-card">
        <h3 className="font-heading text-sm font-bold mb-6">{t('metrics.marketShareByEngine')}</h3>
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
          <p className="text-sm text-text-tertiary text-center py-8">{t('metrics.runForDistribution')}</p>
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
                  <p className="text-xs text-text-tertiary">{t('metrics.sharePercent', { value: data?.share || 0 })}</p>
                </div>
              </div>
              <p className="font-heading text-xl font-bold">
                {data?.citations || 0}
                <span className="text-xs text-text-tertiary font-normal ml-1">{t('metrics.citationsLabel')}</span>
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
