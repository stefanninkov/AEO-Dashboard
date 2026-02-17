/**
 * Google OAuth 2.0 — Client-Side Integration
 *
 * Uses Google's OAuth 2.0 implicit flow to get an access token with
 * GSC + GA4 read scopes. The token is stored in Firestore on the user's
 * document and can be used to call Google APIs directly from the browser.
 *
 * Required env vars:
 *   VITE_GOOGLE_CLIENT_ID  — OAuth 2.0 Client ID from Google Cloud Console
 *
 * Scopes requested:
 *   - webmasters.readonly  (Google Search Console)
 *   - analytics.readonly   (Google Analytics 4)
 */

import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import logger from './logger'

// ── Scopes ──
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]

// ── Config ──
function getClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

function getRedirectUri() {
  // Default: current origin + base path
  return (
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    window.location.origin + window.location.pathname
  )
}

/**
 * Check if Google OAuth is configured (client ID set)
 */
export function isGoogleOAuthConfigured() {
  const clientId = getClientId()
  return clientId.length > 0 && !clientId.startsWith('YOUR_')
}

/**
 * Launch Google OAuth consent popup using the implicit grant flow.
 * Returns an access token directly (no server needed).
 */
export function launchGoogleOAuth() {
  const clientId = getClientId()
  if (!clientId || clientId.startsWith('YOUR_')) {
    throw new Error('Google OAuth Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.')
  }

  // Generate random state for CSRF protection
  const state = crypto.randomUUID()
  sessionStorage.setItem('google-oauth-state', state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'token',
    scope: SCOPES.join(' '),
    state,
    access_type: 'online',
    prompt: 'consent',
    include_granted_scopes: 'true',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  // Open in popup
  const width = 500
  const height = 600
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const popup = window.open(
    authUrl,
    'google-oauth',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  )

  if (!popup) {
    throw new Error('Popup blocked. Please allow popups for this site.')
  }

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval)
          reject(new Error('OAuth popup was closed'))
          return
        }

        // Check if the popup has redirected back to our origin
        const popupUrl = popup.location.href
        if (popupUrl.startsWith(getRedirectUri()) || popupUrl.startsWith(window.location.origin)) {
          clearInterval(interval)

          // Parse the hash fragment for the access token
          const hash = popup.location.hash.substring(1)
          const params = new URLSearchParams(hash)
          popup.close()

          const accessToken = params.get('access_token')
          const expiresIn = parseInt(params.get('expires_in') || '3600', 10)
          const returnedState = params.get('state')
          const error = params.get('error')

          if (error) {
            reject(new Error(`Google OAuth error: ${error}`))
            return
          }

          // Verify state
          const savedState = sessionStorage.getItem('google-oauth-state')
          sessionStorage.removeItem('google-oauth-state')
          if (returnedState !== savedState) {
            reject(new Error('OAuth state mismatch — possible CSRF attack'))
            return
          }

          if (!accessToken) {
            reject(new Error('No access token returned'))
            return
          }

          resolve({
            accessToken,
            expiresAt: Date.now() + expiresIn * 1000,
            scopes: params.get('scope') || SCOPES.join(' '),
          })
        }
      } catch {
        // Cross-origin error while popup is on Google's domain — expected, keep polling
      }
    }, 500)

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(interval)
      try { popup.close() } catch { /* ignore */ }
      reject(new Error('OAuth timed out'))
    }, 5 * 60 * 1000)
  })
}

/**
 * Save Google integration tokens to the user's Firestore document
 */
export async function saveGoogleTokens(uid, tokenData) {
  if (!uid) throw new Error('No user ID')

  const payload = {
    googleIntegration: {
      accessToken: tokenData.accessToken,
      expiresAt: tokenData.expiresAt,
      scopes: tokenData.scopes,
      connectedAt: new Date().toISOString(),
      email: tokenData.email || null,
    },
  }

  try {
    await setDoc(doc(db, 'users', uid), payload, { merge: true })
    logger.info('Google tokens saved to Firestore')
  } catch (err) {
    logger.error('Failed to save Google tokens:', err)
    throw err
  }
}

/**
 * Load Google integration data from the user's Firestore document
 */
export async function loadGoogleTokens(uid) {
  if (!uid) return null

  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (!userDoc.exists()) return null

    const data = userDoc.data()
    return data.googleIntegration || null
  } catch (err) {
    logger.error('Failed to load Google tokens:', err)
    return null
  }
}

/**
 * Disconnect Google integration — remove tokens from Firestore
 */
export async function disconnectGoogle(uid) {
  if (!uid) return

  try {
    await setDoc(doc(db, 'users', uid), {
      googleIntegration: null,
    }, { merge: true })
    logger.info('Google integration disconnected')
  } catch (err) {
    logger.error('Failed to disconnect Google:', err)
    throw err
  }
}

/**
 * Verify if the stored access token is still valid
 * by making a simple API call to Google's tokeninfo endpoint
 */
export async function verifyAccessToken(accessToken) {
  if (!accessToken) return false

  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    )
    if (!res.ok) return false
    const data = await res.json()
    return data.expires_in > 0
  } catch {
    return false
  }
}

/**
 * Get the Google user info for the connected account
 */
export async function getGoogleUserInfo(accessToken) {
  if (!accessToken) return null

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Make an authenticated GET request to a Google API
 */
export async function googleApiGet(accessToken, url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status === 401) {
    throw new Error('TOKEN_EXPIRED')
  }

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google API error ${res.status}: ${body}`)
  }

  return res.json()
}

/**
 * Make an authenticated POST request to a Google API
 */
export async function googleApiPost(accessToken, url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (res.status === 401) {
    throw new Error('TOKEN_EXPIRED')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google API error ${res.status}: ${text}`)
  }

  return res.json()
}
