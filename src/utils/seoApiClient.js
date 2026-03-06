/**
 * seoApiClient — Unified client for SEO API providers (SEMrush, Ahrefs, Moz).
 *
 * Architecture:
 *   1. Check Zustand store for API keys
 *   2. If key found, call the provider directly
 *   3. If no key, fall back to AI-powered analysis
 *   4. Cache results via dataCache
 *   5. Rate-limit API calls per provider
 *
 * Provider support:
 *   - SEMrush: Domain analytics, keyword research, backlinks
 *   - Ahrefs: Domain rating, backlink analysis, organic keywords
 *   - Moz: Domain authority, page authority, spam score
 *   - AI fallback: Uses aiProvider for estimated analysis
 */

import { cacheKey, getCache, setCache } from './dataCache'
import { callAI } from './apiClient'
import { hasApiKey as hasAiApiKey } from './aiProvider'
import logger from './logger'

// ── Rate Limiting ──
const rateLimits = {
  semrush: { maxPerMinute: 10, calls: [], resetMs: 60000 },
  ahrefs: { maxPerMinute: 7, calls: [], resetMs: 60000 },
  moz: { maxPerMinute: 10, calls: [], resetMs: 60000 },
}

function checkRateLimit(provider) {
  const limit = rateLimits[provider]
  if (!limit) return true
  const now = Date.now()
  limit.calls = limit.calls.filter((t) => now - t < limit.resetMs)
  if (limit.calls.length >= limit.maxPerMinute) return false
  limit.calls.push(now)
  return true
}

// ── Cache TTLs ──
const CACHE_TTL = {
  domainOverview: 60 * 60 * 1000,   // 1 hour
  keywords: 30 * 60 * 1000,          // 30 minutes
  backlinks: 60 * 60 * 1000,         // 1 hour
  competitors: 60 * 60 * 1000,       // 1 hour
}

/**
 * Get API keys from the Zustand store.
 * Lazy import to avoid circular deps.
 */
function getApiKeys() {
  try {
    const { useSeoStore } = require('../stores/useSeoStore')
    return useSeoStore.getState().apiKeys
  } catch {
    return { semrush: '', ahrefs: '', moz: '' }
  }
}

// ── Provider Implementations ──

/**
 * SEMrush API client
 */
async function semrushRequest(endpoint, params, apiKey) {
  const searchParams = new URLSearchParams({
    ...params,
    key: apiKey,
    export_columns: params.export_columns || '',
  })
  const url = `https://api.semrush.com/${endpoint}?${searchParams}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`SEMrush API error: ${response.status}`)
  const text = await response.text()
  return parseSemrushResponse(text)
}

function parseSemrushResponse(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(';')
  return lines.slice(1).map((line) => {
    const values = line.split(';')
    const obj = {}
    headers.forEach((h, i) => { obj[h] = values[i] || '' })
    return obj
  })
}

/**
 * Ahrefs API client
 */
async function ahrefsRequest(endpoint, params, apiKey) {
  const searchParams = new URLSearchParams({
    ...params,
    token: apiKey,
    output: 'json',
  })
  const url = `https://apiv2.ahrefs.com?${searchParams}&from=${endpoint}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Ahrefs API error: ${response.status}`)
  return response.json()
}

/**
 * Moz API client
 */
async function mozRequest(endpoint, params, apiKey) {
  const response = await fetch(`https://lsapi.seomoz.com/v2/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(apiKey)}`,
    },
    body: JSON.stringify(params),
  })
  if (!response.ok) throw new Error(`Moz API error: ${response.status}`)
  return response.json()
}

// ── AI Fallback ──

