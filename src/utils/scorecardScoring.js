// ══════════════════════════════════════════════
// SCORECARD SCORING ENGINE
// Single source of truth for questions, scoring,
// tiers, lead qualification, and recommendations.
// All display text lives in i18n — this file
// defines structure, points, and logic only.
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════

export const CATEGORIES = [
  { id: 'contentStructure', label: 'Content & Structure', color: 'var(--color-phase-1)', maxScore: 9 },
  { id: 'technicalSchema', label: 'Technical & Schema', color: 'var(--color-phase-2)', maxScore: 9 },
  { id: 'aiVisibility', label: 'AI Visibility', color: 'var(--color-phase-3)', maxScore: 9 },
  { id: 'strategyCompetition', label: 'Strategy & Competition', color: 'var(--color-phase-5)', maxScore: 6 },
]

export const MAX_TOTAL_SCORE = 33

// ══════════════════════════════════════════════
// SCORED QUESTIONS (11 total, max 33 points)
// ══════════════════════════════════════════════
// i18n key pattern: scorecard.questions.{id}.text / .options.{0|1|2}

export const SCORED_QUESTIONS = [
  // ─── Content & Structure (3 Qs, max 9 pts) ───
  { id: 'q1', category: 'contentStructure', text: 'Does your content include direct answer paragraphs for common questions?', options: [
    { value: 'yes_most', points: 3, label: 'Yes, on most pages' },
    { value: 'some', points: 2, label: 'On some pages' },
    { value: 'no', points: 0, label: 'No / Not sure' },
  ]},
  { id: 'q2', category: 'contentStructure', text: 'How often do you publish or update content?', options: [
    { value: 'weekly', points: 3, label: 'Weekly or more' },
    { value: 'monthly', points: 2, label: 'Monthly' },
    { value: 'rarely', points: 0, label: 'Rarely or never' },
  ]},
  { id: 'q3', category: 'contentStructure', text: 'Do you create content specifically to appear in AI answers?', options: [
    { value: 'yes_specific', points: 3, label: 'Yes, we write for this specifically' },
    { value: 'naturally', points: 2, label: 'Some of our content does naturally' },
    { value: 'no', points: 0, label: 'We haven\'t thought about this' },
  ]},

  // ─── Technical & Schema (3 Qs, max 9 pts) ───
  { id: 'q4', category: 'technicalSchema', text: 'Do you use structured data / schema markup on your site?', options: [
    { value: 'multiple', points: 3, label: 'Yes, multiple types (FAQ, Article, HowTo...)' },
    { value: 'basic', points: 2, label: 'Basic only (Organization, Breadcrumb)' },
    { value: 'none', points: 0, label: 'No / Don\'t know' },
  ]},
  { id: 'q5', category: 'technicalSchema', text: 'Can AI crawlers (GPTBot, PerplexityBot, etc.) access your site?', options: [
    { value: 'all_allowed', points: 3, label: 'Yes, they\'re all allowed' },
    { value: 'some_checked', points: 2, label: 'I\'ve checked some' },
    { value: 'no', points: 0, label: 'No / What\'s that?' },
  ]},
  { id: 'q6', category: 'technicalSchema', text: 'Do you have an XML sitemap with accurate lastmod dates?', options: [
    { value: 'auto_updated', points: 3, label: 'Yes, auto-updated' },
    { value: 'exists_unsure', points: 2, label: 'Yes, but not sure about lastmod' },
    { value: 'no', points: 0, label: 'No / Don\'t know' },
  ]},

  // ─── AI Visibility (3 Qs, max 9 pts) ───
  { id: 'q7', category: 'aiVisibility', text: 'Do you check if your brand appears in AI engine responses?', options: [
    { value: 'regularly', points: 3, label: 'Yes, we monitor this regularly' },
    { value: 'few_times', points: 2, label: 'I\'ve checked a few times' },
    { value: 'never', points: 0, label: 'Never' },
  ]},
  { id: 'q8', category: 'aiVisibility', text: 'Do you track referral traffic from AI engines?', options: [
    { value: 'track', points: 3, label: 'Yes, we track this' },
    { value: 'noticed', points: 2, label: 'I\'ve noticed some' },
    { value: 'no_idea', points: 0, label: 'No idea' },
  ]},
  { id: 'q9', category: 'aiVisibility', text: 'Have you set up llms.txt or similar AI-specific discoverability files?', options: [
    { value: 'setup', points: 3, label: 'Yes, we have this set up' },
    { value: 'planning', points: 1, label: 'Planning to' },
    { value: 'no', points: 0, label: 'No' },
  ]},

  // ─── Strategy & Competition (2 Qs, max 6 pts) ───
  { id: 'q10', category: 'strategyCompetition', text: 'Do you know if your competitors appear in AI answers?', options: [
    { value: 'monitor', points: 3, label: 'Yes, we monitor this' },
    { value: 'checked', points: 2, label: 'I\'ve checked a few' },
    { value: 'no', points: 0, label: 'No' },
  ]},
  { id: 'q11', category: 'strategyCompetition', text: 'Is Answer Engine Optimization part of your marketing strategy?', options: [
    { value: 'roadmap', points: 3, label: 'Yes, it\'s part of our roadmap' },
    { value: 'exploring', points: 2, label: 'We\'re exploring it' },
    { value: 'seo_only', points: 0, label: 'No, SEO only' },
  ]},
]

