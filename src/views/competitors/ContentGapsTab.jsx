/**
 * ContentGapsTab — Find queries where competitors are cited but you aren't.
 *
 * Gap analysis table with difficulty assessment, bulk selection,
 * and "Generate Roadmap" to create content calendar entries.
 */
import { useState } from 'react'
import {
  AlertTriangle, Loader2, Sparkles, Check, Calendar,
  ChevronDown, ChevronUp, Target,
} from 'lucide-react'
import { useContentGaps } from '../../hooks/useContentGaps'
import { useToast } from '../../components/Toast'

const DIFFICULTY_COLORS = {
  easy: 'var(--color-phase-4)',
  medium: 'var(--color-phase-5)',
  hard: 'var(--color-phase-7)',
}

const PRIORITY_COLORS = {
  high: 'var(--color-phase-1)',
  medium: 'var(--color-phase-3)',
  low: 'var(--text-tertiary)',
}

export default function ContentGapsTab({ activeProject, updateProject }) {
const { addToast } = useToast()
  const { gaps, generating, roadmap, error, generateRoadmap } = useContentGaps(activeProject)

  const [selected, setSelected] = useState(new Set())
  const [showRoadmap, setShowRoadmap] = useState(false)

  const toggleSelect = (query) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(query)) next.delete(query)
      else next.add(query)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === gaps.length) setSelected(new Set())
    else setSelected(new Set(gaps.map(g => g.query)))
  }

  const handleGenerateRoadmap = () => {
    const selectedGaps = gaps.filter(g => selected.has(g.query))
    if (selectedGaps.length === 0) return
    generateRoadmap(selectedGaps)
    setShowRoadmap(true)
  }

  const handleAddToCalendar = (entry) => {
    const calendar = [...(activeProject?.contentCalendar || [])]
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: entry.title,
      scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: 'scheduled',
      checklistItemId: null,
      pageUrl: '',
      assignedTo: null,
      notes: `Gap query: ${entry.query}\nStrategy: ${entry.notes}`,
      briefId: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }
    calendar.push(newEntry)
    updateProject(activeProject.id, { contentCalendar: calendar })
    addToast('success', 'Added to content calendar')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* ── Header Card ── */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 'var(--space-3)',
        }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)',
            }}>
              <Target size={15} style={{ color: 'var(--color-phase-1)' }} />
              {'Content Gaps'}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {'Queries where competitors are cited by AI engines but you aren\'t. Select gaps and generate a content roadmap.'}
            </p>
          </div>
          {gaps.length > 0 && selected.size > 0 && (
            <button
              className="btn-primary btn-sm"
              onClick={handleGenerateRoadmap}
              disabled={generating}
            >
              {generating
                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> {'Generating...'}</>
                : <><Sparkles size={13} /> {`Generate Roadmap (${selected.size})`}</>
              }
            </button>
          )}
        </div>

        {gaps.length === 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)', marginTop: 'var(--space-3)',
            background: 'rgba(37, 99, 235, 0.08)', borderRadius: 'var(--radius-md)',
            border: '0.0625rem solid rgba(37, 99, 235, 0.2)',
            fontSize: 'var(--text-xs)', color: 'var(--accent)',
          }}>
            <AlertTriangle size={13} />
            {'Run a Citation Share check first to identify content gaps against competitors.'}
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)', marginTop: 'var(--space-3)',
            background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)',
            border: '0.0625rem solid rgba(239, 68, 68, 0.2)',
            fontSize: 'var(--text-xs)', color: 'var(--color-error)',
          }}>
            <AlertTriangle size={13} />
            {error}
          </div>
        )}
      </div>

      {/* ── Gap Table ── */}
      {gaps.length > 0 && (
        <div className="card">
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2rem 1fr auto',
            gap: 'var(--space-3)', alignItems: 'center',
            padding: 'var(--space-3) var(--space-5)',
            borderBottom: '0.0625rem solid var(--border-subtle)',
            fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--text-disabled)',
            textTransform: 'uppercase', letterSpacing: '0.0313rem',
          }}>
            <button
              onClick={selectAll}
              style={{
                width: '1rem', height: '1rem', borderRadius: '0.1875rem',
                border: '0.0625rem solid var(--border-default)',
                background: selected.size === gaps.length ? 'var(--color-phase-1)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {selected.size === gaps.length && <Check size={9} style={{ color: '#fff' }} />}
            </button>
            <span>{'Query'}</span>
            <span>{'Cited By'}</span>
          </div>

          {/* Rows */}
          {gaps.map(gap => (
            <div
              key={gap.query}
              onClick={() => toggleSelect(gap.query)}
              style={{
                display: 'grid', gridTemplateColumns: '2rem 1fr auto',
                gap: 'var(--space-3)', alignItems: 'center',
                padding: 'var(--space-3) var(--space-5)',
                borderBottom: '0.0625rem solid var(--border-subtle)',
                cursor: 'pointer',
                background: selected.has(gap.query) ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                transition: 'background 150ms',
              }}
            >
              <div style={{
                width: '1rem', height: '1rem', borderRadius: '0.1875rem',
                border: selected.has(gap.query) ? 'none' : '0.0625rem solid var(--border-default)',
                background: selected.has(gap.query) ? 'var(--accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected.has(gap.query) && <Check size={9} style={{ color: '#fff' }} />}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {gap.query}
                </div>
                <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', marginTop: '0.0625rem' }}>
                  {gap.competitorsCited.map(c => c.name).join(', ')}
                </div>
              </div>
              <span style={{
                fontSize: 'var(--text-2xs)', fontFamily: 'var(--font-mono)', fontWeight: 600,
                color: gap.competitorCount >= 3 ? 'var(--color-phase-7)' : gap.competitorCount >= 2 ? 'var(--color-phase-5)' : 'var(--text-tertiary)',
                padding: '0 var(--space-2)', borderRadius: 'var(--radius-full)',
                background: gap.competitorCount >= 3 ? 'rgba(239, 68, 68, 0.1)' : gap.competitorCount >= 2 ? 'rgba(245, 158, 11, 0.1)' : 'var(--hover-bg)',
              }}>
                {gap.competitorCount}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Roadmap Results ── */}
      {roadmap && showRoadmap && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}>
            <div style={{
              fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            }}>
              <Calendar size={13} style={{ color: 'var(--color-phase-3)' }} />
              {'Content Roadmap'}
            </div>
            <button className="btn-ghost btn-sm" onClick={() => setShowRoadmap(p => !p)}>
              {showRoadmap ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {roadmap.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '0.0625rem solid var(--border-subtle)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    {entry.title}
                  </div>
                  <div style={{
                    display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-1)',
                    flexWrap: 'wrap',
                  }}>
                    {entry.difficulty && (
                      <span style={{
                        fontSize: 'var(--text-2xs)', fontWeight: 600,
                        padding: '0 var(--space-2)', borderRadius: 'var(--radius-full)',
                        color: DIFFICULTY_COLORS[entry.difficulty] || 'var(--text-tertiary)',
                        background: entry.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.1)' :
                          entry.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      }}>
                        {entry.difficulty}
                      </span>
                    )}
                    {entry.priority && (
                      <span style={{
                        fontSize: 'var(--text-2xs)', fontWeight: 600,
                        padding: '0 var(--space-2)', borderRadius: 'var(--radius-full)',
                        color: PRIORITY_COLORS[entry.priority] || 'var(--text-tertiary)',
                        background: 'var(--hover-bg)',
                      }}>
                        {entry.priority} priority
                      </span>
                    )}
                    {entry.contentType && (
                      <span style={{
                        fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)',
                        padding: '0 var(--space-2)', borderRadius: 'var(--radius-full)',
                        background: 'var(--hover-bg)',
                      }}>
                        {entry.contentType}
                      </span>
                    )}
                  </div>
                  {entry.notes && (
                    <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', lineHeight: 1.5, margin: 0 }}>
                      {entry.notes}
                    </p>
                  )}
                </div>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleAddToCalendar(entry)}
                  style={{ flexShrink: 0 }}
                >
                  <Calendar size={11} />
                  {'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
