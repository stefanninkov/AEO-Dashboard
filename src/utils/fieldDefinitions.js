/**
 * fieldDefinitions.js — Single source of truth for all field option IDs, labels, and metadata.
 *
 * Used by:
 * - ProjectQuestionnaire.jsx (project setup wizard)
 * - ProjectProfileForm.jsx (editable profile in settings)
 * - OnboardingQuiz.jsx (user onboarding)
 * - getRecommendations.js (context line builder, recommendations)
 * - useAdminStats.js (admin aggregation + charts)
 * - ProjectGeneralSection.jsx (read-only profile display)
 */

/* ══════════════════════════════════════════════════
   PROJECT QUESTIONNAIRE FIELDS
   ══════════════════════════════════════════════════ */

/* ── Industry ── */
export const INDUSTRY_IDS = ['saas', 'ecommerce', 'healthcare', 'finance', 'legal', 'realestate', 'education', 'agency', 'localbusiness', 'media', 'other']

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

/* ── Region ── */
export const REGION_IDS = ['us', 'europe', 'uk', 'apac', 'latam', 'mena', 'global']

export const REGION_LABELS = {
  us: 'United States',
  europe: 'Europe',
  uk: 'United Kingdom',
  apac: 'Asia-Pacific',
  latam: 'Latin America',
  mena: 'Middle East & North Africa',
  global: 'Global',
}

/* ── Audience ── */
export const AUDIENCE_IDS = ['b2b', 'b2c', 'both']

export const AUDIENCE_LABELS = {
  b2b: 'B2B',
  b2c: 'B2C',
  both: 'Both B2B & B2C',
}

/* ── Goal ── */
export const GOAL_IDS = ['citations', 'answers', 'traffic', 'brand', 'all']

export const GOAL_LABELS = {
  citations: 'Get Cited in AI Answers',
  answers: 'Appear in AI Search Results',
  traffic: 'Drive AI Referral Traffic',
  brand: 'Brand Positioning & Authority',
  all: 'Full AEO Strategy',
}

/* ── Maturity ── */
export const MATURITY_IDS = ['beginner', 'basics', 'intermediate', 'advanced']

export const MATURITY_LABELS = {
  beginner: 'Just Starting',
  basics: 'Some Basics Done',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

/* ── Content Type ── */
export const CONTENT_IDS = ['blog', 'product', 'docs', 'landing', 'mixed']

export const CONTENT_LABELS = {
  blog: 'Blog / Articles',
  product: 'Product Pages',
  docs: 'Documentation',
  landing: 'Landing Pages',
  mixed: 'Mixed Content',
}

/* ── AI Engine ── */
export const ENGINE_IDS = ['chatgpt', 'perplexity', 'google-aio', 'bing-copilot', 'claude', 'all']

export const ENGINE_LABELS = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  'google-aio': 'Google AI Overviews',
  'bing-copilot': 'Bing Copilot',
  claude: 'Claude',
  all: 'All Engines',
}

export const ENGINE_COLORS = {
  chatgpt: '#10A37F',
  perplexity: '#7B2FBE',
  'google-aio': '#4285F4',
  'bing-copilot': '#00A4EF',
  claude: '#D97706',
  all: '#2563EB',
}

/* ── CMS ── */
export const CMS_IDS = ['wordpress', 'shopify', 'webflow', 'wix', 'squarespace', 'custom', 'other']

export const CMS_LABELS = {
  wordpress: 'WordPress', webflow: 'Webflow', shopify: 'Shopify',
  wix: 'Wix', squarespace: 'Squarespace', custom: 'Custom / Static',
  other: 'Other',
}

/* ── Language ── */
export const LANGUAGE_LABELS = {
  en: 'English', de: 'German', fr: 'French', es: 'Spanish', pt: 'Portuguese',
  it: 'Italian', nl: 'Dutch', pl: 'Polish', sv: 'Swedish', da: 'Danish',
  no: 'Norwegian', fi: 'Finnish', cs: 'Czech', ro: 'Romanian', hu: 'Hungarian',
  el: 'Greek', tr: 'Turkish', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean', hi: 'Hindi', sr: 'Serbian', hr: 'Croatian', bg: 'Bulgarian',
  uk: 'Ukrainian', ru: 'Russian', th: 'Thai', vi: 'Vietnamese', id: 'Indonesian',
  ms: 'Malay', he: 'Hebrew',
}

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' }, { value: 'de', label: 'German' }, { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' }, { value: 'pt', label: 'Portuguese' }, { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' }, { value: 'ar', label: 'Arabic' }, { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' }, { value: 'ko', label: 'Korean' }, { value: 'hi', label: 'Hindi' },
  { value: 'ru', label: 'Russian' }, { value: 'tr', label: 'Turkish' }, { value: 'pl', label: 'Polish' },
  { value: 'sr', label: 'Serbian' }, { value: 'hr', label: 'Croatian' }, { value: 'sv', label: 'Swedish' },
]