// ══════════════════════════════════════════════
// QUALIFYING QUESTIONS (3 total, NOT scored)
// ══════════════════════════════════════════════

export const QUALIFYING_QUESTIONS = [
  { id: 'role', text: 'What best describes your role?', options: [
    { value: 'agency_owner', leadPoints: 4, label: 'Agency owner / Partner' },
    { value: 'seo_director', leadPoints: 3, label: 'SEO Manager / Director at agency' },
    { value: 'inhouse', leadPoints: 2, label: 'In-house marketing / SEO' },
    { value: 'freelancer', leadPoints: 2, label: 'Freelance consultant' },
    { value: 'other', leadPoints: 0, label: 'Other / Just exploring' },
  ]},
  { id: 'websiteCount', text: 'How many websites do you manage?', options: [
    { value: '10+', leadPoints: 4, label: '10+ client websites' },
    { value: '3-9', leadPoints: 3, label: '3-9 websites' },
    { value: '1-2', leadPoints: 1, label: '1-2 websites' },
    { value: 'own', leadPoints: 0, label: 'Just my own' },
  ]},
  { id: 'timeline', text: 'When are you looking to implement AEO?', options: [
    { value: 'immediately', leadPoints: 4, label: 'Immediately — this is urgent' },
    { value: '1-3months', leadPoints: 2, label: 'Within 1-3 months' },
    { value: 'exploring', leadPoints: 1, label: 'Exploring for the future' },
    { value: 'curious', leadPoints: 0, label: 'Just curious for now' },
  ]},
]

// ══════════════════════════════════════════════
// QUIZ FLOW — interleaves scored + qualifying
// ══════════════════════════════════════════════

export const QUIZ_FLOW = [
  { type: 'scored', id: 'q1' },          // Content: FAQ sections?
  { type: 'scored', id: 'q2' },          // Content: Update frequency?
  { type: 'scored', id: 'q3' },          // Content: AI-friendly answers?
  { type: 'qualifying', id: 'role' },     // ← "What describes you?"
  { type: 'scored', id: 'q4' },          // Tech: Schema markup?
  { type: 'scored', id: 'q5' },          // Tech: AI crawlers?
  { type: 'scored', id: 'q6' },          // Tech: Sitemap?
  { type: 'scored', id: 'q7' },          // Visibility: AI engine testing?
  { type: 'scored', id: 'q8' },          // Visibility: AI Overviews?
  { type: 'qualifying', id: 'websiteCount' }, // ← "How many sites?"
  { type: 'scored', id: 'q9' },          // Visibility: AI traffic tracking?
  { type: 'scored', id: 'q10' },         // Strategy: Competitor AI?
  { type: 'scored', id: 'q11' },         // Strategy: AEO strategy?
  { type: 'qualifying', id: 'timeline' }, // ← "When implement?"
]
// Total: 14 question steps + 1 capture step + 1 results step = 16 steps

// ══════════════════════════════════════════════
// SCORE TIERS (AEO Readiness)
// ══════════════════════════════════════════════

export const SCORE_TIERS = [
  { id: 'invisible', min: 0,  max: 10, color: '#EF4444', bgColor: 'rgba(239,68,68,0.08)' },
  { id: 'starting',  min: 11, max: 20, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.08)' },
  { id: 'onTrack',   min: 21, max: 27, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)' },
  { id: 'aiReady',   min: 28, max: 33, color: '#10B981', bgColor: 'rgba(16,185,129,0.08)' },
]

