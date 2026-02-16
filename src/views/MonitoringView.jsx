import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Activity, Clock, Play, CheckCircle2, XCircle, AlertCircle,
  Loader2, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Bell, BellOff, Calendar, BarChart3, RefreshCw, Settings, Zap
} from 'lucide-react'
import { useAutoMonitor } from '../hooks/useAutoMonitor'
import { createActivity, appendActivity } from '../utils/activityLogger'
import logger from '../utils/logger'

// ─── Interval Config ─────────────────────────────────────────
const INTERVAL_OPTIONS = [
  { value: '1d', label: 'Daily', ms: 24 * 60 * 60 * 1000 },
  { value: '3d', label: 'Every 3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  { value: '7d', label: 'Weekly', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '14d', label: 'Bi-weekly', ms: 14 * 24 * 60 * 60 * 1000 },
  { value: '30d', label: 'Monthly', ms: 30 * 24 * 60 * 60 * 1000 },
]

function getIntervalMs(intervalValue) {
  return INTERVAL_OPTIONS.find(o => o.value === intervalValue)?.ms || 7 * 24 * 60 * 60 * 1000
}

function getIntervalLabel(intervalValue) {
  return INTERVAL_OPTIONS.find(o => o.value === intervalValue)?.label || 'Weekly'
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
  const diff = next - Date.now()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Less than 1 hour'
  if (hours < 24) return `In ${hours} hour${hours > 1 ? 's' : ''}`
  const days = Math.floor(hours / 24)
  return `In ${days} day${days > 1 ? 's' : ''}`
}

// ─── Main Component ──────────────────────────────────────────
export default function MonitoringView({ activeProject, updateProject }) {
  const { monitoring, progress, error, lastResult, runMonitor } = useAutoMonitor({ activeProject, updateProject })
  const [expandedRun, setExpandedRun] = useState(null)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [notification, setNotification] = useState(null)
  const schedulerRef = useRef(null)
  const prevScoreRef = useRef(null)

  const settings = activeProject?.settings || {}
  const monitorHistory = activeProject?.monitorHistory || []
  const queryCount = activeProject?.queryTracker?.length || 0
  const hasUrl = !!activeProject?.url

  const latestRun = monitorHistory.length > 0 ? monitorHistory[monitorHistory.length - 1] : null
  const previousRun = monitorHistory.length > 1 ? monitorHistory[monitorHistory.length - 2] : null

  // Score delta
  const scoreDelta = latestRun && previousRun
    ? latestRun.overallScore - previousRun.overallScore
    : null

  // ── Scheduled Auto-Run ──
  useEffect(() => {
    if (!settings.monitoringEnabled) return
    if (!activeProject?.url || !queryCount) return
    if (!localStorage.getItem('anthropic-api-key')) return

    const checkSchedule = () => {
      const lastRun = activeProject.lastMonitorRun
      const intervalMs = getIntervalMs(settings.monitoringInterval || '7d')

      if (!lastRun || Date.now() - new Date(lastRun).getTime() > intervalMs) {
        logger.info('Scheduled monitor run triggered')
        handleRunMonitor()
      }
    }

    // Check immediately
    const initialTimer = setTimeout(checkSchedule, 3000)

    // Check every 15 minutes
    schedulerRef.current = setInterval(checkSchedule, 15 * 60 * 1000)

    return () => {
      clearTimeout(initialTimer)
      if (schedulerRef.current) clearInterval(schedulerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.monitoringEnabled, settings.monitoringInterval, activeProject?.url, queryCount, activeProject?.lastMonitorRun])

  // ── Notification on score change ──
  useEffect(() => {
    if (!lastResult) return
    const prevScore = prevScoreRef.current
    if (prevScore !== null && settings.notifyOnScoreChange) {
      const delta = lastResult.overallScore - prevScore
      const threshold = settings.notifyThreshold || 10
      if (Math.abs(delta) >= threshold) {
        setNotification({
          type: delta > 0 ? 'positive' : 'negative',
          message: `Citation score ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}% (${prevScore}% → ${lastResult.overallScore}%)`,
        })
        setTimeout(() => setNotification(null), 8000)
      }
    }
    prevScoreRef.current = lastResult.overallScore
  }, [lastResult, settings.notifyOnScoreChange, settings.notifyThreshold])

  // ── Run Monitor with activity logging ──
  const handleRunMonitor = async () => {
    const prevScore = latestRun?.overallScore ?? null
    prevScoreRef.current = prevScore

    const snapshot = await runMonitor()
    if (snapshot) {
      const actEntry = createActivity('monitor', {
        score: snapshot.overallScore,
        queriesChecked: snapshot.queriesChecked,
        queriesCited: snapshot.queriesCited,
      })
      updateProject(activeProject.id, {
        activityLog: appendActivity(activeProject.activityLog, actEntry),
      })
    }
  }

  // ── Toggle settings ──
  const toggleMonitoring = () => {
    updateProject(activeProject.id, {
      settings: { ...settings, monitoringEnabled: !settings.monitoringEnabled },
    })
  }

  const setInterval_ = (value) => {
    updateProject(activeProject.id, {
      settings: { ...settings, monitoringInterval: value },
    })
  }

  const toggleNotifications = () => {
    updateProject(activeProject.id, {
      settings: { ...settings, notifyOnScoreChange: !settings.notifyOnScoreChange },
    })
  }

  // ── Sparkline data ──
  const sparklineData = useMemo(() => {
    const last30 = monitorHistory.slice(-30)
    if (last30.length < 2) return null
    const max = Math.max(...last30.map(h => h.overallScore), 100)
    const min = Math.min(...last30.map(h => h.overallScore), 0)
    const range = max - min || 1
    const width = 280
    const height = 60
    const points = last30.map((h, i) => {
      const x = (i / (last30.length - 1)) * width
      const y = height - ((h.overallScore - min) / range) * height
      return `${x},${y}`
    })
    return { points: points.join(' '), width, height }
  }, [monitorHistory])

  // ── History display ──
  const displayHistory = showAllHistory ? [...monitorHistory].reverse() : [...monitorHistory].reverse().slice(0, 10)

  // ── Render ──
  return (
    <div className="mon-container">
      {/* Notification Banner */}
      {notification && (
        <div className={`mon-notification ${notification.type === 'positive' ? 'mon-notification-positive' : 'mon-notification-negative'}`}>
          {notification.type === 'positive' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mon-header">
        <div className="mon-header-left">
          <Activity size={24} className="mon-header-icon" />
          <div>
            <h1 className="mon-title">Monitoring</h1>
            <p className="mon-subtitle">Track your AI answer engine citation score over time</p>
          </div>
        </div>
        <div className="mon-header-actions">
          <button
            className={`mon-schedule-badge ${settings.monitoringEnabled ? 'mon-schedule-active' : ''}`}
            onClick={toggleMonitoring}
            title={settings.monitoringEnabled ? 'Disable scheduled monitoring' : 'Enable scheduled monitoring'}
          >
            {settings.monitoringEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            {settings.monitoringEnabled ? `Auto: ${getIntervalLabel(settings.monitoringInterval)}` : 'Auto: Off'}
          </button>
          <button
            className="mon-run-btn"
            onClick={handleRunMonitor}
            disabled={monitoring || !hasUrl || !queryCount}
            title={!hasUrl ? 'Set a project URL first' : !queryCount ? 'Add queries in Testing view first' : 'Run check now'}
          >
            {monitoring ? (
              <>
                <Loader2 size={16} className="mon-spinner" />
                Checking ({progress.current}/{progress.total})…
              </>
            ) : (
              <>
                <Play size={16} />
                Run Check Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mon-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Prerequisites Warning */}
      {(!hasUrl || !queryCount) && (
        <div className="mon-warning">
          <AlertCircle size={16} />
          <div>
            {!hasUrl && <p>Set a project URL in Settings to enable monitoring.</p>}
            {!queryCount && <p>Add queries in the Testing view's Query Tracker to start monitoring.</p>}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mon-stats-grid">
        {/* Current Score */}
        <div className="mon-stat-card mon-stat-score">
          <div className="mon-stat-label">Citation Score</div>
          <div className="mon-stat-value">
            {latestRun ? `${latestRun.overallScore}%` : '—'}
          </div>
          {scoreDelta !== null && (
            <div className={`mon-stat-delta ${scoreDelta > 0 ? 'mon-delta-up' : scoreDelta < 0 ? 'mon-delta-down' : 'mon-delta-flat'}`}>
              {scoreDelta > 0 ? <TrendingUp size={14} /> : scoreDelta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
              {scoreDelta > 0 ? '+' : ''}{scoreDelta}%
            </div>
          )}
        </div>

        {/* Queries Cited */}
        <div className="mon-stat-card">
          <div className="mon-stat-label">Queries Cited</div>
          <div className="mon-stat-value">
            {latestRun ? `${latestRun.queriesCited}/${latestRun.queriesChecked}` : '—'}
          </div>
          <div className="mon-stat-sub">
            {latestRun ? `${Math.round((latestRun.queriesCited / latestRun.queriesChecked) * 100) || 0}% hit rate` : 'No data yet'}
          </div>
        </div>

        {/* Last Run */}
        <div className="mon-stat-card">
          <div className="mon-stat-label">Last Check</div>
          <div className="mon-stat-value mon-stat-value-sm">
            {timeAgo(activeProject?.lastMonitorRun)}
          </div>
          <div className="mon-stat-sub">
            {activeProject?.lastMonitorRun
              ? new Date(activeProject.lastMonitorRun).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Never run'}
          </div>
        </div>

        {/* Next Run */}
        <div className="mon-stat-card">
          <div className="mon-stat-label">Next Scheduled</div>
          <div className="mon-stat-value mon-stat-value-sm">
            {settings.monitoringEnabled
              ? getNextRunDate(activeProject?.lastMonitorRun, settings.monitoringInterval)
              : 'Disabled'}
          </div>
          <div className="mon-stat-sub">
            {settings.monitoringEnabled ? `Interval: ${getIntervalLabel(settings.monitoringInterval)}` : 'Enable in settings below'}
          </div>
        </div>
      </div>

      {/* Score Trend */}
      {sparklineData && (
        <div className="mon-trend-card">
          <div className="mon-trend-header">
            <h3 className="mon-section-title">
              <BarChart3 size={16} />
              Score Trend
            </h3>
            <span className="mon-trend-range">{monitorHistory.length} checks</span>
          </div>
          <div className="mon-trend-chart">
            <svg viewBox={`0 0 ${sparklineData.width} ${sparklineData.height}`} className="mon-sparkline">
              <defs>
                <linearGradient id="monGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-phase-3)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-phase-3)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,${sparklineData.height} ${sparklineData.points} ${sparklineData.width},${sparklineData.height}`}
                fill="url(#monGradient)"
              />
              <polyline
                points={sparklineData.points}
                fill="none"
                stroke="var(--color-phase-3)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mon-trend-labels">
              <span>{monitorHistory[0] ? new Date(monitorHistory[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
              <span>{latestRun ? new Date(latestRun.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Settings */}
      <div className="mon-settings-card">
        <h3 className="mon-section-title">
          <Settings size={16} />
          Schedule Settings
        </h3>
        <div className="mon-settings-grid">
          <div className="mon-setting-row">
            <div className="mon-setting-info">
              <span className="mon-setting-label">Auto-Monitoring</span>
              <span className="mon-setting-desc">Automatically check citation score on a schedule</span>
            </div>
            <button
              className={`mon-toggle ${settings.monitoringEnabled ? 'mon-toggle-on' : ''}`}
              onClick={toggleMonitoring}
              role="switch"
              aria-checked={settings.monitoringEnabled}
            >
              <span className="mon-toggle-thumb" />
            </button>
          </div>

          <div className="mon-setting-row">
            <div className="mon-setting-info">
              <span className="mon-setting-label">Check Interval</span>
              <span className="mon-setting-desc">How often to run automated checks</span>
            </div>
            <select
              className="mon-select"
              value={settings.monitoringInterval || '7d'}
              onChange={e => setInterval_(e.target.value)}
            >
              {INTERVAL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="mon-setting-row">
            <div className="mon-setting-info">
              <span className="mon-setting-label">Score Change Alerts</span>
              <span className="mon-setting-desc">Notify when score changes by ≥{settings.notifyThreshold || 10}%</span>
            </div>
            <button
              className={`mon-toggle ${settings.notifyOnScoreChange ? 'mon-toggle-on' : ''}`}
              onClick={toggleNotifications}
              role="switch"
              aria-checked={settings.notifyOnScoreChange}
            >
              <span className="mon-toggle-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Latest Results */}
      {latestRun && (
        <div className="mon-results-card">
          <h3 className="mon-section-title">
            <Zap size={16} />
            Latest Results
          </h3>
          <div className="mon-results-list">
            {Object.entries(latestRun.results).map(([id, r]) => (
              <div key={id} className="mon-result-item">
                <div className={`mon-result-icon ${r.cited ? 'mon-result-cited' : 'mon-result-not-cited'}`}>
                  {r.cited ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <div className="mon-result-info">
                  <span className="mon-result-query">{r.query}</span>
                  <span className="mon-result-excerpt">{r.excerpt}</span>
                </div>
                <span className={`mon-result-badge ${r.cited ? 'mon-badge-cited' : 'mon-badge-not-cited'}`}>
                  {r.cited ? 'Cited' : 'Not Cited'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {monitorHistory.length > 0 && (
        <div className="mon-history-card">
          <div className="mon-history-header">
            <h3 className="mon-section-title">
              <Calendar size={16} />
              Check History
            </h3>
            <span className="mon-history-count">{monitorHistory.length} total checks</span>
          </div>
          <div className="mon-history-list">
            {displayHistory.map((run, i) => {
              const runIndex = monitorHistory.length - 1 - i
              const prevRun = runIndex > 0 ? monitorHistory[runIndex - 1] : null
              const delta = prevRun ? run.overallScore - prevRun.overallScore : null
              const isExpanded = expandedRun === run.date

              return (
                <div key={run.date} className="mon-history-item">
                  <button className="mon-history-row" onClick={() => setExpandedRun(isExpanded ? null : run.date)}>
                    <span className="mon-history-date">
                      {new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="mon-history-time">
                      {new Date(run.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`mon-history-score ${run.overallScore >= 70 ? 'mon-score-good' : run.overallScore >= 40 ? 'mon-score-ok' : 'mon-score-bad'}`}>
                      {run.overallScore}%
                    </span>
                    <span className="mon-history-queries">
                      {run.queriesCited}/{run.queriesChecked} cited
                    </span>
                    {delta !== null && (
                      <span className={`mon-history-delta ${delta > 0 ? 'mon-delta-up' : delta < 0 ? 'mon-delta-down' : 'mon-delta-flat'}`}>
                        {delta > 0 ? '+' : ''}{delta}%
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {isExpanded && run.results && (
                    <div className="mon-history-details">
                      {Object.entries(run.results).map(([qId, r]) => (
                        <div key={qId} className="mon-history-detail-item">
                          {r.cited ? (
                            <CheckCircle2 size={14} className="mon-detail-cited" />
                          ) : (
                            <XCircle size={14} className="mon-detail-not-cited" />
                          )}
                          <span className="mon-detail-query">{r.query}</span>
                          <span className="mon-detail-excerpt">{r.excerpt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {monitorHistory.length > 10 && (
            <button className="mon-show-more" onClick={() => setShowAllHistory(!showAllHistory)}>
              {showAllHistory ? 'Show less' : `Show all ${monitorHistory.length} checks`}
              {showAllHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!latestRun && !monitoring && !error && hasUrl && queryCount > 0 && (
        <div className="mon-empty">
          <Activity size={48} strokeWidth={1} />
          <h3>No Monitoring Data Yet</h3>
          <p>Run your first check to see how often your site is cited by AI answer engines for your tracked queries.</p>
          <button className="mon-run-btn" onClick={handleRunMonitor}>
            <Play size={16} />
            Run First Check
          </button>
        </div>
      )}
    </div>
  )
}
