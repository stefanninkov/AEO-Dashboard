import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { BarChart4, FileEdit, Blocks, Radar, Link2, Smartphone, Mail, Globe2 } from 'lucide-react'

const FEATURES = [
  { Icon: BarChart4, title: 'Dashboard Analytics', description: 'AEO health score, phase radar, velocity tracking, and trend analysis.' },
  { Icon: FileEdit, title: 'AI Content Writer', description: 'Generate AEO-optimized content with schema markup built in.' },
  { Icon: Blocks, title: 'Schema Generator', description: 'Point-and-click schema markup builder for FAQ, HowTo, and more.' },
  { Icon: Radar, title: 'Auto-Monitoring', description: 'Track AI citation changes and get alerts when visibility shifts.' },
  { Icon: Link2, title: 'Client Portal', description: 'Share branded, read-only dashboards with clients via secure links.' },
  { Icon: Smartphone, title: 'PWA & Offline', description: 'Install as a native app. Works offline with full functionality.' },
  { Icon: Mail, title: 'Email Digests', description: 'Weekly progress reports delivered straight to your inbox.' },
  { Icon: Globe2, title: 'Webflow Integration', description: 'Deep CMS integration for headless Webflow site optimization.' },
]

export default function FeaturesGrid() {
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

    gsap.fromTo(section.querySelectorAll('.lp-fgrid__card'),
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.6,
        scrollTrigger: { trigger: section.querySelector('.lp-fgrid__grid'), start: 'top 80%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="features-grid" className="lp-section lp-fgrid" aria-label="Additional features">
      <div className="lp-section__header">
        <span className="lp-section__label">And More</span>
        <h2 className="lp-section__title">A Complete AEO Toolkit</h2>
      </div>

      <div className="lp-fgrid__grid">
        {FEATURES.map((feature, i) => (
          <div key={i} className="lp-fgrid__card">
            <div className="lp-fgrid__icon">
              <feature.Icon size={22} />
            </div>
            <h3 className="lp-fgrid__card-title">{feature.title}</h3>
            <p className="lp-fgrid__card-desc">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
