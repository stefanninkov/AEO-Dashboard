/**
 * Google Analytics 4 (GA4) API Client
 *
 * Uses the Google Analytics Admin API to list accounts/properties
 * and the GA4 Data API (v1beta) to run reports.
 *
 * Key capability: detecting AI-referred traffic via referral source patterns.
 */

import { googleApiGet, googleApiPost } from './googleAuth'
import logger from './logger'

const GA_ADMIN_BASE = 'https://analyticsadmin.googleapis.com/v1beta'
const GA_DATA_BASE = 'https://analyticsdata.googleapis.com/v1beta'

/* ═══════════════════════════════════════════════════
   AI REFERRAL SOURCE PATTERNS
   ═══════════════════════════════════════════════════ */

/**
 * Known AI referral sources and their display info.
 * Used to identify traffic from AI engines in GA4 referral data.
 */
export const AI_REFERRAL_SOURCES = [
  { id: 'chatgpt', patterns: ['chat.openai.com', 'chatgpt.com'], label: 'ChatGPT', color: '#10B981' },
  { id: 'perplexity', patterns: ['perplexity.ai'], label: 'Perplexity', color: '#3B82F6' },
  { id: 'gemini', patterns: ['gemini.google.com', 'bard.google.com'], label: 'Gemini', color: '#8B5CF6' },
  { id: 'claude', patterns: ['claude.ai'], label: 'Claude', color: '#F59E0B' },
  { id: 'copilot', patterns: ['copilot.microsoft.com', 'bing.com/chat'], label: 'Copilot', color: '#EC4899' },
  { id: 'you', patterns: ['you.com'], label: 'You.com', color: '#06B6D4' },
  { id: 'phind', patterns: ['phind.com'], label: 'Phind', color: '#84CC16' },
  { id: 'kagi', patterns: ['kagi.com'], label: 'Kagi', color: '#EF4444' },
  { id: 'poe', patterns: ['poe.com'], label: 'Poe', color: '#F97316' },
  { id: 'huggingchat', patterns: ['huggingface.co/chat'], label: 'HuggingChat', color: '#A855F7' },
]

/**
 * Classify a referral source as AI or standard
 */
export function classifyReferralSource(source) {
  if (!source) return null
  const s = source.toLowerCase()
  for (const ai of AI_REFERRAL_SOURCES) {
    for (const pattern of ai.patterns) {
      if (s.includes(pattern)) return ai
    }
  }
  return null
}

/* ═══════════════════════════════════════════════════
   GA4 ADMIN API — List Accounts & Properties
   ═══════════════════════════════════════════════════ */

/**
 * List all GA4 accounts accessible to the user
 * @returns {Array<{ name, displayName }>}
 */
export async function listGa4Accounts(accessToken) {
  if (!accessToken) throw new Error('No access token')

  try {
    const data = await googleApiGet(accessToken, `${GA_ADMIN_BASE}/accounts`)
    return (data.accounts || []).map(a => ({
      name: a.name, // "accounts/123456"
      displayName: a.displayName,
    }))
  } catch (err) {
    logger.error('Failed to list GA4 accounts:', err)
    throw err
  }
}

/**
 * List GA4 properties for a given account
 * @param {string} accountName - e.g. "accounts/123456"
 * @returns {Array<{ name, displayName, propertyType, websiteUrl }>}
 */
export async function listGa4Properties(accessToken, accountName) {
  if (!accessToken) throw new Error('No access token')

  try {
    const filter = accountName ? `?filter=parent:${accountName}` : ''
    const data = await googleApiGet(accessToken, `${GA_ADMIN_BASE}/properties${filter}`)
    return (data.properties || []).map(p => ({
      name: p.name, // "properties/123456789"
      displayName: p.displayName,
      propertyType: p.propertyType, // "PROPERTY_TYPE_ORDINARY"
      websiteUrl: p.parent, // Parent account
      industryCategory: p.industryCategory,
      timeZone: p.timeZone,
      currencyCode: p.currencyCode,
    }))
  } catch (err) {
    logger.error('Failed to list GA4 properties:', err)
    throw err
  }
}

/**
 * List ALL GA4 properties across all accounts
 */
export async function listAllGa4Properties(accessToken) {
  if (!accessToken) throw new Error('No access token')

  try {
    // First get all accounts
    const accounts = await listGa4Accounts(accessToken)

    // Then fetch properties for each account
    const allProperties = []
    for (const account of accounts) {
      try {
        const props = await listGa4Properties(accessToken, account.name)
        for (const p of props) {
          allProperties.push({
            ...p,
            accountName: account.displayName,
            accountId: account.name,
          })
        }
      } catch {
        // Skip accounts that fail (might have insufficient permissions)
      }
    }

    return allProperties
  } catch (err) {
    logger.error('Failed to list all GA4 properties:', err)
    throw err
  }
}

/**
 * Extract the numeric property ID from the resource name
 * "properties/123456789" → "123456789"
 */
export function getPropertyId(propertyName) {
  if (!propertyName) return ''
  return propertyName.replace('properties/', '')
}

/* ═══════════════════════════════════════════════════
   GA4 DATA API — Run Reports
   ═══════════════════════════════════════════════════ */

/**
 * Run a GA4 report
 *
 * @param {string} accessToken
 * @param {string} propertyId - numeric ID (e.g. "123456789")
 * @param {object} options
 * @param {string} options.startDate - YYYY-MM-DD or relative (e.g. "28daysAgo")
 * @param {string} options.endDate - YYYY-MM-DD or "today"
 * @param {Array<{name:string}>} options.dimensions
 * @param {Array<{name:string}>} options.metrics
 * @param {number} options.limit
 * @param {Array} options.orderBys
 * @param {object} options.dimensionFilter
 */
