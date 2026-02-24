// src/utils/htmlCrawler.js

/**
 * HTML Crawler — Fetches and parses real page HTML for deterministic analysis.
 *
 * Strategy:
 *   1. Try direct fetch (works for pages with permissive CORS)
 *   2. Fall back to public CORS proxies
 *   3. Final fallback: throw (UI can offer AI fallback)
 *
 * Returns parsed page data — NO AI, NO estimation, just facts.
 */

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
]

/**
 * Fetch raw HTML for a URL
 * @param {string} url
 * @returns {Promise<string>} Raw HTML string
 */
export async function fetchPageHtml(url) {
  // Normalize URL
  if (!url.startsWith('http')) url = 'https://' + url

  // Try direct fetch first
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'text/html' },
      signal: AbortSignal.timeout(10000),
    })
    if (res.ok) {
      const text = await res.text()
      if (text.includes('<html') || text.includes('<!DOCTYPE')) return text
    }
  } catch { /* continue to proxies */ }

  // Try CORS proxies
  for (const proxyFn of CORS_PROXIES) {
    try {
      const res = await fetch(proxyFn(url), {
        signal: AbortSignal.timeout(12000),
      })
      if (res.ok) {
        const text = await res.text()
        if (text.includes('<html') || text.includes('<!DOCTYPE')) return text
      }
    } catch { /* try next proxy */ }
  }

  throw new Error('Could not fetch page HTML. The site may block external requests.')
}

/**
 * Parse HTML and extract all deterministic SEO/AEO data
 * @param {string} html - Raw HTML string
 * @param {string} url - The page URL (for resolving relative links)
 * @returns {Object} Parsed page data
 */
export function parsePageData(html, url) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  return {
    meta: extractMeta(doc),
    headings: extractHeadings(doc),
    content: extractContent(doc),
    schema: extractSchema(doc),
    links: extractLinks(doc, url),
    images: extractImages(doc),
    technical: extractTechnical(doc, html),
  }
}

function extractMeta(doc) {
  const title = doc.querySelector('title')?.textContent?.trim() || null
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || null
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || null
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || null
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || null
  const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || null
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || null
  const ogType = doc.querySelector('meta[property="og:type"]')?.getAttribute('content') || null
  const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || null
  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || null
  const charset = doc.querySelector('meta[charset]')?.getAttribute('charset') ||
                  doc.querySelector('meta[http-equiv="Content-Type"]')?.getAttribute('content') || null
  const lang = doc.documentElement.getAttribute('lang') || null

  return {
    title, titleLength: title?.length || 0,
    metaDescription: metaDesc, metaDescLength: metaDesc?.length || 0,
    canonical, robots, lang, viewport, charset,
    og: { title: ogTitle, description: ogDesc, image: ogImage, type: ogType },
    twitter: { card: twitterCard },
  }
}

function extractHeadings(doc) {
  const headings = []
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
    headings.push({
      level: parseInt(el.tagName[1]),
      text: el.textContent.trim().slice(0, 200),
    })
  })

  // Check hierarchy
  let hierarchyValid = true
  let prevLevel = 0
  for (const h of headings) {
    if (h.level > prevLevel + 1 && prevLevel !== 0) {
      hierarchyValid = false
      break
    }
    prevLevel = h.level
  }

  const h1Count = headings.filter(h => h.level === 1).length

  return {
    list: headings,
    h1Count,
    totalCount: headings.length,
    hierarchyValid,
    hasH1: h1Count > 0,
    multipleH1s: h1Count > 1,
  }
}

function extractContent(doc) {
  // Get main content area (try common selectors)
  const main = doc.querySelector('main, article, [role="main"], .content, #content') || doc.body
  const bodyText = main?.textContent || ''
  const words = bodyText.trim().split(/\s+/).filter(w => w.length > 0)

  // Check for Q&A patterns
  const qaPatterns = {
    hasQuestionHeadings: false,
    hasFaqSection: false,
    hasDefinitionLists: false,
  }

  const headingTexts = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => h.textContent.toLowerCase())
  qaPatterns.hasQuestionHeadings = headingTexts.some(t => t.includes('?') || t.startsWith('what') || t.startsWith('how') || t.startsWith('why') || t.startsWith('when') || t.startsWith('where'))
  qaPatterns.hasFaqSection = headingTexts.some(t => t.includes('faq') || t.includes('frequently asked'))
  qaPatterns.hasDefinitionLists = doc.querySelectorAll('dl').length > 0

  // Lists (AI engines love structured lists)
  const orderedLists = doc.querySelectorAll('ol').length
  const unorderedLists = doc.querySelectorAll('ul').length
  const tables = doc.querySelectorAll('table').length

  return {
    wordCount: words.length,
    isThinContent: words.length < 300,
    isSubstantial: words.length >= 1000,
    qaPatterns,
    structuredElements: {
      orderedLists,
      unorderedLists,
      tables,
      totalLists: orderedLists + unorderedLists,
    },
  }
}

