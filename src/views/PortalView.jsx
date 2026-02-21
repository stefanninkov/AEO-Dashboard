import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Loader2, AlertCircle, ExternalLink, Shield, Sparkles, TrendingUp,
  TrendingDown, Minus, CheckCircle2, XCircle, ChartColumnIncreasing, Clock
} from 'lucide-react'
import { fetchSharedProject } from '../hooks/useShareLink'
import { phases as rawPhases } from '../data/aeo-checklist'
import { useChecklistTranslation } from '../hooks/useChecklistTranslation'

// ─── Portal View (standalone, no auth) ───────────────────────
export default function PortalView({ shareToken }) {
  const { t } = useTranslation('app')
  const phases = useChecklistTranslation(rawPhases)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchSharedProject(shareToken)
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [shareToken])

  if (loading) {
    return (
      <div className="portal-loading">
        <Loader2 size={32} className="portal-spinner" />
        <p>{t('portal.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="portal-loading">
        <div className="portal-error-card">
          <AlertCircle size={48} strokeWidth={1.5} />
          <h2>{t('portal.invalidLink')}</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const project = data.snapshot

  return (
    <div className="portal-page">
      {/* Banner */}
      <div className="portal-banner">
        <div className="portal-banner-inner">
          <div className="portal-banner-left">
            <Shield size={16} />
            <span>{t('portal.readOnly')}</span>
          </div>
          <div className="portal-banner-right">
            <Sparkles size={14} />
            <span>{t('common:sidebar.appName')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="portal-content">
        {/* Header */}
        <div className="portal-header">
          <h1 className="portal-project-name">{project.name}</h1>
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="portal-project-url">
              {project.url}
              <ExternalLink size={13} />
            </a>
          )}
          <p className="portal-shared-on">
            <Clock size={13} />
            {t('portal.sharedOn', { date: new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) })}
          </p>
        </div>

        {/* Stats */}
        <PortalStats project={project} />

        {/* Checklist Progress */}
        <PortalPhaseProgress project={project} />

        {/* Analyzer Results */}
        {project.analyzerResults && <PortalAnalyzerResults results={project.analyzerResults} />}

        {/* Monitoring History */}
        {project.monitorHistory?.length > 0 && <PortalMonitorHistory history={project.monitorHistory} />}
      </div>

      {/* Footer */}
      <div className="portal-footer">
        <p>{t('portal.poweredBy')}</p>
      </div>
    </div>
  )
}

// ─── Stats Cards ─────────────────────────────────────────────
function PortalStats({ project }) {
  const { t } = useTranslation('app')
  const latestMetrics = project.metricsHistory?.length > 0 ? project.metricsHistory[project.metricsHistory.length - 1] : null
  const latestMonitor = project.monitorHistory?.length > 0 ? project.monitorHistory[project.monitorHistory.length - 1] : null

  // Calculate checklist completion
  const totalItems = phases.reduce((sum, phase) => {
    return sum + phase.categories.reduce((s, c) => s + c.items.length, 0)
  }, 0)
  const checkedItems = Object.values(project.checked || {}).filter(Boolean).length
  const checklistPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  return (
    <div className="portal-stats-grid">
      <div className="portal-stat-card">
        <div className="portal-stat-label">{t('portal.aeoScore')}</div>
        <div className="portal-stat-value">
          {latestMetrics?.overallScore ?? project.analyzerResults?.overallScore ?? '—'}
          {(latestMetrics?.overallScore || project.analyzerResults?.overallScore) && <span className="portal-stat-unit">%</span>}
        </div>
      </div>
      <div className="portal-stat-card">
        <div className="portal-stat-label">{t('portal.checklistProgress')}</div>
        <div className="portal-stat-value">
          {checklistPercent}<span className="portal-stat-unit">%</span>
        </div>
        <div className="portal-stat-sub">{t('portal.itemsCount', { checked: checkedItems, total: totalItems })}</div>
      </div>
      <div className="portal-stat-card">
        <div className="portal-stat-label">{t('portal.citationScore')}</div>
        <div className="portal-stat-value">
          {latestMonitor ? `${latestMonitor.overallScore}` : '—'}
          {latestMonitor && <span className="portal-stat-unit">%</span>}
        </div>
        <div className="portal-stat-sub">
          {latestMonitor ? t('portal.queriesCited', { cited: latestMonitor.queriesCited, checked: latestMonitor.queriesChecked }) : 'No data'}
        </div>
      </div>
      <div className="portal-stat-card">
        <div className="portal-stat-label">{t('portal.monitorChecks')}</div>
        <div className="portal-stat-value">{project.monitorHistory?.length || 0}</div>
        <div className="portal-stat-sub">
          {latestMonitor ? `Last: ${new Date(latestMonitor.date).toLocaleDateString()}` : 'No checks yet'}
        </div>
      </div>
    </div>
  )
}

// ─── Phase Progress ──────────────────────────────────────────
function PortalPhaseProgress({ project }) {
  const { t } = useTranslation('app')
  const phaseData = useMemo(() => {
    return phases.map(phase => {
      let total = 0
      let checked = 0
      phase.categories.forEach(cat => {
        cat.items.forEach(item => {
          total++
          if (project.checked?.[item.id]) checked++
        })
      })
      return { ...phase, total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 }
    })
  }, [project.checked])

  return (
    <div className="portal-section">
      <h2 className="portal-section-title">
        <ChartColumnIncreasing size={18} />
        {t('portal.implementation')}
      </h2>
      <div className="portal-phases">
        {phaseData.map(phase => (
          <div key={phase.id} className="portal-phase-row">
            <span className="portal-phase-icon" style={{ color: phase.color }}>{phase.Icon ? <phase.Icon size={16} /> : null}</span>
            <div className="portal-phase-info">
              <div className="portal-phase-top">
                <span className="portal-phase-name">{phase.title}</span>
                <span className="portal-phase-count">{phase.checked}/{phase.total}</span>
              </div>
              <div className="portal-progress-bar">
                <div
                  className="portal-progress-fill"
                  style={{ width: `${phase.percent}%`, background: phase.color }}
                />
              </div>
            </div>
            <span className="portal-phase-percent" style={{ color: phase.color }}>
              {phase.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Analyzer Results ────────────────────────────────────────
function PortalAnalyzerResults({ results }) {
  const { t } = useTranslation('app')
  return (
    <div className="portal-section">
      <h2 className="portal-section-title">
        <Sparkles size={18} />
        {t('portal.siteAnalysis')}
      </h2>
      <div className="portal-analyzer-header">
        <div className="portal-analyzer-score" style={{ color: results.overallScore >= 70 ? 'var(--color-success)' : results.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }}>
          {results.overallScore}%
        </div>
        <p className="portal-analyzer-summary">{results.summary}</p>
      </div>
      {results.categories?.map((cat, i) => (
        <div key={i} className="portal-analyzer-category">
          <h3 className="portal-analyzer-cat-name">{cat.name}</h3>
          <div className="portal-analyzer-items">
            {cat.items?.map((item, j) => (
              <div key={j} className="portal-analyzer-item">
                {item.status === 'pass' ? (
                  <CheckCircle2 size={15} className="portal-status-pass" />
                ) : item.status === 'partial' ? (
                  <AlertCircle size={15} className="portal-status-partial" />
                ) : (
                  <XCircle size={15} className="portal-status-fail" />
                )}
                <span className="portal-analyzer-item-name">{item.name}</span>
                <span className={`portal-analyzer-badge portal-badge-${item.status}`}>{t(`portal.${item.status}`)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Monitor History ─────────────────────────────────────────
function PortalMonitorHistory({ history }) {
  const { t } = useTranslation('app')
  const last10 = history.slice(-10)
  const latest = history[history.length - 1]
  const previous = history.length > 1 ? history[history.length - 2] : null
  const delta = previous ? latest.overallScore - previous.overallScore : null

  return (
    <div className="portal-section">
      <h2 className="portal-section-title">
        <TrendingUp size={18} />
        {t('portal.citationMonitoring')}
      </h2>
      <div className="portal-monitor-summary">
        <div className="portal-monitor-score">
          <span className="portal-monitor-score-value">{latest.overallScore}%</span>
          {delta !== null && (
            <span className={`portal-monitor-delta ${delta > 0 ? 'portal-delta-up' : delta < 0 ? 'portal-delta-down' : ''}`}>
              {delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
              {delta > 0 ? '+' : ''}{delta}%
            </span>
          )}
        </div>
        <span className="portal-monitor-sub">
          {t('portal.queriesCited', { cited: latest.queriesCited, checked: latest.queriesChecked })}
        </span>
      </div>

      {/* Mini chart */}
      {last10.length >= 2 && (
        <div className="portal-monitor-chart">
          <svg viewBox="0 0 280 50" className="portal-sparkline">
            <defs>
              <linearGradient id="portalGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-phase-4)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--color-phase-4)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const max = Math.max(...last10.map(h => h.overallScore), 100)
              const min = Math.min(...last10.map(h => h.overallScore), 0)
              const range = max - min || 1
              const pts = last10.map((h, i) => {
                const x = (i / (last10.length - 1)) * 280
                const y = 50 - ((h.overallScore - min) / range) * 50
                return `${x},${y}`
              })
              return (
                <>
                  <polygon points={`0,50 ${pts.join(' ')} 280,50`} fill="url(#portalGrad)" />
                  <polyline points={pts.join(' ')} fill="none" stroke="var(--color-phase-4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )
            })()}
          </svg>
        </div>
      )}

      {/* Latest results table */}
      {latest.results && (
        <div className="portal-monitor-results">
          {Object.entries(latest.results).map(([id, r]) => (
            <div key={id} className="portal-monitor-result-row">
              {r.cited ? (
                <CheckCircle2 size={14} className="portal-status-pass" />
              ) : (
                <XCircle size={14} className="portal-status-fail" />
              )}
              <span className="portal-monitor-query">{r.query}</span>
              <span className={`portal-analyzer-badge ${r.cited ? 'portal-badge-pass' : 'portal-badge-fail'}`}>
                {r.cited ? 'Cited' : 'Not Cited'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
