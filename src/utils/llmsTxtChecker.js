// src/utils/llmsTxtChecker.js

/**
 * Checks for /llms.txt — the emerging standard for AI-readable site indexes
 * (llmstxt.org). Google states it neither helps nor hurts Google, but adoption
 * is growing, Lighthouse added a check for it, and it costs nothing to have.
 *
 * Also detects Cloudflare from page HTML: since 2025 Cloudflare blocks known
 * AI crawlers by default, so a Cloudflare site may be invisible to AI engines
 * even with a permissive robots.txt.
 */

const CORS_PROXIES = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
]

/**
 * Fetch /llms.txt for a domain.
 * @param {string} url - Any URL from the domain
 * @returns {Promise<{found: boolean, url: string, preview: string|null}>}
 */
export async function checkLlmsTxt(url) {
  const base = new URL(url.startsWith('http') ? url : 'https://' + url)
  const llmsTxtUrl = `${base.protocol}//${base.hostname}/llms.txt`

  let content = null

  // Direct first
  try {
    const res = await fetch(llmsTxtUrl, { signal: AbortSignal.timeout(8000) })
    if (res.ok) content = await res.text()
  } catch { /* continue */ }

  // Proxies
  if (!content) {
    for (const proxyFn of CORS_PROXIES) {
      try {
        const res = await fetch(proxyFn(llmsTxtUrl), { signal: AbortSignal.timeout(10000) })
        if (res.ok) {
          const text = await res.text()
          // llms.txt is markdown starting with an H1; reject HTML error pages
          if (text && !text.trimStart().startsWith('<')) {
            content = text
            break
          }
        }
      } catch { /* try next */ }
    }
  }

  const looksValid = !!content && !content.trimStart().startsWith('<') && content.trim().length > 0

  return {
    found: looksValid,
    url: llmsTxtUrl,
    preview: looksValid ? content.slice(0, 500) : null,
    hasH1: looksValid ? /^#\s+.+/m.test(content) : false,
  }
}

/**
 * Detect Cloudflare from fetched page HTML.
 * Cloudflare-served pages nearly always reference /cdn-cgi/ (email decode,
 * challenge scripts, RUM beacon) even when no challenge is shown.
 * @param {string} html - Raw page HTML
 * @returns {boolean}
 */
export function detectCloudflare(html) {
  if (!html) return false
  return html.includes('/cdn-cgi/') || /cloudflareinsights\.com|__cf\$cv\$params|cf-ray/i.test(html)
}
