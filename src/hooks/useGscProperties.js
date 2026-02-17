/**
 * useGscProperties — Fetches and manages Google Search Console properties.
 *
 * - Lists available properties using the access token
 * - Stores the selected property on the active project in Firestore
 * - Handles loading / error / empty states
 */

import { useState, useEffect, useCallback } from 'react'
import { listGscProperties } from '../utils/gscApi'
import logger from '../utils/logger'

export function useGscProperties(accessToken) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProperties = useCallback(async () => {
    if (!accessToken) {
      setProperties([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const sites = await listGscProperties(accessToken)
      setProperties(sites)
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        setError('Google token expired. Please reconnect in Settings.')
      } else {
        setError(err.message || 'Failed to fetch Search Console properties')
      }
      logger.error('Failed to fetch GSC properties:', err)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  // Auto-fetch when access token changes
  useEffect(() => {
    if (accessToken) {
      fetchProperties()
    } else {
      setProperties([])
      setError(null)
    }
  }, [accessToken, fetchProperties])

  return {
    properties,
    loading,
    error,
    refresh: fetchProperties,
  }
}
