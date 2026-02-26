/**
 * Email Templates — 12 pre-built templates for waitlist outreach.
 *
 * Template variables:
 * {name} {email} {score} {maxScore} {tierLabel} {weakestCategory}
 * {websiteCount} {role} {priority1} {priority2} {priority3}
 * {link} {customField1} {customField2} {customField3}
 *
 * DESIGN POLICY: No emojis. All visual indicators use lucide-react icons.
 */
import {
  Flame, Circle, CircleDot, Mail, Rocket, Ticket,
  BarChart3, DollarSign, Newspaper, TrendingUp, Trophy, RefreshCw,
} from 'lucide-react'

// ── OUTREACH (4) ──

const hotLeadOutreach = {
  id: 'hot_lead_outreach',
  name: 'Hot Lead — Personal Outreach',
  icon: Flame,
  description: 'Direct, personal message for high-scoring leads with strong buying signals.',
  recommendedAudience: ['hot'],
  subject: '{name}, your AEO score puts you ahead of 95% of websites',
  body: `Hi {name},

I noticed you just took the AEO Readiness Assessment and scored {score}/{maxScore} ({tierLabel}). That puts you well ahead of most websites we see.

You manage {websiteCount} and your weakest area was {weakestCategory} — which is actually one of the easiest things to fix with the right tools.

I'm building AEO Dashboard specifically for agencies like yours. Would love to get your feedback on what we're building.

Got 15 minutes this week for a quick call?

— Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const warmLeadNurture = {
  id: 'warm_lead_nurture',
  name: 'Warm Lead — Value + Nurture',
  icon: Circle,
  description: 'Provide value and build trust with moderately qualified leads.',
  recommendedAudience: ['warm'],
  subject: '{name}, 3 quick wins to improve your AEO score from {score}',
  body: `Hi {name},

Thanks for taking the AEO Readiness Assessment. You scored {score}/{maxScore} ({tierLabel}) — solid foundation, but room to grow.

Based on your results, here are your top 3 priorities:

1. {priority1}
2. {priority2}
3. {priority3}

These are exactly the kinds of things AEO Dashboard automates. We're building tools that fix these gaps in minutes, not weeks.

Want to be first in line when we launch? You're already on the list — I'll personally notify you.

— Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const coldLeadEducate = {
  id: 'cold_lead_educate',
  name: 'Cold Lead — Educate',
  icon: CircleDot,
  description: 'Educational approach for early-stage leads who need awareness.',
  recommendedAudience: ['cold'],
  subject: 'Why AI search engines can\'t find your website, {name}',
  body: `Hi {name},

You recently took the AEO Readiness Assessment and scored {score}/{maxScore} ({tierLabel}).

Here's what that means: AI search engines like ChatGPT, Perplexity, and Google AI Overviews are rapidly becoming how people find information — and right now, they can't find your content.

The three biggest gaps holding you back:

1. {priority1}
2. {priority2}
3. {priority3}

The good news? These are all fixable, and the earlier you start, the bigger your competitive advantage.

I'm building AEO Dashboard to make this easy. Want me to send you a free guide on getting started?

— Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const abandonedQuizNudge = {
  id: 'abandoned_quiz_nudge',
  name: 'Abandoned Quiz — Nudge',
  icon: Mail,
  description: 'Re-engage leads who started but didn\'t finish the assessment.',
  recommendedAudience: ['abandoned'],
  subject: '{name}, your AEO assessment is waiting',
  body: `Hi {name},

I noticed you started the AEO Readiness Assessment but didn't finish it. No worries — it happens!

The assessment only takes about 2 minutes, and you'll get:
\u2022 Your AEO Readiness Score (0-33)
\u2022 A breakdown across 4 key categories
\u2022 Your top 3 priorities to improve AI visibility

Pick up where you left off: {link}

The insights are worth it — 77% of people who complete it find at least one critical gap they didn't know about.

— Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

// ── LAUNCH & PRODUCT (4) ──

const productLaunch = {
  id: 'product_launch',
  name: 'Product Launch Announcement',
  icon: Rocket,
  description: 'Announce AEO Dashboard launch to all leads.',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'AEO Dashboard is live \u2014 your early access is ready, {name}',
  body: `Hi {name},

Great news \u2014 AEO Dashboard is officially live.

When you took the AEO Readiness Assessment, you scored {score}/33 ({tierLabel}). Your #1 priority was {priority1} \u2014 and AEO Dashboard now fixes that automatically.

Here's what you can do right now:
\u2192 Run a full deterministic AEO audit on any URL (no API key needed)
\u2192 Check if AI crawlers can access your site
\u2192 Generate optimized schema markup in seconds
\u2192 Track your AI citation performance over time.

Your early access is ready. Log in here: {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const betaInvite = {
  id: 'beta_invite',
  name: 'Exclusive Beta Invite',
  icon: Ticket,
  description: 'Invite high-value leads to beta test before public launch.',
  recommendedAudience: ['hot'],
  subject: 'You\'re in, {name} \u2014 AEO Dashboard beta access',
  body: `Hi {name},

I'm inviting a small group of agencies to beta test AEO Dashboard before public launch.

Based on your assessment ({score}/33) and the fact that you manage {websiteCount}, I think you'd be a great fit.

What you get:
\u2192 Full access to all features during beta
\u2192 Direct line to me for feedback and support
\u2192 Locked-in early adopter pricing when we launch
\u2192 Your input shapes the product roadmap.

Interested? Reply to this email and I'll set up your account today.

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const scoreFollowUp = {
  id: 'score_follow_up',
  name: 'Score Follow-Up',
  icon: BarChart3,
  description: 'Personalized follow-up with action plan based on their score.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Your AEO score: {score}/33 \u2014 here\'s your action plan, {name}',
  body: `Hi {name},

A quick follow-up on your AEO Readiness Assessment.

You scored {score}/33 ({tierLabel}). Here's what I'd prioritize if I were managing your {websiteCount}:

1. {priority1}
2. {priority2}
3. {priority3}

These three changes alone could significantly improve your AI search visibility.

Want help getting started? Reply and I'll point you to the right resources.

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

const earlyBirdPricing = {
  id: 'early_bird_pricing',
  name: 'Early Bird / Pricing',
  icon: DollarSign,
  description: 'Urgency-driven pricing announcement with deadline.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'Early bird pricing ends soon \u2014 {name}, lock in your rate',
  body: `Hi {name},

AEO Dashboard is moving to full pricing on {customField1}.

As an early assessment taker, you can lock in our founding member rate:
\u2192 {customField2}

This includes everything: unlimited URL audits, schema generation, AI crawler monitoring, citation tracking, and PDF reports for your clients.

You manage {websiteCount} \u2014 at this price, the ROI is immediate.

Lock in your rate: {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Pricing deadline date', defaultValue: 'March 31, 2026' },
    { id: 'customField2', label: 'Pricing details', defaultValue: '$49/month (regular $99/month)' },
  ],
}

// ── MARKETING & ENGAGEMENT (4) ──

const featureUpdate = {
  id: 'feature_update',
  name: 'Feature Update / Newsletter',
  icon: Newspaper,
  description: 'Announce new features, relevant to their weakest category.',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'New in AEO Dashboard: {customField1}',
  body: `Hi {name},

Quick update \u2014 we just shipped something I think you'll find useful:

{customField2}

This is especially relevant for you because when you took the assessment, {weakestCategory} was your biggest gap. This feature directly addresses that.

Check it out: {link}

What would you like to see next? Hit reply \u2014 I read every response.

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Feature name', defaultValue: '' },
    { id: 'customField2', label: 'Feature description (2-3 sentences)', defaultValue: '' },
  ],
}

const industryInsight = {
  id: 'industry_insight',
  name: 'Industry Insight / Educational',
  icon: TrendingUp,
  description: 'Educational content to warm up cold/warm leads.',
  recommendedAudience: ['cold', 'warm'],
  subject: '{customField1}',
  body: `Hi {name},

{customField2}

This matters for your website because AI search engines now handle millions of queries daily \u2014 and the way they select sources is fundamentally different from traditional SEO.

When you took the AEO assessment, you scored {score}/33. The good news: even small improvements can make a big difference at this stage.

Want to see where you stand now? Retake the assessment: {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Email subject line', defaultValue: '' },
    { id: 'customField2', label: 'Opening paragraph (industry insight/stat)', defaultValue: '' },
  ],
}

const caseStudy = {
  id: 'case_study',
  name: 'Case Study / Social Proof',
  icon: Trophy,
  description: 'Share a success story relevant to their profile.',
  recommendedAudience: ['hot', 'warm'],
  subject: 'How {customField1} improved their AEO score by {customField2} points',
  body: `Hi {name},

Quick case study I wanted to share:

{customField3}

Your current score is {score}/33 ({tierLabel}). Based on your profile \u2014 {role} managing {websiteCount} \u2014 you're in a similar position to where they started.

Want to see what similar improvements could look like for your sites? {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [
    { id: 'customField1', label: 'Company/person name', defaultValue: '' },
    { id: 'customField2', label: 'Points improved', defaultValue: '' },
    { id: 'customField3', label: 'Case study paragraph (3-4 sentences)', defaultValue: '' },
  ],
}

const reEngagement = {
  id: 're_engagement',
  name: 'Re-engagement',
  icon: RefreshCw,
  description: 'Win back inactive leads (30+ days since signup).',
  recommendedAudience: ['hot', 'warm', 'cold'],
  subject: 'Still thinking about AEO, {name}?',
  body: `Hi {name},

It's been a while since you took the AEO Readiness Assessment (you scored {score}/33).

A lot has changed in AI search since then:
\u2192 Google AI Overviews now appear in 40%+ of searches
\u2192 ChatGPT search is growing 10x month-over-month
\u2192 Perplexity just passed 100M monthly queries

Your competitors are optimizing. Are you?

Retake your assessment to see your updated score: {link}

\u2014 Stefan, Founder, AEO Dashboard`,
  customFields: [],
}

// ── EXPORTS ──

export const EMAIL_TEMPLATES = [
  // Outreach
  hotLeadOutreach,
  warmLeadNurture,
  coldLeadEducate,
  abandonedQuizNudge,
  // Launch & Product
  productLaunch,
  betaInvite,
  scoreFollowUp,
  earlyBirdPricing,
  // Marketing & Engagement
  featureUpdate,
  industryInsight,
  caseStudy,
  reEngagement,
]

export const TEMPLATE_GROUPS = [
  { label: 'Outreach', ids: ['hot_lead_outreach', 'warm_lead_nurture', 'cold_lead_educate', 'abandoned_quiz_nudge'] },
  { label: 'Launch & Product', ids: ['product_launch', 'beta_invite', 'score_follow_up', 'early_bird_pricing'] },
  { label: 'Marketing & Engagement', ids: ['feature_update', 'industry_insight', 'case_study', 're_engagement'] },
]

export function getTemplateById(id) {
  return EMAIL_TEMPLATES.find(t => t.id === id) || null
}

export function getTemplatesForAudience(audience) {
  return EMAIL_TEMPLATES.filter(t => t.recommendedAudience.includes(audience))
}

/**
 * Replace {variables} in a template string with actual values.
 * Missing variables are left as-is (e.g., {customField1} stays if not provided).
 */
export function fillTemplate(text, variables = {}) {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined && variables[key] !== null && variables[key] !== ''
      ? variables[key]
      : match
  })
}

/**
 * Build variables object from a lead document + custom overrides.
 */
export function buildLeadVariables(lead, overrides = {}) {
  const scorecard = lead.scorecard || {}
  const qualification = lead.qualification || {}
  const priorities = scorecard.priorities || []

  // Determine weakest category
  const cats = scorecard.categoryScores || {}
  let weakestCategory = ''
  let lowestPct = Infinity
  for (const [catId, score] of Object.entries(cats)) {
    const maxMap = { contentStructure: 9, technicalSchema: 9, aiVisibility: 9, strategyCompetition: 6 }
    const pct = (maxMap[catId] || 1) > 0 ? score / (maxMap[catId] || 1) : 1
    if (pct < lowestPct) { lowestPct = pct; weakestCategory = catId }
  }
  const catLabels = {
    contentStructure: 'Content & Structure',
    technicalSchema: 'Technical & Schema',
    aiVisibility: 'AI Visibility',
    strategyCompetition: 'Strategy & Competition',
  }

  // Role label
  const roleLabels = {
    agency_owner: 'Agency Owner / Partner',
    seo_manager: 'SEO Manager / Director',
    inhouse: 'In-house Marketing / SEO',
    freelance: 'Freelance Consultant',
    other: 'Other',
  }

  // Website count label
  const websiteLabels = {
    '10plus': '10+ client websites',
    '3to9': '3\u20139 websites',
    '1to2': '1\u20132 websites',
    just_own: 'just your own website',
  }

  // Tier label
  const tierLabels = {
    invisible: 'AI Invisible',
    starting: 'Getting Started',
    onTrack: 'On Track',
    aiReady: 'AI Ready',
  }

  const BASE_PATH = '/AEO-Dashboard/'
  const SITE_URL = `https://stefanninkov.github.io${BASE_PATH}`

  return {
    name: lead.name || 'there',
    email: lead.email || '',
    score: scorecard.totalScore ?? '—',
    maxScore: '33',
    tierLabel: tierLabels[scorecard.tier] || scorecard.tier || '—',
    weakestCategory: catLabels[weakestCategory] || weakestCategory || '—',
    websiteCount: websiteLabels[qualification.websiteCount] || qualification.websiteCount || '—',
    role: roleLabels[qualification.role] || qualification.role || '—',
    priority1: priorities[0]?.title || priorities[0]?.id || '—',
    priority2: priorities[1]?.title || priorities[1]?.id || '—',
    priority3: priorities[2]?.title || priorities[2]?.id || '—',
    link: SITE_URL,
    ...overrides,
  }
}
