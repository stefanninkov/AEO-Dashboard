import { useState, useEffect, useRef, useMemo } from 'react'
import { useWaitlist } from '../hooks/useWaitlist'
import { Check, Share2, Copy, Loader, Zap, ChevronDown } from 'lucide-react'
import './LandingPage.css'
import './WaitlistPage.css'

/* ═══════════════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Phases', href: '#phases' },
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
    question: 'Is there a free trial available?',
    answer: 'Yes! All plans include a 14-day free trial with full access to every feature. Start risk-free \u2014 no credit card required during the trial period.',
  },
]

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'Phases', href: '#phases' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'What is AEO?', href: '#what-is-aeo' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
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

const EARLY_ACCESS_BENEFITS = [
  'Full platform access before launch',
  'Direct line to the founding team',
  'Help shape the product with feedback',
  'Free access during the early period',
]

const BASE_PATH = import.meta.env.BASE_URL || '/AEO-Dashboard/'
const SITE_URL = `https://stefanninkov.github.io${BASE_PATH}`

/* ═══════════════════════════════════════════════════════════════
   FEATURE MOCKUP RENDERER
   ═══════════════════════════════════════════════════════════════ */

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
                width: 16, height: 16, borderRadius: 4,
                border: item.checked ? 'none' : '1.5px solid var(--lp-text-tertiary)',
                backgroundColor: item.checked ? 'var(--lp-accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
            width: 120, height: 120, borderRadius: '50%',
            border: '6px solid var(--lp-border)',
            borderTopColor: 'var(--lp-accent)', borderRightColor: 'var(--lp-accent)', borderBottomColor: '#F59E0B',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', position: 'relative',
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
            backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--lp-border)',
            borderRadius: 'var(--lp-radius)', padding: '1rem',
          }}>
            <div style={{ fontFamily: 'var(--lp-font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-primary)', marginBottom: '0.5rem' }}>{engine.name}</div>
            <div style={{
              display: 'inline-block', fontSize: '0.625rem', fontWeight: 600,
              padding: '0.125rem 0.5rem', borderRadius: '100px',
              color: engine.statusColor, backgroundColor: engine.statusBg,
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
          cssSelector: ['#hero', '#what-is-aeo', '#how-it-works', '#faq'],
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

  // Scroll animations (using LP pattern with data-animate / lp-visible)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      const elements = rootRef.current?.querySelectorAll('[data-animate]')
      if (elements) elements.forEach((el) => el.classList.add('lp-visible'))
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
  const shareText = 'I just joined the waitlist for AEO Dashboard \u2014 the first platform built for Answer Engine Optimization. Get early access:'
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

      {/* ═══════════ 1. NAV ═══════════ */}
      <header className={`lp-nav ${navSolid ? 'lp-nav-solid' : ''}`}>
        <nav className="lp-nav-inner" aria-label="Main navigation">
          <span className="lp-nav-logo" style={{ cursor: 'default' }}>
            <span className="lp-nav-logo-accent">AEO</span>&nbsp;Dashboard
          </span>

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
            <button
              className="lp-nav-cta"
              onClick={(e) => scrollToSection(e, '#hero')}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Join Waitlist
            </button>
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
        <button
          className="lp-nav-cta"
          onClick={(e) => scrollToSection(e, '#hero')}
          style={{ border: 'none', cursor: 'pointer' }}
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

        {/* ═══════════ 5. WHAT IS AEO? ═══════════ */}
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
            <ol className="lp-pillars-list">
              {PILLARS.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══════════ 6. THE 7 PHASES ═══════════ */}
        <section id="phases" className="lp-section" aria-label="AEO Phases" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">The Journey</span>
            <h2 className="lp-section-title">Your Path to AI Visibility</h2>
            <p className="lp-section-subtitle">7 phases that take you from invisible to cited. Each phase builds on the last &mdash; here&rsquo;s what to expect.</p>
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
            The <strong>88-point checklist</strong> guides you through every task in every phase.
          </p>
        </section>

        {/* ═══════════ 7. FEATURES (Big alternating rows) ═══════════ */}
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

        {/* ═══════════ 8. FEATURES GRID ═══════════ */}
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

        {/* ═══════════ 9. HOW IT WORKS ═══════════ */}
        <section id="how-it-works" className="lp-section" aria-label="How it works" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">How It Works</span>
            <h2 className="lp-section-title">Three Steps to AI Visibility</h2>
            <p className="lp-section-subtitle">
              <strong>To optimize for AI search engines, start by auditing your current visibility, then systematically implement AEO best practices, and continuously test across multiple AI platforms.</strong>
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

        {/* ═══════════ 12. EARLY ACCESS + FINAL CTA ═══════════ */}
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
                  <Check size={12} style={{ color: 'var(--lp-accent)' }} />
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

      {/* ═══════════ 13. FOOTER ═══════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-footer-brand-logo" style={{ cursor: 'default' }}>
              <span className="lp-nav-logo-accent">AEO</span>&nbsp;Dashboard
            </span>
            <p>The complete toolkit for Answer Engine Optimization.</p>
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
