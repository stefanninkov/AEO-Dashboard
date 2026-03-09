import { memo } from 'react'
import {
  TrendingUp, TrendingDown, Minus, Activity, AlertTriangle,
  CheckCircle2, ArrowRight, BarChart3, Zap,
} from 'lucide-react'
import Sparkline from './Sparkline'

const DIRECTION_STYLES = {
  improving: { icon: TrendingUp, color: 'var(--color-success)', label: 'Improving' },
  declining: { icon: TrendingDown, color: 'var(--color-error)', label: 'Declining' },
  stable: { icon: Minus, color: 'var(--text-tertiary)', label: 'Stable' },
  volatile: { icon: Activity, color: 'var(--color-warning)', label: 'Volatile' },
}

const MOMENTUM_LABELS = {
  accelerating: 'Accelerating',
  decelerating: 'Decelerating',
  steady: 'Steady',
  none: '',
}

/**
 * TrendAnalysisPanel — Visual display of trend analysis results.
 *
 * Props:
 *   trends           — from useTrendAnalysis
 *   anomalies        — from useTrendAnalysis
 *   periodComparison — from useTrendAnalysis
 *   forecast         — from useTrendAnalysis
 *   insights         — from useTrendAnalysis
 *   historyLength    — number of data points
 *   history          — raw metricsHistory for sparklines
 */
function TrendAnalysisPanel({ trends, anomalies = [], periodComparison, forecast, insights = [], historyLength = 0, history = [] }) {
  if (!trends) {
    return (
      <div style={{
        padding: 'var(--space-6)', textAlign: 'center',
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <BarChart3 size={24} style={{ color: 'var(--text-disabled)', marginBottom: 'var(--space-2)' }} />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          Need at least 2 data points for trend analysis. Run more scans to build history.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Insights summary */}
      {insights.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
        }}>
          <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Zap size={12} style={{ color: 'var(--accent)' }} />
            Key Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {insights.map((insight, i) => {
              const color = insight.type === 'positive' ? 'var(--color-success)'
                : insight.type === 'negative' ? 'var(--color-error)'
                : 'var(--color-warning)'
              const Icon = insight.type === 'positive' ? CheckCircle2
                : insight.type === 'negative' ? TrendingDown
                : AlertTriangle
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  background: `color-mix(in srgb, ${color} 6%, transparent)`,
                }}>
                  <Icon size={12} style={{ color, flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {insight.text}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trend cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
        {Object.entries(trends).map(([key, t]) => {
          const ds = DIRECTION_STYLES[t.direction] || DIRECTION_STYLES.stable
          const Icon = ds.icon
          const sparkData = key === 'score' ? history.map(h => h.overallScore ?? 0)
            : key === 'citations' ? history.map(h => h.citations?.total ?? 0)
            : history.map(h => h.prompts?.total ?? 0)

          return (
            <div key={key} style={{
              background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.label}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: 'var(--text-2xs)', fontWeight: 600,
                  padding: '0.0625rem 0.375rem', borderRadius: 'var(--radius-sm)',
                  background: `color-mix(in srgb, ${ds.color} 12%, transparent)`,
                  color: ds.color,
                }}>
                  <Icon size={10} />
                  {ds.label}
                </span>
              </div>

              <div style={{ marginBottom: 'var(--space-2)' }}>
                <Sparkline data={sparkData.slice(-20)} width={120} height={24} stroke={ds.color} strokeWidth={1.5} fill />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)', fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>
                <span>Avg change: <b style={{ color: t.avgChange >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{t.avgChange >= 0 ? '+' : ''}{t.avgChange}</b></span>
                <span>Volatility: <b style={{ color: 'var(--text-secondary)' }}>{t.volatility}</b></span>
                <span>Momentum: <b style={{ color: 'var(--text-secondary)' }}>{MOMENTUM_LABELS[t.momentum]}</b></span>
                <span>Points: <b style={{ color: 'var(--text-secondary)' }}>{sparkData.length}</b></span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Period comparison */}
      {periodComparison && (
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
        }}>
          <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>
            Period Comparison ({periodComparison.periodLength} snapshots each)
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            {[
              { label: 'Score', ...periodComparison.score },
              { label: 'Citations', ...periodComparison.citations },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{m.label}:</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>{m.previous}</span>
                <ArrowRight size={10} style={{ color: 'var(--text-disabled)' }} />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{m.current}</span>
                <span style={{
                  fontSize: 'var(--text-2xs)', fontWeight: 600,
                  color: m.change > 0 ? 'var(--color-success)' : m.change < 0 ? 'var(--color-error)' : 'var(--text-disabled)',
                }}>
                  ({m.change > 0 ? '+' : ''}{m.change})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast */}
      {forecast && (
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Score Forecast
            </h3>
            <span style={{
              fontSize: '0.5625rem', padding: '0.0625rem 0.375rem',
              borderRadius: 'var(--radius-sm)',
              background: forecast.confidence === 'moderate' ? 'color-mix(in srgb, var(--color-info) 12%, transparent)' : 'var(--hover-bg)',
              color: forecast.confidence === 'moderate' ? 'var(--color-info)' : 'var(--text-disabled)',
              fontWeight: 600,
            }}>
              {forecast.confidence} confidence
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
            {forecast.predictions.map(p => {
              const color = p.value >= 75 ? 'var(--color-success)' : p.value >= 50 ? 'var(--color-warning)' : 'var(--color-error)'
              return (
                <div key={p.index} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${Math.max(p.value * 0.5, 8)}px`,
                    background: `color-mix(in srgb, ${color} 30%, transparent)`,
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                    border: `0.0625rem dashed ${color}`,
                    borderBottom: 'none',
                    transition: 'height 300ms',
                  }} />
                  <div style={{ fontSize: '0.5rem', fontWeight: 700, color, marginTop: '0.125rem' }}>{p.value}%</div>
                  <div style={{ fontSize: '0.4375rem', color: 'var(--text-disabled)' }}>{p.label}</div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
            Slope: {forecast.slope}/period · Direction: {forecast.direction}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
        }}>
          <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <AlertTriangle size={12} style={{ color: 'var(--color-warning)' }} />
            Anomalies Detected ({anomalies.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {anomalies.slice(0, 5).map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-2)',
                background: 'var(--hover-bg)', borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
              }}>
                <span style={{
                  fontSize: '0.5625rem', fontWeight: 700,
                  color: a.type === 'spike' ? 'var(--color-success)' : 'var(--color-error)',
                }}>
                  {a.type === 'spike' ? '↑' : '↓'} {a.value}%
                </span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.5625rem' }}>
                  expected ~{a.expected}% · {a.deviation}σ deviation
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: 'var(--text-disabled)' }}>
                  {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(TrendAnalysisPanel)
