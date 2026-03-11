import { useState, useEffect, useRef, useMemo } from 'react'
import { useWaitlist } from '../hooks/useWaitlist'
import { useTheme } from '../contexts/ThemeContext'
import { Check, Share2, Copy, Sparkles, Blocks, BarChart4, FileEdit, Cog, Trophy, FlaskConical, TrendingUp, CheckCircle2, SearchCheck, NotebookPen, Radar, Sun, Moon } from 'lucide-react'
import WaitlistScorecard from '../components/WaitlistScorecard'
import { MAX_TOTAL_SCORE } from '../utils/scorecardScoring'
import { generateReferralCode, buildReferralLink, getReferralFromUrl, getCurrentTier, getNextTier, REFERRAL_TIERS } from '../utils/referralSystem'
import ReferralDashboard from '../components/ReferralDashboard'
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

  const NAV_LINKS = useMemo(() => [
      { label: 'What is AEO?', href: NAV_HREFS[0]?.href || '#' },
      { label: 'Phases', href: NAV_HREFS[1]?.href || '#' },
      { label: 'Features', href: NAV_HREFS[2]?.href || '#' },
      { label: 'FAQ', href: NAV_HREFS[3]?.href || '#' }
    ], [])

  const AEO_VS_SEO = useMemo(() => [
      { aspect: 'Primary Goal', seo: 'Rank in search results', aeo: 'Be cited in AI answers' },
      { aspect: 'Key Metric', seo: 'Position & click-through rate', aeo: 'Citation frequency & accuracy' },
      { aspect: 'Content Format', seo: 'Keywords & backlinks', aeo: 'Structured data & direct answers' },
      { aspect: 'Target System', seo: 'Google, Bing crawlers', aeo: 'LLMs, RAG pipelines, AI agents' },
      { aspect: 'Optimization', seo: 'Meta tags & page speed', aeo: 'Schema markup & entity clarity' },
      { aspect: 'Time Horizon', seo: 'Weeks to months', aeo: 'Days to weeks (re-indexed by AI)' }
    ], [])

  const PHASES = useMemo(() => [
      { ...PHASE_META[0], title: 'Foundation & Audit', timeline: 'Week 1-2', description: 'Audit existing content and technical infrastructure. Map questions, analyze competitors, and establish your AEO baseline.', visibility: 'Know where you stand — baseline metrics and content gaps identified' },
      { ...PHASE_META[1], title: 'Structured Data & Schema', timeline: 'Week 2-4', description: 'Implement FAQ, HowTo, Article, Product, and Organization schema markup to make your content machine-readable.', visibility: 'AI engines can now read and understand your content structure' },
      { ...PHASE_META[2], title: 'Content Optimization', timeline: 'Week 3-8', description: 'Restructure content with answer paragraphs, heading hierarchy, comparison tables, and topic clusters.', visibility: 'Your content becomes the best possible answer for AI queries' },
      { ...PHASE_META[3], title: 'Technical AEO', timeline: 'Week 4-6', description: 'Configure AI bot access, semantic HTML, RSS feeds, internal linking, and meta optimization.', visibility: 'AI crawlers can access and extract your content efficiently' },
      { ...PHASE_META[4], title: 'Authority & Trust', timeline: 'Week 6-12+', description: 'Build E-E-A-T signals, authority backlinks, Google Business Profile, and citation networks.', visibility: 'AI engines trust your content as a credible, authoritative source' },
      { ...PHASE_META[5], title: 'Testing & Validation', timeline: 'Week 6-8', description: 'Test across ChatGPT, Perplexity, Google AI, and Bing Copilot. Validate schema and crawlability.', visibility: 'Verify you appear across all major AI platforms' },
      { ...PHASE_META[6], title: 'Monitor & Iterate', timeline: 'Week 8+', description: 'Track AI citations, A/B test answer formats, benchmark competitors, and re-optimize monthly.', visibility: 'Continuous improvement — stay visible as AI engines evolve weekly' }
    ], [])

  const PILLARS = useMemo(() => [
      'Structured Data & Schema Markup',
      'Direct Answer Formatting',
      'Entity Authority & E-E-A-T',
      'Multi-Platform Optimization',
      'AI Crawler Accessibility',
      'Content Freshness & Accuracy',
      'Citation Signal Building'
    ], [])

  const FEATURES_OVERVIEW = useMemo(() => [
      { Icon: FEATURE_ICONS[0], title: '99-Point AEO Checklist', description: 'Phase-by-phase tasks covering every aspect of AEO — from schema markup to content structure to AI crawler access.' },
      { Icon: FEATURE_ICONS[1], title: 'Real-Time Site Analyzer', description: 'Enter any URL for an instant 100-point AEO readiness score — no API key needed. Checks schema, AI crawler access, content structure, and more.' },
      { Icon: FEATURE_ICONS[2], title: 'Multi-Engine Testing Lab', description: 'Test how your content appears across ChatGPT, Perplexity, Claude, and Gemini simultaneously.' },
      { Icon: FEATURE_ICONS[3], title: 'AI Content Writer', description: 'Generate AEO-optimized content with structured data and direct answer formatting built in.' },
      { Icon: FEATURE_ICONS[4], title: 'Schema Generator', description: 'Point-and-click markup builder for FAQ, HowTo, Article, and more — no coding required.' },
      { Icon: FEATURE_ICONS[5], title: 'Monitoring & Alerts', description: 'Track AI citation changes over time and get alerts when your visibility shifts.' }
    ], [])

  const FAQ_ITEMS = useMemo(() => [
      { question: 'What is Answer Engine Optimization (AEO)?', answer: 'AEO helps your website get quoted by AI tools. ChatGPT, Perplexity, and Gemini read the web for answers. AEO makes sure they find and cite your site.' },
      { question: 'How is AEO different from traditional SEO?', answer: 'SEO helps you rank on Google. AEO helps AI tools quote you. Both matter, but AEO targets how AI picks its sources.' },
      { question: 'Who is AEO Dashboard built for?', answer: 'Agencies, SEO pros, and marketers. Whether you run one site or a hundred, the tool scales with you.' },
      { question: 'When will AEO Dashboard launch?', answer: 'We\'re in the final build phase. Join the list to hear first. A small group gets early access before launch.' },
      { question: 'What features does AEO Dashboard include?', answer: 'A 99-point checklist. A site scanner. A test lab for AI tools. A content writer, markup builder, and alerts when things change.' },
      { question: 'Do I need technical knowledge to use AEO Dashboard?', answer: 'No. The tool walks you through each step. No coding needed. Each task tells you what to do and why.' },
      { question: 'How does the 99-Point AEO Checklist work?', answer: 'It breaks AEO into 7 steps. Each step has clear tasks with guides. You check them off, and the tool tracks your score.' },
      { question: 'What AI engines does AEO Dashboard support?', answer: 'ChatGPT, Google AI, Gemini, Perplexity, Bing Copilot, and Claude. The test lab checks all of them at once.' },
      { question: 'Is AEO Dashboard free?', answer: 'Early users get full access at no cost. After launch, there will be free and paid plans. Join the list to lock in your spot.' },
      { question: 'Can I use AEO Dashboard for multiple websites?', answer: 'Yes. You can add many sites to one account. Each site gets its own checklist, scores, and alerts.' }
    ], [])

  const FOOTER_LINKS = useMemo(() => [
      { title: 'Product', links: [{ label: 'What is AEO?', href: FOOTER_HREFS[0]?.[0]?.href || '#' }, { label: 'Phases', href: FOOTER_HREFS[0]?.[1]?.href || '#' }, { label: 'Features', href: FOOTER_HREFS[0]?.[2]?.href || '#' }, { label: 'FAQ', href: FOOTER_HREFS[0]?.[3]?.href || '#' }] }
    ], [])

  const EARLY_ACCESS_BENEFITS = useMemo(() => [
      'Full platform access before launch',
      'Direct line to the founding team',
      'Help shape the product with feedback',
      'Free access during the early period'
    ], [])

  const WHY_NOW_STATS = useMemo(() => [
      { value: '40%', label: 'of searches use AI', description: 'Nearly half of all searches now go through AI tools like ChatGPT and Perplexity.' },
      { value: '58%', label: 'of marketers lack an AEO plan', description: 'Most marketing teams have not started optimizing for AI search. Early movers have a clear advantage.' },
      { value: '3x', label: 'more trust from AI citations', description: 'People trust answers from AI more than ads. Being cited builds instant trust.' }
    ], [])

  const HOW_IT_WORKS_STEPS = useMemo(() => [
      { number: 1, title: 'Check Your Score', description: 'Take the free 2-minute quiz. Answer 14 questions about your website.' },
      { number: 2, title: 'See What\'s Broken', description: 'Get your AEO Readiness Score instantly. See your weakest areas and top 3 priorities.' },
      { number: 3, title: 'Join the Waitlist', description: 'Enter your email to save your results and join the early access list.' },
      { number: 4, title: 'Get Early Access', description: 'When we launch, early access members get the full platform first — with tools to fix every gap we found.' }
    ], [])

  const WAITLIST_NOW = useMemo(() => [
      'Full platform access before launch',
      'Direct line to the founding team',
      'Help shape the product with feedback',
      'Free access during the early period'
    ], [])

  const WAITLIST_LAUNCH = useMemo(() => [
      '99-Point AEO Checklist',
      'Real-Time Site Analyzer',
      'Multi-Engine Testing Lab',
      'AI Content Writer',
      'Schema Generator'
    ], [])

  const AUDIENCE_CARDS = useMemo(() => [
      { title: 'Agency Owners', description: 'Offer AEO as a new service. Manage many client sites from one place. Stand out from other agencies.' },
      { title: 'SEO Professionals', description: 'Add AEO to your skill set. Use tools built for the way AI picks sources. Stay ahead of the curve.' },
      { title: 'In-House Marketers', description: 'Make your site visible to AI without a big team. Follow clear steps. See results in weeks.' }
    ], [])

  const queuePosition = count

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

  // Referral system — generate unique referral link after signup
  const referralCode = useMemo(() => {
    if (!submitted) return null
    const email = localStorage.getItem('aeo-waitlist-email')
    return email ? generateReferralCode(email) : null
  }, [submitted])
  const referralLink = useMemo(() => referralCode ? buildReferralLink(referralCode, SITE_URL) : SITE_URL, [referralCode])

  // Check if user came via referral
  useEffect(() => {
    const ref = getReferralFromUrl()
    if (ref) localStorage.setItem('aeo-referred-by', ref)
  }, [])

  // Share handlers
  const shareText = completedResults
    ? `I scored ${completedResults.totalScore}/${MAX_TOTAL_SCORE} on the AEO Readiness Assessment! How AI-ready is YOUR website?`
    : 'I just joined the waitlist for AEO Dashboard — the first platform built for Answer Engine Optimization. Get early access:'
  const shareUrl = referralLink || SITE_URL

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
              {'Check Your Score'}
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
            key={link.href}
            href={link.href}
            className="wl-nav-link"
            onClick={(e) => scrollToSection(e, link.href)}
          >
            {link.label}
          </a>
        ))}
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
          {'Check Your Score'}
        </button>
      </div>

      <main>

        {/* ═══════════ 2. HERO ═══════════ */}
        <section id="hero" className="wl-hero">
          <div className="wl-hero-inner">
            <div className="wl-badge">
              <Sparkles size={14} />
              {'Early Access Waitlist'}
            </div>

            <h1>
              {'AI Answers Questions. '}<span>{'Is It Quoting You?'}</span>
            </h1>

            <p className="wl-hero-sub">
              {'Check your AEO score for free. The full platform is coming soon — join the waitlist to get early access.'}
            </p>

            {completedResults ? (
              <div className="wl-sc-success-inline">
                <p className="wl-sc-success-title">
{`Your AEO Score: ${completedResults.totalScore}/${MAX_TOTAL_SCORE}`}
                </p>
                <p className="wl-sc-success-subtitle">{'Share your score with your team:'}</p>
                <div className="wl-sc-share-row" style={{ marginTop: '0.75rem' }}>
                  <button className="wl-share-btn" onClick={shareTwitter}>
                    <Share2 size={14} />
                    {'Share on X'}
                  </button>
                  <button className="wl-share-btn" onClick={shareLinkedIn}>
                    <Share2 size={14} />
                    {'Share on LinkedIn'}
                  </button>
                  <button className="wl-share-btn" onClick={copyLink}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="wl-queue-position">
                  {`You're #${queuePosition} in line`}
                </p>
                <p className="wl-sc-success-timeline" style={{ fontSize: '0.8125rem', color: 'var(--wl-text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
                  {'We\'ll review your score and reach out to top scorers with early access.'}
                </p>

                {/* Referral Dashboard */}
                {referralCode && (
                  <ReferralDashboard
                    referralCode={referralCode}
                    referralCount={parseInt(localStorage.getItem('aeo-referral-count') || '0', 10)}
                    baseUrl={SITE_URL}
                  />
                )}
              </div>
            ) : (
              <>
                <button
                  className="wl-submit-btn wl-sc-hero-btn"
                  onClick={() => setShowScorecard(true)}
                >
                  {'Get Your Free Score →'}
                </button>
                <p className="wl-hero-counter">
                  {count > 0
                    ? <><strong>{displayCount}</strong>{' professionals have already joined'}</>
                    : 'Join professionals already optimizing for AI'
                  }
                </p>
                <p className="wl-hero-note">{'Free • 2 minutes • Instant results'}</p>
              </>
            )}

          </div>
        </section>

        {/* ═══════════ WHY AEO MATTERS NOW ═══════════ */}
        <section id="why-now" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{'Why Now'}</span>
              <h2 className="wl-section-title">{'Why AEO Matters Right Now'}</h2>
              <p className="wl-section-subtitle wl-centered">{'AI is changing how people find answers. These numbers show why you need to act today.'}</p>
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
              <span className="wl-section-label">{'Education'}</span>
              <h2 className="wl-section-title">{'What is Answer Engine Optimization?'}</h2>
            </div>
            <div className="wl-aeo-content">
              <p className="wl-answer-paragraph">
                <strong>{'AI search engines pick websites to quote.'}</strong>{' AEO helps them pick yours. It\'s the new way to show up when AI gives answers.'}
              </p>

              <h3>{'AEO vs Traditional SEO'}</h3>
              <table className="wl-comparison-table">
                <thead>
                  <tr>
                    <th scope="col">{'Aspect'}</th>
                    <th scope="col">{'Traditional SEO'}</th>
                    <th scope="col">{'AEO'}</th>
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

              <h3>{'The 7 Pillars of AEO'}</h3>
              <ol className="wl-pillars-list">
                {PILLARS.map((p, i) => <li key={i}>{p}</li>)}
              </ol>

            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section id="how-it-works" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{'How It Works'}</span>
              <h2 className="wl-section-title">{'Four Steps to AI Visibility'}</h2>
              <p className="wl-section-subtitle wl-centered">{'Start with a free score. Join the waitlist. Get early access when we launch.'}</p>
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
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                className="wl-submit-btn wl-sc-hero-btn"
                onClick={() => setShowScorecard(true)}
              >
                {'Get Your Free Score →'}
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════ JOIN WAITLIST EXPLAINER ═══════════ */}
        <section id="join-waitlist" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{'Waitlist'}</span>
              <h2 className="wl-section-title">{'The Full Platform Is Coming Soon'}</h2>
              <p className="wl-section-subtitle wl-centered">{'AEO Dashboard is in the final stages of development. Take the free score quiz to join the waitlist — we’ll let you in first when we launch.'}</p>
            </div>
            <div className="wl-waitlist-columns">
              <div className="wl-waitlist-col">
                <h3 className="wl-waitlist-col-heading">{'What You Get Now'}</h3>
                <ul className="wl-waitlist-list">
                  {WAITLIST_NOW.map((item, i) => (
                    <li key={i} className="wl-waitlist-item">
                      <div className="wl-waitlist-check">
                        <Check size={14} style={{ color: '#10B981' }} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="wl-waitlist-col">
                <h3 className="wl-waitlist-col-heading">{'What You Get at Launch'}</h3>
                <ul className="wl-waitlist-list">
                  {WAITLIST_LAUNCH.map((item, i) => (
                    <li key={i} className="wl-waitlist-item">
                      <div className="wl-waitlist-check">
                        <Check size={14} style={{ color: '#10B981' }} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button
                className="wl-submit-btn wl-sc-hero-btn"
                onClick={() => setShowScorecard(true)}
              >
                {'Check Your Score & Join Waitlist →'}
              </button>
              <p className="wl-waitlist-note">{'Free forever during early access. No credit card needed.'}</p>
            </div>
          </div>
        </section>

        {/* ═══════════ PHASES ═══════════ */}
        <section id="phases" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{'The Journey'}</span>
              <h2 className="wl-section-title">{'Your Path to AI Visibility'}</h2>
              <p className="wl-section-subtitle wl-centered">{'7 phases that take you from invisible to cited. Each phase builds on the last — here’s what to expect.'}</p>
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
              {'The '}<strong>{'99-point checklist'}</strong>{' guides you through every task in every phase.'}
            </p>
          </div>
        </section>

        {/* ═══════════ 5. FEATURES OVERVIEW ═══════════ */}
        <section id="features" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{'What You Get'}</span>
              <h2 className="wl-section-title">{'Built for AEO from the Ground Up'}</h2>
              <p className="wl-section-subtitle wl-centered">{'Find what\'s broken. Fix it. Track the results. One tool.'}</p>
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
              <span className="wl-section-label">{'Who It\'s For'}</span>
              <h2 className="wl-section-title">{'Built for People Who Care About Traffic'}</h2>
              <p className="wl-section-subtitle wl-centered">{'If you rely on search traffic, AEO is your next move.'}</p>
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
              <span className="wl-section-label">{'AI Costs'}</span>
              <h2 className="wl-section-title">{'AI-Powered for Under $3'}</h2>
              <p className="wl-section-subtitle wl-centered">{'Connect your own API key — no markup, no hidden fees. Full project optimization costs less than a cup of coffee.'}</p>
            </div>

            <div className="wl-cost-highlight">
              <div className="wl-cost-price">{'$2–3'}</div>
              <p className="wl-cost-price-label">{'Total for a full project'}</p>
              <p className="wl-cost-description">{'Complete all 99 checklist items using every AI feature — Content Writer, Analyzer, Schema Generator, and more — for approximately $2–3 in total API costs.'}</p>
            </div>

            <div className="wl-cost-grid">
              <div className="wl-cost-card">
                <div className="wl-cost-card-value">{'$0.01–0.05'}</div>
                <div className="wl-cost-card-label">{'Per AI feature use'}</div>
                <p className="wl-cost-card-desc">{'Each AI action costs pennies — from content scoring to schema generation.'}</p>
              </div>
              <div className="wl-cost-card">
                <div className="wl-cost-card-value">{'~$2–3'}</div>
                <div className="wl-cost-card-label">{'Full project completion'}</div>
                <p className="wl-cost-card-desc">{'Run every AI feature across all 99 checklist items for one website.'}</p>
              </div>
              <div className="wl-cost-card">
                <div className="wl-cost-card-value">{'~$0.30–0.50'}</div>
                <div className="wl-cost-card-label">{'Ongoing monthly cost'}</div>
                <p className="wl-cost-card-desc">{'Monitoring, rescoring, and occasional AI usage after initial setup.'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 7. FAQ ═══════════ */}
        <section id="faq" className="wl-section" data-animate>
          <div className="wl-section-inner">
            <div className="wl-section-center">
              <span className="wl-section-label">{'FAQ'}</span>
              <h2 className="wl-section-title">{'Frequently Asked Questions'}</h2>
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
          <h2>{'Want Early Access?'}</h2>
          <p>
            {'Before we launch, we’re giving a select group of early supporters access to the full platform. Join the waitlist for a chance to be one of the first to try AEO Dashboard — and help shape the product with your feedback.'}
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
            {'Get Your Free Score →'}
          </button>

          <p className="wl-early-note" style={{ marginTop: '1.5rem' }}>
            {'We’ll select ~'}<strong>{'10'}</strong>{' early access users from the waitlist and reach out personally.'}
          </p>
        </section>

      </main>

      {/* ═══════════ 8. FOOTER ═══════════ */}
      <footer className="wl-footer">
        <div className="wl-footer-inner">
          <div className="wl-footer-brand">
            <span className="wl-footer-brand-logo">
              <span className="wl-nav-logo-accent">AEO</span>&nbsp;Dashboard
            </span>
            <p>{'The complete toolkit for Answer Engine Optimization.'}</p>
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
          <p>{`© ${new Date().getFullYear()} AEO Dashboard. All rights reserved.`}</p>
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
            <h2>{alreadySignedUp ? 'Already submitted!' : 'You\'re being considered!'}</h2>
            <p>
              {alreadySignedUp
                ? 'We already have your email. You\'ll hear from us about early access.'
                : 'We\'ll review your submission and notify you about early access.'}
            </p>
            <p className="wl-success-position">
              {`#${count.toLocaleString()} on the waitlist`}
            </p>
            <p className="wl-queue-position">
              {`You're #${queuePosition} in line`}
            </p>

            <div className="wl-share-row">
              <button className="wl-share-btn" onClick={shareTwitter}>
                <Share2 size={14} />
                {'Share on X'}
              </button>
              <button className="wl-share-btn" onClick={shareLinkedIn}>
                <Share2 size={14} />
                {'LinkedIn'}
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
              {'Close'}
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