export async function runGa4Report(accessToken, propertyId, options = {}) {
  if (!accessToken) throw new Error('No access token')
  if (!propertyId) throw new Error('No property ID')

  const {
    startDate = '28daysAgo',
    endDate = 'today',
    dimensions = [],
    metrics = [],
    limit = 1000,
    orderBys,
    dimensionFilter,
  } = options

  const body = {
    dateRanges: [{ startDate, endDate }],
    dimensions: dimensions.map(d => typeof d === 'string' ? { name: d } : d),
    metrics: metrics.map(m => typeof m === 'string' ? { name: m } : m),
    limit,
  }

  if (orderBys) body.orderBys = orderBys
  if (dimensionFilter) body.dimensionFilter = dimensionFilter

  try {
    const data = await googleApiPost(
      accessToken,
      `${GA_DATA_BASE}/properties/${propertyId}:runReport`,
      body
    )

    // Parse response into easier-to-use format
    const dimHeaders = (data.dimensionHeaders || []).map(h => h.name)
    const metricHeaders = (data.metricHeaders || []).map(h => h.name)

    const rows = (data.rows || []).map(row => {
      const obj = {}
      ;(row.dimensionValues || []).forEach((v, i) => {
        obj[dimHeaders[i]] = v.value
      })
      ;(row.metricValues || []).forEach((v, i) => {
        obj[metricHeaders[i]] = parseFloat(v.value) || 0
      })
      return obj
    })

    return {
      rows,
      dimensionHeaders: dimHeaders,
      metricHeaders,
      rowCount: data.rowCount || rows.length,
      totals: data.totals?.[0] || null,
    }
  } catch (err) {
    logger.error('GA4 report failed:', err)
    throw err
  }
}

/**
 * Get AI referral traffic data from GA4
 *
 * Fetches sessionSource dimension to identify AI-referred sessions.
 */
export async function getAiTrafficReport(accessToken, propertyId, options = {}) {
  const {
    startDate = '28daysAgo',
    endDate = 'today',
  } = options

  const report = await runGa4Report(accessToken, propertyId, {
    startDate,
    endDate,
    dimensions: ['sessionSource'],
    metrics: ['sessions', 'totalUsers', 'screenPageViews', 'averageSessionDuration', 'bounceRate'],
    limit: 500,
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  })

  // Classify each source
  const allRows = report.rows.map(row => {
    const aiSource = classifyReferralSource(row.sessionSource)
    return {
      ...row,
      isAiSource: !!aiSource,
      aiSource,
    }
  })

  const aiRows = allRows.filter(r => r.isAiSource)
  const totalAiSessions = aiRows.reduce((sum, r) => sum + (r.sessions || 0), 0)
  const totalSessions = allRows.reduce((sum, r) => sum + (r.sessions || 0), 0)

  return {
    allRows,
    aiRows,
    totalAiSessions,
    totalSessions,
    aiSessionShare: totalSessions > 0 ? totalAiSessions / totalSessions : 0,
  }
}

/**
 * Get traffic by landing page from AI sources
 */
export async function getAiLandingPages(accessToken, propertyId, options = {}) {
  const {
    startDate = '28daysAgo',
    endDate = 'today',
  } = options

  const report = await runGa4Report(accessToken, propertyId, {
    startDate,
    endDate,
    dimensions: ['sessionSource', 'landingPagePlusQueryString'],
    metrics: ['sessions', 'totalUsers', 'screenPageViews', 'averageSessionDuration'],
    limit: 1000,
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  })

  // Filter to AI sources only
  const aiRows = report.rows.filter(r => classifyReferralSource(r.sessionSource))

  // Group by landing page
  const pageMap = {}
  for (const row of aiRows) {
    const page = row.landingPagePlusQueryString || '(not set)'
    if (!pageMap[page]) {
      pageMap[page] = { page, sessions: 0, users: 0, pageViews: 0, sources: {} }
    }
    pageMap[page].sessions += row.sessions || 0
    pageMap[page].users += row.totalUsers || 0
    pageMap[page].pageViews += row.screenPageViews || 0

    const ai = classifyReferralSource(row.sessionSource)
    if (ai) {
      pageMap[page].sources[ai.id] = (pageMap[page].sources[ai.id] || 0) + (row.sessions || 0)
    }
  }

  return Object.values(pageMap).sort((a, b) => b.sessions - a.sessions)
}

/**
 * Get daily AI traffic trend
 */
export async function getAiTrafficTrend(accessToken, propertyId, options = {}) {
  const {
    startDate = '28daysAgo',
    endDate = 'today',
  } = options

  const report = await runGa4Report(accessToken, propertyId, {
    startDate,
    endDate,
    dimensions: ['date', 'sessionSource'],
    metrics: ['sessions'],
    limit: 10000,
  })

  // Group by date, split AI vs non-AI
  const dateMap = {}
  for (const row of report.rows) {
    const date = row.date // "20240115" format
    if (!dateMap[date]) {
      dateMap[date] = { date, aiSessions: 0, totalSessions: 0, sources: {} }
    }
    const sessions = row.sessions || 0
    dateMap[date].totalSessions += sessions

    const ai = classifyReferralSource(row.sessionSource)
    if (ai) {
      dateMap[date].aiSessions += sessions
      dateMap[date].sources[ai.id] = (dateMap[date].sources[ai.id] || 0) + sessions
    }
  }

  return Object.values(dateMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      ...d,
      // Format date: "20240115" → "2024-01-15"
      dateFormatted: d.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
    }))
}
