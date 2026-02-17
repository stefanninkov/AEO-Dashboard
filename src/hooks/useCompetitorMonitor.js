import { useState, useCallback } from 'react'
import { createActivity, appendActivity } from '../utils/activityLogger'

/**
 * useCompetitorMonitor — tracks competitor AEO scores over time,
 * detects changes, generates alerts, and reverse-engineers competitor improvements.
 */
export function useCompetitorMonitor({ activeProject, updateProject, user }) {
  const [monitoring, setMonitoring] = useState(false)
  const [reversingId, setReversingId] = useState(null) // alertId being reverse-engineered
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' })
  const [error, setError] = useState(null)

  // ── Run a full monitoring sweep ──
  const runMonitor = useCallback(async () => {
    if (monitoring) return
    const apiKey = localStorage.getItem('anthropic-api-key')
    if (!apiKey) { setError('No API key found. Set it in Settings.'); return }
    if (!activeProject?.url) { setError('No project URL set.'); return }

    const competitors = activeProject.competitors || []
    if (competitors.length === 0) { setError('Add competitors first in the Overview tab.'); return }

    setMonitoring(true)
    setError(null)
    setProgress({ current: 0, total: competitors.length, stage: 'Starting monitor...' })

    try {
      const previousSnapshot = (activeProject.competitorMonitorHistory || []).slice(-1)[0] || null
      const scores = {}
      const changes = []

      for (let i = 0; i < competitors.length; i++) {
        const comp = competitors[i]
        setProgress({
          current: i + 1,
          total: competitors.length,
          stage: `Evaluating ${comp.name} (${i + 1}/${competitors.length})...`,
        })

        const prompt = `Search the web for "${comp.url}" and evaluate its AEO (Answer Engine Optimization) performance across 5 categories.

Analyze how well this website is optimized for being cited by AI assistants like ChatGPT, Perplexity, Claude, Gemini, etc.

Return ONLY valid JSON:
{
  "aeoScore": <overall score 0-100>,
  "categoryScores": {
    "conversational": <score 0-100, how well content answers conversational queries>,
    "factual": <score 0-100, how well content provides factual/authoritative answers>,
    "industrySpecific": <score 0-100, domain expertise and industry authority>,
    "comparison": <score 0-100, how often cited in comparison/recommendation queries>,
    "technical": <score 0-100, technical documentation and structured data quality>
  }
}`

        const result = await callApi(apiKey, prompt)

        const aeoScore = result?.aeoScore || 0
        const categoryScores = result?.categoryScores || {}

        scores[comp.id] = {
          name: comp.name,
          url: comp.url,
          isOwn: comp.isOwn || false,
          aeoScore,
          categoryScores,
        }

        // Compare to previous snapshot
        if (previousSnapshot?.scores?.[comp.id]) {
          const prev = previousSnapshot.scores[comp.id]
          const delta = aeoScore - prev.aeoScore
          const threshold = activeProject.settings?.competitorAlertThreshold || 15

          if (Math.abs(delta) >= threshold) {
            // Figure out which categories changed most
            const categoriesChanged = []
            const categories = ['conversational', 'factual', 'industrySpecific', 'comparison', 'technical']
            for (const cat of categories) {
              const catDelta = (categoryScores[cat] || 0) - (prev.categoryScores?.[cat] || 0)
              if (Math.abs(catDelta) >= 10) {
                categoriesChanged.push({ category: cat, delta: catDelta })
              }
            }

            changes.push({
              competitorId: comp.id,
              competitorName: comp.name,
              competitorUrl: comp.url,
              previousScore: prev.aeoScore,
              currentScore: aeoScore,
              delta,
              categoriesChanged,
            })
          }
        }

        if (i < competitors.length - 1) {
          await new Promise(r => setTimeout(r, 500))
        }
      }

      // Build snapshot
      const snapshot = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        scores,
        changes,
      }

      // Build alerts for significant changes
      const newAlerts = changes.map(change => ({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        competitorId: change.competitorId,
        competitorName: change.competitorName,
        competitorUrl: change.competitorUrl,
        type: change.delta > 0 ? 'score_jump' : 'score_drop',
        previousScore: change.previousScore,
        currentScore: change.currentScore,
        delta: change.delta,
        categoriesChanged: change.categoriesChanged,
        aiAnalysis: null,
        suggestions: [],
        dismissed: false,
      }))

      // Also update the competitors array with latest sparkline data
      const updatedCompetitors = competitors.map(comp => {
        const latestScore = scores[comp.id]
        if (!latestScore) return comp
        return {
          ...comp,
          aeoScore: latestScore.aeoScore,
          categoryScores: latestScore.categoryScores,
          lastUpdated: new Date().toISOString(),
          sparklineData: [
            ...(comp.sparklineData || []).slice(-29),
            { date: new Date().toISOString(), score: latestScore.aeoScore },
          ],
        }
      })

      // Save everything
      const updatedHistory = [
        ...(activeProject.competitorMonitorHistory || []),
        snapshot,
      ].slice(-90)

      const existingAlerts = activeProject.competitorAlerts || []
      const mergedAlerts = [...newAlerts, ...existingAlerts].slice(0, 100)

      setProgress({ current: competitors.length, total: competitors.length, stage: 'Saving results...' })

      await updateProject(activeProject.id, {
        competitorMonitorHistory: updatedHistory,
        lastCompetitorMonitorRun: new Date().toISOString(),
        competitorAlerts: mergedAlerts,
        competitors: updatedCompetitors,
      })

      // Activity log
      const entry = createActivity('competitor_monitor', {
        competitorsChecked: competitors.length,
        alertsGenerated: newAlerts.length,
      }, user)
      await updateProject(activeProject.id, {
        activityLog: appendActivity(activeProject.activityLog, entry),
      })

      setMonitoring(false)
      setProgress({ current: 0, total: 0, stage: '' })
      return snapshot
    } catch (err) {
      setError('Competitor monitoring failed: ' + err.message)
      setMonitoring(false)
      setProgress({ current: 0, total: 0, stage: '' })
      return null
    }
  }, [monitoring, activeProject, updateProject, user])

  // ── Reverse-engineer what a competitor changed ──
  const reverseEngineer = useCallback(async (alertId) => {
    const apiKey = localStorage.getItem('anthropic-api-key')
    if (!apiKey) { setError('No API key found.'); return }

    const alerts = activeProject?.competitorAlerts || []
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return

    setReversingId(alertId)
    setError(null)

    try {
      const ownSite = activeProject.url || 'your site'
      const categoriesStr = (alert.categoriesChanged || [])
        .map(c => `${c.category} (${c.delta > 0 ? '+' : ''}${c.delta})`)
        .join(', ')

      const prompt = `Search the web for "${alert.competitorUrl}" and analyze recent changes.

This competitor's AEO score changed from ${alert.previousScore} to ${alert.currentScore} (${alert.delta > 0 ? '+' : ''}${alert.delta} points).
${categoriesStr ? `Categories that changed most: ${categoriesStr}` : ''}

Investigate what this competitor likely changed to improve/decrease their AEO optimization. Look for:
1. Schema markup changes (FAQ, HowTo, Article, etc.)
2. Content structure improvements (headers, lists, tables)
3. New pages or content sections added
4. Technical SEO changes
5. Content quality improvements

Then suggest what "${ownSite}" should do similarly.

Return ONLY valid JSON:
{
  "analysis": "<2-4 sentences explaining what the competitor likely changed>",
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>"
  ]
}`

      const result = await callApi(apiKey, prompt)

      if (result) {
        const updatedAlerts = alerts.map(a =>
          a.id === alertId
            ? { ...a, aiAnalysis: result.analysis || 'Unable to determine specific changes.', suggestions: result.suggestions || [] }
            : a
        )
        await updateProject(activeProject.id, { competitorAlerts: updatedAlerts })
      }

      setReversingId(null)
    } catch (err) {
      setError('Reverse engineering failed: ' + err.message)
      setReversingId(null)
    }
  }, [activeProject, updateProject])

  // ── Dismiss an alert ──
  const dismissAlert = useCallback(async (alertId) => {
    const alerts = activeProject?.competitorAlerts || []
    const updated = alerts.map(a =>
      a.id === alertId ? { ...a, dismissed: true } : a
    )
    await updateProject(activeProject.id, { competitorAlerts: updated })
  }, [activeProject, updateProject])

  // ── Clear all dismissed alerts ──
  const clearDismissedAlerts = useCallback(async () => {
    const alerts = activeProject?.competitorAlerts || []
    const remaining = alerts.filter(a => !a.dismissed)
    await updateProject(activeProject.id, { competitorAlerts: remaining })
  }, [activeProject, updateProject])

  return {
    monitoring,
    reversingId,
    progress,
    error,
    runMonitor,
    reverseEngineer,
    dismissAlert,
    clearDismissedAlerts,
  }
}

// ── API Helper ──
async function callApi(apiKey, prompt) {
  const { callAnthropicApi } = await import('../utils/apiClient')
  const data = await callAnthropicApi({
    apiKey,
    maxTokens: 3000,
    messages: [{ role: 'user', content: prompt }],
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
    return JSON.parse(jsonMatch[0])
  }
  return null
}
