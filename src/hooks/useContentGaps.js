/**
 * useContentGaps — Analyzes citation data to find queries where
 * competitors are cited but you aren't.
 *
 * Returns gap analysis with difficulty assessment and content recommendations.
 * Can generate a roadmap that populates the content calendar.
 */
import { useState, useMemo, useCallback } from 'react'
import { callAI } from '../utils/apiClient'

function extractGaps(project) {
  const history = project.citationShareHistory || []
  if (history.length === 0) return []

  const latest = history[0] // most recent snapshot
  if (!latest.queryResults || !latest.brands) return []

  // Find own brand
  const ownBrandId = Object.entries(latest.brands).find(([, b]) => b.isOwn)?.[0]
  if (!ownBrandId) return []

  const gaps = []

  latest.queryResults.forEach(qr => {
    const ownResult = qr.brands?.[ownBrandId]
    const ownMentioned = ownResult?.mentioned

    if (ownMentioned) return // skip queries where we ARE cited

    // Find which competitors ARE cited for this query
    const citedCompetitors = []
    Object.entries(qr.brands || {}).forEach(([brandId, brandData]) => {
      if (brandId === ownBrandId) return
      if (brandData.mentioned) {
        const brandInfo = latest.brands[brandId]
        citedCompetitors.push({
          name: brandInfo?.name || 'Unknown',
          excerpt: brandData.excerpt || '',
        })
      }
    })

    if (citedCompetitors.length > 0) {
      gaps.push({
        query: qr.query,
        competitorsCited: citedCompetitors,
        competitorCount: citedCompetitors.length,
      })
    }
  })

  // Sort by most competitors cited (highest gap priority)
  return gaps.sort((a, b) => b.competitorCount - a.competitorCount)
}

function buildRoadmapPrompt(selectedGaps, projectContext) {
  return `You are an AEO content strategist. Generate a content roadmap for these queries where competitors are cited by AI engines but our site is not.

PROJECT: ${projectContext}

CONTENT GAPS (queries where competitors are cited but we're not):
${selectedGaps.map((g, i) => `${i + 1}. Query: "${g.query}" — ${g.competitorCount} competitor(s) cited: ${g.competitorsCited.map(c => `${c.name}${c.excerpt ? ` ("${c.excerpt}")` : ''}`).join(', ')}`).join('\n')}

Generate a JSON array of content calendar entries to address these gaps. Each entry should be a practical content task.

Return ONLY valid JSON in this format:
[
  {
    "title": "<specific content task title>",
    "query": "<the gap query this addresses>",
    "contentType": "article|faq|product|comparison|how-to",
    "difficulty": "easy|medium|hard",
    "priority": "high|medium|low",
    "notes": "<brief strategy note>"
  }
]

Rules:
- One entry per gap query (combine related queries if they overlap)
- Titles should be actionable tasks, not vague
- Notes should explain the content strategy for beating competitor citations
- Return ONLY valid JSON, no markdown`
}

export function useContentGaps(activeProject) {
  const [generating, setGenerating] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [error, setError] = useState(null)

  const gaps = useMemo(() => {
    return activeProject ? extractGaps(activeProject) : []
  }, [activeProject?.citationShareHistory]) // eslint-disable-line react-hooks/exhaustive-deps

  const generateRoadmap = useCallback(async (selectedGaps) => {
    if (generating || !activeProject || selectedGaps.length === 0) return
    setGenerating(true)
    setError(null)

    try {
      const projectContext = [
        activeProject.name,
        activeProject.questionnaire?.websiteUrl,
        activeProject.questionnaire?.industry,
      ].filter(Boolean).join(', ') || 'No context'

      const prompt = buildRoadmapPrompt(selectedGaps, projectContext)
      const response = await callAI({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 2000,
      })

      const clean = response.text.replace(/```json\s?|```/g, '').trim()
      const jsonMatch = clean.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Could not parse roadmap')

      setRoadmap(JSON.parse(jsonMatch[0]))
    } catch (err) {
      setError(err.message || 'Roadmap generation failed')
    } finally {
      setGenerating(false)
    }
  }, [generating, activeProject])

  return {
    gaps,
    generating,
    roadmap,
    error,
    generateRoadmap,
  }
}
