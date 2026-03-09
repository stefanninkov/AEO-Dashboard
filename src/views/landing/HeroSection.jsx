import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { getLenis } from '../../lib/lenis'

export default function HeroSection() {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const mockupRef = useRef(null)
  const badgeRef = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    // Badge slides in
    tl.fromTo(badgeRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 }
    )

    // Headline: split into words and stagger (preserve gradient via inherit)
    const headline = headlineRef.current
    if (headline) {
      const text = headline.textContent
      headline.innerHTML = ''
      const words = text.split(' ')
      words.forEach((word, i) => {
        const span = document.createElement('span')
        span.textContent = word
        span.className = 'hero-word'
        headline.appendChild(span)
        if (i < words.length - 1) {
          headline.appendChild(document.createTextNode(' '))
        }
      })

      gsap.set(headline.querySelectorAll('.hero-word'), {
        opacity: 0,
        y: 40,
        rotateX: 15,
      })

      tl.to(headline.querySelectorAll('.hero-word'), {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.06,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
    }

    // Subtitle
    tl.fromTo(subRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7 },
      '-=0.5'
    )

    // CTA buttons
    tl.fromTo(ctaRef.current?.children,
      { opacity: 0, y: 20, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.5 },
      '-=0.4'
    )

    // Mockup
    tl.fromTo(mockupRef.current,
      { opacity: 0, y: 60, scale: 0.92, rotateX: 8 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.2, ease: 'power3.out' },
      '-=0.5'
    )
  }, { scope: sectionRef })

  function scrollToFeatures(e) {
    e.preventDefault()
    const el = document.getElementById('features')
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: -80 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} id="hero" className="lp-hero">
      <div className="lp-hero__grain" aria-hidden="true" />
      <div className="lp-hero__glow" aria-hidden="true" />

      <div className="lp-hero__content">
        <div ref={badgeRef} className="lp-badge">
          Built for Agencies & SEO Teams
        </div>

        <h1 ref={headlineRef} className="lp-hero__title">
          Optimize Your Website for AI Search Engines
        </h1>

        <p ref={subRef} className="lp-hero__sub">
          Get your clients cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. The complete AEO toolkit with a 99-point checklist, AI-powered analyzer, and client-ready reports.
        </p>

        <div ref={ctaRef} className="lp-hero__ctas">
          <a href="/AEO-Dashboard/app" className="lp-btn lp-btn--primary">
            <span className="lp-btn__text">Start 14-Day Free Trial</span>
            <span className="lp-btn__text lp-btn__text--clone">Start 14-Day Free Trial</span>
          </a>
          <a href="#features" className="lp-btn lp-btn--secondary" onClick={scrollToFeatures}>
            <span className="lp-btn__text">See Features</span>
            <span className="lp-btn__text lp-btn__text--clone">See Features</span>
          </a>
        </div>
      </div>

      {/* CSS-only dashboard mockup */}
      <div ref={mockupRef} className="lp-hero__mockup" aria-hidden="true" style={{ perspective: '1200px' }}>
        <div className="lp-mockup__frame">
          <div className="lp-mockup__sidebar">
            <div className="lp-mockup__sidebar-logo"><span>AEO</span> Dash</div>
            {['Dashboard', 'Checklist', 'Analyzer', 'Writer', 'Schema', 'Monitoring'].map((item, i) => (
              <div key={item} className={`lp-mockup__sidebar-item ${i === 0 ? 'lp-mockup__sidebar-item--active' : ''}`}>
                <div className="lp-mockup__sidebar-dot" />
                {item}
              </div>
            ))}
          </div>
          <div className="lp-mockup__main">
            <div className="lp-mockup__header">
              <span className="lp-mockup__header-title">Project Overview</span>
              <span className="lp-mockup__header-badge">On Track</span>
            </div>
            <div className="lp-mockup__stats">
              {[
                { label: 'AEO Score', value: '78', color: '#2563EB' },
                { label: 'Tasks Done', value: '61/99', color: '#10B981' },
                { label: 'AI Citations', value: '12', color: '#F59E0B' },
              ].map((stat) => (
                <div key={stat.label} className="lp-mockup__stat-card">
                  <div className="lp-mockup__stat-value" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="lp-mockup__stat-label">{stat.label}</div>
                  <div className="lp-mockup__stat-bar">
                    <div style={{ width: '65%', backgroundColor: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-mockup__chart">
              {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95].map((h, i) => (
                <div key={i} className="lp-mockup__chart-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
