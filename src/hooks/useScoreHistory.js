import { useMemo, useCallback } from 'react'

/**
 * useScoreHistory — Manages score snapshots for a project.
 *
 * Reads from project.scoreHistory (array of snapshots stored in Firestore/localStorage).
 * Each snapshot: { timestamp, scores: { overall, technical, content, schema, authority, ... }, source }
 *
 * Returns:
 *   history: sorted array of snapshots (newest last)
 *   latestScores: most recent scores object
 *   previousScores: second most recent scores object
 *   getHistoryForRange: (days) => filtered array
 *   addSnapshot: (scores, source) => void — adds a new snapshot to project
 *   getScoreChange: (key) => { value, direction, percent }
 *   trendData: array formatted for recharts LineChart
 */
export function useScoreHistory({ activeProject, updateProject }) {
  const history = useMemo(() => {
    const raw = activeProject?.scoreHistory || []
    return [...raw].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [activeProject?.scoreHistory])

  const latestScores = useMemo(() => {
    if (!history.length) return null
    return history[history.length - 1].scores
  }, [history])

  const previousScores = useMemo(() => {
    if (history.length < 2) return null
    return history[history.length - 2].scores
  }, [history])

  const getHistoryForRange = useCallback(
    (days) => {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
      return history.filter((s) => new Date(s.timestamp).getTime() >= cutoff)
    },
    [history]
  )

  const addSnapshot = useCallback(
    (scores, source = 'manual') => {
      if (!activeProject?.id || !updateProject) return
      const snapshot = {
        timestamp: new Date().toISOString(),
        scores,
        source,
      }
      const newHistory = [...(activeProject.scoreHistory || []), snapshot].slice(-200)
      updateProject(activeProject.id, { scoreHistory: newHistory })
    },
    [activeProject?.id, activeProject?.scoreHistory, updateProject]
  )

  const getScoreChange = useCallback(
    (key) => {
      if (!latestScores || !previousScores) return null
      const current = latestScores[key]
      const previous = previousScores[key]
      if (current == null || previous == null) return null
      const diff = current - previous
      const percent = previous !== 0 ? Math.round((diff / previous) * 100) : 0
      return {
        value: diff,
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
        percent,
      }
    },
    [latestScores, previousScores]
  )

  // Format history for Recharts
  const trendData = useMemo(() => {
    return history.map((s) => ({
      date: new Date(s.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      timestamp: s.timestamp,
      ...s.scores,
    }))
  }, [history])

  return {
    history,
    latestScores,
    previousScores,
    getHistoryForRange,
    addSnapshot,
    getScoreChange,
    trendData,
  }
}
