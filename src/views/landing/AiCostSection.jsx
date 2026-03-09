import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const COST_BREAKDOWN = [
  { feature: 'Content Writer', perUse: '$0.01–0.03', usesPerProject: '~15', icon: '✍' },
  { feature: 'Schema Generator', perUse: '$0.01–0.02', usesPerProject: '~10', icon: '⚙' },
  { feature: 'AI Analyzer', perUse: '$0.02–0.05', usesPerProject: '~5', icon: '📊' },
  { feature: 'Search Testing', perUse: '$0.03–0.05', usesPerProject: '~8', icon: '🔍' },
]

const COMPARISON = [
  { tool: 'Typical AI SEO Tools', cost: '$99–299/mo', note: 'Fixed monthly fee' },
  { tool: 'AEO Dashboard', cost: '$2–3 total', note: 'Pay only for what you use', highlight: true },
]

export default function AiCostSection() {
  const sectionRef = useRef(null)
  const [animated, setAnimated] = useState(false)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    gsap.fromTo(section.querySelector('.lp-section__header'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      }
    )

    gsap.fromTo(section.querySelector('.lp-cost__highlight'),
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1, scale: 1, duration: 0.8,
        scrollTrigger: {
          trigger: section, start: 'top 70%', once: true,
          onEnter: () => setAnimated(true),
        },
      }
    )

    gsap.fromTo(section.querySelectorAll('.lp-cost__breakdown-row'),
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0, stagger: 0.08, duration: 0.5,
        scrollTrigger: { trigger: section.querySelector('.lp-cost__breakdown'), start: 'top 80%', once: true },
      }
    )

    gsap.fromTo(section.querySelectorAll('.lp-cost__compare-row'),
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, stagger: 0.12, duration: 0.5,
        scrollTrigger: { trigger: section.querySelector('.lp-cost__compare'), start: 'top 85%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="ai-cost" className="lp-section lp-cost" aria-label="AI costs">
      <div className="lp-section__header">
        <span className="lp-section__label">Transparent Pricing</span>
        <h2 className="lp-section__title">AI-Powered for Under $3</h2>
        <p className="lp-section__subtitle">
          Bring your own API key — no markup, no hidden fees, no monthly AI charges. You pay OpenAI/Anthropic directly at their standard rates.
        </p>
      </div>

      <div className="lp-cost__content">
        <div className="lp-cost__highlight">
          <div className="lp-cost__price-wrap">
            <span className="lp-cost__currency">$</span>
            <span className="lp-cost__price">2–3</span>
          </div>
          <p className="lp-cost__price-label">Total API cost for a full project optimization</p>
          <p className="lp-cost__description">
            Complete all 99 checklist items using every AI feature — Content Writer, Analyzer, Schema Generator, and Search Testing — for approximately $2–3 in total API costs. That's less than a cup of coffee for a complete AEO transformation.
          </p>

          <div className="lp-cost__stats">
            <div className="lp-cost__stat">
              <span className="lp-cost__stat-value">$0</span>
              <span className="lp-cost__stat-label">Platform markup</span>
            </div>
            <div className="lp-cost__stat">
              <span className="lp-cost__stat-value">99</span>
              <span className="lp-cost__stat-label">Checklist items</span>
            </div>
            <div className="lp-cost__stat">
              <span className="lp-cost__stat-value">BYOK</span>
              <span className="lp-cost__stat-label">Bring Your Own Key</span>
            </div>
          </div>
        </div>

        <div className="lp-cost__details">
          <div className="lp-cost__breakdown">
            <h3 className="lp-cost__section-title">Cost Per Feature</h3>
            <div className="lp-cost__breakdown-header">
              <span>Feature</span>
              <span>Per Use</span>
              <span>Uses/Project</span>
            </div>
            {COST_BREAKDOWN.map((item, i) => (
              <div key={i} className="lp-cost__breakdown-row">
                <span className="lp-cost__breakdown-feature">
                  <span className="lp-cost__breakdown-icon">{item.icon}</span>
                  {item.feature}
                </span>
                <span className="lp-cost__breakdown-price">{item.perUse}</span>
                <span className="lp-cost__breakdown-uses">{item.usesPerProject}</span>
              </div>
            ))}
          </div>

          <div className="lp-cost__compare">
            <h3 className="lp-cost__section-title">How It Compares</h3>
            {COMPARISON.map((item, i) => (
              <div key={i} className={`lp-cost__compare-row ${item.highlight ? 'lp-cost__compare-row--highlight' : ''}`}>
                <div>
                  <span className="lp-cost__compare-tool">{item.tool}</span>
                  <span className="lp-cost__compare-note">{item.note}</span>
                </div>
                <span className={`lp-cost__compare-cost ${item.highlight ? 'lp-cost__compare-cost--highlight' : ''}`}>
                  {item.cost}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
