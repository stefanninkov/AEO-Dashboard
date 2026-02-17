import { useState, useMemo, useCallback } from 'react'
import { callAnthropicApi } from '../../utils/apiClient'
import { getAnalyzerIndustryContext } from '../../utils/getRecommendations'
import { createActivity, appendActivity } from '../../utils/activityLogger'
import logger from '../../utils/logger'

/* ── Build the content brief prompt ── */
function buildBriefPrompt(targetQuery, pageUrl, context) {
  const { industryContext, competitorInfo, pageAnalysis } = context

  let prompt = `Generate a comprehensive AEO-optimized content brief for the following:

Target Query: "${targetQuery}"
${pageUrl ? `Target Page URL: ${pageUrl}` : 'This is for a new page.'}

${industryContext}
`

  if (pageAnalysis) {
    prompt += `
EXISTING PAGE ANALYSIS:
- Current AEO Score: ${pageAnalysis.overallScore || 'N/A'}/100
- Top Priorities: ${(pageAnalysis.topPriorities || []).join('; ')}
- Summary: ${pageAnalysis.summary || 'N/A'}

Use this analysis to tailor the brief — focus on fixing weak areas.
`
  }

  if (competitorInfo) {
    prompt += `
COMPETITOR CONTEXT:
${competitorInfo}
`
  }

  prompt += `
Research this topic using web search to understand:
1. What top-ranking pages cover
2. What questions people commonly ask
3. What competitors are doing well
4. What gaps exist in current content

Then generate a complete content brief as JSON:
{
  "title": "Suggested page title (optimized for AI answer extraction)",
  "targetWordCount": <number based on competitor analysis>,
  "headingStructure": [
    { "level": "H2", "text": "Section heading" },
    { "level": "H3", "text": "Subsection heading" }
  ],
  "questionsToAnswer": [
    "Direct questions the content must answer (for AI engine extraction)"
  ],
  "keyPoints": [
    "Key points/facts that must be covered"
  ],
  "competitorsToOutrank": [
    { "url": "https://competitor.com/page", "whyTheyRank": "Brief reason they rank well" }
  ],
  "schemaRecommendations": [
    "Specific schema types to implement (e.g. FAQPage, HowTo, Article)"
  ],
  "internalLinks": [
    { "text": "Anchor text suggestion", "suggestedUrl": "/related-page or description" }
  ],
  "toneAndStyle": "Recommended writing tone and style",
  "aeoTips": [
    "Specific AEO optimization tips for this content"
  ]
}

CRITICAL: Return ONLY valid JSON. No markdown, no explanation outside the JSON.`

  return prompt
}

/* ── Parse JSON from response ── */
function parseBriefJSON(text) {
  if (!text) return null
  // Try direct parse
  try { return JSON.parse(text) } catch {}
  // Try extracting from code block
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (m) try { return JSON.parse(m[1].trim()) } catch {}
  // Try finding JSON object
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)) } catch {}
  }
  return null
}

/* ── Extract text from API response (handles web_search tool responses) ── */
function extractResponseText(data) {
  if (!data?.content) return ''
  return data.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
}

