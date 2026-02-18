import { useState } from 'react'
import {
  Users, Plus, Trash2, RefreshCw, Loader2, AlertCircle, TrendingUp,
  TrendingDown, Minus, ExternalLink, Lightbulb, Target, Sparkles
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { useCompetitorAnalysis } from '../../hooks/useCompetitorAnalysis'
import { INDUSTRY_COMPETITORS, INDUSTRY_LABELS } from '../../utils/getRecommendations'

export const CATEGORY_LABELS = {
  conversational: 'Conversational',
  factual: 'Factual',
  industrySpecific: 'Industry',
  comparison: 'Comparison',
  technical: 'Technical',
}

export function getHeatColor(score) {
  if (score >= 75) return { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--color-success)' }
  if (score >= 65) return { bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--color-warning)' }
  return { bg: 'rgba(239, 68, 68, 0.12)', text: 'var(--color-error)' }
}

export function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp size={14} style={{ color: 'var(--color-success)' }} />
  if (trend === 'down') return <TrendingDown size={14} style={{ color: 'var(--color-error)' }} />
  return <Minus size={14} style={{ color: 'var(--text-tertiary)' }} />
}

export function MiniSparkline({ data }) {
  if (!data || data.length < 2) return <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>--</span>
  return (
    <ResponsiveContainer width={80} height={28}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="score" stroke="var(--color-phase-1)" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function CompetitorsOverviewTab({ activeProject, updateProject, user }) {
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const {
    analyzing, progress, error,
    addCompetitor, removeCompetitor, analyzeCompetitors,
  } = useCompetitorAnalysis({ activeProject, updateProject, user })

  const competitors = activeProject?.competitors || []
  const analysis = activeProject?.competitorAnalysis
  const heatMap = analysis?.heatMap
  const aiSummary = analysis?.aiSummary

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return
    addCompetitor(newName.trim(), newUrl.trim())
    setNewName('')
    setNewUrl('')
  }

  const sorted = [...competitors].sort((a, b) => b.aeoScore - a.aeoScore)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Add Competitor Form */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '8.75rem' }}>
            <label htmlFor="competitor-name" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Company Name</label>
            <input
              id="competitor-name"
              className="input-field"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. TechLeader"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div style={{ flex: 2, minWidth: '12.5rem' }}>
            <label htmlFor="competitor-url" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Website URL</label>
            <input
              id="competitor-url"
              className="input-field"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={!newName.trim() || !newUrl.trim()}
            style={{ padding: '0.625rem 1.125rem', fontSize: '0.8125rem', flexShrink: 0 }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Run Analysis button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-primary"
          onClick={analyzeCompetitors}
          disabled={analyzing || competitors.length === 0}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          {analyzing ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Industry Suggestions */}
      {activeProject?.questionnaire?.industry && INDUSTRY_COMPETITORS[activeProject.questionnaire.industry] && competitors.length === 0 && (
        <div className="card fade-in-up" style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(255,107,53,0.04), rgba(123,47,190,0.03))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <Sparkles size={14} style={{ color: 'var(--color-phase-5)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Suggested competitors in {INDUSTRY_LABELS[activeProject.questionnaire.industry]}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {INDUSTRY_COMPETITORS[activeProject.questionnaire.industry].map(sugg => (
              <button
                key={sugg.name}
                onClick={() => addCompetitor(sugg.name, sugg.url)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
                  background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem', color: 'var(--text-secondary)',
                  transition: 'all 150ms',
                }}
              >
                <Plus size={12} />
                {sugg.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {analyzing && (
        <div className="card fade-in-up" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <Loader2 size={14} style={{ color: 'var(--color-phase-1)', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{progress.stage}</span>
          </div>
          <div style={{ width: '100%', height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '0.1875rem', background: 'var(--color-phase-1)',
              transition: 'width 300ms ease',
              width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
            }} />
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Step {progress.current} of {progress.total}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="fade-in-up" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-error)',
        }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Rankings Table */}
      {sorted.length > 0 && (
        <div className="card table-scroll-wrap" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Rankings
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {['Rank', 'Company', 'AEO Score', 'Mentions', 'Avg Pos', 'Trend', '30-Day', ''].map((h, i) => (
                    <th scope="col" key={i} style={{
                      padding: '0.625rem 0.875rem', fontSize: '0.6875rem', fontFamily: 'var(--font-heading)',
                      fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase',
                      letterSpacing: '0.5px', textAlign: i >= 2 && i <= 6 ? 'center' : 'left',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((comp, idx) => (
                  <tr
                    key={comp.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: comp.isOwn ? 'rgba(14, 165, 233, 0.06)' : 'transparent',
                      transition: 'background 100ms',
                    }}
                    onMouseEnter={(e) => { if (!comp.isOwn) e.currentTarget.style.background = 'var(--hover-bg)' }}
                    onMouseLeave={(e) => { if (!comp.isOwn) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: comp.isOwn ? 700 : 500, color: comp.isOwn ? 'var(--color-phase-3)' : 'var(--text-primary)' }}>
                          {comp.name}
                          {comp.isOwn && <span style={{ fontSize: '0.625rem', marginLeft: '0.375rem', color: 'var(--color-phase-3)', fontWeight: 600 }}>YOU</span>}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.0625rem' }}>{comp.url}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem',
                        color: comp.aeoScore >= 70 ? 'var(--color-success)' : comp.aeoScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
                      }}>
                        {comp.aeoScore}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                      {comp.mentions?.toLocaleString() || 0}
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                      {comp.avgPosition || '--'}
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                      <TrendIcon trend={comp.trend} />
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                      <MiniSparkline data={comp.sparklineData} />
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem', textAlign: 'right' }}>
                      {!comp.isOwn && (
                        <button
                          onClick={() => removeCompetitor(comp.id)}
                          style={{
                            padding: '0.25rem', borderRadius: '0.375rem', border: 'none', background: 'none',
                            cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex',
                            alignItems: 'center', transition: 'color 100ms',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-error)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                          title="Remove competitor"
                          aria-label="Remove competitor"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Heat Map + AI Summary Row */}
      {heatMap && (
        <div className="resp-grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem', overflow: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Category Performance Heat Map
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th scope="col" style={{ padding: '0.5rem 0.625rem', textAlign: 'left', fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    Category
                  </th>
                  {heatMap.competitors.map(name => (
                    <th scope="col" key={name} style={{
                      padding: '0.5rem 0.625rem', textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-heading)', fontWeight: 600, maxWidth: '6.25rem', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatMap.categories.map(cat => (
                  <tr key={cat} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.625rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {CATEGORY_LABELS[cat] || cat}
                    </td>
                    {heatMap.competitors.map(name => {
                      const score = heatMap.scores?.[cat]?.[name] || 0
                      const colors = getHeatColor(score)
                      return (
                        <td key={name} style={{ padding: '0.375rem', textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '2.625rem', height: '2rem', borderRadius: '0.5rem',
                            background: colors.bg, color: colors.text,
                            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8125rem',
                          }}>
                            {score}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {aiSummary && (
            <div className="card" style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(123,47,190,0.04))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Lightbulb size={16} style={{ color: 'var(--color-phase-3)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  AI Insights
                </h3>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Insight</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{aiSummary.keyInsight}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opportunity</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{aiSummary.opportunity}</p>
              </div>
              {analysis?.timestamp && (
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '1rem' }}>
                  Last analysis: {new Date(analysis.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {competitors.length === 0 && !analyzing && (
        <div className="card fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
          <Target size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Competitors Added</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', maxWidth: '22.5rem', textAlign: 'center', lineHeight: 1.6 }}>
            Add competitor URLs above to compare your AEO performance. Your own site will be automatically included in the analysis.
          </p>
        </div>
      )}
    </div>
  )
}
