/**
 * useGa4Properties — Fetches and manages GA4 properties.
 *
 * Lists all GA4 properties across all accounts the user has access to.
 */

import { useState, useEffect, useCallback } from 'react'
import { listAllGa4Properties } from '../utils/ga4Api'
import logger from '../utils/logger'

export function useGa4Properties(accessToken) {
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
      const props = await listAllGa4Properties(accessToken)
      setProperties(props)
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        setError('Google token expired. Please reconnect in Settings.')
      } else {
        setError(err.message || 'Failed to fetch GA4 properties')
      }
      logger.error('Failed to fetch GA4 properties:', err)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

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
