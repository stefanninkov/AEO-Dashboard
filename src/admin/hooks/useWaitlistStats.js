/**
 * useWaitlistStats — Aggregates all waitlist data for admin analytics.
 *
 * Fetches waitlist collection, computes histogram, funnels, averages,
 * breakdowns, trends, and metadata distributions.
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { CATEGORIES, SCORE_TIERS, getScoreTier, getLeadTier } from '../../utils/scorecardScoring'
import logger from '../../utils/logger'

/* ── Helpers ── */

function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function average(arr) {
  if (arr.length === 0) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function countBy(arr, keyFn) {
  const map = {}
  arr.forEach(item => {
    const key = keyFn(item) || 'unknown'
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

function groupByDay(items, dateFn, days = 30) {
  const now = new Date()
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    result.push({ date: key, count: 0 })
  }
  items.forEach(item => {
    const date = dateFn(item)
    if (!date) return
    const key = date.toISOString().split('T')[0]
    const entry = result.find(r => r.date === key)
    if (entry) entry.count++
  })
  return result
}

function groupByTimeOfDay(items, dateFn) {
  const buckets = [
    { name: 'Morning (6-12)', count: 0 },
    { name: 'Afternoon (12-18)', count: 0 },
    { name: 'Evening (18-24)', count: 0 },
    { name: 'Night (0-6)', count: 0 },
  ]
  items.forEach(item => {
    const date = dateFn(item)
    if (!date) return
    const h = date.getHours()
    if (h >= 6 && h < 12) buckets[0].count++
    else if (h >= 12 && h < 18) buckets[1].count++
    else if (h >= 18) buckets[2].count++
    else buckets[3].count++
  })
  return buckets
}

/* Score tier colors for histogram */
const TIER_COLORS = {
  invisible: '#EF4444',
  starting: '#F59E0B',
  onTrack: '#3B82F6',
  aiReady: '#10B981',
}

function getScoreBinTier(rangeStart) {
  if (rangeStart <= 5) return 'invisible'
  if (rangeStart <= 10) return 'invisible'
  if (rangeStart <= 15) return 'starting'
  if (rangeStart <= 20) return 'starting'
  if (rangeStart <= 25) return 'onTrack'
  if (rangeStart <= 30) return 'aiReady'
  return 'aiReady'
}

/* ── Hook ── */

export function useWaitlistStats() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const snap = await getDocs(query(collection(db, 'waitlist'), orderBy('signedUpAt', 'desc')))
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setLeads(items)
    } catch (err) {
      logger.error('Failed to fetch waitlist stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const stats = useMemo(() => {
    if (leads.length === 0) return emptyStats()

    const total = leads.length
    const completed = leads.filter(l => l.scorecard?.completed)
    const abandoned = leads.filter(l => !l.scorecard?.completed && l.scorecard?.abandonedAtStep != null)
    const notStarted = leads.filter(l => !l.scorecard?.completed && l.scorecard?.abandonedAtStep == null)
    const completedCount = completed.length
    const abandonedCount = abandoned.length
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0

    // Scores
    const scores = completed.map(l => l.scorecard.totalScore).filter(s => s != null)
    const avgScore = scores.length > 0 ? Math.round(average(scores) * 10) / 10 : 0
    const avgScoreTier = getScoreTier(Math.round(avgScore))

    // Lead tiers
    const hot = completed.filter(l => l.leadTier === 'hot')
    const warm = completed.filter(l => l.leadTier === 'warm')
    const cold = completed.filter(l => l.leadTier === 'cold')
    const hotNotInvited = hot.filter(l => !l.invited)

    // Score distribution histogram
    const bins = [
      { range: '0-5', min: 0, max: 5 },
      { range: '6-10', min: 6, max: 10 },
      { range: '11-15', min: 11, max: 15 },
      { range: '16-20', min: 16, max: 20 },
      { range: '21-25', min: 21, max: 25 },
      { range: '26-30', min: 26, max: 30 },
      { range: '31-33', min: 31, max: 33 },
    ]
    const scoreDistribution = bins.map(bin => {
      const count = scores.filter(s => s >= bin.min && s <= bin.max).length
      const tierId = getScoreBinTier(bin.min)
      return { range: bin.range, count, color: TIER_COLORS[tierId], tier: tierId }
    })

    // Tier distribution
    const tierDistribution = SCORE_TIERS.map(tier => ({
      name: tier.label,
      id: tier.id,
      count: completed.filter(l => l.scorecard?.tier === tier.id).length,
      color: tier.color,
    }))

    // Lead tier distribution (for donut)
    const leadTierDistribution = [
      { name: 'Hot', count: hot.length, color: '#EF4444' },
      { name: 'Warm', count: warm.length, color: '#F59E0B' },
      { name: 'Cold', count: cold.length, color: '#6B7280' },
    ]

    // Average category scores
    const avgCategoryScores = CATEGORIES.map(cat => {
      const catScores = completed
        .map(l => l.scorecard?.categoryScores?.[cat.id])
        .filter(s => s != null)
      return {
        id: cat.id,
        color: cat.color,
        maxScore: cat.maxScore,
        avgScore: catScores.length > 0 ? Math.round(average(catScores) * 10) / 10 : 0,
        pct: catScores.length > 0 ? Math.round((average(catScores) / cat.maxScore) * 100) : 0,
      }
    }).sort((a, b) => a.pct - b.pct) // weakest first

    // Qualification breakdowns
    const byRole = countBy(completed, l => l.qualification?.role)
    const byWebsiteCount = countBy(completed, l => l.qualification?.websiteCount)
    const byTimeline = countBy(completed, l => l.qualification?.timeline)

    // Conversion funnel
    const invited = leads.filter(l => l.invited)
    const converted = leads.filter(l => l.converted)
    const funnel = [
      { label: 'Started Quiz', count: total },
      { label: 'Completed Quiz', count: completedCount },
      { label: 'Hot Leads', count: hot.length },
      { label: 'Invited', count: invited.length },
      { label: 'Converted', count: converted.length },
    ]

    // Abandonment by step
    const abandonmentByStep = []
    abandoned.forEach(l => {
      const step = l.scorecard?.abandonedAtStep
      if (step == null) return
      const existing = abandonmentByStep.find(s => s.step === step)
      if (existing) existing.count++
      else abandonmentByStep.push({ step, count: 1 })
    })
    abandonmentByStep.sort((a, b) => a.step - b.step)
    const totalAbandonment = abandoned.length
    const abandonmentRate = total > 0 ? Math.round((totalAbandonment / total) * 100) : 0

    // Capture abandonment (step 0 = didn't start quiz but had a doc = signups that never entered)
    const captureAbandonment = notStarted.length

    // Signup trend (last 30 days)
    const signupsByDay = groupByDay(leads, l => toDate(l.signedUpAt))

    // Metadata
    const byLanguage = countBy(leads, l => l.language || 'unknown')
    const byDevice = countBy(leads, l => {
      const screenSize = l.screenSize || ''
      const width = parseInt(screenSize.split('x')[0], 10)
      return width >= 768 ? 'Desktop' : 'Mobile'
    })
    const byTimeOfDay = groupByTimeOfDay(leads, l => toDate(l.signedUpAt))

    // Today stats
    const now = Date.now()
    const dayAgo = now - 24 * 60 * 60 * 1000
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const today = leads.filter(l => {
      const d = toDate(l.signedUpAt)
      return d && d.getTime() > dayAgo
    }).length
    const thisWeek = leads.filter(l => {
      const d = toDate(l.signedUpAt)
      return d && d.getTime() > weekAgo
    }).length

    return {
      total, completedCount, abandonedCount, completionRate, avgScore, avgScoreTier,
      hotLeads: hot, warmLeads: warm, coldLeads: cold, hotNotInvited,
      scoreDistribution, tierDistribution, leadTierDistribution,
      avgCategoryScores,
      byRole, byWebsiteCount, byTimeline,
      funnel,
      abandonmentByStep, totalAbandonment, abandonmentRate, captureAbandonment,
      signupsByDay,
      byLanguage, byDevice, byTimeOfDay,
      today, thisWeek,
    }
  }, [leads])

  return { leads, loading, error, refresh: fetchLeads, ...stats }
}

function emptyStats() {
  return {
    total: 0, completedCount: 0, abandonedCount: 0, completionRate: 0, avgScore: 0, avgScoreTier: null,
    hotLeads: [], warmLeads: [], coldLeads: [], hotNotInvited: [],
    scoreDistribution: [], tierDistribution: [], leadTierDistribution: [],
    avgCategoryScores: [],
    byRole: [], byWebsiteCount: [], byTimeline: [],
    funnel: [],
    abandonmentByStep: [], totalAbandonment: 0, abandonmentRate: 0, captureAbandonment: 0,
    signupsByDay: [],
    byLanguage: [], byDevice: [], byTimeOfDay: [],
    today: 0, thisWeek: 0,
  }
}
