import { useState, useCallback, useEffect } from 'react'
import { ENGINE_COLORS } from '../utils/chartColors'
import { callAI } from '../utils/apiClient'
import { hasApiKey } from '../utils/aiProvider'

const AI_ENGINES = Object.entries(ENGINE_COLORS).map(([name, color]) => ({ name, color }))

export { AI_ENGINES }

export function useAeoMetrics({ activeProject, updateProject, dateRange }) {
  const [refreshing, setRefreshing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' })
  const [error, setError] = useState(null)

  const getLatestMetrics = useCallback(() => {
    if (!activeProject?.metricsHistory?.length) return null
    return activeProject.metricsHistory[activeProject.metricsHistory.length - 1]
  }, [activeProject])

  const getMetricsForRange = useCallback((range) => {
    if (!activeProject?.metricsHistory?.length) return []
    const now = Date.now()
    const ranges = { today: 1, '7d': 7, '30d': 30, '90d': 90 }
    const days = ranges[range] || 7
    const cutoff = now - days * 24 * 60 * 60 * 1000
    return activeProject.metricsHistory.filter(m => new Date(m.timestamp).getTime() >= cutoff)
  }, [activeProject])

  const fetchMetrics = useCallback(async () => {
    if (refreshing) return
    if (!activeProject?.url) {
      setError('No project URL set. Add a URL to your project first.')
      return
    }

    if (!hasApiKey()) {
      setError('No API key found. Set it in Settings → API & Usage.')
      return
    }

    const projectUrl = activeProject.url
    const queries = activeProject.queryTracker || []

    setRefreshing(true)
    setError(null)
    setProgress({ current: 0, total: 3, stage: 'Checking AI engine citations...' })

    try {
      // ── Stage 1: Check citations across AI engines ──
      const engineResults = []
      let totalCitations = 0

      const enginePrompt = `Search the web for information about "${projectUrl}".

Check which AI search engines and assistants would likely cite or reference this website. Consider these platforms: ChatGPT, Perplexity, Claude, Gemini, SearchGPT, You.com, Bing Chat, Copilot, Mistral, Grok.

Return ONLY valid JSON:
{
  "engines": [
    {"name": "ChatGPT", "citations": <estimated number 0-100>, "cited": true/false},
    {"name": "Perplexity", "citations": <number>, "cited": true/false},
    {"name": "Claude", "citations": <number>, "cited": true/false},
    {"name": "Gemini", "citations": <number>, "cited": true/false},
    {"name": "SearchGPT", "citations": <number>, "cited": true/false},
    {"name": "You.com", "citations": <number>, "cited": true/false},
    {"name": "Bing Chat", "citations": <number>, "cited": true/false},
    {"name": "Copilot", "citations": <number>, "cited": true/false},
    {"name": "Mistral", "citations": <number>, "cited": true/false},
    {"name": "Grok", "citations": <number>, "cited": true/false}
  ],
  "totalCitations": <total>,
  "citationRate": <percentage 0-100>,
  "uniqueSources": <number of unique pages cited>
}`

      const engineData = await callApi(enginePrompt)
      if (engineData?.engines) {
        engineData.engines.forEach(e => {
          const config = AI_ENGINES.find(ai => ai.name === e.name)
          engineResults.push({
            engine: e.name,
            citations: e.citations || 0,
            cited: !!e.cited,
            color: config?.color || '#666',
          })
          totalCitations += (e.citations || 0)
        })
      }

      setProgress({ current: 1, total: 3, stage: 'Analyzing page performance...' })
      await delay(500)

      // ── Stage 2: Page analysis ──
      const pagePrompt = `Analyze the website "${projectUrl}" for AEO (Answer Engine Optimization) performance.

List the top pages from this website that are most likely to be cited by AI assistants. For each page, estimate its AI visibility metrics.

Return ONLY valid JSON:
{
  "pages": [
    {
      "pageTitle": "page name",
      "pageUrl": "/relative-url",
      "citations": <estimated citations>,
      "aiIndexing": <score 0-100>,
      "botReferralPercent": <percentage>
    }
  ],
  "overallScore": <0-100 AEO score for the whole site>
}`

      const pageData = await callApi(pagePrompt)
      const pages = pageData?.pages || []
      const overallScore = pageData?.overallScore || 0

      setProgress({ current: 2, total: 3, stage: 'Categorizing queries...' })
      await delay(500)

      // ── Stage 3: Query categorization ──
      let promptCategories = []
      if (queries.length > 0) {
        const queryList = queries.map(q => q.query).join(', ')
        const queryPrompt = `Categorize these search queries into topic categories and estimate their search volume: ${queryList}

Return ONLY valid JSON:
{
  "categories": [
    {"category": "category name", "volume": <estimated monthly volume>, "queries": <count>}
  ],
  "totalPrompts": ${queries.length},
  "avgPromptLength": <average word count>
}`

        const queryData = await callApi(queryPrompt)
        promptCategories = queryData?.categories || []
      }

      setProgress({ current: 3, total: 3, stage: 'Saving results...' })

      // ── Build snapshot ──
      const citationRate = engineData?.citationRate || (totalCitations > 0 ? Math.min(100, Math.round(totalCitations / 10)) : 0)
      const uniqueSources = engineData?.uniqueSources || pages.length

      // Calculate change from previous snapshot
      const prevSnapshot = getLatestMetrics()
      const citationChange = prevSnapshot
        ? ((totalCitations - (prevSnapshot.citations?.total || 0)) / Math.max(prevSnapshot.citations?.total || 1, 1)) * 100
        : 0

      const snapshot = {
        timestamp: new Date().toISOString(),
        dateRange,
        citations: {
          total: totalCitations,
          rate: citationRate,
          uniqueSources,
          change: Math.round(citationChange * 10) / 10,
          byEngine: engineResults.map(e => ({
            engine: e.engine,
            citations: e.citations,
            share: totalCitations > 0 ? Math.round((e.citations / totalCitations) * 1000) / 10 : 0,
            color: e.color,
          })),
        },
        prompts: {
          total: queries.length,
          avgLength: queries.length > 0 ? Math.round(queries.reduce((s, q) => s + q.query.split(' ').length, 0) / queries.length) : 0,
          byCategory: promptCategories,
        },
        pages,
        overallScore,
      }

      // Save to project
      const newHistory = [
        ...(activeProject.metricsHistory || []),
        snapshot,
      ].slice(-90)

      await updateProject(activeProject.id, {
        metricsHistory: newHistory,
        lastMetricsRun: new Date().toISOString(),
      })

      setRefreshing(false)
      setProgress({ current: 0, total: 0, stage: '' })
      return snapshot

    } catch (err) {
      setError(`Analysis failed: ${err.message}`)
      setRefreshing(false)
      setProgress({ current: 0, total: 0, stage: '' })
    }
  }, [activeProject, updateProject, refreshing, dateRange, getLatestMetrics])

  // Listen for refresh events from TopBar
  useEffect(() => {
    const handler = () => { if (!refreshing) fetchMetrics() }
    window.addEventListener('aeo-refresh', handler)
    return () => window.removeEventListener('aeo-refresh', handler)
  }, [refreshing, fetchMetrics])

  return {
    refreshing,
    progress,
    error,
    fetchMetrics,
    getLatestMetrics,
    getMetricsForRange,
    AI_ENGINES,
  }
}

async function callApi(prompt) {
  const result = await callAI({
    maxTokens: 3000,
    messages: [{ role: 'user', content: prompt }],
    extraBody: {
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    },
  })

  const clean = result.text.replace(/```json\s?|```/g, '').trim()
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  return null
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}
