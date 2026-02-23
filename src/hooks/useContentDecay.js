/**
 * useContentDecay — Detects queries losing citations over time
 * by comparing monitorHistory snapshots.
 *
 * Returns decay analysis with severity levels and optional
 * AI-powered remediation suggestions.
 */
import { useState, useMemo, useCallback } from 'react'
import { callAI } from '../utils/apiClient'

/**
 * Compare snapshots to find queries that lost citations.
 * Severity:
 * - 'lost'     — was cited in 2+ recent runs, now not cited in latest 2+
 * - 'declining' — cited rate dropped by ≥30% over last 5 runs
 * - 'dip'      — was cited last run, not cited this run (single miss)
 */
function detectDecay(monitorHistory) {
  if (!monitorHistory || monitorHistory.length < 2) return []

  // Collect all unique queries across history
  const queryMap = new Map() // queryText → array of { date, cited, excerpt }

  monitorHistory.forEach(snapshot => {
    if (!snapshot.results) return
    Object.values(snapshot.results).forEach(r => {
      if (!r.query) return
      if (!queryMap.has(r.query)) queryMap.set(r.query, [])
      queryMap.get(r.query).push({
        date: snapshot.date,
        cited: !!r.cited,
        excerpt: r.excerpt || '',
      })
    })
  })

  const decays = []

  queryMap.forEach((history, query) => {
    if (history.length < 2) return

    // Sort by date ascending
    history.sort((a, b) => new Date(a.date) - new Date(b.date))

    const latest = history[history.length - 1]
    const previous = history[history.length - 2]

    // Only care about queries that were cited before but not now
    if (latest.cited) return // still cited — no decay

    // Count how many times cited in history
    const citedCount = history.filter(h => h.cited).length
    if (citedCount === 0) return // never cited — not decay

    // Determine severity
    let severity = 'dip'
    let citedRate = citedCount / history.length

    // Check last 5 runs for declining pattern
    const recentRuns = history.slice(-5)
    const recentCited = recentRuns.filter(h => h.cited).length
    const olderRuns = history.slice(0, -5)
    const olderCited = olderRuns.filter(h => h.cited).length

    if (recentRuns.length >= 3 && recentCited === 0 && citedCount >= 2) {
      severity = 'lost'
    } else if (olderRuns.length >= 2 && olderCited > 0) {
      const olderRate = olderCited / olderRuns.length
      const recentRate = recentCited / recentRuns.length
      if (olderRate > 0 && recentRate / olderRate < 0.7) {
        severity = 'declining'
      }
    } else if (previous.cited && !latest.cited) {
      severity = 'dip'
    }

    // Find the last time it was cited
    const lastCited = [...history].reverse().find(h => h.cited)

    decays.push({
      query,
      severity,
      citedRate: Math.round(citedRate * 100),
      totalChecks: history.length,
      citedCount,
      lastCitedDate: lastCited?.date || null,
      lastExcerpt: lastCited?.excerpt || '',
      firstSeenDate: history[0].date,
      latestDate: latest.date,
    })
  })

  // Sort: lost first, then declining, then dip; within same severity by citedCount desc
  const severityOrder = { lost: 0, declining: 1, dip: 2 }
  return decays.sort((a, b) => {
    const sOrd = severityOrder[a.severity] - severityOrder[b.severity]
    if (sOrd !== 0) return sOrd
    return b.citedCount - a.citedCount
  })
}

/**
 * Build a timeline for a specific query from monitorHistory.
 */
function buildQueryTimeline(query, monitorHistory) {
  if (!monitorHistory) return []
  const points = []
  monitorHistory.forEach(snapshot => {
    if (!snapshot.results) return
    const match = Object.values(snapshot.results).find(r => r.query === query)
    if (match) {
      points.push({
        date: snapshot.date,
        cited: !!match.cited,
        excerpt: match.excerpt || '',
      })
    }
  })
  return points.sort((a, b) => new Date(a.date) - new Date(b.date))
}

function buildRemediationPrompt(decayItems, projectContext) {
  return `You are an AEO content strategist. Analyze these queries that are losing AI engine citations and suggest remediation strategies.

PROJECT: ${projectContext}

DECAYING QUERIES:
${decayItems.map((d, i) => `${i + 1}. Query: "${d.query}" — Severity: ${d.severity}, was cited ${d.citedCount}/${d.totalChecks} times, last cited: ${d.lastCitedDate ? new Date(d.lastCitedDate).toLocaleDateString() : 'unknown'}${d.lastExcerpt ? `, last excerpt: "${d.lastExcerpt}"` : ''}`).join('\n')}

For each query, suggest a specific remediation action. Return ONLY valid JSON:
[
  {
    "query": "<the query>",
    "action": "<specific remediation step>",
    "reason": "<why the citation was likely lost>",
    "priority": "high|medium|low"
  }
]

Rules:
- Be specific — reference content types, schema, or structural changes
- Prioritize by severity and potential impact
- Return ONLY valid JSON, no markdown`
}

export function useContentDecay(activeProject) {
  const [generating, setGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [error, setError] = useState(null)

  const monitorHistory = activeProject?.monitorHistory || []

  const decays = useMemo(() => {
    return detectDecay(monitorHistory)
  }, [monitorHistory])

  const summary = useMemo(() => {
    const lost = decays.filter(d => d.severity === 'lost').length
    const declining = decays.filter(d => d.severity === 'declining').length
    const dip = decays.filter(d => d.severity === 'dip').length
    return { lost, declining, dip, total: decays.length }
  }, [decays])

  const getTimeline = useCallback((query) => {
    return buildQueryTimeline(query, monitorHistory)
  }, [monitorHistory])

  const generateSuggestions = useCallback(async (selectedDecays) => {
    if (generating || !activeProject || selectedDecays.length === 0) return
    setGenerating(true)
    setError(null)

    try {
      const projectContext = [
        activeProject.name,
        activeProject.questionnaire?.websiteUrl,
        activeProject.questionnaire?.industry,
      ].filter(Boolean).join(', ') || 'No context'

      const prompt = buildRemediationPrompt(selectedDecays, projectContext)
      const response = await callAI({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 2000,
      })

      const clean = response.text.replace(/```json\s?|```/g, '').trim()
      const jsonMatch = clean.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Could not parse suggestions')

      setSuggestions(JSON.parse(jsonMatch[0]))
    } catch (err) {
      setError(err.message || 'Suggestion generation failed')
    } finally {
      setGenerating(false)
    }
  }, [generating, activeProject])

  return {
    decays,
    summary,
    generating,
    suggestions,
    error,
    getTimeline,
    generateSuggestions,
    hasData: monitorHistory.length >= 2,
  }
}
