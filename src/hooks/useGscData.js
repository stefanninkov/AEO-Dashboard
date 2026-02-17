/**
 * useGscData — Fetches and manages Google Search Console search analytics data.
 *
 * Provides:
 *  - Search analytics data (queries, pages, dates)
 *  - AEO query classification
 *  - Date range control
 *  - Two-tier caching (memory + localStorage) with stale-while-revalidate
 *  - Loading / error states
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { querySearchAnalytics, classifyAeoQueries, getDateRange } from '../utils/gscApi'
import { cacheKey, getCache, setCache } from '../utils/dataCache'
import logger from '../utils/logger'

export function useGscData(accessToken, siteUrl, options = {}) {
  const {
    datePreset = '28d',
    enabled = true,
  } = options

  const [queryData, setQueryData] = useState(null)
  const [pageData, setPageData] = useState(null)
  const [dateData, setDateData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchRef = useRef(0)

  const { startDate, endDate } = useMemo(() => getDateRange(datePreset), [datePreset])

  // Process raw query data into the final shape
  const processQueryData = useCallback((queryResult) => {
    const classified = classifyAeoQueries(queryResult.rows)
    const aeoRows = classified.filter(r => r.isAeoQuery)

    const totalClicks = queryResult.rows.reduce((sum, r) => sum + r.clicks, 0)
    const totalImpressions = queryResult.rows.reduce((sum, r) => sum + r.impressions, 0)
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
    const avgPosition = queryResult.rows.length > 0
      ? queryResult.rows.reduce((sum, r) => sum + r.position, 0) / queryResult.rows.length
      : 0

    return {
      rows: classified,
      aeoRows,
      totalClicks,
      totalImpressions,
      avgCtr,
      avgPosition,
      aeoClickShare: totalClicks > 0
        ? aeoRows.reduce((sum, r) => sum + r.clicks, 0) / totalClicks
        : 0,
      aeoQueryCount: aeoRows.length,
      totalQueryCount: classified.length,
    }
  }, [])

  const processPageData = useCallback((pageResult) => ({
    rows: pageResult.rows.map(r => ({ ...r, page: r.keys?.[0] || '' })),
  }), [])

  const processDateData = useCallback((dateResult) => ({
    rows: dateResult.rows.map(r => ({
      date: r.keys?.[0] || '',
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })).sort((a, b) => a.date.localeCompare(b.date)),
  }), [])

  const fetchData = useCallback(async () => {
    if (!accessToken || !siteUrl || !enabled) return

    const fetchId = ++fetchRef.current

    // Cache keys
    const qKey = cacheKey('gscQueries', siteUrl, startDate, endDate)
    const pKey = cacheKey('gscPages', siteUrl, startDate, endDate)
    const dKey = cacheKey('gscDates', siteUrl, startDate, endDate)

    // Check cache — serve stale data immediately while refreshing
    const qCache = getCache(qKey, 10 * 60 * 1000)
    const pCache = getCache(pKey, 10 * 60 * 1000)
    const dCache = getCache(dKey, 10 * 60 * 1000)

    // If we have fresh data for all three, no fetch needed
    if (!qCache.isMiss && !qCache.isStale && !pCache.isMiss && !pCache.isStale && !dCache.isMiss && !dCache.isStale) {
      setQueryData(processQueryData(qCache.data))
      setPageData(processPageData(pCache.data))
      setDateData(processDateData(dCache.data))
      setLoading(false)
      return
    }

    // If we have stale data, show it immediately
    if (!qCache.isMiss) setQueryData(processQueryData(qCache.data))
    if (!pCache.isMiss) setPageData(processPageData(pCache.data))
    if (!dCache.isMiss) setDateData(processDateData(dCache.data))

    // Fetch fresh data
    setLoading(true)
    setError(null)

    try {
      // Fetch all three in parallel
      const [queryResult, pageResult, dateResult] = await Promise.all([
        (qCache.isMiss || qCache.isStale)
          ? querySearchAnalytics(accessToken, siteUrl, { startDate, endDate, dimensions: ['query'], rowLimit: 1000 })
          : Promise.resolve(qCache.data),
        (pCache.isMiss || pCache.isStale)
          ? querySearchAnalytics(accessToken, siteUrl, { startDate, endDate, dimensions: ['page'], rowLimit: 500 })
          : Promise.resolve(pCache.data),
        (dCache.isMiss || dCache.isStale)
          ? querySearchAnalytics(accessToken, siteUrl, { startDate, endDate, dimensions: ['date'], rowLimit: 500 })
          : Promise.resolve(dCache.data),
      ])

      if (fetchId !== fetchRef.current) return // stale fetch

      // Update cache
      if (qCache.isMiss || qCache.isStale) setCache(qKey, queryResult)
      if (pCache.isMiss || pCache.isStale) setCache(pKey, pageResult)
      if (dCache.isMiss || dCache.isStale) setCache(dKey, dateResult)

      // Set processed state
      setQueryData(processQueryData(queryResult))
      setPageData(processPageData(pageResult))
      setDateData(processDateData(dateResult))

    } catch (err) {
      if (fetchId !== fetchRef.current) return
      if (err.message === 'TOKEN_EXPIRED') {
        setError('Google token expired. Reconnect in Settings.')
      } else {
        setError(err.message || 'Failed to fetch Search Console data')
      }
      logger.error('GSC data fetch failed:', err)
    } finally {
      if (fetchId === fetchRef.current) {
        setLoading(false)
      }
    }
  }, [accessToken, siteUrl, startDate, endDate, enabled, processQueryData, processPageData, processDateData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    queryData,
    pageData,
    dateData,
    loading,
    error,
    refresh: fetchData,
    dateRange: { startDate, endDate, preset: datePreset },
  }
}
