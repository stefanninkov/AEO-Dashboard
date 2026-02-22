import { useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'
import { initSecureStorage, clearSecureStorage } from '../utils/secureStorage'

/*
 * Dev mode detection
 * When Firebase isn't configured (placeholder keys), we fall back to
 * local auth via localStorage so the app is fully functional without Firebase.
 */
const isFirebaseConfigured = (() => {
  try {
    const key = import.meta.env.VITE_FIREBASE_API_KEY || ''
    return key.length > 0 && !key.startsWith('YOUR_')
  } catch {
    return false
  }
})()

/* ── Rate limiter (client-side brute-force protection) ── */
const AUTH_MAX_ATTEMPTS = 5
const AUTH_LOCKOUT_MS = 60_000
const authAttempts = { count: 0, lockedUntil: 0 }

function checkRateLimit() {
  if (Date.now() < authAttempts.lockedUntil) {
    const remaining = Math.ceil((authAttempts.lockedUntil - Date.now()) / 1000)
    return `Too many failed attempts. Please wait ${remaining}s.`
  }
  return null
}

function recordFailedAttempt() {
  authAttempts.count++
  if (authAttempts.count >= AUTH_MAX_ATTEMPTS) {
    authAttempts.lockedUntil = Date.now() + AUTH_LOCKOUT_MS
    authAttempts.count = 0
  }
}

function resetAttempts() {
  authAttempts.count = 0
  authAttempts.lockedUntil = 0
}

/* ── SHA-256 password hashing (dev mode only) ── */
async function hashPassword(password) {
  const data = new TextEncoder().encode(password + 'aeo-dashboard-salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function isHashed(value) {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value)
}

/* ── Local Auth (Dev Mode) ── */
function useLocalAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      const stored = localStorage.getItem('aeo-dev-user')
      if (stored) {
        try {
          const u = JSON.parse(stored)
          await initSecureStorage(u.uid)
          setUser(u)
        } catch { /* ignore */ }
      }
      setLoading(false)
    })()
  }, [])

  const persist = (u) => {
    setUser(u)
    if (u) localStorage.setItem('aeo-dev-user', JSON.stringify(u))
    else localStorage.removeItem('aeo-dev-user')
  }

  const clearError = useCallback(() => setError(null), [])

  const signIn = useCallback(async (email, password) => {
    setError(null)
    const lockMsg = checkRateLimit()
    if (lockMsg) { setError(lockMsg); throw new Error('Rate limited') }

    const accounts = JSON.parse(localStorage.getItem('aeo-dev-accounts') || '{}')
    const account = accounts[email]
    if (!account) {
      recordFailedAttempt()
      setError('No account found with this email. Try signing up first.')
      throw new Error('No account')
    }

    // Compare: support both legacy plaintext and hashed passwords
    const hashed = await hashPassword(password)
    const matches = isHashed(account.password)
      ? account.password === hashed
      : account.password === password

    if (!matches) {
      recordFailedAttempt()
      setError('Incorrect password. Please try again.')
      throw new Error('Wrong password')
    }

    // Migrate legacy plaintext to hash
    if (!isHashed(account.password)) {
      accounts[email] = { ...account, password: hashed }
      localStorage.setItem('aeo-dev-accounts', JSON.stringify(accounts))
    }

    resetAttempts()
    const u = { uid: account.uid, email, displayName: account.displayName, photoURL: null }
    persist(u)
    await initSecureStorage(u.uid)
    return u
  }, [])

  const signUp = useCallback(async (email, password, displayName, agency) => {
    setError(null)
    const accounts = JSON.parse(localStorage.getItem('aeo-dev-accounts') || '{}')
    if (accounts[email]) {
      setError('An account with this email already exists.')
      throw new Error('Already exists')
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      throw new Error('Weak password')
    }
    const uid = 'dev-' + crypto.randomUUID().slice(0, 8)
    const name = displayName || email.split('@')[0]
    const hashed = await hashPassword(password)
    accounts[email] = { uid, password: hashed, displayName: name, agency: agency || '' }
    localStorage.setItem('aeo-dev-accounts', JSON.stringify(accounts))
    const u = { uid, email, displayName: name, photoURL: null }
    persist(u)
    await initSecureStorage(u.uid)
    return u
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    // Simulate Google sign-in with a mock user
    const uid = 'dev-google-' + crypto.randomUUID().slice(0, 8)
    const u = { uid, email: 'google-user@gmail.com', displayName: 'Google User', photoURL: null }
    persist(u)
    await initSecureStorage(u.uid)
    return u
  }, [])

  const signOut = useCallback(async () => {
    clearSecureStorage()
    persist(null)
  }, [])

  const resetPassword = useCallback(async (email) => {
    setError(null)
    const accounts = JSON.parse(localStorage.getItem('aeo-dev-accounts') || '{}')
    if (!accounts[email]) {
      setError('No account found with this email address.')
      throw new Error('No account')
    }
    // Dev mode: just simulate success
    return true
  }, [])

  return { user, loading, error, clearError, signIn, signUp, signInWithGoogle, signOut, resetPassword }
}

