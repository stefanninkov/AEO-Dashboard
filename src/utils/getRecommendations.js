/* ── Industry Labels ── */
export const INDUSTRY_LABELS = {
  saas: 'SaaS / Software',
  ecommerce: 'E-Commerce',
  healthcare: 'Healthcare',
  finance: 'Finance / Fintech',
  legal: 'Legal',
  realestate: 'Real Estate',
  education: 'Education',
  agency: 'Agency / Consulting',
  localbusiness: 'Local Business',
  media: 'Media / Publishing',
  other: 'Other',
}

export const REGION_LABELS = {
  us: 'United States',
  europe: 'Europe',
  uk: 'United Kingdom',
  apac: 'Asia-Pacific',
  latam: 'Latin America',
  mena: 'Middle East & North Africa',
  global: 'Global',
}

export const AUDIENCE_LABELS = {
  b2b: 'B2B',
  b2c: 'B2C',
  both: 'Both B2B & B2C',
}

export const GOAL_LABELS = {
  citations: 'Get Cited in AI Answers',
  answers: 'Appear in AI Search Results',
  traffic: 'Drive AI Referral Traffic',
  brand: 'Brand Positioning & Authority',
  all: 'All of the Above',
}

export const MATURITY_LABELS = {
  beginner: 'Just Starting',
  basics: 'Some Basics Done',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const CONTENT_LABELS = {
  blog: 'Blog / Articles',
  product: 'Product Pages',
  docs: 'Documentation',
  landing: 'Landing Pages',
  mixed: 'Mixed Content',
}

export const ENGINE_LABELS = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  'google-aio': 'Google AI Overviews',
  'bing-copilot': 'Bing Copilot',
  claude: 'Claude',
  all: 'All Engines',
}