/* ── Country ── */
export const COUNTRY_OPTIONS = {
  us: [
    { value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }, { value: 'mx', label: 'Mexico' },
  ],
  europe: [
    { value: 'al', label: 'Albania' }, { value: 'at', label: 'Austria' }, { value: 'ba', label: 'Bosnia & Herzegovina' },
    { value: 'be', label: 'Belgium' }, { value: 'bg', label: 'Bulgaria' }, { value: 'ch', label: 'Switzerland' },
    { value: 'cz', label: 'Czech Republic' }, { value: 'de', label: 'Germany' }, { value: 'dk', label: 'Denmark' },
    { value: 'ee', label: 'Estonia' }, { value: 'es', label: 'Spain' }, { value: 'fi', label: 'Finland' },
    { value: 'fr', label: 'France' }, { value: 'gr', label: 'Greece' }, { value: 'hr', label: 'Croatia' },
    { value: 'hu', label: 'Hungary' }, { value: 'ie', label: 'Ireland' }, { value: 'it', label: 'Italy' },
    { value: 'lt', label: 'Lithuania' }, { value: 'lv', label: 'Latvia' }, { value: 'me', label: 'Montenegro' },
    { value: 'mk', label: 'North Macedonia' }, { value: 'nl', label: 'Netherlands' }, { value: 'no', label: 'Norway' },
    { value: 'pl', label: 'Poland' }, { value: 'pt', label: 'Portugal' }, { value: 'ro', label: 'Romania' },
    { value: 'rs', label: 'Serbia' }, { value: 'se', label: 'Sweden' }, { value: 'si', label: 'Slovenia' },
    { value: 'sk', label: 'Slovakia' }, { value: 'ua', label: 'Ukraine' },
  ],
  uk: [
    { value: 'gb', label: 'United Kingdom' }, { value: 'ie', label: 'Ireland' },
  ],
  apac: [
    { value: 'au', label: 'Australia' }, { value: 'cn', label: 'China' }, { value: 'hk', label: 'Hong Kong' },
    { value: 'id', label: 'Indonesia' }, { value: 'in', label: 'India' }, { value: 'jp', label: 'Japan' },
    { value: 'kr', label: 'South Korea' }, { value: 'my', label: 'Malaysia' }, { value: 'nz', label: 'New Zealand' },
    { value: 'ph', label: 'Philippines' }, { value: 'sg', label: 'Singapore' }, { value: 'th', label: 'Thailand' },
    { value: 'tw', label: 'Taiwan' }, { value: 'vn', label: 'Vietnam' },
  ],
  latam: [
    { value: 'ar', label: 'Argentina' }, { value: 'br', label: 'Brazil' }, { value: 'cl', label: 'Chile' },
    { value: 'co', label: 'Colombia' }, { value: 'cr', label: 'Costa Rica' }, { value: 'ec', label: 'Ecuador' },
    { value: 'mx', label: 'Mexico' }, { value: 'pe', label: 'Peru' }, { value: 'uy', label: 'Uruguay' },
  ],
  mena: [
    { value: 'ae', label: 'UAE' }, { value: 'bh', label: 'Bahrain' }, { value: 'eg', label: 'Egypt' },
    { value: 'il', label: 'Israel' }, { value: 'jo', label: 'Jordan' }, { value: 'kw', label: 'Kuwait' },
    { value: 'lb', label: 'Lebanon' }, { value: 'ma', label: 'Morocco' }, { value: 'qa', label: 'Qatar' },
    { value: 'sa', label: 'Saudi Arabia' }, { value: 'tn', label: 'Tunisia' }, { value: 'tr', label: 'Turkey' },
  ],
  global: [],
}

/** Flat country label map built from COUNTRY_OPTIONS for display lookups */
export const COUNTRY_LABELS = Object.values(COUNTRY_OPTIONS).flat().reduce((acc, c) => {
  acc[c.value] = c.label
  return acc
}, {})


/* ══════════════════════════════════════════════════
   ONBOARDING QUIZ FIELDS
   ══════════════════════════════════════════════════ */

/* ── Role ── */
export const ROLE_IDS = ['marketer', 'developer', 'founder', 'content', 'seo', 'analyst', 'other']

export const ROLE_LABELS = {
  marketer: 'Marketer',
  developer: 'Developer',
  founder: 'Founder / CEO',
  content: 'Content Creator',
  seo: 'SEO Specialist',
  analyst: 'Data Analyst',
  other: 'Other',
}

/* ── Team Size ── */
export const TEAM_SIZE_IDS = ['solo', 'small', 'medium', 'large', 'enterprise']

export const TEAM_SIZE_LABELS = {
  solo: 'Solo',
  small: '2–10',
  medium: '11–50',
  large: '51–200',
  enterprise: '200+',
}

/* ── User Goal (AEO-specific) ── */
export const USER_GOAL_IDS = ['citations', 'traffic', 'brand', 'competitive', 'learning']

export const USER_GOAL_LABELS = {
  citations: 'Get Cited by AI',
  traffic: 'Drive AI Traffic',
  brand: 'Brand Authority',
  competitive: 'Competitive Advantage',
  learning: 'Learning / Research',
}

/* ── AEO Familiarity ── */
export const FAMILIARITY_IDS = ['new', 'beginner', 'intermediate', 'advanced']

export const FAMILIARITY_LABELS = {
  new: 'Brand New to AEO',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

/* ── Referral Source ── */
export const REFERRAL_IDS = ['search', 'social', 'colleague', 'blog', 'conference', 'other']

export const REFERRAL_LABELS = {
  search: 'Search Engine',
  social: 'Social Media',
  colleague: 'Colleague / Friend',
  blog: 'Blog / Article',
  conference: 'Conference / Event',
  other: 'Other',
}
