import { useState } from 'react'
import { Plus, Zap, FileText, MessageSquare, Globe, Target, BarChart3 } from 'lucide-react'
import { getSmartRecommendations } from '../utils/getRecommendations'
import ActivityTimeline from '../components/ActivityTimeline'
import {
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { PHASE_COLOR_ARRAY, PHASE_COLORS } from '../utils/chartColors'
import StatCard from './dashboard/StatCard'
import PhaseDonut from './dashboard/PhaseDonut'
import RecommendationsPanel from './dashboard/RecommendationsPanel'
import QuickActions from './dashboard/QuickActions'
import AnalyticsPanel from './dashboard/AnalyticsPanel'

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'citations', label: 'Citations' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'chatbots', label: 'Chatbots' },
]

const ENGINE_COLORS = PHASE_COLOR_ARRAY

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
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
}

export default function DashboardView({ projects, activeProject, setActiveProjectId, setActiveView, onNewProject, phases, userName }) {
  const [subTab, setSubTab] = useState('overview')

  const getPhaseProgress = (phase) => {
    if (!activeProject) return { total: 0, checked: 0, percent: 0 }
    let total = 0, checked = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => {
        total++
        if (activeProject.checked?.[item.id]) checked++
      })
    })
    return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }

  // Metrics data from project history
  const metricsHistory = activeProject?.metricsHistory || []
  const latestMetrics = metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : null
  const prevMetrics = metricsHistory.length > 1 ? metricsHistory[metricsHistory.length - 2] : null

  const calcTrend = (curr, prev) => {
    if (!curr || !prev || prev === 0) return 0
    return Math.round(((curr - prev) / prev) * 100 * 10) / 10
  }

  const totalCitations = latestMetrics?.citations?.total || 0
  const totalPrompts = latestMetrics?.prompts?.total || 0
  const activeEngines = latestMetrics?.citations?.byEngine?.filter(e => e.citations > 0).length || 0
  const aeoScore = latestMetrics?.overallScore || 0

  const citationsTrend = calcTrend(totalCitations, prevMetrics?.citations?.total)
  const promptsTrend = calcTrend(totalPrompts, prevMetrics?.prompts?.total)
  const scoreTrend = calcTrend(aeoScore, prevMetrics?.overallScore)

  // Chart data: last 14 snapshots
  const chartData = metricsHistory.slice(-14).map(m => ({
    date: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Citations: m.citations?.total || 0,
    Prompts: m.prompts?.total || 0,
  }))

  // Pie data: engine distribution
  const engineData = latestMetrics?.citations?.byEngine?.filter(e => e.citations > 0).map((e, i) => ({
    name: e.engine?.split(' ')[0] || 'Other',
    value: e.citations || 0,
    color: ENGINE_COLORS[i % ENGINE_COLORS.length],
  })) || []

  // All engines (including zero) for detail tables
  const allEngineData = latestMetrics?.citations?.byEngine?.map((e, i) => ({
    name: e.engine || 'Unknown',
    citations: e.citations || 0,
    color: ENGINE_COLORS[i % ENGINE_COLORS.length],
  })) || []

  // Top prompts
  const topPrompts = latestMetrics?.prompts?.topPrompts || latestMetrics?.prompts?.byCategory || []

  // Prompts chart data
  const promptsChartData = metricsHistory.slice(-14).map(m => ({
    date: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Prompts: m.prompts?.total || 0,
  }))

  // Citations-only chart data
  const citationsChartData = metricsHistory.slice(-14).map(m => ({
    date: new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Citations: m.citations?.total || 0,
  }))

  // Smart Recommendations — uses full project state, not just questionnaire
  const recommendations = getSmartRecommendations(activeProject, phases, setActiveView)

  const EmptyState = ({ message }) => (
    <div className="card" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
      <BarChart3 size={28} style={{ color: 'var(--text-disabled)' }} />
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>{message}</p>
      <button onClick={() => setActiveView('metrics')} className="btn-primary" style={{ padding: '0.4375rem 1rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
        Run Metrics Analysis
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome back{userName ? `, ${userName}` : ''}
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
          Here's an overview of your AEO projects and progress.
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderRadius: '0.625rem', padding: '0.25rem', background: 'color-mix(in srgb, var(--hover-bg) 50%, transparent)' }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500,
              borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all 150ms',
              background: subTab === tab.id ? 'var(--bg-card)' : 'transparent',
              color: subTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {subTab === 'overview' && (
        <>
          {/* 4 Stat Cards */}
          <div className="stats-grid-4">
            <StatCard label="Total Citations" value={totalCitations.toLocaleString()} trend={citationsTrend} icon={<FileText size={18} />} iconColor="var(--color-phase-2)" />
            <StatCard label="Total Prompts" value={totalPrompts.toLocaleString()} trend={promptsTrend} icon={<MessageSquare size={18} />} iconColor="var(--color-phase-1)" />
            <StatCard label="Active AI Engines" value={activeEngines} trend={null} icon={<Globe size={18} />} iconColor="var(--color-phase-3)" />
            <StatCard label="AEO Score" value={`${aeoScore}/100`} trend={scoreTrend} icon={<Target size={18} />} iconColor="var(--color-phase-5)" />
          </div>

          {/* Donut Chart — Phase Progress */}
          {activeProject && phases && (
            <PhaseDonut phases={phases} getPhaseProgress={getPhaseProgress} onNavigate={() => setActiveView('checklist')} />
          )}

          {/* Personalized Recommendations */}
          <RecommendationsPanel recommendations={recommendations} />

          {/* Charts Row */}
          {latestMetrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  AI Citations Over Time
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
                    Run multiple analyses to see trends
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Bot Type Distribution
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
                    Run analysis to see distribution
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phase Progress Card */}
          {activeProject && phases && (
            <div className="phase-progress-card">
              <div className="phase-progress-card-header">Phase Progress</div>
              {phases.map(phase => {
                const pp = getPhaseProgress(phase)
                return (
                  <div key={phase.id} className="phase-progress-row" onClick={() => setActiveView('checklist')}>
                    <div className="phase-row-icon" style={{ background: phase.color + '15' }}>{phase.icon}</div>
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
          <div className="dashboard-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.75px', color: 'var(--text-tertiary)',
              marginBottom: '0.75rem',
            }}>
              Recent Activity
            </div>
            <ActivityTimeline activities={activeProject?.activityLog || []} />
          </div>

          <QuickActions setActiveView={setActiveView} />
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
              <div className="stats-grid-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <StatCard label="Total Citations" value={totalCitations.toLocaleString()} trend={citationsTrend} icon={<FileText size={18} />} iconColor="var(--color-phase-2)" />
                <StatCard label="Active AI Engines" value={activeEngines} trend={null} icon={<Globe size={18} />} iconColor="var(--color-phase-3)" />
                <StatCard label="AEO Score" value={`${aeoScore}/100`} trend={scoreTrend} icon={<Target size={18} />} iconColor="var(--color-phase-5)" />
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Citations Over Time
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
                    Run multiple analyses to see citation trends
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Citations by AI Engine
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Engine</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Citations</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', width: '40%' }}>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allEngineData.map((engine, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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
            <EmptyState message="Run a Metrics analysis to see citation data across AI engines." />
          )}
        </>
      )}

      {/* ═══ PROMPTS TAB ═══ */}
      {subTab === 'prompts' && (
        <>
          {latestMetrics ? (
            <>
              <div className="stats-grid-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatCard label="Total Prompts" value={totalPrompts.toLocaleString()} trend={promptsTrend} icon={<MessageSquare size={18} />} iconColor="var(--color-phase-1)" />
                <StatCard label="AEO Score" value={`${aeoScore}/100`} trend={scoreTrend} icon={<Target size={18} />} iconColor="var(--color-phase-5)" />
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Prompts Over Time
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
                    Run multiple analyses to see prompt trends
                  </div>
                )}
              </div>

              {topPrompts.length > 0 && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Top Prompt Categories
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {topPrompts.slice(0, 10).map((prompt, i) => {
                      const label = typeof prompt === 'string' ? prompt : (prompt.category || prompt.text || prompt.name || 'Unknown')
                      const count = typeof prompt === 'object' ? (prompt.count || prompt.total || 0) : 0
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < topPrompts.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
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
            <EmptyState message="Run a Metrics analysis to see prompt data and trends." />
          )}
        </>
      )}

      {/* ═══ CHATBOTS TAB ═══ */}
      {subTab === 'chatbots' && (
        <>
          {latestMetrics ? (
            <>
              <div className="stats-grid-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatCard label="Active AI Engines" value={activeEngines} trend={null} icon={<Globe size={18} />} iconColor="var(--color-phase-3)" />
                <StatCard label="Total Citations" value={totalCitations.toLocaleString()} trend={citationsTrend} icon={<FileText size={18} />} iconColor="var(--color-phase-2)" />
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  AI Engine Distribution
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
                    Run analysis to see engine distribution
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Engine Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12.5rem, 1fr))', gap: '0.75rem' }}>
                  {allEngineData.map((engine, i) => (
                    <div key={i} className="card" style={{ padding: '0.875rem', border: engine.citations > 0 ? `1px solid ${engine.color}30` : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '0.1875rem', background: engine.color }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{engine.name}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: engine.citations > 0 ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                        {engine.citations.toLocaleString()}
                      </div>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                        {engine.citations > 0 ? 'citations found' : 'no citations yet'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <EmptyState message="Run a Metrics analysis to see chatbot and AI engine data." />
          )}
        </>
      )}

      {/* No project empty state */}
      {!activeProject && projects.length === 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <Zap size={32} className="text-phase-1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No projects yet</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem', textAlign: 'center', maxWidth: '18.75rem' }}>
            Create your first project to start tracking AEO progress.
          </p>
          <button onClick={onNewProject} className="btn-primary">
            <Plus size={14} />
            Create Project
          </button>
        </div>
      )}
    </div>
  )
}
