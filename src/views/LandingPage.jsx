import { useState, useEffect, useRef, useMemo } from 'react'
import './LandingPage.css'

/* ═══════════════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

const PLATFORMS = ['ChatGPT', 'Perplexity', 'Google AI', 'Bing Copilot', 'Claude']

const PROBLEMS = [
  {
    icon: '🔍',
    title: 'AI Search Is Replacing Google',
    description: 'Over 40% of Gen Z uses TikTok and ChatGPT instead of Google. Traditional SEO alone no longer guarantees visibility.',
    color: '#FF6B35',
  },
  {
    icon: '🤖',
    title: 'AI Answers Cite Few Sources',
    description: 'ChatGPT and Perplexity only cite 3-5 sources per answer. If you\'re not optimized, your clients are invisible to AI.',
    color: '#7B2FBE',
  },
  {
    icon: '📉',
    title: 'Zero-Click Is the New Normal',
    description: 'AI Overviews and direct answers mean users never visit your site. You need to be THE answer, not just a result.',
    color: '#0EA5E9',
  },
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

const FEATURES_BIG = [
  {
    badge: 'Core Feature',
    title: '88-Point AEO Checklist',
    description: 'A comprehensive, phase-by-phase checklist covering every aspect of Answer Engine Optimization. From schema markup to content structure, entity optimization to AI crawler access \u2014 track every task across 7 phases with built-in progress analytics.',
    answerParagraph: 'An AEO checklist is a structured task list that guides website owners through every optimization needed to appear in AI-generated answers. It covers schema markup implementation, content restructuring for direct answers, entity authority building, and technical configurations that help AI crawlers understand and cite your content.',
    mockupType: 'checklist',
  },
  {
    badge: 'AI-Powered',
    title: 'Instant Site Analyzer',
    description: 'Enter any URL and get an instant AEO readiness score. Our AI-powered analyzer checks schema markup, content structure, header hierarchy, FAQ formatting, and 20+ other signals that determine whether AI engines will cite your content.',
    mockupType: 'analyzer',
  },
  {
    badge: 'Multi-Engine',
    title: 'AI Search Testing Lab',
    description: 'Test how your content appears across ChatGPT, Perplexity, Claude, and Gemini simultaneously. See which AI engines cite your site, compare responses, and identify gaps in your AI visibility across every major platform.',
    mockupType: 'testing',
  },
]

const FEATURES_GRID = [
  { icon: '📊', title: 'Dashboard Analytics', description: 'AEO health score, phase radar, velocity tracking, and trend analysis.' },
  { icon: '✍️', title: 'AI Content Writer', description: 'Generate AEO-optimized content with schema markup built in.' },
  { icon: '🏗️', title: 'Schema Generator', description: 'Point-and-click schema markup builder for FAQ, HowTo, and more.' },
  { icon: '📡', title: 'Auto-Monitoring', description: 'Track AI citation changes and get alerts when visibility shifts.' },
  { icon: '🔗', title: 'Client Portal', description: 'Share branded, read-only dashboards with clients via secure links.' },
  { icon: '📱', title: 'PWA & Offline', description: 'Install as a native app. Works offline with full functionality.' },
  { icon: '📧', title: 'Email Digests', description: 'Weekly progress reports delivered straight to your inbox.' },
  { icon: '🌐', title: 'Webflow Integration', description: 'Deep CMS integration for headless Webflow site optimization.' },
]

const STEPS = [
  {
    title: 'Audit Your Site',
    description: 'Run the AI-powered analyzer on any URL. Get an instant AEO readiness score with actionable recommendations for improving your AI search visibility.',
  },
  {
    title: 'Optimize with the Checklist',
    description: 'Work through the 88-point checklist across 7 phases. Each task includes guidance on implementation, and your progress syncs across devices in real-time.',
  },
  {
    title: 'Test & Monitor',
    description: 'Test your content across ChatGPT, Perplexity, Claude, and Gemini. Monitor citation changes over time and prove ROI to your clients with branded reports.',
  },
]

const PRICING = [
  {
    name: 'Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'For individuals exploring AEO',
    features: ['1 project', '88-point checklist', 'Basic site analyzer', 'Community support'],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    name: 'Professional',
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: 'For agencies & SEO professionals',
    features: ['10 projects', 'AI content writer', 'Schema generator', 'Multi-engine testing', 'Client portal', 'Email digests', 'Priority support'],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 149,
    yearlyPrice: 119,
    description: 'For teams & large agencies',
    features: ['Unlimited projects', 'White-label portal', 'Webflow integration', 'Auto-monitoring', 'API access', 'Custom onboarding', 'Dedicated support'],
    cta: 'Contact Sales',
    featured: false,
  },
]

const TESTIMONIALS = [
  {
    text: 'We went from zero AI citations to appearing in 60% of relevant ChatGPT answers within 3 weeks. The checklist alone is worth 10x the price.',
    name: 'Sarah Chen',
    role: 'Head of SEO, DigitalFirst Agency',
    avatar: 'SC',
  },
  {
    text: 'The client portal changed our workflow completely. Clients can see their AEO progress in real-time without us creating manual reports every week.',
    name: 'Marcus Rodriguez',
    role: 'Founder, SearchWave Marketing',
    avatar: 'MR',
  },
  {
    text: 'Finally, a tool that treats AI search as a first-class channel. The multi-engine testing lab showed us exactly where we were missing citations.',
    name: 'Emily Park',
    role: 'SEO Director, GrowthLab',
    avatar: 'EP',
  },
  {
    text: 'The schema generator alone saved us 20+ hours per client. Combined with the analyzer, it\'s the most complete AEO toolkit available.',
    name: 'James Mitchell',
    role: 'Technical SEO Lead, Apex Digital',
    avatar: 'JM',
  },
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
    question: 'Which AI platforms does AEO Dashboard support?',
    answer: 'AEO Dashboard supports testing and optimization across ChatGPT, Perplexity, Google AI Overviews (Gemini), Bing Copilot, Claude, and other major AI answer engines. The multi-engine testing lab lets you compare how your content appears across all platforms simultaneously.',
  },
  {
    question: 'How long does it take to see results from AEO?',
    answer: 'Most users see measurable improvements in AI citations within 2-4 weeks of implementing the checklist recommendations. Schema markup changes are typically picked up by AI crawlers within days, while content structure improvements may take 1-2 weeks to be reflected in AI-generated answers.',
  },
  {
    question: 'Can I use AEO Dashboard for client work?',
    answer: 'Absolutely. AEO Dashboard is built for agencies and SEO professionals managing multiple clients. The Professional plan includes client portals with branded, shareable dashboards, and the Enterprise plan offers white-label capabilities for a fully branded experience.',
  },
  {
    question: 'What does the 88-point checklist cover?',
    answer: 'The checklist spans 7 phases of AEO optimization: technical foundation, schema markup, content structure, entity optimization, multi-platform targeting, AI crawler access, and ongoing monitoring. Each task includes implementation guidance and tracks completion across your entire team.',
  },
  {
    question: 'Do I need technical skills to use AEO Dashboard?',
    answer: 'No. AEO Dashboard is designed for both technical and non-technical users. The checklist provides step-by-step guidance, the AI content writer generates optimized content automatically, and the schema generator creates markup through a visual interface \u2014 no coding required.',
  },
  {
    question: 'Is there a free plan available?',
    answer: 'Yes. The Starter plan is completely free and includes one project, the full 88-point AEO checklist, and basic site analysis. It\'s perfect for individuals exploring Answer Engine Optimization before upgrading to the Professional plan for agency features.',
  },
]

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Checklist', href: '/AEO-Dashboard/app' },
      { label: 'Analyzer', href: '/AEO-Dashboard/app' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'What is AEO?', href: '#what-is-aeo' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Documentation', href: '/AEO-Dashboard/app' },
      { label: 'API Reference', href: '/AEO-Dashboard/app' },
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

const BASE_URL = 'https://stefanninkov.github.io/AEO-Dashboard/'

/* ═══════════════════════════════════════════════════════════════
   FEATURE MOCKUP RENDERER
   ═══════════════════════════════════════════════════════════════ */

