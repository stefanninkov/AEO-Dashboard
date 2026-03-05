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
 * Each check includes a `fix` field (string or array of steps) with
 * actionable guidance so users know exactly how to improve their score.
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
      fix: !titleHasKw ? [
        `Add "${targetKeyword}" to your <title> tag, ideally near the beginning.`,
        'Keep the title under 60 characters so it displays fully in search results.',
        'Example: <title>' + targetKeyword.charAt(0).toUpperCase() + targetKeyword.slice(1) + ' — Your Brand</title>',
      ] : null,
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
      fix: !descHasKw ? [
        `Include "${targetKeyword}" naturally in your meta description.`,
        'Write a compelling 150-160 character description that includes your keyword.',
        'The meta description is your "ad copy" in search results — make it enticing.',
        'Add or edit: <meta name="description" content="Your description with ' + targetKeyword + '...">',
      ] : null,
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
      fix: !h1HasKw ? [
        `Add "${targetKeyword}" to your main H1 heading.`,
        'Each page should have exactly one H1 that clearly states the topic.',
        h1Text ? `Current H1: "${h1Text}" — rewrite to include "${targetKeyword}".` : 'No H1 found — add an <h1> tag with your target keyword.',
      ] : null,
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
      fix: !densityOk ? (
        density < 0.5 ? [
          `Your keyword density is too low (${density.toFixed(1)}%). Aim for 0.5-3%.`,
          `Use "${targetKeyword}" more naturally throughout your content.`,
          'Add it in introductions, subheadings, and conclusions.',
          'Use variations and synonyms to avoid sounding repetitive.',
        ] : [
          `Your keyword density is too high (${density.toFixed(1)}%). This can look like keyword stuffing.`,
          'Remove some instances and replace with synonyms or related terms.',
          'Aim for 0.5-3% — write naturally for humans first, search engines second.',
        ]
      ) : null,
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
      fix: !inFirst ? [
        `Mention "${targetKeyword}" within the first 100 words of your content.`,
        'Search engines weight early content more heavily.',
        'Add it naturally in your opening paragraph or introduction.',
      ] : null,
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
        ? 'Keyword reflected in URL'
        : `URL slug: "${urlInfo.slug || '/'}" — consider including keyword`,
      fix: !slugHasKw ? [
        `Include "${targetKeyword.replace(/\s+/g, '-').toLowerCase()}" in your URL slug.`,
        'Example: /your-page/' + targetKeyword.replace(/\s+/g, '-').toLowerCase() + '/',
        'Note: Changing URLs on live pages requires a 301 redirect from the old URL.',
        'For new pages, always plan keyword-rich URLs upfront.',
      ] : null,
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
      fix: headingKwRatio < 0.3 ? [
        `Include "${targetKeyword}" or related terms in at least 30% of your H2/H3 headings.`,
        'Use variations like "best ' + targetKeyword + '", "how to ' + targetKeyword + '", etc.',
        'Don\'t force it — headings should still read naturally for users.',
        `Currently ${headingsWithKw} of ${headingTexts.length} subheadings contain related keywords.`,
      ] : null,
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
      fix: !altHasKw ? [
        `Add "${targetKeyword}" or related terms to at least one image alt attribute.`,
        'Write descriptive alt text: alt="' + targetKeyword + ' example diagram"',
        'Don\'t keyword-stuff alt text — describe the image accurately while including the keyword.',
      ] : null,
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
      fix: [
        'Make sure your page title and H1 heading share a clear keyword focus.',
        'The SEO scorer extracts the target keyword from overlapping words in your title and H1.',
        'Example: Title "Best Coffee Beans Guide" + H1 "Best Coffee Beans for 2024" → keyword: "coffee beans".',
        'If your title and H1 are completely different, the keyword can\'t be detected.',
      ],
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
    fix: readability.score < 60 ? [
      `Your readability score is ${readability.score}/100. Aim for 60+ (8th grade level).`,
      'Use shorter sentences (under 20 words each).',
      'Choose simpler words — "use" instead of "utilize", "help" instead of "facilitate".',
      'Break complex ideas into multiple sentences.',
      'Use bullet points and lists to simplify dense information.',
    ] : null,
  })

  // Average sentence length (3 pts)
  checks.push({
    category: 'Readability & UX',
    item: 'Average sentence length (<20 words)',
    status: contentReadability.avgSentenceLength <= 20 ? 'pass' : contentReadability.avgSentenceLength <= 25 ? 'partial' : 'fail',
    points: contentReadability.avgSentenceLength <= 20 ? 3 : contentReadability.avgSentenceLength <= 25 ? 1.5 : 0,
    maxPoints: 3,
    detail: `${contentReadability.avgSentenceLength} words avg, ${contentReadability.longSentences} long sentences`,
    fix: contentReadability.avgSentenceLength > 20 ? [
      `Average sentence length is ${contentReadability.avgSentenceLength} words. Target under 20.`,
      `You have ${contentReadability.longSentences} long sentences — split them into shorter ones.`,
      'Look for sentences with "and", "but", "which" — these can usually be split.',
      'Vary sentence length: mix short punchy sentences with moderate ones.',
    ] : null,
  })

  // Paragraph length (3 pts)
  checks.push({
    category: 'Readability & UX',
    item: 'Reasonable paragraph length',
    status: contentReadability.longParagraphs === 0 ? 'pass' : contentReadability.longParagraphs <= 2 ? 'partial' : 'fail',
    points: contentReadability.longParagraphs === 0 ? 3 : contentReadability.longParagraphs <= 2 ? 1.5 : 0,
    maxPoints: 3,
    detail: `${contentReadability.longParagraphs} paragraphs over 150 words (${contentReadability.totalParagraphs} total)`,
    fix: contentReadability.longParagraphs > 0 ? [
      `${contentReadability.longParagraphs} paragraphs exceed 150 words — break them up.`,
      'Ideal paragraph length is 2-4 sentences (40-100 words).',
      'Add line breaks at natural topic shifts within long paragraphs.',
      'Use subheadings to introduce new sections instead of continuing the same paragraph.',
    ] : null,
  })

  // Subheadings every ~300 words (3 pts)
  checks.push({
    category: 'Readability & UX',
    item: 'Subheadings every ~300 words',
    status: contentReadability.wordsPerHeading <= 300 ? 'pass' : contentReadability.wordsPerHeading <= 500 ? 'partial' : 'fail',
    points: contentReadability.wordsPerHeading <= 300 ? 3 : contentReadability.wordsPerHeading <= 500 ? 1.5 : 0,
    maxPoints: 3,
    detail: `~${contentReadability.wordsPerHeading} words between headings`,
    fix: contentReadability.wordsPerHeading > 300 ? [
      `You have ~${contentReadability.wordsPerHeading} words between headings. Aim for ~300.`,
      'Add H2 or H3 subheadings to break up long sections.',
      'Each subheading should describe what the following section covers.',
      'This helps both readers scanning the page and search engines understanding structure.',
    ] : null,
  })

  // No walls of text (3 pts)
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
    fix: hasWalls ? [
      'Your content has large unbroken blocks of text — this hurts readability and bounce rate.',
      'Break long paragraphs into 2-4 sentence chunks.',
      'Add images, bullet lists, or blockquotes between text sections.',
      'Use visual separators like horizontal rules for major topic transitions.',
      'Most readers scan content — make it easy to find key information.',
    ] : null,
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
    fix: !contentReadability.hasIntro ? [
      'Add a clear introductory paragraph (40-150 words) after your H1.',
      'The intro should summarize what the page is about and include your target keyword.',
      'This is often used by Google for featured snippets and meta description fallback.',
      'Structure: [Context/hook] → [What this page covers] → [Why it matters].',
    ] : null,
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
    fix: !urlInfo.isHttps ? [
      'HTTPS is a confirmed Google ranking signal. Your site is on HTTP.',
      'Get an SSL certificate — free options: Let\'s Encrypt, Cloudflare, or your host\'s built-in SSL.',
      'Set up 301 redirects from all HTTP URLs to HTTPS equivalents.',
      'Update your sitemap and internal links to use https:// URLs.',
      'Check Google Search Console for mixed content warnings after migration.',
    ] : null,
  })

  // URL length (3 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'URL length (<75 chars)',
    status: urlInfo.length <= 75 ? 'pass' : urlInfo.length <= 100 ? 'partial' : 'fail',
    points: urlInfo.length <= 75 ? 3 : urlInfo.length <= 100 ? 1.5 : 0,
    maxPoints: 3,
    detail: `${urlInfo.length} characters`,
    fix: urlInfo.length > 75 ? [
      `Your URL is ${urlInfo.length} characters. Keep URLs under 75 characters.`,
      'Remove unnecessary words (the, and, of, a, in, etc.).',
      'Use short, descriptive slugs: /seo-guide/ instead of /the-complete-guide-to-search-engine-optimization/',
      'Avoid deeply nested paths: /blog/post-name/ instead of /blog/2024/03/category/post-name/',
    ] : null,
  })

  // Hyphens not underscores (2 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'URL uses hyphens (not underscores)',
    status: !urlInfo.hasUnderscores ? 'pass' : 'fail',
    points: !urlInfo.hasUnderscores ? 2 : 0,
    maxPoints: 2,
    detail: urlInfo.hasUnderscores
      ? 'URL contains underscores — Google treats hyphens as word separators'
      : 'URL uses hyphens correctly',
    fix: urlInfo.hasUnderscores ? [
      'Replace underscores (_) with hyphens (-) in your URL.',
      'Google treats hyphens as word separators but underscores as word joiners.',
      '"seo-guide" = two words; "seo_guide" = one word to Google.',
      'Set up a 301 redirect from the old URL to the new hyphenated URL.',
    ] : null,
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
    fix: urlInfo.hasParams || urlInfo.hasSpecialChars ? [
      'Remove URL parameters (?key=value) where possible using URL rewriting.',
      'Use clean, semantic URLs: /products/shoes/ instead of /products?category=shoes&sort=price',
      'If parameters are needed, use canonical tags to point to the clean URL.',
      'Configure your server or CMS to generate clean, readable URLs.',
    ] : null,
  })

  // Charset (2 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'Charset declared',
    status: meta.charset ? 'pass' : 'fail',
    points: meta.charset ? 2 : 0,
    maxPoints: 2,
    detail: meta.charset ? `Charset: ${meta.charset}` : 'No charset declared',
    fix: !meta.charset ? [
      'Add a charset declaration in your HTML <head> section.',
      'Add: <meta charset="UTF-8"> as the first element inside <head>.',
      'UTF-8 supports all languages and is the recommended charset.',
    ] : null,
  })

  // Favicon (2 pts)
  checks.push({
    category: 'URL & Technical',
    item: 'Favicon present',
    status: pageData.technical.hasFavicon ? 'pass' : 'fail',
    points: pageData.technical.hasFavicon ? 2 : 0,
    maxPoints: 2,
    detail: pageData.technical.hasFavicon ? 'Favicon found' : 'No favicon — affects brand recognition in tabs',
    fix: !pageData.technical.hasFavicon ? [
      'Add a favicon to your site for brand recognition in browser tabs and bookmarks.',
      'Add to <head>: <link rel="icon" href="/favicon.ico" type="image/x-icon">',
      'Also add: <link rel="icon" href="/favicon.svg" type="image/svg+xml"> for modern browsers.',
      'Generate favicons at realfavicongenerator.net — it creates all necessary sizes.',
    ] : null,
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
    fix: hreflangTags.length === 0 ? [
      'If your site targets multiple languages or regions, add hreflang tags.',
      'Add to <head>: <link rel="alternate" hreflang="en" href="https://example.com/en/">',
      'Add one for each language, plus <link rel="alternate" hreflang="x-default" href="...">',
      'If single-language only, this is optional — the partial score reflects that.',
    ] : null,
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
    fix: robotsMeta.noindex ? [
      'CRITICAL: Your page has a "noindex" directive — it will NOT appear in search results.',
      'Remove or change: <meta name="robots" content="noindex"> to content="index, follow".',
      'Also check your HTTP response headers for X-Robots-Tag: noindex.',
      'This may have been set intentionally (staging, preview pages) — verify before changing.',
    ] : null,
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
    fix: !social.og.image ? [
      'Add an Open Graph image for social media sharing previews.',
      'Add to <head>: <meta property="og:image" content="https://yoursite.com/image.jpg">',
      'Recommended size: 1200x630 pixels (1.91:1 ratio) for best display on Facebook/LinkedIn.',
      'Use a visually compelling image with readable text overlay if appropriate.',
    ] : null,
  })

  // OG type (3 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Open Graph type',
    status: social.og.type ? 'pass' : 'fail',
    points: social.og.type ? 3 : 0,
    maxPoints: 3,
    detail: social.og.type ? `og:type="${social.og.type}"` : 'No og:type defined',
    fix: !social.og.type ? [
      'Add an Open Graph type to help platforms categorize your content.',
      'Add to <head>: <meta property="og:type" content="website"> (or "article" for blog posts).',
      'Common values: "website", "article", "product", "video.other".',
    ] : null,
  })

  // Twitter card (3 pts)
  checks.push({
    category: 'Social & Sharing',
    item: 'Twitter card meta',
    status: social.twitter.card ? 'pass' : 'fail',
    points: social.twitter.card ? 3 : 0,
    maxPoints: 3,
    detail: social.twitter.card ? `twitter:card="${social.twitter.card}"` : 'No twitter:card — tweets sharing this URL will lack rich preview',
    fix: !social.twitter.card ? [
      'Add Twitter Card meta tags for rich previews when shared on X (Twitter).',
      'Add to <head>: <meta name="twitter:card" content="summary_large_image">',
      'Options: "summary" (small thumbnail), "summary_large_image" (large image preview).',
      'Test your card at cards-dev.twitter.com/validator',
    ] : null,
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
    fix: !social.twitter.image ? [
      'Add a dedicated Twitter image for best results on X.',
      'Add to <head>: <meta name="twitter:image" content="https://yoursite.com/twitter-image.jpg">',
      social.og.image ? 'You have an OG image that Twitter can use as fallback, but a dedicated image is better.' : 'Without any social image, shared links will look plain and get fewer clicks.',
      'Recommended size: 1200x600 pixels for summary_large_image cards.',
    ] : null,
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
    fix: !social.socialTitleDiffers ? [
      'Create a unique og:title that\'s optimized for social media sharing.',
      'Social titles can be more conversational or attention-grabbing than SEO titles.',
      'SEO title: "Coffee Beans Guide 2024 | BrandName" → OG title: "The Only Coffee Beans Guide You\'ll Need"',
      'Add: <meta property="og:title" content="Your social-optimized title here">',
    ] : null,
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
    fix: !social.og.description ? [
      'Add an Open Graph description for social sharing previews.',
      'Add: <meta property="og:description" content="A compelling summary for social media">',
      'Keep it under 200 characters — social platforms truncate longer descriptions.',
      'Make it enticing and actionable to encourage clicks from social feeds.',
    ] : null,
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
    fix: !social.hasAppleTouchIcon ? [
      'Add an Apple touch icon for iOS home screen bookmarks.',
      'Add to <head>: <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
      'Create a 180x180px PNG image of your logo/icon.',
      'This also appears in Safari Reading List and other Apple interfaces.',
    ] : null,
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
      fix: [
        'Consider adding relevant images to improve user engagement.',
        'Pages with images get 94% more views than text-only pages.',
        'Add informative images, infographics, or screenshots that support your content.',
        'Always include descriptive alt text for accessibility and SEO.',
      ],
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
      fix: imageOpt.lazyLoadPct < 70 ? [
        `Only ${imageOpt.lazyLoadPct}% of images use lazy loading. Aim for 70%+.`,
        'Add loading="lazy" to images below the fold (not visible on initial page load).',
        'Example: <img src="photo.jpg" loading="lazy" alt="Description">',
        'Don\'t lazy-load the hero/first image — it should load immediately.',
        'This significantly improves page load speed and Core Web Vitals.',
      ] : null,
    })

    // Dimensions specified (3 pts)
    checks.push({
      category: 'Image Optimization',
      item: 'Dimensions specified',
      status: imageOpt.dimensionsPct >= 80 ? 'pass' : imageOpt.dimensionsPct >= 40 ? 'partial' : 'fail',
      points: imageOpt.dimensionsPct >= 80 ? 3 : imageOpt.dimensionsPct >= 40 ? 1.5 : 0,
      maxPoints: 3,
      detail: `${imageOpt.withDimensions}/${imageOpt.total} images have width/height (${imageOpt.dimensionsPct}%)`,
      fix: imageOpt.dimensionsPct < 80 ? [
        `${imageOpt.total - imageOpt.withDimensions} images are missing width/height attributes.`,
        'Add width and height to every <img> tag to prevent layout shifts (CLS).',
        'Example: <img src="photo.jpg" width="800" height="600" alt="Description">',
        'CSS can still override these for responsive sizing, but the attributes reserve space.',
      ] : null,
    })

    // Modern formats (3 pts)
    checks.push({
      category: 'Image Optimization',
      item: 'Modern image formats (WebP/AVIF)',
      status: imageOpt.modernFormatPct >= 50 ? 'pass' : imageOpt.modernFormatPct > 0 ? 'partial' : 'fail',
      points: imageOpt.modernFormatPct >= 50 ? 3 : imageOpt.modernFormatPct > 0 ? 1.5 : 0,
      maxPoints: 3,
      detail: `${imageOpt.modernFormats}/${imageOpt.total} images use WebP/AVIF (${imageOpt.modernFormatPct}%)`,
      fix: imageOpt.modernFormatPct < 50 ? [
        `Only ${imageOpt.modernFormatPct}% of images use modern formats. Convert to WebP or AVIF.`,
        'WebP is 25-35% smaller than JPEG at same quality. AVIF is even smaller.',
        'Use <picture> tags for fallback: <picture><source srcset="img.webp" type="image/webp"><img src="img.jpg"></picture>',
        'Tools: squoosh.app (manual), sharp/imagemin (build pipeline), or CDN auto-conversion.',
      ] : null,
    })

    // Descriptive file names (3 pts)
    checks.push({
      category: 'Image Optimization',
      item: 'Descriptive file names',
      status: imageOpt.descriptiveNamePct >= 70 ? 'pass' : imageOpt.descriptiveNamePct >= 40 ? 'partial' : 'fail',
      points: imageOpt.descriptiveNamePct >= 70 ? 3 : imageOpt.descriptiveNamePct >= 40 ? 1.5 : 0,
      maxPoints: 3,
      detail: `${imageOpt.descriptiveNames}/${imageOpt.total} images have descriptive filenames (${imageOpt.descriptiveNamePct}%)`,
      fix: imageOpt.descriptiveNamePct < 70 ? [
        'Rename images with descriptive, keyword-rich file names.',
        'Bad: IMG_2847.jpg, photo1.png, screenshot.jpg',
        'Good: organic-coffee-beans-bag.jpg, seo-audit-results-chart.png',
        'Use hyphens between words and keep names concise but descriptive.',
      ] : null,
    })

    // General image optimization (2 pts)
    checks.push({
      category: 'Image Optimization',
      item: 'Image optimization (general)',
      status: imageOpt.lazyLoadPct >= 50 && imageOpt.dimensionsPct >= 50 ? 'pass' : 'partial',
      points: imageOpt.lazyLoadPct >= 50 && imageOpt.dimensionsPct >= 50 ? 2 : 1,
      maxPoints: 2,
      detail: 'Overall image optimization assessment based on lazy loading and dimension hints',
      fix: !(imageOpt.lazyLoadPct >= 50 && imageOpt.dimensionsPct >= 50) ? [
        'Improve overall image optimization for better page performance.',
        'Compress images before uploading — aim for under 200KB per image.',
        'Use responsive images with srcset for different screen sizes.',
        'Consider using a CDN with automatic image optimization (Cloudflare, imgix, etc.).',
      ] : null,
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
