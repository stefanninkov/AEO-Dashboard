import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import './LandingPage.css'

/* ═══════════════════════════════════════════════════════════════
   NON-TRANSLATABLE DATA CONSTANTS (icons, colors, hrefs, booleans, numbers)
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINK_HREFS = ['#features', '#how-it-works', '#pricing', '#faq']

const PROBLEM_META = [
  { icon: '🔍', color: '#FF6B35' },
  { icon: '🤖', color: '#7B2FBE' },
  { icon: '📉', color: '#0EA5E9' },
]

const FEATURE_BIG_META = [
  { mockupType: 'checklist' },
  { mockupType: 'analyzer' },
  { mockupType: 'testing' },
]

const FEATURE_GRID_ICONS = ['📊', '✍️', '🏗️', '📡', '🔗', '📱', '📧', '🌐']

const PRICING_META = [
  { monthlyPrice: 29, quarterlyPrice: 25, yearlyPrice: 23, featured: false },
  { monthlyPrice: 49, quarterlyPrice: 42, yearlyPrice: 39, featured: true },
  { monthlyPrice: 149, quarterlyPrice: 127, yearlyPrice: 119, featured: false },
]

const PRICING_FEATURE_COUNTS = [6, 10, 8]

const TESTIMONIAL_AVATARS = ['SC', 'MR', 'EP', 'JM']

const FOOTER_LINK_HREFS = [
  [
    { href: '#features' },
    { href: '#pricing' },
    { href: '/AEO-Dashboard/app' },
    { href: '/AEO-Dashboard/app' },
  ],
  [
    { href: '#what-is-aeo' },
    { href: '#faq' },
    { href: '/AEO-Dashboard/app' },
    { href: '/AEO-Dashboard/app' },
  ],
  [
    { href: '#' },
    { href: '#' },
    { href: '#' },
    { href: '#' },
  ],
]

const CHECKLIST_ITEM_META = [
  { checked: true, width: '85%' },
  { checked: true, width: '72%' },
  { checked: true, width: '90%' },
  { checked: false, width: '65%' },
  { checked: false, width: '78%' },
  { checked: false, width: '55%' },
]

const ANALYZER_METRIC_META = [
  { score: 82, color: '#10B981' },
  { score: 68, color: '#F59E0B' },
  { score: 91, color: '#10B981' },
  { score: 45, color: '#EF4444' },
  { score: 73, color: '#F59E0B' },
]

const TESTING_ENGINE_META = [
  { statusColor: '#10B981', statusBg: 'rgba(16,185,129,0.15)' },
  { statusColor: '#10B981', statusBg: 'rgba(16,185,129,0.15)' },
  { statusColor: '#EF4444', statusBg: 'rgba(239,68,68,0.12)' },
  { statusColor: '#F59E0B', statusBg: 'rgba(245,158,11,0.12)' },
]

const MOCKUP_SIDEBAR_ACTIVE = [true, false, false, false, false, false]

const BASE_URL = 'https://stefanninkov.github.io/AEO-Dashboard/'

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const { t } = useTranslation('landing')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navSolid, setNavSolid] = useState(false)
  const [pricingPeriod, setPricingPeriod] = useState('quarterly')
  const [openFaq, setOpenFaq] = useState(null)

  const rootRef = useRef(null)

  /* --- Translated data arrays via useMemo --- */

  const NAV_LINKS = useMemo(() =>
    NAV_LINK_HREFS.map((href, i) => ({
      label: t(`nav.links.${i}.label`),
      href,
    })),
  [t])

  const PLATFORMS = useMemo(() => t('platforms.names', { returnObjects: true }), [t])

  const PROBLEMS = useMemo(() =>
    PROBLEM_META.map((meta, i) => ({
      ...meta,
      title: t(`problems.${i}.title`),
      description: t(`problems.${i}.description`),
    })),
  [t])

  const AEO_VS_SEO = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      aspect: t(`aeoVsSeo.${i}.aspect`),
      seo: t(`aeoVsSeo.${i}.seo`),
      aeo: t(`aeoVsSeo.${i}.aeo`),
    })),
  [t])

  const PILLARS = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => t(`pillars.${i}`)),
  [t])

  const FEATURES_BIG = useMemo(() =>
    FEATURE_BIG_META.map((meta, i) => ({
      ...meta,
      badge: t(`features.big.${i}.badge`),
      title: t(`features.big.${i}.title`),
      description: t(`features.big.${i}.description`),
      answerParagraph: i === 0 ? t(`features.big.${i}.answerParagraph`) : undefined,
    })),
  [t])

  const FEATURES_GRID = useMemo(() =>
    FEATURE_GRID_ICONS.map((icon, i) => ({
      icon,
      title: t(`features.grid.${i}.title`),
      description: t(`features.grid.${i}.description`),
    })),
  [t])

  const STEPS = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      title: t(`steps.${i}.title`),
      description: t(`steps.${i}.description`),
    })),
  [t])

  const PRICING = useMemo(() =>
    PRICING_META.map((meta, i) => ({
      ...meta,
      name: t(`pricing.${i}.name`),
      description: t(`pricing.${i}.description`),
      cta: t(`pricing.${i}.cta`),
      features: Array.from({ length: PRICING_FEATURE_COUNTS[i] }, (_, fi) =>
        t(`pricing.${i}.features.${fi}`)
      ),
    })),
  [t])

  const TESTIMONIALS = useMemo(() =>
    TESTIMONIAL_AVATARS.map((avatar, i) => ({
      avatar,
      text: t(`testimonials.${i}.text`),
      name: t(`testimonials.${i}.name`),
      role: t(`testimonials.${i}.role`),
    })),
  [t])

  const FAQ_ITEMS = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      question: t(`faq.${i}.question`),
      answer: t(`faq.${i}.answer`),
    })),
  [t])

  const FOOTER_LINKS = useMemo(() =>
    FOOTER_LINK_HREFS.map((linkHrefs, i) => ({
      title: t(`footer.columns.${i}.title`),
      links: linkHrefs.map((lh, li) => ({
        label: t(`footer.columns.${i}.links.${li}.label`),
        href: lh.href,
      })),
    })),
  [t])

  const CHECKLIST_ITEMS = useMemo(() =>
    CHECKLIST_ITEM_META.map((meta, i) => ({
      ...meta,
      label: t(`mockup.checklist.items.${i}`),
    })),
  [t])

  const ANALYZER_METRICS = useMemo(() =>
    ANALYZER_METRIC_META.map((meta, i) => ({
      ...meta,
      label: t(`mockup.analyzer.metrics.${i}`),
    })),
  [t])

  const TESTING_ENGINES = useMemo(() =>
    TESTING_ENGINE_META.map((meta, i) => ({
      ...meta,
      name: t(`mockup.testing.engines.${i}.name`),
      status: t(`mockup.testing.engines.${i}.status`),
    })),
  [t])

  const MOCKUP_SIDEBAR_ITEMS = useMemo(() =>
    MOCKUP_SIDEBAR_ACTIVE.map((active, i) => ({
      label: t(`mockup.sidebarItems.${i}`),
      active,
    })),
  [t])

  /* --- Feature Mockup Renderer --- */

  function renderFeatureMockup(type) {
    if (type === 'checklist') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--lp-border)' }}>
            <span style={{ fontFamily: 'var(--lp-font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>{t('mockup.checklist.phaseTitle')}</span>
            <span style={{ fontSize: '0.625rem', padding: '0.2rem 0.625rem', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', borderRadius: '100px', fontWeight: 600 }}>{t('mockup.checklist.completeBadge')}</span>
          </div>
          {CHECKLIST_ITEMS.map((item, i) => (
            <div key={i} className="lp-feature-visual-row">
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: item.checked ? 'none' : '1.5px solid var(--lp-text-tertiary)',
                  backgroundColor: item.checked ? 'var(--lp-accent)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.checked && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: '0.75rem',
                color: item.checked ? 'var(--lp-text-tertiary)' : 'var(--lp-text-secondary)',
                textDecoration: item.checked ? 'line-through' : 'none',
                flex: 1,
              }}>{item.label}</span>
              <div className="lp-feature-visual-line" style={{ maxWidth: item.width, flex: 'none', width: item.width }} />
            </div>
          ))}
        </div>
      )
    }

    if (type === 'analyzer') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '6px solid var(--lp-border)',
              borderTopColor: 'var(--lp-accent)',
              borderRightColor: 'var(--lp-accent)',
              borderBottomColor: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              position: 'relative',
            }}>
              <span style={{ fontFamily: 'var(--lp-font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>72</span>
              <span style={{ fontSize: '0.625rem', color: 'var(--lp-text-tertiary)', marginTop: '-0.25rem' }}>{t('mockup.analyzer.scoreLabel')}</span>
            </div>
          </div>
          {ANALYZER_METRICS.map((m, i) => (
            <div key={i} style={{ marginBottom: i < ANALYZER_METRICS.length - 1 ? '0.75rem' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--lp-text-secondary)' }}>{m.label}</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: m.color }}>{m.score}%</span>
              </div>
              <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.score}%`, backgroundColor: m.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (type === 'testing') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {TESTING_ENGINES.map((engine, i) => (
            <div key={i} style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--lp-border)',
              borderRadius: 'var(--lp-radius)',
              padding: '1rem',
            }}>
              <div style={{ fontFamily: 'var(--lp-font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-primary)', marginBottom: '0.5rem' }}>{engine.name}</div>
              <div style={{
                display: 'inline-block',
                fontSize: '0.625rem',
                fontWeight: 600,
                padding: '0.125rem 0.5rem',
                borderRadius: '100px',
                color: engine.statusColor,
                backgroundColor: engine.statusBg,
              }}>{engine.status}</div>
              <div style={{ marginTop: '0.625rem' }}>
                <div className="lp-feature-visual-line" style={{ width: '90%', marginBottom: '0.375rem' }} />
                <div className="lp-feature-visual-line" style={{ width: '70%', marginBottom: '0.375rem' }} />
                <div className="lp-feature-visual-line" style={{ width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  /* --- Schema Data (JSON-LD) --- */
  const schemaData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'AEO Dashboard',
        url: BASE_URL,
        description: t('schema.orgDescription'),
        logo: `${BASE_URL}logo.png`,
      },
      {
        '@type': 'WebPage',
        name: t('schema.webPageName'),
        url: BASE_URL,
        description: t('schema.webPageDescription'),
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['#hero', '#what-is-aeo', '#how-it-works', '#faq'],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'AEO Dashboard',
        url: BASE_URL,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: t('schema.appDescription'),
        offers: PRICING.map((tier) => ({
          '@type': 'Offer',
          name: tier.name,
          price: String(tier.yearlyPrice),
          priceCurrency: 'USD',
          description: tier.description,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'HowTo',
        name: t('schema.howToName'),
        description: t('schema.howToDescription'),
        step: STEPS.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.title,
          text: s.description,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t('schema.breadcrumbHome'),
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t('schema.breadcrumbApp'),
            item: `${BASE_URL}app`,
          },
        ],
      },
    ],
  }), [t, PRICING, FAQ_ITEMS, STEPS])

  /* --- Effect: scroll listener on .lp-root container --- */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    function handleScroll() {
      setNavSolid(root.scrollTop > 60)
    }

    root.addEventListener('scroll', handleScroll, { passive: true })
    return () => root.removeEventListener('scroll', handleScroll)
  }, [])

  /* --- Effect: IntersectionObserver for [data-animate] --- */
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      const elements = rootRef.current?.querySelectorAll('[data-animate]')
      if (elements) {
        elements.forEach((el) => el.classList.add('lp-visible'))
      }
      return
    }

    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { root, threshold: 0.1 }
    )

    const elements = root.querySelectorAll('[data-animate]')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  /* --- Effect: JSON-LD schema injection --- */
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schemaData)
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [schemaData])

  /* --- Smooth scroll handler --- */
  function scrollToSection(e, href) {
    e.preventDefault()
    if (mobileMenuOpen) setMobileMenuOpen(false)
    const el = rootRef.current?.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="lp-root" ref={rootRef}>

      {/* ═══════════ 1. NAV ═══════════ */}
      <header className={`lp-nav ${navSolid ? 'lp-nav-solid' : ''}`}>
        <nav className="lp-nav-inner" aria-label="Main navigation">
          <a href="/AEO-Dashboard/" className="lp-nav-logo">
            <span className="lp-nav-logo-accent">AEO</span>&nbsp;Dashboard
          </a>

          <div className="lp-nav-links">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="lp-nav-link"
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <a href="/AEO-Dashboard/app" className="lp-nav-cta">{t('nav.cta')}</a>
          </div>

          <button
            className={`lp-nav-hamburger ${mobileMenuOpen ? 'lp-open' : ''}`}
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
      <div className={`lp-nav-mobile-overlay ${mobileMenuOpen ? 'lp-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="lp-nav-link"
            onClick={(e) => scrollToSection(e, link.href)}
          >
            {link.label}
          </a>
        ))}
        <a href="/AEO-Dashboard/app" className="lp-nav-cta">{t('nav.cta')}</a>
      </div>

      <main>

        {/* ═══════════ 2. HERO ═══════════ */}
        <section id="hero" className="lp-hero" aria-label="Hero">
          <div className="lp-hero-inner">
            <div className="lp-badge">{t('hero.badge')}</div>
            <h1>{t('hero.headingBefore')}<span>{t('hero.headingAccent')}</span></h1>
            <p className="lp-hero-sub">
              {t('hero.subtitle')}
            </p>
            <div className="lp-hero-ctas">
              <a href="/AEO-Dashboard/app" className="lp-btn-primary">{t('hero.ctaPrimary')}</a>
              <a href="#features" className="lp-btn-secondary" onClick={(e) => scrollToSection(e, '#features')}>{t('hero.ctaSecondary')}</a>
            </div>

            {/* CSS-only dashboard mockup */}
            <div className="lp-mockup" aria-hidden="true">
              <div className="lp-mockup-inner">
                <div className="lp-mockup-sidebar">
                  <div className="lp-mockup-sidebar-logo">
                    <span style={{ color: 'var(--lp-accent)' }}>AEO</span> {t('mockup.sidebarLogo')}
                  </div>
                  {MOCKUP_SIDEBAR_ITEMS.map((item, i) => (
                    <div key={i} className={`lp-mockup-sidebar-item ${item.active ? 'lp-active' : ''}`}>
                      <div className="lp-mockup-sidebar-dot" />
                      {item.label}
                    </div>
                  ))}
                </div>
                <div className="lp-mockup-main">
                  <div className="lp-mockup-header">
                    <div className="lp-mockup-header-title">{t('mockup.headerTitle')}</div>
                    <div className="lp-mockup-header-badge">{t('mockup.headerBadge')}</div>
                  </div>
                  <div className="lp-mockup-stats">
                    {[
                      { label: t('mockup.stats.0.label'), value: t('mockup.stats.0.value'), colorClass: 'lp-orange' },
                      { label: t('mockup.stats.1.label'), value: t('mockup.stats.1.value'), colorClass: '' },
                      { label: t('mockup.stats.2.label'), value: t('mockup.stats.2.value'), colorClass: 'lp-green' },
                    ].map((stat, i) => (
                      <div key={i} className="lp-mockup-stat-card">
                        <div className="lp-mockup-stat-label">{stat.label}</div>
                        <div className={`lp-mockup-stat-value ${stat.colorClass}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="lp-mockup-chart">
                    {[40, 65, 45, 80, 60, 90, 75, 55, 85, 70].map((h, i) => (
                      <div key={i} className="lp-mockup-chart-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 3. PLATFORMS ═══════════ */}
        <section className="lp-platforms" aria-label="Supported AI platforms" data-animate>
          <div className="lp-platform-item" style={{ color: 'var(--lp-text-tertiary)', fontSize: '0.8125rem', fontWeight: 400 }}>{t('platforms.subtitle')}</div>
          {PLATFORMS.map((p) => (
            <div key={p} className="lp-platform-item">{p}</div>
          ))}
        </section>

        {/* ═══════════ 4. PROBLEM ═══════════ */}
        <section id="problem" className="lp-section" aria-label="The problem" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{t('problems.sectionLabel')}</span>
            <h2 className="lp-section-title">{t('problems.title')}</h2>
            <p className="lp-section-subtitle">{t('problems.subtitle')}</p>
          </div>
          <div className="lp-problem-grid">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="lp-problem-card" data-animate>
                <div className="lp-problem-icon" style={{ background: p.color + '18', color: p.color }}>
                  <span>{p.icon}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ 5. WHAT IS AEO ═══════════ */}
        <section id="what-is-aeo" className="lp-section" aria-label="What is AEO" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{t('education.sectionLabel')}</span>
            <h2 className="lp-section-title">{t('education.title')}</h2>
          </div>
          <div className="lp-aeo-content">
            <p className="lp-answer-paragraph">
              <strong>Answer Engine Optimization (AEO) is the practice of optimizing website content to be selected, cited, and surfaced by AI-powered answer engines.</strong> Unlike traditional SEO that targets search engine result pages, AEO focuses on making your content the preferred source that large language models like ChatGPT, Perplexity, and Google Gemini reference when generating answers to user queries.
            </p>

            <h3>{t('education.comparisonHeading')}</h3>
            <p className="lp-answer-paragraph">
              <strong>While SEO and AEO share common foundations, they differ in target systems, success metrics, and optimization techniques.</strong> SEO optimizes for crawlers and ranking algorithms; AEO optimizes for language models and retrieval-augmented generation (RAG) pipelines. The most effective digital strategies now combine both approaches to maximize visibility across traditional and AI-powered search.
            </p>
            <table className="lp-comparison-table">
              <thead>
                <tr>
                  <th scope="col">{t('aeoVsSeo.colAspect')}</th>
                  <th scope="col">{t('aeoVsSeo.colSeo')}</th>
                  <th scope="col">{t('aeoVsSeo.colAeo')}</th>
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

            <h3>{t('education.pillarsHeading')}</h3>
            <ol className="lp-pillars-list">
              {PILLARS.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══════════ 6. FEATURES (Big alternating rows) ═══════════ */}
        <section id="features" className="lp-section" aria-label="Key features">
          <div className="lp-section-center" data-animate>
            <span className="lp-section-label">{t('features.sectionLabel')}</span>
            <h2 className="lp-section-title">{t('features.title')}</h2>
            <p className="lp-section-subtitle">{t('features.subtitle')}</p>
          </div>
          {FEATURES_BIG.map((f, i) => (
            <article key={i} className={`lp-feature-row ${i % 2 === 1 ? 'lp-feature-row-reverse' : ''}`} data-animate>
              <div className="lp-feature-text">
                <span className="lp-feature-badge">{f.badge}</span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
                {f.answerParagraph && (
                  <p className="lp-answer-paragraph">{f.answerParagraph}</p>
                )}
              </div>
              <div className="lp-feature-visual">
                {renderFeatureMockup(f.mockupType)}
              </div>
            </article>
          ))}
        </section>

        {/* ═══════════ 7. FEATURES GRID ═══════════ */}
        <section id="features-grid" className="lp-section" aria-label="Additional features" data-animate>
          <div className="lp-section-center">
            <h2 className="lp-section-title">{t('features.gridTitle')}</h2>
          </div>
          <div className="lp-features-grid">
            {FEATURES_GRID.map((f, i) => (
              <article key={i} className="lp-feature-grid-card" data-animate>
                <div className="lp-feature-grid-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════ 8. HOW IT WORKS ═══════════ */}
        <section id="how-it-works" className="lp-section" aria-label="How it works" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{t('steps.sectionLabel')}</span>
            <h2 className="lp-section-title">{t('steps.title')}</h2>
            <p className="lp-section-subtitle">
              <strong>To optimize for AI search engines, start by auditing your current visibility, then systematically implement AEO best practices, and continuously test across multiple AI platforms.</strong> The AEO Dashboard guides you through each step with actionable tools and real-time feedback.
            </p>
          </div>
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li key={i} className="lp-step" data-animate>
                <div className="lp-step-number">{i + 1}</div>
                <div className="lp-step-content">
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="lp-answer-paragraph" style={{ maxWidth: '768px', margin: '2rem auto 0' }}>
            <strong>Getting cited by ChatGPT requires a combination of structured data, authoritative content, and technical accessibility.</strong> Implement comprehensive schema markup, format content as direct answers to common questions, build entity authority through consistent and accurate information, and ensure AI crawlers can freely access your pages. The AEO Dashboard automates this process with its 99-point checklist and AI-powered analysis tools.
          </p>
        </section>

        {/* ═══════════ 9. PRICING ═══════════ */}
        <section id="pricing" className="lp-section" aria-label="Pricing" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{t('pricing.sectionLabel')}</span>
            <h2 className="lp-section-title">{t('pricing.title')}</h2>
            <p className="lp-section-subtitle">{t('pricing.subtitle')}</p>
          </div>
          <div className="lp-pricing-toggle-wrapper">
            <div className="lp-pricing-toggle">
              <button
                className={`lp-pricing-toggle-btn ${pricingPeriod === 'monthly' ? 'lp-active' : ''}`}
                onClick={() => setPricingPeriod('monthly')}
              >
                {t('pricing.toggleMonthly')}
              </button>
              <button
                className={`lp-pricing-toggle-btn ${pricingPeriod === 'quarterly' ? 'lp-active' : ''}`}
                onClick={() => setPricingPeriod('quarterly')}
              >
                {t('pricing.toggleQuarterly')} <span style={{ fontSize: '0.6875rem', marginLeft: '0.375rem', opacity: 0.9 }}>{t('pricing.toggleQuarterlySave')}</span>
              </button>
              <button
                className={`lp-pricing-toggle-btn ${pricingPeriod === 'yearly' ? 'lp-active' : ''}`}
                onClick={() => setPricingPeriod('yearly')}
              >
                {t('pricing.toggleAnnual')} <span style={{ fontSize: '0.6875rem', marginLeft: '0.375rem', opacity: 0.9 }}>{t('pricing.toggleAnnualSave')}</span>
              </button>
            </div>
          </div>
          <div className="lp-pricing-grid">
            {PRICING.map((tier, i) => (
              <article key={i} className={`lp-pricing-card ${tier.featured ? 'lp-pricing-card-featured' : ''}`} data-animate>
                {tier.featured && <div className="lp-pricing-popular-badge">{t('pricing.mostPopular')}</div>}
                <h3>{tier.name}</h3>
                <p className="lp-pricing-card-desc">{tier.description}</p>
                <div className="lp-pricing-price">
                  ${pricingPeriod === 'yearly' ? tier.yearlyPrice : pricingPeriod === 'quarterly' ? tier.quarterlyPrice : tier.monthlyPrice}
                  <span>
                    {pricingPeriod === 'yearly' ? t('pricing.billedYearly') : pricingPeriod === 'quarterly' ? t('pricing.billedQuarterly') : t('pricing.billedMonthly')}
                  </span>
                </div>
                <div className="lp-pricing-divider" />
                <ul className="lp-pricing-features">
                  {tier.features.map((f, fi) => (
                    <li key={fi}>{f}</li>
                  ))}
                </ul>
                <a href="/AEO-Dashboard/app" className="lp-pricing-cta">
                  {tier.cta}
                </a>
              </article>
            ))}
          </div>
          <div className="lp-whitelabel-callout" data-animate>
            <h3>{t('pricing.whiteLabel.title')}</h3>
            <p>{t('pricing.whiteLabel.description')}</p>
          </div>
        </section>

        {/* ═══════════ 10. TESTIMONIALS ═══════════ */}
        <section id="testimonials" className="lp-section" aria-label="Testimonials" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{t('testimonials.sectionLabel')}</span>
            <h2 className="lp-section-title">{t('testimonials.title')}</h2>
          </div>
          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((testimonial, i) => (
              <article key={i} className="lp-testimonial-card" data-animate>
                <div className="lp-testimonial-stars">
                  {[...Array(5)].map((_, si) => (
                    <span key={si} className="lp-testimonial-star">&#9733;</span>
                  ))}
                </div>
                <p className="lp-testimonial-text">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{testimonial.avatar}</div>
                  <div className="lp-testimonial-author-info">
                    <div className="lp-testimonial-name">{testimonial.name}</div>
                    <div className="lp-testimonial-role">{testimonial.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════ 11. FAQ ═══════════ */}
        <section id="faq" className="lp-section" aria-label="Frequently asked questions" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{t('faq.sectionLabel')}</span>
            <h2 className="lp-section-title">{t('faq.title')}</h2>
          </div>
          <div className="lp-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="lp-faq-item">
                <button
                  className="lp-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.question}</span>
                  <span className={`lp-faq-chevron ${openFaq === i ? 'lp-faq-open' : ''}`}>
                    &#9662;
                  </span>
                </button>
                <div className={`lp-faq-answer ${openFaq === i ? 'lp-faq-open' : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ 12. FINAL CTA ═══════════ */}
        <section id="cta" className="lp-section" aria-label="Get started" data-animate>
          <div className="lp-final-cta">
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.description')}</p>
            <a href="/AEO-Dashboard/app" className="lp-btn-primary">{t('cta.button')}</a>
          </div>
        </section>

      </main>

      {/* ═══════════ 13. FOOTER ═══════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <a href="/AEO-Dashboard/" className="lp-footer-brand-logo">
              <span className="lp-nav-logo-accent">AEO</span>&nbsp;Dashboard
            </a>
            <p>{t('footer.brandDescription')}</p>
          </div>
          {FOOTER_LINKS.map((col, i) => (
            <div key={i} className="lp-footer-col">
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
        <div className="lp-footer-bottom">
          <p className="lp-footer-copyright">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

    </div>
  )
}
