/**
 * usePageAnalyzer — Hook for managing page-level AEO analysis.
 *
 * Handles:
 *   - Adding and analyzing individual page URLs
 *   - Batch analyzing multiple pages
 *   - Re-analyzing existing pages
 *   - Removing pages from the analysis set
 *   - Importing page URLs from GSC data
 *   - Activity logging for each analysis
 */

import { useState, useCallback, useMemo } from 'react'
import { callAnthropicApi } from '../../utils/apiClient'
import { getAnalyzerIndustryContext } from '../../utils/getRecommendations'
import { parseAnalysisJSON, parseFixJSON, computeCategoryScore } from './AnalysisResultsShared'
import { createActivity, appendActivity } from '../../utils/activityLogger'
import logger from '../../utils/logger'

/* ── URL normalization ── */
export function normalizePageUrl(raw) {
  try {
    let url = raw.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    const parsed = new URL(url)
    // Force lowercase hostname, strip trailing slash, prefer https
    let normalized = `https://${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/+$/, '')}${parsed.search}`
    // If path is empty, add /
    if (!parsed.pathname || parsed.pathname === '/') {
      normalized = `https://${parsed.hostname.toLowerCase()}${parsed.search}`
    }
    return normalized
  } catch {
    return raw.trim()
  }
}

/* ── Short URL for display ── */
export function shortPageUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.pathname === '/' || !parsed.pathname
      ? parsed.hostname
      : parsed.pathname
  } catch {
    return url
  }
}

/* ── Build analysis prompt for a single page ── */
function buildPageAnalysisPrompt(pageUrl, questionnaire) {
  const industryContext = getAnalyzerIndustryContext(questionnaire)
  return `Analyze this specific page for AEO readiness: ${pageUrl}${industryContext}

IMPORTANT: Focus ONLY on this specific page, not the whole website. Search for and visit this exact URL, then evaluate the PAGE against these AEO criteria. For each item give status: "pass", "fail", or "partial" with brief explanation specific to this page.

Return ONLY valid JSON:
{
  "url": "${pageUrl}",
  "overallScore": 0-100,
  "source": "url",
  "categories": [
    { "name": "Schema Markup", "items": [
      { "name": "FAQPage schema", "status": "pass|fail|partial", "note": "..." },
      { "name": "Article schema", "status": "...", "note": "..." },
      { "name": "Organization schema", "status": "...", "note": "..." },
      { "name": "BreadcrumbList schema", "status": "...", "note": "..." }
    ]},
    { "name": "Content Structure", "items": [
      { "name": "Question-based headings", "status": "...", "note": "..." },
      { "name": "Direct answer paragraphs", "status": "...", "note": "..." },
      { "name": "Summary/TL;DR section", "status": "...", "note": "..." },
      { "name": "FAQ section present", "status": "...", "note": "..." },
      { "name": "Definition-style formatting", "status": "...", "note": "..." }
    ]},
    { "name": "Technical SEO", "items": [
      { "name": "HTTPS enabled", "status": "...", "note": "..." },
      { "name": "Meta description optimized", "status": "...", "note": "..." },
      { "name": "Open Graph tags", "status": "...", "note": "..." },
      { "name": "Semantic HTML", "status": "...", "note": "..." },
      { "name": "Mobile responsive", "status": "...", "note": "..." }
    ]},
    { "name": "Authority Signals", "items": [
      { "name": "Author information", "status": "...", "note": "..." },
      { "name": "Last updated date", "status": "...", "note": "..." },
      { "name": "External citations", "status": "...", "note": "..." },
      { "name": "Internal linking", "status": "...", "note": "..." }
    ]}
  ],
  "topPriorities": ["top 5 things to fix on THIS page"],
  "summary": "2-3 sentence assessment of THIS page"
}`
}

/* ══════════════════════════════════════════════════════════════════
   HOOK
   ══════════════════════════════════════════════════════════════════ */

