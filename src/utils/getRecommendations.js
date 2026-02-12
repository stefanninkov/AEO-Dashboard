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

/* ── Get Recommendations ── */
export function getRecommendations(questionnaire, setActiveView) {
  if (!questionnaire?.completedAt) return []

  const recs = []

  // Maturity-based
  if (questionnaire.maturity === 'beginner') {
    recs.push({
      id: 'start-phase-1',
      text: 'Start with Phase 1: Foundation & Audit',
      detail: 'As a beginner, getting the fundamentals right is the most impactful first step.',
      action: () => setActiveView('checklist'),
      actionLabel: 'Go to Checklist',
      priority: 1,
    })
  } else if (questionnaire.maturity === 'basics' || questionnaire.maturity === 'intermediate') {
    recs.push({
      id: 'content-technical',
      text: 'Focus on Content & Technical Optimization (Phase 3-4)',
      detail: 'You have the basics — now optimize your content structure and technical setup for AI engines.',
      action: () => setActiveView('checklist'),
      actionLabel: 'Go to Checklist',
      priority: 2,
    })
  }

  // Schema check
  if (questionnaire.hasSchema === 'no' || questionnaire.hasSchema === 'unknown') {
    recs.push({
      id: 'run-analyzer',
      text: 'Run the Site Analyzer to check your schema',
      detail: 'Schema markup is critical for AI visibility. Scan your site to see what\'s missing.',
      action: () => setActiveView('analyzer'),
      actionLabel: 'Go to Analyzer',
      priority: 1,
    })
  }

  // Goal: citations
  if (questionnaire.primaryGoal === 'citations') {
    recs.push({
      id: 'setup-tracking',
      text: 'Set up query tracking for citation monitoring',
      detail: 'Track how your content appears when users ask AI about topics you cover.',
      action: () => setActiveView('testing'),
      actionLabel: 'Go to Testing',
      priority: 2,
    })
  }

  // Goal: brand
  if (questionnaire.primaryGoal === 'brand') {
    recs.push({
      id: 'authority-signals',
      text: 'Strengthen Authority signals (Phase 5)',
      detail: 'For brand positioning, focus on E-E-A-T signals, author credentials, and external citations.',
      action: () => setActiveView('checklist'),
      actionLabel: 'Go to Checklist',
      priority: 2,
    })
  }

  // Target engines
  if (questionnaire.targetEngines?.length > 0 && !questionnaire.targetEngines.includes('all')) {
    const names = questionnaire.targetEngines.map(e => ENGINE_LABELS[e] || e).join(', ')
    recs.push({
      id: 'track-engines',
      text: `Track your visibility on ${names}`,
      detail: 'Run metrics analysis to see how your site performs on your priority AI engines.',
      action: () => setActiveView('metrics'),
      actionLabel: 'Go to Metrics',
      priority: 3,
    })
  }

  // Industry-specific
  if (questionnaire.industry === 'ecommerce') {
    recs.push({
      id: 'product-schema',
      text: 'Prioritize Product & Offer schema markup',
      detail: 'E-commerce sites benefit hugely from structured product data for AI shopping queries.',
      action: () => setActiveView('checklist'),
      actionLabel: 'Go to Checklist',
      priority: 2,
    })
  }
  if (questionnaire.industry === 'healthcare' || questionnaire.industry === 'finance' || questionnaire.industry === 'legal') {
    recs.push({
      id: 'eeat-focus',
      text: 'Focus on E-E-A-T and Trust signals',
      detail: `In ${INDUSTRY_LABELS[questionnaire.industry]}, AI engines heavily weight expertise and authority. Prioritize credentials, citations, and accuracy.`,
      action: () => setActiveView('checklist'),
      actionLabel: 'Go to Checklist',
      priority: 1,
    })
  }

  // Competitor benchmarking
  if (questionnaire.industry && INDUSTRY_COMPETITORS[questionnaire.industry]) {
    recs.push({
      id: 'benchmark-competitors',
      text: 'Benchmark against industry leaders',
      detail: `See how your AEO compares to top ${INDUSTRY_LABELS[questionnaire.industry]} competitors.`,
      action: () => setActiveView('competitors'),
      actionLabel: 'Go to Competitors',
      priority: 3,
    })
  }

  // Sort by priority and return top 4
  return recs.sort((a, b) => a.priority - b.priority).slice(0, 4)
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