/* ── Industry Competitor Suggestions ── */
export const INDUSTRY_COMPETITORS = {
  saas: [
    { name: 'G2', url: 'https://www.g2.com' },
    { name: 'Capterra', url: 'https://www.capterra.com' },
    { name: 'TrustRadius', url: 'https://www.trustradius.com' },
  ],
  ecommerce: [
    { name: 'Amazon', url: 'https://www.amazon.com' },
    { name: 'Shopify', url: 'https://www.shopify.com' },
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter' },
  ],
  healthcare: [
    { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org' },
    { name: 'WebMD', url: 'https://www.webmd.com' },
    { name: 'Healthline', url: 'https://www.healthline.com' },
  ],
  finance: [
    { name: 'NerdWallet', url: 'https://www.nerdwallet.com' },
    { name: 'Investopedia', url: 'https://www.investopedia.com' },
    { name: 'Bankrate', url: 'https://www.bankrate.com' },
  ],
  legal: [
    { name: 'FindLaw', url: 'https://www.findlaw.com' },
    { name: 'Nolo', url: 'https://www.nolo.com' },
    { name: 'Avvo', url: 'https://www.avvo.com' },
  ],
  realestate: [
    { name: 'Zillow', url: 'https://www.zillow.com' },
    { name: 'Realtor.com', url: 'https://www.realtor.com' },
    { name: 'Redfin', url: 'https://www.redfin.com' },
  ],
  education: [
    { name: 'Khan Academy', url: 'https://www.khanacademy.org' },
    { name: 'Coursera', url: 'https://www.coursera.org' },
    { name: 'edX', url: 'https://www.edx.org' },
  ],
  agency: [
    { name: 'HubSpot', url: 'https://www.hubspot.com' },
    { name: 'Moz', url: 'https://moz.com' },
    { name: 'Ahrefs', url: 'https://ahrefs.com' },
  ],
  localbusiness: [
    { name: 'Yelp', url: 'https://www.yelp.com' },
    { name: 'Google Business', url: 'https://business.google.com' },
    { name: 'TripAdvisor', url: 'https://www.tripadvisor.com' },
  ],
  media: [
    { name: 'Medium', url: 'https://medium.com' },
    { name: 'Substack', url: 'https://substack.com' },
    { name: 'The Verge', url: 'https://www.theverge.com' },
  ],
}

/* ── Get Phase Priority ── */
export function getPhasePriority(phaseNumber, questionnaire) {
  if (!questionnaire?.completedAt) return null
  const priorities = new Set()

  // Beginners: Phase 1 (Foundation & Audit)
  if (questionnaire.maturity === 'beginner') priorities.add(1)

  // No schema / unknown: Phase 2 (Schema & Structured Data)
  if (questionnaire.hasSchema === 'no' || questionnaire.hasSchema === 'unknown') priorities.add(2)

  // Citation/answer seekers: Phase 3 (Content Optimization)
  if (questionnaire.primaryGoal === 'citations' || questionnaire.primaryGoal === 'answers' || questionnaire.primaryGoal === 'all') priorities.add(3)

  // Everyone benefits from technical: Phase 4
  if (questionnaire.maturity !== 'advanced') priorities.add(4)

  // Brand/authority seekers + regulated industries: Phase 5 (Authority)
  if (questionnaire.primaryGoal === 'brand' || questionnaire.industry === 'healthcare' || questionnaire.industry === 'finance' || questionnaire.industry === 'legal') priorities.add(5)

  // Engine trackers: Phase 6 (Distribution)
  if (questionnaire.targetEngines?.length > 0) priorities.add(6)

  // Everyone: Phase 7 (Ongoing)
  if (questionnaire.maturity === 'intermediate' || questionnaire.maturity === 'advanced') priorities.add(7)

  return priorities.has(phaseNumber) ? 'priority' : null
}

/* ── Get First Priority Phase ── */
export function getFirstPriorityPhase(questionnaire) {
  if (!questionnaire?.completedAt) return 'phase-1'

  if (questionnaire.maturity === 'beginner') return 'phase-1'
  if (questionnaire.hasSchema === 'no' || questionnaire.hasSchema === 'unknown') return 'phase-2'
  if (questionnaire.primaryGoal === 'citations' || questionnaire.primaryGoal === 'answers') return 'phase-3'
  if (questionnaire.primaryGoal === 'brand') return 'phase-5'

  return 'phase-1'
}

/* ── Get Filtered Engines ── */
export function getFilteredEngines(questionnaire, allEngines) {
  if (!questionnaire?.completedAt || !questionnaire.targetEngines?.length) return allEngines
  if (questionnaire.targetEngines.includes('all')) return allEngines

  const engineNameMap = {
    chatgpt: 'ChatGPT',
    perplexity: 'Perplexity',
    'google-aio': 'Google AI Overviews',
    'bing-copilot': 'Bing Copilot',
    claude: 'Claude',
  }

  const targetNames = questionnaire.targetEngines.map(e => engineNameMap[e]).filter(Boolean)
  if (targetNames.length === 0) return allEngines

  // Prioritize selected, then rest
  const selected = allEngines.filter(e => targetNames.some(t => e.name?.includes(t)))
  const rest = allEngines.filter(e => !targetNames.some(t => e.name?.includes(t)))
  return [...selected, ...rest]
}

/* ── Get Filtered Platforms ── */
export function getFilteredPlatforms(questionnaire, allPlatforms) {
  if (!questionnaire?.completedAt || !questionnaire.targetEngines?.length) return allPlatforms
  if (questionnaire.targetEngines.includes('all')) return allPlatforms

  const platformMap = {
    chatgpt: 'ChatGPT',
    perplexity: 'Perplexity',
    'google-aio': 'Google AIO',
    'bing-copilot': 'Bing Copilot',
    claude: 'Claude',
  }

  const targetNames = questionnaire.targetEngines.map(e => platformMap[e]).filter(Boolean)
  if (targetNames.length === 0) return allPlatforms

  const selected = allPlatforms.filter(p => targetNames.includes(p))
  const rest = allPlatforms.filter(p => !targetNames.includes(p))
  return [...selected, ...rest]
}

/* ── Get Recommendations (legacy — questionnaire-only) ── */
export function getRecommendations(questionnaire, setActiveView) {
  if (!questionnaire?.completedAt) return []

  const recs = []

  if (questionnaire.maturity === 'beginner') {
    recs.push({ id: 'start-phase-1', text: 'Start with Phase 1: Foundation & Audit', detail: 'As a beginner, getting the fundamentals right is the most impactful first step.', action: () => setActiveView('checklist'), actionLabel: 'Go to Checklist', priority: 1 })
  } else if (questionnaire.maturity === 'basics' || questionnaire.maturity === 'intermediate') {
    recs.push({ id: 'content-technical', text: 'Focus on Content & Technical Optimization (Phase 3-4)', detail: 'You have the basics — now optimize your content structure and technical setup for AI engines.', action: () => setActiveView('checklist'), actionLabel: 'Go to Checklist', priority: 2 })
  }
  if (questionnaire.hasSchema === 'no' || questionnaire.hasSchema === 'unknown') {
    recs.push({ id: 'run-analyzer', text: 'Run the Site Analyzer to check your schema', detail: 'Schema markup is critical for AI visibility. Scan your site to see what\'s missing.', action: () => setActiveView('analyzer'), actionLabel: 'Go to Analyzer', priority: 1 })
  }
  if (questionnaire.primaryGoal === 'citations') {
    recs.push({ id: 'setup-tracking', text: 'Set up query tracking for citation monitoring', detail: 'Track how your content appears when users ask AI about topics you cover.', action: () => setActiveView('testing'), actionLabel: 'Go to Testing', priority: 2 })
  }
  if (questionnaire.primaryGoal === 'brand') {
    recs.push({ id: 'authority-signals', text: 'Strengthen Authority signals (Phase 5)', detail: 'For brand positioning, focus on E-E-A-T signals, author credentials, and external citations.', action: () => setActiveView('checklist'), actionLabel: 'Go to Checklist', priority: 2 })
  }
  if (questionnaire.targetEngines?.length > 0 && !questionnaire.targetEngines.includes('all')) {
    const names = questionnaire.targetEngines.map(e => ENGINE_LABELS[e] || e).join(', ')
    recs.push({ id: 'track-engines', text: `Track your visibility on ${names}`, detail: 'Run metrics analysis to see how your site performs on your priority AI engines.', action: () => setActiveView('metrics'), actionLabel: 'Go to Metrics', priority: 3 })
  }
  if (questionnaire.industry === 'ecommerce') {
    recs.push({ id: 'product-schema', text: 'Prioritize Product & Offer schema markup', detail: 'E-commerce sites benefit hugely from structured product data for AI shopping queries.', action: () => setActiveView('checklist'), actionLabel: 'Go to Checklist', priority: 2 })
  }
  if (questionnaire.industry === 'healthcare' || questionnaire.industry === 'finance' || questionnaire.industry === 'legal') {
    recs.push({ id: 'eeat-focus', text: 'Focus on E-E-A-T and Trust signals', detail: `In ${INDUSTRY_LABELS[questionnaire.industry]}, AI engines heavily weight expertise and authority.`, action: () => setActiveView('checklist'), actionLabel: 'Go to Checklist', priority: 1 })
  }
  if (questionnaire.industry && INDUSTRY_COMPETITORS[questionnaire.industry]) {
    recs.push({ id: 'benchmark-competitors', text: 'Benchmark against industry leaders', detail: `See how your AEO compares to top ${INDUSTRY_LABELS[questionnaire.industry]} competitors.`, action: () => setActiveView('competitors'), actionLabel: 'Go to Competitors', priority: 3 })
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

/* ── Recommendation Categories ── */
const CATEGORIES = {
  getting_started: { label: 'Getting Started', color: '#FF6B35' },
  checklist: { label: 'Checklist', color: '#10B981' },
  metrics: { label: 'Metrics', color: '#6366F1' },
  content: { label: 'Content', color: '#F59E0B' },
  monitoring: { label: 'Monitoring', color: '#EC4899' },
  competitors: { label: 'Competitors', color: '#8B5CF6' },
  analysis: { label: 'Analysis', color: '#06B6D4' },
  schema: { label: 'Schema', color: '#14B8A6' },
}

/* ── Smart Recommendations Engine ── */
export function getSmartRecommendations(project, phases, setActiveView) {
  if (!project) return []

  const recs = []
  const q = project.questionnaire || {}
  const hasQuestionnaire = !!q.completedAt
  const checked = project.checked || {}
  const metricsHistory = project.metricsHistory || []
  const monitorHistory = project.monitorHistory || []
  const analyzerResults = project.analyzerResults
  const competitors = project.competitors || []
  const hasApiKey = !!localStorage.getItem('anthropic-api-key')

  // ── Helper: compute checklist progress ──
  const getPhaseProgress = (phase) => {
    let total = 0, done = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => { total++; if (checked[item.id]) done++ })
    })
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  const totalItems = phases.reduce((s, p) => s + p.categories.reduce((s2, c) => s2 + c.items.length, 0), 0)
  const totalChecked = Object.values(checked).filter(Boolean).length
  const overallPct = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0

  // ── 1. Onboarding / Getting Started ──
  if (!hasQuestionnaire) {
    recs.push({
      id: 'complete-questionnaire',
      text: 'Complete the Project Questionnaire',
      detail: 'Answer a few questions so the dashboard can personalize recommendations for your industry and goals.',
      action: () => setActiveView('dashboard'),
      actionLabel: 'Set Up',
      priority: 1,
      category: 'getting_started',
    })
  }

  if (!project.url) {
    recs.push({
      id: 'add-project-url',
      text: 'Add your website URL',
      detail: 'A URL is required for the Analyzer, Monitoring, and Metrics features to work.',
      action: () => setActiveView('settings'),
      actionLabel: 'Settings',
      priority: 1,
      category: 'getting_started',
    })
  }

  if (!hasApiKey) {
    recs.push({
      id: 'add-api-key',
      text: 'Add your Anthropic API key',
      detail: 'Required for AI-powered analysis, content writing, schema generation, and monitoring.',
      action: () => setActiveView('settings'),
      actionLabel: 'Settings',
      priority: 1,
      category: 'getting_started',
    })
  }

  // ── 2. Checklist Progress Intelligence ──
  if (phases && phases.length > 0) {
    if (overallPct === 0) {
      recs.push({
        id: 'start-checklist',
        text: 'Start the AEO Checklist',
        detail: `${totalItems} optimization tasks across ${phases.length} phases. Begin with Phase 1 to build your foundation.`,
        action: () => setActiveView('checklist'),
        actionLabel: 'Start',
        priority: 2,
        category: 'checklist',
      })
    } else if (overallPct > 0 && overallPct < 100) {
      // Find the phase with most progress to continue, or lowest incomplete phase
      const incompletePhases = phases
        .map((p, i) => ({ ...p, index: i, ...getPhaseProgress(p) }))
        .filter(p => p.pct < 100)

      const inProgress = incompletePhases.find(p => p.pct > 0 && p.pct < 100)
      const nextPhase = inProgress || incompletePhases[0]

      if (nextPhase) {
        recs.push({
          id: 'continue-checklist',
          text: `Continue ${nextPhase.title} (${nextPhase.pct}%)`,
          detail: `${nextPhase.done}/${nextPhase.total} items completed. ${nextPhase.total - nextPhase.done} remaining in this phase.`,
          action: () => setActiveView('checklist'),
          actionLabel: 'Continue',
          priority: 2,
          category: 'checklist',
        })
      }

      // If a phase is 100% done and next isn't started, suggest moving on
      const completedPhases = phases
        .map((p, i) => ({ ...p, index: i, ...getPhaseProgress(p) }))
        .filter(p => p.pct === 100)

      if (completedPhases.length > 0) {
        const nextUnstarted = incompletePhases.find(p => p.pct === 0)
        if (nextUnstarted) {
          recs.push({
            id: 'next-phase',
            text: `Start ${nextUnstarted.title}`,
            detail: `You completed Phase ${completedPhases[completedPhases.length - 1].number}! ${nextUnstarted.title} has ${nextUnstarted.total} tasks waiting.`,
            action: () => setActiveView('checklist'),
            actionLabel: 'Begin',
            priority: 3,
            category: 'checklist',
          })
        }
      }
    }

    // Milestone celebration + next steps at 50%/75%
    if (overallPct >= 50 && overallPct < 75) {
      recs.push({
        id: 'halfway-milestone',
        text: 'Halfway there! Run a metrics check',
        detail: `${overallPct}% complete. Now is a great time to measure your AEO progress and see what\'s improving.`,
        action: () => setActiveView('metrics'),
        actionLabel: 'Run Metrics',
        priority: 3,
        category: 'metrics',
      })
    }
  }

  // ── 3. Analyzer Intelligence ──
  if (!analyzerResults && project.url && hasApiKey) {
    recs.push({
      id: 'first-analysis',
      text: 'Run your first site analysis',
      detail: 'Scan your website for AEO issues — schema markup, content structure, and technical optimization.',
      action: () => setActiveView('analyzer'),
      actionLabel: 'Analyze',
      priority: 2,
      category: 'analysis',
    })
  }

  if (analyzerResults) {
    const score = analyzerResults.overallScore || 0
    if (score < 50) {
      recs.push({
        id: 'low-analyzer-score',
        text: `Site Analysis score is ${score}% — critical issues found`,
        detail: analyzerResults.topPriorities?.[0] || 'Review the analyzer results and fix the highest priority issues first.',
        action: () => setActiveView('analyzer'),
        actionLabel: 'Fix Issues',
        priority: 1,
        category: 'analysis',
      })
    } else if (score < 80) {
      recs.push({
        id: 'improve-analyzer-score',
        text: `Improve your site score from ${score}% to 80%+`,
        detail: analyzerResults.topPriorities?.[0] || 'Address remaining optimization opportunities to boost your AEO performance.',
        action: () => setActiveView('analyzer'),
        actionLabel: 'View Issues',
        priority: 3,
        category: 'analysis',
      })
    }

    // Suggest schema generator if analyzer found schema issues
    const hasSchemaIssues = (analyzerResults.topPriorities || []).some(
      p => typeof p === 'string' && (p.toLowerCase().includes('schema') || p.toLowerCase().includes('structured data'))
    )
    if (hasSchemaIssues) {
      recs.push({
        id: 'generate-schema',
        text: 'Generate missing schema markup',
        detail: 'Your site analysis found schema gaps. Use the Schema Generator to create structured data.',
        action: () => setActiveView('schema'),
        actionLabel: 'Generate',
        priority: 2,
        category: 'schema',
      })
    }
  }

  // ── 3b. Page Analysis Intelligence ──
  const pageAnalyses = project.pageAnalyses || {}
  const pageUrls = Object.keys(pageAnalyses)
  const pageCount = pageUrls.length

  if (pageCount > 0) {
    // Find worst page
    const pageEntries = Object.entries(pageAnalyses)
    let worstUrl = ''
    let worstScore = 101
    pageEntries.forEach(([url, data]) => {
      const score = data.overallScore ?? 100
      if (score < worstScore) {
        worstScore = score
        worstUrl = url
      }
    })

    const shortUrl = (() => {
      try {
        const parsed = new URL(worstUrl)
        return parsed.pathname === '/' || !parsed.pathname ? parsed.hostname : parsed.pathname
      } catch { return worstUrl }
    })()

    if (worstScore < 50) {
      recs.push({
        id: 'page-critical',
        text: `Your ${shortUrl} page scores ${worstScore} — focus here first`,
        detail: `This page has critical AEO issues. Improving it will have the highest impact on your overall AEO performance.`,
        action: () => setActiveView('analyzer'),
        actionLabel: 'View Page',
        priority: 1,
        category: 'analysis',
      })
    } else if (worstScore < 80) {
      recs.push({
        id: 'page-improve',
        text: `Improve ${shortUrl} from ${worstScore} to 80+`,
        detail: 'This is your lowest-scoring page. Bringing it above 80 will strengthen your overall AEO profile.',
        action: () => setActiveView('analyzer'),
        actionLabel: 'View Page',
        priority: 3,
        category: 'analysis',
      })
    }

    if (pageCount < 5) {
      recs.push({
        id: 'more-pages',
        text: `Only ${pageCount} page${pageCount === 1 ? '' : 's'} analyzed — add more for a complete picture`,
        detail: 'Analyze at least 5-10 key pages to understand your full AEO landscape and prioritize improvements.',
        action: () => setActiveView('analyzer'),
        actionLabel: 'Add Pages',
        priority: 3,
        category: 'analysis',
      })
    }
  } else if (analyzerResults && hasApiKey) {
    // Site analyzed but no individual pages
    recs.push({
      id: 'start-page-analysis',
      text: 'Analyze individual pages for detailed AEO scoring',
      detail: 'Your site-level analysis is done. Now add specific page URLs to see which pages need work and what to fix first.',
      action: () => setActiveView('analyzer'),
      actionLabel: 'Analyze Pages',
      priority: 3,
      category: 'analysis',
    })
  }

  // ── 3c. Content Ops Intelligence ──
  const calendarEntries = project.contentCalendar || []
  const contentBriefs = project.contentBriefs || []
  const todayStr = new Date().toISOString().split('T')[0]

  if (calendarEntries.length === 0 && hasQuestionnaire) {
    // Phase 3 has content tasks — nudge to schedule
    const phase3Checked = Object.keys(checked).filter(k => k.startsWith('p3-')).length
    const phase3Total = 16
    if (phase3Total - phase3Checked > 5) {
      recs.push({
        id: 'schedule-content',
        text: 'Schedule your content optimization work',
        detail: `You have ${phase3Total - phase3Checked} uncompleted content tasks. Use the Content Calendar to plan when to tackle each one.`,
        action: () => setActiveView('content-ops'),
        actionLabel: 'Open Calendar',
        priority: 3,
        category: 'content',
      })
    }
  }

  if (calendarEntries.length > 0) {
    const overdueCount = calendarEntries.filter(
      e => e.status !== 'published' && e.scheduledDate < todayStr
    ).length
    if (overdueCount > 0) {
      recs.push({
        id: 'overdue-content',
        text: `You have ${overdueCount} overdue content task${overdueCount === 1 ? '' : 's'}`,
        detail: 'Review your content calendar and reschedule or complete overdue items.',
        action: () => setActiveView('content-ops'),
        actionLabel: 'View Calendar',
        priority: 2,
        category: 'content',
      })
    }
  }

  if (contentBriefs.length === 0 && (project.contentHistory || []).length > 0 && hasApiKey) {
    recs.push({
      id: 'generate-brief',
      text: 'Generate content briefs for consistent AEO quality',
      detail: 'AI-powered briefs include heading structure, questions to answer, competitors to beat, and schema recommendations.',
      action: () => setActiveView('content-ops'),
      actionLabel: 'Generate Brief',
      priority: 3,
      category: 'content',
    })
  }

  // ── 4. Metrics Intelligence ──
  if (metricsHistory.length === 0 && project.url && hasApiKey) {
    recs.push({
      id: 'first-metrics',
      text: 'Run your first metrics analysis',
      detail: 'Track how AI engines cite your content — citations, engines, and visibility score.',
      action: () => setActiveView('metrics'),
      actionLabel: 'Run Metrics',
      priority: 2,
      category: 'metrics',
    })
  }

  if (metricsHistory.length >= 2) {
    const latest = metricsHistory[metricsHistory.length - 1]
    const previous = metricsHistory[metricsHistory.length - 2]
    const scoreDelta = (latest.overallScore || 0) - (previous.overallScore || 0)
    const citDelta = (latest.citations?.total || 0) - (previous.citations?.total || 0)

    if (scoreDelta < -10) {
      recs.push({
        id: 'score-dropped',
        text: `AEO Score dropped ${Math.abs(scoreDelta)} points`,
        detail: `Score went from ${previous.overallScore} to ${latest.overallScore}. Review recent changes and check monitoring for details.`,
        action: () => setActiveView('metrics'),
        actionLabel: 'Investigate',
        priority: 1,
        category: 'metrics',
      })
    } else if (scoreDelta > 10) {
      recs.push({
        id: 'score-improved',
        text: `Great news! AEO Score improved by ${scoreDelta} points`,
        detail: `Keep the momentum going. Your score is now ${latest.overallScore}/100.`,
        action: () => setActiveView('metrics'),
        actionLabel: 'View Details',
        priority: 4,
        category: 'metrics',
      })
    }

    if (citDelta < 0 && Math.abs(citDelta) > 2) {
      recs.push({
        id: 'citations-dropped',
        text: `Citations decreased by ${Math.abs(citDelta)}`,
        detail: 'Your content is being cited less by AI engines. Review content freshness and competitive positioning.',
        action: () => setActiveView('metrics'),
        actionLabel: 'View Metrics',
        priority: 2,
        category: 'metrics',
      })
    }

    // Stale metrics (last run > 14 days ago)
    const lastRun = latest.timestamp ? new Date(latest.timestamp) : null
    if (lastRun && Date.now() - lastRun.getTime() > 14 * 24 * 60 * 60 * 1000) {
      recs.push({
        id: 'stale-metrics',
        text: 'Metrics data is over 2 weeks old',
        detail: 'Run a fresh metrics check to see your current AEO performance.',
        action: () => setActiveView('metrics'),
        actionLabel: 'Refresh',
        priority: 2,
        category: 'metrics',
      })
    }
  }

  // ── 5. Monitoring Intelligence ──
  if (monitorHistory.length === 0 && (project.queryTracker?.length || 0) > 0) {
    recs.push({
      id: 'first-monitor',
      text: 'Run your first monitoring check',
      detail: `You have ${project.queryTracker.length} queries tracked. Check how they\'re performing across AI engines.`,
      action: () => setActiveView('monitoring'),
      actionLabel: 'Monitor',
      priority: 2,
      category: 'monitoring',
    })
  }

  if ((project.queryTracker?.length || 0) === 0 && project.url) {
    recs.push({
      id: 'add-queries',
      text: 'Add queries to track',
      detail: 'Set up AI search queries to monitor how your brand appears in AI-generated answers.',
      action: () => setActiveView('testing'),
      actionLabel: 'Add Queries',
      priority: 3,
      category: 'monitoring',
    })
  }

  if (monitorHistory.length >= 2) {
    const latest = monitorHistory[monitorHistory.length - 1]
    const previous = monitorHistory[monitorHistory.length - 2]
    const scoreDelta = (latest.overallScore || 0) - (previous.overallScore || 0)

    if (scoreDelta < -15) {
      recs.push({
        id: 'monitor-score-drop',
        text: `Citation score dropped ${Math.abs(scoreDelta)}% in monitoring`,
        detail: `Was ${previous.overallScore}%, now ${latest.overallScore}%. Check which queries lost citations.`,
        action: () => setActiveView('monitoring'),
        actionLabel: 'Investigate',
        priority: 1,
        category: 'monitoring',
      })
    }
  }

  // ── 6. Competitor Intelligence ──
  if (competitors.length === 0 && hasQuestionnaire) {
    recs.push({
      id: 'add-competitors',
      text: 'Add competitors to benchmark against',
      detail: 'Compare your AEO performance with competitors to find gaps and opportunities.',
      action: () => setActiveView('competitors'),
      actionLabel: 'Add',
      priority: 3,
      category: 'competitors',
    })
  }

  if (competitors.length > 0 && !project.competitorAnalysis) {
    recs.push({
      id: 'run-competitor-analysis',
      text: `Analyze your ${competitors.length} competitors`,
      detail: 'Run a competitive analysis to see how your AEO stacks up.',
      action: () => setActiveView('competitors'),
      actionLabel: 'Analyze',
      priority: 3,
      category: 'competitors',
    })
  }

  // 6b. Competitor monitoring intelligence
  const compMonitorHistory = project.competitorMonitorHistory || []
  const compAlerts = project.competitorAlerts || []
  const undismissedAlerts = compAlerts.filter(a => !a.dismissed)

  if (competitors.length > 0 && compMonitorHistory.length === 0 && hasApiKey) {
    recs.push({
      id: 'start-competitor-monitor',
      text: 'Start tracking competitor AEO scores over time',
      detail: 'Monitor how competitor scores change and get alerts when significant shifts happen.',
      action: () => setActiveView('competitors'),
      actionLabel: 'Monitor',
      priority: 3,
      category: 'competitors',
    })
  }

  if (undismissedAlerts.length > 0) {
    const topAlert = undismissedAlerts[0]
    recs.push({
      id: 'competitor-alert',
      text: `${topAlert.competitorName} ${topAlert.type === 'score_jump' ? 'improved' : 'dropped'} by ${Math.abs(topAlert.delta)} points`,
      detail: `Score went from ${topAlert.previousScore} to ${topAlert.currentScore}. Analyze what changed and apply learnings to your site.`,
      action: () => setActiveView('competitors'),
      actionLabel: 'Review Alert',
      priority: 1,
      category: 'competitors',
    })
  }

  // 6c. Citation share intelligence
  const citationHistory = project.citationShareHistory || []

  if (competitors.length > 0 && citationHistory.length === 0 && hasApiKey) {
    recs.push({
      id: 'check-citation-share',
      text: 'Check which brands AI engines cite for your industry',
      detail: 'Run a citation share check to see how your brand visibility compares to competitors across AI platforms.',
      action: () => setActiveView('competitors'),
      actionLabel: 'Check Citations',
      priority: 3,
      category: 'competitors',
    })
  }

  if (citationHistory.length > 0) {
    const latestCitation = citationHistory[citationHistory.length - 1]
    const ownBrand = Object.values(latestCitation.brands || {}).find(b => b.isOwn)
    if (ownBrand && ownBrand.sharePercent < 15) {
      recs.push({
        id: 'low-citation-share',
        text: `Your citation share is only ${ownBrand.sharePercent}% — competitors are getting more AI visibility`,
        detail: 'Focus on content authority, schema markup, and freshness to increase how often AI engines cite your brand.',
        action: () => setActiveView('competitors'),
        actionLabel: 'View Share',
        priority: 2,
        category: 'competitors',
      })
    }
  }

  // ── 7. Content Suggestions ──
  if (project.contentHistory?.length === 0 && hasApiKey) {
    recs.push({
      id: 'write-first-content',
      text: 'Generate your first AEO-optimized content',
      detail: 'Use the AI Content Writer to create FAQ pages, how-to guides, or comparison articles optimized for AI citations.',
      action: () => setActiveView('writer'),
      actionLabel: 'Write',
      priority: 3,
      category: 'content',
    })
  }

  if (project.schemaHistory?.length === 0 && hasApiKey) {
    recs.push({
      id: 'generate-first-schema',
      text: 'Generate structured data for your pages',
      detail: 'Schema markup helps AI engines understand your content. Generate JSON-LD for your key pages.',
      action: () => setActiveView('schema'),
      actionLabel: 'Generate',
      priority: 3,
      category: 'schema',
    })
  }

  // ── 8. Questionnaire-based (if completed) ──
  if (hasQuestionnaire) {
    if (q.industry === 'ecommerce' && !analyzerResults) {
      recs.push({
        id: 'ecommerce-schema',
        text: 'Scan your product pages for schema markup',
        detail: 'E-commerce sites need Product, Offer, and Review schemas to appear in AI shopping results.',
        action: () => setActiveView('analyzer'),
        actionLabel: 'Scan',
        priority: 2,
        category: 'schema',
      })
    }

    if ((q.industry === 'healthcare' || q.industry === 'finance' || q.industry === 'legal') && overallPct < 30) {
      recs.push({
        id: 'regulated-eeat',
        text: 'Prioritize E-E-A-T and Trust signals',
        detail: `In ${INDUSTRY_LABELS[q.industry]}, AI engines heavily weight expertise and authority. Focus on Phase 5 items.`,
        action: () => setActiveView('checklist'),
        actionLabel: 'Checklist',
        priority: 1,
        category: 'checklist',
      })
    }
  }

  // ── Deduplicate, sort, and return top 6 ──
  const seen = new Set()
  const unique = recs.filter(r => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })

  return unique.sort((a, b) => a.priority - b.priority).slice(0, 6)
}

