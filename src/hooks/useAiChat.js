import { useState, useCallback, useRef } from 'react'
import { callAI } from '../utils/apiClient'
import { hasApiKey, getFastModel, getActiveProvider } from '../utils/aiProvider'
import logger from '../utils/logger'

const MAX_CONTEXT_MESSAGES = 10
const MAX_TOKENS = 1000

/**
 * Build a system prompt with full project context so the AI can answer
 * data-aware questions like "Why did my score drop?" or "Compare me to X".
 */
function buildProjectSystemPrompt(activeProject, activeView) {
  const parts = [
    `You are an AEO (Answer Engine Optimization) expert assistant embedded in the AEO Dashboard.`,
    `You help users understand their AEO data, diagnose issues, and provide actionable advice.`,
    `Be concise and specific. Use numbers when available. Don't use markdown headings.`,
    `The user is currently viewing: ${activeView || 'dashboard'}.`,
  ]

  if (activeProject) {
    parts.push(`\nProject: "${activeProject.name}" — URL: ${activeProject.url || 'not set'}`)

    // Checklist progress
    const checked = activeProject.checked || {}
    const checkedCount = Object.values(checked).filter(Boolean).length
    parts.push(`Checklist: ${checkedCount} items completed.`)

    // Latest metrics
    const history = activeProject.metricsHistory || []
    if (history.length > 0) {
      const latest = history[history.length - 1]
      const prev = history.length > 1 ? history[history.length - 2] : null
      parts.push(`\nLatest metrics (${new Date(latest.timestamp).toLocaleDateString()}):`)
      parts.push(`- AEO Score: ${latest.overallScore || 0}/100${prev ? ` (was ${prev.overallScore || 0})` : ''}`)
      parts.push(`- Citations: ${latest.citations?.total || 0}${prev ? ` (was ${prev.citations?.total || 0})` : ''}`)
      parts.push(`- Prompts: ${latest.prompts?.total || 0}`)
      if (latest.citations?.byEngine?.length > 0) {
        const engines = latest.citations.byEngine.filter(e => e.citations > 0).map(e => `${e.engine}: ${e.citations}`).join(', ')
        if (engines) parts.push(`- Engines: ${engines}`)
      }
      parts.push(`- History spans ${history.length} snapshots.`)
    }

    // Deterministic analysis
    if (activeProject.deterministicScore) {
      const ds = activeProject.deterministicScore
      parts.push(`\nSite Health Score: ${ds.overallScore}/100`)
      if (ds.categories) {
        Object.entries(ds.categories).forEach(([name, cat]) => {
          parts.push(`- ${name}: ${cat.score}/${cat.maxScore}`)
        })
      }
    }

    // Competitors
    const competitors = activeProject.competitors || []
    if (competitors.length > 0) {
      parts.push(`\nCompetitors (${competitors.length}):`)
      competitors.slice(0, 5).forEach(c => {
        parts.push(`- ${c.name || c.url}: score ${c.score ?? 'N/A'}, citations ${c.citations ?? 'N/A'}`)
      })
    }

    // Monitoring
    const monHistory = activeProject.monitorHistory || []
    if (monHistory.length > 0) {
      const latest = monHistory[monHistory.length - 1]
      parts.push(`\nLatest monitoring (${new Date(latest.timestamp).toLocaleDateString()}):`)
      parts.push(`- Score: ${latest.overallScore}%, Queries checked: ${latest.queriesChecked}, Cited: ${latest.queriesCited}`)
    }

    // Questionnaire context
    if (activeProject.questionnaire?.completedAt) {
      const q = activeProject.questionnaire
      parts.push(`\nProject context: ${q.industry || 'unknown'} industry, ${q.audience || 'general'} audience, ${q.primaryGoal || 'general'} goal.`)
    }
  } else {
    parts.push(`\nNo project is currently selected.`)
  }

  return parts.join('\n')
}

/**
 * useAiChat — Global AI chat assistant that's aware of project data.
 *
 * @param {Object} options
 * @param {Object} options.activeProject - Current active project
 * @param {string} options.activeView - Current view name
 * @returns {{ messages, loading, error, sendMessage, clearChat, hasApiKey }}
 */
export function useAiChat({ activeProject, activeView } = {}) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const apiKeyAvailable = hasApiKey()

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading || !apiKeyAvailable) return

    const userMsg = { role: 'user', content: text.trim(), ts: Date.now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setError(null)

    // Abort previous
    if (abortRef.current) abortRef.current.abort = true
    const token = { abort: false }
    abortRef.current = token

    try {
      const systemPrompt = buildProjectSystemPrompt(activeProject, activeView)
      const provider = getActiveProvider()
      const model = getFastModel(provider)

      // Build API messages from conversation (limit context)
      const contextMessages = newMessages.slice(-MAX_CONTEXT_MESSAGES).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const result = await callAI({
        system: systemPrompt,
        messages: contextMessages,
        maxTokens: MAX_TOKENS,
        model,
        retries: 1,
      })

      if (token.abort) return

      const assistantMsg = { role: 'assistant', content: result.text.trim(), ts: Date.now() }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      if (token.abort) return
      logger.warn('AI chat error:', err.message)
      setError(err.message)
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        ts: Date.now(),
        isError: true,
      }])
    } finally {
      if (!token.abort) setLoading(false)
    }
  }, [messages, loading, apiKeyAvailable, activeProject, activeView])

  const clearChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort = true
    setMessages([])
    setError(null)
    setLoading(false)
  }, [])

  return { messages, loading, error, sendMessage, clearChat, hasApiKey: apiKeyAvailable }
}
