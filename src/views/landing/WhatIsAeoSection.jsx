import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'

const PILLARS = [
  { title: 'Structured Data', description: 'Schema markup that AI engines can parse and cite' },
  { title: 'Content Architecture', description: 'Question-answer format that mirrors how AI retrieves information' },
  { title: 'Technical Signals', description: 'Crawlability, sitemaps, and robots.txt configured for AI bots' },
  { title: 'Entity Clarity', description: 'Clear topic authority that AI associates with your brand' },
]

const COMPARISON = [
  { aspect: 'Goal', seo: 'Rank on page 1', aeo: 'Get cited by AI' },
  { aspect: 'Content', seo: 'Keyword-optimized', aeo: 'Answer-optimized' },
  { aspect: 'Markup', seo: 'Title & meta tags', aeo: 'Schema & structured data' },
  { aspect: 'Measurement', seo: 'Rankings & CTR', aeo: 'AI citations & mentions' },
  { aspect: 'Traffic Source', seo: 'Search results page', aeo: 'AI-generated answers' },
]

export default function WhatIsAeoSection() {
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

    // Pillars stagger
    gsap.fromTo(section.querySelectorAll('.lp-aeo__pillar'),
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0, stagger: 0.1, duration: 0.6,
        scrollTrigger: { trigger: section.querySelector('.lp-aeo__pillars'), start: 'top 80%', once: true },
      }
    )

    // Comparison table rows
    gsap.fromTo(section.querySelectorAll('.lp-aeo__table-row'),
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, stagger: 0.08, duration: 0.5,
        scrollTrigger: { trigger: section.querySelector('.lp-aeo__table'), start: 'top 80%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="what-is-aeo" className="lp-section lp-aeo" aria-label="What is AEO">
      <div className="lp-section__header">
        <span className="lp-section__label">What is AEO?</span>
        <h2 className="lp-section__title">Answer Engine Optimization</h2>
        <p className="lp-section__subtitle">
          AEO is the practice of optimizing your website to be cited and referenced by AI-powered search engines and assistants.
        </p>
      </div>

      <div className="lp-aeo__content">
        <div className="lp-aeo__pillars">
          <h3 className="lp-aeo__pillars-title">The 4 Pillars of AEO</h3>
          {PILLARS.map((pillar, i) => (
            <div key={i} className="lp-aeo__pillar">
              <span className="lp-aeo__pillar-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h4 className="lp-aeo__pillar-title">{pillar.title}</h4>
                <p className="lp-aeo__pillar-desc">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lp-aeo__table-wrap">
          <h3 className="lp-aeo__table-title">SEO vs AEO</h3>
          <div className="lp-aeo__table">
            <div className="lp-aeo__table-header">
              <span>Aspect</span>
              <span>Traditional SEO</span>
              <span>AEO</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className="lp-aeo__table-row">
                <span className="lp-aeo__table-aspect">{row.aspect}</span>
                <span className="lp-aeo__table-seo">{row.seo}</span>
                <span className="lp-aeo__table-aeo">{row.aeo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
