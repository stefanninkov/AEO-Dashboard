/**
 * useUsageStats — React hook for the usage dashboard.
 *
 * Reads from usageTracker (localStorage) and re-renders on interval.
 * Returns: { today, thisWeek, thisMonth, allTime, history, loading }
 */
import { useState, useEffect, useCallback } from 'react'
import { getUsageSummary, getUsageHistory } from '../utils/usageTracker'

export function useUsageStats(refreshInterval = 60000) {
  const [data, setData] = useState(() => ({
    ...getUsageSummary(),
    history: getUsageHistory(30),
    loading: false,
  }))

  const refresh = useCallback(() => {
    setData({
      ...getUsageSummary(),
      history: getUsageHistory(30),
      loading: false,
    })
  }, [])

  useEffect(() => {
    // Initial load
    refresh()

    // Periodic refresh
    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [refresh, refreshInterval])

  return { ...data, refresh }
}
