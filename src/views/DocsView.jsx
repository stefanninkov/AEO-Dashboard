import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SearchCheck, BookOpen, ChevronRight, ChevronDown, LayoutDashboard,
  Users, Sparkles, PenTool, CalendarDays, Code2, Activity,
  ChartColumnIncreasing, Layers, FlaskConical,
  SlidersHorizontal, ArrowRight, ExternalLink, Info, Lightbulb,
  Rocket, HelpCircle,
} from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'

/* ─── App Guide Data ──────────────────────────────────────────── */
export const APP_SECTIONS = [
  {
    id: 'getting-started',
    icon: Rocket,
    title: 'Getting Started',
    color: '#6366f1',
    description: 'Everything you need to know to start using AEO Dashboard effectively.',
    items: [
      {
        title: 'What is AEO Dashboard?',
        body: 'AEO Dashboard is an all-in-one Answer Engine Optimization platform that helps you optimize your website to appear in AI-generated answers — from ChatGPT and Google AI Overviews to Perplexity, Bing Copilot, and other AI assistants. Instead of just ranking in traditional search results, AEO ensures your content gets cited and referenced by AI systems.',
      },
      {
        title: 'What is Answer Engine Optimization (AEO)?',
        body: 'AEO is the practice of optimizing your content so that AI-powered search engines and assistants use your website as a source when generating answers. This includes optimizing structured data, content authority, entity recognition, technical SEO, and more. It\'s the evolution of traditional SEO for the AI era.',
      },
      {
        title: 'How the Dashboard Works',
        body: 'Your Dashboard provides a high-level overview of your AEO performance — checklist progress across 7 phases, key metrics at a glance, and quick access to all tools. Think of it as your mission control for AEO optimization. The circular progress indicator shows your overall completion, while phase breakdowns help you identify where to focus next.',
      },
      {
        title: 'Navigating the App',
        body: 'Use the sidebar to switch between tools. Each tool serves a specific purpose in your AEO workflow. You can also use keyboard shortcuts (⌘+1 through ⌘+9) to quickly jump between views, or press ⌘+K to open the Command Palette for fast navigation and actions. The sidebar can be collapsed on mobile by tapping outside it.',
      },
      {
        title: 'Projects & Workspaces',
        body: 'Each project represents a website or domain you\'re optimizing. You can create multiple projects from the sidebar, each with its own checklist progress, settings, and data. Team members can be invited to collaborate on projects with role-based permissions (Owner, Admin, Editor, Viewer).',
      },
    ],
  },
  {
    id: 'aeo-guide',
    icon: BookOpen,
    title: 'AEO Guide',
    viewId: 'checklist',
    color: '#8b5cf6',
    description: 'Your step-by-step roadmap through all 7 phases of Answer Engine Optimization.',
    items: [
      {
        title: 'The 7 Phases of AEO',
        body: 'The AEO Guide organizes optimization into 7 progressive phases: (1) Technical Foundation — crawlability, site speed, security; (2) Schema & Structured Data — JSON-LD markup for AI comprehension; (3) Content Authority — establishing expertise and trust signals; (4) AI Discoverability — making your content findable by AI engines; (5) Brand & Entity — building your entity footprint; (6) Testing & Validation — verifying your optimizations work; (7) Monitoring & Iteration — tracking performance and iterating.',
      },
      {
        title: 'Checklist Items',
        body: 'Each phase contains categorized tasks. Check off items as you complete them — your progress is saved automatically. Each item has a detail description, a "Learn more" button that opens comprehensive documentation, and an action button that takes you directly to the relevant in-app tool. Items with colored action buttons can be completed right inside the app.',
      },
      {
        title: 'Smart Prioritization',
        body: 'When you first set up a project, the questionnaire determines which phase opens by default based on your current AEO maturity. For example, if you haven\'t implemented structured data yet, Phase 2 opens first. This helps you focus on the highest-impact tasks for your situation.',
      },
      {
        title: 'Comments & Collaboration',
        body: 'Each checklist item has a comment thread — hover over any task to see the comment icon. Team members can discuss implementation details, share notes, and coordinate work directly on each task. Comments include timestamps and author info for team tracking.',
      },
    ],
  },
  {
    id: 'geo-guide',
    icon: Sparkles,
    title: 'GEO Guide',
    color: '#8B5CF6',
    description: 'Generative Engine Optimization — the research-backed discipline for maximizing AI citation probability.',
    items: [
      {
        title: 'What is Generative Engine Optimization (GEO)?',
        body: 'GEO (Generative Engine Optimization) is a research-backed discipline focused on optimizing content to be cited by generative AI systems — ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. Originally described in a 2023 Princeton/Georgia Tech study, GEO identifies specific, measurable techniques for improving AI citation rates: statistics integration, expert quotation addition, fluency optimization, and position bias correction. AEO Dashboard integrates GEO techniques throughout its 7-phase checklist.',
      },
      {
        title: 'GEO vs AEO: How They Relate',
        body: 'AEO (Answer Engine Optimization) is the broader discipline of making content citable by AI answer engines. GEO is a precision layer on top of AEO — it uses experimentally validated techniques derived from measuring actual citation rates across generative engines. Every GEO best practice is a valid AEO technique, but not every AEO technique has been formally studied in the GEO framework. Think of GEO as the research-validated, evidence-based subset of AEO.',
      },
      {
        title: 'The Top GEO Techniques by Citation Lift',
        body: 'The Princeton/Georgia Tech GEO study measured citation lift across content optimization strategies. Top performers: (1) Statistics Integration — adding sourced data points boosts citation probability by over 5.5%; (2) Fluency Optimization — clear, active-voice sentences with unambiguous structure improve AI extractability; (3) Quotation Addition — expert quotes with full attribution significantly increase trust signals; (4) Cite Sources — referencing authoritative external sources correlates with higher citation rates. These techniques are integrated into Phase 3 of the AEO checklist.',
      },
      {
        title: 'GEO Citation Gap Analysis',
        body: 'The most important GEO diagnostic is the citation gap: the difference between pages AI engines crawl and pages they actually cite. AI crawlers visit far more pages than they ultimately reference in generated answers. Identifying which of your crawled-but-not-cited pages fall in this gap — and applying GEO techniques to close it — is the core GEO workflow. Use the Testing view to measure citation rates and compare them with your server log AI crawler data.',
      },
    ],
  },
  {
    id: 'competitors',
    icon: Users,
    title: 'Competitors',
    viewId: 'competitors',
    color: '#ec4899',
    description: 'Analyze and track competitor AEO strategies.',
    items: [
      {
        title: 'Competitor Tracking',
        body: 'Add competitor domains to track their AEO performance alongside yours. The competitor view lets you compare structured data implementation, content strategies, and AI visibility side by side. This helps identify gaps in your strategy and opportunities your competitors may have missed.',
      },
      {
        title: 'Adding Competitors',
        body: 'Enter competitor URLs to start tracking them. The system analyzes their schema markup, content structure, and technical SEO signals. You can track multiple competitors per project and remove them at any time.',
      },
    ],
  },
  {
    id: 'analyzer',
    icon: Sparkles,
    title: 'Analyzer',
    viewId: 'analyzer',
    color: '#f59e0b',
    description: 'Analyze any URL for AEO readiness and get actionable recommendations.',
    items: [
      {
        title: 'How the Analyzer Works',
        body: 'Enter any URL and the Analyzer scans it for AEO readiness. It checks structured data, content quality signals, technical SEO factors, heading structure, meta tags, and more. Results are presented as a score with detailed recommendations for improvement.',
      },
      {
        title: 'Understanding Results',
        body: 'The analysis breaks down into categories: structured data coverage, content authority signals, technical foundation, and AI discoverability factors. Each category shows what\'s working well (green), what needs attention (yellow), and critical issues (red). Action items are prioritized by impact.',
      },
      {
        title: 'When to Use It',
        body: 'Run the Analyzer when you\'re starting a new project, after making significant content changes, or when checking specific pages for AEO compliance. It\'s especially useful for auditing individual pages against the AEO checklist requirements.',
      },
    ],
  },
  {
    id: 'writer',
    icon: PenTool,
    title: 'Content Writer',
    viewId: 'writer',
    color: '#10b981',
    description: 'AI-powered content creation optimized for Answer Engine visibility.',
    items: [
      {
        title: 'AI Content Generation',
        body: 'The Content Writer helps you create AEO-optimized content using AI. It generates content that\'s structured for AI comprehension — with clear headings, concise answers to likely questions, and proper formatting that AI engines prefer when sourcing information.',
      },
      {
        title: 'Content Templates',
        body: 'Choose from templates designed for different content types: FAQ pages, how-to guides, product descriptions, comparison articles, and more. Each template is structured to maximize the chance of being cited by AI assistants.',
      },
      {
        title: 'Optimization Tips',
        body: 'The writer includes real-time suggestions for improving AI visibility: sentence clarity, answer-readiness, entity mentions, and factual precision. Content that\'s clear, concise, and authoritative performs best with AI systems.',
      },
    ],
  },
  {
    id: 'content-ops',
    icon: CalendarDays,
    title: 'Content Ops',
    viewId: 'content-ops',
    color: '#6366f1',
    description: 'Plan and manage your content operations and publishing pipeline.',
    items: [
      {
        title: 'Content Calendar',
        body: 'Content Ops provides a content management and planning workspace. Organize your content pipeline, track what needs to be created or updated, and ensure consistent publishing. This helps maintain the content freshness signals that AI engines value.',
      },
      {
        title: 'Workflow Management',
        body: 'Track content through stages from ideation to published. Assign content tasks to team members, set deadlines, and monitor progress. A consistent content workflow ensures your AEO strategy stays on track.',
      },
    ],
  },
  {
    id: 'schema',
    icon: Code2,
    title: 'Schema Generator',
    viewId: 'schema',
    color: '#0ea5e9',
    description: 'Generate JSON-LD structured data markup for AI engines.',
    items: [
      {
        title: 'What is Schema Markup?',
        body: 'Schema markup (structured data) is JSON-LD code that helps AI engines understand your content. It tells AI systems exactly what your page is about — whether it\'s a FAQ, product, article, organization, or any other entity type. This is one of the most important factors for AI visibility.',
      },
      {
        title: 'Generating Schema',
        body: 'Select a schema type (FAQPage, HowTo, Article, Product, Organization, etc.), fill in the required fields, and the generator outputs valid JSON-LD code ready to paste into your website\'s <head> tag. The generator validates your markup against Google\'s requirements.',
      },
      {
        title: 'Schema Types for AEO',
        body: 'The most impactful schema types for AI visibility: FAQPage (for question-answer content), HowTo (for instructional content), Article (for editorial content), Organization (for brand identity), Product (for e-commerce), and Speakable (marking content optimized for voice/AI reading).',
      },
    ],
  },
  {
    id: 'monitoring',
    icon: Activity,
    title: 'Monitoring',
    viewId: 'monitoring',
    color: '#f97316',
    description: 'Real-time monitoring of your AEO performance signals.',
    items: [
      {
        title: 'Performance Monitoring',
        body: 'The Monitoring tab tracks your AEO health in real-time. It watches for changes in structured data validity, content indexing status, and technical health signals. Set up alerts to be notified when something needs attention.',
      },
      {
        title: 'What Gets Tracked',
        body: 'Monitoring covers: schema validation status, page load performance, crawl errors, indexing status, content changes, and competitor movements. The dashboard surfaces the most critical items so you can respond quickly to issues.',
      },
    ],
  },
  {
    id: 'metrics',
    icon: ChartColumnIncreasing,
    title: 'Metrics',
    viewId: 'metrics',
    color: '#8b5cf6',
    description: 'Detailed analytics and performance metrics for your AEO efforts.',
    items: [
      {
        title: 'AEO Metrics Overview',
        body: 'The Metrics tab provides detailed analytics about your AEO performance over time. Track trends in AI citations, answer appearances, click-through rates from AI surfaces, and overall visibility scores. Use the date range selector to view different time periods.',
      },
      {
        title: 'Key Metrics to Watch',
        body: 'Focus on: AI citation rate (how often AI engines reference your content), answer appearance rate (how often you appear in AI-generated answers), structured data coverage (percentage of pages with valid schema), and content authority score (aggregate trust signals).',
      },
    ],
  },
  {
    id: 'gsc',
    icon: SearchCheck,
    title: 'Search Console',
    viewId: 'gsc',
    color: '#4285f4',
    description: 'Google Search Console integration for search performance data.',
    items: [
      {
        title: 'Search Console Integration',
        body: 'Connect your Google Search Console account to pull in real search performance data. This shows how your pages perform in Google Search results — impressions, clicks, CTR, and average position. This data helps you understand which pages are being found by Google\'s AI systems.',
      },
      {
        title: 'Connecting Your Account',
        body: 'Go to Settings to connect your Google Search Console property. Once connected, data flows automatically into the Search Console tab. You\'ll see query-level data showing exactly what search terms are driving traffic to your site.',
      },
    ],
  },
  {
    id: 'ga4',
    icon: Sparkles,
    title: 'AI Traffic',
    viewId: 'ga4',
    color: '#22c55e',
    description: 'Track traffic specifically coming from AI engines and assistants.',
    items: [
      {
        title: 'AI Traffic Tracking',
        body: 'The AI Traffic tab (GA4 integration) specifically tracks visitors coming from AI-powered sources: ChatGPT, Google AI Overviews, Perplexity, Bing Copilot, Claude, and other AI assistants. This is the most direct measure of your AEO success.',
      },
      {
        title: 'Setting Up Tracking',
        body: 'Connect your Google Analytics 4 property in Settings. The system automatically identifies AI-referral traffic using known AI engine referrer patterns. This separates AI-driven traffic from traditional organic search traffic.',
      },
    ],
  },
  {
    id: 'aeo-impact',
    icon: Layers,
    title: 'AEO Impact',
    viewId: 'aeo-impact',
    color: '#ec4899',
    description: 'Measure the business impact of your AEO optimization efforts.',
    items: [
      {
        title: 'Impact Measurement',
        body: 'AEO Impact connects your optimization work to business outcomes. It correlates checklist progress with traffic changes, citation growth, and conversion metrics. This helps you demonstrate ROI and prioritize the highest-impact activities.',
      },
      {
        title: 'Before & After Analysis',
        body: 'Track how specific optimizations (adding schema, improving content, fixing technical issues) affected your AI visibility over time. The impact timeline shows changes alongside your optimization milestones.',
      },
    ],
  },
  {
    id: 'testing',
    icon: FlaskConical,
    title: 'Testing',
    viewId: 'testing',
    color: '#f59e0b',
    description: 'Test how AI engines respond to your content with real queries.',
    items: [
      {
        title: 'Query Testing',
        body: 'The Testing tab lets you test queries against AI engines to see if your content appears in their responses. Enter questions that your target audience might ask, and see how AI systems respond — whether they cite your content, reference your brand, or miss you entirely.',
      },
      {
        title: 'Test Strategies',
        body: 'Test different types of queries: branded queries (mentions of your brand), topical queries (questions in your expertise area), comparison queries (your brand vs competitors), and long-tail queries (specific questions your content answers). Track which queries you\'re winning and which need work.',
      },
    ],
  },
  {
    id: 'settings',
    icon: SlidersHorizontal,
    title: 'Settings',
    viewId: 'settings',
    color: '#64748b',
    description: 'Configure your project, team, integrations, and account preferences.',
    items: [
      {
        title: 'Project Settings',
        body: 'Configure your project details: site URL, project name, description, and AEO questionnaire answers. The questionnaire responses affect which AEO Guide phase is prioritized and which recommendations you receive. You can re-take the questionnaire at any time.',
      },
      {
        title: 'Team Management',
        body: 'Invite team members by email with role-based access: Owner (full control), Admin (manage team & settings), Editor (edit content & checklist), and Viewer (read-only access). Team activity is tracked in the activity timeline.',
      },
      {
        title: 'Integrations',
        body: 'Connect external services: Google Search Console (search performance data), Google Analytics 4 (AI traffic tracking), and Webflow (CMS integration). Each integration enriches your dashboard with real data from your actual website performance.',
      },
      {
        title: 'Theme & Preferences',
        body: 'Toggle between light and dark mode using the theme switcher in the sidebar. The app respects your system preference by default. Keyboard shortcuts and other UI preferences can be customized.',
      },
    ],
  },
]

