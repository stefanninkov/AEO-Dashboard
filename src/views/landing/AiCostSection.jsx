import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

export default function AiCostSection() {
  const sectionRef = useRef(null)

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
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1, scale: 1, duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      }
    )

    gsap.fromTo(section.querySelectorAll('.lp-cost__card'),
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.6,
        scrollTrigger: { trigger: section.querySelector('.lp-cost__grid'), start: 'top 80%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="ai-cost" className="lp-section lp-cost" aria-label="AI costs">
      <div className="lp-section__header">
        <span className="lp-section__label">AI Costs</span>
        <h2 className="lp-section__title">AI-Powered for Under $3</h2>
        <p className="lp-section__subtitle">
          Connect your own API key — no markup, no hidden fees. Full project optimization costs less than a cup of coffee.
        </p>
      </div>

      <div className="lp-cost__highlight">
        <div className="lp-cost__price">$2–3</div>
        <p className="lp-cost__price-label">Total for a full project</p>
        <p className="lp-cost__description">
          Complete all 99 checklist items using every AI feature — Content Writer, Analyzer, Schema Generator, and more — for approximately $2–3 in total API costs.
        </p>
      </div>

      <div className="lp-cost__grid">
        <div className="lp-cost__card">
          <div className="lp-cost__card-value">$0.01–0.05</div>
          <div className="lp-cost__card-label">Per AI feature use</div>
        </div>
        <div className="lp-cost__card">
          <div className="lp-cost__card-value">99</div>
          <div className="lp-cost__card-label">Checklist items</div>
        </div>
        <div className="lp-cost__card">
          <div className="lp-cost__card-value">$0</div>
          <div className="lp-cost__card-label">Platform markup</div>
        </div>
      </div>
    </section>
  )
}
