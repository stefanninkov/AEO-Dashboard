// src/utils/seoChecks.js

/**
 * SEO-specific check helpers.
 * These cover areas NOT in the AEO deterministicScorer:
 *   keyword analysis, readability, URL structure, image optimization, social meta.
 */

/**
 * Extract the most likely target keyword by finding overlap between H1 and title.
 * Falls back to the H1 text or the most frequent 2-3 word phrase.
 */
export function extractTargetKeyword(pageData) {
  const title = (pageData.meta.title || '').toLowerCase()
  const h1 = (pageData.headings.list.find(h => h.level === 1)?.text || '').toLowerCase()

  if (!h1 && !title) return null

  // Find overlapping words between title and H1 (excluding stopwords)
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'it', 'its', 'this', 'that',
    'from', 'as', 'not', 'no', 'so', 'if', 'how', 'what', 'when', 'where',
    'who', 'which', 'why', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'than', 'too', 'very', 'your', 'our',
    'my', 'his', 'her', 'their', 'we', 'you', 'he', 'she', 'they', 'me',
    'him', 'us', 'them', '|', '-', '–', '—',
  ])

  const titleWords = title.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w))
  const h1Words = h1.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w))

  // Find common words
  const h1Set = new Set(h1Words)
  const common = titleWords.filter(w => h1Set.has(w))

  if (common.length >= 2) return common.join(' ')
  if (common.length === 1) return common[0]
  if (h1Words.length > 0) return h1Words.slice(0, 3).join(' ')
  if (titleWords.length > 0) return titleWords.slice(0, 3).join(' ')
  return null
}

/**
 * Calculate keyword density as percentage of total words.
 */
export function calculateKeywordDensity(text, keyword) {
  if (!text || !keyword) return 0
  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  const words = lowerText.split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) return 0

  // Count occurrences (phrase-level for multi-word keywords)
  let count = 0
  let idx = 0
  while (true) {
    idx = lowerText.indexOf(lowerKeyword, idx)
    if (idx === -1) break
    count++
    idx += lowerKeyword.length
  }

  const keywordWords = lowerKeyword.split(/\s+/).length
  return (count * keywordWords / words.length) * 100
}

/**
 * Check if keyword appears in the first N words of content.
 */
export function keywordInFirstWords(text, keyword, n = 100) {
  if (!text || !keyword) return false
  const words = text.split(/\s+/).slice(0, n).join(' ').toLowerCase()
  return words.includes(keyword.toLowerCase())
}

/**
 * Simple Flesch-Kincaid readability calculation.
 * Returns a score from 0-100 (higher = easier to read).
 */
export function calculateReadability(text) {
  if (!text || text.trim().length < 100) return { score: 0, grade: 'N/A', label: 'Not enough text' }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0)

  if (sentences.length === 0 || words.length === 0) return { score: 0, grade: 'N/A', label: 'Not enough text' }

  const avgSentenceLength = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  // Flesch Reading Ease
  const score = Math.round(Math.max(0, Math.min(100,
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
  )))

  let grade, label
  if (score >= 80) { grade = '5th-6th'; label = 'Very Easy' }
  else if (score >= 60) { grade = '7th-8th'; label = 'Easy' }
  else if (score >= 40) { grade = '9th-12th'; label = 'Moderate' }
  else if (score >= 20) { grade = 'College'; label = 'Difficult' }
  else { grade = 'Graduate'; label = 'Very Difficult' }

  return { score, grade, label, avgSentenceLength: Math.round(avgSentenceLength * 10) / 10, sentenceCount: sentences.length }
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const m = word.match(/[aeiouy]{1,2}/g)
  return m ? m.length : 1
}

/**
 * Analyze URL structure for SEO best practices.
 */
export function analyzeUrlStructure(url) {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    const path = parsed.pathname
    const slug = path.split('/').filter(Boolean).pop() || ''

    return {
      isHttps: parsed.protocol === 'https:',
      length: url.length,
      pathLength: path.length,
      slug,
      hasHyphens: slug.includes('-'),
      hasUnderscores: slug.includes('_'),
      hasParams: parsed.search.length > 0,
      paramCount: parsed.searchParams.size,
      hasSpecialChars: /[^a-zA-Z0-9\-_\/.]/.test(path),
      isClean: !parsed.search && !slug.includes('_') && !/[^a-zA-Z0-9\-\/.]/.test(path),
      depth: path.split('/').filter(Boolean).length,
    }
  } catch {
    return { isHttps: false, length: 0, isClean: false, error: true }
  }
}

/**
 * Analyze content readability metrics beyond Flesch-Kincaid.
 */
export function analyzeContentReadability(doc) {
  const main = doc.querySelector('main, article, [role="main"], .content, #content') || doc.body
  const text = main?.textContent || ''
  const paragraphs = Array.from(main?.querySelectorAll('p') || [])
  const headings = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6'))

  // Sentence analysis
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length)
  const avgSentenceLength = sentenceLengths.length > 0
    ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    : 0
  const longSentences = sentenceLengths.filter(l => l > 25).length

  // Paragraph analysis
  const paragraphLengths = paragraphs.map(p => p.textContent.trim().split(/\s+/).length)
  const longParagraphs = paragraphLengths.filter(l => l > 150).length

  // Subheading frequency
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const wordsPerHeading = headings.length > 1 ? Math.round(words.length / (headings.length - 1)) : words.length

  // Intro paragraph
  const firstP = paragraphs[0]?.textContent?.trim() || ''
  const hasIntro = firstP.length > 50 && firstP.length < 500

  return {
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    longSentences,
    totalSentences: sentences.length,
    longParagraphs,
    totalParagraphs: paragraphs.length,
    wordsPerHeading,
    hasIntro,
    introLength: firstP.split(/\s+/).length,
  }
}

