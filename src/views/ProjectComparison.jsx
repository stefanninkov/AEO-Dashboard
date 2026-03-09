import { useState, useMemo, memo } from 'react'
import { GitCompareArrows, ChevronDown, Check, Trophy, AlertTriangle, Globe, Zap, CheckCircle2, BarChart3 } from 'lucide-react'
import Sparkline from '../components/Sparkline'

const METRICS = [
  { key: 'overallScore', label: 'AEO Score', format: v => `${v}%`, icon: Zap, color: 'var(--accent)' },
  { key: 'citations', label: 'Citations', format: v => v.toLocaleString(), icon: Globe, color: 'var(--color-phase-3)' },
  { key: 'prompts', label: 'Prompts', format: v => v.toLocaleString(), icon: BarChart3, color: 'var(--color-phase-2)' },
  { key: 'checklistPercent', label: 'Checklist', format: v => `${v}%`, icon: CheckCircle2, color: 'var(--color-success)' },
  { key: 'engines', label: 'AI Engines', format: v => v, icon: Zap, color: 'var(--color-phase-5)' },
]

/**
 * ProjectComparison — Side-by-side comparison of 2-4 projects.
 */
function ProjectComparison({ projectSummaries = [], onSelectProject }) {
  const [selected, setSelected] = useState(() =>
    projectSummaries.slice(0, Math.min(3, projectSummaries.length)).map(p => p.id)
  )
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const compared = useMemo(() =>
    selected.map(id => projectSummaries.find(p => p.id === id)).filter(Boolean),
    [selected, projectSummaries]
  )

  const toggleProject = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 4) return prev
      return [...prev, id]
    })
  }

  // Find winner per metric
  const winners = useMemo(() => {
    const result = {}
    METRICS.forEach(m => {
      if (compared.length < 2) return
      const best = compared.reduce((a, b) => (b[m.key] ?? 0) > (a[m.key] ?? 0) ? b : a)
      result[m.key] = best.id
    })
    return result
  }, [compared])

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '76rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
        <GitCompareArrows size={18} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Compare Projects
        </h1>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: '0 0 var(--space-4)' }}>
        Select up to 4 projects for side-by-side comparison
      </p>

      {/* Project selector */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
          }}
        >
          {selected.length} project{selected.length !== 1 ? 's' : ''} selected
          <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
        </button>
        {dropdownOpen && (
          <>
            <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 'var(--space-1)',
              background: 'var(--bg-card)', border: '0.0625rem solid var(--border-default)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
              zIndex: 50, minWidth: '16rem', maxHeight: '16rem', overflowY: 'auto',
            }}>
              {projectSummaries.map(p => {
                const isSelected = selected.includes(p.id)
                const disabled = !isSelected && selected.length >= 4
                return (
                  <button
                    key={p.id}
                    onClick={() => !disabled && toggleProject(p.id)}
                    disabled={disabled}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                      width: '100%', padding: 'var(--space-2) var(--space-3)',
                      background: isSelected ? 'var(--hover-bg)' : 'transparent',
                      border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-primary)',
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    <div style={{
                      width: '1rem', height: '1rem', borderRadius: 'var(--radius-sm)',
                      border: `0.0625rem solid ${isSelected ? 'var(--accent)' : 'var(--border-default)'}`,
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <Check size={10} style={{ color: '#fff' }} />}
                    </div>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
                      {p.overallScore}%
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {compared.length < 2 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-8)', background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <GitCompareArrows size={32} style={{ color: 'var(--text-disabled)', marginBottom: 'var(--space-3)' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            Select at least 2 projects to compare
          </p>
        </div>
      ) : (
        <>
          {/* Comparison grid */}
          <div style={{
            background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-4)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03rem', width: '8rem' }}>
                    Metric
                  </th>
                  {compared.map(p => (
                    <th key={p.id} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <button
                        onClick={() => onSelectProject?.(p.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 'var(--text-xs)' }}
                      >
                        {p.name}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map(m => (
                  <tr key={m.key} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <m.icon size={12} style={{ color: m.color }} />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>{m.label}</span>
                    </td>
                    {compared.map(p => {
                      const isWinner = winners[m.key] === p.id
                      return (
                        <td key={p.id} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                            <span style={{
                              fontSize: 'var(--text-sm)', fontWeight: 700,
                              color: isWinner ? 'var(--color-success)' : 'var(--text-primary)',
                              fontVariantNumeric: 'tabular-nums',
                            }}>
                              {isWinner && <Trophy size={10} style={{ marginRight: '0.25rem', color: 'var(--color-warning)' }} />}
                              {m.format(p[m.key] ?? 0)}
                            </span>
                            {m.key === 'overallScore' && (
                              <Sparkline data={p.scoreSparkline} width={50} height={12} stroke={m.color} />
                            )}
                            {m.key === 'citations' && (
                              <Sparkline data={p.citationsSparkline} width={50} height={12} stroke={m.color} />
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {/* Trend row */}
                <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>Score Trend</span>
                  </td>
                  {compared.map(p => (
                    <td key={p.id} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        color: p.scoreTrend > 0 ? 'var(--color-success)' : p.scoreTrend < 0 ? 'var(--color-error)' : 'var(--text-disabled)',
                      }}>
                        {p.scoreTrend > 0 ? '+' : ''}{p.scoreTrend} pts
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Team size row */}
                <tr>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>Team Size</span>
                  </td>
                  {compared.map(p => (
                    <td key={p.id} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.memberCount} member{p.memberCount !== 1 ? 's' : ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Per-project radar-style breakdown */}
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${compared.length}, 1fr)`,
            gap: 'var(--space-3)',
          }}>
            {compared.map(p => (
              <div key={p.id} style={{
                background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
              }}>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </h4>
                {METRICS.map(m => {
                  const maxVal = Math.max(...compared.map(c => c[m.key] ?? 0), 1)
                  const pct = m.key.includes('Percent') || m.key === 'overallScore'
                    ? (p[m.key] ?? 0)
                    : Math.round(((p[m.key] ?? 0) / maxVal) * 100)
                  return (
                    <div key={m.key} style={{ marginBottom: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.125rem' }}>
                        <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>{m.label}</span>
                        <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                          {m.format(p[m.key] ?? 0)}
                        </span>
                      </div>
                      <div style={{ height: '0.25rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(pct, 100)}%`, height: '100%',
                          background: m.color, borderRadius: 'var(--radius-sm)',
                          transition: 'width 300ms',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default memo(ProjectComparison)
