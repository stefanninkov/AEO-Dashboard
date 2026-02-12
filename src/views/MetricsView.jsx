import { useState, useEffect } from 'react'
import {
  FileText, MessageSquare, Globe, Target, TrendingUp, TrendingDown, Minus,
  Loader2, AlertCircle, RefreshCw, ArrowUp, ArrowDown, BarChart3
} from 'lucide-react'
import { useAeoMetrics, AI_ENGINES } from '../hooks/useAeoMetrics'

/* ── Reusable Components ── */

function MetricCard({ title, value, change, changeLabel, icon, iconBg, iconColor, delay = 0 }) {
  return (
    <div
      className="rounded-xl p-[18px] transition-all duration-200 fade-in-up"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-text-tertiary uppercase tracking-[0.5px]">{title}</span>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="font-mono text-[28px] font-bold leading-none text-text-primary">{value}</p>
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1 mt-2">
          {change > 0 ? (
            <ArrowUp size={12} className="text-success" />
          ) : change < 0 ? (
            <ArrowDown size={12} className="text-error" />
          ) : (
            <Minus size={12} className="text-text-tertiary" />
          )}
          <span className={`text-[11px] ${change > 0 ? 'text-success' : change < 0 ? 'text-error' : 'text-text-tertiary'}`}>
            {Math.abs(change)}% {changeLabel || 'vs last period'}
          </span>
        </div>
      )}
    </div>
  )
}

