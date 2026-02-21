import { useState, useCallback } from 'react'
import { createActivity, appendActivity } from '../utils/activityLogger'
import { fireWebhooks } from '../utils/webhookDispatcher'

/**
 * useCitationShare — monitors which brands (user + competitors) get
 * cited by AI engines for industry-relevant queries. Tracks share over time.
 */
export function useCitationShare({ activeProject, updateProject, user }) {
  const [checking, setChecking] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' })
  const [error, setError] = useState(null)

  // ── Generate industry-relevant queries ──
  const generateQueries = useCallback(() => {
    const q = activeProject?.questionnaire || {}
    const competitors = activeProject?.competitors || []
    const industry = q.industry || ''
    const projectName = activeProject?.name || 'your brand'
    const projectUrl = activeProject?.url || ''

    const queries = []

    // Industry-specific terms
    const industryTerms = {
      saas: ['best SaaS tools', 'top software platforms', 'business software recommendations'],
      ecommerce: ['best online stores', 'top e-commerce platforms', 'recommended shopping sites'],
      healthcare: ['best health resources', 'trusted medical information', 'healthcare providers'],
      finance: ['best financial advice', 'top fintech platforms', 'financial planning resources'],
      legal: ['best legal resources', 'top legal services', 'legal advice platforms'],
      realestate: ['best real estate platforms', 'top property sites', 'real estate resources'],
      education: ['best learning platforms', 'top educational resources', 'online education sites'],
      agency: ['best marketing agencies', 'top consulting firms', 'digital marketing tools'],
      localbusiness: ['best local services', 'top local businesses', 'local service recommendations'],
      media: ['best online publications', 'top media platforms', 'content publishing sites'],
    }

    // Add industry queries
    if (industry && industryTerms[industry]) {
      queries.push(...industryTerms[industry])
    } else {
      queries.push('best tools and resources', 'top recommended platforms', 'expert recommendations')
    }

    // Add comparison queries using competitor names
    const compNames = competitors
      .filter(c => !c.isOwn)
      .slice(0, 3)
      .map(c => c.name)

    if (compNames.length > 0) {
      queries.push(`${compNames[0]} vs alternatives`)
      if (compNames.length >= 2) {
        queries.push(`${compNames[0]} vs ${compNames[1]}`)
      }
    }

    // Add brand-specific query
    if (projectUrl) {
      const domain = projectUrl.replace(/https?:\/\//, '').replace(/\/$/, '').split('/')[0]
      queries.push(`${domain} review and alternatives`)
    }

    // Cap at 8 queries
    return queries.slice(0, 8)
  }, [activeProject])

  // ── Run citation share check ──
  const runCitationCheck = useCallback(async () => {
    if (checking) return
    const { hasApiKey } = await import('../utils/aiProvider')
    if (!hasApiKey()) { setError('No API key found. Set it in Settings.'); return }
    if (!activeProject?.url) { setError('No project URL set.'); return }

    const competitors = activeProject.competitors || []
    if (competitors.length === 0) { setError('Add competitors first in the Overview tab.'); return }

    setChecking(true)
    setError(null)

    const industryTerms = generateQueries()
    setProgress({ current: 0, total: industryTerms.length, stage: 'Generating queries...' })

    try {
      // Build list of all brands to check (user + competitors)
      const brands = competitors.map(c => ({
        id: c.id,
        name: c.name,
        url: c.url,
        isOwn: c.isOwn || false,
      }))

      // Track mentions per brand across all queries
      const brandMentions = {}
      brands.forEach(b => {
        brandMentions[b.id] = {
          name: b.name,
          url: b.url,
          isOwn: b.isOwn,
          totalMentions: 0,
          byEngine: {},
        }
      })

      const AI_ENGINES = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Bing Copilot']
      const queryResults = []

      for (let i = 0; i < industryTerms.length; i++) {
        const query = industryTerms[i]
        setProgress({
          current: i + 1,
          total: industryTerms.length,
          stage: `Checking: "${query}" (${i + 1}/${industryTerms.length})...`,
        })

        const brandsList = brands.map(b => `- ${b.name} (${b.url})`).join('\n')
        const prompt = `Search the web for: "${query}"

Based on the search results, determine which of these brands/websites are mentioned, cited, or referenced in the context of this query:

${brandsList}

For each brand, check if it would likely be cited by these AI engines when answering this query: ${AI_ENGINES.join(', ')}.

Return ONLY valid JSON:
{
  "results": {
    ${brands.map(b => `"${b.id}": {
      "mentioned": true or false,
      "excerpt": "brief excerpt or reason for mention/non-mention",
      "engines": {
        ${AI_ENGINES.map(e => `"${e}": { "mentioned": true or false, "excerpt": "brief note" }`).join(',\n        ')}
      }
    }`).join(',\n    ')}
  }
}`

        const result = await callApi(prompt)

        const queryResult = { query, brands: {} }

        if (result?.results) {
          for (const brand of brands) {
            const data = result.results[brand.id]
            if (data) {
              if (data.mentioned) {
                brandMentions[brand.id].totalMentions++
              }

              queryResult.brands[brand.id] = {
                mentioned: !!data.mentioned,
                excerpt: data.excerpt || '',
              }

              // Track per-engine mentions
              if (data.engines) {
                for (const engine of AI_ENGINES) {
                  const engineData = data.engines[engine]
                  if (engineData?.mentioned) {
                    if (!brandMentions[brand.id].byEngine[engine]) {
                      brandMentions[brand.id].byEngine[engine] = { mentioned: 0, excerpts: [] }
                    }
                    brandMentions[brand.id].byEngine[engine].mentioned++
                    if (engineData.excerpt) {
                      brandMentions[brand.id].byEngine[engine].excerpts.push(engineData.excerpt)
                    }
                  }
                }
              }
            }
          }
        }

        queryResults.push(queryResult)

        if (i < industryTerms.length - 1) {
          await new Promise(r => setTimeout(r, 500))
        }
      }

      // Calculate share percentages
      const totalAllMentions = Object.values(brandMentions).reduce((sum, b) => sum + b.totalMentions, 0)
      const brandsData = {}
      for (const [id, data] of Object.entries(brandMentions)) {
        brandsData[id] = {
          name: data.name,
          url: data.url,
          isOwn: data.isOwn,
          totalMentions: data.totalMentions,
          sharePercent: totalAllMentions > 0
            ? Math.round((data.totalMentions / totalAllMentions) * 100)
            : 0,
          byEngine: Object.fromEntries(
            AI_ENGINES.map(e => [
              e,
              {
                mentioned: data.byEngine[e]?.mentioned || 0,
                excerpt: (data.byEngine[e]?.excerpts || []).slice(0, 2).join(' | ') || '',
              },
            ])
          ),
        }
      }

      // Build snapshot
      const snapshot = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        industryTerms,
        brands: brandsData,
        queryResults,
      }

      // Save
      const updatedHistory = [
        ...(activeProject.citationShareHistory || []),
        snapshot,
      ].slice(-90)

      setProgress({ current: industryTerms.length, total: industryTerms.length, stage: 'Saving results...' })

      await updateProject(activeProject.id, {
        citationShareHistory: updatedHistory,
        lastCitationShareRun: new Date().toISOString(),
      })

      // Activity log + webhooks
      const citationData = { queriesChecked: industryTerms.length, totalMentions: totalAllMentions }
      const entry = createActivity('citation_share_check', citationData, user)
      await updateProject(activeProject.id, {
        activityLog: appendActivity(activeProject.activityLog, entry),
      })
      fireWebhooks(activeProject, 'citation_share_check', citationData, updateProject)

      setChecking(false)
      setProgress({ current: 0, total: 0, stage: '' })
      return snapshot
    } catch (err) {
      setError('Citation check failed: ' + err.message)
      setChecking(false)
      setProgress({ current: 0, total: 0, stage: '' })
      return null
    }
  }, [checking, activeProject, updateProject, user, generateQueries])

  return {
    checking,
    progress,
    error,
    runCitationCheck,
    generateQueries,
  }
}

// ── API Helper ──
async function callApi(prompt) {
  const { callAI } = await import('../utils/apiClient')
  const data = await callAI({
    maxTokens: 4000,
    messages: [{ role: 'user', content: prompt }],
    extraBody: {
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    },
  })

  const textContent = data.text

  const clean = textContent.replace(/```json\s?|```/g, '').trim()
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  return null
}
