import { useState, useCallback } from 'react'

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export function useAutoMonitor({ activeProject, updateProject }) {
  const [monitoring, setMonitoring] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  const shouldAutoRun = useCallback(() => {
    if (!activeProject) return false
    if (!activeProject.url) return false
    if (!activeProject.queryTracker?.length) return false
    if (!localStorage.getItem('anthropic-api-key')) return false

    const lastRun = activeProject.lastMonitorRun
    if (!lastRun) return true

    return Date.now() - new Date(lastRun).getTime() > TWENTY_FOUR_HOURS
  }, [activeProject])

  const runMonitor = useCallback(async () => {
    if (monitoring) return // prevent double runs
    if (!activeProject?.queryTracker?.length) {
      setError('No queries to monitor. Add queries in the Query Tracker first.')
      return
    }

    const apiKey = localStorage.getItem('anthropic-api-key')
    if (!apiKey) {
      setError('No API key found. Set it in the Analyzer tab.')
      return
    }

    const projectUrl = activeProject.url
    if (!projectUrl) {
      setError('No project URL set. Add a URL to your project first.')
      return
    }

    const queries = activeProject.queryTracker

    setMonitoring(true)
    setError(null)
    setProgress({ current: 0, total: queries.length })

    const results = {}
    let citedCount = 0
    let totalChecks = 0

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i]
      setProgress({ current: i + 1, total: queries.length })

      try {
        const { callAnthropicApi } = await import('../utils/apiClient')
        const data = await callAnthropicApi({
          apiKey,
          maxTokens: 2000,
          messages: [{
            role: 'user',
            content: `Search for: "${q.query}"

Look at the search results. Does the response mention, cite, or reference the website "${projectUrl}" or content from that domain?

Return ONLY valid JSON:
{
  "cited": true or false,
  "excerpt": "Brief excerpt of how the brand/URL was mentioned, or 'Not found in results' if not cited"
}`
          }],
          extraBody: {
            tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          },
        })
        if (data.error) throw new Error(data.error.message)

        const textContent = data.content
          ?.filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n') || ''

        const clean = textContent.replace(/```json\s?|```/g, '').trim()
        const jsonMatch = clean.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          results[q.id] = {
            query: q.query,
            cited: !!parsed.cited,
            excerpt: parsed.excerpt || '',
          }
          if (parsed.cited) citedCount++
          totalChecks++
        } else {
          results[q.id] = {
            query: q.query,
            cited: false,
            excerpt: 'Could not parse result',
          }
          totalChecks++
        }
      } catch (err) {
        results[q.id] = {
          query: q.query,
          cited: false,
          excerpt: `Error: ${err.message}`,
        }
        totalChecks++
      }

      // Rate limit: 500ms between requests
      if (i < queries.length - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    const overallScore = totalChecks > 0
      ? Math.round((citedCount / totalChecks) * 100)
      : 0

    const snapshot = {
      date: new Date().toISOString(),
      overallScore,
      queriesChecked: totalChecks,
      queriesCited: citedCount,
      results,
    }

    const newHistory = [
      ...(activeProject.monitorHistory || []),
      snapshot,
    ].slice(-90) // Keep last 90 entries

    updateProject(activeProject.id, {
      monitorHistory: newHistory,
      lastMonitorRun: new Date().toISOString(),
    })

    setLastResult(snapshot)
    setMonitoring(false)
    setProgress({ current: 0, total: 0 })

    return snapshot
  }, [activeProject, updateProject, monitoring])

  return {
    monitoring,
    progress,
    error,
    lastResult,
    shouldAutoRun,
    runMonitor,
  }
}
