/**
 * Inline JSON-LD Schema Validator
 *
 * Validates structured data against Schema.org standards locally —
 * no external API calls. Checks syntax, required properties, best
 * practices, and AEO-specific optimizations.
 *
 * @param {string|Object} input - JSON-LD string or parsed object
 * @returns {{ valid: boolean, results: Array<{ level: 'pass'|'warning'|'error', code: string, message: string }> }}
 */

// ─── Required properties per Schema.org type ──────────────────
const REQUIRED_PROPS = {
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
  Article: ['headline', 'author', 'datePublished'],
  NewsArticle: ['headline', 'author', 'datePublished'],
  BlogPosting: ['headline', 'author', 'datePublished'],
  Product: ['name'],
  LocalBusiness: ['name', 'address'],
  Organization: ['name', 'url'],
  BreadcrumbList: ['itemListElement'],
  VideoObject: ['name', 'uploadDate', 'thumbnailUrl'],
  Event: ['name', 'startDate', 'location'],
  Recipe: ['name', 'recipeIngredient', 'recipeInstructions'],
  Person: ['name'],
  WebSite: ['name', 'url'],
  WebPage: ['name'],
}

// ─── Recommended properties per type (best practices) ─────────
const RECOMMENDED_PROPS = {
  FAQPage: [],
  HowTo: ['description', 'image', 'totalTime'],
  Article: ['dateModified', 'image', 'publisher', 'description'],
  NewsArticle: ['dateModified', 'image', 'publisher', 'description'],
  BlogPosting: ['dateModified', 'image', 'publisher', 'description'],
  Product: ['description', 'image', 'offers', 'brand', 'aggregateRating'],
  LocalBusiness: ['telephone', 'openingHours', 'geo', 'image'],
  Organization: ['logo', 'contactPoint', 'sameAs', 'description'],
  BreadcrumbList: [],
  VideoObject: ['description', 'duration', 'contentUrl', 'embedUrl'],
  Event: ['description', 'endDate', 'image', 'offers', 'organizer'],
  Recipe: ['image', 'cookTime', 'nutrition', 'recipeYield'],
  Person: ['url', 'jobTitle', 'image'],
  WebSite: ['description', 'potentialAction'],
  WebPage: ['description', 'url'],
}

// ─── AEO-specific checks ─────────────────────────────────────
function checkAeoOptimizations(schema, type, results) {
  // FAQ: answers should be substantial
  if (type === 'FAQPage' && Array.isArray(schema.mainEntity)) {
    const shortAnswers = schema.mainEntity.filter(q => {
      const answer = q?.acceptedAnswer?.text || ''
      return answer.length < 50
    })
    if (shortAnswers.length > 0) {
      results.push({
        level: 'warning',
        code: 'aeo-short-faq',
        message: `${shortAnswers.length} FAQ answer(s) are under 50 characters — AI engines prefer detailed responses`,
      })
    } else if (schema.mainEntity.length > 0) {
      results.push({
        level: 'pass',
        code: 'aeo-faq-quality',
        message: 'All FAQ answers are substantial enough for AI citation',
      })
    }

    if (schema.mainEntity.length < 3) {
      results.push({
        level: 'warning',
        code: 'aeo-few-faqs',
        message: `Only ${schema.mainEntity.length} FAQ(s) — aim for 5+ for better AI coverage`,
      })
    }
  }

  // HowTo: steps should be detailed
  if (type === 'HowTo' && Array.isArray(schema.step)) {
    const shortSteps = schema.step.filter(s => {
      const text = s?.text || s?.description || ''
      return text.length < 30
    })
    if (shortSteps.length > 0) {
      results.push({
        level: 'warning',
        code: 'aeo-short-steps',
        message: `${shortSteps.length} step(s) have brief descriptions — expand for better AI understanding`,
      })
    }
  }

  // Article: dateModified signals freshness
  if (['Article', 'NewsArticle', 'BlogPosting'].includes(type)) {
    if (schema.dateModified) {
      results.push({
        level: 'pass',
        code: 'aeo-freshness',
        message: 'dateModified present — AI engines use this as a freshness signal',
      })
    } else {
      results.push({
        level: 'warning',
        code: 'aeo-no-freshness',
        message: 'Missing dateModified — AI engines may deprioritize without a freshness signal',
      })
    }

    // Word count check on description
    if (schema.description && schema.description.split(/\s+/).length < 20) {
      results.push({
        level: 'warning',
        code: 'aeo-short-description',
        message: 'Article description is very brief — expand to 2-3 sentences for better AI snippets',
      })
    }
  }

  // Product: structured offers help AI comparison
  if (type === 'Product') {
    if (schema.offers) {
      results.push({
        level: 'pass',
        code: 'aeo-product-offers',
        message: 'Offers data present — enables AI price comparison features',
      })
    }
    if (schema.aggregateRating) {
      results.push({
        level: 'pass',
        code: 'aeo-product-rating',
        message: 'AggregateRating present — strengthens AI trust signals',
      })
    }
  }
}

