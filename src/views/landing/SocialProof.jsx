import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { Building2, Rocket, ShoppingBag, Server, Newspaper } from 'lucide-react'

const INDUSTRIES = [
  { Icon: Building2, label: 'Agencies' },
  { Icon: Rocket, label: 'SaaS' },
  { Icon: ShoppingBag, label: 'E-Commerce' },
  { Icon: Server, label: 'Enterprise' },
  { Icon: Newspaper, label: 'Publishers' },
]

export default function SocialProof() {
  const sectionRef = useRef(null)
  const countRef = useRef(null)
  const count = 2400

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    gsap.fromTo(section.querySelectorAll('[data-reveal]'),
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, stagger: 0.08, duration: 0.7,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      }
    )

    // Counter animation
    if (countRef.current) {
      gsap.from(countRef.current, {
        textContent: 0,
        duration: 2,
        snap: { textContent: 1 },
        scrollTrigger: { trigger: countRef.current, start: 'top 85%', once: true },
      })
    }
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-social-proof" aria-label="Social proof">
      <div className="lp-social-proof__inner">
        <p className="lp-social-proof__headline" data-reveal>
          Trusted by <span ref={countRef} className="lp-social-proof__count">{count.toLocaleString()}</span>+ SEO professionals worldwide
        </p>
        <div className="lp-social-proof__logos" data-reveal>
          {INDUSTRIES.map((industry, i) => (
            <div key={i} className="lp-social-proof__logo">
              <industry.Icon size={20} />
              <span>{industry.label}</span>
            </div>
          ))}
        </div>
        <div className="lp-social-proof__live" data-reveal>
          <span>Join {count.toLocaleString()}+ professionals already optimizing for AI</span>
        </div>
      </div>
    </section>
  )
}
