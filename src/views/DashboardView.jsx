import { useState } from 'react'
import { Plus, ArrowRight, CheckSquare, Zap, FlaskConical, TrendingUp, TrendingDown, Minus, FileText, MessageSquare, Globe, Target, BarChart3 } from 'lucide-react'
import {
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar,
} from 'recharts'

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'citations', label: 'Citations' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'chatbots', label: 'Chatbots' },
]

const ENGINE_COLORS = ['#FF6B35', '#7B2FBE', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
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

  const getProjectProgress = (project) => {
    if (!phases) return { total: 0, checked: 0, percent: 0 }
    let total = 0
    phases.forEach(phase => {
      phase.categories.forEach(cat => {
        total += cat.items.length
      })
    })
    const checked = Object.values(project.checked || {}).filter(Boolean).length
    return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }

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

  const totalProgress = activeProject ? getProjectProgress(activeProject) : { total: 0, checked: 0, percent: 0 }

  // Metrics data from project history
  const metricsHistory = activeProject?.metricsHistory || []
  const latestMetrics = metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : null
  const prevMetrics = metricsHistory.length > 1 ? metricsHistory[metricsHistory.length - 2] : null

  // Compute trends
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

  // Empty state helper
  const EmptyState = ({ message }) => (
    <div className="card" style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <BarChart3 size={28} style={{ color: 'var(--text-disabled)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center' }}>{message}</p>
      <button onClick={() => setActiveView('metrics')} className="btn-primary" style={{ padding: '7px 16px', fontSize: 12, marginTop: 4 }}>
        Run Metrics Analysis
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome back{userName ? `, ${userName}` : ''}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
          Here's an overview of your AEO projects and progress.
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, borderRadius: 10, padding: 4, background: 'color-mix(in srgb, var(--hover-bg) 50%, transparent)' }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 500,
              borderRadius: 8, border: 'none', cursor: 'pointer',
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

          {/* Charts Row */}
          {latestMetrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
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
                      <Line type="monotone" dataKey="Citations" stroke="#7B2FBE" strokeWidth={2} dot={{ r: 3, fill: '#7B2FBE' }} />
                      <Line type="monotone" dataKey="Prompts" stroke="#FF6B35" strokeWidth={2} dot={{ r: 3, fill: '#FF6B35' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    Run multiple analyses to see trends
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  Bot Type Distribution
                </h3>
                {engineData.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie data={engineData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {engineData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {engineData.map((entry, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{entry.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
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

          {/* Quick Actions */}
          <div className="quick-actions-grid">
            <button className="quick-action-card" onClick={() => setActiveView('checklist')}>
              <CheckSquare size={24} className="text-phase-3" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Open Checklist</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Track your AEO tasks</p>
            </button>
            <button className="quick-action-card" onClick={() => setActiveView('analyzer')}>
              <Zap size={24} className="text-phase-1" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Run Analyzer</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Scan your site for AEO</p>
            </button>
            <button className="quick-action-card" onClick={() => setActiveView('testing')}>
              <FlaskConical size={24} className="text-phase-5" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Start Testing</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Test across AI platforms</p>
            </button>
          </div>
        </>
      )}

      {/* ═══ CITATIONS TAB ═══ */}
      {subTab === 'citations' && (
        <>
          {latestMetrics ? (
            <>
              {/* Citation stat cards */}
              <div className="stats-grid-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <StatCard label="Total Citations" value={totalCitations.toLocaleString()} trend={citationsTrend} icon={<FileText size={18} />} iconColor="var(--color-phase-2)" />
                <StatCard label="Active AI Engines" value={activeEngines} trend={null} icon={<Globe size={18} />} iconColor="var(--color-phase-3)" />
                <StatCard label="AEO Score" value={`${aeoScore}/100`} trend={scoreTrend} icon={<Target size={18} />} iconColor="var(--color-phase-5)" />
              </div>

              {/* Full-width citations line chart */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  Citations Over Time
                </h3>
                {citationsChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={citationsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Citations" stroke="#7B2FBE" strokeWidth={2.5} dot={{ r: 4, fill: '#7B2FBE' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    Run multiple analyses to see citation trends
                  </div>
                )}
              </div>

              {/* Engine breakdown table */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  Citations by AI Engine
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Engine</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Citations</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', width: '40%' }}>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allEngineData.map((engine, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: engine.color, flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{engine.name}</span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{engine.citations.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                              <div style={{ flex: 1, maxWidth: 120, height: 6, borderRadius: 3, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 3, background: engine.color, width: `${totalCitations > 0 ? (engine.citations / totalCitations) * 100 : 0}%` }} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 36, fontFamily: 'var(--font-mono)' }}>
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
              {/* Prompts stat cards */}
              <div className="stats-grid-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatCard label="Total Prompts" value={totalPrompts.toLocaleString()} trend={promptsTrend} icon={<MessageSquare size={18} />} iconColor="var(--color-phase-1)" />
                <StatCard label="AEO Score" value={`${aeoScore}/100`} trend={scoreTrend} icon={<Target size={18} />} iconColor="var(--color-phase-5)" />
              </div>

              {/* Full-width prompts line chart */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  Prompts Over Time
                </h3>
                {promptsChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={promptsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Prompts" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 4, fill: '#FF6B35' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    Run multiple analyses to see prompt trends
                  </div>
                )}
              </div>

              {/* Top prompts / categories */}
              {topPrompts.length > 0 && (
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                    Top Prompt Categories
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {topPrompts.slice(0, 10).map((prompt, i) => {
                      const label = typeof prompt === 'string' ? prompt : (prompt.category || prompt.text || prompt.name || 'Unknown')
                      const count = typeof prompt === 'object' ? (prompt.count || prompt.total || 0) : 0
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < topPrompts.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-disabled)', minWidth: 24, fontFamily: 'var(--font-mono)' }}>#{i + 1}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{label}</span>
                          {count > 0 && (
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{count.toLocaleString()}</span>
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
              {/* Chatbot stat cards */}
              <div className="stats-grid-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatCard label="Active AI Engines" value={activeEngines} trend={null} icon={<Globe size={18} />} iconColor="var(--color-phase-3)" />
                <StatCard label="Total Citations" value={totalCitations.toLocaleString()} trend={citationsTrend} icon={<FileText size={18} />} iconColor="var(--color-phase-2)" />
              </div>

              {/* Full-width pie chart */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  AI Engine Distribution
                </h3>
                {engineData.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 32, justifyContent: 'center' }}>
                    <ResponsiveContainer width="45%" height={260}>
                      <PieChart>
                        <Pie data={engineData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                          {engineData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {engineData.map((entry, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: entry.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{entry.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    Run analysis to see engine distribution
                  </div>
                )}
              </div>

              {/* Engine details table */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  Engine Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {allEngineData.map((engine, i) => (
                    <div key={i} className="card" style={{ padding: 14, border: engine.citations > 0 ? `1px solid ${engine.color}30` : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: engine.color }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{engine.name}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: engine.citations > 0 ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                        {engine.citations.toLocaleString()}
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
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

      {/* No project empty state (shows on all tabs) */}
      {!activeProject && projects.length === 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <Zap size={32} className="text-phase-1" style={{ marginBottom: 16 }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No projects yet</h3>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20, textAlign: 'center', maxWidth: 300 }}>
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

function StatCard({ label, value, trend, icon, iconColor }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: 9, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: iconColor + '18', color: iconColor,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)' }}>
        {value}
      </div>
      {trend !== null && trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          {trend > 0 ? (
            <TrendingUp size={12} style={{ color: 'var(--color-success)' }} />
          ) : trend < 0 ? (
            <TrendingDown size={12} style={{ color: 'var(--color-error)' }} />
          ) : (
            <Minus size={12} style={{ color: 'var(--text-tertiary)' }} />
          )}
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: trend > 0 ? 'var(--color-success)' : trend < 0 ? 'var(--color-error)' : 'var(--text-tertiary)',
          }}>
            {trend > 0 ? '+' : ''}{trend}% vs last period
          </span>
        </div>
      )}
    </div>
  )
}
