import { memo, useState } from 'react'
import {
  FileText, Download, TrendingUp, TrendingDown, Minus,
  Globe, Zap, CheckCircle2, BarChart3, Workflow,
  ToggleLeft, ToggleRight,
} from 'lucide-react'

/**
 * DigestPreview — Renders a preview of the digest report.
 * Supports both single-project and portfolio modes.
 *
 * Props:
 *   projectReport   — from useDigestReport
 *   portfolioReport — from useDigestReport
 *   onExport        — callback(reportType) to export JSON
 */
function DigestPreview({ projectReport, portfolioReport, onExport }) {
  const [mode, setMode] = useState(portfolioReport ? 'portfolio' : 'project')

  const report = mode === 'portfolio' ? portfolioReport : projectReport
  if (!report) {
    return (
      <div style={{
        padding: 'var(--space-6)', textAlign: 'center',
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <FileText size={24} style={{ color: 'var(--text-disabled)', marginBottom: 'var(--space-2)' }} />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          No data available for digest report
        </p>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '0.0625rem solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <FileText size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Digest Preview
          </span>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>{today}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Mode toggle */}
          {portfolioReport && projectReport && (
            <div style={{ display: 'flex', gap: 'var(--space-1)', background: 'var(--hover-bg)', borderRadius: 'var(--radius-md)', padding: '0.125rem' }}>
              {['project', 'portfolio'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '0.125rem 0.5rem', fontSize: 'var(--text-2xs)', fontWeight: 600,
                    borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                    background: mode === m ? 'var(--accent)' : 'transparent',
                    color: mode === m ? '#fff' : 'var(--text-tertiary)',
                    textTransform: 'capitalize',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => onExport?.(mode)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-secondary)',
            }}
          >
            <Download size={10} /> Export
          </button>
        </div>
      </div>

      {/* Report body */}
      <div style={{ padding: 'var(--space-4)' }}>
        {mode === 'project' ? (
          <ProjectDigest report={report} />
        ) : (
          <PortfolioDigest report={report} />
        )}
      </div>
    </div>
  )
}

function ProjectDigest({ report }) {
  const m = report.metrics
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Project name */}
      <div>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.125rem' }}>
          {report.project.name}
        </h3>
        {report.project.url && (
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>{report.project.url}</span>
        )}
      </div>

      {/* Metric grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
        <MetricCell icon={Zap} color="var(--accent)" label="AEO Score" value={`${m.score}%`} delta={m.scoreDelta} deltaLabel="pts" />
        <MetricCell icon={Globe} color="var(--color-phase-3)" label="Citations" value={m.citations} delta={m.citationsDelta} deltaLabel="%" />
        <MetricCell icon={BarChart3} color="var(--color-phase-2)" label="Prompts" value={m.prompts} />
        <MetricCell icon={CheckCircle2} color="var(--color-success)" label="Tasks Done" value={m.checkedCount} />
      </div>

      {/* Activity summary */}
      {report.activity.total > 0 && (
        <div>
          <h4 style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03rem', margin: '0 0 var(--space-1)' }}>
            Recent Activity ({report.activity.total})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
            {Object.entries(report.activity.byType).map(([type, count]) => (
              <span key={type} style={{
                fontSize: 'var(--text-2xs)', padding: '0.125rem 0.375rem',
                background: 'var(--hover-bg)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
              }}>
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Automation stats */}
      {report.automation.totalRules > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <Workflow size={12} style={{ color: 'var(--accent)' }} />
          {report.automation.enabledRules} active rules, {report.automation.rulesTriggered} triggered this week
        </div>
      )}
    </div>
  )
}

function PortfolioDigest({ report }) {
  const p = report.portfolio
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Aggregate */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
        <MetricCell icon={Zap} color="var(--accent)" label="Avg Score" value={`${p.avgScore}%`} />
        <MetricCell icon={Globe} color="var(--color-phase-3)" label="Citations" value={p.totalCitations} />
        <MetricCell icon={BarChart3} color="var(--color-phase-2)" label="Projects" value={p.projectCount} />
        <MetricCell icon={CheckCircle2} color="var(--color-success)" label="Avg Checklist" value={`${p.avgChecklist}%`} />
      </div>

      {/* Project table */}
      <div>
        <h4 style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03rem', margin: '0 0 var(--space-1)' }}>
          Projects
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {report.projects.slice(0, 8).map((proj, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-2)',
              background: i % 2 === 0 ? 'var(--hover-bg)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {proj.name}
              </span>
              <ScorePill score={proj.score} />
              <TrendIndicator value={proj.scoreTrend} />
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', width: '3.5rem', textAlign: 'right' }}>
                {proj.citations} cit.
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Needs attention */}
      {report.needsAttention.length > 0 && (
        <div style={{
          padding: 'var(--space-2) var(--space-3)',
          background: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
          borderRadius: 'var(--radius-md)',
        }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning)' }}>
            Needs Attention:
          </span>{' '}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {report.needsAttention.map(p => `${p.name} (${p.score}%)`).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}

function MetricCell({ icon: Icon, color, label, value, delta, deltaLabel = '' }) {
  return (
    <div style={{
      padding: 'var(--space-2)', background: 'var(--hover-bg)',
      borderRadius: 'var(--radius-md)', textAlign: 'center',
    }}>
      <Icon size={12} style={{ color, marginBottom: '0.25rem' }} />
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>{label}</div>
      {delta != null && delta !== 0 && (
        <div style={{ fontSize: '0.5rem', fontWeight: 600, color: delta > 0 ? 'var(--color-success)' : 'var(--color-error)', marginTop: '0.125rem' }}>
          {delta > 0 ? '+' : ''}{delta}{deltaLabel}
        </div>
      )}
    </div>
  )
}

function ScorePill({ score }) {
  const color = score >= 75 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-error)'
  return (
    <span style={{
      fontSize: 'var(--text-2xs)', fontWeight: 700, padding: '0.0625rem 0.375rem',
      borderRadius: 'var(--radius-sm)',
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      color, fontVariantNumeric: 'tabular-nums',
    }}>
      {score}%
    </span>
  )
}

function TrendIndicator({ value }) {
  if (!value) return <Minus size={8} style={{ color: 'var(--text-disabled)' }} />
  return value > 0
    ? <TrendingUp size={10} style={{ color: 'var(--color-success)' }} />
    : <TrendingDown size={10} style={{ color: 'var(--color-error)' }} />
}

export default memo(DigestPreview)
