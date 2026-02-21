/**
 * Usage Tracker — per-day aggregation of AI API usage.
 *
 * Stores usage data in localStorage with one key per day: `aeo-usage-{YYYY-MM-DD}`
 * Each day's entry: { date, calls, inputTokens, outputTokens, costEstimate, byModel: {} }
 * Auto-prunes entries older than 90 days.
 */
import { estimateCost } from './aiProvider'

const USAGE_KEY_PREFIX = 'aeo-usage-'
const MAX_HISTORY_DAYS = 90

/* ── Helpers ── */

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

function getUsageKey(dateStr) {
  return `${USAGE_KEY_PREFIX}${dateStr}`
}

function readDay(dateStr) {
  try {
    const raw = localStorage.getItem(getUsageKey(dateStr))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeDay(dateStr, data) {
  try {
    localStorage.setItem(getUsageKey(dateStr), JSON.stringify(data))
  } catch {
    // localStorage full — silently ignore
  }
}

function emptyDay(dateStr) {
  return {
    date: dateStr,
    calls: 0,
    inputTokens: 0,
    outputTokens: 0,
    costEstimate: 0,
    byModel: {},
  }
}

/** Prune usage entries older than MAX_HISTORY_DAYS */
function pruneOldEntries() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - MAX_HISTORY_DAYS)
  const cutoffStr = getDateKey(cutoff)

  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(USAGE_KEY_PREFIX)) {
      const dateStr = key.slice(USAGE_KEY_PREFIX.length)
      if (dateStr < cutoffStr) keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
}

/* ── Public API ── */

/**
 * Record a single API call's usage.
 * Called automatically by callAI() — fire-and-forget.
 */
export function trackUsage({ provider, model, inputTokens = 0, outputTokens = 0, durationMs = 0 }) {
  const dateStr = getDateKey()
  const day = readDay(dateStr) || emptyDay(dateStr)

  day.calls += 1
  day.inputTokens += inputTokens
  day.outputTokens += outputTokens

  const callCost = estimateCost(model, inputTokens, outputTokens)
  day.costEstimate += callCost

  // Per-model breakdown
  if (!day.byModel[model]) {
    day.byModel[model] = { calls: 0, inputTokens: 0, outputTokens: 0, costEstimate: 0, provider }
  }
  day.byModel[model].calls += 1
  day.byModel[model].inputTokens += inputTokens
  day.byModel[model].outputTokens += outputTokens
  day.byModel[model].costEstimate += callCost

  writeDay(dateStr, day)

  // Prune old entries occasionally (1 in 10 chance to avoid doing it every call)
  if (Math.random() < 0.1) pruneOldEntries()
}

/** Get today's usage data. */
export function getTodayUsage() {
  const dateStr = getDateKey()
  return readDay(dateStr) || emptyDay(dateStr)
}

/** Get usage history for the last N days. Returns array sorted oldest→newest. */
export function getUsageHistory(days = 30) {
  const history = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = getDateKey(d)
    history.push(readDay(dateStr) || emptyDay(dateStr))
  }

  return history
}

/** Get aggregated usage summary: today, this week, this month. */
export function getUsageSummary() {
  const now = new Date()
  const todayStr = getDateKey(now)
  const today = readDay(todayStr) || emptyDay(todayStr)

  // This week (last 7 days)
  const thisWeek = aggregateDays(7)

  // This month (last 30 days)
  const thisMonth = aggregateDays(30)

  // All time (last 90 days — max stored)
  const allTime = aggregateDays(MAX_HISTORY_DAYS)

  return { today, thisWeek, thisMonth, allTime }
}

/** Aggregate usage over the last N days. */
function aggregateDays(n) {
  const now = new Date()
  const aggregate = {
    calls: 0,
    inputTokens: 0,
    outputTokens: 0,
    costEstimate: 0,
    byModel: {},
  }

  for (let i = 0; i < n; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const day = readDay(getDateKey(d))
    if (!day) continue

    aggregate.calls += day.calls
    aggregate.inputTokens += day.inputTokens
    aggregate.outputTokens += day.outputTokens
    aggregate.costEstimate += day.costEstimate

    // Merge per-model data
    for (const [model, data] of Object.entries(day.byModel || {})) {
      if (!aggregate.byModel[model]) {
        aggregate.byModel[model] = { calls: 0, inputTokens: 0, outputTokens: 0, costEstimate: 0, provider: data.provider }
      }
      aggregate.byModel[model].calls += data.calls
      aggregate.byModel[model].inputTokens += data.inputTokens
      aggregate.byModel[model].outputTokens += data.outputTokens
      aggregate.byModel[model].costEstimate += data.costEstimate
    }
  }

  return aggregate
}

/** Clear all stored usage data. */
export function resetUsage() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(USAGE_KEY_PREFIX)) keysToRemove.push(key)
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
}

/** Format token count for display (e.g., 1234 → "1.2K", 1234567 → "1.2M") */
export function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/** Format cost for display (e.g., 0.0034 → "$0.003", 1.5 → "$1.50") */
export function formatCost(cost) {
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  if (cost < 1) return `$${cost.toFixed(3)}`
  return `$${cost.toFixed(2)}`
}