async function aiAnalysis(domain, type) {
  if (!hasAiApiKey()) return null

  const prompts = {
    domainOverview: `Analyze the domain "${domain}" and estimate its SEO metrics. Return ONLY valid JSON:
{
  "domainAuthority": <0-100>,
  "organicTraffic": <estimated monthly organic traffic>,
  "organicKeywords": <estimated number of ranking keywords>,
  "backlinks": <estimated number of backlinks>,
  "referringDomains": <estimated number of referring domains>,
  "topKeywords": [{"keyword": "...", "position": <1-100>, "volume": <monthly volume>}],
  "competitors": [{"domain": "...", "commonKeywords": <number>, "similarity": <0-100>}],
  "confidence": "low"
}`,
    keywords: `Research the top organic keywords for "${domain}". Return ONLY valid JSON:
{
  "keywords": [
    {"keyword": "...", "position": <1-100>, "volume": <monthly volume>, "difficulty": <0-100>, "cpc": <cost per click>}
  ],
  "totalKeywords": <estimated total>,
  "confidence": "low"
}`,
    backlinks: `Estimate the backlink profile for "${domain}". Return ONLY valid JSON:
{
  "totalBacklinks": <estimated count>,
  "referringDomains": <estimated count>,
  "domainRating": <0-100>,
  "topBacklinks": [{"source": "...", "anchor": "...", "type": "dofollow|nofollow"}],
  "confidence": "low"
}`,
  }

  const prompt = prompts[type]
  if (!prompt) return null

  try {
    const result = await callAI({
      maxTokens: 2000,
      messages: [{ role: 'user', content: prompt }],
      extraBody: {
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      },
    })
    const clean = result.text.replace(/```json\s?|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch (err) {
    logger.error('AI fallback analysis error:', err)
  }
  return null
}

// ── Public API ──

/**
 * Get domain overview — domain authority, traffic, keywords, backlinks.
 */
export async function getDomainOverview(domain) {
  const key = cacheKey('seo-domain', domain)
  const cached = getCache(key, CACHE_TTL.domainOverview)
  if (!cached.isMiss && !cached.isStale) return cached.data

  const apiKeys = getApiKeys()
  let result = null

  // Try SEMrush
  if (apiKeys.semrush && checkRateLimit('semrush')) {
    try {
      const data = await semrushRequest('', {
        type: 'domain_ranks',
        domain,
        export_columns: 'Or,Ot,Oc,Ad,At',
      }, apiKeys.semrush)
      if (data?.length) {
        result = {
          source: 'semrush',
          organicTraffic: parseInt(data[0].Ot) || 0,
          organicKeywords: parseInt(data[0].Or) || 0,
          adwordsKeywords: parseInt(data[0].Ad) || 0,
          confidence: 'high',
        }
      }
    } catch (err) {
      logger.warn('SEMrush domain overview error:', err.message)
    }
  }

  // Try Ahrefs
  if (!result && apiKeys.ahrefs && checkRateLimit('ahrefs')) {
    try {
      const data = await ahrefsRequest('domain_rating', {
        target: domain,
        mode: 'domain',
      }, apiKeys.ahrefs)
      if (data) {
        result = {
          source: 'ahrefs',
          domainRating: data.domain_rating || 0,
          backlinks: data.backlinks || 0,
          referringDomains: data.refdomains || 0,
          confidence: 'high',
        }
      }
    } catch (err) {
      logger.warn('Ahrefs domain overview error:', err.message)
    }
  }

  // Try Moz
  if (!result && apiKeys.moz && checkRateLimit('moz')) {
    try {
      const data = await mozRequest('url_metrics', {
        targets: [domain],
      }, apiKeys.moz)
      if (data?.results?.length) {
        const m = data.results[0]
        result = {
          source: 'moz',
          domainAuthority: m.domain_authority || 0,
          pageAuthority: m.page_authority || 0,
          spamScore: m.spam_score || 0,
          linkingDomains: m.root_domains_to_root_domain || 0,
          confidence: 'high',
        }
      }
    } catch (err) {
      logger.warn('Moz domain overview error:', err.message)
    }
  }

  // AI fallback
  if (!result) {
    result = await aiAnalysis(domain, 'domainOverview')
  }

  // Return stale data if API call also failed
  if (!result && cached.data) return cached.data
  if (!result) return null

  setCache(key, result)
  return result
}

/**
 * Get keyword data for a domain.
 */
export async function getKeywordData(domain) {
  const key = cacheKey('seo-keywords', domain)
  const cached = getCache(key, CACHE_TTL.keywords)
  if (!cached.isMiss && !cached.isStale) return cached.data

  const apiKeys = getApiKeys()
  let result = null

  if (apiKeys.semrush && checkRateLimit('semrush')) {
    try {
      const data = await semrushRequest('', {
        type: 'domain_organic',
        domain,
        display_limit: 20,
        export_columns: 'Ph,Po,Nq,Kd,Cp',
      }, apiKeys.semrush)
      if (data?.length) {
        result = {
          source: 'semrush',
          keywords: data.map((d) => ({
            keyword: d.Ph,
            position: parseInt(d.Po) || 0,
            volume: parseInt(d.Nq) || 0,
            difficulty: parseInt(d.Kd) || 0,
            cpc: parseFloat(d.Cp) || 0,
          })),
          confidence: 'high',
        }
      }
    } catch (err) {
      logger.warn('SEMrush keywords error:', err.message)
    }
  }

  if (!result) {
    result = await aiAnalysis(domain, 'keywords')
  }

  if (!result && cached.data) return cached.data
  if (!result) return null

  setCache(key, result)
  return result
}

/**
 * Get backlink data for a domain.
 */
export async function getBacklinkData(domain) {
  const key = cacheKey('seo-backlinks', domain)
  const cached = getCache(key, CACHE_TTL.backlinks)
  if (!cached.isMiss && !cached.isStale) return cached.data

  const apiKeys = getApiKeys()
  let result = null

  if (apiKeys.ahrefs && checkRateLimit('ahrefs')) {
    try {
      const data = await ahrefsRequest('backlinks', {
        target: domain,
        mode: 'domain',
        limit: 20,
      }, apiKeys.ahrefs)
      if (data) {
        result = {
          source: 'ahrefs',
          totalBacklinks: data.stats?.total || 0,
          referringDomains: data.stats?.refdomains || 0,
          backlinks: (data.backlinks || []).map((b) => ({
            source: b.url_from,
            anchor: b.anchor,
            type: b.nofollow ? 'nofollow' : 'dofollow',
            domainRating: b.domain_rating || 0,
          })),
          confidence: 'high',
        }
      }
    } catch (err) {
      logger.warn('Ahrefs backlinks error:', err.message)
    }
  }

  if (!result) {
    result = await aiAnalysis(domain, 'backlinks')
  }

  if (!result && cached.data) return cached.data
  if (!result) return null

  setCache(key, result)
  return result
}

/**
 * Check which API providers are configured and available.
 */
export function getAvailableProviders() {
  const apiKeys = getApiKeys()
  return {
    semrush: !!apiKeys.semrush,
    ahrefs: !!apiKeys.ahrefs,
    moz: !!apiKeys.moz,
    ai: hasAiApiKey(),
    any: !!apiKeys.semrush || !!apiKeys.ahrefs || !!apiKeys.moz || hasAiApiKey(),
  }
}

/**
 * Get provider status (rate limit info, connectivity).
 */
export function getProviderStatus() {
  const apiKeys = getApiKeys()
  return Object.entries(rateLimits).map(([name, limit]) => ({
    name,
    configured: !!apiKeys[name],
    callsInLastMinute: limit.calls.filter((t) => Date.now() - t < limit.resetMs).length,
    maxPerMinute: limit.maxPerMinute,
    available: !!apiKeys[name] && checkRateLimit(name),
  }))
}
