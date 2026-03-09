import { useState, useEffect, useRef, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { SearchCheck, BotMessageSquare, TrendingDown, BarChart4, FileEdit, Blocks, Radar, Link2, Smartphone, Mail, Globe2, Sun, Moon, Play, Building2, Rocket, ShoppingBag, Server, Newspaper, Users, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import './LandingPage.css'

/* ═══════════════════════════════════════════════════════════════
   NON-TRANSLATABLE DATA CONSTANTS (icons, colors, hrefs, booleans, numbers)
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINK_HREFS = ['#features', '#how-it-works', '#pricing', '#faq']

const PROBLEM_META = [
  { Icon: SearchCheck, color: 'var(--accent)' },
  { Icon: BotMessageSquare, color: 'var(--color-phase-2)' },
  { Icon: TrendingDown, color: 'var(--color-phase-3)' },
]

const FEATURE_BIG_META = [
  { mockupType: 'checklist' },
  { mockupType: 'analyzer' },
  { mockupType: 'testing' },
]

const FEATURE_GRID_ICONS = [BarChart4, FileEdit, Blocks, Radar, Link2, Smartphone, Mail, Globe2]

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

const SOCIAL_PROOF_ICONS = [Rocket, Building2, ShoppingBag, Server, Newspaper, Users]
const SOCIAL_PROOF_LIVE_USER_BASE = 148

const CASE_STUDY_META = [
  { accentColor: '#2563EB' },
  { accentColor: '#10B981' },
  { accentColor: '#F59E0B' },
]

const COMPARISON_FEATURE_COUNT = 8

const BASE_URL = 'https://stefanninkov.github.io/AEO-Dashboard/'

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navSolid, setNavSolid] = useState(false)
  const [pricingPeriod, setPricingPeriod] = useState('quarterly')
  const [openFaq, setOpenFaq] = useState(null)

  const [liveUserCount, setLiveUserCount] = useState(SOCIAL_PROOF_LIVE_USER_BASE)

  const { resolvedTheme, toggleTheme } = useTheme()
  const rootRef = useRef(null)

  /* --- Translated data arrays via useMemo --- */

  const NAV_LINKS = useMemo(() =>
    NAV_LINK_HREFS.map((href, i) => ({
      label: ['Features', 'How it Works', 'Pricing', 'FAQ'][i] || '',
      href,
    })), [])

  const PLATFORMS = useMemo(() => ['ChatGPT', 'Perplexity', 'Google AI', 'Bing Copilot', 'Claude'], [])

  const PROBLEMS = useMemo(() => [
      { ...PROBLEM_META[0], title: 'AI Search Is Replacing Google', description: 'Over 40% of Gen Z uses TikTok and ChatGPT instead of Google. Traditional SEO alone no longer guarantees visibility.' },
      { ...PROBLEM_META[1], title: 'AI Answers Cite Few Sources', description: 'ChatGPT and Perplexity only cite 3-5 sources per answer. If you\'re not optimized, your clients are invisible to AI.' },
      { ...PROBLEM_META[2], title: 'Zero-Click Is the New Normal', description: 'AI Overviews and direct answers mean users never visit your site. You need to be THE answer, not just a result.' }
    ], [])

  const AEO_VS_SEO = useMemo(() => [
      { aspect: 'Primary Goal', seo: 'Rank in search results', aeo: 'Be cited in AI answers' },
      { aspect: 'Key Metric', seo: 'Position & click-through rate', aeo: 'Citation frequency & accuracy' },
      { aspect: 'Content Format', seo: 'Keywords & backlinks', aeo: 'Structured data & direct answers' },
      { aspect: 'Target System', seo: 'Google, Bing crawlers', aeo: 'LLMs, RAG pipelines, AI agents' },
      { aspect: 'Optimization', seo: 'Meta tags & page speed', aeo: 'Schema markup & entity clarity' },
      { aspect: 'Time Horizon', seo: 'Weeks to months', aeo: 'Days to weeks (re-indexed by AI)' }
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

  const FEATURES_BIG = useMemo(() => [
      { ...FEATURE_BIG_META[0], badge: 'Core Feature', title: '99-Point AEO Checklist', description: 'A comprehensive, phase-by-phase checklist covering every aspect of Answer Engine Optimization. From schema markup to content structure, entity optimization to AI crawler access — track every task across 7 phases with built-in progress analytics.', answerParagraph: 'An AEO checklist is a structured task list that guides website owners through every optimization needed to appear in AI-generated answers. It covers schema markup implementation, content restructuring for direct answers, entity authority building, and technical configurations that help AI crawlers understand and cite your content.' },
      { ...FEATURE_BIG_META[1], badge: 'Deterministic + AI', title: 'Real-Time Site Analyzer', description: 'Enter any URL for an instant 100-point AEO readiness score — no API key needed. The deterministic engine crawls your HTML, checks 10 AI crawlers in robots.txt, analyzes your sitemap, and scores across 5 categories. Optionally layer on AI analysis for deeper recommendations.' },
      { ...FEATURE_BIG_META[2], badge: 'Multi-Engine', title: 'AI Search Testing Lab', description: 'Test how your content appears across ChatGPT, Perplexity, Claude, and Gemini simultaneously. See which AI engines cite your site, compare responses, and identify gaps in your AI visibility across every major platform.' }
    ], [])

  const FEATURES_GRID = useMemo(() => [
      { Icon: FEATURE_GRID_ICONS[0], title: 'Dashboard Analytics', description: 'AEO health score, phase radar, velocity tracking, and trend analysis.' },
      { Icon: FEATURE_GRID_ICONS[1], title: 'AI Content Writer', description: 'Generate AEO-optimized content with schema markup built in.' },
      { Icon: FEATURE_GRID_ICONS[2], title: 'Schema Generator', description: 'Point-and-click schema markup builder for FAQ, HowTo, and more.' },
      { Icon: FEATURE_GRID_ICONS[3], title: 'Auto-Monitoring', description: 'Track AI citation changes and get alerts when visibility shifts.' },
      { Icon: FEATURE_GRID_ICONS[4], title: 'Client Portal', description: 'Share branded, read-only dashboards with clients via secure links.' },
      { Icon: FEATURE_GRID_ICONS[5], title: 'PWA & Offline', description: 'Install as a native app. Works offline with full functionality.' },
      { Icon: FEATURE_GRID_ICONS[6], title: 'Email Digests', description: 'Weekly progress reports delivered straight to your inbox.' },
      { Icon: FEATURE_GRID_ICONS[7], title: 'Webflow Integration', description: 'Deep CMS integration for headless Webflow site optimization.' }
    ], [])

  const STEPS = useMemo(() => [
      { title: 'Audit Your Site', description: 'Run the real-time analyzer on any URL. Get an instant 100-point AEO score checking schema, AI crawlers, content structure, and technical signals — no API key required.' },
      { title: 'Optimize with the Checklist', description: 'Work through the 99-point checklist across 7 phases. Each task includes guidance on implementation, and your progress syncs across devices in real-time.' },
      { title: 'Test & Monitor', description: 'Test your content across ChatGPT, Perplexity, Claude, and Gemini. Monitor citation changes over time and prove ROI to your clients with branded reports.' }
    ], [])

  const PRICING = useMemo(() => [
      { ...PRICING_META[0], name: 'Starter', description: 'For individuals starting with AEO', cta: 'Start 14-Day Free Trial', features: ['1 project', 'Phase 1-2 checklist', '5 analyzer scans/mo', 'Basic schema generator', 'Dashboard analytics', 'Email digest (weekly)'] },
      { ...PRICING_META[1], name: 'Professional', description: 'For agencies & SEO professionals', cta: 'Start 14-Day Free Trial', features: ['10 projects', 'All 7 checklist phases', 'Unlimited analyzer scans', 'AI content writer', 'Multi-engine testing lab', 'Schema generator (all types)', 'Client portal (shareable)', 'Auto-monitoring & alerts', 'CSV & PDF exports', 'Priority support'] },
      { ...PRICING_META[2], name: 'Enterprise', description: 'For teams & large agencies', cta: 'Start 14-Day Free Trial', features: ['Unlimited projects', 'Everything in Professional', 'White-label client portal', 'API access', 'Auto-monitoring & alerts', 'Team collaboration & roles', 'Custom onboarding', 'Dedicated account manager'] }
    ], [])

  const TESTIMONIALS = useMemo(() => [
      { avatar: TESTIMONIAL_AVATARS[0], text: 'We went from zero AI citations to appearing in 60% of relevant ChatGPT answers within 3 weeks. The checklist alone is worth 10x the price.', name: 'Sarah Chen', role: 'Head of SEO, DigitalFirst Agency' },
      { avatar: TESTIMONIAL_AVATARS[1], text: 'The client portal changed our workflow completely. Clients can see their AEO progress in real-time without us creating manual reports every week.', name: 'Marcus Rodriguez', role: 'Founder, SearchWave Marketing' },
      { avatar: TESTIMONIAL_AVATARS[2], text: 'Finally, a tool that treats AI search as a first-class channel. The multi-engine testing lab showed us exactly where we were missing citations.', name: 'Emily Park', role: 'SEO Director, GrowthLab' },
      { avatar: TESTIMONIAL_AVATARS[3], text: 'The schema generator alone saved us 20+ hours per client. Combined with the analyzer, it\'s the most complete AEO toolkit available.', name: 'James Mitchell', role: 'Technical SEO Lead, Apex Digital' }
    ], [])

  const FAQ_ITEMS = useMemo(() => [
      { question: 'What is Answer Engine Optimization (AEO)?', answer: 'Answer Engine Optimization is the practice of optimizing website content to be cited by AI-powered answer engines like ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. Unlike traditional SEO which targets search rankings, AEO focuses on structured data, direct answer formatting, and entity authority to ensure AI systems reference your content. AEO encompasses GEO (Generative Engine Optimization), a research-validated approach from Princeton and Georgia Tech that provides experimentally proven techniques for maximizing AI citation probability.' },
      { question: 'How is AEO different from traditional SEO?', answer: 'While SEO optimizes for search engine rankings and click-through rates, AEO optimizes for AI citation and inclusion in generated answers. AEO emphasizes schema markup, concise answer formatting, entity clarity, and E-E-A-T signals that help large language models identify and cite authoritative sources.' },
      { question: 'Which AI platforms does AEO Dashboard support?', answer: 'AEO Dashboard supports testing and optimization across ChatGPT, Perplexity, Google AI Overviews (Gemini), Bing Copilot, Claude, and other major AI answer engines. The multi-engine testing lab lets you compare how your content appears across all platforms simultaneously.' },
      { question: 'How long does it take to see results from AEO?', answer: 'Most users see measurable improvements in AI citations within 2-4 weeks of implementing the checklist recommendations. Schema markup changes are typically picked up by AI crawlers within days, while content structure improvements may take 1-2 weeks to be reflected in AI-generated answers.' },
      { question: 'Can I use AEO Dashboard for client work?', answer: 'Absolutely. AEO Dashboard is built for agencies and SEO professionals managing multiple clients. The Professional plan includes client portals with branded, shareable dashboards, and the Enterprise plan offers white-label capabilities for a fully branded experience.' },
      { question: 'What does the 99-point checklist cover?', answer: 'The checklist spans 7 phases of AEO optimization: technical foundation, schema markup, content structure, entity optimization, multi-platform targeting, AI crawler access, and ongoing monitoring. It integrates GEO (Generative Engine Optimization) techniques throughout — research-validated methods for maximizing AI citation probability. Each task includes implementation guidance and tracks completion across your entire team.' },
      { question: 'Do I need technical skills to use AEO Dashboard?', answer: 'No. AEO Dashboard is designed for both technical and non-technical users. The checklist provides step-by-step guidance, the AI content writer generates optimized content automatically, and the schema generator creates markup through a visual interface — no coding required.' },
      { question: 'Is there a free trial available?', answer: 'Yes! All plans include a 14-day free trial with full access to every feature. Start risk-free — no credit card required during the trial period.' }
    ], [])

  const FOOTER_LINKS = useMemo(() => [
      { title: 'Product', links: [{ label: 'Features', href: FOOTER_LINK_HREFS[0]?.[0]?.href || '#' }, { label: 'Pricing', href: FOOTER_LINK_HREFS[0]?.[1]?.href || '#' }, { label: 'Checklist', href: FOOTER_LINK_HREFS[0]?.[2]?.href || '#' }, { label: 'Analyzer', href: FOOTER_LINK_HREFS[0]?.[3]?.href || '#' }] },
      { title: 'Resources', links: [{ label: 'What is AEO?', href: FOOTER_LINK_HREFS[1]?.[0]?.href || '#' }, { label: 'FAQ', href: FOOTER_LINK_HREFS[1]?.[1]?.href || '#' }, { label: 'Documentation', href: FOOTER_LINK_HREFS[1]?.[2]?.href || '#' }, { label: 'API Reference', href: FOOTER_LINK_HREFS[1]?.[3]?.href || '#' }] },
      { title: 'Company', links: [{ label: 'About', href: FOOTER_LINK_HREFS[2]?.[0]?.href || '#' }, { label: 'Blog', href: FOOTER_LINK_HREFS[2]?.[1]?.href || '#' }, { label: 'Contact', href: FOOTER_LINK_HREFS[2]?.[2]?.href || '#' }, { label: 'Privacy Policy', href: FOOTER_LINK_HREFS[2]?.[3]?.href || '#' }] }
    ], [])

  const CHECKLIST_ITEMS = useMemo(() => {
    const labels = ['Implement FAQ Schema', 'Add HowTo Markup', 'Optimize Meta Descriptions', 'Structure Headings for AI', 'Add Speakable Schema', 'Configure AI Crawlers']
    return CHECKLIST_ITEM_META.map((meta, i) => ({
      ...meta,
      label: labels[i] || '',
    }))
  }, [])

  const ANALYZER_METRICS = useMemo(() => {
    const labels = ['Schema Coverage', 'Content Structure', 'AI Crawlability', 'Entity Clarity', 'Technical Score']
    return ANALYZER_METRIC_META.map((meta, i) => ({
      ...meta,
      label: labels[i] || '',
    }))
  }, [])

  const TESTING_ENGINES = useMemo(() => {
    const engines = [
      { name: 'ChatGPT', status: 'Cited' },
      { name: 'Perplexity', status: 'Cited' },
      { name: 'Gemini', status: 'Not Cited' },
      { name: 'Claude', status: 'Partial' },
    ]
    return TESTING_ENGINE_META.map((meta, i) => ({
      ...meta,
      name: engines[i]?.name || '',
      status: engines[i]?.status || '',
    }))
  }, [])

  const MOCKUP_SIDEBAR_ITEMS = useMemo(() => {
    const labels = ['Dashboard', 'Checklist', 'Analyzer', 'Writer', 'Schema', 'Monitoring']
    return MOCKUP_SIDEBAR_ACTIVE.map((active, i) => ({
      label: labels[i] || '',
      active,
    }))
  }, [])

  const SOCIAL_PROOF_COMPANIES = useMemo(() =>
    SOCIAL_PROOF_ICONS.map((Icon, i) => ({
      Icon,
      name: ['TechCorp', 'MediaHub', 'DataSync', 'CloudBase', 'NetFlow'][i] || '',
    })), [])

  const CASE_STUDIES = useMemo(() => {
    const studies = [
      { company: 'DigitalFirst Agency', industry: 'Marketing Agency', metric: '+340%', metricLabel: 'AI Citations', quote: 'We went from zero AI citations to appearing in 60% of relevant ChatGPT answers within 3 weeks.', author: 'Sarah Chen', role: 'Head of SEO' },
      { company: 'GrowthLab', industry: 'SaaS', metric: '+180%', metricLabel: 'Organic Traffic', quote: 'The multi-engine testing lab showed us exactly where we were missing citations across all AI platforms.', author: 'Emily Park', role: 'SEO Director' },
      { company: 'Apex Digital', industry: 'E-Commerce', metric: '20hrs', metricLabel: 'Saved Per Client', quote: 'The schema generator alone saved us 20+ hours per client. The most complete AEO toolkit available.', author: 'James Mitchell', role: 'Technical SEO Lead' },
    ]
    return CASE_STUDY_META.map((meta, i) => ({
      ...meta,
      ...studies[i],
    }))
  }, [])

  const COMPARISON_FEATURES = useMemo(() => [
      { feature: 'AEO Checklist', aeoDashboard: '99 points', manualTools: 'DIY research', traditionalPlatforms: 'Not available' },
      { feature: 'Site Analyzer', aeoDashboard: 'Real-time', manualTools: 'Manual audit', traditionalPlatforms: 'SEO only' },
      { feature: 'AI Testing', aeoDashboard: 'Multi-engine', manualTools: 'Manual queries', traditionalPlatforms: 'Not available' },
      { feature: 'Schema Generator', aeoDashboard: 'All types', manualTools: 'Hand-coded', traditionalPlatforms: 'Basic' },
      { feature: 'Client Portal', aeoDashboard: 'Branded', manualTools: 'Not available', traditionalPlatforms: 'Generic' },
      { feature: 'Monitoring', aeoDashboard: 'Auto alerts', manualTools: 'Manual', traditionalPlatforms: 'SEO metrics only' },
    ], [])

  /* --- Feature Mockup Renderer --- */

  function renderFeatureMockup(type) {
    if (type === 'checklist') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '0.0625rem solid var(--lp-border)' }}>
            <span style={{ fontFamily: 'var(--lp-font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>{'Phase 2: Schema Markup'}</span>
            <span style={{ fontSize: '0.625rem', padding: '0.2rem 0.625rem', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', borderRadius: '6.25rem', fontWeight: 600 }}>{'50% Complete'}</span>
          </div>
          {CHECKLIST_ITEMS.map((item, i) => (
            <div key={i} className="lp-feature-visual-row">
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: item.checked ? 'none' : '0.0938rem solid var(--lp-text-tertiary)',
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
              border: '0.375rem solid var(--lp-border)',
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
              <span style={{ fontSize: '0.625rem', color: 'var(--lp-text-tertiary)', marginTop: '-0.25rem' }}>{'AEO Score'}</span>
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
              border: '0.0625rem solid var(--lp-border)',
              borderRadius: 'var(--lp-radius)',
              padding: '1rem',
            }}>
              <div style={{ fontFamily: 'var(--lp-font-heading)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lp-text-primary)', marginBottom: '0.5rem' }}>{engine.name}</div>
              <div style={{
                display: 'inline-block',
                fontSize: '0.625rem',
                fontWeight: 600,
                padding: '0.125rem 0.5rem',
                borderRadius: '6.25rem',
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
        description: 'The complete toolkit for Answer Engine Optimization. Optimize your website to be cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot.',
        logo: `${BASE_URL}logo.png`,
      },
      {
        '@type': 'WebPage',
        name: 'AEO Dashboard - Optimize Your Website for AI Search Engines',
        url: BASE_URL,
        description: 'Get your clients cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. The complete AEO toolkit with a 99-point checklist, AI-powered analyzer, and client-ready reports.',
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
  }), [PRICING, FAQ_ITEMS, STEPS])

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

  /* --- Effect: Live user count simulation --- */
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUserCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2
        return Math.max(SOCIAL_PROOF_LIVE_USER_BASE - 20, Math.min(SOCIAL_PROOF_LIVE_USER_BASE + 30, prev + delta))
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

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
            <button
              className="lp-theme-toggle"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="/AEO-Dashboard/app" className="lp-nav-cta">{'Get Started'}</a>
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
            key={link.href}
            href={link.href}
            className="lp-nav-link"
            onClick={(e) => scrollToSection(e, link.href)}
          >
            {link.label}
          </a>
        ))}
        <button
          className="lp-theme-toggle"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <a href="/AEO-Dashboard/app" className="lp-nav-cta">{'Get Started'}</a>
      </div>

      <main>

        {/* ═══════════ 2. HERO ═══════════ */}
        <section id="hero" className="lp-hero" aria-label="Hero">
          <div className="lp-hero-inner">
            <div className="lp-badge">{'Built for Agencies & SEO Teams'}</div>
            <h1>{'Optimize Your Website for '}<span>{'AI Search Engines'}</span></h1>
            <p className="lp-hero-sub">
              {'Get your clients cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. The complete AEO toolkit with a 99-point checklist, AI-powered analyzer, and client-ready reports.'}
            </p>
            <div className="lp-hero-ctas">
              <a href="/AEO-Dashboard/app" className="lp-btn-primary">{'Start 14-Day Free Trial'}</a>
              <a href="#features" className="lp-btn-secondary" onClick={(e) => scrollToSection(e, '#features')}>{'See Features'}</a>
            </div>

            {/* CSS-only dashboard mockup */}
            <div className="lp-mockup" aria-hidden="true">
              <div className="lp-mockup-inner">
                <div className="lp-mockup-sidebar">
                  <div className="lp-mockup-sidebar-logo">
                    <span style={{ color: 'var(--lp-accent)' }}>AEO</span> {'Dash'}
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
                    <div className="lp-mockup-header-title">{'AEO Dashboard'}</div>
                    <div className="lp-mockup-header-badge">{'On Track'}</div>
                  </div>
                  <div className="lp-mockup-stats">
                    {[
                      { label: 'AEO Score', value: '78', colorClass: 'lp-orange' },
                      { label: 'Tasks Done', value: '61/99', colorClass: '' },
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
          <div className="lp-platform-item" style={{ color: 'var(--lp-text-tertiary)', fontSize: '0.8125rem', fontWeight: 400 }}>{'Optimize for every major AI platform'}</div>
          {PLATFORMS.map((p) => (
            <div key={p} className="lp-platform-item">{p}</div>
          ))}
        </section>

        {/* ═══════════ 3.5. SOCIAL PROOF ═══════════ */}
        <section className="lp-social-proof" aria-label="Social proof" data-animate>
          <div className="lp-social-proof-inner">
            <p className="lp-social-proof-headline">{'Trusted by 2,500+ SEO professionals worldwide'}</p>
            <div className="lp-social-proof-logos">
              {SOCIAL_PROOF_COMPANIES.map((company, i) => (
                <div key={i} className="lp-social-proof-logo-item">
                  <company.Icon size={20} />
                  <span>{company.name}</span>
                </div>
              ))}
            </div>
            <div className="lp-social-proof-live">
              <span className="lp-social-proof-live-dot" />
              <span>{`${liveUserCount} users optimizing right now`}</span>
            </div>
          </div>
        </section>

        {/* ═══════════ 4. PROBLEM ═══════════ */}
        <section id="problem" className="lp-section" aria-label="The problem" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{'The Problem'}</span>
            <h2 className="lp-section-title">{'Your Clients Are Invisible to AI'}</h2>
            <p className="lp-section-subtitle">{'Traditional SEO isn’t enough anymore. AI answer engines are changing how people find information — and most websites aren’t optimized for it.'}</p>
          </div>
          <div className="lp-problem-grid">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="lp-problem-card" data-animate>
                <div className="lp-problem-icon" style={{ background: p.color + '18', color: p.color }}>
                  <p.Icon size={20} />
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
            <span className="lp-section-label">{'Education'}</span>
            <h2 className="lp-section-title">{'What is Answer Engine Optimization?'}</h2>
          </div>
          <div className="lp-aeo-content">
            <p className="lp-answer-paragraph">
              <strong>Answer Engine Optimization (AEO) is the practice of optimizing website content to be selected, cited, and surfaced by AI-powered answer engines.</strong> Unlike traditional SEO that targets search engine result pages, AEO focuses on making your content the preferred source that large language models like ChatGPT, Perplexity, and Google Gemini reference when generating answers to user queries.
            </p>

            <h3>{'AEO vs Traditional SEO'}</h3>
            <p className="lp-answer-paragraph">
              <strong>While SEO and AEO share common foundations, they differ in target systems, success metrics, and optimization techniques.</strong> SEO optimizes for crawlers and ranking algorithms; AEO optimizes for language models and retrieval-augmented generation (RAG) pipelines. The most effective digital strategies now combine both approaches to maximize visibility across traditional and AI-powered search.
            </p>
            <table className="lp-comparison-table">
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
            <span className="lp-section-label">{'Features'}</span>
            <h2 className="lp-section-title">{'Everything You Need for AEO'}</h2>
            <p className="lp-section-subtitle">{'A complete toolkit to optimize, test, and monitor your AI search visibility.'}</p>
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
            <h2 className="lp-section-title">{'And So Much More'}</h2>
          </div>
          <div className="lp-features-grid">
            {FEATURES_GRID.map((f, i) => (
              <article key={i} className="lp-feature-grid-card" data-animate>
                <div className="lp-feature-grid-icon"><f.Icon size={18} /></div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════ 7.5. CASE STUDIES ═══════════ */}
        <section id="case-studies" className="lp-section" aria-label="Case studies" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{'Success Stories'}</span>
            <h2 className="lp-section-title">{'Real Results from Real Teams'}</h2>
            <p className="lp-section-subtitle">{'See how agencies and SEO teams are using AEO Dashboard to dominate AI search results.'}</p>
          </div>
          <div className="lp-case-studies-grid">
            {CASE_STUDIES.map((cs, i) => (
              <article key={i} className="lp-case-study-card" data-animate>
                <div className="lp-case-study-header">
                  <span className="lp-case-study-industry">{cs.industry}</span>
                  <h3 className="lp-case-study-company">{cs.company}</h3>
                </div>
                <div className="lp-case-study-metric" style={{ color: cs.accentColor }}>
                  <span className="lp-case-study-metric-value">{cs.metric}</span>
                  <span className="lp-case-study-metric-label">{cs.metricLabel}</span>
                </div>
                <blockquote className="lp-case-study-quote">
                  &ldquo;{cs.quote}&rdquo;
                </blockquote>
                <div className="lp-case-study-author">
                  <span className="lp-case-study-author-name">{cs.author}</span>
                  <span className="lp-case-study-author-role">{cs.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════ 8. AI COST HIGHLIGHT ═══════════ */}
        <section id="ai-cost" className="lp-section" aria-label="AI costs" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{'AI Costs'}</span>
            <h2 className="lp-section-title">{'AI-Powered for Under $3'}</h2>
            <p className="lp-section-subtitle">{'Connect your own API key — no markup, no hidden fees. Full project optimization costs less than a cup of coffee.'}</p>
          </div>

          <div className="lp-cost-highlight">
            <div className="lp-cost-price">{'$2–3'}</div>
            <p className="lp-cost-price-label">{'Total for a full project'}</p>
            <p className="lp-cost-description">{'Complete all 99 checklist items using every AI feature — Content Writer, Analyzer, Schema Generator, and more — for approximately $2–3 in total API costs.'}</p>
          </div>

          <div className="lp-cost-grid">
            <div className="lp-cost-card">
              <div className="lp-cost-card-value">{'$0.01–0.05'}</div>
              <div className="lp-cost-card-label">{'Per AI feature use'}</div>
              <p className="lp-cost-card-desc">{'Each AI action costs pennies — from content scoring to schema generation.'}</p>
            </div>
            <div className="lp-cost-card">
              <div className="lp-cost-card-value">{'~$2–3'}</div>
              <div className="lp-cost-card-label">{'Full project completion'}</div>
              <p className="lp-cost-card-desc">{'Run every AI feature across all 99 checklist items for one website.'}</p>
            </div>
            <div className="lp-cost-card">
              <div className="lp-cost-card-value">{'~$0.30–0.50'}</div>
              <div className="lp-cost-card-label">{'Ongoing monthly cost'}</div>
              <p className="lp-cost-card-desc">{'Monitoring, rescoring, and occasional AI usage after initial setup.'}</p>
            </div>
          </div>
        </section>

        {/* ═══════════ 9. HOW IT WORKS ═══════════ */}
        <section id="how-it-works" className="lp-section" aria-label="How it works" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{'How It Works'}</span>
            <h2 className="lp-section-title">{'Three Steps to AI Visibility'}</h2>
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
          <p className="lp-answer-paragraph" style={{ maxWidth: '48rem', margin: '2rem auto 0' }}>
            <strong>Getting cited by ChatGPT requires a combination of structured data, authoritative content, and technical accessibility.</strong> Implement comprehensive schema markup, format content as direct answers to common questions, build entity authority through consistent and accurate information, and ensure AI crawlers can freely access your pages. The AEO Dashboard automates this process with its 99-point checklist and AI-powered analysis tools.
          </p>
        </section>

        {/* ═══════════ 9.5. COMPARISON TABLE ═══════════ */}
        <section id="comparison" className="lp-section" aria-label="Feature comparison" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{'How We Compare'}</span>
            <h2 className="lp-section-title">{'AEO Dashboard vs The Alternatives'}</h2>
            <p className="lp-section-subtitle">{'See why AEO Dashboard is the purpose-built solution for AI search optimization.'}</p>
          </div>
          <div className="lp-comparison-wrapper">
            <table className="lp-comparison-table lp-comparison-table-full">
              <thead>
                <tr>
                  <th scope="col">{'Feature'}</th>
                  <th scope="col" className="lp-comparison-highlight">{'AEO Dashboard'}</th>
                  <th scope="col">{'Manual SEO Tools'}</th>
                  <th scope="col">{'Traditional SEO Platforms'}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={i}>
                    <td className="lp-comparison-feature-name">{row.feature}</td>
                    <td className="lp-comparison-highlight">
                      <CheckCircle2 size={14} className="lp-comparison-icon-check" />
                      {row.aeoDashboard}
                    </td>
                    <td>
                      {row.manualTools === 'Not available'
                        ? <><XCircle size={14} className="lp-comparison-icon-x" />{row.manualTools}</>
                        : <><MinusCircle size={14} className="lp-comparison-icon-minus" />{row.manualTools}</>
                      }
                    </td>
                    <td>
                      {row.traditionalPlatforms === 'Not available'
                        ? <><XCircle size={14} className="lp-comparison-icon-x" />{row.traditionalPlatforms}</>
                        : <><MinusCircle size={14} className="lp-comparison-icon-minus" />{row.traditionalPlatforms}</>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══════════ 9.75. VIDEO DEMO ═══════════ */}
        <section id="demo" className="lp-section" aria-label="Product demo" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{'See It in Action'}</span>
            <h2 className="lp-section-title">{'Watch AEO Dashboard in Action'}</h2>
            <p className="lp-section-subtitle">{'See how easy it is to audit, optimize, and monitor your AI search visibility in under 3 minutes.'}</p>
          </div>
          <div className="lp-video-demo-container" data-animate>
            <div className="lp-video-demo-player">
              <div className="lp-video-demo-placeholder">
                <div className="lp-video-demo-play-btn" role="button" tabIndex={0} aria-label={'Watch the Demo'}>
                  <Play size={32} />
                </div>
                <span className="lp-video-demo-duration">{'2:47'}</span>
              </div>
            </div>
            <p className="lp-video-demo-caption">{'A quick walkthrough of the AEO Dashboard — from site audit to AI citation tracking.'}</p>
          </div>
        </section>

        {/* ═══════════ 9. PRICING ═══════════ */}
        <section id="pricing" className="lp-section" aria-label="Pricing" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{'Pricing'}</span>
            <h2 className="lp-section-title">{'Simple, Transparent Pricing'}</h2>
            <p className="lp-section-subtitle">{'14-day free trial on every plan. No credit card required. No hidden fees.'}</p>
          </div>
          <div className="lp-pricing-toggle-wrapper">
            <div className="lp-pricing-toggle">
              <button
                className={`lp-pricing-toggle-btn ${pricingPeriod === 'monthly' ? 'lp-active' : ''}`}
                onClick={() => setPricingPeriod('monthly')}
              >
                {'Monthly'}
              </button>
              <button
                className={`lp-pricing-toggle-btn ${pricingPeriod === 'quarterly' ? 'lp-active' : ''}`}
                onClick={() => setPricingPeriod('quarterly')}
              >
                {'Quarterly'} <span style={{ fontSize: '0.6875rem', marginLeft: '0.375rem', opacity: 0.9 }}>{'Save 15%'}</span>
              </button>
              <button
                className={`lp-pricing-toggle-btn ${pricingPeriod === 'yearly' ? 'lp-active' : ''}`}
                onClick={() => setPricingPeriod('yearly')}
              >
                {'Annual'} <span style={{ fontSize: '0.6875rem', marginLeft: '0.375rem', opacity: 0.9 }}>{'Save 20%'}</span>
              </button>
            </div>
          </div>
          <div className="lp-pricing-grid">
            {PRICING.map((tier, i) => (
              <article key={i} className={`lp-pricing-card ${tier.featured ? 'lp-pricing-card-featured' : ''}`} data-animate>
                {tier.featured && <div className="lp-pricing-popular-badge">{'Most Popular'}</div>}
                <h3>{tier.name}</h3>
                <p className="lp-pricing-card-desc">{tier.description}</p>
                <div className="lp-pricing-price">
                  ${pricingPeriod === 'yearly' ? tier.yearlyPrice : pricingPeriod === 'quarterly' ? tier.quarterlyPrice : tier.monthlyPrice}
                  <span>
                    {pricingPeriod === 'yearly' ? '/mo, billed yearly' : pricingPeriod === 'quarterly' ? '/mo, billed quarterly' : '/month'}
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
            <h3>{'Need White-Label?'}</h3>
            <p>{'Enterprise plan includes full white-label capabilities. Brand the client portal with your agency’s logo, colors, and domain.'}</p>
          </div>
        </section>

        {/* ═══════════ 10. TESTIMONIALS ═══════════ */}
        <section id="testimonials" className="lp-section" aria-label="Testimonials" data-animate>
          <div className="lp-section-center">
            <span className="lp-section-label">{'Testimonials'}</span>
            <h2 className="lp-section-title">{'Loved by SEO Professionals'}</h2>
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
            <span className="lp-section-label">{'FAQ'}</span>
            <h2 className="lp-section-title">{'Frequently Asked Questions'}</h2>
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
            <h2>{'Ready to Dominate AI Search?'}</h2>
            <p>{'Join hundreds of agencies using AEO Dashboard to get their clients cited by AI. Start your 14-day free trial — no credit card required.'}</p>
            <a href="/AEO-Dashboard/app" className="lp-btn-primary">{'Start Free Trial'}</a>
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
            <p>{'The complete toolkit for Answer Engine Optimization.'}</p>
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
          <p className="lp-footer-copyright">{`© ${new Date().getFullYear()} AEO Dashboard. All rights reserved.`}</p>
        </div>
      </footer>

    </div>
  )
}
