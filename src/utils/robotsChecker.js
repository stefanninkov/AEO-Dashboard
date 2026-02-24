// src/utils/robotsChecker.js

/**
 * Checks robots.txt for AI crawler access permissions.
 * This is a critical AEO check — if AI crawlers are blocked,
 * the site is invisible to AI search engines.
 */

const AI_CRAWLERS = [
  { id: 'gptbot', name: 'GPTBot', engine: 'ChatGPT / OpenAI', docs: 'https://platform.openai.com/docs/gptbot' },
  { id: 'chatgpt-user', name: 'ChatGPT-User', engine: 'ChatGPT browsing', docs: 'https://platform.openai.com/docs/plugins/bot' },
  { id: 'google-extended', name: 'Google-Extended', engine: 'Gemini / Google AI', docs: 'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers' },
  { id: 'perplexitybot', name: 'PerplexityBot', engine: 'Perplexity', docs: 'https://docs.perplexity.ai/guides/bots' },
  { id: 'claudebot', name: 'ClaudeBot', engine: 'Claude / Anthropic', docs: 'https://docs.anthropic.com/en/docs/claude-ai-bot' },
  { id: 'anthropic-ai', name: 'anthropic-ai', engine: 'Anthropic training', docs: 'https://docs.anthropic.com/en/docs/claude-ai-bot' },
  { id: 'ccbot', name: 'CCBot', engine: 'Common Crawl (training data)', docs: 'https://commoncrawl.org/ccbot' },
  { id: 'bytespider', name: 'Bytespider', engine: 'TikTok / Doubao', docs: null },
  { id: 'cohere-ai', name: 'cohere-ai', engine: 'Cohere', docs: null },
  { id: 'diffbot', name: 'Diffbot', engine: 'Diffbot (knowledge graph)', docs: null },
]

/**
 * Fetch and parse robots.txt for a domain
 * @param {string} url - Any URL from the domain
 * @returns {Promise<Object>} Parsed robots.txt data
 */
export async function checkRobotsTxt(url) {
  const base = new URL(url.startsWith('http') ? url : 'https://' + url)
  const robotsUrl = `${base.protocol}//${base.hostname}/robots.txt`

  let robotsTxt = null

  // Try fetching robots.txt (same CORS proxy strategy as htmlCrawler)
  const CORS_PROXIES = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ]

  // Direct first
  try {
    const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(8000) })
    if (res.ok) robotsTxt = await res.text()
  } catch { /* continue */ }

  // Proxies
  if (!robotsTxt) {
    for (const proxyFn of CORS_PROXIES) {
      try {
        const res = await fetch(proxyFn(robotsUrl), { signal: AbortSignal.timeout(10000) })
        if (res.ok) {
          const text = await res.text()
          if (text.includes('User-agent') || text.includes('user-agent') || text.includes('Disallow') || text.includes('Allow')) {
            robotsTxt = text
            break
          }
        }
      } catch { /* try next */ }
    }
  }

  if (!robotsTxt) {
    return {
      found: false,
      error: 'Could not fetch robots.txt',
      crawlers: AI_CRAWLERS.map(c => ({ ...c, status: 'unknown', reason: 'robots.txt not accessible' })),
      sitemaps: [],
    }
  }

  // Parse robots.txt
  const rules = parseRobotsTxt(robotsTxt)

  // Check each AI crawler
  const crawlerResults = AI_CRAWLERS.map(crawler => {
    const status = getCrawlerAccess(rules, crawler.id, crawler.name)
    return { ...crawler, ...status }
  })

  // Extract sitemaps
  const sitemaps = []
  const sitemapMatches = robotsTxt.match(/^Sitemap:\s*(.+)$/gmi)
  if (sitemapMatches) {
    sitemapMatches.forEach(line => {
      const sitemapUrl = line.replace(/^Sitemap:\s*/i, '').trim()
      if (sitemapUrl) sitemaps.push(sitemapUrl)
    })
  }

  const allowedCount = crawlerResults.filter(c => c.status === 'allowed').length
  const blockedCount = crawlerResults.filter(c => c.status === 'blocked').length

  return {
    found: true,
    raw: robotsTxt,
    crawlers: crawlerResults,
    sitemaps,
    summary: {
      total: crawlerResults.length,
      allowed: allowedCount,
      blocked: blockedCount,
      unknown: crawlerResults.length - allowedCount - blockedCount,
    },
  }
}

function parseRobotsTxt(txt) {
  const rules = {} // userAgent -> { allow: [], disallow: [] }
  let currentAgents = []

  txt.split('\n').forEach(line => {
    line = line.replace(/#.*$/, '').trim()
    if (!line) return

    const match = line.match(/^(User-agent|Disallow|Allow):\s*(.*)$/i)
    if (!match) return

    const directive = match[1].toLowerCase()
    const value = match[2].trim()

    if (directive === 'user-agent') {
      currentAgents = [value.toLowerCase()]
      if (!rules[value.toLowerCase()]) {
        rules[value.toLowerCase()] = { allow: [], disallow: [] }
      }
    } else if (directive === 'disallow' && currentAgents.length > 0) {
      currentAgents.forEach(agent => {
        if (!rules[agent]) rules[agent] = { allow: [], disallow: [] }
        rules[agent].disallow.push(value)
      })
    } else if (directive === 'allow' && currentAgents.length > 0) {
      currentAgents.forEach(agent => {
        if (!rules[agent]) rules[agent] = { allow: [], disallow: [] }
        rules[agent].allow.push(value)
      })
    }
  })

  return rules
}

function getCrawlerAccess(rules, crawlerId, crawlerName) {
  const agentKey = crawlerName.toLowerCase()

  // Check specific rules for this bot
  const specificRules = rules[agentKey]
  if (specificRules) {
    // If "Disallow: /" is present with no "Allow:" overrides -> blocked
    if (specificRules.disallow.includes('/') && specificRules.allow.length === 0) {
      return { status: 'blocked', reason: `Explicitly blocked by User-agent: ${crawlerName}` }
    }
    if (specificRules.disallow.includes('/')) {
      return { status: 'partial', reason: 'Blocked with some Allow exceptions' }
    }
    if (specificRules.disallow.length === 0 || (specificRules.disallow.length === 1 && specificRules.disallow[0] === '')) {
      return { status: 'allowed', reason: `Explicitly allowed by User-agent: ${crawlerName}` }
    }
    return { status: 'partial', reason: `Some paths blocked for ${crawlerName}` }
  }

  // Check wildcard rules
  const wildcardRules = rules['*']
  if (wildcardRules) {
    if (wildcardRules.disallow.includes('/') && wildcardRules.allow.length === 0) {
      return { status: 'blocked', reason: 'Blocked by User-agent: * (no specific override)' }
    }
    if (wildcardRules.disallow.length === 0 || (wildcardRules.disallow.length === 1 && wildcardRules.disallow[0] === '')) {
      return { status: 'allowed', reason: 'Allowed by default (no restrictions)' }
    }
  }

  // No rules at all -> allowed by default
  return { status: 'allowed', reason: 'No restrictions found (allowed by default)' }
}

export { AI_CRAWLERS }
