import { useMemo, useCallback } from 'react'
import { getSmartRecommendations, getQuickWin } from '../utils/getRecommendations'

/**
 * useRecommendations — Enhanced, contextual recommendations engine.
 *
 * Wraps the existing getSmartRecommendations and adds:
 * - Score-based recommendations (from deterministicScore)
 * - Competitor gap recommendations (from competitor analysis)
 * - Priority sorting and deduplication
 * - Category filtering
 *
 * Returns:
 *   recommendations: array of recommendation objects
 *   quickWin: single highest-impact action
 *   filterByCategory: (category) => filtered array
 *   scoreRecommendations: recommendations based on score gaps
 *   competitorRecommendations: recommendations based on competitor gaps
 */
export function useRecommendations({ activeProject, phases, setActiveView }) {
  // Base recommendations from existing system
  const baseRecommendations = useMemo(
    () => getSmartRecommendations(activeProject, phases, setActiveView),
    [activeProject, phases, setActiveView]
  )

  const quickWin = useMemo(
    () => getQuickWin(activeProject, phases, setActiveView),
    [activeProject, phases, setActiveView]
  )

  // Score-based recommendations
  const scoreRecommendations = useMemo(() => {
    const score = activeProject?.deterministicScore
    if (!score?.categories) return []

    const recs = []
    Object.entries(score.categories).forEach(([name, cat]) => {
      const pct = Math.round((cat.score / cat.maxScore) * 100)
      if (pct < 40) {
        recs.push({
          id: `score-critical-${name}`,
          category: 'analysis',
          priority: 1,
          text: `Critical: ${name} score is only ${pct}%`,
          detail: `Your ${name.toLowerCase()} score is well below average. Focus on this area for the biggest improvement.`,
          actionLabel: 'Fix Now',
          action: () => setActiveView('analyzer'),
          source: 'score',
          impact: 'high',
        })
      } else if (pct < 70) {
        recs.push({
          id: `score-improve-${name}`,
          category: 'analysis',
          priority: 2,
          text: `Improve ${name} (${pct}%)`,
          detail: `Your ${name.toLowerCase()} score has room for improvement. Small changes can yield significant results.`,
          actionLabel: 'Analyze',
          action: () => setActiveView('analyzer'),
          source: 'score',
          impact: 'medium',
        })
      }
    })
    return recs
  }, [activeProject?.deterministicScore, setActiveView])

  // Competitor-based recommendations
  const competitorRecommendations = useMemo(() => {
    const analysis = activeProject?.competitorAnalysis
    const competitors = activeProject?.competitors || []
    const yourSite = competitors.find((c) => c.isOwn)
    if (!analysis?.heatMap || !yourSite) return []

    const recs = []
    const heatMap = analysis.heatMap

    // Find categories where competitors beat you
    heatMap.categories?.forEach((cat) => {
      const yourScore = heatMap.scores?.[cat]?.[yourSite.name] || 0
      const competitorScores = competitors
        .filter((c) => !c.isOwn)
        .map((c) => ({
          name: c.name,
          score: heatMap.scores?.[cat]?.[c.name] || 0,
        }))
        .filter((c) => c.score > yourScore)
        .sort((a, b) => b.score - a.score)

      if (competitorScores.length > 0 && competitorScores[0].score - yourScore > 10) {
        const leader = competitorScores[0]
        recs.push({
          id: `comp-gap-${cat}`,
          category: 'competitors',
          priority: leader.score - yourScore > 20 ? 1 : 2,
          text: `${leader.name} leads you in ${cat} by ${leader.score - yourScore} points`,
          detail: `Close this gap to improve your competitive position. Analyze what ${leader.name} does differently.`,
          actionLabel: 'Compare',
          action: () => setActiveView('competitors'),
          source: 'competitor',
          impact: leader.score - yourScore > 20 ? 'high' : 'medium',
        })
      }
    })

    return recs
  }, [activeProject?.competitorAnalysis, activeProject?.competitors, setActiveView])

  // Merge and deduplicate all recommendations
  const recommendations = useMemo(() => {
    const all = [
      ...baseRecommendations,
      ...scoreRecommendations,
      ...competitorRecommendations,
    ]

    // Deduplicate by id
    const seen = new Set()
    const unique = all.filter((rec) => {
      if (seen.has(rec.id)) return false
      seen.add(rec.id)
      return true
    })

    // Sort by priority (1 = highest)
    return unique.sort((a, b) => (a.priority || 5) - (b.priority || 5))
  }, [baseRecommendations, scoreRecommendations, competitorRecommendations])

  const filterByCategory = useCallback(
    (category) => recommendations.filter((r) => r.category === category),
    [recommendations]
  )

  return {
    recommendations,
    quickWin,
    filterByCategory,
    scoreRecommendations,
    competitorRecommendations,
  }
}
