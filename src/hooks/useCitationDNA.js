/**
 * useCitationDNA — Analyzes citation patterns to produce a "DNA fingerprint".
 *
 * Reverse-engineers WHY content gets cited by AI engines.
 * Extracts patterns from monitorHistory + citationShareHistory + pageAnalyses.
 *
 * Returns: { analyzing, dnaProfile, patterns, suggestions, runAnalysis }
 */
import { useState, useMemo, useCallback } from 'react'
import { callAI } from '../utils/apiClient'

const DNA_DIMENSIONS = [
  'factualDensity',
  'structureClarity',
  'authoritySignals',
  'freshness',
  'schemaPresence',
  'conversationalFit',
]

function extractExcerpts(project) {
  const excerpts = []

  // From monitorHistory — cited queries with excerpts
  ;(project.monitorHistory || []).forEach(snapshot => {
    if (!snapshot.results) return
    Object.values(snapshot.results).forEach(r => {
      if (r.cited && r.excerpt && r.excerpt !== 'Not found in results') {
        excerpts.push({ query: r.query, text: r.excerpt, source: 'monitor' })
      }
    })
  })

  // From citationShareHistory — own brand excerpts
  ;(project.citationShareHistory || []).forEach(snapshot => {
    if (!snapshot.brands) return
    Object.values(snapshot.brands).forEach(brand => {
      if (!brand.isOwn) return
      if (brand.byEngine) {
        Object.entries(brand.byEngine).forEach(([engine, data]) => {
          if (data.excerpt && data.mentioned > 0) {
            excerpts.push({ engine, text: data.excerpt, source: 'citation' })
          }
        })
      }
    })
    // Also gather query-level excerpts for own brand
    ;(snapshot.queryResults || []).forEach(qr => {
      Object.values(qr.brands || {}).forEach(b => {
        if (b.mentioned && b.excerpt) {
          excerpts.push({ query: qr.query, text: b.excerpt, source: 'citation-query' })
        }
      })
    })
  })

  return excerpts
}

function extractPageInsights(project) {
  const analyses = project.pageAnalyses || {}
  const insights = []
  Object.entries(analyses).forEach(([url, analysis]) => {
    if (!analysis.categories) return
    const passing = []
    const failing = []
    analysis.categories.forEach(cat => {
      ;(cat.items || []).forEach(item => {
        if (item.status === 'pass') passing.push(`${cat.name}: ${item.name}`)
        else if (item.status === 'fail') failing.push(`${cat.name}: ${item.name}`)
      })
    })
    insights.push({
      url,
      score: analysis.overallScore,
      passing: passing.slice(0, 5),
      failing: failing.slice(0, 5),
      summary: analysis.summary,
    })
  })
  return insights
}

function buildPrompt(excerpts, pageInsights, projectContext) {
  return `You are an AEO (Answer Engine Optimization) analyst. Analyze why this website's content gets cited by AI engines.

PROJECT CONTEXT:
${projectContext}

CITATION EXCERPTS (what AI engines quoted from this site):
${excerpts.slice(0, 30).map((e, i) => `${i + 1}. [${e.source}${e.engine ? '/' + e.engine : ''}${e.query ? ' query:"' + e.query + '"' : ''}] "${e.text}"`).join('\n')}

PAGE ANALYSIS INSIGHTS:
${pageInsights.slice(0, 5).map(p => `- ${p.url} (score: ${p.score}): Passing: ${p.passing.join(', ')}. Failing: ${p.failing.join(', ')}.`).join('\n')}

Analyze the citation patterns and return a JSON object with exactly this structure:
{
  "dnaProfile": {
    "factualDensity": <0-100 score>,
    "structureClarity": <0-100 score>,
    "authoritySignals": <0-100 score>,
    "freshness": <0-100 score>,
    "schemaPresence": <0-100 score>,
    "conversationalFit": <0-100 score>
  },
  "patterns": [
    { "title": "<pattern name>", "description": "<why this works>", "strength": "high|medium|low" }
  ],
  "suggestions": [
    { "title": "<action>", "description": "<how to improve>", "impact": "high|medium|low" }
  ]
}

Rules:
- dnaProfile scores reflect what the excerpts reveal about content characteristics
- patterns: 3-5 winning patterns found in citations (what makes content get cited)
- suggestions: 3-5 actionable improvements based on gaps
- Be specific to THIS site's data, not generic advice
- Return ONLY valid JSON, no markdown`
}

export function useCitationDNA(activeProject) {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const excerpts = useMemo(() => {
    return activeProject ? extractExcerpts(activeProject) : []
  }, [activeProject?.monitorHistory, activeProject?.citationShareHistory]) // eslint-disable-line react-hooks/exhaustive-deps

  const pageInsights = useMemo(() => {
    return activeProject ? extractPageInsights(activeProject) : []
  }, [activeProject?.pageAnalyses]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasData = excerpts.length > 0

  const runAnalysis = useCallback(async () => {
    if (analyzing || !activeProject) return
    setAnalyzing(true)
    setError(null)

    try {
      const projectContext = [
        activeProject.name && `Project: ${activeProject.name}`,
        activeProject.questionnaire?.websiteUrl && `Website: ${activeProject.questionnaire.websiteUrl}`,
        activeProject.questionnaire?.industry && `Industry: ${activeProject.questionnaire.industry}`,
      ].filter(Boolean).join(', ')

      const prompt = buildPrompt(excerpts, pageInsights, projectContext || 'No additional context')

      const response = await callAI({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 2000,
      })

      const clean = response.text.replace(/```json\s?|```/g, '').trim()
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse DNA analysis')

      const parsed = JSON.parse(jsonMatch[0])
      setResult(parsed)
    } catch (err) {
      setError(err.message || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }, [analyzing, activeProject, excerpts, pageInsights])

  return {
    analyzing,
    dnaProfile: result?.dnaProfile || null,
    patterns: result?.patterns || [],
    suggestions: result?.suggestions || [],
    error,
    hasData,
    excerptCount: excerpts.length,
    runAnalysis,
  }
}
