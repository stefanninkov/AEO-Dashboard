import { useState, useEffect, useRef } from 'react'
import { useWaitlist } from '../hooks/useWaitlist'
import { CheckSquare, Zap, TestTubes, BarChart3, Check, ArrowRight, Share2, Copy, Loader } from 'lucide-react'
import './WaitlistPage.css'

/* ═══════════════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const FEATURES = [
  {
    icon: CheckSquare,
    title: '88-Point AEO Checklist',
    description: 'Phase-by-phase optimization covering schema markup, content structure, and AI crawler access.',
    color: '#FF6B35',
  },
  {
    icon: Zap,
    title: 'AI-Powered Site Analyzer',
    description: 'Instant AEO readiness scores with actionable recommendations for any URL.',
    color: '#3B82F6',
  },
  {
    icon: TestTubes,
    title: 'Multi-Engine Testing Lab',
    description: 'Test visibility across ChatGPT, Perplexity, Claude, and Gemini simultaneously.',
    color: '#8B5CF6',
  },
  {
    icon: BarChart3,
    title: 'Client Portal & Reports',
    description: 'Branded dashboards and automated email digests for client reporting.',
    color: '#10B981',
  },
]

const PRICING = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 23,
    description: 'For individuals starting with AEO',
    features: ['1 project', 'Phase 1-2 checklist', '5 analyzer scans/mo', 'Basic schema generator'],
    featured: false,
  },
  {
    name: 'Professional',
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: 'For agencies & SEO professionals',
    features: ['10 projects', 'All 7 checklist phases', 'Unlimited scans & tests', 'AI content writer', 'Client portal', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 149,
    yearlyPrice: 119,
    description: 'For teams & large agencies',
    features: ['Unlimited projects', 'White-label portal', 'API access', 'Auto-monitoring', 'Custom onboarding', 'Dedicated support'],
    featured: false,
  },
]

const TESTIMONIALS = [
  {
    text: 'We went from zero AI citations to appearing in 60% of relevant ChatGPT answers within 3 weeks. The checklist alone is worth 10x the price.',
    name: 'Sarah Chen',
    role: 'Head of SEO, DigitalFirst Agency',
    avatar: 'SC',
    color: '#FF6B35',
  },
  {
    text: 'Finally, a tool that treats AI search as a first-class channel. The multi-engine testing lab showed us exactly where we were missing citations.',
    name: 'Emily Park',
    role: 'SEO Director, GrowthLab',
    avatar: 'EP',
    color: '#8B5CF6',
  },
]

const BASE_PATH = import.meta.env.BASE_URL || '/AEO-Dashboard/'
const SITE_URL = `https://stefanninkov.github.io${BASE_PATH}`

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [navSolid, setNavSolid] = useState(false)
  const [yearly, setYearly] = useState(true)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef(null)
  const { count, submitting, submitted, error, alreadySignedUp, submitEmail } = useWaitlist()

  // Email validation
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValidEmail(email.trim())) {
      submitEmail(email.trim().toLowerCase())
    }
  }

  // Scroll → solid nav
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const handler = () => setNavSolid(root.scrollTop > 40)
    root.addEventListener('scroll', handler, { passive: true })
    return () => root.removeEventListener('scroll', handler)
  }, [])

  // Scroll animations
  useEffect(() => {
    const els = document.querySelectorAll('[data-wl-animate]')
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('wl-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Share handlers
  const shareText = 'I just joined the waitlist for AEO Dashboard — the first platform built for Answer Engine Optimization. Get early access:'
  const shareUrl = SITE_URL

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank', 'width=550,height=420',
    )
  }

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank', 'width=550,height=420',
    )
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="lp-root" ref={rootRef}>

      {/* ── NAV ── */}
      <nav className={`wl-nav ${navSolid ? 'wl-nav-solid' : ''}`}>
        <div className="wl-nav-inner">
          <span className="wl-nav-logo">
            AEO<span className="wl-nav-logo-accent">.</span>Dashboard
          </span>
          <a
            href={`${BASE_PATH}?/features`}
            className="wl-nav-link"
          >
            See All Features <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="wl-hero">
        <div className="wl-hero-inner">
          <div className="wl-badge">
            <Zap size={14} />
            Coming Soon — Join the Waitlist
          </div>

          <h1>
            Get Found by <span>AI Search Engines</span>
          </h1>

          <p className="wl-hero-sub">
            The first platform built for Answer Engine Optimization.
            Get cited by ChatGPT, Perplexity, Gemini, and every AI that matters.
          </p>

          <form className="wl-email-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="wl-email-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
            <button
              type="submit"
              className="wl-submit-btn"
              disabled={submitting || !email.trim()}
            >
              {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Join Waitlist'}
            </button>
          </form>

          {error && <p className="wl-error">{error}</p>}

          {count > 0 && (
            <p className="wl-counter">
              <strong>{count.toLocaleString()}</strong> {count === 1 ? 'person has' : 'people have'} already joined
            </p>
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="wl-section" data-wl-animate>
        <div className="wl-section-inner" style={{ textAlign: 'center' }}>
          <span className="wl-section-label">What You Get</span>
          <h2 className="wl-section-title" style={{ textAlign: 'center' }}>
            Everything You Need for AI Visibility
          </h2>
          <p className="wl-section-subtitle wl-centered">
            A complete toolkit to optimize, test, and monitor your content across every major AI platform.
          </p>

          <div className="wl-features-grid">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="wl-feature-card">
                  <div
                    className="wl-feature-icon"
                    style={{ background: `${f.color}15` }}
                  >
                    <Icon size={22} style={{ color: f.color }} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="wl-section" data-wl-animate>
        <div className="wl-section-inner" style={{ textAlign: 'center' }}>
          <span className="wl-section-label">Pricing</span>
          <h2 className="wl-section-title" style={{ textAlign: 'center' }}>
            Simple, Transparent Pricing
          </h2>
          <p className="wl-section-subtitle wl-centered">
            All plans include a 14-day free trial with full access to every feature.
          </p>

          {/* Toggle */}
          <div className="wl-pricing-toggle">
            <span className={!yearly ? 'wl-active' : ''}>Monthly</span>
            <button
              className={`wl-toggle-track ${yearly ? 'wl-active' : ''}`}
              onClick={() => setYearly(!yearly)}
              aria-label="Toggle annual pricing"
            >
              <div className="wl-toggle-thumb" />
            </button>
            <span className={yearly ? 'wl-active' : ''}>Annual</span>
            {yearly && <span className="wl-save-badge">Save 20%</span>}
          </div>

          {/* Cards */}
          <div className="wl-pricing-grid">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`wl-pricing-card ${plan.featured ? 'wl-featured' : ''}`}
              >
                <div className="wl-pricing-name">{plan.name}</div>
                <div className="wl-pricing-desc">{plan.description}</div>
                <div className="wl-pricing-price">
                  ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </div>
                <div className="wl-pricing-period">
                  /mo{yearly ? ', billed yearly' : ''}
                </div>
                <div className="wl-pricing-trial">
                  <Check size={12} />
                  14-day free trial
                </div>
                <ul className="wl-pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="wl-section" data-wl-animate>
        <div className="wl-section-inner" style={{ textAlign: 'center' }}>
          <span className="wl-section-label">What People Say</span>
          <h2 className="wl-section-title" style={{ textAlign: 'center' }}>
            Trusted by SEO Professionals
          </h2>

          <div className="wl-testimonials-grid" style={{ marginTop: '2.5rem' }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="wl-testimonial-card">
                <div className="wl-testimonial-stars">★★★★★</div>
                <p className="wl-testimonial-text">"{t.text}"</p>
                <div className="wl-testimonial-author">
                  <div
                    className="wl-testimonial-avatar"
                    style={{ background: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="wl-testimonial-name">{t.name}</div>
                    <div className="wl-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="wl-final-cta" data-wl-animate>
        <h2>Ready to Dominate AI Search?</h2>
        <p>Join the waitlist and be first to know when we launch.</p>

        <form
          className="wl-email-form"
          style={{ animationDelay: '0s' }}
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            className="wl-email-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            required
          />
          <button
            type="submit"
            className="wl-submit-btn"
            disabled={submitting || !email.trim()}
          >
            {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Join Waitlist'}
          </button>
        </form>
      </section>

      {/* ── FOOTER ── */}
      <footer className="wl-footer">
        <div className="wl-footer-inner">
          <span className="wl-footer-logo">
            AEO.Dashboard
          </span>
          <span className="wl-footer-copy">
            &copy; {new Date().getFullYear()} AEO Dashboard. All rights reserved.
          </span>
        </div>
      </footer>

      {/* ── SUCCESS OVERLAY ── */}
      {submitted && (
        <div className="wl-success-overlay" onClick={(e) => e.target === e.currentTarget && submitEmail._dismiss?.()}>
          <div className="wl-success-card">
            <div className="wl-success-icon">
              <Check size={32} style={{ color: '#10B981' }} />
            </div>
            <h2>{alreadySignedUp ? "You're already on the list!" : "You're in!"}</h2>
            <p>
              {alreadySignedUp
                ? "We already have your email. We'll notify you when we launch."
                : "We'll notify you when AEO Dashboard launches."}
            </p>
            {count > 0 && (
              <p className="wl-success-position">
                #{count.toLocaleString()} on the waitlist
              </p>
            )}

            <div className="wl-share-row">
              <button className="wl-share-btn" onClick={shareTwitter}>
                <Share2 size={14} />
                Share on X
              </button>
              <button className="wl-share-btn" onClick={shareLinkedIn}>
                <Share2 size={14} />
                LinkedIn
              </button>
              <button className="wl-share-btn" onClick={copyLink}>
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <button
              className="wl-success-dismiss"
              onClick={() => window.location.reload()}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'AEO Dashboard — Waitlist',
            description: 'Join the waitlist for AEO Dashboard, the first platform built for Answer Engine Optimization. Get cited by ChatGPT, Perplexity, Gemini, and every AI that matters.',
            url: SITE_URL,
            potentialAction: {
              '@type': 'JoinAction',
              target: SITE_URL,
              name: 'Join Waitlist',
            },
          }),
        }}
      />
    </div>
  )
}