function BarChart({ data, maxValue, height = 200 }) {
  if (!data?.length) return null
  const max = maxValue || Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative flex items-end" style={{ height: height - 24 }}>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.max((item.value / max) * 100, 2)}%`,
                backgroundColor: item.color || 'var(--color-phase-1)',
                animationDelay: `${i * 50}ms`,
              }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
          <span className="text-[10px] text-text-tertiary truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
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

  let cumulative = 0
  const gradientParts = data.map(d => {
    const start = cumulative
    cumulative += (d.value / total) * 360
    return `${d.color} ${start}deg ${cumulative}deg`
  })

  return (
    <div className="flex items-center gap-6">
      <div
        className="rounded-full flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradientParts.join(', ')})`,
        }}
      />
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
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {columns.map((col, i) => (
              <th key={i} className={`py-3 px-3 text-xs font-heading font-semibold text-text-tertiary uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid color-mix(in srgb, var(--border-subtle) 50%, transparent)' }}>
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
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'citations', label: 'Citations' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'engines', label: 'AI Engines' },
]

/* ── Main MetricsView ── */
export default function MetricsView({ activeProject, updateProject, dateRange }) {
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
        <h3 className="font-heading text-lg font-bold mb-2">No Project Selected</h3>
        <p className="text-sm text-text-tertiary">Select a project to view its AEO metrics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-[15px] font-bold tracking-[-0.3px] text-text-primary">AEO Metrics</h2>
          <p className="text-[13px] text-text-tertiary mt-0.5">
            {activeProject.name} — {activeProject.url || 'No URL set'}
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={refreshing || !activeProject.url}
          className="flex items-center gap-2 px-4 py-2 bg-phase-1 text-white rounded-lg text-[13px] font-medium hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {refreshing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Progress */}
      {refreshing && (
        <div className="rounded-xl p-4 fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Loader2 size={14} className="text-phase-1 animate-spin" />
            <span className="text-[13px] font-medium text-text-primary">{progress.stage}</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--hover-bg)' }}>
            <div
              className="h-full bg-phase-1 rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">Step {progress.current} of {progress.total}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-error/10 border border-error/20 rounded-xl text-[13px] text-error fade-in-up">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'color-mix(in srgb, var(--hover-bg) 50%, transparent)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-[13px] font-medium rounded-lg transition-all duration-150 ${
              activeTab === tab.id
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
            style={activeTab === tab.id ? { background: 'var(--bg-card)' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {!metrics && !refreshing ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <BarChart3 size={40} className="text-text-tertiary mb-4" />
          <h3 className="font-heading text-base font-bold mb-2">No Metrics Data Yet</h3>
          <p className="text-sm text-text-tertiary mb-4 text-center max-w-sm">
            Click "Run Analysis" to fetch real-time AEO metrics for your project using AI-powered analysis.
          </p>
          {!activeProject.url && (
            <p className="text-xs text-warning">Set a project URL first in the project settings.</p>
          )}
        </div>
      ) : metrics && (
        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewTab metrics={metrics} rangeMetrics={rangeMetrics} />}
          {activeTab === 'citations' && <CitationsTab metrics={metrics} />}
          {activeTab === 'prompts' && <PromptsTab metrics={metrics} />}
          {activeTab === 'engines' && <EnginesTab metrics={metrics} />}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total AI Citations"
          value={metrics.citations?.total?.toLocaleString() || '0'}
          change={citationChange}
          changeLabel="vs last period"
          icon={<FileText size={18} className="text-phase-2" />}
          iconBg="bg-phase-2/15"
          delay={0}
        />
        <MetricCard
          title="Queries Tracked"
          value={metrics.prompts?.total?.toLocaleString() || '0'}
          icon={<MessageSquare size={18} className="text-phase-1" />}
          iconBg="bg-phase-1/15"
          delay={80}
        />
        <MetricCard
          title="AI Engines"
          value={metrics.citations?.byEngine?.filter(e => e.citations > 0).length || '0'}
          icon={<Globe size={18} className="text-phase-3" />}
          iconBg="bg-phase-3/15"
          delay={160}
        />
        <MetricCard
          title="AEO Score"
          value={`${metrics.overallScore || 0}/100`}
          icon={<Target size={18} className="text-phase-5" />}
          iconBg="bg-phase-5/15"
          delay={240}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citations by Engine */}
        <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-heading text-[13px] font-bold mb-4 text-text-primary">Citations by AI Engine</h3>
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
            <p className="text-sm text-text-tertiary py-8 text-center">No citation data available</p>
          )}
        </div>

        {/* AEO Score Gauge */}
        <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-heading text-[13px] font-bold mb-4 text-text-primary">Overall AEO Score</h3>
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
                <span className="text-xs text-text-tertiary">out of 100</span>
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
        <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-heading text-[13px] font-bold mb-4 text-text-primary">Page Performance</h3>
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
        <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-heading text-[13px] font-bold mb-4 text-text-primary">Score Trend</h3>
          <BarChart
            data={rangeMetrics.slice(-14).map(m => ({
              label: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
              value: m.overallScore || 0,
              color: m.overallScore >= 70 ? 'var(--color-success)' : m.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
            }))}
            height={160}
            maxValue={100}
          />
        </div>
      )}
    </div>
  )
}

/* ── Tab: Citations ── */
function CitationsTab({ metrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Citations"
          value={metrics.citations?.total?.toLocaleString() || '0'}
          change={metrics.citations?.change}
          icon={<FileText size={18} className="text-phase-2" />}
          iconBg="bg-phase-2/15"
        />
        <MetricCard
          title="Citation Rate"
          value={`${metrics.citations?.rate || 0}%`}
          icon={<TrendingUp size={18} className="text-phase-4" />}
          iconBg="bg-phase-4/15"
          delay={80}
        />
        <MetricCard
          title="Unique Sources"
          value={metrics.citations?.uniqueSources || '0'}
          icon={<Globe size={18} className="text-phase-3" />}
          iconBg="bg-phase-3/15"
          delay={160}
        />
      </div>

      {/* Engine breakdown */}
      <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="font-heading text-[13px] font-bold mb-4 text-text-primary">Citations by AI Engine</h3>
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
        <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-heading text-[13px] font-bold mb-4 text-text-primary">Page Citations</h3>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Prompts"
          value={metrics.prompts?.total || '0'}
          icon={<MessageSquare size={18} className="text-phase-1" />}
          iconBg="bg-phase-1/15"
        />
        <MetricCard
          title="Avg Prompt Length"
          value={`${metrics.prompts?.avgLength || 0} words`}
          icon={<FileText size={18} className="text-phase-5" />}
          iconBg="bg-phase-5/15"
          delay={80}
        />
        <MetricCard
          title="Categories"
          value={metrics.prompts?.byCategory?.length || '0'}
          icon={<Target size={18} className="text-phase-4" />}
          iconBg="bg-phase-4/15"
          delay={160}
        />
      </div>

      {metrics.prompts?.byCategory?.length > 0 && (
        <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-heading text-[13px] font-bold mb-4 text-text-primary">Query Categories</h3>
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
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <MessageSquare size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">Add queries to your Query Tracker in the Testing tab to see prompt analytics.</p>
        </div>
      )}
    </div>
  )
}

/* ── Tab: AI Engines ── */
function EnginesTab({ metrics }) {
  const engines = metrics.citations?.byEngine?.filter(e => e.citations > 0) || []
  const totalCitations = engines.reduce((s, e) => s + e.citations, 0)

  return (
    <div className="space-y-6">
      {/* Pie chart + legend */}
      <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="font-heading text-sm font-bold mb-6">Market Share by AI Engine</h3>
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
          <p className="text-sm text-text-tertiary text-center py-8">Run an analysis to see engine distribution.</p>
        )}
      </div>

      {/* Engine cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_ENGINES.map((engine, i) => {
          const data = metrics.citations?.byEngine?.find(e => e.engine === engine.name)
          return (
            <div key={engine.name} className="rounded-xl p-4 shadow-sm fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: engine.color }}>
                  <Globe size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">{engine.name}</p>
                  <p className="text-xs text-text-tertiary">{data?.share || 0}% share</p>
                </div>
              </div>
              <p className="font-heading text-xl font-bold">
                {data?.citations || 0}
                <span className="text-xs text-text-tertiary font-normal ml-1">citations</span>
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
