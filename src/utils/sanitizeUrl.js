/**
 * URL sanitization utilities.
 * Prevents javascript:, data:, vbscript: and other dangerous protocol injection.
 */

const SAFE_PROTOCOLS = ['https:', 'http:', 'mailto:']

/**
 * Returns true if the URL uses a safe protocol.
 * Rejects javascript:, data:, vbscript:, file:, ftp:, etc.
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url, window.location.origin)
    return SAFE_PROTOCOLS.includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Returns the URL if safe, otherwise returns '#'.
 * Use as: <a href={safeHref(url)}>
 */
export function safeHref(url) {
  return isSafeUrl(url) ? url : '#'
}

/**
 * Validates a webhook URL: must be HTTPS and not target private/reserved IPs.
 * Returns { valid: boolean, reason?: string }
 */
export function isValidWebhookUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, reason: 'URL is required' }
  }

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, reason: 'Invalid URL format' }
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Webhook URL must use HTTPS' }
  }

  if (isPrivateHostname(parsed.hostname)) {
    return { valid: false, reason: 'Webhook URL must not target private addresses' }
  }

  return { valid: true }
}

function isPrivateHostname(hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true
  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return true

  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number)
    if (a === 10) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true
    if (a === 0) return true
    if (a === 127) return true
  }

  return false
}