/**
 * Analyze images for SEO optimization beyond alt text.
 */
export function analyzeImageOptimization(doc) {
  const images = Array.from(doc.querySelectorAll('img'))

  let withLazyLoad = 0
  let withDimensions = 0
  let modernFormats = 0
  let descriptiveNames = 0

  images.forEach(img => {
    // Lazy loading
    if (img.getAttribute('loading') === 'lazy' || img.hasAttribute('data-src') || img.hasAttribute('data-lazy')) {
      withLazyLoad++
    }

    // Dimensions specified
    if ((img.getAttribute('width') || img.style.width) && (img.getAttribute('height') || img.style.height)) {
      withDimensions++
    }

    // Modern format detection
    const src = img.getAttribute('src') || img.getAttribute('data-src') || ''
    if (/\.(webp|avif)(\?|$)/i.test(src)) {
      modernFormats++
    }

    // Check for picture element with modern sources
    const picture = img.closest('picture')
    if (picture) {
      const sources = picture.querySelectorAll('source')
      sources.forEach(source => {
        const type = source.getAttribute('type') || ''
        if (type.includes('webp') || type.includes('avif')) modernFormats++
      })
    }

    // Descriptive file name (not generic like img001.jpg or DSC_1234.jpg)
    const filename = src.split('/').pop()?.split('?')[0] || ''
    const isDescriptive = filename.length > 5 &&
      !/^(img|image|photo|pic|dsc|screenshot|screen|untitled|file)\d*/i.test(filename) &&
      !/^\d+\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(filename)
    if (isDescriptive) descriptiveNames++
  })

  return {
    total: images.length,
    withLazyLoad,
    lazyLoadPct: images.length > 0 ? Math.round((withLazyLoad / images.length) * 100) : 100,
    withDimensions,
    dimensionsPct: images.length > 0 ? Math.round((withDimensions / images.length) * 100) : 100,
    modernFormats,
    modernFormatPct: images.length > 0 ? Math.round((modernFormats / images.length) * 100) : 0,
    descriptiveNames,
    descriptiveNamePct: images.length > 0 ? Math.round((descriptiveNames / images.length) * 100) : 100,
  }
}

/**
 * Analyze social/sharing meta tags beyond basic OG detection.
 */
export function analyzeSocialMeta(doc) {
  const get = (sel) => doc.querySelector(sel)?.getAttribute('content') || null

  const ogTitle = get('meta[property="og:title"]')
  const ogDesc = get('meta[property="og:description"]')
  const ogImage = get('meta[property="og:image"]')
  const ogType = get('meta[property="og:type"]')
  const ogUrl = get('meta[property="og:url"]')
  const ogSiteName = get('meta[property="og:site_name"]')

  const twitterCard = get('meta[name="twitter:card"]')
  const twitterTitle = get('meta[name="twitter:title"]')
  const twitterDesc = get('meta[name="twitter:description"]')
  const twitterImage = get('meta[name="twitter:image"]')
  const twitterSite = get('meta[name="twitter:site"]')

  const pageTitle = doc.querySelector('title')?.textContent?.trim() || ''
  const socialTitleDiffers = ogTitle && ogTitle !== pageTitle

  // Check for apple-touch-icon
  const hasAppleTouchIcon = !!doc.querySelector('link[rel="apple-touch-icon"]')
  const hasFavicon = !!doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]')

  return {
    og: { title: ogTitle, description: ogDesc, image: ogImage, type: ogType, url: ogUrl, siteName: ogSiteName },
    twitter: { card: twitterCard, title: twitterTitle, description: twitterDesc, image: twitterImage, site: twitterSite },
    socialTitleDiffers,
    hasAppleTouchIcon,
    hasFavicon,
  }
}

/**
 * Detect hreflang tags for multilingual SEO.
 */
export function detectHreflang(doc) {
  const tags = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]'))
  return tags.map(tag => ({
    lang: tag.getAttribute('hreflang'),
    href: tag.getAttribute('href'),
  }))
}

/**
 * Detect robots meta directives.
 */
export function analyzeRobotsMeta(doc) {
  const robotsMeta = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || ''
  const directives = robotsMeta.toLowerCase().split(',').map(d => d.trim()).filter(Boolean)

  return {
    raw: robotsMeta || null,
    noindex: directives.includes('noindex'),
    nofollow: directives.includes('nofollow'),
    noarchive: directives.includes('noarchive'),
    nosnippet: directives.includes('nosnippet'),
    maxSnippet: directives.find(d => d.startsWith('max-snippet')) || null,
    maxImagePreview: directives.find(d => d.startsWith('max-image-preview')) || null,
  }
}
