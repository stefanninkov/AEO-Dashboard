import { useState, useEffect, useRef, useMemo } from 'react'
import {
  PieChart as PieChartIcon, Play, Loader2, AlertTriangle, Clock,
  Settings, ChevronDown, ChevronUp, ExternalLink, Check, X,
  TrendingUp, Share2
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { useCitationShare } from '../../hooks/useCitationShare'
import ProgressBar from '../../components/ProgressBar'
import EmptyState from '../../components/EmptyState'
import { PHASE_COLOR_ARRAY } from '../../utils/chartColors'
import { ENGINE_COLORS } from '../../utils/chartColors'
import logger from '../../utils/logger'

// ─── Interval Config ─────────────────────────────────────────
const INTERVAL_OPTIONS = [
  { value: '1d', label: 'Daily', ms: 24 * 60 * 60 * 1000 },
  { value: '3d', label: 'Every 3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  { value: '7d', label: 'Weekly', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '14d', label: 'Bi-weekly', ms: 14 * 24 * 60 * 60 * 1000 },
  { value: '30d', label: 'Monthly', ms: 30 * 24 * 60 * 60 * 1000 },
]

function getIntervalMs(v) {
  return INTERVAL_OPTIONS.find(o => o.value === v)?.ms || 7 * 24 * 60 * 60 * 1000
}
function getIntervalLabel(v) {
  return INTERVAL_OPTIONS.find(o => o.value === v)?.label || 'Weekly'
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function getNextRunDate(lastRun, interval) {
  if (!lastRun) return 'Now (pending)'
  const next = new Date(lastRun).getTime() + getIntervalMs(interval)
  if (next <= Date.now()) return 'Overdue — will run soon'
  return new Date(next).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const AI_ENGINES = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Bing Copilot']

// ─── Chart Tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
        {d.name}: {d.value}%
      </div>
    </div>
  )
}

function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          {p.name}: <strong style={{ color: 'var(--text-primary)' }}>{p.value}%</strong>
        </div>
      ))}
    </div>
  )
}

