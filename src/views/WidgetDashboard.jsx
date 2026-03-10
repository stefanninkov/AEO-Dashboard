import { useState, memo, useMemo, lazy, Suspense } from 'react'
import {
  LayoutGrid, Plus, RotateCcw, X, GripVertical,
  Zap, Globe, BarChart3, CheckCircle2, TrendingUp, TrendingDown, Minus,
  Activity, Sparkles,
} from 'lucide-react'
import { useWidgetDashboard, WIDGET_CATALOG } from '../hooks/useWidgetDashboard'
import Sparkline from '../components/Sparkline'

const GRID_COLS = 4

/**
 * WidgetDashboard — Customizable widget grid with add/remove/arrange.
 */
function WidgetDashboard({ activeProject, phases = [], setActiveView }) {
  const {
    widgets, addWidget, removeWidget, updateWidget, resetLayout, widgetCount,
  } = useWidgetDashboard({ activeProject })

  const [showCatalog, setShowCatalog] = useState(false)

  const history = activeProject?.metricsHistory || []
  const latest = history[history.length - 1] || {}
  const previous = history[history.length - 2] || {}

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-text">
          <h1 className="view-title">Custom Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={resetLayout}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-secondary)',
            }}
          >
            <RotateCcw size={10} /> Reset
          </button>
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--accent)', border: 'none',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontSize: 'var(--text-2xs)', fontWeight: 600, color: '#fff',
            }}
          >
            <Plus size={10} /> Add Widget
          </button>
        </div>
      </div>

      {/* Widget catalog */}
      {showCatalog && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
          gap: 'var(--space-2)', marginBottom: 'var(--space-4)',
          padding: 'var(--space-3)', background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
        }}>
          {WIDGET_CATALOG.map(w => (
            <button
              key={w.type}
              onClick={() => { addWidget(w.type); setShowCatalog(false) }}
              style={{
                padding: 'var(--space-2) var(--space-3)', textAlign: 'left',
                background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                transition: 'border-color 100ms',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {w.label}
              </div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>
                {w.description}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Widget grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gap: 'var(--space-3)',
        gridAutoRows: 'minmax(8rem, auto)',
      }}>
        {widgets.map(widget => (
          <div
            key={widget.id}
            style={{
              gridColumn: `span ${Math.min(widget.w, GRID_COLS)}`,
              gridRow: `span ${widget.h}`,
              background: 'var(--bg-card)',
              border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Widget header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-2) var(--space-3)',
              borderBottom: '0.0625rem solid var(--border-subtle)',
              flexShrink: 0,
            }}>
              <GripVertical size={10} style={{ color: 'var(--text-disabled)', cursor: 'grab' }} />
              <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {widget.title}
              </span>
              <button
                onClick={() => removeWidget(widget.id)}
                className="btn-icon-sm"
                title="Remove"
                style={{ color: 'var(--text-disabled)', opacity: 0.5 }}
              >
                <X size={10} />
              </button>
            </div>

            {/* Widget content */}
            <div style={{ flex: 1, padding: 'var(--space-3)', overflow: 'hidden' }}>
              <WidgetContent
                widget={widget}
                activeProject={activeProject}
                latest={latest}
                previous={previous}
                history={history}
                phases={phases}
              />
            </div>
          </div>
        ))}
      </div>

      {widgets.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 'var(--space-8)', textAlign: 'center',
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <LayoutGrid size={32} style={{ color: 'var(--text-disabled)', marginBottom: 'var(--space-3)' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>
            Your dashboard is empty. Click "Add Widget" to get started.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * WidgetContent — Renders the appropriate content for each widget type.
 */
function WidgetContent({ widget, activeProject, latest, previous, history, phases }) {
  switch (widget.type) {
    case 'stat':
      return <StatWidget config={widget.config} latest={latest} previous={previous} activeProject={activeProject} />
    case 'line-chart':
      return <LineChartWidget history={history} />
    case 'pie-chart':
    case 'engine-breakdown':
      return <EngineWidget latest={latest} />
    case 'score-history':
      return <ScoreHistoryWidget history={history} />
    case 'checklist-progress':
      return <ChecklistWidget activeProject={activeProject} phases={phases} />
    case 'activity-feed':
      return <ActivityWidget activeProject={activeProject} />
    case 'trend-summary':
      return <TrendWidget history={history} />
    default:
      return <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>Unknown widget type</div>
  }
}

function StatWidget({ config, latest, previous, activeProject }) {
  const metric = config?.metric || 'overallScore'
  const METRIC_MAP = {
    overallScore: { label: 'AEO Score', icon: Zap, color: 'var(--accent)', getValue: (l) => l?.overallScore ?? 0, format: v => `${v}%`, getPrev: (p) => p?.overallScore ?? 0 },
    citations: { label: 'Citations', icon: Globe, color: 'var(--color-phase-3)', getValue: (l) => l?.citations?.total ?? 0, format: v => v.toLocaleString(), getPrev: (p) => p?.citations?.total ?? 0 },
    prompts: { label: 'Prompts', icon: BarChart3, color: 'var(--color-phase-2)', getValue: (l) => l?.prompts?.total ?? 0, format: v => v.toLocaleString(), getPrev: (p) => p?.prompts?.total ?? 0 },
    engines: { label: 'AI Engines', icon: Sparkles, color: 'var(--color-phase-5)', getValue: (l) => l?.citations?.byEngine?.filter(e => e.citations > 0).length ?? 0, format: v => v, getPrev: () => 0 },
    checklist: { label: 'Tasks Done', icon: CheckCircle2, color: 'var(--color-success)', getValue: () => Object.values(activeProject?.checked || {}).filter(Boolean).length, format: v => v, getPrev: () => 0 },
  }
  const m = METRIC_MAP[metric] || METRIC_MAP.overallScore
  const value = m.getValue(latest)
  const prev = m.getPrev(previous)
  const trend = prev > 0 ? Math.round(((value - prev) / prev) * 100) : 0
  const Icon = m.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '50%', marginBottom: 'var(--space-2)',
        background: `color-mix(in srgb, ${m.color} 12%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} style={{ color: m.color }} />
      </div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)' }}>
        {m.format(value)}
      </div>
      {trend !== 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.125rem',
          fontSize: 'var(--text-2xs)', fontWeight: 600, marginTop: 'var(--space-1)',
          color: trend > 0 ? 'var(--color-success)' : 'var(--color-error)',
        }}>
          {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  )
}

function LineChartWidget({ history }) {
  const data = history.slice(-14).map(h => h.overallScore ?? 0)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {data.length > 1 ? (
        <Sparkline data={data} width={200} height={60} stroke="var(--accent)" strokeWidth={2} />
      ) : (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>Not enough data</span>
      )}
    </div>
  )
}

function EngineWidget({ latest }) {
  const engines = latest?.citations?.byEngine?.filter(e => e.citations > 0) || []
  if (engines.length === 0) return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>No engine data</span>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', height: '100%', justifyContent: 'center' }}>
      {engines.slice(0, 5).map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)', width: '4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {e.engine}
          </span>
          <div style={{ flex: 1, height: '0.375rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <div style={{ width: `${e.share || 0}%`, height: '100%', background: e.color || 'var(--accent)', borderRadius: 'var(--radius-sm)' }} />
          </div>
          <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', width: '2rem', textAlign: 'right' }}>
            {e.citations}
          </span>
        </div>
      ))}
    </div>
  )
}

function ScoreHistoryWidget({ history }) {
  const scores = history.slice(-30).map(h => h.overallScore ?? 0)
  const latest = scores[scores.length - 1] || 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'var(--space-2)' }}>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        {latest}%
      </div>
      {scores.length > 1 && (
        <Sparkline data={scores} width={250} height={40} stroke="var(--accent)" strokeWidth={2} fill />
      )}
      <span style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>{scores.length} data points</span>
    </div>
  )
}

function ChecklistWidget({ activeProject, phases }) {
  if (!phases?.length) return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>No checklist data</span>
  const checked = activeProject?.checked || {}
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', height: '100%', justifyContent: 'center' }}>
      {phases.slice(0, 6).map(phase => {
        const total = phase.items?.length || 0
        const done = (phase.items || []).filter(i => checked[i.id]).length
        const pct = total > 0 ? Math.round((done / total) * 100) : 0
        return (
          <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', width: '4.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {phase.title || phase.id}
            </span>
            <div style={{ flex: 1, height: '0.375rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: phase.color || 'var(--accent)', borderRadius: 'var(--radius-sm)', transition: 'width 300ms' }} />
            </div>
            <span style={{ fontSize: '0.5rem', color: 'var(--text-disabled)', fontVariantNumeric: 'tabular-nums', width: '2rem', textAlign: 'right' }}>
              {pct}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ActivityWidget({ activeProject }) {
  const activity = (activeProject?.activityLog || []).slice(0, 6)
  if (activity.length === 0) return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>No recent activity</span>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', overflow: 'auto', height: '100%' }}>
      {activity.map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-1) 0' }}>
          <Activity size={10} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.5625rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <b>{a.authorName || 'System'}</b> {a.type}
          </span>
        </div>
      ))}
    </div>
  )
}

function TrendWidget({ history }) {
  if (history.length < 2) return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>Not enough data</span>

  const latest = history[history.length - 1]
  const prev = history[history.length - 2]

  const metrics = [
    { label: 'Score', current: latest.overallScore ?? 0, prev: prev.overallScore ?? 0, color: 'var(--accent)' },
    { label: 'Citations', current: latest.citations?.total ?? 0, prev: prev.citations?.total ?? 0, color: 'var(--color-phase-3)' },
    { label: 'Prompts', current: latest.prompts?.total ?? 0, prev: prev.prompts?.total ?? 0, color: 'var(--color-phase-2)' },
  ]

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {metrics.map(m => {
        const delta = m.prev > 0 ? Math.round(((m.current - m.prev) / m.prev) * 100) : 0
        return (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', marginBottom: '0.125rem' }}>{m.label}</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {m.current.toLocaleString()}
            </div>
            {delta !== 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.125rem',
                fontSize: '0.5625rem', fontWeight: 600,
                color: delta > 0 ? 'var(--color-success)' : 'var(--color-error)',
              }}>
                {delta > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                {delta > 0 ? '+' : ''}{delta}%
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default memo(WidgetDashboard)
