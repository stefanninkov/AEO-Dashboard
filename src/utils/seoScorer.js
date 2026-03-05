// src/utils/seoScorer.js

/**
 * Deterministic SEO-specific scorer — 100 points.
 * Scores ONLY areas NOT covered by the AEO deterministicScorer.js:
 *   1. Keyword Optimization (25 pts)
 *   2. Readability & UX (20 pts)
 *   3. URL & Technical SEO (20 pts)
 *   4. Social & Sharing (20 pts)
 *   5. Image Optimization (15 pts)
 *
 * For AEO-covered checks (title/meta/headings/schema/robots/sitemap/links),
 * import and display the AEO score alongside — no duplication.
 */

import {
  extractTargetKeyword,
  calculateKeywordDensity,
  keywordInFirstWords,
  calculateReadability,
  analyzeUrlStructure,
  analyzeContentReadability,
  analyzeImageOptimization,
  analyzeSocialMeta,
  detectHreflang,
  analyzeRobotsMeta,
} from './seoChecks'

export function scoreSeo(pageData, robotsData, sitemapData, url, html) {
  const checks = []
  const meta = pageData.meta
  const content = pageData.content
  const headings = pageData.headings

  // Parse the HTML again for DOM-level checks not in parsePageData
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract target keyword
  const targetKeyword = extractTargetKeyword(pageData)

  // Get body text for analysis
  const mainEl = doc.querySelector('main, article, [role="main"], .content, #content') || doc.body
  const bodyText = mainEl?.textContent || ''

  // === 1. KEYWORD OPTIMIZATION (25 points) ===

  if (targetKeyword) {
    // Keyword in title (4 pts)
    const titleHasKw = (meta.title || '').toLowerCase().includes(targetKeyword.toLowerCase())
    checks.push({
      category: 'Keyword Optimization',
      item: 'Target keyword in title',
      status: titleHasKw ? 'pass' : 'fail',
      points: titleHasKw ? 4 : 0,
      maxPoints: 4,
      detail: titleHasKw
        ? `"${targetKeyword}" found in title`
        : `"${targetKeyword}" not found in title`,
    })

    // Keyword in meta description (3 pts)
    const descHasKw = (meta.metaDescription || '').toLowerCase().includes(targetKeyword.toLowerCase())
    checks.push({
      category: 'Keyword Optimization',
      item: 'Target keyword in meta description',
      status: descHasKw ? 'pass' : 'fail',
      points: descHasKw ? 3 : 0,
      maxPoints: 3,
      detail: descHasKw
        ? `"${targetKeyword}" found in description`
        : `"${targetKeyword}" not found in description`,
    })

    // Keyword in H1 (3 pts)
    const h1Text = headings.list.find(h => h.level === 1)?.text || ''
    const h1HasKw = h1Text.toLowerCase().includes(targetKeyword.toLowerCase())
    checks.push({
      category: 'Keyword Optimization',
      item: 'Target keyword in H1',
      status: h1HasKw ? 'pass' : 'fail',
      points: h1HasKw ? 3 : 0,
      maxPoints: 3,
      detail: h1HasKw
        ? `"${targetKeyword}" found in H1`
        : `"${targetKeyword}" not found in H1`,
    })

    // Keyword density (4 pts)
    const density = calculateKeywordDensity(bodyText, targetKeyword)
    const densityOk = density >= 0.5 && density <= 3
    const densityPartial = density > 0 && density < 0.5
    checks.push({
      category: 'Keyword Optimization',
      item: 'Keyword density (0.5-3%)',
      status: densityOk ? 'pass' : densityPartial ? 'partial' : 'fail',
      points: densityOk ? 4 : densityPartial ? 2 : 0,
      maxPoints: 4,
      detail: `${density.toFixed(1)}% density for "${targetKeyword}"`,
    })

    // Keyword in first 100 words (3 pts)
    const inFirst = keywordInFirstWords(bodyText, targetKeyword, 100)
    checks.push({
      category: 'Keyword Optimization',
      item: 'Keyword in first 100 words',
      status: inFirst ? 'pass' : 'fail',
      points: inFirst ? 3 : 0,
      maxPoints: 3,
      detail: inFirst
        ? `"${targetKeyword}" appears early in content`
        : `"${targetKeyword}" not found in first 100 words`,
    })

    // Keyword in URL slug (3 pts)
    const urlInfo = analyzeUrlStructure(url)
    const slugHasKw = (urlInfo.slug || '').toLowerCase().includes(targetKeyword.toLowerCase().replace(/\s+/g, '-'))
      || (urlInfo.slug || '').toLowerCase().includes(targetKeyword.toLowerCase().replace(/\s+/g, ''))
    checks.push({
      category: 'Keyword Optimization',
      item: 'Keyword in URL slug',
      status: slugHasKw ? 'pass' : 'partial',
      points: slugHasKw ? 3 : 0,
      maxPoints: 3,
      detail: slugHasKw
        ? `Keyword reflected in URL`
        : `URL slug: "${urlInfo.slug || '/'}" — consider including keyword`,
    })

    // Related keywords in headings (3 pts)
    const kwWords = targetKeyword.toLowerCase().split(/\s+/)
    const headingTexts = headings.list.filter(h => h.level >= 2).map(h => h.text.toLowerCase())
    const headingsWithKw = headingTexts.filter(t => kwWords.some(w => t.includes(w))).length
    const headingKwRatio = headingTexts.length > 0 ? headingsWithKw / headingTexts.length : 0
    checks.push({
      category: 'Keyword Optimization',
      item: 'Related keywords in subheadings',
      status: headingKwRatio >= 0.3 ? 'pass' : headingKwRatio > 0 ? 'partial' : 'fail',
      points: headingKwRatio >= 0.3 ? 3 : headingKwRatio > 0 ? 1.5 : 0,
      maxPoints: 3,
      detail: `${headingsWithKw}/${headingTexts.length} subheadings contain related keywords`,
    })

    // Keyword in image alt text (2 pts)
    const imgAlts = Array.from(doc.querySelectorAll('img[alt]')).map(img => img.getAttribute('alt').toLowerCase())
    const altHasKw = imgAlts.some(alt => kwWords.some(w => alt.includes(w)))
    checks.push({
      category: 'Keyword Optimization',
      item: 'Keyword in image alt text',
      status: altHasKw ? 'pass' : 'partial',
      points: altHasKw ? 2 : 0,
      maxPoints: 2,
      detail: altHasKw
        ? 'Related keyword found in image alt text'
        : 'No keyword-related alt text found',
    })
  } else {
    // No keyword could be extracted
    checks.push({
      category: 'Keyword Optimization',
      item: 'Target keyword detected',
      status: 'fail',
      points: 0,
      maxPoints: 25,
      detail: 'Could not extract target keyword — ensure title and H1 share keyword focus',
    })
  }

  // === 2. READABILITY & UX (20 points) ===

  const readability = calculateReadability(bodyText)
  const contentReadability = analyzeContentReadability(doc)

  // Flesch-Kincaid score (5 pts)
  checks.push({
    category: 'Readability & UX',
    item: 'Readability score',
    status: readability.score >= 60 ? 'pass' : readability.score >= 40 ? 'partial' : 'fail',
    points: readability.score >= 60 ? 5 : readability.score >= 40 ? 3 : readability.score > 0 ? 1 : 0,
    maxPoints: 5,
    detail: `Flesch-Kincaid: ${readability.score}/100 (${readability.label}) — ${readability.grade} grade level`,
  })

  // Average sentence length (3 pts)
  checks.push({
    category: 'Readability & UX',
    item: 'Average sentence length (<20 words)',
    status: contentReadability.avgSentenceLength <= 20 ? 'pass' : contentReadability.avgSentenceLength <= 25 ? 'partial' : 'fail',
    points: contentReadability.avgSentenceLength <= 20 ? 3 : contentReadability.avgSentenceLength <= 25 ? 1.5 : 0,
    maxPoints: 3,
    detail: `${contentReadability.avgSentenceLength} words avg, ${contentReadability.longSentences} long sentences`,
  })

  // Paragraph length (3 pts)
  checks.push({
    category: 'Readability & UX',
    item: 'Reasonable paragraph length',
    status: contentReadability.longParagraphs === 0 ? 'pass' : contentReadability.longParagraphs <= 2 ? 'partial' : 'fail',
    points: contentReadability.longParagraphs === 0 ? 3 : contentReadability.longParagraphs <= 2 ? 1.5 : 0,
    maxPoints: 3,
    detail: `${contentReadability.longParagraphs} paragraphs over 150 words (${contentReadability.totalParagraphs} total)`,
  })

  // Subheadings every ~300 words (3 pts)
  checks.push({
    category: 'Readability & UX',
    item: 'Subheadings every ~300 words',
    status: contentReadability.wordsPerHeading <= 300 ? 'pass' : contentReadability.wordsPerHeading <= 500 ? 'partial' : 'fail',
    points: contentReadability.wordsPerHeading <= 300 ? 3 : contentReadability.wordsPerHeading <= 500 ? 1.5 : 0,
    maxPoints: 3,
    detail: `~${contentReadability.wordsPerHeading} words between headings`,
  })

  // No walls of text (3 pts) — reuse long paragraphs + sentence data
  const hasWalls = contentReadability.longParagraphs > 3 || contentReadability.longSentences > 10
  checks.push({
    category: 'Readability & UX',
    item: 'No walls of text',
    status: !hasWalls ? 'pass' : 'fail',
    points: !hasWalls ? 3 : 0,
    maxPoints: 3,
    detail: hasWalls
      ? 'Content has large blocks of unbroken text'
      : 'Content is well-broken into digestible sections',
  })

  // Clear intro paragraph (3 pts)
  checks.push({
    category: 'Readability & UX',
    item: 'Clear introduction paragraph',
    status: contentReadability.hasIntro ? 'pass' : 'partial',
    points: contentReadability.hasIntro ? 3 : 0,
    maxPoints: 3,
    detail: contentReadability.hasIntro
      ? `Intro paragraph: ${contentReadability.introLength} words`
      : 'No clear introductory paragraph detected',
  })

  // === 3. URL & TECHNICAL SEO (20 points) ===

  const urlInfo = analyzeUrlStructure(url)
  const robotsMeta = analyzeRobotsMeta(doc)
  const hreflangTags = detectHreflang(doc)

  // HTTPS (4 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'HTTPS/SSL enabled',
    status: urlInfo.isHttps ? 'pass' : 'fail',
    points: urlInfo.isHttps ? 4 : 0,
    maxPoints: 4,
    detail: urlInfo.isHttps ? 'Site uses HTTPS' : 'Site not using HTTPS — critical for SEO',
  })

  // URL length (3 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'URL length (<75 chars)',
    status: urlInfo.length <= 75 ? 'pass' : urlInfo.length <= 100 ? 'partial' : 'fail',
    points: urlInfo.length <= 75 ? 3 : urlInfo.length <= 100 ? 1.5 : 0,
    maxPoints: 3,
    detail: `${urlInfo.length} characters`,
  })

  // Hyphens not underscores (2 pts)
  const urlSlugOk = !urlInfo.hasUnderscores || urlInfo.hasHyphens
  checks.push({
    category: 'URL & Technical',
    item: 'URL uses hyphens (not underscores)',
    status: !urlInfo.hasUnderscores ? 'pass' : 'fail',
    points: !urlInfo.hasUnderscores ? 2 : 0,
    maxPoints: 2,
    detail: urlInfo.hasUnderscores
      ? 'URL contains underscores — Google treats hyphens as word separators'
      : 'URL uses hyphens correctly',
  })

  // No special chars/params (2 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'Clean URL (no params/special chars)',
    status: !urlInfo.hasParams && !urlInfo.hasSpecialChars ? 'pass' : 'partial',
    points: !urlInfo.hasParams && !urlInfo.hasSpecialChars ? 2 : 1,
    maxPoints: 2,
    detail: urlInfo.hasParams
      ? `${urlInfo.paramCount} URL parameters detected`
      : urlInfo.hasSpecialChars ? 'URL contains special characters' : 'Clean URL structure',
  })

  // Charset (2 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'Charset declared',
    status: meta.charset ? 'pass' : 'fail',
    points: meta.charset ? 2 : 0,
    maxPoints: 2,
    detail: meta.charset ? `Charset: ${meta.charset}` : 'No charset declared',
  })

  // Favicon (2 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'Favicon present',
    status: pageData.technical.hasFavicon ? 'pass' : 'fail',
    points: pageData.technical.hasFavicon ? 2 : 0,
    maxPoints: 2,
    detail: pageData.technical.hasFavicon ? 'Favicon found' : 'No favicon — affects brand recognition in tabs',
  })

  // Hreflang (3 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'Hreflang tags (multilingual)',
    status: hreflangTags.length > 0 ? 'pass' : 'partial',
    points: hreflangTags.length > 0 ? 3 : 1,
    maxPoints: 3,
    detail: hreflangTags.length > 0
      ? `${hreflangTags.length} language variants: ${hreflangTags.map(t => t.lang).join(', ')}`
      : 'No hreflang tags — add if targeting multiple languages',
  })

  // Robots meta noindex (2 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'Not blocked by robots meta',
    status: !robotsMeta.noindex ? 'pass' : 'fail',
    points: !robotsMeta.noindex ? 2 : 0,
    maxPoints: 2,
    detail: robotsMeta.noindex
      ? 'Page has noindex — will not appear in search results!'
      : robotsMeta.raw ? `Robots: ${robotsMeta.raw}` : 'No restrictive robots directives',
  })

  // === 4. SOCIAL & SHARING (20 points) ===

  const social = analyzeSocialMeta(doc)

  // OG image (4 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Open Graph image',
    status: social.og.image ? 'pass' : 'fail',
    points: social.og.image ? 4 : 0,
    maxPoints: 4,
    detail: social.og.image ? 'OG image set' : 'No og:image — links shared on social will lack a preview image',
  })

  // OG type (3 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Open Graph type',
    status: social.og.type ? 'pass' : 'fail',
    points: social.og.type ? 3 : 0,
    maxPoints: 3,
    detail: social.og.type ? `og:type="${social.og.type}"` : 'No og:type defined',
  })

  // Twitter card (3 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Twitter card meta',
    status: social.twitter.card ? 'pass' : 'fail',
    points: social.twitter.card ? 3 : 0,
    maxPoints: 3,
    detail: social.twitter.card ? `twitter:card="${social.twitter.card}"` : 'No twitter:card — tweets sharing this URL will lack rich preview',
  })

  // Twitter image (3 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Twitter image',
    status: social.twitter.image || social.og.image ? 'pass' : 'fail',
    points: social.twitter.image ? 3 : social.og.image ? 2 : 0,
    maxPoints: 3,
    detail: social.twitter.image
      ? 'Dedicated Twitter image set'
      : social.og.image ? 'Using OG image as fallback (consider dedicated twitter:image)' : 'No Twitter image',
  })

  // Social title differs from page title (2 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Social title optimized',
    status: social.socialTitleDiffers ? 'pass' : social.og.title ? 'partial' : 'fail',
    points: social.socialTitleDiffers ? 2 : social.og.title ? 1 : 0,
    maxPoints: 2,
    detail: social.socialTitleDiffers
      ? 'Social title differs from page title — optimized for sharing'
      : social.og.title ? 'Social title same as page title' : 'No social title set',
  })

  // Social description (3 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Social description',
    status: social.og.description ? 'pass' : 'fail',
    points: social.og.description ? 3 : 0,
    maxPoints: 3,
    detail: social.og.description
      ? `${social.og.description.length} chars`
      : 'No social description — sharing will use meta description or auto-extract',
  })

  // Apple touch icon / favicon (2 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Apple touch icon / favicon',
    status: social.hasAppleTouchIcon ? 'pass' : social.hasFavicon ? 'partial' : 'fail',
    points: social.hasAppleTouchIcon ? 2 : social.hasFavicon ? 1 : 0,
    maxPoints: 2,
    detail: social.hasAppleTouchIcon
      ? 'Apple touch icon present'
      : social.hasFavicon ? 'Favicon present but no apple-touch-icon' : 'No favicon or touch icon',
  })

  // === 5. IMAGE OPTIMIZATION (15 points) ===

  const imageOpt = analyzeImageOptimization(doc)

  if (imageOpt.total === 0) {
    checks.push({
      category: 'Image Optimization',
      item: 'Images on page',
      status: 'partial',
      points: 10,
      maxPoints: 15,
      detail: 'No images found — images can improve engagement and SEO',
    })
  } else {
    // Lazy loading (4 pts)
    checks.push({
      category: 'Image Optimization',
      item: 'Lazy loading used',
      status: imageOpt.lazyLoadPct >= 70 ? 'pass' : imageOpt.lazyLoadPct >= 30 ? 'partial' : 'fail',
      points: imageOpt.lazyLoadPct >= 70 ? 4 : imageOpt.lazyLoadPct >= 30 ? 2 : 0,
      maxPoints: 4,
      detail: `${imageOpt.withLazyLoad}/${imageOpt.total} images use lazy loading (${imageOpt.lazyLoadPct}%)`,
    })

    // Dimensions specified (3 pts)
    checks.push({
      category: 'Image Optimization',
      item: 'Dimensions specified',
      status: imageOpt.dimensionsPct >= 80 ? 'pass' : imageOpt.dimensionsPct >= 40 ? 'partial' : 'fail',
      points: imageOpt.dimensionsPct >= 80 ? 3 : imageOpt.dimensionsPct >= 40 ? 1.5 : 0,
      maxPoints: 3,
      detail: `${imageOpt.withDimensions}/${imageOpt.total} images have width/height (${imageOpt.dimensionsPct}%)`,
    })

    // Modern formats (3 pts)
    checks.push({
      category: 'Image Optimization',
      item: 'Modern image formats (WebP/AVIF)',
      status: imageOpt.modernFormatPct >= 50 ? 'pass' : imageOpt.modernFormatPct > 0 ? 'partial' : 'fail',
      points: imageOpt.modernFormatPct >= 50 ? 3 : imageOpt.modernFormatPct > 0 ? 1.5 : 0,
      maxPoints: 3,
      detail: `${imageOpt.modernFormats}/${imageOpt.total} images use WebP/AVIF (${imageOpt.modernFormatPct}%)`,
    })

    // Descriptive file names (3 pts)
    checks.push({
      category: 'Image Optimization',
      item: 'Descriptive file names',
      status: imageOpt.descriptiveNamePct >= 70 ? 'pass' : imageOpt.descriptiveNamePct >= 40 ? 'partial' : 'fail',
      points: imageOpt.descriptiveNamePct >= 70 ? 3 : imageOpt.descriptiveNamePct >= 40 ? 1.5 : 0,
      maxPoints: 3,
      detail: `${imageOpt.descriptiveNames}/${imageOpt.total} images have descriptive filenames (${imageOpt.descriptiveNamePct}%)`,
    })

    // No oversized images — heuristic: check for very long src URLs with dimension hints
    // This is best-effort since we can't check actual file sizes from HTML alone
    checks.push({
      category: 'Image Optimization',
      item: 'Image optimization (general)',
      status: imageOpt.lazyLoadPct >= 50 && imageOpt.dimensionsPct >= 50 ? 'pass' : 'partial',
      points: imageOpt.lazyLoadPct >= 50 && imageOpt.dimensionsPct >= 50 ? 2 : 1,
      maxPoints: 2,
      detail: 'Overall image optimization assessment based on lazy loading and dimension hints',
    })
  }

  // === SCORE CALCULATION ===
  const totalPoints = checks.reduce((sum, c) => sum + c.points, 0)
  const maxPoints = checks.reduce((sum, c) => sum + c.maxPoints, 0)
  const overallScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0

  // Group by category
  const categories = {}
  checks.forEach(c => {
    if (!categories[c.category]) {
      categories[c.category] = { items: [], score: 0, maxScore: 0 }
    }
    categories[c.category].items.push(c)
    categories[c.category].score += c.points
    categories[c.category].maxScore += c.maxPoints
  })

  return {
    overallScore,
    totalPoints: Math.round(totalPoints * 10) / 10,
    maxPoints,
    categories,
    checks,
    targetKeyword,
    timestamp: new Date().toISOString(),
  }
}
