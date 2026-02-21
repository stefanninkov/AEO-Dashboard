import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useWaitlist } from '../hooks/useWaitlist'
import { Check, Share2, Copy, Loader, Sparkles, Blocks, BarChart4, FileEdit, Cog, Trophy, FlaskConical, TrendingUp, CheckCircle2, SearchCheck, NotebookPen, Radar } from 'lucide-react'
import './WaitlistPage.css'

/* ═══════════════════════════════════════════════════════════════
   NON-TRANSLATABLE DATA CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const NAV_HREFS = [
  { href: '#what-is-aeo' },
  { href: '#phases' },
  { href: '#features' },
  { href: '#faq' },
]

const PHASE_META = [
  { number: 1, color: '#FF6B35', Icon: Blocks },
  { number: 2, color: '#7B2FBE', Icon: BarChart4 },
  { number: 3, color: '#0EA5E9', Icon: FileEdit },
  { number: 4, color: '#10B981', Icon: Cog },
  { number: 5, color: '#F59E0B', Icon: Trophy },
  { number: 6, color: '#EC4899', Icon: FlaskConical },
  { number: 7, color: '#EF4444', Icon: TrendingUp },
]

const FEATURE_ICONS = [CheckCircle2, SearchCheck, FlaskConical, NotebookPen, Blocks, Radar]

const FOOTER_HREFS = [
  [
    { href: '#what-is-aeo' },
    { href: '#phases' },
    { href: '#features' },
    { href: '#faq' },
  ],
  [
    { href: '#' },
    { href: '#' },
    { href: '#' },
    { href: '#' },
  ],
]

const BASE_PATH = import.meta.env.BASE_URL || '/AEO-Dashboard/'
const SITE_URL = `https://stefanninkov.github.io${BASE_PATH}`

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function WaitlistPage() {
  const { t } = useTranslation('waitlist')
  const [email, setEmail] = useState('')
  const [navSolid, setNavSolid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const rootRef = useRef(null)
  const { count, submitting, submitted, error, alreadySignedUp, submitEmail } = useWaitlist()

  // ── Translated data arrays (rebuilt when language changes) ──

  const NAV_LINKS = useMemo(() =>
    NAV_HREFS.map((item, i) => ({
      label: t(`nav.links.${i}`),
      href: item.href,
    })),
  [t])

  const AEO_VS_SEO = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      aspect: t(`aeoVsSeo.rows.${i}.aspect`),
      seo: t(`aeoVsSeo.rows.${i}.seo`),
      aeo: t(`aeoVsSeo.rows.${i}.aeo`),
    })),
  [t])

  const PILLARS = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => t(`pillars.${i}`)),
  [t])

  const PHASES = useMemo(() =>
    PHASE_META.map((meta, i) => ({
      ...meta,
      title: t(`phases.${i}.title`),
      timeline: t(`phases.${i}.timeline`),
      description: t(`phases.${i}.description`),
      visibility: t(`phases.${i}.visibility`),
    })),
  [t])

  const FEATURES_OVERVIEW = useMemo(() =>
    FEATURE_ICONS.map((Icon, i) => ({
      Icon,
      title: t(`features.${i}.title`),
      description: t(`features.${i}.description`),
    })),
  [t])

  const FAQ_ITEMS = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      question: t(`faq.${i}.question`),
      answer: t(`faq.${i}.answer`),
    })),
  [t])

  const FOOTER_LINKS = useMemo(() =>
    FOOTER_HREFS.map((col, ci) => ({
      title: t(`footer.columns.${ci}.title`),
      links: col.map((link, li) => ({
        label: t(`footer.columns.${ci}.links.${li}`),
        href: link.href,
      })),
    })),
  [t])

  const EARLY_ACCESS_BENEFITS = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => t(`earlyAccess.benefits.${i}`)),
  [t])

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
  }), [FAQ_ITEMS])

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
  const shareText = t('success.shareText')
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
                key={link.href}
                href={link.href}
                className="wl-nav-link"
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <LanguageSwitcher variant="landing" />
            <button
              className="wl-nav-cta"
              onClick={(e) => scrollToSection(e, '#hero')}
            >
              {t('nav.cta')}
            </button>
          </div>

          <button
            className={`wl-nav-hamburger ${mobileMenuOpen ? 'wl-open' : ''}`}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
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
            key={link.href}
            href={link.href}
            className="wl-nav-link"
            onClick={(e) => scrollToSection(e, link.href)}
          >
            {link.label}
          </a>
        ))}
        <LanguageSwitcher variant="landing" />
        <button
          className="wl-nav-cta"
          onClick={(e) => scrollToSection(e, '#hero')}
        >
          {t('nav.cta')}
        </button>
      </div>

      <main>

        {/* ═══════════ 2. HERO ═══════════ */}
        <section id="hero" className="wl-hero">
          <div className="wl-hero-inner">
            <div className="wl-badge">
              <Sparkles size={14} />
              {t('hero.badge')}
            </div>

            <h1>
              {t('hero.headingPrefix')}<span>{t('hero.headingAccent')}</span>
            </h1>

            <p className="wl-hero-sub">
              {t('hero.subtitle')}
            </p>

            <form className="wl-email-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="wl-email-input"
                placeholder={t('hero.emailPlaceholder')}
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
                {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : t('hero.cta')}
              </button>
            </form>

            {error && <p className="wl-error">{error}</p>}

            {count > 0 && (
              <p className="wl-counter">
                {t('hero.joinedCount', { count })}
              </p>
            )}
          </div>
        </section>

        {/* ═══════════ 3. WHAT IS AEO? ═══════════ */}
        <section id="what-is-aeo" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{t('education.label')}</span>
              <h2 className="wl-section-title">{t('education.title')}</h2>
            </div>
            <div className="wl-aeo-content">
              <p className="wl-answer-paragraph">
                <strong>{t('education.descriptionBold')}</strong>{t('education.descriptionRest')}
              </p>

              <h3>{t('education.comparisonTitle')}</h3>
              <table className="wl-comparison-table">
                <thead>
                  <tr>
                    <th scope="col">{t('aeoVsSeo.columns.aspect')}</th>
                    <th scope="col">{t('aeoVsSeo.columns.seo')}</th>
                    <th scope="col">{t('aeoVsSeo.columns.aeo')}</th>
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

              <h3>{t('education.pillarsTitle')}</h3>
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
              <span className="wl-section-label">{t('phases.sectionLabel')}</span>
              <h2 className="wl-section-title">{t('phases.sectionTitle')}</h2>
              <p className="wl-section-subtitle wl-centered">{t('phases.sectionSubtitle')}</p>
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
                    <span className="wl-phase-visibility-icon"><phase.Icon size={18} /></span>
                    <span>{phase.visibility}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="wl-phases-footer" data-animate>
              {t('phases.footerPrefix')}<strong>{t('phases.footerBold')}</strong>{t('phases.footerSuffix')}
            </p>
          </div>
        </section>

        {/* ═══════════ 5. FEATURES OVERVIEW ═══════════ */}
        <section id="features" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{t('features.sectionLabel')}</span>
              <h2 className="wl-section-title">{t('features.sectionTitle')}</h2>
              <p className="wl-section-subtitle wl-centered">{t('features.sectionSubtitle')}</p>
            </div>
            <div className="wl-features-grid">
              {FEATURES_OVERVIEW.map((f, i) => (
                <div key={i} className="wl-feature-card" data-animate>
                  <div className="wl-feature-icon"><f.Icon size={18} /></div>
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
              <span className="wl-section-label">{t('faq.sectionLabel')}</span>
              <h2 className="wl-section-title">{t('faq.sectionTitle')}</h2>
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
          <h2>{t('earlyAccess.title')}</h2>
          <p>
            {t('earlyAccess.description')}
          </p>

          <div className="wl-early-benefits">
            {EARLY_ACCESS_BENEFITS.map((benefit, i) => (
              <div key={i} className="wl-early-benefit">
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
              placeholder={t('earlyAccess.emailPlaceholder')}
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
              {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : t('earlyAccess.cta')}
            </button>
          </form>

          <p className="wl-early-note">{t('earlyAccess.note')}</p>
        </section>

      </main>

      {/* ═══════════ 8. FOOTER ═══════════ */}
      <footer className="wl-footer">
        <div className="wl-footer-inner">
          <div className="wl-footer-brand">
            <span className="wl-footer-brand-logo">
              <span className="wl-nav-logo-accent">AEO</span>&nbsp;Dashboard
            </span>
            <p>{t('footer.brandDescription')}</p>
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
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      {/* ═══════════ SUCCESS OVERLAY ═══════════ */}
      {submitted && (
        <div className="wl-success-overlay" onClick={(e) => e.target === e.currentTarget && window.location.reload()}>
          <div className="wl-success-card">
            <div className="wl-success-icon">
              <Check size={32} style={{ color: '#10B981' }} />
            </div>
            <h2>{alreadySignedUp ? t('success.titleExisting') : t('success.titleNew')}</h2>
            <p>
              {alreadySignedUp
                ? t('success.messageExisting')
                : t('success.messageNew')}
            </p>
            {count > 0 && (
              <p className="wl-success-position">
                {t('success.position', { count: count.toLocaleString() })}
              </p>
            )}

            <div className="wl-share-row">
              <button className="wl-share-btn" onClick={shareTwitter}>
                <Share2 size={14} />
                {t('success.shareOnX')}
              </button>
              <button className="wl-share-btn" onClick={shareLinkedIn}>
                <Share2 size={14} />
                {t('success.shareOnLinkedIn')}
              </button>
              <button className="wl-share-btn" onClick={copyLink}>
                <Copy size={14} />
                {copied ? t('success.copied') : t('success.copyLink')}
              </button>
            </div>

            <button
              className="wl-success-dismiss"
              onClick={() => window.location.reload()}
            >
              {t('success.close')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
