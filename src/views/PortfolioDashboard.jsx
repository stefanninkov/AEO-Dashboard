import { memo, useState } from 'react'
import {
  Briefcase, TrendingUp, TrendingDown, Minus, Globe, Zap,
  BarChart3, Users, AlertTriangle, ArrowRight, CheckCircle2,
} from 'lucide-react'
import Sparkline from '../components/Sparkline'

/**
 * PortfolioDashboard — Multi-project overview with aggregated metrics,
 * project ranking table, and health distribution.
 *
 * Props:
 *   projectSummaries  — from usePortfolio
 *   portfolioStats    — from usePortfolio
 *   scoreDistribution — from usePortfolio
 *   onSelectProject   — callback(projectId) to switch active project
 *   setActiveView     — navigate to other views
 */
function PortfolioDashboard({ projectSummaries = [], portfolioStats = {}, scoreDistribution = [], onSelectProject, setActiveView }) {
  const [sortKey, setSortKey] = useState('overallScore')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = [...projectSummaries].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    return sortDir === 'desc' ? bv - av : av - bv
  })

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '76rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          <Briefcase size={18} style={{ color: 'var(--accent)' }} />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Portfolio Overview
          </h1>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>
          {portfolioStats.projectCount || 0} projects across your organization
        </p>
      </div>

      {/* Aggregate stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
        gap: 'var(--space-3)', marginBottom: 'var(--space-6)',
      }}>
        <AggCard icon={<Zap size={14} />} color="var(--accent)" label="Avg. AEO Score" value={`${portfolioStats.avgScore || 0}%`} />
        <AggCard icon={<Globe size={14} />} color="var(--color-phase-3)" label="Total Citations" value={portfolioStats.totalCitations || 0} />
        <AggCard icon={<BarChart3 size={14} />} color="var(--color-phase-2)" label="Total Prompts" value={portfolioStats.totalPrompts || 0} />
        <AggCard icon={<CheckCircle2 size={14} />} color="var(--color-success)" label="Avg. Checklist" value={`${portfolioStats.avgChecklist || 0}%`} />
        <AggCard icon={<Users size={14} />} color="var(--color-phase-4)" label="AI Engines" value={portfolioStats.activeEngines || 0} />
      </div>

      {/* Score distribution + Needs attention */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-4)', marginBottom: 'var(--space-6)',
      }}>
        {/* Distribution */}
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)' }}>
            Score Distribution
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', height: '4rem' }}>
            {scoreDistribution.map(b => {
              const maxCount = Math.max(...scoreDistribution.map(d => d.count), 1)
              const height = b.count > 0 ? Math.max((b.count / maxCount) * 100, 12) : 4
              return (
                <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{b.count}</span>
                  <div style={{
                    width: '100%', height: `${height}%`, minHeight: '0.25rem',
                    background: b.color, borderRadius: 'var(--radius-sm)',
                    transition: 'height 300ms',
                  }} />
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)' }}>{b.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Needs attention */}
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <AlertTriangle size={12} style={{ color: 'var(--color-warning)' }} />
            Needs Attention
          </h3>
          {(portfolioStats.needsAttention || []).length === 0 ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>All projects healthy</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {(portfolioStats.needsAttention || []).slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectProject?.(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-2)', borderRadius: 'var(--radius-md)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    width: '100%', textAlign: 'left', transition: 'background 100ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontSize: 'var(--text-2xs)', fontWeight: 700, padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--radius-sm)',
                    background: p.overallScore < 50 ? 'color-mix(in srgb, var(--color-error) 12%, transparent)' : 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
                    color: p.overallScore < 50 ? 'var(--color-error)' : 'var(--color-warning)',
                  }}>
                    {p.overallScore}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project ranking table */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            All Projects
          </h3>
          {setActiveView && (
            <button
              onClick={() => setActiveView('comparison')}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                fontSize: 'var(--text-2xs)', color: 'var(--accent)',
                background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Compare <ArrowRight size={10} />
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                <SortHeader label="#" sortKey={null} />
                <SortHeader label="Project" sortKey="name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Score" sortKey="overallScore" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Trend" sortKey="scoreTrend" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Citations" sortKey="citations" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Checklist" sortKey="checklistPercent" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Engines" sortKey="engines" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Team" sortKey="memberCount" current={sortKey} dir={sortDir} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject?.(p.id)}
                  style={{ cursor: 'pointer', borderBottom: '0.0625rem solid var(--border-subtle)', transition: 'background 100ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-disabled)', fontWeight: 600, width: '2rem' }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '14rem' }}>
                      {p.name}
                    </div>
                    {p.url && (
                      <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '14rem' }}>
                        {p.url}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <ScoreBadge score={p.overallScore} />
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Sparkline data={p.scoreSparkline} width={40} height={14} stroke={p.scoreTrend >= 0 ? 'var(--color-success)' : 'var(--color-error)'} />
                      <TrendBadge value={p.scoreTrend} />
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.citations.toLocaleString()}
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{
                        flex: 1, height: '0.375rem', background: 'var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxWidth: '4rem',
                      }}>
                        <div style={{
                          width: `${p.checklistPercent}%`, height: '100%',
                          background: p.checklistPercent >= 75 ? 'var(--color-success)' : p.checklistPercent >= 50 ? 'var(--color-warning)' : 'var(--color-error)',
                          borderRadius: 'var(--radius-sm)', transition: 'width 300ms',
                        }} />
                      </div>
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                        {p.checklistPercent}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {p.engines}
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {p.memberCount}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No projects yet. Create your first project to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AggCard({ icon, color, label, value }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <div style={{
          width: '1.5rem', height: '1.5rem', borderRadius: 'var(--radius-md)',
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  )
}

function ScoreBadge({ score }) {
  const color = score >= 75 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-error)'
  return (
    <span style={{
      fontSize: 'var(--text-2xs)', fontWeight: 700, padding: '0.125rem 0.5rem',
      borderRadius: 'var(--radius-sm)',
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      color, fontVariantNumeric: 'tabular-nums',
    }}>
      {score}%
    </span>
  )
}

function TrendBadge({ value }) {
  if (!value) return <Minus size={10} style={{ color: 'var(--text-disabled)' }} />
  const positive = value > 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.125rem',
      fontSize: '0.5625rem', fontWeight: 600,
      color: positive ? 'var(--color-success)' : 'var(--color-error)',
    }}>
      {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {positive ? '+' : ''}{value}
    </span>
  )
}

function SortHeader({ label, sortKey, current, dir, onSort }) {
  const active = sortKey && current === sortKey
  return (
    <th
      onClick={sortKey ? () => onSort(sortKey) : undefined}
      style={{
        padding: 'var(--space-2) var(--space-3)', textAlign: 'left',
        fontSize: 'var(--text-2xs)', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-tertiary)',
        textTransform: 'uppercase', letterSpacing: '0.03rem',
        cursor: sortKey ? 'pointer' : 'default', whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {label}
      {active && <span style={{ marginLeft: '0.125rem' }}>{dir === 'desc' ? '↓' : '↑'}</span>}
    </th>
  )
}

export default memo(PortfolioDashboard)