export function usePageAnalyzer({ activeProject, updateProject, user }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const [selectedPageUrl, setSelectedPageUrl] = useState(null)

  const apiKey = useMemo(() => localStorage.getItem('anthropic-api-key') || '', [])
  const pageAnalyses = activeProject?.pageAnalyses || {}
  const pageAnalyzerFixes = activeProject?.pageAnalyzerFixes || {}

  // Sorted pages list
  const pages = useMemo(() => {
    return Object.entries(pageAnalyses)
      .map(([key, data]) => ({
        key,
        url: data.url || key,
        overallScore: data.overallScore ?? 0,
        categories: data.categories || [],
        topPriorities: data.topPriorities || [],
        summary: data.summary || '',
        analyzedAt: data.analyzedAt || null,
        label: data.label || '',
        // Compute per-category scores
        schemaScore: computeCategoryScore(data.categories?.find(c => c.name === 'Schema Markup')?.items),
        contentScore: computeCategoryScore(data.categories?.find(c => c.name === 'Content Structure')?.items),
        technicalScore: computeCategoryScore(data.categories?.find(c => c.name === 'Technical SEO')?.items),
        authorityScore: computeCategoryScore(data.categories?.find(c => c.name === 'Authority Signals')?.items),
      }))
      .sort((a, b) => (b.analyzedAt || '').localeCompare(a.analyzedAt || ''))
  }, [pageAnalyses])

  // Stats
  const stats = useMemo(() => {
    if (pages.length === 0) return { count: 0, avgScore: 0, lowestScore: 0, lowestUrl: '', needsWork: 0 }
    const scores = pages.map(p => p.overallScore)
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const min = Math.min(...scores)
    const minPage = pages.find(p => p.overallScore === min)
    return {
      count: pages.length,
      avgScore: avg,
      lowestScore: min,
      lowestUrl: minPage?.url || '',
      needsWork: pages.filter(p => p.overallScore < 50).length,
    }
  }, [pages])

  // ── Analyze a single page ──
  const analyzePage = useCallback(async (rawUrl, label) => {
    const url = normalizePageUrl(rawUrl)
    if (!url) return
    if (!apiKey) {
      setError('Please enter your Anthropic API key in the Site Analysis tab.')
      return
    }

    setAnalyzing(true)
    setError(null)

    try {
      const data = await callAnthropicApi({
        apiKey,
        messages: [{
          role: 'user',
          content: buildPageAnalysisPrompt(url, activeProject?.questionnaire),
        }],
        extraBody: {
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        },
      })

      if (data.error) throw new Error(data.error.message)

      const textContent = data.content
        ?.filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n') || ''

      const parsed = parseAnalysisJSON(textContent)
      if (parsed) {
        const result = {
          ...parsed,
          url,
          analyzedAt: new Date().toISOString(),
          label: label || '',
        }

        const newPageAnalyses = { ...pageAnalyses, [url]: result }
        updateProject(activeProject.id, { pageAnalyses: newPageAnalyses })

        // Log activity
        const entry = createActivity('analyzePageUrl', {
          url,
          score: parsed.overallScore,
          label: label || shortPageUrl(url),
        }, user)
        updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, entry) })

        return result
      } else {
        setError('Could not parse analysis results. The AI may not have been able to access the page.')
        return null
      }
    } catch (err) {
      logger.error('Page analysis error:', err)
      setError(err.message)
      return null
    } finally {
      setAnalyzing(false)
    }
  }, [apiKey, activeProject, pageAnalyses, updateProject, user])

  // ── Batch analyze multiple pages ──
  const analyzePages = useCallback(async (urls) => {
    if (!apiKey) {
      setError('Please enter your Anthropic API key in the Site Analysis tab.')
      return
    }

    const normalized = urls.map(u => normalizePageUrl(u)).filter(Boolean)
    setProgress({ current: 0, total: normalized.length })
    setAnalyzing(true)
    setError(null)

    let updated = { ...pageAnalyses }

    for (let i = 0; i < normalized.length; i++) {
      const url = normalized[i]
      try {
        const data = await callAnthropicApi({
          apiKey,
          messages: [{
            role: 'user',
            content: buildPageAnalysisPrompt(url, activeProject?.questionnaire),
          }],
          extraBody: {
            tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          },
        })

        if (!data.error) {
          const textContent = data.content
            ?.filter(item => item.type === 'text')
            .map(item => item.text)
            .join('\n') || ''

          const parsed = parseAnalysisJSON(textContent)
          if (parsed) {
            updated[url] = {
              ...parsed,
              url,
              analyzedAt: new Date().toISOString(),
              label: '',
            }
          }
        }
      } catch (err) {
        logger.error(`Page analysis error for ${url}:`, err)
      }

      setProgress({ current: i + 1, total: normalized.length })

      // Delay between requests
      if (i < normalized.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    updateProject(activeProject.id, { pageAnalyses: updated })

    // Log batch activity
    const entry = createActivity('analyzePageBatch', {
      count: normalized.length,
      avgScore: Object.values(updated).length > 0
        ? Math.round(Object.values(updated).reduce((s, p) => s + (p.overallScore || 0), 0) / Object.values(updated).length)
        : 0,
    }, user)
    updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, entry) })

    setAnalyzing(false)
    setProgress({ current: 0, total: 0 })
  }, [apiKey, activeProject, pageAnalyses, updateProject, user])

  // ── Re-analyze existing page ──
  const reanalyzePage = useCallback(async (url) => {
    return analyzePage(url, pageAnalyses[url]?.label)
  }, [analyzePage, pageAnalyses])

  // ── Remove page ──
  const removePage = useCallback((url) => {
    const updated = { ...pageAnalyses }
    delete updated[url]

    // Also remove fixes for this page
    const updatedFixes = { ...pageAnalyzerFixes }
    for (const key of Object.keys(updatedFixes)) {
      if (key.startsWith(url + '::')) {
        delete updatedFixes[key]
      }
    }

    updateProject(activeProject.id, {
      pageAnalyses: updated,
      pageAnalyzerFixes: updatedFixes,
    })
  }, [activeProject, pageAnalyses, pageAnalyzerFixes, updateProject])

  // ── Import top pages from GSC data ──
  const importFromGsc = useCallback((pageData) => {
    if (!pageData?.rows) return []
    // Get top pages by clicks, limit to 20
    const topPages = pageData.rows
      .filter(r => r.page)
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 20)
      .map(r => normalizePageUrl(r.page))
      .filter(url => url && !pageAnalyses[url])

    return topPages
  }, [pageAnalyses])

  // ── Handle fix for a page-level item ──
  const handlePageFixGenerated = useCallback((pageUrl, fixData) => {
    const fixKey = `${pageUrl}::${fixData.itemId}`
    const newFixes = { ...pageAnalyzerFixes, [fixKey]: fixData }
    updateProject(activeProject.id, { pageAnalyzerFixes: newFixes })

    // Log activity
    const entry = createActivity('generatePageFix', {
      pageUrl: shortPageUrl(pageUrl),
      itemName: fixData.itemId,
      priority: fixData.priority,
    }, user)
    updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, entry) })
  }, [activeProject, pageAnalyzerFixes, updateProject, user])

  // ── Get fixes for a specific page ──
  const getPageFixes = useCallback((pageUrl) => {
    const fixes = {}
    for (const [key, value] of Object.entries(pageAnalyzerFixes)) {
      if (key.startsWith(pageUrl + '::')) {
        // Strip the URL prefix to get "Category::Item" format
        const itemId = key.substring(pageUrl.length + 2)
        fixes[itemId] = value
      }
    }
    return fixes
  }, [pageAnalyzerFixes])

  // ── Bulk fix handler for a page ──
  const handlePageBulkFix = useCallback(async (pageUrl, items, onProgress) => {
    for (let i = 0; i < items.length; i++) {
      const { item, categoryName } = items[i]
      try {
        const data = await callAnthropicApi({
          apiKey,
          maxTokens: 4000,
          system: `You are an AEO (Answer Engine Optimization) expert. Generate practical, ready-to-use fixes for website issues. Always provide:
1. A brief explanation of WHY this matters for AEO
2. The exact code or content to implement
3. Clear implementation steps
4. Priority level (critical/high/medium/low)

Format your response as JSON:
{
  "explanation": "Why this matters for AEO (1-2 sentences)",
  "priority": "critical|high|medium|low",
  "codeBlocks": [
    {
      "language": "html|json|javascript|css|text",
      "label": "Short description of this code block",
      "code": "The actual code to implement"
    }
  ],
  "steps": ["Step 1...", "Step 2..."],
  "notes": "Any additional implementation notes (optional)"
}`,
          messages: [{
            role: 'user',
            content: `Generate a fix for this AEO issue on the page ${pageUrl}:

Category: ${categoryName}
Item: ${item.name}
Current Status: ${item.status}
Analysis Note: ${item.note}

Provide a specific, implementable fix with code that can be directly copied and used.`
          }],
        })

        const textContent = data.content
          ?.filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n') || ''

        const parsed = parseFixJSON(textContent)
        if (parsed) {
          const fixData = {
            ...parsed,
            itemId: `${categoryName}::${item.name}`,
            generatedAt: new Date().toISOString(),
          }
          handlePageFixGenerated(pageUrl, fixData)
          onProgress(i + 1, true)
        } else {
          onProgress(i + 1, false)
        }
      } catch (err) {
        logger.error('Page bulk fix error:', err)
        onProgress(i + 1, false)
      }

      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }, [apiKey, handlePageFixGenerated])

  return {
    // State
    pages,
    stats,
    analyzing,
    progress,
    error,
    selectedPageUrl,
    pageAnalyses,
    pageAnalyzerFixes,

    // Actions
    analyzePage,
    analyzePages,
    reanalyzePage,
    removePage,
    importFromGsc,
    selectPage: setSelectedPageUrl,
    clearError: () => setError(null),

    // Fix handling
    handlePageFixGenerated,
    getPageFixes,
    handlePageBulkFix,
  }
}
