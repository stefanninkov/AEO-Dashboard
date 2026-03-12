import { useState, useCallback, useEffect, useRef } from 'react'
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

/** Run a full scan for a single URL (internal helper) */
async function runSingleScan(url) {
  const serverData = await fetchServerData(url)
  const html = await fetchPageHtml(url)
  const pageData = parsePageData(html, url)
  const [robotsData, sitemapData] = await Promise.all([
    checkRobotsTxt(url).catch(() => null),
    checkSitemap(url).catch(() => null),
  ])
  const seoScore = scoreSeo(pageData, robotsData, sitemapData, url, html)
  const aeoScore = scorePage(pageData, robotsData, sitemapData)
  return { url, seoScore, aeoScore, pageData, robotsData, sitemapData, serverData, timestamp: new Date().toISOString() }
}

export function useSeoAnalyzer({ activeProject, updateProject, user }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const [bulkProgress, setBulkProgress] = useState(null) // { current, total, results: [] }
  const [recheckingId, setRecheckingId] = useState(null) // which check is being rechecked
  const autoScanRan = useRef(false)
  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })

  // Read persisted data
  const seoData = activeProject?.seo || {}
  const scans = seoData.scans || {}
  const auditHistory = seoData.auditHistory || []
  const competitorScans = seoData.competitorScans || {}

  // Keep refs to latest derived data so async callbacks never capture stale values
  const seoDataRef = useRef(seoData)
  const scansRef = useRef(scans)
  const auditHistoryRef = useRef(auditHistory)
  const competitorScansRef = useRef(competitorScans)
  seoDataRef.current = seoData
  scansRef.current = scans
  auditHistoryRef.current = auditHistory
  competitorScansRef.current = competitorScans

  const scanUrl = useCallback(async (inputUrl) => {
    if (!inputUrl || scanning) return null
    setScanning(true)
    setError(null)

    let url = inputUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url

    try {
      const scanResult = await runSingleScan(url)

      // Persist to project — read latest from refs to avoid stale closure
      const currentScans = scansRef.current
      const currentHistory = auditHistoryRef.current
      const currentSeoData = seoDataRef.current
      const updatedScans = { ...currentScans, [url]: scanResult }
      const historyEntry = {
        url,
        overall: scanResult.seoScore.overallScore,
        aeoOverall: scanResult.aeoScore.overallScore,
        categories: Object.fromEntries(
          Object.entries(scanResult.seoScore.categories).map(([k, v]) => [k, Math.round((v.score / v.maxScore) * 100)])
        ),
        issueCount: scanResult.seoScore.checks.filter(c => c.status === 'fail').length,
        passCount: scanResult.seoScore.checks.filter(c => c.status === 'pass').length,
        timestamp: scanResult.timestamp,
      }
      const updatedHistory = [...currentHistory, historyEntry].slice(-50)

      if (activeProject?.id) {
        await updateProject(activeProject.id, {
          seo: {
            ...currentSeoData,
            scans: updatedScans,
            auditHistory: updatedHistory,
            lastScanUrl: url,
          },
        })
      }

      logAndDispatch('system', {
        message: `SEO audit completed for ${url} — Score: ${scanResult.seoScore.overallScore}/100`,
      })

      setScanning(false)
      return scanResult
    } catch (err) {
      setError(err.message || 'Failed to scan URL')
      setScanning(false)
      return null
    }
  }, [scanning, activeProject, updateProject, logAndDispatch])

  // ── Bulk URL Scanning ──
  const scanBulk = useCallback(async (urls) => {
    if (scanning || !urls?.length) return null
    const cleaned = urls.map(u => {
      const s = u.trim()
      return s.startsWith('http') ? s : 'https://' + s
    }).filter(Boolean).slice(0, 10)

    if (cleaned.length === 0) return null
    setScanning(true)
    setError(null)
    setBulkProgress({ current: 0, total: cleaned.length, results: [] })

    const results = []
    let updatedScans = { ...scansRef.current }

    for (let i = 0; i < cleaned.length; i++) {
      setBulkProgress(prev => ({ ...prev, current: i + 1 }))
      try {
        const scanResult = await runSingleScan(cleaned[i])
        updatedScans[cleaned[i]] = scanResult
        results.push({ url: cleaned[i], seoScore: scanResult.seoScore.overallScore, aeoScore: scanResult.aeoScore.overallScore, topIssue: scanResult.seoScore.checks.find(c => c.status === 'fail')?.item || 'None', success: true })
      } catch (err) {
        results.push({ url: cleaned[i], error: err.message, success: false })
      }
      setBulkProgress(prev => ({ ...prev, results: [...results] }))
    }

    // Persist all scans
    if (activeProject?.id) {
      await updateProject(activeProject.id, {
        seo: { ...seoDataRef.current, scans: updatedScans },
      })
    }

    logAndDispatch('system', { message: `Bulk SEO audit completed for ${results.filter(r => r.success).length}/${cleaned.length} URLs` })

    setScanning(false)
    setBulkProgress(prev => ({ ...prev, current: prev.total }))
    return results
  }, [scanning, activeProject, updateProject, logAndDispatch])

  // ── Fix Re-check (re-scan URL, return updated results) ──
  const recheckUrl = useCallback(async (url) => {
    if (!url || recheckingId) return null
    setRecheckingId(url)
    try {
      const scanResult = await runSingleScan(url)
      const updatedScans = { ...scansRef.current, [url]: scanResult }
      if (activeProject?.id) {
        await updateProject(activeProject.id, {
          seo: { ...seoDataRef.current, scans: updatedScans, lastScanUrl: url },
        })
      }
      setRecheckingId(null)
      return scanResult
    } catch {
      setRecheckingId(null)
      return null
    }
  }, [recheckingId, activeProject, updateProject])

  // ── Competitor Scan ──
  const scanCompetitor = useCallback(async (inputUrl) => {
    if (!inputUrl || scanning) return null
    setScanning(true)
    setError(null)

    let url = inputUrl.trim()
    if (!url.startsWith('http')) url = 'https://' + url

    try {
      const scanResult = await runSingleScan(url)
      const updatedCompScans = { ...competitorScansRef.current, [url]: scanResult }
      // Keep last 5 competitor scans
      const keys = Object.keys(updatedCompScans)
      if (keys.length > 5) {
        delete updatedCompScans[keys[0]]
      }

      if (activeProject?.id) {
        await updateProject(activeProject.id, {
          seo: { ...seoDataRef.current, competitorScans: updatedCompScans },
        })
      }

      logAndDispatch('system', { message: `Competitor SEO scan completed for ${url} — Score: ${scanResult.seoScore.overallScore}/100` })

      setScanning(false)
      return scanResult
    } catch (err) {
      setError(err.message || 'Failed to scan competitor URL')
      setScanning(false)
      return null
    }
  }, [scanning, activeProject, updateProject, logAndDispatch])

  // ── Sitemap Scan ──
  const scanSitemap = useCallback(async (sitemapUrl) => {
    if (scanning || !sitemapUrl) return null
    setScanning(true)
    setError(null)

    try {
      // Fetch and parse sitemap
      const sitemapData = await checkSitemap(sitemapUrl)
      const urls = (sitemapData?.urls || []).slice(0, 20) // Max 20
      if (urls.length === 0) throw new Error('No URLs found in sitemap')

      setBulkProgress({ current: 0, total: urls.length, results: [] })
      const results = []
      let totalSeo = 0, totalAeo = 0

      for (let i = 0; i < urls.length; i++) {
        setBulkProgress(prev => ({ ...prev, current: i + 1 }))
        try {
          const scanResult = await runSingleScan(urls[i])
          totalSeo += scanResult.seoScore.overallScore
          totalAeo += scanResult.aeoScore.overallScore
          results.push({ url: urls[i], seoScore: scanResult.seoScore.overallScore, aeoScore: scanResult.aeoScore.overallScore, topIssue: scanResult.seoScore.checks.find(c => c.status === 'fail')?.item || 'None', success: true })
        } catch (err) {
          results.push({ url: urls[i], error: err.message, success: false })
        }
        setBulkProgress(prev => ({ ...prev, results: [...results] }))
      }

      const successful = results.filter(r => r.success)
      const sitemapAudit = {
        timestamp: new Date().toISOString(),
        totalPages: urls.length,
        scannedPages: successful.length,
        avgSeoScore: successful.length > 0 ? Math.round(totalSeo / successful.length) : 0,
        avgAeoScore: successful.length > 0 ? Math.round(totalAeo / successful.length) : 0,
        worst: [...successful].sort((a, b) => a.seoScore - b.seoScore).slice(0, 5),
        best: [...successful].sort((a, b) => b.seoScore - a.seoScore).slice(0, 5),
        results,
      }

      if (activeProject?.id) {
        await updateProject(activeProject.id, {
          seo: { ...seoDataRef.current, sitemapAudit },
        })
      }

      logAndDispatch('system', { message: `Sitemap audit completed: ${successful.length}/${urls.length} pages, avg score ${sitemapAudit.avgSeoScore}/100` })

      setScanning(false)
      return sitemapAudit
    } catch (err) {
      setError(err.message || 'Failed to scan sitemap')
      setScanning(false)
      setBulkProgress(null)
      return null
    }
  }, [scanning, activeProject, updateProject, logAndDispatch])

  // ── Auto-scan (scheduled re-scans) ──
  useEffect(() => {
    if (autoScanRan.current) return
    if (!seoData.autoScanEnabled || !seoData.lastScanUrl) return
    const interval = seoData.autoScanInterval || '7d'
    const ms = interval === '1d' ? 86400000 : interval === '3d' ? 259200000 : 604800000
    const lastTs = auditHistory.length > 0 ? new Date(auditHistory[auditHistory.length - 1].timestamp).getTime() : 0
    if (Date.now() - lastTs >= ms) {
      autoScanRan.current = true
      // Auto-trigger scan (don't await, fire and forget)
      scanUrl(seoData.lastScanUrl)
    }
  }, [seoData.autoScanEnabled, seoData.autoScanInterval, seoData.lastScanUrl, auditHistory, scanUrl])

  const setAutoScan = useCallback((enabled, interval) => {
    if (!activeProject?.id) return
    const current = seoDataRef.current
    updateProject(activeProject.id, {
      seo: { ...current, autoScanEnabled: enabled, autoScanInterval: interval || current.autoScanInterval || '7d' },
    })
  }, [activeProject, updateProject])

  const clearScan = useCallback((url) => {
    if (!activeProject?.id) return
    const updated = { ...scansRef.current }
    delete updated[url]
    updateProject(activeProject.id, {
      seo: { ...seoDataRef.current, scans: updated },
    })
  }, [activeProject, updateProject])

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
    // Phase 3 additions
    scanBulk,
    bulkProgress,
    recheckUrl,
    recheckingId,
    scanCompetitor,
    competitorScans,
    scanSitemap,
    sitemapAudit: seoData.sitemapAudit || null,
    // Phase 4: auto-scan
    autoScanEnabled: seoData.autoScanEnabled || false,
    autoScanInterval: seoData.autoScanInterval || '7d',
    setAutoScan,
  }
}
