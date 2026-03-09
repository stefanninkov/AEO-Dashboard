import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { Globe2, Blocks, BarChart4, Link2, Mail, Radar, Server, Smartphone } from 'lucide-react'

const INTEGRATIONS = [
  { name: 'Webflow', Icon: Globe2 },
  { name: 'Zapier', Icon: Blocks },
  { name: 'Google Analytics', Icon: BarChart4 },
  { name: 'Search Console', Icon: Link2 },
  { name: 'EmailJS', Icon: Mail },
  { name: 'Firebase', Icon: Server },
  { name: 'Make', Icon: Radar },
  { name: 'PWA', Icon: Smartphone },
]

export default function IntegrationLogos() {
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

    const logos = section.querySelectorAll('.lp-integrations__item')
    gsap.fromTo(logos,
      { opacity: 0, scale: 0.8, y: 30 },
      {
        opacity: 1, scale: 1, y: 0, stagger: 0.06, duration: 0.6,
        scrollTrigger: { trigger: section.querySelector('.lp-integrations__grid'), start: 'top 80%', once: true },
      }
    )

    // Subtle floating animation on each logo
    logos.forEach((logo, i) => {
      gsap.to(logo, {
        y: -6,
        duration: 2 + i * 0.3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.2,
      })
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-section lp-integrations" aria-label="Integrations">
      <div className="lp-section__header">
        <span className="lp-section__label">Integrations</span>
        <h2 className="lp-section__title">Works With Your Stack</h2>
        <p className="lp-section__subtitle">
          Connect with your favorite tools and platforms. AEO Dashboard integrates seamlessly with your existing workflow.
        </p>
      </div>

      <div className="lp-integrations__grid">
        {INTEGRATIONS.map((integration, i) => (
          <div key={i} className="lp-integrations__item">
            <integration.Icon size={28} />
            <span>{integration.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