export default function CitationShareTab({ activeProject, updateProject, user }) {
  const {
    checking, progress, error,
    runCitationCheck,
  } = useCitationShare({ activeProject, updateProject, user })

  const [showSettings, setShowSettings] = useState(false)
  const [expandedQuery, setExpandedQuery] = useState(null)
  const schedulerRef = useRef(null)

  const settings = activeProject?.settings || {}
  const history = activeProject?.citationShareHistory || []
  const competitors = activeProject?.competitors || []
  const latestSnapshot = history.length > 0 ? history[history.length - 1] : null

  // ── Auto-scheduling ──
  useEffect(() => {
    if (!settings.brandMonitorEnabled) return
    if (!activeProject?.url || competitors.length === 0) return
    if (!localStorage.getItem('anthropic-api-key')) return

    const checkSchedule = () => {
      const lastRun = activeProject.lastCitationShareRun
      const intervalMs = getIntervalMs(settings.brandMonitorInterval || '7d')
      if (!lastRun || Date.now() - new Date(lastRun).getTime() > intervalMs) {
        logger.info('Scheduled citation share check triggered')
        runCitationCheck()
      }
    }

    const initialTimer = setTimeout(checkSchedule, 5000)
    schedulerRef.current = setInterval(checkSchedule, 15 * 60 * 1000)

    return () => {
      clearTimeout(initialTimer)
      if (schedulerRef.current) clearInterval(schedulerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.brandMonitorEnabled, settings.brandMonitorInterval, activeProject?.url, competitors.length, activeProject?.lastCitationShareRun])

  // ── Pie chart data from latest snapshot ──
  const pieData = useMemo(() => {
    if (!latestSnapshot?.brands) return []
    return Object.values(latestSnapshot.brands)
      .filter(b => b.totalMentions > 0)
      .sort((a, b) => b.sharePercent - a.sharePercent)
      .map((b, i) => ({
        name: b.name,
        value: b.sharePercent,
        color: b.isOwn ? '#FF6B35' : PHASE_COLOR_ARRAY[(i + 1) % PHASE_COLOR_ARRAY.length],
        isOwn: b.isOwn,
      }))
  }, [latestSnapshot])

  // ── Trend chart data (share % over time) ──
  const trendData = useMemo(() => {
    if (history.length < 2) return []
    return history.slice(-30).map(snap => {
      const row = {
        date: new Date(snap.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }
      Object.values(snap.brands || {}).forEach(b => {
        row[b.name] = b.sharePercent
      })
      return row
    })
  }, [history])

  const trendLines = useMemo(() => {
    if (!latestSnapshot?.brands) return []
    return Object.values(latestSnapshot.brands).map(b => b.name)
  }, [latestSnapshot])

  // ── Engine breakdown data ──
  const engineBreakdown = useMemo(() => {
    if (!latestSnapshot?.brands) return []
    return Object.values(latestSnapshot.brands)
      .sort((a, b) => b.totalMentions - a.totalMentions)
  }, [latestSnapshot])

  // Settings updater
  const updateSettings = (key, value) => {
    updateProject(activeProject.id, {
      settings: { ...settings, [key]: value },
    })
  }

  if (!activeProject) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── Header Row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={runCitationCheck}
          disabled={checking || competitors.length === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem',
            cursor: checking || competitors.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
            background: 'var(--color-phase-3)', color: '#fff',
            opacity: checking || competitors.length === 0 ? 0.6 : 1,
            transition: 'opacity 150ms',
          }}
        >
          {checking ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
          {checking ? 'Checking...' : 'Run Citation Check'}
        </button>

        {settings.brandMonitorEnabled && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.25rem 0.625rem', borderRadius: '0.625rem',
            fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-heading)',
            background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)',
          }}>
            <Clock size={11} />
            {getIntervalLabel(settings.brandMonitorInterval)} · Next: {getNextRunDate(activeProject.lastCitationShareRun, settings.brandMonitorInterval)}
          </span>
        )}

        {activeProject.lastCitationShareRun && (
          <span style={{
            fontSize: '0.6875rem', color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-heading)',
          }}>
            Last run: {timeAgo(activeProject.lastCitationShareRun)}
          </span>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.375rem 0.625rem', border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem', cursor: 'pointer', background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-secondary)',
            }}
          >
            <Settings size={13} /> Settings
          </button>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {checking && (
        <ProgressBar current={progress.current} total={progress.total} stage={progress.stage} color="var(--color-phase-3)" />
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
          background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '0.8125rem', color: 'var(--color-error)',
        }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: '0 0 0.75rem',
          }}>
            Citation Share Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Auto-monitor toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Auto brand monitoring
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  Periodically check which brands AI engines cite
                </div>
              </div>
              <button
                onClick={() => updateSettings('brandMonitorEnabled', !settings.brandMonitorEnabled)}
                style={{
                  width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: settings.brandMonitorEnabled ? 'var(--color-success)' : 'var(--border-subtle)',
                  position: 'relative', transition: 'background 200ms',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', transition: 'left 200ms',
                  left: settings.brandMonitorEnabled ? 20 : 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </button>
            </div>

            {/* Interval select */}
            {settings.brandMonitorEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Check interval
                </span>
                <select
                  value={settings.brandMonitorInterval || '7d'}
                  onChange={e => updateSettings('brandMonitorInterval', e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem', border: '1px solid var(--border-subtle)',
                    borderRadius: '0.375rem', fontSize: '0.75rem', fontFamily: 'var(--font-body)',
                    background: 'var(--card-bg)', color: 'var(--text-primary)',
                  }}
                >
                  {INTERVAL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Citation Share Pie + Stats ── */}
      {latestSnapshot && (
        <div className={pieData.length > 0 ? 'resp-grid-2' : ''} style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 ? '1fr 1fr' : '1fr', gap: '1rem' }}>
          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
              borderRadius: '0.75rem', padding: '1rem 1.25rem',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
                color: 'var(--text-primary)', margin: '0 0 0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
              }}>
                <Share2 size={15} /> Citation Share
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                        background: d.color,
                      }} />
                      <span style={{
                        color: d.isOwn ? 'var(--color-phase-1)' : 'var(--text-primary)',
                        fontWeight: d.isOwn ? 700 : 500,
                      }}>
                        {d.name} {d.isOwn && '★'}
                      </span>
                      <span style={{
                        marginLeft: 'auto', fontFamily: 'var(--font-heading)',
                        fontWeight: 700, color: 'var(--text-secondary)',
                      }}>
                        {d.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem', padding: '1rem 1.25rem',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
              color: 'var(--text-primary)', margin: '0 0 0.75rem',
            }}>
              Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {Object.values(latestSnapshot.brands || {})
                .sort((a, b) => b.totalMentions - a.totalMentions)
                .map((brand, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.375rem 0.5rem', borderRadius: '0.375rem',
                    background: brand.isOwn ? 'rgba(255, 107, 53, 0.06)' : 'transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span style={{
                        fontSize: '0.8125rem', fontWeight: brand.isOwn ? 700 : 500,
                        color: brand.isOwn ? 'var(--color-phase-1)' : 'var(--text-primary)',
                      }}>
                        {brand.name} {brand.isOwn && '★'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {brand.totalMentions} mention{brand.totalMentions !== 1 ? 's' : ''}
                      </span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                        color: brand.sharePercent >= 30 ? 'var(--color-success)' : brand.sharePercent >= 15 ? 'var(--color-warning)' : 'var(--text-secondary)',
                      }}>
                        {brand.sharePercent}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Share Trend Chart ── */}
      {trendData.length > 1 && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: '0 0 0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}>
            <TrendingUp size={15} /> Share Trend
          </h3>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                axisLine={{ stroke: 'var(--border-subtle)' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                axisLine={{ stroke: 'var(--border-subtle)' }}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<LineTooltip />} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: '0.6875rem', fontFamily: 'var(--font-body)' }}
              />
              {trendLines.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={PHASE_COLOR_ARRAY[i % PHASE_COLOR_ARRAY.length]}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: PHASE_COLOR_ARRAY[i % PHASE_COLOR_ARRAY.length] }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Engine Breakdown Grid ── */}
      {engineBreakdown.length > 0 && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: '0 0 0.75rem',
          }}>
            Engine Breakdown
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6875rem' }}>
              <thead>
                <tr>
                  <th scope="col" style={{
                    textAlign: 'left', padding: '0.5rem 0.625rem',
                    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.625rem',
                    color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    Brand
                  </th>
                  {AI_ENGINES.map(engine => (
                    <th scope="col" key={engine} style={{
                      textAlign: 'center', padding: '0.5rem 0.5rem',
                      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.625rem',
                      color: ENGINE_COLORS[engine] || 'var(--text-tertiary)',
                      borderBottom: '1px solid var(--border-subtle)',
                      whiteSpace: 'nowrap',
                    }}>
                      {engine}
                    </th>
                  ))}
                  <th scope="col" style={{
                    textAlign: 'center', padding: '0.5rem 0.625rem',
                    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.625rem',
                    color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {engineBreakdown.map((brand, idx) => (
                  <tr key={idx} style={{
                    background: brand.isOwn ? 'rgba(255, 107, 53, 0.04)' : 'transparent',
                  }}>
                    <td style={{
                      padding: '0.5rem 0.625rem', fontWeight: 600,
                      color: brand.isOwn ? 'var(--color-phase-1)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {brand.name} {brand.isOwn && '★'}
                    </td>
                    {AI_ENGINES.map(engine => {
                      const engineData = brand.byEngine?.[engine]
                      const mentions = engineData?.mentioned || 0
                      const hasMentions = mentions > 0
                      return (
                        <td key={engine} style={{
                          padding: '0.5rem 0.5rem', textAlign: 'center',
                          background: hasMentions ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.04)',
                        }}
                          title={engineData?.excerpt || ''}
                        >
                          {hasMentions
                            ? <Check size={13} style={{ color: 'var(--color-success)' }} />
                            : <X size={13} style={{ color: 'var(--text-disabled)' }} />}
                        </td>
                      )
                    })}
                    <td style={{
                      padding: '0.5rem 0.625rem', textAlign: 'center',
                      fontFamily: 'var(--font-heading)', fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}>
                      {brand.totalMentions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Query Results ── */}
      {latestSnapshot?.queryResults?.length > 0 && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: '0 0 0.75rem',
          }}>
            Query Results ({latestSnapshot.queryResults.length} queries)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {latestSnapshot.queryResults.map((qr, idx) => {
              const isExpanded = expandedQuery === idx
              const mentionedBrands = Object.values(qr.brands || {}).filter(b => b.mentioned).length
              const totalBrands = Object.keys(qr.brands || {}).length

              return (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedQuery(isExpanded ? null : idx)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '0.5rem 0.625rem', border: '1px solid var(--border-subtle)',
                      borderRadius: isExpanded ? '0.5rem 0.5rem 0 0' : '0.5rem',
                      cursor: 'pointer', background: 'var(--hover-bg)',
                      fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-primary)',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>"{qr.query}"</span>
                      <span style={{
                        fontSize: '0.625rem', fontFamily: 'var(--font-heading)',
                        padding: '0.0625rem 0.375rem', borderRadius: '0.625rem',
                        background: mentionedBrands > 0 ? 'rgba(16, 185, 129, 0.12)' : 'var(--hover-bg)',
                        color: mentionedBrands > 0 ? 'var(--color-success)' : 'var(--text-tertiary)',
                      }}>
                        {mentionedBrands}/{totalBrands} cited
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      padding: '0.625rem 0.75rem',
                      border: '1px solid var(--border-subtle)', borderTop: 'none',
                      borderRadius: '0 0 0.5rem 0.5rem', background: 'var(--card-bg)',
                    }}>
                      {Object.entries(qr.brands || {}).map(([id, data]) => {
                        const brand = competitors.find(c => c.id === id)
                        return (
                          <div key={id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.25rem 0', fontSize: '0.6875rem',
                          }}>
                            {data.mentioned
                              ? <Check size={12} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                              : <X size={12} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />}
                            <span style={{
                              fontWeight: 600,
                              color: brand?.isOwn ? 'var(--color-phase-1)' : 'var(--text-primary)',
                            }}>
                              {brand?.name || id}
                            </span>
                            {data.excerpt && (
                              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.625rem', flex: 1 }}>
                                — {data.excerpt}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── History ── */}
      {history.length > 1 && (
        <div style={{
          fontSize: '0.6875rem', color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-heading)', textAlign: 'center',
          padding: '0.25rem 0',
        }}>
          {history.length} snapshot{history.length !== 1 ? 's' : ''} recorded · Tracking since {new Date(history[0].timestamp).toLocaleDateString()}
        </div>
      )}

      {/* ── Empty State ── */}
      {history.length === 0 && !checking && (
        <EmptyState
          icon={PieChartIcon}
          title="No citation data yet"
          description={competitors.length === 0
            ? 'Add competitors in the Overview tab first, then check citations.'
            : 'Click "Run Citation Check" to see which brands AI engines cite for your industry.'}
          color="var(--color-phase-3)"
        />
      )}
    </div>
  )
}
