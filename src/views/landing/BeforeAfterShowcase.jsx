import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'

const BEFORE_METRICS = [
  { label: 'AI Citations', value: 0, max: 18, color: '#EF4444' },
  { label: 'AEO Score', value: 12, max: 100, color: '#EF4444' },
  { label: 'Schema Types', value: 0, max: 10, color: '#EF4444' },
]

const AFTER_METRICS = [
  { label: 'AI Citations', value: 18, max: 18, color: '#10B981' },
  { label: 'AEO Score', value: 92, max: 100, color: '#10B981' },
  { label: 'Schema Types', value: 8, max: 10, color: '#10B981' },
]

const BEFORE_ISSUES = [
  { text: 'No structured data', icon: '✕' },
  { text: 'AI crawlers blocked', icon: '✕' },
  { text: 'No FAQ markup', icon: '✕' },
  { text: 'Missing meta descriptions', icon: '✕' },
]

const AFTER_WINS = [
  { text: 'Cited in ChatGPT & Perplexity', icon: '✓' },
  { text: 'Full schema coverage', icon: '✓' },
  { text: 'AI-optimized content structure', icon: '✓' },
  { text: 'Indexed by all AI crawlers', icon: '✓' },
]

function MetricBar({ label, value, max, color, animated }) {
  const pct = (value / max) * 100
  return (
    <div className="lp-ba2__metric">
      <div className="lp-ba2__metric-header">
        <span className="lp-ba2__metric-label">{label}</span>
        <span className="lp-ba2__metric-value" style={{ color }}>
          {animated ? value : 0}{label === 'AEO Score' ? '/100' : label === 'Schema Types' ? '/10' : ''}
        </span>
      </div>
      <div className="lp-ba2__metric-track">
        <div
          className="lp-ba2__metric-fill"
          style={{
            width: animated ? `${pct}%` : '0%',
            backgroundColor: color,
            transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
    </div>
  )
}

export default function BeforeAfterShowcase() {
  const sectionRef = useRef(null)
  const [animated, setAnimated] = useState(false)
  const [activeView, setActiveView] = useState('after')

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    // Header reveal
    gsap.fromTo(section.querySelector('.lp-section__header'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      }
    )

    // Cards reveal staggered
    gsap.fromTo(section.querySelectorAll('.lp-ba2__card'),
      { opacity: 0, y: 50, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section.querySelector('.lp-ba2__grid'),
          start: 'top 80%',
          once: true,
          onEnter: () => {
            setTimeout(() => setAnimated(true), 300)
          },
        },
      }
    )

    // Arrow animation
    const arrow = section.querySelector('.lp-ba2__arrow')
    if (arrow) {
      gsap.fromTo(arrow,
        { opacity: 0, scale: 0, rotate: -45 },
        {
          opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: arrow, start: 'top 80%', once: true },
        }
      )
    }
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-section lp-ba2" aria-label="Before and after">
      <div className="lp-section__header">
        <span className="lp-section__label">Results</span>
        <h2 className="lp-section__title">The AEO Transformation</h2>
        <p className="lp-section__subtitle">
          See the measurable impact of AEO optimization on a real website's AI visibility and search performance.
        </p>
      </div>

      {/* Toggle for mobile */}
      <div className="lp-ba2__toggle">
        <button
          className={`lp-ba2__toggle-btn ${activeView === 'before' ? 'lp-ba2__toggle-btn--active lp-ba2__toggle-btn--before' : ''}`}
          onClick={() => setActiveView('before')}
        >
          Before
        </button>
        <button
          className={`lp-ba2__toggle-btn ${activeView === 'after' ? 'lp-ba2__toggle-btn--active lp-ba2__toggle-btn--after' : ''}`}
          onClick={() => setActiveView('after')}
        >
          After
        </button>
      </div>

      <div className="lp-ba2__grid">
        {/* Before Card */}
        <div className={`lp-ba2__card lp-ba2__card--before ${activeView === 'before' ? 'lp-ba2__card--mobile-active' : ''}`}>
          <div className="lp-ba2__card-header">
            <div className="lp-ba2__status lp-ba2__status--bad">
              <span className="lp-ba2__status-dot lp-ba2__status-dot--bad" />
              Before AEO
            </div>
            <span className="lp-ba2__domain">acme.com</span>
          </div>

          <div className="lp-ba2__score-area lp-ba2__score-area--bad">
            <div className="lp-ba2__score-circle lp-ba2__score-circle--bad">
              <svg viewBox="0 0 100 100" width="100" height="100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#EF4444" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 42 * 0.12} ${2 * Math.PI * 42}`}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
              </svg>
              <span className="lp-ba2__score-num" style={{ color: '#EF4444' }}>12</span>
            </div>
            <span className="lp-ba2__score-label">AEO Score</span>
          </div>

          <div className="lp-ba2__metrics">
            {BEFORE_METRICS.map((m, i) => (
              <MetricBar key={i} {...m} animated={animated} />
            ))}
          </div>

          <div className="lp-ba2__list">
            {BEFORE_ISSUES.map((item, i) => (
              <div key={i} className="lp-ba2__list-item lp-ba2__list-item--bad">
                <span className="lp-ba2__list-icon lp-ba2__list-icon--bad">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="lp-ba2__arrow">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16h16m0 0l-6-6m6 6l-6 6" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* After Card */}
        <div className={`lp-ba2__card lp-ba2__card--after ${activeView === 'after' ? 'lp-ba2__card--mobile-active' : ''}`}>
          <div className="lp-ba2__card-header">
            <div className="lp-ba2__status lp-ba2__status--good">
              <span className="lp-ba2__status-dot lp-ba2__status-dot--good" />
              After AEO
            </div>
            <span className="lp-ba2__domain">acme.com</span>
          </div>

          <div className="lp-ba2__score-area lp-ba2__score-area--good">
            <div className="lp-ba2__score-circle lp-ba2__score-circle--good">
              <svg viewBox="0 0 100 100" width="100" height="100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" strokeWidth="6"
                  strokeDasharray={animated
                    ? `${2 * Math.PI * 42 * 0.92} ${2 * Math.PI * 42}`
                    : `0 ${2 * Math.PI * 42}`}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
              </svg>
              <span className="lp-ba2__score-num" style={{ color: '#10B981' }}>92</span>
            </div>
            <span className="lp-ba2__score-label">AEO Score</span>
          </div>

          <div className="lp-ba2__metrics">
            {AFTER_METRICS.map((m, i) => (
              <MetricBar key={i} {...m} animated={animated} />
            ))}
          </div>

          <div className="lp-ba2__list">
            {AFTER_WINS.map((item, i) => (
              <div key={i} className="lp-ba2__list-item lp-ba2__list-item--good">
                <span className="lp-ba2__list-icon lp-ba2__list-icon--good">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
