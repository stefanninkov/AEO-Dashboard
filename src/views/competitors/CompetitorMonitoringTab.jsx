import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Activity, Play, Loader2, AlertTriangle, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, Search, XCircle, CheckCircle2, Clock,
  Settings, Zap, Minus, ExternalLink, Bell
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { useCompetitorMonitor } from '../../hooks/useCompetitorMonitor'
import { CATEGORY_LABELS, getHeatColor } from './CompetitorsOverviewTab'
import { PHASE_COLOR_ARRAY } from '../../utils/chartColors'
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

// ─── Time Helpers ────────────────────────────────────────────
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

// ─── Chart Tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
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
          {p.name}: <strong style={{ color: 'var(--text-primary)' }}>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function CompetitorMonitoringTab({ activeProject, updateProject, user }) {
  const {
    monitoring, reversingId, progress, error,
    runMonitor, reverseEngineer, dismissAlert, clearDismissedAlerts,
  } = useCompetitorMonitor({ activeProject, updateProject, user })

  const [showSettings, setShowSettings] = useState(false)
  const [expandedSnapshot, setExpandedSnapshot] = useState(null)
  const schedulerRef = useRef(null)

  const settings = activeProject?.settings || {}
  const history = activeProject?.competitorMonitorHistory || []
  const alerts = activeProject?.competitorAlerts || []
  const competitors = activeProject?.competitors || []
  const undismissedAlerts = alerts.filter(a => !a.dismissed)
  const dismissedCount = alerts.filter(a => a.dismissed).length

  // ── Auto-scheduling ──
  useEffect(() => {
    if (!settings.competitorMonitorEnabled) return
    if (!activeProject?.url || competitors.length === 0) return
    if (!localStorage.getItem('anthropic-api-key')) return

    const checkSchedule = () => {
      const lastRun = activeProject.lastCompetitorMonitorRun
      const intervalMs = getIntervalMs(settings.competitorMonitorInterval || '7d')
      if (!lastRun || Date.now() - new Date(lastRun).getTime() > intervalMs) {
        logger.info('Scheduled competitor monitor run triggered')
        runMonitor()
      }
    }

    const initialTimer = setTimeout(checkSchedule, 3000)
    schedulerRef.current = setInterval(checkSchedule, 15 * 60 * 1000)

    return () => {
      clearTimeout(initialTimer)
      if (schedulerRef.current) clearInterval(schedulerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.competitorMonitorEnabled, settings.competitorMonitorInterval, activeProject?.url, competitors.length, activeProject?.lastCompetitorMonitorRun])

  // ── Build chart data from history ──
  const chartData = useMemo(() => {
    if (history.length === 0) return []
    // Get all unique competitor IDs across all snapshots
    const allIds = new Set()
    history.forEach(snap => {
      Object.keys(snap.scores || {}).forEach(id => allIds.add(id))
    })
    // Build rows
    return history.slice(-30).map(snap => {
      const row = {
        date: new Date(snap.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }
      allIds.forEach(id => {
        const s = snap.scores?.[id]
        if (s) {
          row[s.name] = s.aeoScore
        }
      })
      return row
    })
  }, [history])

  // Get unique competitor names for chart lines
  const chartLines = useMemo(() => {
    if (history.length === 0) return []
    const latestScores = history[history.length - 1]?.scores || {}
    return Object.values(latestScores).map(s => s.name)
  }, [history])

  // Latest snapshot
  const latestSnapshot = history.length > 0 ? history[history.length - 1] : null

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
          onClick={runMonitor}
          disabled={monitoring || competitors.length === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem',
            cursor: monitoring || competitors.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
            background: 'var(--color-phase-2)', color: '#fff',
            opacity: monitoring || competitors.length === 0 ? 0.6 : 1,
            transition: 'opacity 150ms',
          }}
        >
          {monitoring ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
          {monitoring ? 'Monitoring...' : 'Run Monitor'}
        </button>

        {/* Schedule badge */}
        {settings.competitorMonitorEnabled && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.25rem 0.625rem', borderRadius: '0.625rem',
            fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-heading)',
            background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)',
          }}>
            <Clock size={11} />
            {getIntervalLabel(settings.competitorMonitorInterval)} · Next: {getNextRunDate(activeProject.lastCompetitorMonitorRun, settings.competitorMonitorInterval)}
          </span>
        )}

        {/* Last run badge */}
        {activeProject.lastCompetitorMonitorRun && (
          <span style={{
            fontSize: '0.6875rem', color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-heading)',
          }}>
            Last run: {timeAgo(activeProject.lastCompetitorMonitorRun)}
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
      {monitoring && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '0.75rem 1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {progress.stage}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-heading)' }}>
              {progress.current}/{progress.total}
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--hover-bg)', borderRadius: 3 }}>
            <div style={{
              height: '100%', borderRadius: 3, background: 'var(--color-phase-2)',
              width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
              transition: 'width 300ms',
            }} />
          </div>
        </div>
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
            Monitoring Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Auto-monitor toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Auto-monitoring
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  Automatically track competitor scores on a schedule
                </div>
              </div>
              <button
                onClick={() => updateSettings('competitorMonitorEnabled', !settings.competitorMonitorEnabled)}
                style={{
                  width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: settings.competitorMonitorEnabled ? 'var(--color-success)' : 'var(--border-subtle)',
                  position: 'relative', transition: 'background 200ms',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', transition: 'left 200ms',
                  left: settings.competitorMonitorEnabled ? 20 : 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </button>
            </div>

            {/* Interval select */}
            {settings.competitorMonitorEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Check interval
                </span>
                <select
                  value={settings.competitorMonitorInterval || '7d'}
                  onChange={e => updateSettings('competitorMonitorInterval', e.target.value)}
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

            {/* Alert threshold */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Alert threshold
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  Score change (±) that triggers an alert
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <input
                  type="number"
                  value={settings.competitorAlertThreshold || 15}
                  onChange={e => updateSettings('competitorAlertThreshold', Math.max(1, Math.min(50, Number(e.target.value))))}
                  style={{
                    width: 52, padding: '0.25rem 0.375rem', border: '1px solid var(--border-subtle)',
                    borderRadius: '0.375rem', fontSize: '0.75rem', fontFamily: 'var(--font-heading)',
                    background: 'var(--card-bg)', color: 'var(--text-primary)', textAlign: 'center',
                  }}
                  min={1}
                  max={50}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Alerts ── */}
      {undismissedAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}>
            <Bell size={15} />
            Alerts ({undismissedAlerts.length})
          </h3>

          {undismissedAlerts.map(alert => (
            <div
              key={alert.id}
              className="competitor-alert-card"
              style={{
                background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem', padding: '0.875rem 1rem',
                borderLeft: `3px solid ${alert.type === 'score_jump' ? 'var(--color-success)' : 'var(--color-error)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    {alert.type === 'score_jump'
                      ? <TrendingUp size={14} style={{ color: 'var(--color-success)' }} />
                      : <TrendingDown size={14} style={{ color: 'var(--color-error)' }} />}
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {alert.competitorName}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
                      padding: '0.0625rem 0.375rem', borderRadius: '0.625rem',
                      background: alert.delta > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: alert.delta > 0 ? 'var(--color-success)' : 'var(--color-error)',
                    }}>
                      {alert.delta > 0 ? '+' : ''}{alert.delta}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Score changed from <strong>{alert.previousScore}</strong> → <strong>{alert.currentScore}</strong>
                    {alert.categoriesChanged?.length > 0 && (
                      <span> · Categories: {alert.categoriesChanged.map(c =>
                        `${CATEGORY_LABELS[c.category] || c.category} (${c.delta > 0 ? '+' : ''}${c.delta})`
                      ).join(', ')}</span>
                    )}
                  </div>

                  {/* AI Analysis (if loaded) */}
                  {alert.aiAnalysis && (
                    <div style={{
                      marginTop: '0.625rem', padding: '0.625rem 0.75rem',
                      background: 'var(--hover-bg)', borderRadius: '0.5rem',
                      fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Zap size={12} style={{ color: 'var(--color-phase-5)' }} /> Analysis
                      </div>
                      <p style={{ margin: '0 0 0.375rem' }}>{alert.aiAnalysis}</p>
                      {alert.suggestions?.length > 0 && (
                        <>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            Suggestions for your site:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1.125rem' }}>
                            {alert.suggestions.map((s, i) => (
                              <li key={i} style={{ marginBottom: '0.125rem' }}>{s}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
                  {!alert.aiAnalysis && (
                    <button
                      onClick={() => reverseEngineer(alert.id)}
                      disabled={reversingId === alert.id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.3125rem 0.625rem', border: '1px solid var(--border-subtle)',
                        borderRadius: '0.375rem', cursor: reversingId === alert.id ? 'not-allowed' : 'pointer',
                        background: 'var(--card-bg)', fontFamily: 'var(--font-body)',
                        fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-phase-2)',
                        opacity: reversingId === alert.id ? 0.6 : 1,
                      }}
                    >
                      {reversingId === alert.id
                        ? <><Loader2 size={11} className="spin" /> Analyzing...</>
                        : <><Search size={11} /> Analyze</>}
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.3125rem 0.625rem', border: '1px solid var(--border-subtle)',
                      borderRadius: '0.375rem', cursor: 'pointer', background: 'transparent',
                      fontFamily: 'var(--font-body)', fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                    }}
                  >
                    <XCircle size={11} /> Dismiss
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.375rem' }}>
                {timeAgo(alert.timestamp)}
              </div>
            </div>
          ))}

          {dismissedCount > 0 && (
            <button
              onClick={clearDismissedAlerts}
              style={{
                alignSelf: 'flex-start', padding: '0.25rem 0.5rem',
                border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
                background: 'transparent', fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                textDecoration: 'underline',
              }}
            >
              Clear {dismissedCount} dismissed alert{dismissedCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* ── Score History Chart ── */}
      {chartData.length > 1 && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: '0 0 0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}>
            <Activity size={15} /> Score History
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                {chartLines.map((name, i) => (
                  <linearGradient key={name} id={`compGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PHASE_COLOR_ARRAY[i % PHASE_COLOR_ARRAY.length]} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={PHASE_COLOR_ARRAY[i % PHASE_COLOR_ARRAY.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
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
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: '0.6875rem', fontFamily: 'var(--font-body)' }}
              />
              {chartLines.map((name, i) => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={PHASE_COLOR_ARRAY[i % PHASE_COLOR_ARRAY.length]}
                  strokeWidth={2}
                  fill={`url(#compGrad-${i})`}
                  dot={{ r: 2.5, fill: PHASE_COLOR_ARRAY[i % PHASE_COLOR_ARRAY.length] }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Latest Score Delta Table ── */}
      {latestSnapshot && latestSnapshot.changes?.length > 0 && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: '0 0 0.75rem',
          }}>
            Latest Changes
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  {['Competitor', 'Previous', 'Current', 'Delta', 'Categories Changed'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '0.5rem 0.625rem',
                      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.6875rem',
                      color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestSnapshot.changes.map((change, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '0.5rem 0.625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {change.competitorName}
                    </td>
                    <td style={{ padding: '0.5rem 0.625rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                      {change.previousScore}
                    </td>
                    <td style={{ padding: '0.5rem 0.625rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                      {change.currentScore}
                    </td>
                    <td style={{ padding: '0.5rem 0.625rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontWeight: 700,
                        color: change.delta > 0 ? 'var(--color-success)' : 'var(--color-error)',
                      }}>
                        {change.delta > 0 ? '+' : ''}{change.delta}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.625rem', color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>
                      {change.categoriesChanged?.length > 0
                        ? change.categoriesChanged.map(c => CATEGORY_LABELS[c.category] || c.category).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Snapshot History ── */}
      {history.length > 0 && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: '0 0 0.75rem',
          }}>
            History ({history.length} snapshot{history.length !== 1 ? 's' : ''})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {[...history].reverse().slice(0, 20).map(snap => {
              const isExpanded = expandedSnapshot === snap.id
              const scoreEntries = Object.values(snap.scores || {})
              return (
                <div key={snap.id}>
                  <button
                    onClick={() => setExpandedSnapshot(isExpanded ? null : snap.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '0.5rem 0.625rem', border: '1px solid var(--border-subtle)',
                      borderRadius: '0.5rem', cursor: 'pointer', background: 'var(--hover-bg)',
                      fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-primary)',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{new Date(snap.timestamp).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}</span>
                      <span style={{
                        fontSize: '0.625rem', fontFamily: 'var(--font-heading)',
                        color: 'var(--text-tertiary)',
                      }}>
                        {scoreEntries.length} competitor{scoreEntries.length !== 1 ? 's' : ''}
                        {snap.changes?.length > 0 && (
                          <span style={{ color: 'var(--color-warning)', marginLeft: '0.375rem' }}>
                            · {snap.changes.length} change{snap.changes.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      padding: '0.625rem 0.75rem', border: '1px solid var(--border-subtle)',
                      borderTop: 'none', borderRadius: '0 0 0.5rem 0.5rem',
                      background: 'var(--card-bg)',
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6875rem' }}>
                        <thead>
                          <tr>
                            {['Competitor', 'AEO Score', ...Object.values(CATEGORY_LABELS)].map(h => (
                              <th key={h} style={{
                                textAlign: 'left', padding: '0.375rem 0.5rem',
                                fontFamily: 'var(--font-heading)', fontWeight: 700,
                                fontSize: '0.625rem', color: 'var(--text-tertiary)',
                                borderBottom: '1px solid var(--border-subtle)',
                              }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {scoreEntries
                            .sort((a, b) => b.aeoScore - a.aeoScore)
                            .map(s => (
                              <tr key={s.url}>
                                <td style={{
                                  padding: '0.375rem 0.5rem', fontWeight: 600,
                                  color: s.isOwn ? 'var(--color-phase-1)' : 'var(--text-primary)',
                                }}>
                                  {s.name} {s.isOwn && '★'}
                                </td>
                                <td style={{
                                  padding: '0.375rem 0.5rem', fontFamily: 'var(--font-heading)',
                                  fontWeight: 700, color: 'var(--text-primary)',
                                }}>
                                  {s.aeoScore}
                                </td>
                                {['conversational', 'factual', 'industrySpecific', 'comparison', 'technical'].map(cat => {
                                  const score = s.categoryScores?.[cat] || 0
                                  const colors = getHeatColor(score)
                                  return (
                                    <td key={cat} style={{
                                      padding: '0.375rem 0.5rem', fontFamily: 'var(--font-heading)',
                                      fontWeight: 600, textAlign: 'center',
                                      background: colors.bg, color: colors.text,
                                    }}>
                                      {score}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {history.length === 0 && !monitoring && (
        <div style={{
          textAlign: 'center', padding: '2.5rem 1.5rem',
          background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
        }}>
          <Activity size={36} style={{ color: 'var(--text-disabled)', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            No monitoring data yet
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.5 }}>
            {competitors.length === 0
              ? 'Add competitors in the Overview tab first, then start monitoring.'
              : 'Click "Run Monitor" to take the first snapshot of competitor AEO scores.'}
          </p>
        </div>
      )}
    </div>
  )
}
