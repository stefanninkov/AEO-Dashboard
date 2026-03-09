import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'

const FEATURES = [
  {
    badge: 'Core Feature',
    title: '99-Point AEO Checklist',
    description: 'Comprehensive, phase-by-phase checklist covering every aspect of Answer Engine Optimization. From schema markup to content structure, AI crawlability to entity clarity — nothing gets missed.',
    mockupType: 'checklist',
  },
  {
    badge: 'Deterministic + AI',
    title: 'Real-Time Site Analyzer',
    description: 'Enter any URL for an instant 100-point AEO readiness score. The deterministic engine crawls your HTML, checks 10 AI crawlers in robots.txt, analyzes your sitemap, and scores across 5 categories.',
    mockupType: 'analyzer',
  },
  {
    badge: 'Multi-Engine',
    title: 'AI Search Testing Lab',
    description: 'Test how your content appears across ChatGPT, Perplexity, Claude, and Gemini simultaneously. See which AI engines cite your site and identify gaps in your AI visibility.',
    mockupType: 'testing',
  },
]

function ChecklistMockup() {
  const items = [
    { label: 'Implement FAQ Schema', done: true, color: '#10B981' },
    { label: 'Add HowTo Markup', done: true, color: '#10B981' },
    { label: 'Optimize Meta Descriptions', done: false, color: '#F59E0B' },
    { label: 'Structure Headings for AI', done: false, color: '#6B7280' },
  ]
  return (
    <div className="lp-feat-mock lp-feat-mock--checklist">
      <div className="lp-feat-mock__header">
        <span className="lp-feat-mock__header-title">Phase 2: Schema Markup</span>
        <span className="lp-feat-mock__header-badge">50% Complete</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="lp-feat-mock__item">
          <div className={`lp-feat-mock__check ${item.done ? 'lp-feat-mock__check--done' : ''}`} style={{ borderColor: item.color }}>
            {item.done && <svg viewBox="0 0 12 12" width="10" height="10"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" /></svg>}
          </div>
          <span>{item.label}</span>
          <div className="lp-feat-mock__bar">
            <div style={{ width: item.done ? '100%' : '30%', backgroundColor: item.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalyzerMockup() {
  const metrics = [
    { label: 'Schema', value: 85, color: '#10B981' },
    { label: 'Content', value: 72, color: '#F59E0B' },
    { label: 'Crawlability', value: 90, color: '#2563EB' },
    { label: 'Entity', value: 65, color: '#8B5CF6' },
  ]
  return (
    <div className="lp-feat-mock lp-feat-mock--analyzer">
      <div className="lp-feat-mock__score-ring">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="#2563EB" strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 52 * 0.72} ${2 * Math.PI * 52}`}
            strokeLinecap="round" transform="rotate(-90 60 60)" />
        </svg>
        <div className="lp-feat-mock__score-text">
          <span className="lp-feat-mock__score-num">72</span>
          <span className="lp-feat-mock__score-label">AEO Score</span>
        </div>
      </div>
      <div className="lp-feat-mock__metrics">
        {metrics.map((m, i) => (
          <div key={i} className="lp-feat-mock__metric">
            <span className="lp-feat-mock__metric-label">{m.label}</span>
            <div className="lp-feat-mock__metric-bar">
              <div style={{ width: `${m.value}%`, backgroundColor: m.color }} />
            </div>
            <span className="lp-feat-mock__metric-val" style={{ color: m.color }}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TestingMockup() {
  const engines = [
    { name: 'ChatGPT', status: 'Cited', color: '#10B981' },
    { name: 'Perplexity', status: 'Cited', color: '#10B981' },
    { name: 'Gemini', status: 'Not Cited', color: '#EF4444' },
    { name: 'Claude', status: 'Partial', color: '#F59E0B' },
  ]
  return (
    <div className="lp-feat-mock lp-feat-mock--testing">
      {engines.map((engine, i) => (
        <div key={i} className="lp-feat-mock__engine">
          <span className="lp-feat-mock__engine-name">{engine.name}</span>
          <span className="lp-feat-mock__engine-status" style={{ color: engine.color, backgroundColor: `${engine.color}18` }}>
            {engine.status}
          </span>
          <div className="lp-feat-mock__engine-lines">
            <div /><div /><div />
          </div>
        </div>
      ))}
    </div>
  )
}

const MOCKUPS = { checklist: ChecklistMockup, analyzer: AnalyzerMockup, testing: TestingMockup }

export default function FeaturesSection() {
  const sectionRef = useRef(null)
  const panelsRef = useRef(null)

  useGSAP(() => {
    const section = sectionRef.current
    const panels = panelsRef.current
    if (!section || !panels) return

    const featureEls = panels.querySelectorAll('.lp-feat__panel')

    // Pin the section and crossfade features
    if (featureEls.length > 1) {
      // Set all panels except first to invisible
      gsap.set(Array.from(featureEls).slice(1), { opacity: 0, y: 40 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${featureEls.length * 100}%`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      })

      for (let i = 0; i < featureEls.length - 1; i++) {
        tl.to(featureEls[i], { opacity: 0, y: -30, duration: 0.4 })
          .fromTo(featureEls[i + 1],
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.4 },
            '-=0.2'
          )
        if (i < featureEls.length - 2) {
          tl.to({}, { duration: 0.3 }) // pause between features
        }
      }
    }
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="features" className="lp-section lp-feat" aria-label="Key features">
      <div className="lp-section__header">
        <span className="lp-section__label">Features</span>
        <h2 className="lp-section__title">Everything You Need for AEO</h2>
        <p className="lp-section__subtitle">
          Three powerful tools that cover the entire AEO workflow — from audit to optimization to verification.
        </p>
      </div>

      <div ref={panelsRef} className="lp-feat__panels">
        {FEATURES.map((feature, i) => {
          const MockupComponent = MOCKUPS[feature.mockupType]
          return (
            <div key={i} className="lp-feat__panel">
              <div className="lp-feat__text">
                <span className="lp-feat__badge">{feature.badge}</span>
                <h3 className="lp-feat__title">{feature.title}</h3>
                <p className="lp-feat__desc">{feature.description}</p>
              </div>
              <div className="lp-feat__visual">
                {MockupComponent && <MockupComponent />}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
