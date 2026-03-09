import { useRef, useState, useEffect, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const TABS = [
  {
    id: 'checklist',
    label: 'Checklist',
    content: {
      title: 'Phase 2: Schema Markup',
      items: [
        { label: 'Add FAQ Schema to top 10 pages', done: true },
        { label: 'Implement HowTo markup for guides', done: true },
        { label: 'Add Speakable schema to blog posts', done: false },
        { label: 'Create Organization schema', done: false },
        { label: 'Add BreadcrumbList markup', done: true },
      ],
      progress: 60,
    },
  },
  {
    id: 'analyzer',
    label: 'Analyzer',
    content: {
      title: 'Site Analysis: acme.com',
      score: 78,
      categories: [
        { name: 'Schema Coverage', score: 85 },
        { name: 'Content Structure', score: 72 },
        { name: 'AI Crawlability', score: 90 },
        { name: 'Entity Clarity', score: 65 },
        { name: 'Technical Score', score: 78 },
      ],
    },
  },
  {
    id: 'writer',
    label: 'Writer',
    content: {
      title: 'AI Content Writer',
      type: 'FAQ Schema',
      output: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is AEO?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Answer Engine Optimization..."
    }
  }]
}`,
    },
  },
]

function ChecklistContent({ content }) {
  const [checked, setChecked] = useState(
    content.items.map((item) => item.done)
  )
  const doneCount = checked.filter(Boolean).length
  const progress = Math.round((doneCount / checked.length) * 100)

  const toggle = useCallback((i) => {
    setChecked((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }, [])

  return (
    <div className="lp-demo__checklist">
      <h4>{content.title}</h4>
      <div className="lp-demo__progress">
        <div className="lp-demo__progress-bar">
          <div style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
        <span>{progress}%</span>
      </div>
      {content.items.map((item, i) => (
        <div
          key={i}
          className="lp-demo__check-item lp-demo__check-item--interactive"
          onClick={() => toggle(i)}
          role="button"
          tabIndex={0}
        >
          <div className={`lp-demo__checkbox ${checked[i] ? 'lp-demo__checkbox--done' : ''}`}>
            {checked[i] && <svg viewBox="0 0 12 12" width="10"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" /></svg>}
          </div>
          <span className={checked[i] ? 'lp-demo__done-text' : ''}>{item.label}</span>
        </div>
      ))}
      <p className="lp-demo__hint">Click items to toggle completion</p>
    </div>
  )
}

function AnalyzerContent({ content }) {
  const [animated, setAnimated] = useState(false)
  const [hoveredCat, setHoveredCat] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="lp-demo__analyzer">
      <h4>{content.title}</h4>
      <div className="lp-demo__analyzer-score">
        <div className="lp-demo__score-ring">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--lp-accent)" strokeWidth="5"
              strokeDasharray={animated
                ? `${2 * Math.PI * 34 * (content.score / 100)} ${2 * Math.PI * 34}`
                : `0 ${2 * Math.PI * 34}`}
              strokeLinecap="round" transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          </svg>
          <span className="lp-demo__ring-score">{content.score}</span>
        </div>
        <span className="lp-demo__score-suffix">/100</span>
      </div>
      {content.categories.map((cat, i) => (
        <div
          key={i}
          className={`lp-demo__cat ${hoveredCat === i ? 'lp-demo__cat--hovered' : ''}`}
          onMouseEnter={() => setHoveredCat(i)}
          onMouseLeave={() => setHoveredCat(null)}
        >
          <span>{cat.name}</span>
          <div className="lp-demo__cat-bar">
            <div style={{
              width: animated ? `${cat.score}%` : '0%',
              transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.1}s`,
            }} />
          </div>
          <span className="lp-demo__cat-score">{cat.score}</span>
        </div>
      ))}
    </div>
  )
}

function WriterContent({ content }) {
  const [displayedText, setDisplayedText] = useState('')
  const fullText = content.output

  useEffect(() => {
    let i = 0
    setDisplayedText('')
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, 12)
    return () => clearInterval(interval)
  }, [fullText])

  return (
    <div className="lp-demo__writer">
      <h4>{content.title}</h4>
      <div className="lp-demo__writer-type">
        <span className="lp-demo__writer-badge">{content.type}</span>
        <span className="lp-demo__writer-status">Generating...</span>
      </div>
      <pre className="lp-demo__code">
        {displayedText}
        <span className="lp-demo__cursor">|</span>
      </pre>
    </div>
  )
}

export default function InteractiveDemo() {
  const sectionRef = useRef(null)
  const [activeTab, setActiveTab] = useState('checklist')

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

    gsap.fromTo(section.querySelector('.lp-demo__frame'),
      { opacity: 0, y: 60, scale: 0.94 },
      {
        opacity: 1, y: 0, scale: 1, duration: 1,
        scrollTrigger: { trigger: section, start: 'top 65%', once: true },
      }
    )
  }, { scope: sectionRef })

  const tab = TABS.find((t) => t.id === activeTab)

  return (
    <section ref={sectionRef} className="lp-section lp-demo" aria-label="Interactive demo">
      <div className="lp-section__header">
        <span className="lp-section__label">Try It</span>
        <h2 className="lp-section__title">See It in Action</h2>
        <p className="lp-section__subtitle">
          Click through a live preview of the dashboard. Toggle checkboxes, watch scores animate, and see AI-generated code stream in real time.
        </p>
      </div>

      <div className="lp-demo__frame">
        <div className="lp-demo__toolbar">
          <div className="lp-demo__dots"><span /><span /><span /></div>
          <span className="lp-demo__url">app.aeodashboard.com</span>
        </div>

        <div className="lp-demo__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`lp-demo__tab ${activeTab === t.id ? 'lp-demo__tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="lp-demo__content">
          {activeTab === 'checklist' && <ChecklistContent content={tab.content} />}
          {activeTab === 'analyzer' && <AnalyzerContent content={tab.content} />}
          {activeTab === 'writer' && <WriterContent content={tab.content} />}
        </div>
      </div>
    </section>
  )
}
