import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useWaitlist } from '../hooks/useWaitlist'
import { useTheme } from '../contexts/ThemeContext'
import { Check, Share2, Copy, Sparkles, Blocks, BarChart4, FileEdit, Cog, Trophy, FlaskConical, TrendingUp, CheckCircle2, SearchCheck, NotebookPen, Radar, Sun, Moon } from 'lucide-react'
import WaitlistScorecard from '../components/WaitlistScorecard'
import { MAX_TOTAL_SCORE } from '../utils/scorecardScoring'
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
  { number: 1, color: 'var(--accent)', Icon: Blocks },
  { number: 2, color: 'var(--color-phase-2)', Icon: BarChart4 },
  { number: 3, color: 'var(--color-phase-3)', Icon: FileEdit },
  { number: 4, color: 'var(--color-phase-4)', Icon: Cog },
  { number: 5, color: 'var(--color-phase-5)', Icon: Trophy },
  { number: 6, color: 'var(--color-phase-6)', Icon: FlaskConical },
  { number: 7, color: 'var(--color-phase-7)', Icon: TrendingUp },
]

const FEATURE_ICONS = [CheckCircle2, SearchCheck, FlaskConical, NotebookPen, Blocks, Radar]

const FOOTER_HREFS = [
  [
    { href: '#what-is-aeo' },
    { href: '#phases' },
    { href: '#features' },
    { href: '#faq' },
  ],
]

