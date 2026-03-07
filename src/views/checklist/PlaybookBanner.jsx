import { useState } from 'react'
import { BookOpen, ChevronDown, Star, Lightbulb } from 'lucide-react'
import { getPlaybook } from '../../data/industryPlaybooks'

const INDUSTRY_NAMES = {
  saas: 'SaaS',
  ecommerce: 'E-Commerce',
  healthcare: 'Healthcare',
  finance: 'Finance',
  legal: 'Legal',
  realestate: 'Real Estate',
  education: 'Education',
  agency: 'Agency',
  localbusiness: 'Local Business',
  media: 'Media & Publishing',
  other: 'General',
}

export default function PlaybookBanner({ industry, phases, checked }) {
const [expanded, setExpanded] = useState(false)

  const playbook = getPlaybook(industry)
  if (!playbook || !industry) return null

  const industryName = INDUSTRY_NAMES[industry] || INDUSTRY_NAMES.other

  // Calculate focus phase progress
  const focusProgress = playbook.focusPhases.map(phaseNum => {
    const phase = phases?.find(p => p.number === phaseNum)
    if (!phase) return { number: phaseNum, title: '', done: 0, total: 0, percent: 0, color: '' }
    let total = 0, done = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => { total++; if (checked?.[item.id]) done++ })
    })
    return {
      number: phaseNum,
      title: phase.title,
      done,
      total,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
      color: phase.color,
    }
  })

  return (
    <div className="card" style={{ padding: 0 }}>
      <button
        onClick={() => setExpanded(prev => !prev)}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', textAlign: 'left',
        }}
      >
        <BookOpen size={14} style={{ color: 'var(--color-phase-1)', flexShrink: 0, marginTop: '0.125rem' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.8125rem',
              fontWeight: 700, color: 'var(--text-primary)',
            }}>
              {`${industryName} Playbook`}
            </span>
            <span style={{
              fontSize: '0.625rem', padding: '0.125rem 0.375rem',
              borderRadius: '6.1875rem', background: 'var(--color-phase-1)' + '15',
              color: 'var(--color-phase-1)', fontWeight: 600,
            }}>
              {`${playbook.focusPhases.length} focus phases`}
            </span>
          </div>
          {playbook.description && (
            <p style={{
              fontSize: '0.75rem', color: 'var(--text-secondary)',
              lineHeight: 1.5, marginTop: '0.25rem', margin: '0.25rem 0 0 0',
            }}>
              {playbook.description}
            </p>
          )}
        </div>
        <ChevronDown size={12} style={{
          flexShrink: 0, marginTop: '0.1875rem', color: 'var(--text-tertiary)',
          transform: expanded ? 'none' : 'rotate(-90deg)',
          transition: 'transform 200ms',
        }} />
      </button>

      {expanded && (
        <div style={{
          padding: '0 1rem 1rem',
          borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>

          {/* Focus phases progress */}
          <div>
            <div style={{
              fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.0625rem', color: 'var(--text-tertiary)',
              marginBottom: '0.375rem',
              paddingTop: '0.75rem',
            }}>
              {'Focus Phase Progress'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {focusProgress.map(fp => (
                <div key={fp.number}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                      fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
                    }}>
                      <Star size={10} style={{ color: fp.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', color: fp.color, marginRight: '0.25rem' }}>
                        P{fp.number}
                      </span>
                      {fp.title}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
                      fontWeight: 700, color: fp.percent === 100 ? 'var(--color-success)' : fp.color,
                    }}>
                      {fp.done}/{fp.total}
                    </span>
                  </div>
                  <div style={{
                    height: '0.25rem', borderRadius: '6.1875rem',
                    background: 'var(--hover-bg)', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${fp.percent}%`, height: '100%',
                      borderRadius: '6.1875rem',
                      background: fp.percent === 100 ? 'var(--color-success)' : fp.color,
                      transition: 'width 300ms',
                    }} />
                  </div>
                  {/* Focus phase explanation */}
                  {playbook.focusExplanations?.[fp.number] && (
                    <p style={{
                      fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                      lineHeight: 1.45, marginTop: '0.25rem', margin: '0.25rem 0 0 0',
                    }}>
                      {playbook.focusExplanations[fp.number]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <div style={{
              fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.0625rem', color: 'var(--text-tertiary)',
              marginBottom: '0.375rem',
            }}>
              {'Industry Tips'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {playbook.tips.map((tipObj, idx) => {
                const phase = phases?.find(p => p.number === tipObj.phase)
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    padding: '0.5rem 0.625rem', borderRadius: '0.375rem',
                    background: 'var(--hover-bg)',
                  }}>
                    <Lightbulb size={11} style={{
                      color: phase?.color || 'var(--color-phase-5)',
                      flexShrink: 0, marginTop: '0.125rem',
                    }} />
                    <div>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.5625rem',
                        fontWeight: 700, color: phase?.color || 'var(--text-tertiary)',
                        textTransform: 'uppercase', letterSpacing: '0.03125rem',
                      }}>
                        Phase {tipObj.phase}
                      </span>
                      <p style={{
                        fontSize: '0.75rem', color: 'var(--text-secondary)',
                        lineHeight: 1.45, marginTop: '0.0625rem',
                      }}>
                        {tipObj.tip}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
