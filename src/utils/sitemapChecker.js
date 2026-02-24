// src/utils/sitemapChecker.js

/**
 * Fetches and analyzes sitemap.xml for AEO signals.
 * Checks: existence, page count, lastmod freshness, structure.
 */

export async function checkSitemap(url) {
  const base = new URL(url.startsWith('http') ? url : 'https://' + url)
  const sitemapUrls = [
    `${base.protocol}//${base.hostname}/sitemap.xml`,
    `${base.protocol}//${base.hostname}/sitemap_index.xml`,
  ]

  for (const sitemapUrl of sitemapUrls) {
    try {
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(sitemapUrl)}`, {
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      const text = await res.text()
      if (!text.includes('<urlset') && !text.includes('<sitemapindex')) continue

      return parseSitemap(text, sitemapUrl)
    } catch { /* try next */ }
  }

  return { found: false, pageCount: 0, urls: [], hasLastmod: false, freshness: null }
}

function parseSitemap(xml, sitemapUrl) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')

  // Check if it's a sitemap index
  const sitemapEntries = doc.querySelectorAll('sitemap > loc')
  if (sitemapEntries.length > 0) {
    return {
      found: true,
      type: 'index',
      url: sitemapUrl,
      childSitemaps: Array.from(sitemapEntries).map(el => el.textContent.trim()),
      pageCount: null, // Would need to fetch child sitemaps
    }
  }

  // Regular sitemap
  const urlEntries = doc.querySelectorAll('url')
  const urls = Array.from(urlEntries).map(el => {
    const loc = el.querySelector('loc')?.textContent?.trim()
    const lastmod = el.querySelector('lastmod')?.textContent?.trim()
    const changefreq = el.querySelector('changefreq')?.textContent?.trim()
    const priority = el.querySelector('priority')?.textContent?.trim()
    return { loc, lastmod, changefreq, priority }
  })

  const withLastmod = urls.filter(u => u.lastmod)
  const lastmodDates = withLastmod.map(u => new Date(u.lastmod)).filter(d => !isNaN(d))
  const now = Date.now()

  // Freshness analysis
  let freshPages = 0, stalePages = 0, ancientPages = 0
  lastmodDates.forEach(d => {
    const daysOld = (now - d.getTime()) / (1000 * 60 * 60 * 24)
    if (daysOld <= 30) freshPages++
    else if (daysOld <= 180) stalePages++
    else ancientPages++
  })

  return {
    found: true,
    type: 'urlset',
    url: sitemapUrl,
    pageCount: urls.length,
    hasLastmod: withLastmod.length > 0,
    lastmodCoverage: urls.length > 0 ? Math.round((withLastmod.length / urls.length) * 100) : 0,
    freshness: {
      fresh: freshPages,
      stale: stalePages,
      ancient: ancientPages,
      newestDate: lastmodDates.length > 0 ? new Date(Math.max(...lastmodDates.map(d => d.getTime()))).toISOString() : null,
      oldestDate: lastmodDates.length > 0 ? new Date(Math.min(...lastmodDates.map(d => d.getTime()))).toISOString() : null,
    },
    urls: urls.slice(0, 500), // Cap at 500 for performance
  }
}