/* ── Firebase Auth ── */
function useFirebaseAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await initSecureStorage(firebaseUser.uid)
      } else {
        clearSecureStorage()
      }
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const signIn = useCallback(async (email, password) => {
    setError(null)
    const lockMsg = checkRateLimit()
    if (lockMsg) { setError(lockMsg); throw new Error('Rate limited') }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      resetAttempts()
      // Ensure user profile doc exists (may have been missed on initial sign-up)
      try {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid))
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || '',
            agency: '',
            photoURL: result.user.photoURL || null,
            role: 'owner',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            settings: { theme: 'dark', notifications: true },
          })
        } else {
          await setDoc(doc(db, 'users', result.user.uid), {
            lastLoginAt: serverTimestamp(),
          }, { merge: true })
        }
      } catch { /* non-critical — don't block sign-in */ }
      return result.user
    } catch (err) {
      recordFailedAttempt()
      const message = getErrorMessage(err.code)
      setError(message)
      throw err
    }
  }, [])

  const signUp = useCallback(async (email, password, displayName, agency) => {
    setError(null)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        await updateProfile(result.user, { displayName })
      }
      // Create user profile document in Firestore
      try {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: displayName || '',
          agency: agency || '',
          photoURL: result.user.photoURL || null,
          role: 'owner',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          settings: {
            theme: 'dark',
            notifications: true,
          },
        })
      } catch { /* non-critical */ }
      return result.user
    } catch (err) {
      const message = getErrorMessage(err.code)
      setError(message)
      throw err
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      // Create or update user profile document
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (!userDoc.exists()) {
          // First time Google user — create profile doc
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            agency: '',
            photoURL: user.photoURL || null,
            role: 'owner',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            settings: {
              theme: 'dark',
              notifications: true,
            },
          })
        } else {
          // Returning user — update last login
          await setDoc(doc(db, 'users', user.uid), {
            lastLoginAt: serverTimestamp(),
          }, { merge: true })
        }
      } catch { /* non-critical */ }
      return user
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return null
      const message = getErrorMessage(err.code)
      setError(message)
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      clearSecureStorage()
      await firebaseSignOut(auth)
    } catch (err) {
      setError('Failed to sign out. Please try again.')
      throw err
    }
  }, [])

  const resetPassword = useCallback(async (email) => {
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (err) {
      const message = getErrorMessage(err.code)
      setError(message)
      throw err
    }
  }, [])

  return { user, loading, error, clearError, signIn, signUp, signInWithGoogle, signOut, resetPassword }
}

/* ── Export: auto-select based on config ── */
export function useAuth() {
  if (isFirebaseConfigured) {
    return useFirebaseAuth()
  }
  return useLocalAuth()
}

function getErrorMessage(code) {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Please allow pop-ups for this site.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