const CHECKLIST_ITEMS = [
  { label: 'Implement JSON-LD FAQ schema', checked: true, width: '85%' },
  { label: 'Add HowTo structured data', checked: true, width: '72%' },
  { label: 'Optimize header hierarchy (H1-H4)', checked: true, width: '90%' },
  { label: 'Create concise answer paragraphs', checked: false, width: '65%' },
  { label: 'Configure AI crawler access in robots.txt', checked: false, width: '78%' },
  { label: 'Build entity authority signals', checked: false, width: '55%' },
]

const ANALYZER_METRICS = [
  { label: 'Schema Markup', score: 82, color: '#10B981' },
  { label: 'Content Structure', score: 68, color: '#F59E0B' },
  { label: 'Header Hierarchy', score: 91, color: '#10B981' },
  { label: 'FAQ Formatting', score: 45, color: '#EF4444' },
  { label: 'Entity Clarity', score: 73, color: '#F59E0B' },
]

const TESTING_ENGINES = [
  { name: 'ChatGPT', status: 'Cited', statusColor: '#10B981', statusBg: 'rgba(16,185,129,0.15)' },
  { name: 'Perplexity', status: 'Cited', statusColor: '#10B981', statusBg: 'rgba(16,185,129,0.15)' },
  { name: 'Gemini', status: 'Not Found', statusColor: '#EF4444', statusBg: 'rgba(239,68,68,0.12)' },
  { name: 'Bing Copilot', status: 'Partial', statusColor: '#F59E0B', statusBg: 'rgba(245,158,11,0.12)' },
]

