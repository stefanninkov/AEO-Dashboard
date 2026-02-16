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

      {/* Phase Cards */}
      <div>
        {phases.map((phase, phaseIdx) => (
          <div
            key={phase.id}
            className={`process-phase-card ${mounted ? 'fade-in-up' : ''}`}
            style={{
              opacity: mounted ? undefined : 0,
              animationDelay: reducedMotion ? '0ms' : `${phaseIdx * 80}ms`,
            }}
          >
            {/* Header: dot + meta */}
            <div className="process-phase-header">
              <div
                className="process-phase-dot"
                style={{ backgroundColor: phase.color }}
              >
                {phase.number}
              </div>

              <div className="process-phase-meta">
                <div className="process-phase-tag" style={{ color: phase.color }}>
                  Phase {phase.number} — {phase.timeline}
                </div>
                <h3 className="process-phase-title">{phase.title}</h3>
                <p className="process-phase-desc">{phase.description}</p>
              </div>

              <span className="text-xl flex-shrink-0">{phase.icon}</span>
            </div>

            {/* Category blocks */}
            {phase.categories.map(cat => (
              <div key={cat.id} className="process-category-block">
                <h4 className="process-category-header">{cat.name}</h4>
                {cat.items.map((item, itemIdx) => (
                  <div key={item.id} className="process-step-item">
                    <span className="process-step-num">{itemIdx + 1}.</span>
                    <span className="process-step-text">{item.text}</span>
                    <button
                      onClick={() => openDoc(item)}
                      className="process-step-doc-btn"
                      title="Open documentation"
                    >
                      <BookOpen size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ))}

            {/* Key deliverable */}
            <div
              className="process-deliverable"
              style={{
                backgroundColor: phase.color + '12',
                color: phase.color,
              }}
            >
              <span className="process-deliverable-label">Key deliverable:</span>
              <span style={{ color: 'var(--text-secondary)' }}>{getDeliverable(phase.number)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Key Principles */}
      <div className="process-principles-card">
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
