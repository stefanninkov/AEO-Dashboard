/**
 * useGscData — Fetches and manages Google Search Console search analytics data.
 *
 * Provides:
 *  - Search analytics data (queries, pages, dates)
 *  - AEO query classification
 *  - Date range control
 *  - Caching to avoid re-fetching
 *  - Loading / error states
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { querySearchAnalytics, classifyAeoQueries, getDateRange } from '../utils/gscApi'
import logger from '../utils/logger'

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(siteUrl, options) {
  return `${siteUrl}|${JSON.stringify(options)}`
}

export function useGscData(accessToken, siteUrl, options = {}) {
  const {
    datePreset = '28d',
    enabled = true,
  } = options

  const [queryData, setQueryData] = useState(null) // { rows, aeoRows, totalClicks, totalImpressions, avgPosition, avgCtr }
  const [pageData, setPageData] = useState(null) // { rows }
  const [dateData, setDateData] = useState(null) // { rows } for sparkline/chart
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchRef = useRef(0)

  const { startDate, endDate } = useMemo(() => getDateRange(datePreset), [datePreset])

  const fetchData = useCallback(async () => {
    if (!accessToken || !siteUrl || !enabled) return

    const fetchId = ++fetchRef.current
    setLoading(true)
    setError(null)

    try {
      // Check cache
      const queryCacheKey = getCacheKey(siteUrl, { startDate, endDate, dim: 'query' })
      const pageCacheKey = getCacheKey(siteUrl, { startDate, endDate, dim: 'page' })
      const dateCacheKey = getCacheKey(siteUrl, { startDate, endDate, dim: 'date' })

      const cachedQuery = cache.get(queryCacheKey)
      const cachedPage = cache.get(pageCacheKey)
      const cachedDate = cache.get(dateCacheKey)

      const now = Date.now()

      // Fetch queries
      let queryResult
      if (cachedQuery && now - cachedQuery.time < CACHE_TTL) {
        queryResult = cachedQuery.data
      } else {
        queryResult = await querySearchAnalytics(accessToken, siteUrl, {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 1000,
        })
        cache.set(queryCacheKey, { data: queryResult, time: now })
      }

      if (fetchId !== fetchRef.current) return // stale

      // Fetch pages
      let pageResult
      if (cachedPage && now - cachedPage.time < CACHE_TTL) {
        pageResult = cachedPage.data
      } else {
        pageResult = await querySearchAnalytics(accessToken, siteUrl, {
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: 500,
        })
        cache.set(pageCacheKey, { data: pageResult, time: now })
      }

      if (fetchId !== fetchRef.current) return

      // Fetch date series
      let dateResult
      if (cachedDate && now - cachedDate.time < CACHE_TTL) {
        dateResult = cachedDate.data
      } else {
        dateResult = await querySearchAnalytics(accessToken, siteUrl, {
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 500,
        })
        cache.set(dateCacheKey, { data: dateResult, time: now })
      }

      if (fetchId !== fetchRef.current) return

      // Process query data with AEO classification
      const classified = classifyAeoQueries(queryResult.rows)
      const aeoRows = classified.filter(r => r.isAeoQuery)

      const totalClicks = queryResult.rows.reduce((sum, r) => sum + r.clicks, 0)
      const totalImpressions = queryResult.rows.reduce((sum, r) => sum + r.impressions, 0)
      const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
      const avgPosition = queryResult.rows.length > 0
        ? queryResult.rows.reduce((sum, r) => sum + r.position, 0) / queryResult.rows.length
        : 0

      setQueryData({
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
      })

      setPageData({
        rows: pageResult.rows.map(r => ({
          ...r,
          page: r.keys?.[0] || '',
        })),
      })

      setDateData({
        rows: dateResult.rows.map(r => ({
          date: r.keys?.[0] || '',
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
        })).sort((a, b) => a.date.localeCompare(b.date)),
      })

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
  }, [accessToken, siteUrl, startDate, endDate, enabled])

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