function renderFeatureMockup(type) {
  if (type === 'checklist') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--lp-border)' }}>
          <span style={{ fontFamily: 'var(--lp-font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>Phase 2: Schema Markup</span>
          <span style={{ fontSize: '0.625rem', padding: '0.2rem 0.625rem', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', borderRadius: '100px', fontWeight: 600 }}>50% Complete</span>
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
            <span style={{ fontSize: '0.625rem', color: 'var(--lp-text-tertiary)', marginTop: '-0.25rem' }}>AEO Score</span>
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

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR NAV ITEMS FOR HERO MOCKUP
   ═══════════════════════════════════════════════════════════════ */

const MOCKUP_SIDEBAR_ITEMS = [
  { label: 'Dashboard', active: true },
  { label: 'Checklist', active: false },
  { label: 'Analyzer', active: false },
  { label: 'Testing Lab', active: false },
  { label: 'Content', active: false },
  { label: 'Monitoring', active: false },
]

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navSolid, setNavSolid] = useState(false)
  const [pricingAnnual, setPricingAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)

  const rootRef = useRef(null)

  /* --- Schema Data (JSON-LD) --- */
  const schemaData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'AEO Dashboard',
        url: BASE_URL,
        description: 'The complete toolkit for Answer Engine Optimization. Optimize your website to be cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot.',
        logo: `${BASE_URL}logo.png`,
      },
      {
        '@type': 'WebPage',
        name: 'AEO Dashboard - Optimize Your Website for AI Search Engines',
        url: BASE_URL,
        description: 'Get your clients cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. The complete AEO toolkit with an 88-point checklist, AI-powered analyzer, and client-ready reports.',
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
        description: 'Answer Engine Optimization platform for agencies and SEO professionals.',
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
        name: 'How to Optimize for AI Search Engines',
        description: 'A three-step process to optimize your website for AI answer engines using AEO Dashboard.',
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
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'AEO Dashboard',
            item: `${BASE_URL}app`,
          },
        ],
      },
    ],
  }), [])

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
                key={link.label}
                href={link.href}
                className="lp-nav-link"
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <a href="/AEO-Dashboard/app" className="lp-nav-cta">Get Started</a>
          </div>

          <button
            className={`lp-nav-hamburger ${mobileMenuOpen ? 'lp-open' : ''}`}
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
      <div className={`lp-nav-mobile-overlay ${mobileMenuOpen ? 'lp-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="lp-nav-link"
            onClick={(e) => scrollToSection(e, link.href)}
          >
            {link.label}
          </a>
        ))}
        <a href="/AEO-Dashboard/app" className="lp-nav-cta">Get Started</a>
      </div>

      <main>

        {/* ═══════════ 2. HERO ═══════════ */}
        <section id="hero" className="lp-hero" aria-label="Hero">
          <div className="lp-hero-inner">
            <div className="lp-badge">Built for Agencies &amp; SEO Teams</div>
            <h1>Optimize Your Website for <span>AI Search Engines</span></h1>
            <p className="lp-hero-sub">
              Get your clients cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot.
              The complete AEO toolkit with an 88-point checklist, AI-powered analyzer, and client-ready reports.
            </p>
            <div className="lp-hero-ctas">
              <a href="/AEO-Dashboard/app" className="lp-btn-primary">Start Free &mdash; No Card Required</a>
              <a href="#features" className="lp-btn-secondary" onClick={(e) => scrollToSection(e, '#features')}>See Features</a>
            </div>

            {/* CSS-only dashboard mockup */}
            <div className="lp-mockup" aria-hidden="true">
              <div className="lp-mockup-inner">
                <div className="lp-mockup-sidebar">
                  <div className="lp-mockup-sidebar-logo">
                    <span style={{ color: 'var(--lp-accent)' }}>AEO</span> Dash
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
                    <div className="lp-mockup-header-title">AEO Dashboard</div>
                    <div className="lp-mockup-header-badge">On Track</div>
                  </div>
                  <div className="lp-mockup-stats">
                    {[
                      { label: 'AEO Score', value: '78', colorClass: 'lp-orange' },
                      { label: 'Tasks Done', value: '54/88', colorClass: '' },
                      { label: 'AI Citations', value: '12', colorClass: 'lp-green' },
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
          <div className="lp-platform-item" style={{ color: 'var(--lp-text-tertiary)', fontSize: '0.8125rem', fontWeight: 400 }}>Optimize for every major AI platform</div>
          {PLATFORMS.map((p) => (
            <div key={p} className="lp-platform-item">{p}</div>
          ))}
        </section>

        {/* ═══════════ 4. PROBLEM ═══════════ */}
        <section id="problem" className="lp-section" aria-label="The problem" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">The Problem</span>
            <h2 className="lp-section-title">Your Clients Are Invisible to AI</h2>
            <p className="lp-section-subtitle">Traditional SEO isn&rsquo;t enough anymore. AI answer engines are changing how people find information &mdash; and most websites aren&rsquo;t optimized for it.</p>
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
            <span className="lp-section-label">Education</span>
            <h2 className="lp-section-title">What is Answer Engine Optimization?</h2>
          </div>
          <div className="lp-aeo-content">
            <p className="lp-answer-paragraph">
              <strong>Answer Engine Optimization (AEO) is the practice of optimizing website content to be selected, cited, and surfaced by AI-powered answer engines.</strong> Unlike traditional SEO that targets search engine result pages, AEO focuses on making your content the preferred source that large language models like ChatGPT, Perplexity, and Google Gemini reference when generating answers to user queries.
            </p>

            <h3>AEO vs Traditional SEO</h3>
            <p className="lp-answer-paragraph">
              <strong>While SEO and AEO share common foundations, they differ in target systems, success metrics, and optimization techniques.</strong> SEO optimizes for crawlers and ranking algorithms; AEO optimizes for language models and retrieval-augmented generation (RAG) pipelines. The most effective digital strategies now combine both approaches to maximize visibility across traditional and AI-powered search.
            </p>
            <table className="lp-comparison-table">
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th>Traditional SEO</th>
                  <th>AEO</th>
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
            <span className="lp-section-label">Features</span>
            <h2 className="lp-section-title">Everything You Need for AEO</h2>
            <p className="lp-section-subtitle">A complete toolkit to optimize, test, and monitor your AI search visibility.</p>
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
            <h2 className="lp-section-title">And So Much More</h2>
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
            <span className="lp-section-label">How It Works</span>
            <h2 className="lp-section-title">Three Steps to AI Visibility</h2>
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
            <strong>Getting cited by ChatGPT requires a combination of structured data, authoritative content, and technical accessibility.</strong> Implement comprehensive schema markup, format content as direct answers to common questions, build entity authority through consistent and accurate information, and ensure AI crawlers can freely access your pages. The AEO Dashboard automates this process with its 88-point checklist and AI-powered analysis tools.
          </p>
        </section>

        {/* ═══════════ 9. PRICING ═══════════ */}
        <section id="pricing" className="lp-section" aria-label="Pricing" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">Pricing</span>
            <h2 className="lp-section-title">Simple, Transparent Pricing</h2>
            <p className="lp-section-subtitle">Start free. Upgrade when you&rsquo;re ready. No hidden fees.</p>
          </div>
          <div className="lp-pricing-toggle-wrapper">
            <div className="lp-pricing-toggle">
              <button
                className={`lp-pricing-toggle-btn ${!pricingAnnual ? 'lp-active' : ''}`}
                onClick={() => setPricingAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`lp-pricing-toggle-btn ${pricingAnnual ? 'lp-active' : ''}`}
                onClick={() => setPricingAnnual(true)}
              >
                Annual <span style={{ fontSize: '0.6875rem', marginLeft: '0.375rem', opacity: 0.9 }}>Save 20%</span>
              </button>
            </div>
          </div>
          <div className="lp-pricing-grid">
            {PRICING.map((tier, i) => (
              <article key={i} className={`lp-pricing-card ${tier.featured ? 'lp-pricing-card-featured' : ''}`} data-animate>
                {tier.featured && <div className="lp-pricing-popular-badge">Most Popular</div>}
                <h3>{tier.name}</h3>
                <p className="lp-pricing-card-desc">{tier.description}</p>
                <div className="lp-pricing-price">
                  ${pricingAnnual ? tier.yearlyPrice : tier.monthlyPrice}
                  <span>
                    {tier.monthlyPrice === 0 ? '/forever' : pricingAnnual ? '/mo, billed yearly' : '/month'}
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
            <h3>Need White-Label?</h3>
            <p>Enterprise plan includes full white-label capabilities. Brand the client portal with your agency&rsquo;s logo, colors, and domain.</p>
          </div>
        </section>

        {/* ═══════════ 10. TESTIMONIALS ═══════════ */}
        <section id="testimonials" className="lp-section" aria-label="Testimonials" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">Testimonials</span>
            <h2 className="lp-section-title">Loved by SEO Professionals</h2>
          </div>
          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <article key={i} className="lp-testimonial-card" data-animate>
                <div className="lp-testimonial-stars">
                  {[...Array(5)].map((_, si) => (
                    <span key={si} className="lp-testimonial-star">&#9733;</span>
                  ))}
                </div>
                <p className="lp-testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{t.avatar}</div>
                  <div className="lp-testimonial-author-info">
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════ 11. FAQ ═══════════ */}
        <section id="faq" className="lp-section" aria-label="Frequently asked questions" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">FAQ</span>
            <h2 className="lp-section-title">Frequently Asked Questions</h2>
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
            <h2>Ready to Dominate AI Search?</h2>
            <p>Join hundreds of agencies using AEO Dashboard to get their clients cited by AI. Start with the free plan &mdash; no credit card required.</p>
            <a href="/AEO-Dashboard/app" className="lp-btn-primary">Get Started Free</a>
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
            <p>The complete toolkit for Answer Engine Optimization. Built by <strong>Adhouse Digital Agency</strong>.</p>
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
          <p className="lp-footer-copyright">&copy; {new Date().getFullYear()} AEO Dashboard. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
