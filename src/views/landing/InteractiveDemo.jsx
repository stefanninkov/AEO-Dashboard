import { useRef, useState } from 'react'
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

export default function InteractiveDemo() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
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

  function switchTab(tabId) {
    if (tabId === activeTab) return
    const content = contentRef.current
    if (!content) {
      setActiveTab(tabId)
      return
    }
    gsap.to(content, {
      opacity: 0, y: 10, duration: 0.2,
      onComplete: () => {
        setActiveTab(tabId)
        gsap.fromTo(content, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 })
      },
    })
  }

  const tab = TABS.find((t) => t.id === activeTab)

  return (
    <section ref={sectionRef} className="lp-section lp-demo" aria-label="Interactive demo">
      <div className="lp-section__header">
        <span className="lp-section__label">Try It</span>
        <h2 className="lp-section__title">See It in Action</h2>
        <p className="lp-section__subtitle">
          Click through a live preview of the dashboard. Explore the checklist, analyzer, and content writer.
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
              onClick={() => switchTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div ref={contentRef} className="lp-demo__content">
          {activeTab === 'checklist' && (
            <div className="lp-demo__checklist">
              <h4>{tab.content.title}</h4>
              <div className="lp-demo__progress">
                <div className="lp-demo__progress-bar">
                  <div style={{ width: `${tab.content.progress}%` }} />
                </div>
                <span>{tab.content.progress}%</span>
              </div>
              {tab.content.items.map((item, i) => (
                <div key={i} className="lp-demo__check-item">
                  <div className={`lp-demo__checkbox ${item.done ? 'lp-demo__checkbox--done' : ''}`}>
                    {item.done && <svg viewBox="0 0 12 12" width="10"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" /></svg>}
                  </div>
                  <span className={item.done ? 'lp-demo__done-text' : ''}>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analyzer' && (
            <div className="lp-demo__analyzer">
              <h4>{tab.content.title}</h4>
              <div className="lp-demo__analyzer-score">
                <span className="lp-demo__big-score">{tab.content.score}</span>
                <span className="lp-demo__score-suffix">/100</span>
              </div>
              {tab.content.categories.map((cat, i) => (
                <div key={i} className="lp-demo__cat">
                  <span>{cat.name}</span>
                  <div className="lp-demo__cat-bar">
                    <div style={{ width: `${cat.score}%` }} />
                  </div>
                  <span>{cat.score}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'writer' && (
            <div className="lp-demo__writer">
              <h4>{tab.content.title}</h4>
              <div className="lp-demo__writer-type">
                <span className="lp-demo__writer-badge">{tab.content.type}</span>
              </div>
              <pre className="lp-demo__code">{tab.content.output}</pre>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