export function getScoreTier(score) {
  return SCORE_TIERS.find(t => score >= t.min && score <= t.max) || SCORE_TIERS[0]
}

// ══════════════════════════════════════════════
// LEAD SCORING + TIER
// ══════════════════════════════════════════════
//
// Lead score is SEPARATE from AEO score.
// - AEO score (0-33): measures their WEBSITE readiness
// - Lead score (0-12): measures their BUSINESS value as a customer
//
// Lead score comes from 3 qualifying questions:
//   role (0-4) + websiteCount (0-4) + timeline (0-4) = max 12
//
// LEAD TIERS:
//   🔥 HOT  (9-12): Agency owner/director + 10+ sites + Immediately
//   🟡 WARM (5-8):  Freelancer/in-house + some sites + near-term
//   ⚪ COLD (0-4):  Other/curious + own site + exploring

export const LEAD_TIERS = {
  hot:  { min: 9, max: 12, color: '#EF4444', bgColor: 'rgba(239,68,68,0.08)', emoji: '🔥' },
  warm: { min: 5, max: 8,  color: '#F59E0B', bgColor: 'rgba(245,158,11,0.08)', emoji: '🟡' },
  cold: { min: 0, max: 4,  color: '#6B7280', bgColor: 'rgba(107,114,128,0.08)', emoji: '⚪' },
}

export function computeLeadScore(qualifyingAnswers) {
  let score = 0
  QUALIFYING_QUESTIONS.forEach(q => {
    const answer = qualifyingAnswers[q.id]
    if (answer) {
      const option = q.options.find(o => o.value === answer)
      if (option) score += option.leadPoints
    }
  })
  return score
}

export function getLeadTier(leadScore) {
  if (leadScore >= LEAD_TIERS.hot.min) return 'hot'
  if (leadScore >= LEAD_TIERS.warm.min) return 'warm'
  return 'cold'
}

// ══════════════════════════════════════════════
// COMPUTE SCORES FROM ANSWERS
// ══════════════════════════════════════════════

export function computeScores(answers) {
  const categoryScores = {}
  CATEGORIES.forEach(c => { categoryScores[c.id] = 0 })
  let totalScore = 0

  SCORED_QUESTIONS.forEach(q => {
    const answer = answers[q.id]
    if (answer) {
      const option = q.options.find(o => o.value === answer)
      if (option) {
        categoryScores[q.category] += option.points
        totalScore += option.points
      }
    }
  })

  return { totalScore, categoryScores }
}

// ══════════════════════════════════════════════
// PRIORITY RECOMMENDATIONS
// ══════════════════════════════════════════════

export const PRIORITY_MAP = {
  contentStructure: [
    { id: 'add_faq_sections', minMissing: 3 },
    { id: 'increase_publish_frequency', minMissing: 2 },
    { id: 'write_direct_answers', minMissing: 1 },
  ],
  technicalSchema: [
    { id: 'add_schema_markup', minMissing: 3 },
    { id: 'check_ai_crawlers', minMissing: 2 },
    { id: 'add_sitemap_lastmod', minMissing: 1 },
  ],
  aiVisibility: [
    { id: 'test_ai_citations', minMissing: 3 },
    { id: 'track_ai_overviews', minMissing: 2 },
    { id: 'setup_ai_traffic_tracking', minMissing: 1 },
  ],
  strategyCompetition: [
    { id: 'monitor_competitors_ai', minMissing: 2 },
    { id: 'create_aeo_strategy', minMissing: 1 },
  ],
}

export function getTopPriorities(categoryScores, maxPriorities = 3) {
  const gaps = CATEGORIES.map(cat => ({
    categoryId: cat.id,
    gap: cat.maxScore - (categoryScores[cat.id] || 0),
    maxScore: cat.maxScore,
    score: categoryScores[cat.id] || 0,
  })).sort((a, b) => b.gap - a.gap)

  const priorities = []
  for (const g of gaps) {
    if (priorities.length >= maxPriorities || g.gap <= 0) continue
    const pList = PRIORITY_MAP[g.categoryId] || []
    for (const p of pList) {
      if (priorities.length >= maxPriorities) break
      if (g.gap >= p.minMissing) {
        priorities.push({ ...p, categoryId: g.categoryId })
        break
      }
    }
  }
  return priorities
}
