import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const TESTIMONIALS = [
  {
    avatar: 'SC',
    text: 'We went from zero AI citations to appearing in 60% of relevant ChatGPT answers within 3 weeks. The checklist alone is worth 10x the price.',
    name: 'Sarah Chen',
    role: 'Head of SEO, DigitalFirst Agency',
    stars: 5,
  },
  {
    avatar: 'MR',
    text: 'The client portal changed our workflow completely. Clients can see their AEO progress in real-time without us creating manual reports every week.',
    name: 'Marcus Rodriguez',
    role: 'Founder, SearchWave Marketing',
    stars: 5,
  },
  {
    avatar: 'EP',
    text: 'Finally, a tool that understands the difference between SEO and AEO. The schema generator and content writer save us hours per client.',
    name: 'Emily Park',
    role: 'SEO Director, GrowthLab',
    stars: 5,
  },
  {
    avatar: 'JM',
    text: 'The competitor analysis feature revealed gaps we never knew existed. Within a month, our client\'s AI citations increased by 200%.',
    name: 'James Mitchell',
    role: 'Technical SEO Lead, Apex Digital',
    stars: 5,
  },
]

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

    gsap.fromTo(section.querySelectorAll('.lp-testi__card'),
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.7,
        scrollTrigger: { trigger: section.querySelector('.lp-testi__grid'), start: 'top 80%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-section lp-testi" aria-label="Testimonials">
      <div className="lp-section__header">
        <span className="lp-section__label">Testimonials</span>
        <h2 className="lp-section__title">Loved by SEO Professionals</h2>
      </div>

      <div className="lp-testi__grid">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="lp-testi__card">
            <div className="lp-testi__stars">
              {Array.from({ length: t.stars }, (_, si) => (
                <svg key={si} width="16" height="16" viewBox="0 0 16 16" fill="#F59E0B">
                  <path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.3 3.7 14.5l.8-4.8L1 6.3l4.8-.8z" />
                </svg>
              ))}
            </div>
            <blockquote className="lp-testi__text">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <div className="lp-testi__author">
              <div className="lp-testi__avatar">{t.avatar}</div>
              <div>
                <div className="lp-testi__name">{t.name}</div>
                <div className="lp-testi__role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
