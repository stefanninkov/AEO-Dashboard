import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

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
        <a href="/AEO-Dashboard/app" className="lp-btn lp-btn--primary lp-btn--lg">
          <span className="lp-btn__text">Start 14-Day Free Trial</span>
          <span className="lp-btn__text lp-btn__text--clone">Start 14-Day Free Trial</span>
        </a>
      </div>
    </section>
  )
}
