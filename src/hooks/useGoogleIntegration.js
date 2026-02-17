/**
 * useGoogleIntegration — Manages Google OAuth connection state.
 *
 * Handles:
 *  - Loading saved connection from Firestore
 *  - Launching OAuth popup
 *  - Saving/revoking tokens
 *  - Token expiry detection + re-auth
 *  - Exposing connection status for UI
 *
 * Usage:
 *   const { status, connect, disconnect, accessToken, connectedEmail } = useGoogleIntegration(user)
 *
 * Status values: 'idle' | 'loading' | 'connected' | 'expired' | 'disconnected' | 'error'
 */

import { useState, useEffect, useCallback } from 'react'
import {
  isGoogleOAuthConfigured,
  launchGoogleOAuth,
  saveGoogleTokens,
  loadGoogleTokens,
  disconnectGoogle,
  verifyAccessToken,
  getGoogleUserInfo,
} from '../utils/googleAuth'
import logger from '../utils/logger'

export function useGoogleIntegration(user) {
  const [status, setStatus] = useState('loading') // idle | loading | connected | expired | disconnected | error
  const [integration, setIntegration] = useState(null) // { accessToken, expiresAt, scopes, connectedAt, email }
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(false)

  const uid = user?.uid

  // ── Load saved connection on mount ──
  useEffect(() => {
    if (!uid) {
      setStatus('idle')
      return
    }

    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const saved = await loadGoogleTokens(uid)

        if (cancelled) return

        if (!saved || !saved.accessToken) {
          setStatus('disconnected')
          setIntegration(null)
          return
        }

        // Check if token has expired by timestamp
        if (saved.expiresAt && Date.now() > saved.expiresAt) {
          setStatus('expired')
          setIntegration(saved)
          return
        }

        // Verify token is still valid with Google
        const valid = await verifyAccessToken(saved.accessToken)
        if (cancelled) return

        if (valid) {
          setStatus('connected')
          setIntegration(saved)
        } else {
          setStatus('expired')
          setIntegration(saved)
        }
      } catch (err) {
        if (!cancelled) {
          logger.error('Failed to load Google integration:', err)
          setStatus('disconnected')
          setIntegration(null)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [uid])

  // ── Connect (launch OAuth popup) ──
  const connect = useCallback(async () => {
    if (!uid) {
      setError('You must be signed in to connect Google')
      return
    }

    if (!isGoogleOAuthConfigured()) {
      setError('Google OAuth is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Launch OAuth popup
      const tokenData = await launchGoogleOAuth()

      // Get the connected Google account's email
      let email = null
      try {
        const userInfo = await getGoogleUserInfo(tokenData.accessToken)
        email = userInfo?.email || null
      } catch {
        // non-critical
      }

      const fullTokenData = { ...tokenData, email }

      // Save to Firestore
      await saveGoogleTokens(uid, fullTokenData)

      setIntegration({
        accessToken: fullTokenData.accessToken,
        expiresAt: fullTokenData.expiresAt,
        scopes: fullTokenData.scopes,
        connectedAt: new Date().toISOString(),
        email,
      })
      setStatus('connected')
    } catch (err) {
      logger.error('Google OAuth connection failed:', err)
      setError(err.message || 'Connection failed')
      setStatus('error')
    } finally {
      setConnecting(false)
    }
  }, [uid])

  // ── Disconnect ──
  const disconnect = useCallback(async () => {
    if (!uid) return

    try {
      await disconnectGoogle(uid)
      setIntegration(null)
      setStatus('disconnected')
      setError(null)
    } catch (err) {
      logger.error('Google disconnect failed:', err)
      setError(err.message || 'Disconnect failed')
    }
  }, [uid])

  // ── Reconnect (for expired tokens) ──
  const reconnect = useCallback(async () => {
    await connect()
  }, [connect])

  return {
    // Status
    status,
    isConfigured: isGoogleOAuthConfigured(),
    isConnected: status === 'connected',
    isExpired: status === 'expired',
    isLoading: status === 'loading',

    // Data
    accessToken: integration?.accessToken || null,
    connectedEmail: integration?.email || null,
    connectedAt: integration?.connectedAt || null,
    scopes: integration?.scopes || '',

    // Actions
    connect,
    disconnect,
    reconnect,
    connecting,

    // Error
    error,
    clearError: () => setError(null),
  }
}
