import { useState, useCallback } from 'react'
import { fetchPageHtml, parsePageData } from '../../utils/htmlCrawler'
import { checkRobotsTxt } from '../../utils/robotsChecker'
import { checkSitemap } from '../../utils/sitemapChecker'
import { scorePage } from '../../utils/deterministicScorer'
import { scoreSeo } from '../../utils/seoScorer'
import { useActivityWithWebhooks } from '../../hooks/useActivityWithWebhooks'

/**
 * Fetch server-side data: response time, headers, redirects, compression.
 * Uses a timed fetch to capture what's available (CORS may limit some headers).
 */
async function fetchServerData(url) {
  const defaults = {
    responseTime: null, status: null, redirected: false, finalUrl: url,
    server: null, contentEncoding: null, cacheControl: null,
    xPoweredBy: null, contentType: null, hsts: null, xFrameOptions: null,
  }
  try {
    const start = performance.now()
    const res = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    })
    const responseTime = Math.round(performance.now() - start)
    return {
      responseTime,
      status: res.status,
      redirected: res.redirected,
      finalUrl: res.url || url,
      server: res.headers.get('server'),
      contentEncoding: res.headers.get('content-encoding'),
      cacheControl: res.headers.get('cache-control'),
      xPoweredBy: res.headers.get('x-powered-by'),
      contentType: res.headers.get('content-type'),
      hsts: res.headers.get('strict-transport-security'),
      xFrameOptions: res.headers.get('x-frame-options'),
    }
  } catch {
    // CORS or network issue — try via CORS proxy for basic timing
    try {
      const start = performance.now()
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      const res = await fetch(proxy, { method: 'HEAD', signal: AbortSignal.timeout(10000) })
      return { ...defaults, responseTime: Math.round(performance.now() - start), status: res.status }
    } catch {
      return defaults
    }
  }
}

export function useSeoAnalyzer({ activeProject, updateProject, user }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })

  // Read persisted data
  const seoData = activeProject?.seo || {}
  const scans = seoData.scans || {}
  const auditHistory = seoData.auditHistory || []

  const scanUrl = useCallback(async (inputUrl) => {
    if (!inputUrl || scanning) return null
    setScanning(true)
    setError(null)

    let url = inputUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url

    try {
      // 0. Capture server response data (timing, headers, redirects)
      const serverData = await fetchServerData(url)

      // 1. Fetch HTML
      const html = await fetchPageHtml(url)

      // 2. Parse page data (reuse existing utility)
      const pageData = parsePageData(html, url)

      // 3. Check robots.txt + sitemap (in parallel)
      const [robotsData, sitemapData] = await Promise.all([
        checkRobotsTxt(url).catch(() => null),
        checkSitemap(url).catch(() => null),
      ])

      // 4. Run SEO-specific scoring (new)
      const seoScore = scoreSeo(pageData, robotsData, sitemapData, url, html)

      // 5. Run AEO scoring (existing — for cross-reference display)
      const aeoScore = scorePage(pageData, robotsData, sitemapData)

      // 6. Build scan result (don't persist raw HTML — too large)
      const scanResult = {
        url,
        seoScore,
        aeoScore,
        pageData,
        robotsData,
        sitemapData,
        serverData,
        timestamp: new Date().toISOString(),
      }

      // 7. Persist to project
      const updatedScans = { ...scans, [url]: scanResult }
      const historyEntry = {
        url,
        overall: seoScore.overallScore,
        aeoOverall: aeoScore.overallScore,
        categories: Object.fromEntries(
          Object.entries(seoScore.categories).map(([k, v]) => [k, Math.round((v.score / v.maxScore) * 100)])
        ),
        issueCount: seoScore.checks.filter(c => c.status === 'fail').length,
        passCount: seoScore.checks.filter(c => c.status === 'pass').length,
        timestamp: scanResult.timestamp,
      }
      const updatedHistory = [...auditHistory, historyEntry].slice(-50) // Keep last 50

      if (activeProject?.id) {
        await updateProject(activeProject.id, {
          seo: {
            ...seoData,
            scans: updatedScans,
            auditHistory: updatedHistory,
            lastScanUrl: url,
          },
        })
      }

      // 8. Log activity
      logAndDispatch('system', {
        message: `SEO audit completed for ${url} — Score: ${seoScore.overallScore}/100`,
      })

      setScanning(false)
      return scanResult
    } catch (err) {
      setError(err.message || 'Failed to scan URL')
      setScanning(false)
      return null
    }
  }, [scanning, scans, auditHistory, seoData, activeProject, updateProject, logAndDispatch])

  const clearScan = useCallback((url) => {
    if (!activeProject?.id) return
    const updated = { ...scans }
    delete updated[url]
    updateProject(activeProject.id, {
      seo: { ...seoData, scans: updated },
    })
  }, [scans, seoData, activeProject, updateProject])

  const lastScan = seoData.lastScanUrl ? scans[seoData.lastScanUrl] : null

  return {
    scanning,
    error,
    scans,
    auditHistory,
    lastScan,
    lastScanUrl: seoData.lastScanUrl,
    scanUrl,
    clearScan,
  }
}
