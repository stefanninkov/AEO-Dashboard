import { useRef, useState, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

export default function BeforeAfterShowcase() {
  const sectionRef = useRef(null)
  const sliderRef = useRef(null)
  const [position, setPosition] = useState(50)
  const dragging = useRef(false)

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

    gsap.fromTo(section.querySelector('.lp-ba__container'),
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.9,
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      }
    )
  }, { scope: sectionRef })

  const handleMove = useCallback((clientX) => {
    const container = sliderRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onPointerDown = useCallback((e) => {
    dragging.current = true
    handleMove(e.clientX)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [handleMove])

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return
    handleMove(e.clientX)
  }, [handleMove])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <section ref={sectionRef} className="lp-section lp-ba" aria-label="Before and after">
      <div className="lp-section__header">
        <span className="lp-section__label">Results</span>
        <h2 className="lp-section__title">Before & After AEO</h2>
        <p className="lp-section__subtitle">
          Drag the slider to see how AEO optimization transforms a website's AI visibility.
        </p>
      </div>

      <div
        ref={sliderRef}
        className="lp-ba__container"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Before side */}
        <div className="lp-ba__side lp-ba__side--before">
          <div className="lp-ba__label">Before AEO</div>
          <div className="lp-ba__card">
            <div className="lp-ba__site-header">
              <div className="lp-ba__site-dot" style={{ background: '#EF4444' }} />
              <span>acme.com</span>
            </div>
            <div className="lp-ba__stat lp-ba__stat--bad">
              <span className="lp-ba__stat-value">0</span>
              <span className="lp-ba__stat-label">AI Citations</span>
            </div>
            <div className="lp-ba__stat lp-ba__stat--bad">
              <span className="lp-ba__stat-value">12</span>
              <span className="lp-ba__stat-label">AEO Score</span>
            </div>
            <div className="lp-ba__stat lp-ba__stat--bad">
              <span className="lp-ba__stat-value">0/10</span>
              <span className="lp-ba__stat-label">Schema Types</span>
            </div>
            <div className="lp-ba__issues">
              <div className="lp-ba__issue">No structured data</div>
              <div className="lp-ba__issue">AI crawlers blocked</div>
              <div className="lp-ba__issue">No FAQ markup</div>
            </div>
          </div>
        </div>

        {/* After side */}
        <div className="lp-ba__side lp-ba__side--after" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <div className="lp-ba__label">After AEO</div>
          <div className="lp-ba__card lp-ba__card--after">
            <div className="lp-ba__site-header">
              <div className="lp-ba__site-dot" style={{ background: '#10B981' }} />
              <span>acme.com</span>
            </div>
            <div className="lp-ba__stat lp-ba__stat--good">
              <span className="lp-ba__stat-value">18</span>
              <span className="lp-ba__stat-label">AI Citations</span>
            </div>
            <div className="lp-ba__stat lp-ba__stat--good">
              <span className="lp-ba__stat-value">92</span>
              <span className="lp-ba__stat-label">AEO Score</span>
            </div>
            <div className="lp-ba__stat lp-ba__stat--good">
              <span className="lp-ba__stat-value">8/10</span>
              <span className="lp-ba__stat-label">Schema Types</span>
            </div>
            <div className="lp-ba__wins">
              <div className="lp-ba__win">Cited in ChatGPT</div>
              <div className="lp-ba__win">Full schema coverage</div>
              <div className="lp-ba__win">AI-optimized content</div>
            </div>
          </div>
        </div>

        {/* Slider handle */}
        <div className="lp-ba__slider" style={{ left: `${position}%` }}>
          <div className="lp-ba__slider-line" />
          <div className="lp-ba__slider-handle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8L1 5M4 8L1 11M4 8H12M12 8L15 5M12 8L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