function extractSchema(doc) {
  const schemas = []

  // JSON-LD
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data = JSON.parse(script.textContent)
      if (Array.isArray(data)) {
        data.forEach(item => schemas.push({ format: 'json-ld', type: item['@type'], data: item, raw: script.textContent }))
      } else if (data['@graph']) {
        data['@graph'].forEach(item => schemas.push({ format: 'json-ld', type: item['@type'], data: item, raw: script.textContent }))
      } else {
        schemas.push({ format: 'json-ld', type: data['@type'], data, raw: script.textContent })
      }
    } catch { /* skip malformed JSON-LD */ }
  })

  // Microdata (basic detection)
  const microdataItems = doc.querySelectorAll('[itemscope]')
  microdataItems.forEach(el => {
    const type = el.getAttribute('itemtype')
    if (type) {
      schemas.push({ format: 'microdata', type: type.split('/').pop(), element: el.tagName })
    }
  })

  // RDFa (basic detection)
  const rdfaItems = doc.querySelectorAll('[typeof]')
  rdfaItems.forEach(el => {
    schemas.push({ format: 'rdfa', type: el.getAttribute('typeof'), element: el.tagName })
  })

  const types = schemas.map(s => s.type).filter(Boolean)

  return {
    found: schemas,
    count: schemas.length,
    types: [...new Set(types)],
    hasJsonLd: schemas.some(s => s.format === 'json-ld'),
    hasMicrodata: schemas.some(s => s.format === 'microdata'),
    hasRdfa: schemas.some(s => s.format === 'rdfa'),
    hasFaqSchema: types.includes('FAQPage'),
    hasArticleSchema: types.some(t => ['Article', 'BlogPosting', 'NewsArticle'].includes(t)),
    hasProductSchema: types.includes('Product'),
    hasLocalBusinessSchema: types.includes('LocalBusiness'),
    hasOrganizationSchema: types.includes('Organization'),
    hasBreadcrumbSchema: types.includes('BreadcrumbList'),
    hasHowToSchema: types.includes('HowTo'),
  }
}

function extractLinks(doc, baseUrl) {
  const links = Array.from(doc.querySelectorAll('a[href]'))
  let internal = 0, external = 0, broken = 0, nofollow = 0

  let base
  try { base = new URL(baseUrl) } catch { return { internal: 0, external: 0, broken: 0, nofollow: 0, total: links.length } }

  links.forEach(a => {
    const href = a.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    try {
      const linkUrl = new URL(href, baseUrl)
      if (linkUrl.hostname === base.hostname) internal++
      else external++
    } catch {
      broken++
    }
    if (a.getAttribute('rel')?.includes('nofollow')) nofollow++
  })

  return { internal, external, broken, nofollow, total: links.length }
}

function extractImages(doc) {
  const images = Array.from(doc.querySelectorAll('img'))
  let withAlt = 0, withoutAlt = 0, decorative = 0

  images.forEach(img => {
    const alt = img.getAttribute('alt')
    if (alt === '') decorative++ // explicitly empty = decorative
    else if (alt) withAlt++
    else withoutAlt++
  })

  return {
    total: images.length,
    withAlt,
    withoutAlt,
    decorative,
    altCoverage: images.length > 0 ? Math.round((withAlt / (images.length - decorative || 1)) * 100) : 100,
  }
}

function extractTechnical(doc, html) {
  const hasViewport = !!doc.querySelector('meta[name="viewport"]')
  const hasCharset = !!doc.querySelector('meta[charset]') || !!doc.querySelector('meta[http-equiv="Content-Type"]')
  const hasFavicon = !!doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]')

  // Check for common frameworks/CMS
  const generators = []
  const generatorMeta = doc.querySelector('meta[name="generator"]')?.getAttribute('content')
  if (generatorMeta) generators.push(generatorMeta)
  if (html.includes('wp-content') || html.includes('wp-includes')) generators.push('WordPress')
  if (html.includes('Shopify.theme')) generators.push('Shopify')
  if (html.includes('wix.com')) generators.push('Wix')
  if (html.includes('squarespace.com')) generators.push('Squarespace')
  if (html.includes('webflow.com') || html.includes('wf-')) generators.push('Webflow')

  // Estimate HTML size
  const htmlSize = new Blob([html]).size
  const htmlSizeKb = Math.round(htmlSize / 1024)

  // Check for render-blocking hints
  const blockingScripts = doc.querySelectorAll('head > script:not([async]):not([defer]):not([type="application/ld+json"])').length
  const blockingStyles = doc.querySelectorAll('link[rel="stylesheet"]:not([media="print"])').length

  return {
    hasViewport,
    hasCharset,
    hasFavicon,
    generators,
    htmlSizeKb,
    isLargeHtml: htmlSizeKb > 200,
    blockingScripts,
    blockingStyles,
    hasExcessiveBlocking: blockingScripts > 5 || blockingStyles > 8,
  }
}