/* ─── FAQ Data ────────────────────────────────────────────────── */
export const FAQ_ITEMS = [
  {
    q: 'How is AEO different from traditional SEO?',
    a: 'Traditional SEO focuses on ranking in search engine results pages (SERPs). AEO focuses on being cited as a source by AI-powered systems — ChatGPT, Google AI Overviews, Perplexity, etc. While there\'s significant overlap (good SEO helps AEO), AEO specifically emphasizes structured data, content clarity, entity recognition, and authoritative sourcing that AI systems value.',
  },
  {
    q: 'Do I need to complete all 7 phases?',
    a: 'Ideally yes, but prioritize based on your current maturity. Phase 1 (Technical Foundation) and Phase 2 (Schema) are the most impactful starting points. The AEO Guide\'s smart prioritization opens the most relevant phase for your situation. You can work through phases in parallel — they\'re not strictly sequential.',
  },
  {
    q: 'How often should I check my AEO metrics?',
    a: 'Monitor weekly at minimum. AI visibility can change quickly as AI models update and competitors optimize. The Monitoring tab helps you stay on top of changes, and the Metrics tab shows trends over time. Set up the most critical alerts to be notified of significant changes.',
  },
  {
    q: 'Can I use this for multiple websites?',
    a: 'Yes! Create a separate project for each website or domain. Each project maintains its own checklist progress, settings, and integrations. Switch between projects using the project selector in the sidebar.',
  },
  {
    q: 'What keyboard shortcuts are available?',
    a: 'Press ⌘+K (or Ctrl+K on Windows) to open the Command Palette, which shows all available actions. Use ⌘+1 through ⌘+9 to quickly switch between views. ⌘+N creates a new project, and Escape closes modals and overlays.',
  },
  {
    q: 'How does team collaboration work?',
    a: 'Invite team members from Settings → Team. Each member gets a role (Owner, Admin, Editor, Viewer) that controls what they can do. Real-time presence shows who\'s online. Checklist items support comments for discussion, and all activity is logged in the team timeline.',
  },
  {
    q: 'Is my data saved automatically?',
    a: 'Yes. All checklist progress, settings, and project data is saved automatically to the cloud (Firebase). Changes sync in real-time across all team members\' devices. There\'s no manual save button needed.',
  },
  {
    q: 'What is GEO and how is it different from AEO?',
    a: 'GEO (Generative Engine Optimization) is a research-backed discipline from a 2023 Princeton/Georgia Tech study focused on maximizing citation probability in generative AI engines. AEO is the broader practice of optimizing for all AI answer engines. GEO is essentially the evidence-based, research-validated subset of AEO — it provides specific, experimentally measured techniques like statistics integration, expert quotation addition, and fluency optimization. The AEO Dashboard integrates GEO techniques throughout its checklist, with explicit GEO callouts on relevant items.',
  },
  {
    q: 'Which checklist items are GEO-related?',
    a: 'GEO techniques are woven throughout the checklist rather than isolated in a single phase. Key GEO items include: statistics integration and expert quotes (Phase 3, Content Quality), RAG-optimized content chunking (Phase 3, Content Structure), llms.txt and llms-full.txt (Phase 4, Technical AEO), cross-platform generative engine testing (Phase 6), and AI Share of Voice monitoring (Phase 7). Look for "GEO" mentions in item details and documentation to identify all GEO-enhanced tasks.',
  },
]

