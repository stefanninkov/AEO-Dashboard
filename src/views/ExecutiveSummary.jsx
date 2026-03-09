import { memo, useMemo, useRef } from 'react'
import {
  FileText, TrendingUp, TrendingDown, Minus, Globe, Zap,
  CheckCircle2, AlertTriangle, Download, BarChart3, Users,
} from 'lucide-react'
import Sparkline from '../components/Sparkline'

/**
 * ExecutiveSummary — Clean, printable stakeholder report.
 *
 * Shows: headline metrics, project health cards, key findings,
 * and recommendations. Designed for export / screenshare.
 *
 * Props:
 *   projectSummaries  — from usePortfolio
 *   portfolioStats    — from usePortfolio
 *   userName          — current user's name for attribution
 *   projectName       — active project name (if single-project mode)
 *   activeProject     — active project data
 */
function ExecutiveSummary({ projectSummaries = [], portfolioStats = {}, userName, projectName, activeProject }) {
  const containerRef = useRef(null)

  // Generate key findings automatically
  const findings = useMemo(() => {
    const items = []
    const ps = portfolioStats

    if (ps.avgScore >= 75) {
      items.push({ type: 'success', text: `Portfolio average AEO score is strong at ${ps.avgScore}%` })
    } else if (ps.avgScore >= 50) {
      items.push({ type: 'warning', text: `Portfolio average AEO score is ${ps.avgScore}% — room for improvement` })
    } else if (ps.projectCount > 0) {
      items.push({ type: 'error', text: `Portfolio average AEO score is ${ps.avgScore}% — immediate action needed` })
    }

    if (ps.totalCitations > 0) {
      items.push({ type: 'info', text: `${ps.totalCitations.toLocaleString()} total AI citations across ${ps.projectCount} projects` })
    }

    if (ps.avgChecklist < 50 && ps.projectCount > 0) {
      items.push({ type: 'warning', text: `Checklist completion averages only ${ps.avgChecklist}% — many optimization steps remain` })
    }

    const attention = ps.needsAttention || []
    if (attention.length > 0) {
      items.push({ type: 'error', text: `${attention.length} project${attention.length > 1 ? 's' : ''} need${attention.length === 1 ? 's' : ''} attention: ${attention.map(p => p.name).join(', ')}` })
    }

    // Top performing project
    const top = projectSummaries[0]
    if (top && projectSummaries.length > 1) {
      items.push({ type: 'success', text: `Top performing project: "${top.name}" at ${top.overallScore}% score with ${top.citations} citations` })
    }

    // Score trend insights
    const improving = projectSummaries.filter(p => p.scoreTrend > 0)
    const declining = projectSummaries.filter(p => p.scoreTrend < 0)
    if (improving.length > 0) {
      items.push({ type: 'success', text: `${improving.length} project${improving.length > 1 ? 's' : ''} showing score improvement` })
    }
    if (declining.length > 0) {
      items.push({ type: 'warning', text: `${declining.length} project${declining.length > 1 ? 's' : ''} showing declining scores` })
    }

    return items
  }, [projectSummaries, portfolioStats])

  // Recommendations
  const recommendations = useMemo(() => {
    const items = []
    const ps = portfolioStats
    if (ps.avgChecklist < 50) items.push('Complete more AEO checklist items across all projects to build a stronger optimization foundation')
    if (ps.avgScore < 75) items.push('Focus on improving AEO scores for underperforming projects — prioritize technical and content optimizations')
    if (ps.activeEngines < 3) items.push('Expand AI engine coverage — ensure content is optimized for multiple AI platforms')
    if ((ps.needsAttention || []).length > 0) items.push('Address the flagged projects immediately — projects scoring below 50% risk losing AI visibility')
    if (ps.totalCitations === 0) items.push('Run analysis scans to begin tracking AI citations and engine visibility')
    if (items.length === 0) items.push('Continue monitoring and maintain your strong AEO posture across all projects')
    return items
  }, [portfolioStats])

  const handlePrint = () => window.print()

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div ref={containerRef} style={{ padding: 'var(--space-6)', maxWidth: '52rem', margin: '0 auto' }}>
      {/* Report header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)',
        borderBottom: '0.125rem solid var(--accent)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <FileText size={20} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              AEO Executive Summary
            </h1>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>
            {today} {userName ? ` · Prepared by ${userName}` : ''}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="btn-secondary"
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)',
          }}
        >
          <Download size={12} /> Export
        </button>
      </div>

      {/* Headline numbers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-3)', marginBottom: 'var(--space-6)',
      }}>
        <HeadlineCard label="Portfolio Score" value={`${portfolioStats.avgScore || 0}%`} icon={Zap} color="var(--accent)" />
        <HeadlineCard label="Total Citations" value={portfolioStats.totalCitations || 0} icon={Globe} color="var(--color-phase-3)" />
        <HeadlineCard label="Projects" value={portfolioStats.projectCount || 0} icon={BarChart3} color="var(--color-phase-2)" />
        <HeadlineCard label="Avg. Completion" value={`${portfolioStats.avgChecklist || 0}%`} icon={CheckCircle2} color="var(--color-success)" />
      </div>

      {/* Key findings */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', fontFamily: 'var(--font-heading)' }}>
          Key Findings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {findings.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: f.type === 'success' ? 'color-mix(in srgb, var(--color-success) 8%, transparent)'
                : f.type === 'error' ? 'color-mix(in srgb, var(--color-error) 8%, transparent)'
                : f.type === 'warning' ? 'color-mix(in srgb, var(--color-warning) 8%, transparent)'
                : 'var(--hover-bg)',
            }}>
              {f.type === 'success' && <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 1 }} />}
              {f.type === 'error' && <AlertTriangle size={14} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: 1 }} />}
              {f.type === 'warning' && <AlertTriangle size={14} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 1 }} />}
              {f.type === 'info' && <Globe size={14} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 1 }} />}
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Project health cards */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', fontFamily: 'var(--font-heading)' }}>
          Project Health
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))', gap: 'var(--space-3)' }}>
          {projectSummaries.map(p => {
            const color = p.overallScore >= 75 ? 'var(--color-success)' : p.overallScore >= 50 ? 'var(--color-warning)' : 'var(--color-error)'
            return (
              <div key={p.id} style={{
                background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
                borderLeft: `0.1875rem solid ${color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '10rem' }}>
                      {p.name}
                    </div>
                    {p.url && (
                      <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '10rem' }}>
                        {p.url}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-lg)', fontWeight: 700, color,
                    fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                  }}>
                    {p.overallScore}%
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <Sparkline data={p.scoreSparkline} width={60} height={16} stroke={color} />
                  <TrendLabel value={p.scoreTrend} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)', fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>
                  <span>Citations: <b style={{ color: 'var(--text-secondary)' }}>{p.citations}</b></span>
                  <span>Checklist: <b style={{ color: 'var(--text-secondary)' }}>{p.checklistPercent}%</b></span>
                  <span>Engines: <b style={{ color: 'var(--text-secondary)' }}>{p.engines}</b></span>
                  <span>Team: <b style={{ color: 'var(--text-secondary)' }}>{p.memberCount}</b></span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', fontFamily: 'var(--font-heading)' }}>
          Recommendations
        </h2>
        <ol style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
          {recommendations.map((r, i) => (
            <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>
              {r}
            </li>
          ))}
        </ol>
      </section>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          [data-exec-summary], [data-exec-summary] * { visibility: visible; }
          [data-exec-summary] { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function HeadlineCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center',
    }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '50%', margin: '0 auto var(--space-2)',
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function TrendLabel({ value }) {
  if (!value) return <span style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>— flat</span>
  const positive = value > 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.125rem',
      fontSize: '0.5625rem', fontWeight: 600,
      color: positive ? 'var(--color-success)' : 'var(--color-error)',
    }}>
      {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {positive ? '+' : ''}{value} pts
    </span>
  )
}

export default memo(ExecutiveSummary)
