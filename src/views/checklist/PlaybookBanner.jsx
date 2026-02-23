import { useState } from 'react'
import { BookOpen, ChevronDown, Star, Lightbulb } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getPlaybook, isFocusPhase, getPhaseTip } from '../../data/industryPlaybooks'

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
  const { t } = useTranslation('app')
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
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(prev => !prev)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        <BookOpen size={14} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />
        <span style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.8125rem',
          fontWeight: 700, color: 'var(--text-primary)',
        }}>
          {t('checklist.playbook.title', { industry: industryName })}
        </span>
        <span style={{
          fontSize: '0.625rem', padding: '0.125rem 0.375rem',
          borderRadius: '6.1875rem', background: 'var(--color-phase-1)' + '15',
          color: 'var(--color-phase-1)', fontWeight: 600,
        }}>
          {t('checklist.playbook.focusCount', { count: playbook.focusPhases.length })}
        </span>
        <ChevronDown size={12} style={{
          marginLeft: 'auto', color: 'var(--text-tertiary)',
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
          {/* Recommended phase order */}
          <div style={{ paddingTop: '0.75rem' }}>
            <div style={{
              fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.0625rem', color: 'var(--text-tertiary)',
              marginBottom: '0.375rem',
            }}>
              {t('checklist.playbook.phaseOrder')}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {playbook.phaseOrder.map((phaseNum, idx) => {
                const phase = phases?.find(p => p.number === phaseNum)
                const isFocus = isFocusPhase(industry, phaseNum)
                return (
                  <div key={phaseNum} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
                      padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                      fontSize: '0.6875rem', fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      background: isFocus ? (phase?.color || 'var(--color-phase-1)') + '15' : 'var(--hover-bg)',
                      color: isFocus ? (phase?.color || 'var(--color-phase-1)') : 'var(--text-tertiary)',
                      border: isFocus ? `0.0625rem solid ${(phase?.color || 'var(--color-phase-1)')}30` : '0.0625rem solid transparent',
                    }}>
                      {isFocus && <Star size={9} style={{ flexShrink: 0 }} />}
                      P{phaseNum}
                    </span>
                    {idx < playbook.phaseOrder.length - 1 && (
                      <span style={{ color: 'var(--text-disabled)', fontSize: '0.5rem' }}>→</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Focus phases progress */}
          <div>
            <div style={{
              fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.0625rem', color: 'var(--text-tertiary)',
              marginBottom: '0.375rem',
            }}>
              {t('checklist.playbook.focusPhases')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {focusProgress.map(fp => (
                <div key={fp.number}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: fp.color, marginRight: '0.375rem' }}>
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
              {t('checklist.playbook.tips')}
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
