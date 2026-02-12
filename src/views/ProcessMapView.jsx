import { useState, useEffect } from 'react'
import { BookOpen, Lightbulb } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const KEY_PRINCIPLES = [
  'AEO is about being the best answer, not just being found',
  'Structured data is non-negotiable',
  'The 40-60 word answer paragraph is your most powerful weapon',
  'E-E-A-T matters more in AI search',
  'Monitor relentlessly — AI engines evolve weekly',
  'Test across ALL platforms — each behaves differently',
  'AEO and SEO are complementary',
]

export default function ProcessMapView({ phases, setDocItem, setActiveView }) {
  const reducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (reducedMotion) { setMounted(true); return }
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [reducedMotion])

  const openDoc = (item) => {
    setDocItem(item)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-[0.9375rem] font-semibold tracking-tight text-text-primary mb-1">AEO Implementation Roadmap</h2>
        <p className="text-[0.8125rem] text-text-secondary">Follow this step-by-step process to optimize your site for AI search engines.</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {phases.map((phase, phaseIdx) => (
          <div key={phase.id} className="relative flex gap-6 pb-10 last:pb-0">
            {/* Timeline line — animated */}
            {phaseIdx < phases.length - 1 && (
              <div
                className="absolute left-[1.1875rem] top-10 w-0.5 bottom-0 origin-top"
                style={{
                  backgroundColor: phase.color,
                  opacity: 0.3,
                  transform: mounted ? 'scaleY(1)' : 'scaleY(0)',
                  transition: reducedMotion ? 'none' : `transform 400ms ease-out ${phaseIdx * 120 + 200}ms`,
                }}
              />
            )}

            {/* Timeline dot — with pulse ring */}
            <div className="relative flex-shrink-0 z-10">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm text-white"
                style={{
                  backgroundColor: phase.color,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'scale(1)' : 'scale(0.5)',
                  transition: reducedMotion ? 'none' : `all 300ms ease-out ${phaseIdx * 120}ms`,
                }}
              >
                {phase.number}
              </div>
              {/* Pulse ring */}
              {mounted && !reducedMotion && (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    color: phase.color,
                    animation: `ring-pulse 600ms ease-out ${phaseIdx * 120 + 100}ms both`,
                  }}
                />
              )}
            </div>

            {/* Phase content */}
            <div
              className="flex-1 min-w-0"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                transition: reducedMotion ? 'none' : `all 350ms ease-out ${phaseIdx * 120 + 50}ms`,
              }}
            >
              <div className="rounded-xl p-5 transition-all duration-200" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[0.625rem] font-heading font-bold uppercase tracking-[1px]" style={{ color: phase.color }}>
                      Phase {phase.number} — {phase.timeline}
                    </span>
                    <h3 className="font-heading text-[0.875rem] font-bold mt-1 text-text-primary">{phase.title}</h3>
                    <p className="text-[0.8125rem] text-text-secondary mt-1">{phase.description}</p>
                  </div>
                  <span className="text-xl">{phase.icon}</span>
                </div>

                {/* Steps */}
                <div className="mt-4 space-y-1">
                  {phase.categories.map(cat => (
                    <div key={cat.id}>
                      <h4 className="text-[0.625rem] font-bold text-text-tertiary uppercase tracking-[1px] mt-3 mb-2">{cat.name}</h4>
                      {cat.items.map((item, itemIdx) => (
                        <div key={item.id} className="flex items-start gap-2 py-1.5 group">
                          <span className="text-[0.6875rem] text-text-tertiary font-mono mt-0.5 w-5 text-right flex-shrink-0">
                            {itemIdx + 1}.
                          </span>
                          <span className="text-[0.8125rem] text-text-secondary flex-1">{item.text}</span>
                          <button
                            onClick={() => openDoc(item)}
                            className="p-1 rounded-lg text-text-tertiary hover:text-phase-3 opacity-0 group-hover:opacity-100 transition-all duration-150"
                            title="Open documentation"
                          >
                            <BookOpen size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Key deliverable */}
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <p className="text-[0.75rem] text-text-tertiary">
                    <span className="font-bold" style={{ color: phase.color }}>Key deliverable: </span>
                    {getDeliverable(phase.number)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Principles */}
      <div className="rounded-xl p-6 transition-all duration-200" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-phase-5" />
          <h3 className="font-heading text-[0.875rem] font-bold text-text-primary">Key Principles</h3>
        </div>
        <div className="space-y-3">
          {KEY_PRINCIPLES.map((principle, idx) => (
            <div key={idx} className="flex items-start gap-3 fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <span className="font-mono text-[0.6875rem] font-bold text-phase-5 mt-0.5 w-5 text-right flex-shrink-0">{idx + 1}.</span>
              <p className="text-[0.8125rem] text-text-secondary">{principle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getDeliverable(phaseNum) {
  const deliverables = {
    1: 'Complete audit document with content gaps and technical baseline metrics.',
    2: 'Schema markup implemented and validated on all page templates.',
    3: 'Optimized content with answer paragraphs, FAQ sections, and proper hierarchy.',
    4: 'Fully crawlable site with semantic HTML, feeds, and optimized meta tags.',
    5: 'Established brand entity with authority signals and citation network.',
    6: 'Validated AEO implementation with test results across all AI platforms.',
    7: 'Ongoing monitoring system with monthly reports and iteration plan.',
  }
  return deliverables[phaseNum] || ''
}
