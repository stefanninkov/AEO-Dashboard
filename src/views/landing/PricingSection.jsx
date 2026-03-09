import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const PLANS = [
  {
    name: 'Starter',
    description: 'For individuals starting with AEO',
    monthlyPrice: 29,
    quarterlyPrice: 25,
    yearlyPrice: 23,
    featured: false,
    features: ['1 project', 'Phase 1-2 checklist', '5 analyzer scans/mo', 'Basic schema generator', 'Dashboard analytics', 'Email digest (weekly)'],
  },
  {
    name: 'Professional',
    description: 'For agencies & SEO professionals',
    monthlyPrice: 49,
    quarterlyPrice: 42,
    yearlyPrice: 39,
    featured: true,
    features: ['10 projects', 'All 7 checklist phases', 'Unlimited analyzer scans', 'AI content writer', 'Multi-engine testing lab', 'Schema generator (all types)', 'Client portal (shareable)', 'Auto-monitoring & alerts', 'CSV & PDF exports', 'Priority support'],
  },
  {
    name: 'Enterprise',
    description: 'For teams & large agencies',
    monthlyPrice: 149,
    quarterlyPrice: 127,
    yearlyPrice: 119,
    featured: false,
    features: ['Unlimited projects', 'Everything in Professional', 'White-label client portal', 'API access', 'Auto-monitoring & alerts', 'Team collaboration & roles', 'Custom onboarding', 'Dedicated account manager'],
  },
]

const PERIODS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'yearly', label: 'Yearly' },
]

export default function PricingSection() {
  const sectionRef = useRef(null)
  const [period, setPeriod] = useState('quarterly')

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

    gsap.fromTo(section.querySelectorAll('.lp-pricing__card'),
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.8,
        scrollTrigger: { trigger: section.querySelector('.lp-pricing__grid'), start: 'top 80%', once: true },
      }
    )
  }, { scope: sectionRef })

  function getPrice(plan) {
    if (period === 'monthly') return plan.monthlyPrice
    if (period === 'quarterly') return plan.quarterlyPrice
    return plan.yearlyPrice
  }

  function getSavings(plan) {
    const monthly = plan.monthlyPrice
    const current = getPrice(plan)
    if (current >= monthly) return null
    return Math.round((1 - current / monthly) * 100)
  }

  return (
    <section ref={sectionRef} id="pricing" className="lp-section lp-pricing" aria-label="Pricing">
      <div className="lp-section__header">
        <span className="lp-section__label">Pricing</span>
        <h2 className="lp-section__title">Simple, Transparent Pricing</h2>
        <p className="lp-section__subtitle">
          Start free for 14 days. No credit card required. Cancel anytime.
        </p>
      </div>

      <div className="lp-pricing__toggle">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            className={`lp-pricing__toggle-btn ${period === p.id ? 'lp-pricing__toggle-btn--active' : ''}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="lp-pricing__grid">
        {PLANS.map((plan, i) => (
          <div key={i} className={`lp-pricing__card ${plan.featured ? 'lp-pricing__card--featured' : ''}`}>
            {plan.featured && <div className="lp-pricing__popular">Most Popular</div>}
            <h3 className="lp-pricing__plan-name">{plan.name}</h3>
            <p className="lp-pricing__plan-desc">{plan.description}</p>
            <div className="lp-pricing__price">
              <span className="lp-pricing__price-currency">$</span>
              <span className="lp-pricing__price-amount">{getPrice(plan)}</span>
              <span className="lp-pricing__price-period">/mo</span>
            </div>
            {getSavings(plan) && (
              <span className="lp-pricing__savings">Save {getSavings(plan)}%</span>
            )}
            <a href="/AEO-Dashboard/app" className={`lp-btn ${plan.featured ? 'lp-btn--primary' : 'lp-btn--secondary'}`}>
              Start 14-Day Free Trial
            </a>
            <ul className="lp-pricing__features">
              {plan.features.map((f, fi) => (
                <li key={fi}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
