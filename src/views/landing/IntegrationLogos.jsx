import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { Globe2, Blocks, BarChart4, Link2, Mail, Radar, Server, Smartphone } from 'lucide-react'

const INTEGRATIONS = [
  { name: 'Webflow', Icon: Globe2, desc: 'Visual CMS' },
  { name: 'Zapier', Icon: Blocks, desc: 'Automation' },
  { name: 'Google Analytics', Icon: BarChart4, desc: 'Analytics' },
  { name: 'Search Console', Icon: Link2, desc: 'SEO Data' },
  { name: 'EmailJS', Icon: Mail, desc: 'Notifications' },
  { name: 'Firebase', Icon: Server, desc: 'Backend' },
  { name: 'Make', Icon: Radar, desc: 'Workflows' },
  { name: 'PWA', Icon: Smartphone, desc: 'Mobile App' },
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

    // Staggered reveal from center outward
    const items = section.querySelectorAll('.lp-integrations__item')
    const center = items.length / 2
    const sorted = Array.from(items).sort((a, b) => {
      const ai = parseInt(a.dataset.index)
      const bi = parseInt(b.dataset.index)
      return Math.abs(ai - center) - Math.abs(bi - center)
    })

    gsap.fromTo(sorted,
      { opacity: 0, scale: 0.85, y: 20 },
      {
        opacity: 1, scale: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out',
        scrollTrigger: { trigger: section.querySelector('.lp-integrations__layout'), start: 'top 80%', once: true },
      }
    )

    // Center hub
    const hub = section.querySelector('.lp-integrations__hub')
    if (hub) {
      gsap.fromTo(hub,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: hub, start: 'top 85%', once: true },
        }
      )
    }
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

      <div className="lp-integrations__layout">
        <div className="lp-integrations__grid">
          {INTEGRATIONS.slice(0, 4).map((integration, i) => (
            <div key={i} className="lp-integrations__item" data-index={i}>
              <div className="lp-integrations__icon-wrap">
                <integration.Icon size={24} />
              </div>
              <span className="lp-integrations__name">{integration.name}</span>
              <span className="lp-integrations__desc">{integration.desc}</span>
            </div>
          ))}
        </div>

        <div className="lp-integrations__hub">
          <div className="lp-integrations__hub-ring" />
          <div className="lp-integrations__hub-core">
            <span>AEO</span>
          </div>
        </div>

        <div className="lp-integrations__grid">
          {INTEGRATIONS.slice(4).map((integration, i) => (
            <div key={i + 4} className="lp-integrations__item" data-index={i + 4}>
              <div className="lp-integrations__icon-wrap">
                <integration.Icon size={24} />
              </div>
              <span className="lp-integrations__name">{integration.name}</span>
              <span className="lp-integrations__desc">{integration.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
