// src/utils/deterministicScorer.js

/**
 * Generates a deterministic AEO score from parsed page data.
 * No AI, no estimation — pure rule-based scoring.
 *
 * Categories:
 *   1. Content Structure (25 points)
 *   2. Schema Markup (20 points)
 *   3. Technical Foundation (20 points)
 *   4. AI Discoverability (20 points)
 *   5. Authority Signals (15 points)
 *
 * Total: 100 points
 */

export function scorePage(pageData, robotsData, sitemapData) {
  const checks = []

  // === 1. CONTENT STRUCTURE (25 points) ===
  const content = pageData.content
  const headings = pageData.headings
  const meta = pageData.meta

  // Title tag (3 pts)
  checks.push({
    category: 'Content Structure',
    item: 'Title tag present',
    status: meta.title ? 'pass' : 'fail',
    points: meta.title ? 2 : 0,
    maxPoints: 2,
    detail: meta.title ? `"${meta.title.slice(0, 60)}${meta.title.length > 60 ? '...' : ''}" (${meta.titleLength} chars)` : 'Missing title tag',
  })
  checks.push({
    category: 'Content Structure',
    item: 'Title length optimal (30-60 chars)',
    status: meta.titleLength >= 30 && meta.titleLength <= 60 ? 'pass' : meta.titleLength > 0 ? 'partial' : 'fail',
    points: meta.titleLength >= 30 && meta.titleLength <= 60 ? 1 : meta.titleLength > 0 ? 0.5 : 0,
    maxPoints: 1,
    detail: `${meta.titleLength} characters`,
  })

  // Meta description (3 pts)
  checks.push({
    category: 'Content Structure',
    item: 'Meta description present',
    status: meta.metaDescription ? 'pass' : 'fail',
    points: meta.metaDescription ? 2 : 0,
    maxPoints: 2,
    detail: meta.metaDescription ? `${meta.metaDescLength} chars` : 'Missing',
  })
  checks.push({
    category: 'Content Structure',
    item: 'Meta description length (120-160 chars)',
    status: meta.metaDescLength >= 120 && meta.metaDescLength <= 160 ? 'pass' : meta.metaDescLength > 0 ? 'partial' : 'fail',
    points: meta.metaDescLength >= 120 && meta.metaDescLength <= 160 ? 1 : meta.metaDescLength > 50 ? 0.5 : 0,
    maxPoints: 1,
    detail: `${meta.metaDescLength} characters`,
  })

  // Heading structure (5 pts)
  checks.push({
    category: 'Content Structure',
    item: 'Has H1 tag',
    status: headings.hasH1 ? 'pass' : 'fail',
    points: headings.hasH1 ? 2 : 0,
    maxPoints: 2,
    detail: headings.hasH1 ? (headings.multipleH1s ? `${headings.h1Count} H1s (should be 1)` : 'Single H1') : 'No H1 found',
  })
  checks.push({
    category: 'Content Structure',
    item: 'Heading hierarchy valid',
    status: headings.hierarchyValid ? 'pass' : 'partial',
    points: headings.hierarchyValid ? 2 : 1,
    maxPoints: 2,
    detail: `${headings.totalCount} headings, ${headings.hierarchyValid ? 'proper' : 'broken'} hierarchy`,
  })
  checks.push({
    category: 'Content Structure',
    item: 'Has question-format headings',
    status: content.qaPatterns.hasQuestionHeadings ? 'pass' : 'partial',
    points: content.qaPatterns.hasQuestionHeadings ? 1 : 0,
    maxPoints: 1,
    detail: content.qaPatterns.hasQuestionHeadings ? 'Question headings found — AI-friendly' : 'No question-format headings detected',
  })

  // Word count (4 pts)
  checks.push({
    category: 'Content Structure',
    item: 'Sufficient content depth',
    status: content.isSubstantial ? 'pass' : content.isThinContent ? 'fail' : 'partial',
    points: content.isSubstantial ? 4 : content.isThinContent ? 0 : 2,
    maxPoints: 4,
    detail: `${content.wordCount} words (${content.isThinContent ? 'thin — under 300' : content.isSubstantial ? 'substantial — 1000+' : 'moderate — 300-999'})`,
  })

  // Structured elements (3 pts)
  checks.push({
    category: 'Content Structure',
    item: 'Uses structured elements (lists, tables)',
    status: content.structuredElements.totalLists > 0 || content.structuredElements.tables > 0 ? 'pass' : 'partial',
    points: content.structuredElements.totalLists > 2 || content.structuredElements.tables > 0 ? 3 : content.structuredElements.totalLists > 0 ? 1.5 : 0,
    maxPoints: 3,
    detail: `${content.structuredElements.orderedLists} ordered lists, ${content.structuredElements.unorderedLists} unordered, ${content.structuredElements.tables} tables`,
  })

  // FAQ patterns (3 pts)
  const faqScore = (content.qaPatterns.hasFaqSection ? 1 : 0) + (content.qaPatterns.hasQuestionHeadings ? 1 : 0) + (content.qaPatterns.hasDefinitionLists ? 1 : 0)
  checks.push({
    category: 'Content Structure',
    item: 'FAQ / Q&A content patterns',
    status: faqScore >= 2 ? 'pass' : faqScore >= 1 ? 'partial' : 'fail',
    points: faqScore,
    maxPoints: 3,
    detail: [
      content.qaPatterns.hasFaqSection ? 'FAQ section' : null,
      content.qaPatterns.hasQuestionHeadings ? 'Question headings' : null,
      content.qaPatterns.hasDefinitionLists ? 'Definition lists' : null,
    ].filter(Boolean).join(', ') || 'No Q&A patterns found',
  })

  // === 2. SCHEMA MARKUP (20 points) ===
  const schema = pageData.schema

  checks.push({
    category: 'Schema Markup',
    item: 'Has any structured data',
    status: schema.count > 0 ? 'pass' : 'fail',
    points: schema.count > 0 ? 5 : 0,
    maxPoints: 5,
    detail: schema.count > 0 ? `${schema.count} schema(s) found: ${schema.types.join(', ')}` : 'No structured data detected',
  })
  checks.push({
    category: 'Schema Markup',
    item: 'Uses JSON-LD format',
    status: schema.hasJsonLd ? 'pass' : schema.count > 0 ? 'partial' : 'fail',
    points: schema.hasJsonLd ? 5 : schema.count > 0 ? 2 : 0,
    maxPoints: 5,
    detail: schema.hasJsonLd ? 'JSON-LD detected (recommended format)' : schema.count > 0 ? 'Schema found but not JSON-LD — consider migrating' : 'No JSON-LD',
  })
  checks.push({
    category: 'Schema Markup',
    item: 'Has FAQ or HowTo schema',
    status: schema.hasFaqSchema || schema.hasHowToSchema ? 'pass' : 'fail',
    points: schema.hasFaqSchema || schema.hasHowToSchema ? 5 : 0,
    maxPoints: 5,
    detail: [
      schema.hasFaqSchema ? 'FAQPage' : null,
      schema.hasHowToSchema ? 'HowTo' : null,
    ].filter(Boolean).join(', ') || 'No FAQ or HowTo schema — these are the most AEO-valuable types',
  })
  checks.push({
    category: 'Schema Markup',
    item: 'Organization / Author schema',
    status: schema.hasOrganizationSchema || schema.hasArticleSchema ? 'pass' : 'partial',
    points: schema.hasOrganizationSchema ? 5 : schema.hasArticleSchema ? 3 : 0,
    maxPoints: 5,
    detail: [
      schema.hasOrganizationSchema ? 'Organization' : null,
      schema.hasArticleSchema ? 'Article' : null,
    ].filter(Boolean).join(', ') || 'Consider adding Organization or Article schema for authority signals',
  })

  // === 3. TECHNICAL FOUNDATION (20 points) ===
  const tech = pageData.technical

  checks.push({
    category: 'Technical',
    item: 'Mobile-friendly (has viewport meta)',
    status: tech.hasViewport ? 'pass' : 'fail',
    points: tech.hasViewport ? 4 : 0,
    maxPoints: 4,
  })
  checks.push({
    category: 'Technical',
    item: 'HTML lang attribute set',
    status: meta.lang ? 'pass' : 'fail',
    points: meta.lang ? 3 : 0,
    maxPoints: 3,
    detail: meta.lang ? `lang="${meta.lang}"` : 'Missing lang attribute — important for multilingual AEO',
  })
  checks.push({
    category: 'Technical',
    item: 'Canonical URL defined',
    status: meta.canonical ? 'pass' : 'partial',
    points: meta.canonical ? 3 : 0,
    maxPoints: 3,
    detail: meta.canonical ? `Canonical: ${meta.canonical}` : 'No canonical tag — may cause duplicate content in AI indices',
  })
  checks.push({
    category: 'Technical',
    item: 'OpenGraph tags present',
    status: meta.og.title && meta.og.description ? 'pass' : meta.og.title ? 'partial' : 'fail',
    points: meta.og.title && meta.og.description ? 3 : meta.og.title ? 1.5 : 0,
    maxPoints: 3,
    detail: [
      meta.og.title ? 'og:title' : 'og:title missing',
      meta.og.description ? 'og:description' : 'og:description missing',
      meta.og.image ? 'og:image' : 'og:image missing',
    ].join(', '),
  })
  checks.push({
    category: 'Technical',
    item: 'Page size reasonable',
    status: !tech.isLargeHtml ? 'pass' : 'partial',
    points: !tech.isLargeHtml ? 3 : 1,
    maxPoints: 3,
    detail: `${tech.htmlSizeKb}KB HTML${tech.isLargeHtml ? ' — large HTML may slow AI crawling' : ''}`,
  })
  checks.push({
    category: 'Technical',
    item: 'No excessive render-blocking resources',
    status: !tech.hasExcessiveBlocking ? 'pass' : 'partial',
    points: !tech.hasExcessiveBlocking ? 4 : 2,
    maxPoints: 4,
    detail: `${tech.blockingScripts} blocking scripts, ${tech.blockingStyles} stylesheets`,
  })

  // === 4. AI DISCOVERABILITY (20 points) ===
  // Based on robots.txt + sitemap data

  if (robotsData) {
    const crawlerScore = robotsData.summary ? (robotsData.summary.allowed / robotsData.summary.total) * 10 : 0
    checks.push({
      category: 'AI Discoverability',
      item: 'AI crawlers allowed (robots.txt)',
      status: robotsData.summary?.blocked === 0 ? 'pass' : robotsData.summary?.allowed > 0 ? 'partial' : 'fail',
      points: Math.round(crawlerScore * 10) / 10,
      maxPoints: 10,
      detail: robotsData.summary ? `${robotsData.summary.allowed}/${robotsData.summary.total} AI crawlers allowed` : 'robots.txt not found',
    })
  }

  if (sitemapData) {
    checks.push({
      category: 'AI Discoverability',
      item: 'Sitemap exists',
      status: sitemapData.found ? 'pass' : 'fail',
      points: sitemapData.found ? 4 : 0,
      maxPoints: 4,
      detail: sitemapData.found ? `${sitemapData.pageCount || '?'} pages` : 'No sitemap found — AI crawlers rely on sitemaps for discovery',
    })
    checks.push({
      category: 'AI Discoverability',
      item: 'Sitemap has lastmod dates',
      status: sitemapData.hasLastmod ? 'pass' : sitemapData.found ? 'partial' : 'fail',
      points: sitemapData.hasLastmod ? 3 : 0,
      maxPoints: 3,
      detail: sitemapData.hasLastmod ? `${sitemapData.lastmodCoverage}% coverage` : 'No lastmod dates — AI engines use this as freshness signal',
    })
    checks.push({
      category: 'AI Discoverability',
      item: 'Content freshness (recent updates)',
      status: sitemapData.freshness?.fresh > 0 ? 'pass' : 'partial',
      points: sitemapData.freshness?.fresh > 5 ? 3 : sitemapData.freshness?.fresh > 0 ? 1.5 : 0,
      maxPoints: 3,
      detail: sitemapData.freshness ? `${sitemapData.freshness.fresh} pages updated in last 30 days` : 'Unknown',
    })
  }

  // === 5. AUTHORITY SIGNALS (15 points) ===
  const links = pageData.links
  const images = pageData.images

  checks.push({
    category: 'Authority Signals',
    item: 'Internal linking present',
    status: links.internal > 5 ? 'pass' : links.internal > 0 ? 'partial' : 'fail',
    points: links.internal > 10 ? 4 : links.internal > 5 ? 3 : links.internal > 0 ? 1 : 0,
    maxPoints: 4,
    detail: `${links.internal} internal links`,
  })
  checks.push({
    category: 'Authority Signals',
    item: 'External references (outbound links)',
    status: links.external > 0 ? 'pass' : 'partial',
    points: links.external > 2 ? 3 : links.external > 0 ? 2 : 0,
    maxPoints: 3,
    detail: links.external > 0 ? `${links.external} external links — shows sourcing` : 'No external links — citing sources builds AI trust',
  })
  checks.push({
    category: 'Authority Signals',
    item: 'Images with alt text',
    status: images.altCoverage >= 90 ? 'pass' : images.altCoverage >= 50 ? 'partial' : images.total === 0 ? 'partial' : 'fail',
    points: images.altCoverage >= 90 ? 4 : images.altCoverage >= 50 ? 2 : 0,
    maxPoints: 4,
    detail: images.total > 0 ? `${images.withAlt}/${images.total - images.decorative} images have alt text (${images.altCoverage}%)` : 'No images found',
  })
  checks.push({
    category: 'Authority Signals',
    item: 'Language attribute matches content intent',
    status: meta.lang ? 'pass' : 'fail',
    points: meta.lang ? 4 : 0,
    maxPoints: 4,
    detail: meta.lang ? `lang="${meta.lang}"` : 'Missing — affects multilingual AI indexing',
  })

  // === SCORE CALCULATION ===
  const totalPoints = checks.reduce((sum, c) => sum + c.points, 0)
  const maxPoints = checks.reduce((sum, c) => sum + c.maxPoints, 0)
  const overallScore = Math.round((totalPoints / maxPoints) * 100)

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
    totalPoints,
    maxPoints,
    categories,
    checks,
    timestamp: new Date().toISOString(),
  }
}
