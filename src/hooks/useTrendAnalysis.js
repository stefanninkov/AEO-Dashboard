import { useMemo } from 'react'

/**
 * useTrendAnalysis — Advanced trend detection and forecasting from metrics history.
 *
 * Analyzes project.metricsHistory for:
 *  - Direction detection (improving, declining, stable, volatile)
 *  - Momentum (acceleration/deceleration)
 *  - Anomaly detection (spikes, drops)
 *  - Simple linear forecast
 *
 * @param {Object} options
 * @param {Object} options.activeProject
 * @param {number} [options.lookback=30] - Number of snapshots to analyze
 */
export function useTrendAnalysis({ activeProject, lookback = 30 }) {
  const history = useMemo(() => {
    const raw = activeProject?.metricsHistory || []
    return raw.slice(-lookback)
  }, [activeProject?.metricsHistory, lookback])

  // Core metric trends
  const trends = useMemo(() => {
    if (history.length < 2) return null

    const scores = history.map(h => h.overallScore ?? 0)
    const citations = history.map(h => h.citations?.total ?? 0)
    const prompts = history.map(h => h.prompts?.total ?? 0)

    return {
      score: analyzeSeries(scores, 'AEO Score'),
      citations: analyzeSeries(citations, 'Citations'),
      prompts: analyzeSeries(prompts, 'Prompts'),
    }
  }, [history])

  // Anomalies (values > 2 std devs from mean)
  const anomalies = useMemo(() => {
    if (history.length < 5) return []

    const results = []
    const scores = history.map(h => h.overallScore ?? 0)
    const mean = avg(scores)
    const std = stdDev(scores, mean)

    if (std === 0) return []

    history.forEach((h, i) => {
      const score = h.overallScore ?? 0
      const zScore = Math.abs(score - mean) / std
      if (zScore > 2) {
        results.push({
          index: i,
          timestamp: h.timestamp,
          metric: 'overallScore',
          value: score,
          expected: Math.round(mean),
          deviation: Math.round(zScore * 10) / 10,
          type: score > mean ? 'spike' : 'drop',
        })
      }
    })
    return results
  }, [history])

  // Period-over-period comparison
  const periodComparison = useMemo(() => {
    if (history.length < 4) return null

    const mid = Math.floor(history.length / 2)
    const firstHalf = history.slice(0, mid)
    const secondHalf = history.slice(mid)

    const firstScores = firstHalf.map(h => h.overallScore ?? 0)
    const secondScores = secondHalf.map(h => h.overallScore ?? 0)

    const firstCitations = firstHalf.map(h => h.citations?.total ?? 0)
    const secondCitations = secondHalf.map(h => h.citations?.total ?? 0)

    return {
      score: {
        previous: Math.round(avg(firstScores)),
        current: Math.round(avg(secondScores)),
        change: Math.round(avg(secondScores) - avg(firstScores)),
      },
      citations: {
        previous: Math.round(avg(firstCitations)),
        current: Math.round(avg(secondCitations)),
        change: Math.round(avg(secondCitations) - avg(firstCitations)),
      },
      periodLength: mid,
    }
  }, [history])

  // Simple linear forecast (next 7 data points)
  const forecast = useMemo(() => {
    if (history.length < 5) return null

    const scores = history.map(h => h.overallScore ?? 0)
    const { slope, intercept } = linearRegression(scores)

    const n = scores.length
    const predictions = []
    for (let i = 1; i <= 7; i++) {
      const predicted = Math.round(Math.max(0, Math.min(100, slope * (n + i) + intercept)))
      predictions.push({
        index: n + i,
        value: predicted,
        label: `+${i}`,
      })
    }

    return {
      predictions,
      slope: Math.round(slope * 100) / 100,
      direction: slope > 0.5 ? 'improving' : slope < -0.5 ? 'declining' : 'stable',
      confidence: history.length >= 14 ? 'moderate' : 'low',
    }
  }, [history])

  // Summary insights (human-readable)
  const insights = useMemo(() => {
    const items = []
    if (!trends) return items

    if (trends.score.direction === 'improving') {
      items.push({ type: 'positive', text: `AEO score trending upward (${trends.score.momentum})` })
    } else if (trends.score.direction === 'declining') {
      items.push({ type: 'negative', text: `AEO score declining — ${trends.score.momentum} momentum` })
    } else if (trends.score.direction === 'volatile') {
      items.push({ type: 'warning', text: 'AEO score showing high volatility' })
    }

    if (trends.citations.direction === 'improving') {
      items.push({ type: 'positive', text: `Citations growing (avg ${trends.citations.avgChange > 0 ? '+' : ''}${trends.citations.avgChange} per period)` })
    }

    if (anomalies.length > 0) {
      const recent = anomalies.filter(a => a.index >= history.length - 5)
      if (recent.length > 0) {
        items.push({ type: 'warning', text: `${recent.length} anomal${recent.length > 1 ? 'ies' : 'y'} detected in recent data` })
      }
    }

    if (forecast?.direction === 'improving') {
      items.push({ type: 'positive', text: `Forecast: score trending toward ${forecast.predictions[6]?.value}% (${forecast.confidence} confidence)` })
    } else if (forecast?.direction === 'declining') {
      items.push({ type: 'negative', text: `Forecast: score may drop to ${forecast.predictions[6]?.value}% without intervention` })
    }

    if (periodComparison?.score.change > 5) {
      items.push({ type: 'positive', text: `Score improved ${periodComparison.score.change} pts vs previous period` })
    } else if (periodComparison?.score.change < -5) {
      items.push({ type: 'negative', text: `Score dropped ${Math.abs(periodComparison.score.change)} pts vs previous period` })
    }

    return items
  }, [trends, anomalies, forecast, periodComparison, history.length])

  return {
    trends,
    anomalies,
    periodComparison,
    forecast,
    insights,
    historyLength: history.length,
  }
}

// ── Statistical helpers ──

function avg(arr) {
  if (arr.length === 0) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function stdDev(arr, mean) {
  if (arr.length < 2) return 0
  const m = mean ?? avg(arr)
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length
  return Math.sqrt(variance)
}

function linearRegression(values) {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] || 0 }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }

  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: avg(values) }

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

function analyzeSeries(values, label) {
  if (values.length < 2) {
    return { label, direction: 'stable', momentum: 'none', avgChange: 0, volatility: 0 }
  }

  // Calculate changes
  const changes = []
  for (let i = 1; i < values.length; i++) {
    changes.push(values[i] - values[i - 1])
  }

  const avgChange = Math.round(avg(changes) * 10) / 10
  const volatility = Math.round(stdDev(changes) * 10) / 10

  // Direction
  const positiveChanges = changes.filter(c => c > 0).length
  const ratio = positiveChanges / changes.length

  let direction
  if (volatility > Math.abs(avgChange) * 2 && volatility > 5) {
    direction = 'volatile'
  } else if (ratio > 0.6 && avgChange > 0) {
    direction = 'improving'
  } else if (ratio < 0.4 && avgChange < 0) {
    direction = 'declining'
  } else {
    direction = 'stable'
  }

  // Momentum (acceleration)
  let momentum = 'steady'
  if (changes.length >= 4) {
    const recentChanges = changes.slice(-3)
    const earlierChanges = changes.slice(0, 3)
    const recentAvg = avg(recentChanges)
    const earlierAvg = avg(earlierChanges)
    if (recentAvg > earlierAvg + 1) momentum = 'accelerating'
    else if (recentAvg < earlierAvg - 1) momentum = 'decelerating'
  }

  return { label, direction, momentum, avgChange, volatility }
}