const BASE_PATH = import.meta.env.BASE_URL || '/AEO-Dashboard/'
const SITE_URL = `https://stefanninkov.github.io${BASE_PATH}`

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function WaitlistPage() {
  const { t } = useTranslation('waitlist')
  const [navSolid, setNavSolid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const rootRef = useRef(null)
  const { resolvedTheme, toggleTheme } = useTheme()
  const { count, submitted, alreadySignedUp } = useWaitlist()
  const [showScorecard, setShowScorecard] = useState(false)
  const [completedResults, setCompletedResults] = useState(null)

  // ── Counter-up animation ──
  const targetCount = count
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    const duration = 1500 // ms
    const start = performance.now()
    const from = 0
    const to = targetCount
    let raf

    const step = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayCount(Math.round(from + (to - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [targetCount])

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

  const PHASES = useMemo(() =>
    PHASE_META.map((meta, i) => ({
      ...meta,
      title: t(`phases.${i}.title`),
      timeline: t(`phases.${i}.timeline`),
      description: t(`phases.${i}.description`),
      visibility: t(`phases.${i}.visibility`),
    })),
  [t])

  const PILLARS = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => t(`pillars.${i}`)),
  [t])

  const FEATURES_OVERVIEW = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      Icon: FEATURE_ICONS[i],
      title: t(`features.${i}.title`),
      description: t(`features.${i}.description`),
    })),
  [t])

  const FAQ_ITEMS = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
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

  const WHY_NOW_STATS = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      value: t(`whyNow.stats.${i}.value`),
      label: t(`whyNow.stats.${i}.label`),
      description: t(`whyNow.stats.${i}.description`),
    })),
  [t])

  const HOW_IT_WORKS_STEPS = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      number: i + 1,
      title: t(`howItWorks.steps.${i}.title`),
      description: t(`howItWorks.steps.${i}.description`),
    })),
  [t])

  const AUDIENCE_CARDS = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      title: t(`audience.cards.${i}.title`),
      description: t(`audience.cards.${i}.description`),
    })),
  [t])

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
          cssSelector: ['#hero', '#what-is-aeo', '#faq'],
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

  // Make all sections visible immediately — no scroll animations for leads
  useEffect(() => {
    const elements = rootRef.current?.querySelectorAll('[data-animate]')
    if (elements) elements.forEach((el) => el.classList.add('wl-visible'))
  }, [])

  // JSON-LD injection
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schemaData)
    document.head.appendChild(script)
    return () => { if (script.parentNode) script.parentNode.removeChild(script) }
  }, [schemaData])

  // Meta & Open Graph tags
  useEffect(() => {
    const title = 'AEO Dashboard — Get Quoted by AI Search Engines'
    const desc = 'AI answers questions every day. Is it quoting your website? Check your free AEO score and find out.'
    const image = `${SITE_URL}icon-512.svg`
    document.title = title
    const tags = [
      ['meta', { name: 'description', content: desc }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: desc }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { property: 'og:url', content: SITE_URL }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: desc }],
      ['meta', { name: 'twitter:image', content: image }],
    ]
    const els = tags.map(([tag, attrs]) => {
      const el = document.createElement(tag)
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
      document.head.appendChild(el)
      return el
    })
    return () => els.forEach(el => { if (el.parentNode) el.parentNode.removeChild(el) })
  }, [])

  // Smooth scroll handler
  function scrollToSection(e, href) {
    e.preventDefault()
    if (mobileMenuOpen) setMobileMenuOpen(false)
    const el = rootRef.current?.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Share handlers
  const shareText = completedResults
    ? `I scored ${completedResults.totalScore}/${MAX_TOTAL_SCORE} on the AEO Readiness Assessment! How AI-ready is YOUR website?`
    : t('success.shareText')
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
              className="wl-theme-toggle"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="wl-nav-cta"
              onClick={() => setShowScorecard(true)}
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
          className="wl-theme-toggle"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          className="wl-nav-cta"
          onClick={() => { setMobileMenuOpen(false); setShowScorecard(true); }}
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

            {completedResults ? (
              <div className="wl-sc-success-inline">
                <p className="wl-sc-success-title">
                  {t('scorecard.successState.title', {
                    score: completedResults.totalScore,
                    max: MAX_TOTAL_SCORE,
                    tier: t(`scorecard.tiers.${completedResults.tier}.label`),
                  })}
                </p>
                <p className="wl-sc-success-subtitle">{t('scorecard.successState.sharePrompt')}</p>
                <div className="wl-sc-share-row" style={{ marginTop: '0.75rem' }}>
                  <button className="wl-share-btn" onClick={shareTwitter}>
                    <Share2 size={14} />
                    {t('scorecard.results.shareX')}
                  </button>
                  <button className="wl-share-btn" onClick={shareLinkedIn}>
                    <Share2 size={14} />
                    {t('scorecard.results.shareLI')}
                  </button>
                  <button className="wl-share-btn" onClick={copyLink}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? t('scorecard.results.copied') : t('scorecard.results.copyLink')}
                  </button>
                </div>
                <p className="wl-sc-success-timeline" style={{ fontSize: '0.8125rem', color: 'var(--wl-text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
                  {t('scorecard.successState.timeline')}
                </p>
              </div>
            ) : (
              <>
                <button
                  className="wl-submit-btn wl-sc-hero-btn"
                  onClick={() => setShowScorecard(true)}
                >
                  {t('scorecard.heroButton')}
                </button>
                <p className="wl-hero-note">{t('scorecard.heroNote')}</p>
              </>
            )}

            <p className="wl-counter">
              <strong>{displayCount.toLocaleString()}</strong>{' '}
              {completedResults
                ? t('scorecard.counterSuffix')
                : t('hero.joinedSuffix')}
            </p>
          </div>
        </section>

        {/* ═══════════ WHY AEO MATTERS NOW ═══════════ */}
        <section id="why-now" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{t('whyNow.label')}</span>
              <h2 className="wl-section-title">{t('whyNow.title')}</h2>
              <p className="wl-section-subtitle wl-centered">{t('whyNow.subtitle')}</p>
            </div>
            <div className="wl-why-now-grid">
              {WHY_NOW_STATS.map((stat, i) => (
                <div key={i} className="wl-why-now-card" data-animate>
                  <div className="wl-why-now-value">{stat.value}</div>
                  <div className="wl-why-now-label">{stat.label}</div>
                  <p className="wl-why-now-desc">{stat.description}</p>
                </div>
              ))}
            </div>
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
                {PILLARS.map((p, i) => <li key={i}>{p}</li>)}
              </ol>

            </div>
          </div>
        </section>

        {/* ═══════════ SOCIAL PROOF ═══════════ */}
        <section className="wl-section wl-social-proof" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <p className="wl-counter" style={{ fontSize: '1.25rem' }}>
                {t('socialProof.title', { count: displayCount.toLocaleString() })}
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section id="how-it-works" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{t('howItWorks.label')}</span>
              <h2 className="wl-section-title">{t('howItWorks.title')}</h2>
              <p className="wl-section-subtitle wl-centered">{t('howItWorks.subtitle')}</p>
            </div>
            <div className="wl-how-steps">
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <div key={i} className="wl-how-step" data-animate>
                  <div className="wl-how-step-number">{step.number}</div>
                  <h3 className="wl-how-step-title">{step.title}</h3>
                  <p className="wl-how-step-desc">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ PHASES ═══════════ */}
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

        {/* ═══════════ WHO IT'S FOR ═══════════ */}
        <section id="who-its-for" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{t('audience.label')}</span>
              <h2 className="wl-section-title">{t('audience.title')}</h2>
              <p className="wl-section-subtitle wl-centered">{t('audience.subtitle')}</p>
            </div>
            <div className="wl-audience-grid">
              {AUDIENCE_CARDS.map((card, i) => (
                <div key={i} className="wl-audience-card" data-animate>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ AI COST ═══════════ */}
        <section id="ai-cost" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{t('aiCost.label')}</span>
              <h2 className="wl-section-title">{t('aiCost.title')}</h2>
              <p className="wl-section-subtitle wl-centered">{t('aiCost.subtitle')}</p>
            </div>

            <div className="wl-cost-highlight">
              <div className="wl-cost-price">{t('aiCost.price')}</div>
              <p className="wl-cost-price-label">{t('aiCost.priceLabel')}</p>
              <p className="wl-cost-description">{t('aiCost.description')}</p>
            </div>

            <div className="wl-cost-grid">
              <div className="wl-cost-card">
                <div className="wl-cost-card-value">{t('aiCost.cards.0.value')}</div>
                <div className="wl-cost-card-label">{t('aiCost.cards.0.label')}</div>
                <p className="wl-cost-card-desc">{t('aiCost.cards.0.description')}</p>
              </div>
              <div className="wl-cost-card">
                <div className="wl-cost-card-value">{t('aiCost.cards.1.value')}</div>
                <div className="wl-cost-card-label">{t('aiCost.cards.1.label')}</div>
                <p className="wl-cost-card-desc">{t('aiCost.cards.1.description')}</p>
              </div>
              <div className="wl-cost-card">
                <div className="wl-cost-card-value">{t('aiCost.cards.2.value')}</div>
                <div className="wl-cost-card-label">{t('aiCost.cards.2.label')}</div>
                <p className="wl-cost-card-desc">{t('aiCost.cards.2.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 7. FAQ ═══════════ */}
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

        {/* ═══════════ EARLY ACCESS ═══════════ */}
        <section className="wl-early-access" data-animate>
          <h2>{t('earlyAccess.title')}</h2>
          <p>
            {t('earlyAccess.description')}
          </p>

          <div className="wl-early-benefits">
            {EARLY_ACCESS_BENEFITS.map((benefit, i) => (
              <div key={i} className="wl-early-benefit">
                <div className="wl-early-benefit-icon">
                  <Check size={12} style={{ color: 'var(--wl-accent)' }} />
                </div>
                {benefit}
              </div>
            ))}
          </div>

          <button
            className="wl-submit-btn wl-sc-hero-btn"
            onClick={() => setShowScorecard(true)}
          >
            {t('scorecard.heroButton')}
          </button>

          <p className="wl-early-note">{t('earlyAccess.note')}</p>
        </section>

        {/* ═══════════ BOTTOM CTA ═══════════ */}
        <section className="wl-bottom-cta" data-animate>
          <h3>{t('scorecard.bottomCtaTitle')}</h3>
          <button
            className="wl-submit-btn wl-sc-hero-btn"
            onClick={() => setShowScorecard(true)}
          >
            {t('scorecard.heroButton')}
          </button>
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
      {/* ═══════════ SUCCESS OVERLAY (legacy email flow) ═══════════ */}
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
            <p className="wl-success-position">
              {t('success.position', { count: count.toLocaleString() })}
            </p>

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

      {/* ═══════════ SCORECARD OVERLAY ═══════════ */}
      {showScorecard && (
        <WaitlistScorecard
          onClose={() => setShowScorecard(false)}
          onComplete={(results) => {
            setShowScorecard(false)
            setCompletedResults(results)
          }}
        />
      )}

    </div>
  )
}
