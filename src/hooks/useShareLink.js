import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import logger from '../utils/logger'

/*
 * Dev mode detection — matches useAuth.js / useFirestoreProjects.js
 * Falls back to localStorage when Firebase isn't configured.
 */
const isFirebaseConfigured = (() => {
  try {
    const key = import.meta.env.VITE_FIREBASE_API_KEY || ''
    return key.length > 0 && !key.startsWith('YOUR_')
  } catch {
    return false
  }
})()

function generateToken() {
  // 48-char hex token = 192 bits of entropy (OWASP recommends 128+)
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Create a shareable link for a project.
 * Stores the share token + a SNAPSHOT of the project data.
 * In dev mode: uses localStorage. In production: uses Firestore /shares collection.
 */
export async function createShareLink(project, userId) {
  const token = generateToken()
  const baseUrl = window.location.origin + (import.meta.env.BASE_URL || '/AEO-Dashboard/')

  // Create a read-only snapshot (strip sensitive/internal fields)
  const snapshot = {
    name: project.name || 'Unnamed Project',
    url: project.url || '',
    checked: project.checked || {},
    analyzerResults: project.analyzerResults || null,
    monitorHistory: (project.monitorHistory || []).slice(-30), // last 30
    metricsHistory: (project.metricsHistory || []).slice(-30),
    questionnaire: project.questionnaire || {},
    createdAt: new Date().toISOString(),
  }

  const shareData = {
    projectId: project.id,
    userId,
    snapshot,
    createdAt: new Date().toISOString(),
  }

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'shares', token), shareData)
    } catch (err) {
      logger.error('Failed to save share to Firestore:', err)
      // Fall back to localStorage
      saveShareLocal(token, shareData)
    }
  } else {
    saveShareLocal(token, shareData)
  }

  return `${baseUrl}?share=${token}`
}

/**
 * Fetch shared project data by token.
 */
export async function fetchSharedProject(token) {
  if (isFirebaseConfigured) {
    try {
      const shareDoc = await getDoc(doc(db, 'shares', token))
      if (shareDoc.exists()) {
        return shareDoc.data()
      }
    } catch (err) {
      logger.warn('Firestore share fetch failed, trying localStorage:', err)
    }
  }

  // Try localStorage fallback
  const local = getShareLocal(token)
  if (local) return local

  throw new Error('Share link not found or expired')
}

/**
 * Revoke a share link.
 */
export async function revokeShareLink(token) {
  if (isFirebaseConfigured) {
    try {
      const { deleteDoc: deleteFn } = await import('firebase/firestore')
      await deleteFn(doc(db, 'shares', token))
    } catch (err) {
      logger.warn('Firestore share delete failed:', err)
    }
  }
  removeShareLocal(token)
}

/**
 * Get all share tokens for a project (from localStorage).
 */
export function getProjectShares(projectId) {
  try {
    const shares = JSON.parse(localStorage.getItem('aeo-shares') || '{}')
    return Object.entries(shares)
      .filter(([, data]) => data.projectId === projectId)
      .map(([token, data]) => ({ token, ...data }))
  } catch {
    return []
  }
}

// ── localStorage helpers ──

function saveShareLocal(token, data) {
  try {
    const shares = JSON.parse(localStorage.getItem('aeo-shares') || '{}')
    shares[token] = data
    localStorage.setItem('aeo-shares', JSON.stringify(shares))
  } catch (err) {
    logger.error('Failed to save share to localStorage:', err)
  }
}

function getShareLocal(token) {
  try {
    const shares = JSON.parse(localStorage.getItem('aeo-shares') || '{}')
    return shares[token] || null
  } catch {
    return null
  }
}

function removeShareLocal(token) {
  try {
    const shares = JSON.parse(localStorage.getItem('aeo-shares') || '{}')
    delete shares[token]
    localStorage.setItem('aeo-shares', JSON.stringify(shares))
  } catch {
    // ignore
  }
}
