/**
 * industryPlaybooks — Pre-built AEO phase priority templates per industry.
 *
 * Each playbook defines:
 * - focusPhases: the 2-3 highest-priority phases for this industry
 * - description: short industry-specific AEO context
 * - focusExplanations: per-focus-phase benefit explanation
 * - tips: industry-specific inline guidance
 */

const PLAYBOOKS = {
  saas: {
    focusPhases: [3, 2, 5],
    description: 'SaaS buyers research heavily before purchasing — they compare features and ask AI for recommendations. Focus on comparison content and product schema to appear in high-intent queries.',
    focusExplanations: {
      3: 'Feature comparisons and "vs" pages are the most cited SaaS content by AI engines — optimizing these drives direct AI referral traffic.',
      2: 'Product and FAQ schema helps AI engines understand your offering and surface it in comparison and recommendation queries.',
      5: 'Integration docs, API guides, and technical content build topical authority that AI engines use to rank citation trustworthiness.',
    },
    tips: [
      { phase: 2, tip: 'SaaS buyers rely heavily on comparison queries — prioritize Product and FAQ schema early.' },
      { phase: 3, tip: 'Feature comparison pages and "vs" content get cited 3x more by AI engines.' },
      { phase: 5, tip: 'Build topical authority through integration guides and API documentation.' },
    ],
  },
  ecommerce: {
    focusPhases: [2, 3, 4],
    description: 'Product discovery increasingly happens through AI assistants. Structured product data, buying guides, and review schema are essential to appear when shoppers ask for recommendations.',
    focusExplanations: {
      2: 'Product schema on every PDP is table stakes — without it, AI engines can\'t properly index your catalog for shopping queries.',
      3: 'Buying guides and comparison content get 5x more AI citations than product descriptions alone, driving high-intent traffic.',
      4: 'Review and rating schema dramatically increases citation frequency — AI engines prioritize products with verified social proof.',
    },
    tips: [
      { phase: 2, tip: 'Product schema is table stakes — implement on every PDP before anything else.' },
      { phase: 3, tip: 'Buying guide content gets 5x more AI citations than product descriptions.' },
      { phase: 4, tip: 'Review and rating schema dramatically increases citation frequency.' },
    ],
  },
  healthcare: {
    focusPhases: [4, 1, 2],
    description: 'Medical content is held to the highest trust standards by AI engines. Author credentials, YMYL compliance, and medical schema must come first to build the authority AI systems require.',
    focusExplanations: {
      4: 'E-E-A-T is critical — AI engines will only cite healthcare content from sources with verifiable medical credentials and review dates.',
      1: 'Auditing for YMYL compliance first prevents AI engines from penalizing or ignoring your medical content due to unverified claims.',
      2: 'MedicalCondition and Drug schema types help AI engines understand clinical context and surface your content in health queries.',
    },
    tips: [
      { phase: 4, tip: 'E-E-A-T is critical in healthcare — author credentials and medical review dates are mandatory.' },
      { phase: 1, tip: 'Audit for YMYL compliance first — AI engines heavily penalize unverified medical claims.' },
      { phase: 2, tip: 'MedicalCondition and Drug schema types help AI engines understand content context.' },
    ],
  },
  finance: {
    focusPhases: [4, 1, 3],
    description: 'Financial advice carries legal and trust obligations that AI engines verify strictly. Author authority and regulatory compliance are the foundation before content optimization.',
    focusExplanations: {
      4: 'Clear author credentials and regulatory disclaimers are required — AI engines fact-check financial content against authoritative sources.',
      1: 'Auditing financial advice pages for accuracy is critical since AI engines cross-reference claims and penalize inaccurate financial guidance.',
      3: 'Calculator pages and comparison tables are top citation targets — they provide the structured, factual answers AI engines prefer.',
    },
    tips: [
      { phase: 4, tip: 'Financial content requires clear author credentials and regulatory disclaimers.' },
      { phase: 1, tip: 'Audit all financial advice pages for accuracy — AI engines fact-check against authoritative sources.' },
      { phase: 3, tip: 'Calculator pages and comparison tables are top citation targets in fintech.' },
    ],
  },
  legal: {
    focusPhases: [4, 3, 1],
    description: 'Legal content requires jurisdiction-specific accuracy and verifiable attorney credentials. AI engines only cite legal sources they can confirm as authoritative.',
    focusExplanations: {
      4: 'Attorney credentials and bar admissions are essential authority signals — AI engines verify these before citing legal advice.',
      3: 'FAQ-style legal explainers get cited most often by AI assistants answering common legal questions from the public.',
      1: 'Jurisdiction-specific content labeling is critical — AI engines need geographic context to serve accurate legal information.',
    },
    tips: [
      { phase: 4, tip: 'Attorney credentials and bar admissions are essential authority signals.' },
      { phase: 3, tip: 'FAQ-style legal explainers get cited most often by AI assistants.' },
      { phase: 1, tip: 'Ensure jurisdiction-specific content is clearly labeled — AI engines need geographic context.' },
    ],
  },
  realestate: {
    focusPhases: [2, 3, 5],
    description: 'Property and local searches are among the most common AI queries. Local schema, neighborhood content, and community authority signals drive location-based AI citations.',
    focusExplanations: {
      2: 'LocalBusiness and RealEstateListing schema are essential — without them, AI engines can\'t properly surface your listings in property searches.',
      3: 'Neighborhood guides and market reports are top citation magnets — they answer the location questions AI assistants get most.',
      5: 'Local link building from community sites boosts citation authority specifically in location-based AI queries.',
    },
    tips: [
      { phase: 2, tip: 'LocalBusiness and RealEstateListing schema are essential for property searches.' },
      { phase: 3, tip: 'Neighborhood guides and market reports are top citation magnets.' },
      { phase: 5, tip: 'Local link building from community sites boosts citation authority in location queries.' },
    ],
  },
  education: {
    focusPhases: [3, 1, 4],
    description: 'Students use AI to compare programs and courses. Structured course data, clear learning outcomes, and accreditation signals are what AI engines look for when recommending programs.',
    focusExplanations: {
      3: 'Course comparison pages and program guides are what AI engines cite most — students rely on these when asking AI for education recommendations.',
      1: 'Auditing course pages for clear learning objectives maps directly to AI query patterns like "best course for..." or "how to learn...".',
      4: 'Accreditation and instructor credentials are key authority signals that AI engines use to determine which programs to recommend.',
    },
    tips: [
      { phase: 3, tip: 'Course comparison pages and program guides are what AI engines cite most in education.' },
      { phase: 1, tip: 'Audit course pages for clear learning objectives — these map to AI query patterns.' },
      { phase: 4, tip: 'Accreditation and instructor credentials are key authority signals in education.' },
    ],
  },
  agency: {
    focusPhases: [3, 5, 4],
    description: 'Agencies need to demonstrate expertise through case studies and thought leadership. AI engines cite methodology content and credentialed teams when answering service queries.',
    focusExplanations: {
      3: 'Case studies and methodology content get cited when AI answers "how to" service queries — this is your primary citation driver.',
      5: 'Thought leadership backlinks from industry publications boost citation authority and position your agency as an expert source.',
      4: 'Team credentials and certifications signal expertise to AI engines — they verify these before citing agency recommendations.',
    },
    tips: [
      { phase: 3, tip: 'Case studies and methodology content get cited when AI answers "how to" agency queries.' },
      { phase: 5, tip: 'Thought leadership backlinks from industry publications boost citation authority.' },
      { phase: 4, tip: 'Team credentials and certifications signal expertise to AI engines.' },
    ],
  },
  localbusiness: {
    focusPhases: [2, 1, 5],
    description: 'Local queries dominate AI assistant usage. Business schema, consistent NAP data, and local directory presence determine whether AI recommends you for service queries.',
    focusExplanations: {
      2: 'LocalBusiness schema with opening hours, service area, and reviews is the single highest-impact optimization for local AI visibility.',
      1: 'NAP (Name, Address, Phone) consistency across all pages is what AI engines check first when verifying local business legitimacy.',
      5: 'Local directory citations and Google Business Profile optimization directly drive AI citations for "near me" and service queries.',
    },
    tips: [
      { phase: 2, tip: 'LocalBusiness schema with opening hours, service area, and reviews is the #1 priority.' },
      { phase: 1, tip: 'Ensure NAP (Name, Address, Phone) consistency across all pages.' },
      { phase: 5, tip: 'Local directory citations and Google Business Profile optimization drive AI citations.' },
    ],
  },
  media: {
    focusPhases: [3, 2, 4],
    description: 'AI engines prefer citing evergreen reference content over breaking news. Article schema, author bylines, and publication dates help AI identify trustworthy editorial sources.',
    focusExplanations: {
      3: 'Evergreen reference content gets cited far more than breaking news — invest in comprehensive guides and explainers for lasting AI visibility.',
      2: 'Article and NewsArticle schema with author and datePublished are essential signals that AI engines use to evaluate editorial trustworthiness.',
      4: 'Bylined content with author pages significantly increases citation rates — AI engines trace authority back to individual journalists.',
    },
    tips: [
      { phase: 3, tip: 'Evergreen reference content gets cited far more than breaking news in AI answers.' },
      { phase: 2, tip: 'Article and NewsArticle schema with author and datePublished are essential.' },
      { phase: 4, tip: 'Bylined content with author pages significantly increases citation rates.' },
    ],
  },
  other: {
    focusPhases: [1, 3, 2],
    description: 'Start with a comprehensive audit to establish your baseline, then optimize content for AI queries, and add structured data so AI engines understand your pages.',
    focusExplanations: {
      1: 'A thorough audit reveals your current AEO readiness and identifies the highest-impact improvements to prioritize first.',
      3: 'Question-based content structured for direct answers is universally effective across all industries for AI citation.',
      2: 'Schema markup tells AI engines exactly what your content is about — implementing it early accelerates all other AEO efforts.',
    },
    tips: [
      { phase: 1, tip: 'Start with a thorough audit to understand your current AEO readiness.' },
      { phase: 3, tip: 'Question-based content structured for direct answers is universally effective.' },
      { phase: 2, tip: 'Schema markup tells AI engines what your content is about — implement early.' },
    ],
  },
}

/**
 * Get playbook for an industry.
 * @param {string} industry — Industry key from questionnaire
 * @returns {Object|null} Playbook data or null
 */
export function getPlaybook(industry) {
  return PLAYBOOKS[industry] || PLAYBOOKS.other
}

/**
 * Check if a phase is a focus phase for the industry.
 * @param {string} industry — Industry key
 * @param {number} phaseNumber — Phase number (1-7)
 * @returns {boolean}
 */
export function isFocusPhase(industry, phaseNumber) {
  const playbook = getPlaybook(industry)
  return playbook?.focusPhases?.includes(phaseNumber) || false
}

/**
 * Get tip for a specific phase in an industry.
 * @param {string} industry — Industry key
 * @param {number} phaseNumber — Phase number (1-7)
 * @returns {string|null}
 */
export function getPhaseTip(industry, phaseNumber) {
  const playbook = getPlaybook(industry)
  const tipObj = playbook?.tips?.find(t => t.phase === phaseNumber)
  return tipObj?.tip || null
}

export default PLAYBOOKS
