import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { Search, ClipboardCheck, Activity } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Analyze Your Site',
    description: 'Enter any URL for an instant AEO readiness score. Our deterministic engine crawls your HTML, checks AI crawlers, and identifies optimization opportunities.',
    Icon: Search,
    color: '#2563EB',
  },
  {
    num: '02',
    title: 'Follow the Checklist',
    description: 'Work through the 99-point AEO checklist phase by phase. Each item includes AI-generated suggestions and one-click schema markup generation.',
    Icon: ClipboardCheck,
    color: '#10B981',
  },
  {
    num: '03',
    title: 'Verify & Monitor',
    description: 'Test your content across ChatGPT, Perplexity, Claude, and Gemini. Set up automated monitoring to track citation changes and visibility shifts.',
    Icon: Activity,
    color: '#8B5CF6',
  },
]

export default function HowItWorks() {
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

    const cards = section.querySelectorAll('.lp-hiw__card')
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, delay: i * 0.15,
          scrollTrigger: { trigger: section.querySelector('.lp-hiw__grid'), start: 'top 80%', once: true },
        }
      )
    })

    // Connector lines draw in
    const connectors = section.querySelectorAll('.lp-hiw__connector')
    connectors.forEach((line, i) => {
      gsap.fromTo(line,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 0.6, delay: 0.3 + i * 0.15,
          ease: 'power2.out',
          scrollTrigger: { trigger: section.querySelector('.lp-hiw__grid'), start: 'top 75%', once: true },
        }
      )
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="how-it-works" className="lp-section lp-hiw" aria-label="How it works">
      <div className="lp-section__header">
        <span className="lp-section__label">How It Works</span>
        <h2 className="lp-section__title">Three Steps to AI Visibility</h2>
        <p className="lp-section__subtitle">
          Go from invisible to cited in under a week.
        </p>
      </div>

      <div className="lp-hiw__grid">
        {STEPS.map((step, i) => (
          <div key={i} className="lp-hiw__card-wrap">
            <div className="lp-hiw__card">
              <div className="lp-hiw__card-num" style={{ color: step.color, borderColor: step.color }}>
                {step.num}
              </div>
              <div className="lp-hiw__card-icon" style={{ color: step.color, backgroundColor: `${step.color}14` }}>
                <step.Icon size={24} />
              </div>
              <h3 className="lp-hiw__card-title">{step.title}</h3>
              <p className="lp-hiw__card-desc">{step.description}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="lp-hiw__connector">
                <svg width="100%" height="2" preserveAspectRatio="none">
                  <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--lp-border-strong)" strokeWidth="2" strokeDasharray="6 4" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
