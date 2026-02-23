/**
 * industryPlaybooks — Pre-built AEO phase priority templates per industry.
 *
 * Each playbook defines:
 * - phaseOrder: recommended phase execution order (phase numbers)
 * - focusPhases: the 2-3 highest-priority phases for this industry
 * - tips: industry-specific inline guidance
 */

const PLAYBOOKS = {
  saas: {
    phaseOrder: [1, 3, 2, 5, 4, 6, 7],
    focusPhases: [3, 2, 5],
    tips: [
      { phase: 2, tip: 'SaaS buyers rely heavily on comparison queries — prioritize Product and FAQ schema early.' },
      { phase: 3, tip: 'Feature comparison pages and "vs" content get cited 3x more by AI engines.' },
      { phase: 5, tip: 'Build topical authority through integration guides and API documentation.' },
    ],
  },
  ecommerce: {
    phaseOrder: [2, 1, 3, 4, 5, 6, 7],
    focusPhases: [2, 3, 4],
    tips: [
      { phase: 2, tip: 'Product schema is table stakes — implement on every PDP before anything else.' },
      { phase: 3, tip: 'Buying guide content gets 5x more AI citations than product descriptions.' },
      { phase: 4, tip: 'Review and rating schema dramatically increases citation frequency.' },
    ],
  },
  healthcare: {
    phaseOrder: [4, 1, 2, 3, 5, 6, 7],
    focusPhases: [4, 1, 2],
    tips: [
      { phase: 4, tip: 'E-E-A-T is critical in healthcare — author credentials and medical review dates are mandatory.' },
      { phase: 1, tip: 'Audit for YMYL compliance first — AI engines heavily penalize unverified medical claims.' },
      { phase: 2, tip: 'MedicalCondition and Drug schema types help AI engines understand content context.' },
    ],
  },
  finance: {
    phaseOrder: [4, 1, 3, 2, 5, 6, 7],
    focusPhases: [4, 1, 3],
    tips: [
      { phase: 4, tip: 'Financial content requires clear author credentials and regulatory disclaimers.' },
      { phase: 1, tip: 'Audit all financial advice pages for accuracy — AI engines fact-check against authoritative sources.' },
      { phase: 3, tip: 'Calculator pages and comparison tables are top citation targets in fintech.' },
    ],
  },
  legal: {
    phaseOrder: [4, 3, 1, 2, 5, 6, 7],
    focusPhases: [4, 3, 1],
    tips: [
      { phase: 4, tip: 'Attorney credentials and bar admissions are essential authority signals.' },
      { phase: 3, tip: 'FAQ-style legal explainers get cited most often by AI assistants.' },
      { phase: 1, tip: 'Ensure jurisdiction-specific content is clearly labeled — AI engines need geographic context.' },
    ],
  },
  realestate: {
    phaseOrder: [2, 3, 1, 4, 5, 6, 7],
    focusPhases: [2, 3, 5],
    tips: [
      { phase: 2, tip: 'LocalBusiness and RealEstateListing schema are essential for property searches.' },
      { phase: 3, tip: 'Neighborhood guides and market reports are top citation magnets.' },
      { phase: 5, tip: 'Local link building from community sites boosts citation authority in location queries.' },
    ],
  },
  education: {
    phaseOrder: [3, 1, 2, 4, 5, 6, 7],
    focusPhases: [3, 1, 4],
    tips: [
      { phase: 3, tip: 'Course comparison pages and program guides are what AI engines cite most in education.' },
      { phase: 1, tip: 'Audit course pages for clear learning objectives — these map to AI query patterns.' },
      { phase: 4, tip: 'Accreditation and instructor credentials are key authority signals in education.' },
    ],
  },
  agency: {
    phaseOrder: [3, 5, 1, 2, 4, 6, 7],
    focusPhases: [3, 5, 4],
    tips: [
      { phase: 3, tip: 'Case studies and methodology content get cited when AI answers "how to" agency queries.' },
      { phase: 5, tip: 'Thought leadership backlinks from industry publications boost citation authority.' },
      { phase: 4, tip: 'Team credentials and certifications signal expertise to AI engines.' },
    ],
  },
  localbusiness: {
    phaseOrder: [2, 1, 3, 5, 4, 6, 7],
    focusPhases: [2, 1, 5],
    tips: [
      { phase: 2, tip: 'LocalBusiness schema with opening hours, service area, and reviews is the #1 priority.' },
      { phase: 1, tip: 'Ensure NAP (Name, Address, Phone) consistency across all pages.' },
      { phase: 5, tip: 'Local directory citations and Google Business Profile optimization drive AI citations.' },
    ],
  },
  media: {
    phaseOrder: [3, 2, 1, 4, 5, 6, 7],
    focusPhases: [3, 2, 4],
    tips: [
      { phase: 3, tip: 'Evergreen reference content gets cited far more than breaking news in AI answers.' },
      { phase: 2, tip: 'Article and NewsArticle schema with author and datePublished are essential.' },
      { phase: 4, tip: 'Bylined content with author pages significantly increases citation rates.' },
    ],
  },
  other: {
    phaseOrder: [1, 2, 3, 4, 5, 6, 7],
    focusPhases: [1, 3, 2],
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
