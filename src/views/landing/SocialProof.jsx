import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { Building2, Rocket, ShoppingBag, Server, Newspaper } from 'lucide-react'

const COMPANIES = [
  { Icon: Building2, name: 'TechCorp' },
  { Icon: Rocket, name: 'MediaHub' },
  { Icon: ShoppingBag, name: 'DataSync' },
  { Icon: Server, name: 'CloudBase' },
  { Icon: Newspaper, name: 'NetFlow' },
]

export default function SocialProof() {
  const sectionRef = useRef(null)
  const countRef = useRef(null)
  const [count, setCount] = useState(2487)

  // Live user count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2
        return Math.max(2467, Math.min(2517, prev + delta))
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

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
          {COMPANIES.map((company, i) => (
            <div key={i} className="lp-social-proof__logo">
              <company.Icon size={20} />
              <span>{company.name}</span>
            </div>
          ))}
        </div>
        <div className="lp-social-proof__live" data-reveal>
          <span className="lp-social-proof__live-dot" />
          <span>{count.toLocaleString()} professionals optimizing right now</span>
        </div>
      </div>
    </section>
  )
}
