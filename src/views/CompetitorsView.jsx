import { useState } from 'react'
import {
  Users, Plus, Trash2, RefreshCw, Loader2, AlertCircle, TrendingUp,
  TrendingDown, Minus, ExternalLink, Lightbulb, Target, Sparkles
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { useCompetitorAnalysis } from '../hooks/useCompetitorAnalysis'
import { INDUSTRY_COMPETITORS, INDUSTRY_LABELS } from '../utils/getRecommendations'

const CATEGORY_LABELS = {
  conversational: 'Conversational',
  factual: 'Factual',
  industrySpecific: 'Industry',
  comparison: 'Comparison',
  technical: 'Technical',
}

function getHeatColor(score) {
  if (score >= 75) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' }
  if (score >= 65) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' }
  return { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444' }
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp size={14} style={{ color: 'var(--color-success)' }} />
  if (trend === 'down') return <TrendingDown size={14} style={{ color: 'var(--color-error)' }} />
  return <Minus size={14} style={{ color: 'var(--text-tertiary)' }} />
}

function MiniSparkline({ data }) {
  if (!data || data.length < 2) return <span style={{ fontSize: 11, color: 'var(--text-disabled)' }}>--</span>
  return (
    <ResponsiveContainer width={80} height={28}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="score" stroke="var(--color-phase-1)" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function CompetitorsView({ activeProject, updateProject }) {
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const {
    analyzing, progress, error,
    addCompetitor, removeCompetitor, analyzeCompetitors,
  } = useCompetitorAnalysis({ activeProject, updateProject })

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

  // Sort competitors by AEO score desc for the table
  const sorted = [...competitors].sort((a, b) => b.aeoScore - a.aeoScore)

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24 fade-in-up">
        <Users size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Project Selected</h3>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Select a project to view competitor insights.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Competitor Insights
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Compare your AEO presence against competitors
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={analyzeCompetitors}
          disabled={analyzing || competitors.length === 0}
          style={{ padding: '9px 18px', fontSize: 13 }}
        >
          {analyzing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Add Competitor Form */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Company Name</label>
            <input
              className="input-field"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. TechLeader"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Website URL</label>
            <input
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
            style={{ padding: '10px 18px', fontSize: 13, flexShrink: 0 }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Industry Suggestions */}
      {activeProject?.questionnaire?.industry && INDUSTRY_COMPETITORS[activeProject.questionnaire.industry] && competitors.length === 0 && (
        <div className="card fade-in-up" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(255,107,53,0.04), rgba(123,47,190,0.03))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={14} style={{ color: 'var(--color-phase-5)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              Suggested competitors in {INDUSTRY_LABELS[activeProject.questionnaire.industry]}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {INDUSTRY_COMPETITORS[activeProject.questionnaire.industry].map(sugg => (
              <button
                key={sugg.name}
                onClick={() => {
                  addCompetitor(sugg.name, sugg.url)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontSize: 12, color: 'var(--text-secondary)',
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
        <div className="card fade-in-up" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Loader2 size={14} style={{ color: 'var(--color-phase-1)', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{progress.stage}</span>
          </div>
          <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--hover-bg)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: 3,
              background: 'var(--color-phase-1)',
              transition: 'width 300ms ease',
              width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
            }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Step {progress.current} of {progress.total}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="fade-in-up" style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: 14,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12, fontSize: 13, color: 'var(--color-error)',
        }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Rankings Table */}
      {sorted.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Rankings
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {['Rank', 'Company', 'AEO Score', 'Mentions', 'Avg Pos', 'Trend', '30-Day', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-heading)',
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
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: comp.isOwn ? 700 : 500, color: comp.isOwn ? 'var(--color-phase-3)' : 'var(--text-primary)' }}>
                          {comp.name}
                          {comp.isOwn && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--color-phase-3)', fontWeight: 600 }}>YOU</span>}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{comp.url}</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
                        color: comp.aeoScore >= 70 ? 'var(--color-success)' : comp.aeoScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
                      }}>
                        {comp.aeoScore}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                      {comp.mentions?.toLocaleString() || 0}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                      {comp.avgPosition || '--'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <TrendIcon trend={comp.trend} />
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <MiniSparkline data={comp.sparklineData} />
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {!comp.isOwn && (
                        <button
                          onClick={() => removeCompetitor(comp.id)}
                          style={{
                            padding: 4, borderRadius: 6, border: 'none', background: 'none',
                            cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex',
                            alignItems: 'center', transition: 'color 100ms',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-error)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                          title="Remove competitor"
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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          {/* Heat Map */}
          <div className="card" style={{ padding: 20, overflow: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              Category Performance Heat Map
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                    Category
                  </th>
                  {heatMap.competitors.map(name => (
                    <th key={name} style={{
                      padding: '8px 10px', textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-heading)', fontWeight: 600, maxWidth: 100, overflow: 'hidden',
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
                    <td style={{ padding: '10px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {CATEGORY_LABELS[cat] || cat}
                    </td>
                    {heatMap.competitors.map(name => {
                      const score = heatMap.scores?.[cat]?.[name] || 0
                      const colors = getHeatColor(score)
                      return (
                        <td key={name} style={{ padding: 6, textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 42, height: 32, borderRadius: 8,
                            background: colors.bg, color: colors.text,
                            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
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

          {/* AI Summary */}
          {aiSummary && (
            <div className="card" style={{
              padding: 20,
              background: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(123,47,190,0.04))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Lightbulb size={16} style={{ color: 'var(--color-phase-3)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  AI Insights
                </h3>
              </div>

              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Key Insight
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {aiSummary.keyInsight}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Opportunity
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {aiSummary.opportunity}
                </p>
              </div>

              {analysis?.timestamp && (
                <p style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 16 }}>
                  Last analysis: {new Date(analysis.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {competitors.length === 0 && !analyzing && (
        <div className="card fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
          <Target size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No Competitors Added</h3>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 360, textAlign: 'center', lineHeight: 1.6 }}>
            Add competitor URLs above to compare your AEO performance. Your own site will be automatically included in the analysis.
          </p>
        </div>
      )}
    </div>
  )
}