/* ── Hook ── */
export default function useContentBrief({ activeProject, updateProject, user }) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [selectedBriefId, setSelectedBriefId] = useState(null)

  const briefs = useMemo(() => {
    return [...(activeProject?.contentBriefs || [])].sort(
      (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')
    )
  }, [activeProject?.contentBriefs])

  const selectedBrief = useMemo(
    () => briefs.find(b => b.id === selectedBriefId) || null,
    [briefs, selectedBriefId]
  )

  const generateBrief = useCallback(async (targetQuery, pageUrl) => {
    const apiKey = localStorage.getItem('anthropic-api-key')
    if (!apiKey) {
      setError('Please set your Anthropic API key in Settings.')
      return null
    }
    if (!targetQuery.trim()) {
      setError('Please enter a target query.')
      return null
    }

    setGenerating(true)
    setError(null)

    try {
      // Build context
      const questionnaire = activeProject?.questionnaire || {}
      const industryContext = getAnalyzerIndustryContext(questionnaire)

      // Competitor info
      let competitorInfo = ''
      const compAnalysis = activeProject?.competitorAnalysis
      if (compAnalysis?.rankings?.length) {
        competitorInfo = compAnalysis.rankings
          .slice(0, 3)
          .map(c => `- ${c.name} (${c.url}): AEO Score ${c.aeoScore}`)
          .join('\n')
      }

      // Page analysis
      const normalizedUrl = pageUrl?.trim() || ''
      const pageAnalysis = normalizedUrl
        ? activeProject?.pageAnalyses?.[normalizedUrl] || null
        : null

      const prompt = buildBriefPrompt(targetQuery, normalizedUrl, {
        industryContext,
        competitorInfo,
        pageAnalysis,
      })

      const data = await callAnthropicApi({
        apiKey,
        maxTokens: 4000,
        system: `You are an expert AEO (Answer Engine Optimization) content strategist.
You create comprehensive content briefs that help writers produce content optimized for AI engine citations.
Your briefs are actionable, specific, and data-driven. Always research the topic thoroughly before creating the brief.
Return ONLY valid JSON.`,
        messages: [{ role: 'user', content: prompt }],
        extraBody: {
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
        },
      })

      const responseText = extractResponseText(data)
      const brief = parseBriefJSON(responseText)

      if (!brief) {
        throw new Error('Failed to parse brief response. Please try again.')
      }

      // Save to project
      const briefEntry = {
        id: crypto.randomUUID(),
        targetQuery: targetQuery.trim(),
        pageUrl: normalizedUrl,
        brief,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || null,
      }

      const updatedBriefs = [...(activeProject?.contentBriefs || []), briefEntry]
      updateProject(activeProject.id, { contentBriefs: updatedBriefs })

      // Log activity
      const act = createActivity('briefGenerate', {
        query: targetQuery.slice(0, 60),
        pageUrl: normalizedUrl?.slice(0, 60),
      }, user)
      updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, act) })

      setSelectedBriefId(briefEntry.id)
      logger.info('Content brief generated', { query: targetQuery })

      return briefEntry
    } catch (err) {
      logger.error('Brief generation failed', err)
      setError(err.message || 'Failed to generate brief. Please try again.')
      return null
    } finally {
      setGenerating(false)
    }
  }, [activeProject, updateProject, user])

  const removeBrief = useCallback((id) => {
    const updated = (activeProject?.contentBriefs || []).filter(b => b.id !== id)
    updateProject(activeProject.id, { contentBriefs: updated })
    if (selectedBriefId === id) setSelectedBriefId(null)
  }, [activeProject, updateProject, selectedBriefId])

  const getBriefForPage = useCallback((url) => {
    return briefs.find(b => b.pageUrl === url) || null
  }, [briefs])

  /* ── Convert brief to markdown ── */
  const briefToMarkdown = useCallback((briefEntry) => {
    if (!briefEntry?.brief) return ''
    const b = briefEntry.brief
    let md = `# ${b.title || briefEntry.targetQuery}\n\n`
    md += `**Target Query:** ${briefEntry.targetQuery}\n`
    if (briefEntry.pageUrl) md += `**Page URL:** ${briefEntry.pageUrl}\n`
    md += `**Target Word Count:** ${b.targetWordCount || 'N/A'}\n`
    md += `**Tone & Style:** ${b.toneAndStyle || 'N/A'}\n\n`

    md += `## Heading Structure\n\n`
    ;(b.headingStructure || []).forEach(h => {
      const indent = h.level === 'H3' ? '  ' : ''
      md += `${indent}- **${h.level}:** ${h.text}\n`
    })

    md += `\n## Questions to Answer\n\n`
    ;(b.questionsToAnswer || []).forEach((q, i) => {
      md += `${i + 1}. ${q}\n`
    })

    md += `\n## Key Points\n\n`
    ;(b.keyPoints || []).forEach(p => { md += `- ${p}\n` })

    if (b.competitorsToOutrank?.length) {
      md += `\n## Competitors to Outrank\n\n`
      b.competitorsToOutrank.forEach(c => {
        md += `- **${c.url}** — ${c.whyTheyRank}\n`
      })
    }

    if (b.schemaRecommendations?.length) {
      md += `\n## Schema Recommendations\n\n`
      b.schemaRecommendations.forEach(s => { md += `- ${s}\n` })
    }

    if (b.internalLinks?.length) {
      md += `\n## Internal Links\n\n`
      b.internalLinks.forEach(l => {
        md += `- "${l.text}" → ${l.suggestedUrl}\n`
      })
    }

    if (b.aeoTips?.length) {
      md += `\n## AEO Optimization Tips\n\n`
      b.aeoTips.forEach(t => { md += `- ${t}\n` })
    }

    return md
  }, [])

  return {
    briefs,
    generating,
    error,
    selectedBrief,
    selectedBriefId,

    setSelectedBriefId,
    setError,

    generateBrief,
    removeBrief,
    getBriefForPage,
    briefToMarkdown,
  }
}
