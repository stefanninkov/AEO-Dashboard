import { useState, useCallback } from 'react'
import { createActivity, appendActivity } from '../utils/activityLogger'

export function useCompetitorAnalysis({ activeProject, updateProject, user }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' })
  const [error, setError] = useState(null)

  const addCompetitor = useCallback((name, url) => {
    if (!activeProject) return
    const newCompetitor = {
      id: crypto.randomUUID(),
      name,
      url,
      isOwn: false,
      aeoScore: 0,
      mentions: 0,
      avgPosition: 0,
      trend: 'stable',
      sparklineData: [],
      categoryScores: {},
      lastUpdated: null,
    }
    const existing = activeProject.competitors || []
    updateProject(activeProject.id, { competitors: [...existing, newCompetitor] })
    // Log add competitor activity
    const entry = createActivity('competitor_add', { url }, user)
    updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, entry) })
  }, [activeProject, updateProject])

  const removeCompetitor = useCallback((competitorId) => {
    if (!activeProject) return
    const existing = activeProject.competitors || []
    const removed = existing.find(c => c.id === competitorId)
    const filtered = existing.filter(c => c.id !== competitorId)
    updateProject(activeProject.id, { competitors: filtered })
    // Log remove competitor activity
    if (removed) {
      const entry = createActivity('competitor_remove', { url: removed.url || removed.name }, user)
      updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, entry) })
    }
  }, [activeProject, updateProject])

  const analyzeCompetitors = useCallback(async () => {
    if (analyzing) return

    const apiKey = localStorage.getItem('anthropic-api-key')
    if (!apiKey) {
      setError('No API key found. Set it in Settings.')
      return
    }

    if (!activeProject?.url) {
      setError('No project URL set. Add a URL to your project first.')
      return
    }

    setAnalyzing(true)
    setError(null)
    setProgress({ current: 0, total: 3, stage: 'Preparing competitor list...' })

    try {
      // Ensure the user's own project is in the competitors list
      let competitors = [...(activeProject.competitors || [])]
      const hasOwn = competitors.some(c => c.isOwn)
      if (!hasOwn) {
        competitors.unshift({
          id: crypto.randomUUID(),
          name: activeProject.name || 'My Site',
          url: activeProject.url,
          isOwn: true,
          aeoScore: 0,
          mentions: 0,
          avgPosition: 0,
          trend: 'stable',
          sparklineData: [],
          categoryScores: {},
          lastUpdated: null,
        })
      }

      // ── Stage 1: Evaluate AEO for each competitor ──
      setProgress({ current: 0, total: 3, stage: 'Evaluating AEO scores for each competitor...' })

      for (let i = 0; i < competitors.length; i++) {
        const comp = competitors[i]
        setProgress({
          current: 0,
          total: 3,
          stage: `Evaluating AEO for ${comp.name} (${i + 1}/${competitors.length})...`,
        })

        const prompt = `Search the web for "${comp.url}" and evaluate its AEO (Answer Engine Optimization) performance across 5 categories.

Analyze how well this website is optimized for being cited by AI assistants like ChatGPT, Perplexity, Claude, Gemini, etc.

Return ONLY valid JSON:
{
  "aeoScore": <overall score 0-100>,
  "mentions": <estimated number of AI mentions/citations>,
  "avgPosition": <average position when cited, 1-10 scale where 1 is best>,
  "trend": "up" | "down" | "stable",
  "categoryScores": {
    "conversational": <score 0-100, how well content answers conversational queries>,
    "factual": <score 0-100, how well content provides factual/authoritative answers>,
    "industrySpecific": <score 0-100, domain expertise and industry authority>,
    "comparison": <score 0-100, how often cited in comparison/recommendation queries>,
    "technical": <score 0-100, technical documentation and structured data quality>
  }
}`

        const result = await callApi(apiKey, prompt)

        if (result) {
          competitors[i] = {
            ...comp,
            aeoScore: result.aeoScore || 0,
            mentions: result.mentions || 0,
            avgPosition: result.avgPosition || 0,
            trend: result.trend || 'stable',
            categoryScores: result.categoryScores || {},
            lastUpdated: new Date().toISOString(),
            sparklineData: [
              ...(comp.sparklineData || []).slice(-29),
              { date: new Date().toISOString(), score: result.aeoScore || 0 },
            ],
          }
        }

        await new Promise(r => setTimeout(r, 500))
      }

      setProgress({ current: 1, total: 3, stage: 'Building heat map...' })
      await new Promise(r => setTimeout(r, 500))

      // ── Stage 2: Build heat map from scores ──
      const heatMap = {
        categories: ['conversational', 'factual', 'industrySpecific', 'comparison', 'technical'],
        competitors: competitors.map(c => c.name),
        scores: {
          conversational: Object.fromEntries(competitors.map(c => [c.name, c.categoryScores?.conversational || 0])),
          factual: Object.fromEntries(competitors.map(c => [c.name, c.categoryScores?.factual || 0])),
          industrySpecific: Object.fromEntries(competitors.map(c => [c.name, c.categoryScores?.industrySpecific || 0])),
          comparison: Object.fromEntries(competitors.map(c => [c.name, c.categoryScores?.comparison || 0])),
          technical: Object.fromEntries(competitors.map(c => [c.name, c.categoryScores?.technical || 0])),
        },
      }

      setProgress({ current: 2, total: 3, stage: 'Generating AI summary...' })
      await new Promise(r => setTimeout(r, 500))

      // ── Stage 3: Generate AI summary ──
      const rankings = [...competitors].sort((a, b) => b.aeoScore - a.aeoScore)
      const ownCompetitor = competitors.find(c => c.isOwn)
      const ownRank = rankings.findIndex(c => c.isOwn) + 1

      const summaryPrompt = `Analyze these competitor AEO rankings and provide strategic insights.

Rankings (sorted by AEO score):
${rankings.map((c, i) => `${i + 1}. ${c.name} (${c.url}) - AEO Score: ${c.aeoScore}, Mentions: ${c.mentions}${c.isOwn ? ' [THIS IS THE USER\'S SITE]' : ''}`).join('\n')}

The user's site "${ownCompetitor?.name || 'Unknown'}" is ranked #${ownRank} out of ${rankings.length}.

Category scores for user's site: ${JSON.stringify(ownCompetitor?.categoryScores || {})}

Return ONLY valid JSON:
{
  "keyInsight": "<1-2 sentence key insight about the user's competitive position>",
  "opportunity": "<1-2 sentence actionable opportunity to improve AEO ranking>"
}`

      const summaryData = await callApi(apiKey, summaryPrompt)
      const aiSummary = {
        keyInsight: summaryData?.keyInsight || 'Analysis complete. Review the heat map for detailed category comparisons.',
        opportunity: summaryData?.opportunity || 'Focus on improving content in your weakest categories to climb the rankings.',
      }

      setProgress({ current: 3, total: 3, stage: 'Saving results...' })

      // ── Save everything ──
      await updateProject(activeProject.id, {
        competitors,
        competitorAnalysis: {
          timestamp: new Date().toISOString(),
          heatMap,
          aiSummary,
          rankings: rankings.map((c, i) => ({
            rank: i + 1,
            id: c.id,
            name: c.name,
            url: c.url,
            aeoScore: c.aeoScore,
            isOwn: c.isOwn || false,
          })),
        },
        lastCompetitorRun: new Date().toISOString(),
      })

      setAnalyzing(false)
      setProgress({ current: 0, total: 0, stage: '' })

    } catch (err) {
      setError('Competitor analysis failed: ' + err.message)
      setAnalyzing(false)
      setProgress({ current: 0, total: 0, stage: '' })
    }
  }, [activeProject, updateProject, analyzing])

  return {
    analyzing,
    progress,
    error,
    addCompetitor,
    removeCompetitor,
    analyzeCompetitors,
  }
}

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
