import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react'

const ROWS = [
  { feature: 'AEO Checklist', aeoDashboard: '99 points', manualTools: 'DIY research', traditionalPlatforms: 'Not available' },
  { feature: 'Site Analyzer', aeoDashboard: 'Real-time', manualTools: 'Manual audit', traditionalPlatforms: 'SEO only' },
  { feature: 'AI Testing', aeoDashboard: 'Multi-engine', manualTools: 'Manual queries', traditionalPlatforms: 'Not available' },
  { feature: 'Schema Generator', aeoDashboard: 'All types', manualTools: 'Hand-coded', traditionalPlatforms: 'Basic' },
  { feature: 'Client Portal', aeoDashboard: 'Branded', manualTools: 'Not available', traditionalPlatforms: 'Generic' },
  { feature: 'Monitoring', aeoDashboard: 'Auto alerts', manualTools: 'Manual', traditionalPlatforms: 'SEO metrics only' },
]

function CellIcon({ value }) {
  if (value === 'Not available') return <XCircle size={16} className="lp-comp__icon--bad" />
  if (value === 'Manual' || value === 'Manual audit' || value === 'Manual queries' || value === 'Hand-coded' || value === 'DIY research')
    return <MinusCircle size={16} className="lp-comp__icon--meh" />
  return <CheckCircle2 size={16} className="lp-comp__icon--good" />
}

export default function ComparisonTable() {
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

    gsap.fromTo(section.querySelectorAll('.lp-comp__row'),
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0, stagger: 0.08, duration: 0.5,
        scrollTrigger: { trigger: section.querySelector('.lp-comp__table'), start: 'top 80%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-section lp-comp" aria-label="Comparison">
      <div className="lp-section__header">
        <span className="lp-section__label">Comparison</span>
        <h2 className="lp-section__title">Why AEO Dashboard?</h2>
      </div>

      <div className="lp-comp__table">
        <div className="lp-comp__header">
          <span>Feature</span>
          <span className="lp-comp__header-highlight">AEO Dashboard</span>
          <span>Manual Tools</span>
          <span>Traditional SEO</span>
        </div>
        {ROWS.map((row, i) => (
          <div key={i} className="lp-comp__row">
            <span className="lp-comp__feature">{row.feature}</span>
            <span className="lp-comp__cell lp-comp__cell--highlight">
              <CellIcon value={row.aeoDashboard} />
              {row.aeoDashboard}
            </span>
            <span className="lp-comp__cell">
              <CellIcon value={row.manualTools} />
              {row.manualTools}
            </span>
            <span className="lp-comp__cell">
              <CellIcon value={row.traditionalPlatforms} />
              {row.traditionalPlatforms}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
