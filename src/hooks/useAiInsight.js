import { useState, useCallback, useRef, useEffect } from 'react'
import { callAI } from '../utils/apiClient'
import { hasApiKey, getFastModel, getActiveProvider } from '../utils/aiProvider'
import logger from '../utils/logger'

/**
 * Cache insights in sessionStorage so we don't re-call AI on every render.
 * Key = viewId + hash of context data.
 */
function getCacheKey(viewId, contextHash) {
  return `ai-insight-${viewId}-${contextHash}`
}

function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return hash.toString(36)
}

function getCachedInsight(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Cache for 10 minutes
    if (Date.now() - parsed.ts > 10 * 60 * 1000) {
      sessionStorage.removeItem(key)
      return null
    }
    return parsed.text
  } catch {
    return null
  }
}

function setCachedInsight(key, text) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ text, ts: Date.now() }))
  } catch { /* quota exceeded — ignore */ }
}

/**
 * System prompts per view type. Each gets the relevant data context injected.
 */
const SYSTEM_PROMPTS = {
  dashboard: `You are an AEO (Answer Engine Optimization) analyst. Given the user's dashboard data, provide a brief 2-3 sentence insight about their overall AEO performance. Highlight the most important trend or action item. Be specific with numbers. Do not use markdown formatting, just plain text.`,

  metrics: `You are an AEO metrics analyst. Given the user's metrics history and current scores, provide a brief 2-3 sentence insight. Focus on trends (improving/declining), notable changes, and one specific recommendation. Be specific with numbers. Do not use markdown formatting.`,

  competitors: `You are a competitive intelligence analyst for AEO. Given competitor data, provide a brief 2-3 sentence insight about the competitive landscape. Highlight gaps, threats, or opportunities. Be specific. Do not use markdown formatting.`,

  monitoring: `You are an AEO monitoring analyst. Given monitoring data and score history, provide a brief 2-3 sentence insight about site health trends. Flag any regressions or improvements. Be specific with numbers. Do not use markdown formatting.`,

  gsc: `You are a Search Console analyst. Given GSC query data, provide a brief 2-3 sentence insight about search performance. Highlight top-performing or declining queries, CTR patterns, or AI-related query opportunities. Be specific. Do not use markdown formatting.`,

  ga4: `You are an AI traffic analyst. Given GA4 AI traffic data, provide a brief 2-3 sentence insight about AI-driven traffic patterns. Highlight which AI platforms drive the most traffic, trends, and engagement quality. Be specific. Do not use markdown formatting.`,

  checklist: `You are an AEO implementation coach. Given the user's checklist progress across phases, provide a brief 2-3 sentence prioritization insight. Suggest which phase or category to focus on next for maximum impact. Be specific. Do not use markdown formatting.`,

  'content-ops': `You are a content strategy analyst. Given the content calendar and pipeline data, provide a brief 2-3 sentence insight about content production health. Highlight any gaps, upcoming deadlines, or optimization opportunities. Be specific. Do not use markdown formatting.`,
}

/**
 * useAiInsight — Generates AI-powered insights for any dashboard view.
 *
 * @param {Object} options
 * @param {string} options.viewId - Which view ('dashboard', 'metrics', 'competitors', etc.)
 * @param {Object} options.contextData - The data to analyze (scores, history, competitors, etc.)
 * @param {boolean} [options.enabled=true] - Whether to auto-generate on mount/change
 * @returns {{ insight, loading, error, generate, hasApiKey: boolean }}
 */
export function useAiInsight({ viewId, contextData, enabled = true }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const lastHashRef = useRef(null)

  const apiKeyAvailable = hasApiKey()

  const generate = useCallback(async (forceRefresh = false) => {
    if (!apiKeyAvailable || !contextData || !viewId) return
    if (!SYSTEM_PROMPTS[viewId]) return

    const contextStr = JSON.stringify(contextData)
    // Don't re-analyze identical data unless forced
    const hash = simpleHash(contextStr)
    if (!forceRefresh && hash === lastHashRef.current && insight) return

    const cacheKey = getCacheKey(viewId, hash)
    if (!forceRefresh) {
      const cached = getCachedInsight(cacheKey)
      if (cached) {
        setInsight(cached)
        lastHashRef.current = hash
        return
      }
    }

    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort = true
    const token = { abort: false }
    abortRef.current = token

    setLoading(true)
    setError(null)

    try {
      const provider = getActiveProvider()
      const fastModel = getFastModel(provider)

      const result = await callAI({
        system: SYSTEM_PROMPTS[viewId],
        messages: [
          { role: 'user', content: `Here is my current ${viewId} data:\n\n${contextStr}\n\nProvide your insight.` },
        ],
        maxTokens: 300,
        model: fastModel,
        retries: 1,
      })

      if (token.abort) return

      const text = result.text.trim()
      setInsight(text)
      lastHashRef.current = hash
      setCachedInsight(cacheKey, text)
    } catch (err) {
      if (token.abort) return
      logger.warn(`AI insight failed for ${viewId}:`, err.message)
      setError(err.message)
    } finally {
      if (!token.abort) setLoading(false)
    }
  }, [apiKeyAvailable, contextData, viewId, insight])

  // Auto-generate when enabled and data changes
  useEffect(() => {
    if (!enabled || !apiKeyAvailable || !contextData) return
    generate()
  }, [enabled, apiKeyAvailable, contextData, generate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort = true
    }
  }, [])

  return { insight, loading, error, generate, hasApiKey: apiKeyAvailable }
}
