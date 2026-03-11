import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const STUDIES = [
  {
    company: 'DigitalFirst Agency',
    industry: 'Marketing Agency',
    metric: '+340%',
    metricLabel: 'AI Citations',
    quote: 'We went from zero AI citations to appearing in 60% of relevant ChatGPT answers within 3 weeks.',
    author: 'Sarah Chen',
    role: 'Head of SEO',
    accentColor: 'var(--accent)',
  },
  {
    company: 'GrowthLab',
    industry: 'SaaS',
    metric: '+180%',
    metricLabel: 'Organic Traffic',
    quote: 'The multi-engine testing lab showed us exactly where we were missing citations across all AI platforms.',
    author: 'Emily Park',
    role: 'SEO Director',
    accentColor: 'var(--color-success)',
  },
  {
    company: 'Apex Digital',
    industry: 'E-Commerce',
    metric: '20hrs',
    metricLabel: 'Saved Per Client',
    quote: 'The schema generator alone saved us 20+ hours per client. The most complete AEO toolkit available.',
    author: 'James Mitchell',
    role: 'Technical SEO Lead',
    accentColor: 'var(--color-warning)',
  },
]

export default function CaseStudies() {
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

    // Cards
    gsap.fromTo(section.querySelectorAll('.lp-cases__card'),
      { opacity: 0, y: 50, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.8,
        scrollTrigger: { trigger: section.querySelector('.lp-cases__grid'), start: 'top 80%', once: true },
      }
    )

    // Animate metric numbers
    section.querySelectorAll('.lp-cases__metric-value').forEach((el) => {
      const text = el.textContent
      const num = parseInt(text.replace(/[^0-9]/g, ''), 10)
      if (!isNaN(num) && num > 0) {
        gsap.from(el, {
          textContent: 0,
          duration: 2,
          snap: { textContent: 1 },
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate() {
            const current = Math.round(parseFloat(el.textContent))
            if (text.startsWith('+')) el.textContent = `+${current}%`
            else if (text.endsWith('hrs')) el.textContent = `${current}hrs`
            else el.textContent = String(current)
          },
          onComplete() { el.textContent = text },
        })
      }
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-section lp-cases" aria-label="Case studies">
      <div className="lp-section__header">
        <span className="lp-section__label">Case Studies</span>
        <h2 className="lp-section__title">Real Results from Real Teams</h2>
      </div>

      <div className="lp-cases__grid">
        {STUDIES.map((cs, i) => (
          <article key={i} className="lp-cases__card">
            <div className="lp-cases__card-header">
              <span className="lp-cases__industry">{cs.industry}</span>
              <h3 className="lp-cases__company">{cs.company}</h3>
            </div>
            <div className="lp-cases__metric" style={{ color: cs.accentColor }}>
              <span className="lp-cases__metric-value">{cs.metric}</span>
              <span className="lp-cases__metric-label">{cs.metricLabel}</span>
            </div>
            <blockquote className="lp-cases__quote">
              &ldquo;{cs.quote}&rdquo;
            </blockquote>
            <div className="lp-cases__author">
              <span className="lp-cases__author-name">{cs.author}</span>
              <span className="lp-cases__author-role">{cs.role}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
