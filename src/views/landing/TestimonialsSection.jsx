import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { MessageSquareQuote } from 'lucide-react'

export default function TestimonialsSection() {
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

    gsap.fromTo(section.querySelector('.lp-testi__placeholder'),
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-section lp-testi" aria-label="Testimonials">
      <div className="lp-section__header">
        <span className="lp-section__label">Testimonials</span>
        <h2 className="lp-section__title">What Early Users Are Saying</h2>
      </div>

      <div className="lp-testi__placeholder" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '4rem 2rem',
        borderRadius: 'var(--radius-xl, 0.75rem)',
        border: '0.0625rem dashed var(--border-default, rgba(0,0,0,0.10))',
        textAlign: 'center',
        maxWidth: '36rem',
        margin: '0 auto',
      }}>
        <div style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: 'var(--radius-lg, 0.5rem)',
          background: 'var(--accent-subtle, rgba(37,99,235,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MessageSquareQuote size={24} style={{ color: 'var(--accent, #2563EB)' }} />
        </div>
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary, #0F1419)',
            marginBottom: '0.5rem',
            fontFamily: 'var(--lp-font-heading, Sora, sans-serif)',
          }}>
            Beta tester feedback coming soon
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary, #536471)',
            lineHeight: 1.6,
          }}>
            We're collecting feedback from our early access users.
            Be among the first to share your experience.
          </p>
        </div>
        <a
          href="/AEO-Dashboard/?/waitlist"
          className="lp-btn lp-btn--secondary"
          style={{ marginTop: '0.5rem' }}
        >
          <span className="lp-btn__text">Join Early Access</span>
          <span className="lp-btn__text lp-btn__text--clone">Join Early Access</span>
        </a>
      </div>
    </section>
  )
}
