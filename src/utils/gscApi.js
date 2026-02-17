/**
 * Google Search Console API Client
 *
 * Uses the Search Console API (Webmasters v3) to:
 *  - List verified properties (sites)
 *  - Query search analytics data
 *  - Detect AEO-relevant queries
 *
 * All requests use the access token from the Google OAuth integration.
 */

import { googleApiGet, googleApiPost } from './googleAuth'
import logger from './logger'

const GSC_BASE = 'https://www.googleapis.com/webmasters/v3'
const GSC_SEARCH_BASE = 'https://searchconsole.googleapis.com/webmasters/v3'

/**
 * List all Search Console properties the user has access to
 * @returns {Array<{ siteUrl: string, permissionLevel: string }>}
 */
export async function listGscProperties(accessToken) {
  if (!accessToken) throw new Error('No access token')

  try {
    const data = await googleApiGet(
      accessToken,
      `${GSC_BASE}/sites`
    )
    return (data.siteEntry || []).map(entry => ({
      siteUrl: entry.siteUrl,
      permissionLevel: entry.permissionLevel,
    }))
  } catch (err) {
    logger.error('Failed to list GSC properties:', err)
    throw err
  }
}

/**
 * Query Search Console search analytics
 *
 * @param {string} accessToken
 * @param {string} siteUrl - The property URL (e.g. "https://example.com/" or "sc-domain:example.com")
 * @param {object} options
 * @param {string} options.startDate - YYYY-MM-DD
 * @param {string} options.endDate - YYYY-MM-DD
 * @param {string[]} options.dimensions - ['query', 'page', 'date', 'country', 'device']
 * @param {number} options.rowLimit - max rows (default 1000, max 25000)
 * @param {number} options.startRow - offset (default 0)
 * @param {Array} options.dimensionFilterGroups - optional filters
 * @param {string} options.type - 'web', 'image', 'video', 'news', 'discover', 'googleNews'
 * @returns {object} { rows, responseAggregationType }
 */
export async function querySearchAnalytics(accessToken, siteUrl, options = {}) {
  if (!accessToken) throw new Error('No access token')
  if (!siteUrl) throw new Error('No site URL')

  const {
    startDate,
    endDate,
    dimensions = ['query'],
    rowLimit = 1000,
    startRow = 0,
    dimensionFilterGroups,
    type = 'web',
  } = options

  if (!startDate || !endDate) {
    throw new Error('startDate and endDate are required')
  }

  const body = {
    startDate,
    endDate,
    dimensions,
    rowLimit,
    startRow,
    type,
  }

  if (dimensionFilterGroups) {
    body.dimensionFilterGroups = dimensionFilterGroups
  }

  const encodedUrl = encodeURIComponent(siteUrl)

  try {
    const data = await googleApiPost(
      accessToken,
      `${GSC_SEARCH_BASE}/sites/${encodedUrl}/searchAnalytics/query`,
      body
    )
    return {
      rows: (data.rows || []).map(row => ({
        keys: row.keys || [],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })),
      responseAggregationType: data.responseAggregationType,
    }
  } catch (err) {
    logger.error('GSC search analytics query failed:', err)
    throw err
  }
}

/**
 * Detect AEO-relevant queries from search analytics data.
 *
 * AEO queries are questions and conversational phrases that
 * AI engines commonly source from — identified by patterns like:
 *   - Question words: what, how, why, when, where, who, which, can, does, is, are
 *   - Long-tail patterns: "best X for Y", "X vs Y", "how to X"
 *   - Comparison patterns
 *   - Definition patterns: "what is X", "define X"
 */
export function classifyAeoQueries(rows) {
  const questionPatterns = [
    /^(what|how|why|when|where|who|which|can|does|is|are|do|should|would|could|will)\b/i,
    /\b(vs\.?|versus|compared to|or)\b/i,
    /\b(best|top|review|guide|tutorial|explained|example)\b/i,
    /\b(define|definition|meaning of)\b/i,
    /\?$/,
  ]

  return rows.map(row => {
    const query = row.keys?.[0] || ''
    const isAeoQuery = questionPatterns.some(p => p.test(query))

    let aeoType = 'standard'
    if (/^(what is|what are|what does|define|meaning of)\b/i.test(query)) {
      aeoType = 'definition'
    } else if (/^(how to|how do|how can|how does)\b/i.test(query)) {
      aeoType = 'how-to'
    } else if (/\b(vs\.?|versus|compared to|or)\b/i.test(query)) {
      aeoType = 'comparison'
    } else if (/^(best|top)\b/i.test(query)) {
      aeoType = 'listicle'
    } else if (/^(why|when|where|who|which)\b/i.test(query)) {
      aeoType = 'informational'
    } else if (/\?$/.test(query)) {
      aeoType = 'question'
    }

    return {
      ...row,
      query,
      isAeoQuery,
      aeoType: isAeoQuery ? aeoType : null,
    }
  })
}

/**
 * Get date range strings for common presets
 */
export function getDateRange(preset) {
  const end = new Date()
  end.setDate(end.getDate() - 1) // GSC data has ~2-day lag
  const endStr = end.toISOString().split('T')[0]

  let start = new Date(end)
  switch (preset) {
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '28d':
      start.setDate(start.getDate() - 28)
      break
    case '3m':
      start.setMonth(start.getMonth() - 3)
      break
    case '6m':
      start.setMonth(start.getMonth() - 6)
      break
    case '12m':
      start.setMonth(start.getMonth() - 12)
      break
    case '16m':
      start.setMonth(start.getMonth() - 16) // GSC max
      break
    default:
      start.setDate(start.getDate() - 28)
  }
  const startStr = start.toISOString().split('T')[0]

  return { startDate: startStr, endDate: endStr }
}

/**
 * Format a GSC site URL for display
 * "https://example.com/" → "example.com"
 * "sc-domain:example.com" → "example.com (domain)"
 */
export function formatSiteUrl(siteUrl) {
  if (!siteUrl) return ''
  if (siteUrl.startsWith('sc-domain:')) {
    return `${siteUrl.replace('sc-domain:', '')} (domain)`
  }
  try {
    const url = new URL(siteUrl)
    return url.hostname + (url.pathname !== '/' ? url.pathname : '')
  } catch {
    return siteUrl
  }
}