/* ─── Component ───────────────────────────────────────────────── */
export default function DocsView({ phases, setDocItem, setActiveView }) {
  const { t } = useTranslation('docs')
  const [activeTab, setActiveTab] = useState('guide')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 200)
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})
  const [expandedFaq, setExpandedFaq] = useState({})

  /* ─── Translated section data ──────────────────────────────── */
  const translatedSections = useMemo(() => APP_SECTIONS.map(section => ({
    ...section,
    title: t(`sections.${section.id}.title`),
    description: t(`sections.${section.id}.description`),
    items: section.items.map((item, idx) => ({
      ...item,
      title: t(`sections.${section.id}.items.${idx}.title`),
      body: t(`sections.${section.id}.items.${idx}.body`),
    })),
  })), [t])

  const translatedFaq = useMemo(() => FAQ_ITEMS.map((item, idx) => ({
    q: t(`faq.${idx}.q`),
    a: t(`faq.${idx}.a`),
  })), [t])

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleFaq = (key) => {
    setExpandedFaq(prev => ({ ...prev, [key]: !prev[key] }))
  }

  /* ─── AEO Reference data (existing docs from checklist) ──── */
  const allDocs = useMemo(() => phases.flatMap(phase =>
    phase.categories.flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        phaseId: phase.id,
        phaseNumber: phase.number,
        phaseTitle: phase.title,
        phaseColor: phase.color,
        phaseIcon: phase.icon,
        categoryName: cat.name,
      }))
    )
  ), [phases])

  const filteredDocs = useMemo(() => allDocs.filter(doc => {
    const q = debouncedSearch.toLowerCase()
    const matchesSearch = !q ||
      doc.text.toLowerCase().includes(q) ||
      doc.detail.toLowerCase().includes(q) ||
      doc.doc.title.toLowerCase().includes(q) ||
      doc.doc.sections.some(s =>
        s.heading.toLowerCase().includes(q) ||
        s.body.toLowerCase().includes(q)
      )
    const matchesPhase = !selectedPhase || doc.phaseId === selectedPhase
    return matchesSearch && matchesPhase
  }), [allDocs, debouncedSearch, selectedPhase])

  const groupedByPhase = useMemo(() => phases
    .map(phase => ({
      ...phase,
      docs: filteredDocs.filter(d => d.phaseId === phase.id),
    }))
    .filter(group => group.docs.length > 0)
  , [phases, filteredDocs])

  /* ─── Guide search filter ──────────────────────────────────── */
  const filteredGuide = useMemo(() => {
    if (!debouncedSearch.trim() || activeTab !== 'guide') return translatedSections
    const q = debouncedSearch.toLowerCase()
    return translatedSections.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        section.title.toLowerCase().includes(q)
      )
    })).filter(section => section.items.length > 0)
  }, [debouncedSearch, activeTab, translatedSections])

  const filteredFaq = useMemo(() => {
    if (!debouncedSearch.trim() || activeTab !== 'faq') return translatedFaq
    const q = debouncedSearch.toLowerCase()
    return translatedFaq.filter(item =>
      item.q.toLowerCase().includes(q) ||
      item.a.toLowerCase().includes(q)
    )
  }, [debouncedSearch, activeTab, translatedFaq])

  const TABS = useMemo(() => [
    { id: 'guide', label: t('tabs.guide'), icon: Lightbulb },
    { id: 'reference', label: t('tabs.reference'), icon: BookOpen },
    { id: 'faq', label: t('tabs.faq'), icon: HelpCircle },
  ], [t])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.0187rem] text-text-primary mb-1">
          {t('title')}
        </h2>
        <p className="text-[0.8125rem] text-text-secondary">
          {t('subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', padding: '0.1875rem',
        background: 'var(--hover-bg)', borderRadius: '0.625rem',
        width: 'fit-content',
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4375rem 0.75rem', borderRadius: '0.5rem',
                border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontSize: '0.75rem', fontWeight: isActive ? 600 : 500,
                fontFamily: 'var(--font-body)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all 150ms',
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="docs-search-wrap">
        <SearchCheck size={14} className="docs-search-icon" />
        <input
          type="text"
          placeholder={
            activeTab === 'guide' ? t('searchFeatures') :
            activeTab === 'faq' ? t('searchQuestions') :
            t('searchPlaceholder')
          }
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="docs-search-input"
          aria-label="Search documentation"
        />
      </div>

      {/* ─── Tab: App Guide ─────────────────────────────────── */}
      {activeTab === 'guide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredGuide.map(section => {
            const Icon = section.icon
            const isExpanded = expandedSections[section.id]
            return (
              <div
                key={section.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '0.75rem',
                  border: '0.0625rem solid var(--border-subtle)',
                  overflow: 'hidden',
                  transition: 'box-shadow 150ms',
                }}
              >
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.75rem 1rem', border: 'none', cursor: 'pointer',
                    background: 'none', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem',
                    background: section.color + '12', color: section.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                      fontFamily: 'var(--font-heading)', letterSpacing: '-0.0125rem',
                    }}>
                      {section.title}
                    </div>
                    <div style={{
                      fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-body)', marginTop: '0.0625rem',
                    }}>
                      {section.description}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {section.viewId && setActiveView && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setActiveView(section.viewId) }}
                        style={{
                          fontSize: '0.625rem', fontWeight: 600,
                          color: section.color, cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          padding: '0.1875rem 0.5rem', borderRadius: '0.375rem',
                          background: section.color + '10',
                          border: `0.0625rem solid ${section.color}25`,
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t('open')} <ArrowRight size={10} />
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      style={{
                        color: 'var(--text-tertiary)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms',
                      }}
                    />
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{
                    borderTop: '0.0625rem solid var(--border-subtle)',
                    padding: '0.75rem 1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.625rem',
                  }}>
                    {section.items.map((item, idx) => (
                      <div key={idx} style={{
                        padding: '0.625rem 0.75rem',
                        background: 'var(--hover-bg)',
                        borderRadius: '0.5rem',
                      }}>
                        <div style={{
                          fontSize: '0.75rem', fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-heading)',
                          letterSpacing: '-0.0125rem',
                          marginBottom: '0.375rem',
                          display: 'flex', alignItems: 'center', gap: '0.375rem',
                        }}>
                          <Info size={11} style={{ color: section.color, flexShrink: 0 }} />
                          {item.title}
                        </div>
                        <p style={{
                          fontSize: '0.6875rem', lineHeight: 1.6,
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-body)',
                          margin: 0,
                        }}>
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {filteredGuide.length === 0 && (
            <div className="docs-empty">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--hover-bg)' }}>
                <SearchCheck size={20} className="text-text-tertiary" />
              </div>
              <h3 className="font-heading text-[0.8125rem] font-bold mb-1 text-text-primary">{t('noMatchingFeatures')}</h3>
              <p className="text-[0.75rem] text-text-tertiary text-center max-w-xs">{t('tryDifferentSearch')}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: AEO Reference ─────────────────────────────── */}
      {activeTab === 'reference' && (
        <>
          {/* Phase Filter */}
          <div className="docs-filter-bar">
            <button
              onClick={() => setSelectedPhase(null)}
              className={`docs-filter-pill${!selectedPhase ? ' active' : ''}`}
              style={!selectedPhase ? { backgroundColor: 'var(--color-phase-1)' } : undefined}
            >
              {t('allPhases')}
            </button>
            {phases.map(phase => (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                className={`docs-filter-pill${selectedPhase === phase.id ? ' active' : ''}`}
                style={selectedPhase === phase.id ? { backgroundColor: phase.color } : undefined}
              >
                {phase.icon} {t('phase')} {phase.number}
              </button>
            ))}
          </div>

          {/* Doc count */}
          <p className="docs-count">
            {t('showingDocs', { shown: filteredDocs.length, total: allDocs.length })}
          </p>

          {/* Doc List - grouped by phase */}
          {groupedByPhase.map(phase => (
            <div key={phase.id} className="docs-phase-group">
              <div className="docs-phase-header">
                <span className="docs-phase-icon">{phase.icon}</span>
                <span className="docs-phase-label">{t('phase')} {phase.number}: {phase.title}</span>
                <span className="docs-phase-count">{phase.docs.length} {phase.docs.length === 1 ? t('doc') : t('docs')}</span>
              </div>
              {phase.docs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setDocItem(doc)}
                  className="docs-item"
                >
                  <BookOpen size={14} className="docs-item-icon" />
                  <div className="docs-item-content">
                    <div className="docs-item-meta">
                      <span
                        className="docs-item-badge"
                        style={{ color: doc.phaseColor, backgroundColor: doc.phaseColor + '12' }}
                      >
                        P{doc.phaseNumber}
                      </span>
                      <span className="docs-item-category">{doc.categoryName}</span>
                    </div>
                    <div className="docs-item-title">{doc.doc.title}</div>
                    <div className="docs-item-desc">{doc.detail}</div>
                  </div>
                  <ChevronRight size={14} className="docs-item-arrow" />
                </button>
              ))}
            </div>
          ))}

          {/* Empty State */}
          {filteredDocs.length === 0 && (
            <div className="docs-empty">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--hover-bg)' }}>
                <BookOpen size={20} className="text-text-tertiary" />
              </div>
              <h3 className="font-heading text-[0.8125rem] font-bold mb-1 text-text-primary">{t('noResults')}</h3>
              <p className="text-[0.75rem] text-text-tertiary text-center max-w-xs">{t('noResultsDesc')}</p>
            </div>
          )}
        </>
      )}

      {/* ─── Tab: FAQ ───────────────────────────────────────── */}
      {activeTab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {filteredFaq.map((item) => {
            const isOpen = expandedFaq[item.q]
            return (
              <div
                key={item.q}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '0.625rem',
                  border: '0.0625rem solid var(--border-subtle)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => toggleFaq(item.q)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6875rem 1rem', border: 'none', cursor: 'pointer',
                    background: 'none', textAlign: 'left',
                  }}
                >
                  <HelpCircle size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                  <span style={{
                    flex: 1, fontSize: '0.75rem', fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.0125rem',
                  }}>
                    {item.q}
                  </span>
                  <ChevronDown
                    size={13}
                    style={{
                      color: 'var(--text-tertiary)', flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms',
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{
                    borderTop: '0.0625rem solid var(--border-subtle)',
                    padding: '0.6875rem 1rem 0.6875rem 2.625rem',
                  }}>
                    <p style={{
                      fontSize: '0.6875rem', lineHeight: 1.65,
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      margin: 0,
                    }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            )
          })}

          {filteredFaq.length === 0 && (
            <div className="docs-empty">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--hover-bg)' }}>
                <HelpCircle size={20} className="text-text-tertiary" />
              </div>
              <h3 className="font-heading text-[0.8125rem] font-bold mb-1 text-text-primary">{t('noMatchingQuestions')}</h3>
              <p className="text-[0.75rem] text-text-tertiary text-center max-w-xs">{t('tryDifferentSearch')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
