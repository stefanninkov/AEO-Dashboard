import { useRef, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

function StaggerButton({ href, className, children }) {
  const btnRef = useRef(null)
  const letters = children.split('').map((char, i) => (
    <span
      key={i}
      className="lp-btn__letter"
      style={{ animationDelay: `${i * 0.02}s` }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))

  const handleMouseEnter = useCallback(() => {
    const el = btnRef.current
    if (!el) return
    const spans = el.querySelectorAll('.lp-btn__letter')
    spans.forEach((span, i) => {
      gsap.fromTo(span,
        { y: 0 },
        { y: -3, duration: 0.15, delay: i * 0.02, ease: 'power2.out',
          onComplete: () => gsap.to(span, { y: 0, duration: 0.25, ease: 'power2.inOut' })
        }
      )
    })
  }, [])

  return (
    <a ref={btnRef} href={href} className={className} onMouseEnter={handleMouseEnter}>
      {letters}
    </a>
  )
}

export default function FinalCta() {
  const sectionRef = useRef(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    gsap.fromTo(section.children,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-section lp-final-cta" aria-label="Get started">
      <div className="lp-final-cta__glow" aria-hidden="true" />
      <span className="lp-section__label">Ready?</span>
      <h2 className="lp-final-cta__title">Start Optimizing for AI Search Today</h2>
      <p className="lp-final-cta__sub">
        Join 2,500+ SEO professionals already using AEO Dashboard. Start your free 14-day trial — no credit card required.
      </p>
      <div className="lp-final-cta__actions">
        <StaggerButton href="/AEO-Dashboard/app" className="lp-btn lp-btn--primary lp-btn--lg">
          Start 14-Day Free Trial
        </StaggerButton>
      </div>
    </section>
  )
}