// ─── Date format validation ───────────────────────────────────
function isValidIsoDate(str) {
  if (typeof str !== 'string') return false
  // Accept ISO 8601 dates: YYYY-MM-DD, YYYY-MM-DDThh:mm:ss, etc.
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)?)?$/.test(str)
}

// ─── URL validation ───────────────────────────────────────────
function isValidUrl(str) {
  if (typeof str !== 'string') return false
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

// ─── Main validation function ─────────────────────────────────
export function validateSchema(input) {
  const results = []
  let schema

  // Step 1: Parse JSON
  if (typeof input === 'string') {
    const cleaned = input
      .replace(/<script[^>]*>|<\/script>/gi, '')
      .replace(/```json\s?|```/g, '')
      .trim()

    try {
      schema = JSON.parse(cleaned)
      results.push({ level: 'pass', code: 'json-valid', message: 'Valid JSON syntax' })
    } catch (e) {
      results.push({
        level: 'error',
        code: 'json-invalid',
        message: `Invalid JSON: ${e.message.replace(/^JSON\.parse:\s*/, '')}`,
      })
      return { valid: false, results }
    }
  } else if (typeof input === 'object' && input !== null) {
    schema = input
    results.push({ level: 'pass', code: 'json-valid', message: 'Valid JSON object' })
  } else {
    results.push({ level: 'error', code: 'json-empty', message: 'No input provided' })
    return { valid: false, results }
  }

  // Step 2: Check @context
  if (schema['@context']) {
    const ctx = schema['@context']
    const validContexts = ['https://schema.org', 'http://schema.org', 'https://schema.org/']
    if (typeof ctx === 'string' && validContexts.includes(ctx.replace(/\/$/, ''))) {
      results.push({ level: 'pass', code: 'context-valid', message: '@context correctly set to schema.org' })
    } else {
      results.push({
        level: 'warning',
        code: 'context-unusual',
        message: `@context is "${ctx}" — expected "https://schema.org"`,
      })
    }
  } else {
    results.push({
      level: 'error',
      code: 'context-missing',
      message: 'Missing @context — required for valid JSON-LD',
    })
  }

  // Step 3: Check @type
  const type = schema['@type']
  if (type) {
    results.push({ level: 'pass', code: 'type-present', message: `@type is "${type}"` })
  } else {
    results.push({
      level: 'error',
      code: 'type-missing',
      message: 'Missing @type — every JSON-LD node must declare its type',
    })
    return { valid: results.every(r => r.level !== 'error'), results }
  }

  // Step 4: Required properties
  const requiredProps = REQUIRED_PROPS[type] || []
  for (const prop of requiredProps) {
    if (schema[prop] !== undefined && schema[prop] !== null && schema[prop] !== '') {
      results.push({
        level: 'pass',
        code: `required-${prop}`,
        message: `Required property "${prop}" is present`,
      })
    } else {
      results.push({
        level: 'error',
        code: `required-${prop}`,
        message: `Missing required property "${prop}" for ${type}`,
      })
    }
  }

  // Step 5: Recommended properties
  const recommendedProps = RECOMMENDED_PROPS[type] || []
  for (const prop of recommendedProps) {
    if (schema[prop] !== undefined && schema[prop] !== null && schema[prop] !== '') {
      results.push({
        level: 'pass',
        code: `recommended-${prop}`,
        message: `Recommended property "${prop}" is present`,
      })
    } else {
      results.push({
        level: 'warning',
        code: `recommended-${prop}`,
        message: `Missing recommended property "${prop}" — add for richer results`,
      })
    }
  }

  // Step 6: Date format checks
  const dateFields = ['datePublished', 'dateModified', 'uploadDate', 'startDate', 'endDate']
  for (const field of dateFields) {
    if (schema[field] !== undefined) {
      if (isValidIsoDate(schema[field])) {
        results.push({ level: 'pass', code: `date-${field}`, message: `"${field}" is valid ISO 8601` })
      } else {
        results.push({
          level: 'warning',
          code: `date-${field}`,
          message: `"${field}" may not be valid ISO 8601 format (got "${schema[field]}")`,
        })
      }
    }
  }

  // Step 7: URL checks
  const urlFields = ['url', 'contentUrl', 'embedUrl', 'thumbnailUrl', 'image', 'logo']
  for (const field of urlFields) {
    const val = schema[field]
    if (val !== undefined) {
      const urlStr = typeof val === 'object' ? val?.url || val?.['@id'] : val
      if (typeof urlStr === 'string' && isValidUrl(urlStr)) {
        results.push({ level: 'pass', code: `url-${field}`, message: `"${field}" is a valid URL` })
      } else if (typeof urlStr === 'string' && urlStr.startsWith('http')) {
        results.push({
          level: 'warning',
          code: `url-${field}`,
          message: `"${field}" URL may be malformed: "${urlStr.slice(0, 60)}"`,
        })
      }
    }
  }

  // Step 8: FAQ structure deep check
  if (type === 'FAQPage' && Array.isArray(schema.mainEntity)) {
    let allValid = true
    schema.mainEntity.forEach((item, i) => {
      if (item?.['@type'] !== 'Question') {
        results.push({
          level: 'error',
          code: `faq-item-${i}`,
          message: `FAQ item ${i + 1}: @type should be "Question", got "${item?.['@type']}"`,
        })
        allValid = false
      }
      if (!item?.acceptedAnswer?.text && !item?.acceptedAnswer?.['@type']) {
        results.push({
          level: 'error',
          code: `faq-answer-${i}`,
          message: `FAQ item ${i + 1}: missing acceptedAnswer`,
        })
        allValid = false
      }
    })
    if (allValid && schema.mainEntity.length > 0) {
      results.push({
        level: 'pass',
        code: 'faq-structure',
        message: `All ${schema.mainEntity.length} FAQ items have valid Question/Answer structure`,
      })
    }
  }

  // Step 9: BreadcrumbList structure check
  if (type === 'BreadcrumbList' && Array.isArray(schema.itemListElement)) {
    const items = schema.itemListElement
    let positionValid = true
    items.forEach((item, i) => {
      if (item?.position !== i + 1) positionValid = false
    })
    if (positionValid && items.length > 0) {
      results.push({
        level: 'pass',
        code: 'breadcrumb-positions',
        message: `All ${items.length} breadcrumb positions are correctly numbered`,
      })
    } else if (items.length > 0) {
      results.push({
        level: 'warning',
        code: 'breadcrumb-positions',
        message: 'Breadcrumb item positions may not be sequential (1, 2, 3…)',
      })
    }
  }

  // Step 10: AEO-specific optimizations
  checkAeoOptimizations(schema, type, results)

  // Compute overall validity
  const hasErrors = results.some(r => r.level === 'error')

  return { valid: !hasErrors, results }
}
