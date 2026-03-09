import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'

const STEPS = [
  {
    num: '01',
    title: 'Analyze Your Site',
    description: 'Enter any URL for an instant AEO readiness score. Our deterministic engine crawls your HTML, checks AI crawlers, and identifies optimization opportunities.',
  },
  {
    num: '02',
    title: 'Follow the Checklist',
    description: 'Work through the 99-point AEO checklist phase by phase. Each item includes AI-generated suggestions and one-click schema markup generation.',
  },
  {
    num: '03',
    title: 'Verify & Monitor',
    description: 'Test your content across ChatGPT, Perplexity, Claude, and Gemini. Set up automated monitoring to track citation changes and visibility shifts.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)

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

    // Line draws as user scrolls
    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1, duration: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section.querySelector('.lp-hiw__timeline'),
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: 0.5,
          },
        }
      )
    }

    // Steps reveal sequentially
    gsap.fromTo(section.querySelectorAll('.lp-hiw__step'),
      { opacity: 0, x: -40 },
      {
        opacity: 1, x: 0, stagger: 0.2, duration: 0.7,
        scrollTrigger: { trigger: section.querySelector('.lp-hiw__timeline'), start: 'top 75%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="how-it-works" className="lp-section lp-hiw" aria-label="How it works">
      <div className="lp-section__header">
        <span className="lp-section__label">How It Works</span>
        <h2 className="lp-section__title">Three Steps to AI Visibility</h2>
      </div>

      <div className="lp-hiw__timeline">
        <div ref={lineRef} className="lp-hiw__line" />
        {STEPS.map((step, i) => (
          <div key={i} className="lp-hiw__step">
            <div className="lp-hiw__step-num">{step.num}</div>
            <div className="lp-hiw__step-content">
              <h3 className="lp-hiw__step-title">{step.title}</h3>
              <p className="lp-hiw__step-desc">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
