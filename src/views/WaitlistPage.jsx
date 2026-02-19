import { useState, useEffect, useRef, useMemo } from 'react'
import { useWaitlist } from '../hooks/useWaitlist'
import { Check, Share2, Copy, Loader, Zap } from 'lucide-react'
import './WaitlistPage.css'

/* ═══════════════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: 'What is AEO?', href: '#what-is-aeo' },
  { label: 'Phases', href: '#phases' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
]

const AEO_VS_SEO = [
  { aspect: 'Primary Goal', seo: 'Rank in search results', aeo: 'Be cited in AI answers' },
  { aspect: 'Key Metric', seo: 'Position & click-through rate', aeo: 'Citation frequency & accuracy' },
  { aspect: 'Content Format', seo: 'Keywords & backlinks', aeo: 'Structured data & direct answers' },
  { aspect: 'Target System', seo: 'Google, Bing crawlers', aeo: 'LLMs, RAG pipelines, AI agents' },
  { aspect: 'Optimization', seo: 'Meta tags & page speed', aeo: 'Schema markup & entity clarity' },
  { aspect: 'Time Horizon', seo: 'Weeks to months', aeo: 'Days to weeks (re-indexed by AI)' },
]

const PILLARS = [
  'Structured Data & Schema Markup',
  'Direct Answer Formatting',
  'Entity Authority & E-E-A-T',
  'Multi-Platform Optimization',
  'AI Crawler Accessibility',
  'Content Freshness & Accuracy',
  'Citation Signal Building',
]

const PHASES = [
  {
    number: 1, title: 'Foundation & Audit', timeline: 'Week 1-2', color: '#FF6B35', icon: '🏗️',
    description: 'Audit existing content and technical infrastructure. Map questions, analyze competitors, and establish your AEO baseline.',
    visibility: 'Know where you stand — baseline metrics and content gaps identified',
  },
  {
    number: 2, title: 'Structured Data & Schema', timeline: 'Week 2-4', color: '#7B2FBE', icon: '📊',
    description: 'Implement FAQ, HowTo, Article, Product, and Organization schema markup to make your content machine-readable.',
    visibility: 'AI engines can now read and understand your content structure',
  },
  {
    number: 3, title: 'Content Optimization', timeline: 'Week 3-8', color: '#0EA5E9', icon: '✏️',
    description: 'Restructure content with answer paragraphs, heading hierarchy, comparison tables, and topic clusters.',
    visibility: 'Your content becomes the best possible answer for AI queries',
  },
  {
    number: 4, title: 'Technical AEO', timeline: 'Week 4-6', color: '#10B981', icon: '⚙️',
    description: 'Configure AI bot access, semantic HTML, RSS feeds, internal linking, and meta optimization.',
    visibility: 'AI crawlers can access and extract your content efficiently',
  },
  {
    number: 5, title: 'Authority & Trust', timeline: 'Week 6-12+', color: '#F59E0B', icon: '🏆',
    description: 'Build E-E-A-T signals, authority backlinks, Google Business Profile, and citation networks.',
    visibility: 'AI engines trust your content as a credible, authoritative source',
  },
  {
    number: 6, title: 'Testing & Validation', timeline: 'Week 6-8', color: '#EC4899', icon: '🧪',
    description: 'Test across ChatGPT, Perplexity, Google AI, and Bing Copilot. Validate schema and crawlability.',
    visibility: 'Verify you appear across all major AI platforms',
  },
  {
    number: 7, title: 'Monitor & Iterate', timeline: 'Week 8+', color: '#EF4444', icon: '📈',
    description: 'Track AI citations, A/B test answer formats, benchmark competitors, and re-optimize monthly.',
    visibility: 'Continuous improvement — stay visible as AI engines evolve weekly',
  },
]

const FEATURES_OVERVIEW = [
  { icon: '✅', title: '99-Point AEO Checklist', description: 'Phase-by-phase tasks covering every aspect of AEO — from schema markup to content structure to AI crawler access.' },
  { icon: '🔍', title: 'AI-Powered Site Analyzer', description: 'Enter any URL and get an instant AEO readiness score with actionable recommendations.' },
  { icon: '🧪', title: 'Multi-Engine Testing Lab', description: 'Test how your content appears across ChatGPT, Perplexity, Claude, and Gemini simultaneously.' },
  { icon: '✍️', title: 'AI Content Writer', description: 'Generate AEO-optimized content with structured data and direct answer formatting built in.' },
  { icon: '🏗️', title: 'Schema Generator', description: 'Point-and-click markup builder for FAQ, HowTo, Article, and more — no coding required.' },
  { icon: '📡', title: 'Monitoring & Alerts', description: 'Track AI citation changes over time and get alerts when your visibility shifts.' },
]

const FAQ_ITEMS = [
  {
    question: 'What is Answer Engine Optimization (AEO)?',
    answer: 'Answer Engine Optimization is the practice of optimizing website content to be cited by AI-powered answer engines like ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. Unlike traditional SEO which targets search rankings, AEO focuses on structured data, direct answer formatting, and entity authority to ensure AI systems reference your content.',
  },
  {
    question: 'How is AEO different from traditional SEO?',
    answer: 'While SEO optimizes for search engine rankings and click-through rates, AEO optimizes for AI citation and inclusion in generated answers. AEO emphasizes schema markup, concise answer formatting, entity clarity, and E-E-A-T signals that help large language models identify and cite authoritative sources.',
  },
  {
    question: 'Who is AEO Dashboard built for?',
    answer: 'AEO Dashboard is built for agencies, SEO professionals, and digital marketers who want to future-proof their clients\' online visibility. Whether you manage one website or hundreds, the platform scales with you.',
  },
  {
    question: 'When will AEO Dashboard launch?',
    answer: 'We\'re currently in the final stages of development. Join the waitlist to be notified the moment we launch. We\'ll also be selecting a small group of early access users to try the platform before the public release.',
  },
]

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'What is AEO?', href: '#what-is-aeo' },
      { label: 'Phases', href: '#phases' },
      { label: 'Features', href: '#features' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
]

const EARLY_ACCESS_BENEFITS = [
  'Full platform access before launch',
  'Direct line to the founding team',
  'Help shape the product with feedback',
  'Free access during the early period',
]

const BASE_PATH = import.meta.env.BASE_URL || '/AEO-Dashboard/'
const SITE_URL = `https://stefanninkov.github.io${BASE_PATH}`

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [navSolid, setNavSolid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
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

  // JSON-LD schema
  const schemaData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'AEO Dashboard',
        url: SITE_URL,
        description: 'The complete toolkit for Answer Engine Optimization. Optimize your website to be cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot.',
        logo: `${SITE_URL}logo.png`,
      },
      {
        '@type': 'WebPage',
        name: 'AEO Dashboard - Optimize Your Website for AI Search Engines',
        url: SITE_URL,
        description: 'Join the waitlist for AEO Dashboard, the first platform built for Answer Engine Optimization. Get cited by ChatGPT, Perplexity, Gemini, and every AI that matters.',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['#hero', '#what-is-aeo', '#phases', '#faq'],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'AEO Dashboard',
        url: SITE_URL,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'Answer Engine Optimization platform for agencies and SEO professionals.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        ],
      },
    ],
  }), [])

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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      const elements = rootRef.current?.querySelectorAll('[data-animate]')
      if (elements) elements.forEach((el) => el.classList.add('wl-visible'))
      return
    }

    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('wl-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { root, threshold: 0.1 },
    )

    const elements = root.querySelectorAll('[data-animate]')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // JSON-LD injection
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schemaData)
    document.head.appendChild(script)
    return () => { if (script.parentNode) script.parentNode.removeChild(script) }
  }, [schemaData])

  // Smooth scroll handler
  function scrollToSection(e, href) {
    e.preventDefault()
    if (mobileMenuOpen) setMobileMenuOpen(false)
    const el = rootRef.current?.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

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
    <div className="wl-root" ref={rootRef}>

      {/* ═══════════ 1. NAV ═══════════ */}
      <header className={`wl-nav ${navSolid ? 'wl-nav-solid' : ''}`}>
        <nav className="wl-nav-inner" aria-label="Main navigation">
          <span className="wl-nav-logo" style={{ cursor: 'default' }}>
            <span className="wl-nav-logo-accent">AEO</span>&nbsp;Dashboard
          </span>

          <div className="wl-nav-links">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="wl-nav-link"
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <button
              className="wl-nav-cta"
              onClick={(e) => scrollToSection(e, '#hero')}
            >
              Join Waitlist
            </button>
          </div>

          <button
            className={`wl-nav-hamburger ${mobileMenuOpen ? 'wl-open' : ''}`}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div className={`wl-nav-mobile-overlay ${mobileMenuOpen ? 'wl-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="wl-nav-link"
            onClick={(e) => scrollToSection(e, link.href)}
          >
            {link.label}
          </a>
        ))}
        <button
          className="wl-nav-cta"
          onClick={(e) => scrollToSection(e, '#hero')}
        >
          Join Waitlist
        </button>
      </div>

      <main>

        {/* ═══════════ 2. HERO ═══════════ */}
        <section id="hero" className="wl-hero">
          <div className="wl-hero-inner">
            <div className="wl-badge">
              <Zap size={14} />
              Coming Soon — Early Access for Select Users
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

        {/* ═══════════ 3. WHAT IS AEO? ═══════════ */}
        <section id="what-is-aeo" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">Education</span>
              <h2 className="wl-section-title">What is Answer Engine Optimization?</h2>
            </div>
            <div className="wl-aeo-content">
              <p className="wl-answer-paragraph">
                <strong>Answer Engine Optimization (AEO) is the practice of optimizing website content to be selected, cited, and surfaced by AI-powered answer engines.</strong> Unlike traditional SEO that targets search engine result pages, AEO focuses on making your content the preferred source that large language models like ChatGPT, Perplexity, and Google Gemini reference when generating answers.
              </p>

              <h3>AEO vs Traditional SEO</h3>
              <table className="wl-comparison-table">
                <thead>
                  <tr>
                    <th scope="col">Aspect</th>
                    <th scope="col">Traditional SEO</th>
                    <th scope="col">AEO</th>
                  </tr>
                </thead>
                <tbody>
                  {AEO_VS_SEO.map((row, i) => (
                    <tr key={i}>
                      <td>{row.aspect}</td>
                      <td>{row.seo}</td>
                      <td>{row.aeo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>The 7 Pillars of AEO</h3>
              <ol className="wl-pillars-list">
                {PILLARS.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ═══════════ 4. THE 7 PHASES ═══════════ */}
        <section id="phases" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">The Journey</span>
              <h2 className="wl-section-title">Your Path to AI Visibility</h2>
              <p className="wl-section-subtitle wl-centered">7 phases that take you from invisible to cited. Each phase builds on the last &mdash; here&rsquo;s what to expect.</p>
            </div>
            <div className="wl-phases">
              {PHASES.map((phase) => (
                <div key={phase.number} className="wl-phase-card" data-animate>
                  <div
                    className="wl-phase-number"
                    style={{ background: phase.color }}
                  >
                    {phase.number}
                  </div>
                  <div className="wl-phase-header">
                    <span className="wl-phase-title">{phase.title}</span>
                    <span className="wl-phase-timeline-badge">{phase.timeline}</span>
                  </div>
                  <p className="wl-phase-description">{phase.description}</p>
                  <div
                    className="wl-phase-visibility"
                    style={{ borderLeftColor: phase.color }}
                  >
                    <span className="wl-phase-visibility-icon">{phase.icon}</span>
                    <span>{phase.visibility}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="wl-phases-footer" data-animate>
              The <strong>99-point checklist</strong> guides you through every task in every phase.
            </p>
          </div>
        </section>

        {/* ═══════════ 5. FEATURES OVERVIEW ═══════════ */}
        <section id="features" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">What You Get</span>
              <h2 className="wl-section-title">Built for AEO from the Ground Up</h2>
              <p className="wl-section-subtitle wl-centered">Everything you need to optimize, test, and monitor your AI search visibility — in one platform.</p>
            </div>
            <div className="wl-features-grid">
              {FEATURES_OVERVIEW.map((f, i) => (
                <div key={i} className="wl-feature-card" data-animate>
                  <div className="wl-feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ 6. FAQ ═══════════ */}
        <section id="faq" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">FAQ</span>
              <h2 className="wl-section-title">Frequently Asked Questions</h2>
            </div>
            <div className="wl-faq-list">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="wl-faq-item">
                  <button
                    className="wl-faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{item.question}</span>
                    <span className={`wl-faq-chevron ${openFaq === i ? 'wl-faq-open' : ''}`}>
                      &#9662;
                    </span>
                  </button>
                  <div className={`wl-faq-answer ${openFaq === i ? 'wl-faq-open' : ''}`}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ 7. EARLY ACCESS + FINAL CTA ═══════════ */}
        <section className="wl-early-access" data-animate>
          <h2>Want Early Access?</h2>
          <p>
            Before we launch, we&rsquo;re giving a select group of early supporters access to the full platform.
            Join the waitlist for a chance to be one of the first to try AEO Dashboard &mdash; and help shape the product with your feedback.
          </p>

          <div className="wl-early-benefits">
            {EARLY_ACCESS_BENEFITS.map((benefit) => (
              <div key={benefit} className="wl-early-benefit">
                <div className="wl-early-benefit-icon">
                  <Check size={12} style={{ color: '#FF6B35' }} />
                </div>
                {benefit}
              </div>
            ))}
          </div>

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

          <p className="wl-early-note">We&rsquo;ll select ~10 early access users from the waitlist and reach out personally.</p>
        </section>

      </main>

      {/* ═══════════ 8. FOOTER ═══════════ */}
      <footer className="wl-footer">
        <div className="wl-footer-inner">
          <div className="wl-footer-brand">
            <span className="wl-footer-brand-logo">
              <span className="wl-nav-logo-accent">AEO</span>&nbsp;Dashboard
            </span>
            <p>The complete toolkit for Answer Engine Optimization.</p>
          </div>
          {FOOTER_LINKS.map((col, i) => (
            <div key={i} className="wl-footer-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a
                      href={link.href}
                      onClick={link.href.startsWith('#') ? (e) => scrollToSection(e, link.href) : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="wl-footer-bottom">
          <p>&copy; {new Date().getFullYear()} AEO Dashboard. All rights reserved.</p>
        </div>
      </footer>

      {/* ═══════════ SUCCESS OVERLAY ═══════════ */}
      {submitted && (
        <div className="wl-success-overlay" onClick={(e) => e.target === e.currentTarget && window.location.reload()}>
          <div className="wl-success-card">
            <div className="wl-success-icon">
              <Check size={32} style={{ color: '#10B981' }} />
            </div>
            <h2>{alreadySignedUp ? "You're already on the list!" : "You're on the list!"}</h2>
            <p>
              {alreadySignedUp
                ? "We already have your email. We'll notify you when we launch."
                : "We'll notify you as soon as AEO Dashboard launches. Stay tuned!"}
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

    </div>
  )
}
