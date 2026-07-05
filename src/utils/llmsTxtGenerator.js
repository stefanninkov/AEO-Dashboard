// src/utils/llmsTxtGenerator.js

/**
 * Deterministic llms.txt generator — no AI call needed.
 *
 * llms.txt (llmstxt.org) is a markdown file at the site root that gives
 * AI systems a curated index of the site: an H1 with the site name, a
 * blockquote summary, and H2 sections containing link lists.
 *
 * Format:
 *   # Site Name
 *   > One-paragraph summary of what the site is about.
 *
 *   ## Main
 *   - [Page Title](https://url): short note
 *
 *   ## Optional
 *   - [Secondary page](https://url): short note
 */

/**
 * Build llms.txt content from structured input.
 *
 * @param {Object} input
 * @param {string} input.siteName - Site/company name (H1)
 * @param {string} input.description - One-paragraph summary (blockquote)
 * @param {Array<{title: string, url: string, note?: string}>} input.mainLinks - Primary pages
 * @param {Array<{title: string, url: string, note?: string}>} [input.optionalLinks] - Secondary pages
 * @returns {string} llms.txt markdown content
 */
export function buildLlmsTxt({ siteName, description, mainLinks = [], optionalLinks = [] }) {
  const lines = []

  lines.push(`# ${siteName.trim()}`)
  lines.push('')
  if (description?.trim()) {
    // Blockquote each line of the description
    description.trim().split('\n').forEach(l => lines.push(`> ${l.trim()}`))
    lines.push('')
  }

  if (mainLinks.length > 0) {
    lines.push('## Main')
    lines.push('')
    mainLinks.forEach(link => lines.push(formatLink(link)))
    lines.push('')
  }

  if (optionalLinks.length > 0) {
    lines.push('## Optional')
    lines.push('')
    optionalLinks.forEach(link => lines.push(formatLink(link)))
    lines.push('')
  }

  return lines.join('\n')
}

function formatLink({ title, url, note }) {
  const base = `- [${title.trim()}](${url.trim()})`
  return note?.trim() ? `${base}: ${note.trim()}` : base
}

/**
 * Parse a plain-text page list into link objects.
 * Accepts one link per line in the form:
 *   Title | https://url | optional note
 * or just a bare URL.
 *
 * @param {string} text
 * @returns {Array<{title: string, url: string, note?: string}>}
 */
export function parseLinkLines(text) {
  if (!text?.trim()) return []
  return text.split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('|').map(p => p.trim())
      if (parts.length >= 2) {
        return { title: parts[0], url: parts[1], note: parts[2] || '' }
      }
      // Bare URL — derive a title from the path
      const url = parts[0]
      try {
        const u = new URL(url.startsWith('http') ? url : 'https://' + url)
        const slug = u.pathname.split('/').filter(Boolean).pop() || u.hostname
        const title = slug.replace(/[-_]/g, ' ').replace(/\.\w+$/, '').replace(/\b\w/g, c => c.toUpperCase())
        return { title, url: u.href, note: '' }
      } catch {
        return { title: url, url, note: '' }
      }
    })
    .filter(l => l.url)
}