/* ── Get Industry Context for Analyzer ── */
export function getAnalyzerIndustryContext(questionnaire) {
  if (!questionnaire?.completedAt || !questionnaire.industry) return ''

  const parts = []
  parts.push(`This is a ${INDUSTRY_LABELS[questionnaire.industry] || questionnaire.industry} website`)
  if (questionnaire.audience) parts[0] += ` targeting a ${AUDIENCE_LABELS[questionnaire.audience] || questionnaire.audience} audience`
  if (questionnaire.region) parts[0] += ` in ${REGION_LABELS[questionnaire.region] || questionnaire.region}`
  parts[0] += '.'

  if (questionnaire.industry === 'ecommerce') {
    parts.push('Prioritize Product, Offer, and Review schema types. Check for shopping-query optimized content.')
  } else if (questionnaire.industry === 'healthcare') {
    parts.push('Prioritize E-E-A-T signals, MedicalCondition/Drug schema, and accuracy of health claims.')
  } else if (questionnaire.industry === 'finance') {
    parts.push('Prioritize FinancialProduct schema, regulatory compliance signals, and trust indicators.')
  } else if (questionnaire.industry === 'legal') {
    parts.push('Prioritize LegalService schema, attorney credentials, and jurisdiction-specific content.')
  } else if (questionnaire.industry === 'saas') {
    parts.push('Prioritize SoftwareApplication schema, feature comparison content, and integration documentation.')
  } else if (questionnaire.industry === 'localbusiness') {
    parts.push('Prioritize LocalBusiness schema, Google Business Profile optimization, and local keyword targeting.')
  }

  if (questionnaire.contentType === 'blog') {
    parts.push('Focus on Article schema and question-answer content patterns.')
  } else if (questionnaire.contentType === 'docs') {
    parts.push('Focus on TechArticle schema and step-by-step instructional content.')
  } else if (questionnaire.contentType === 'product') {
    parts.push('Focus on Product schema and comparison/review content patterns.')
  }

  return '\n\nAdditional context: ' + parts.join(' ')
}
