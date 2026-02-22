import { useState, useEffect, useCallback } from 'react'
import {
  collection, addDoc, getDocs, onSnapshot,
  query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import logger from '../utils/logger'

/*
 * Dev mode detection — matches useAuth.js / useFirestoreProjects.js
 */
const isFirebaseConfigured = (() => {
  try {
    const key = import.meta.env.VITE_FIREBASE_API_KEY || ''
    return key.length > 0 && !key.startsWith('YOUR_')
  } catch {
    return false
  }
})()

const RATE_LIMIT_KEY = 'aeo-waitlist-last-submitted'
const RATE_LIMIT_MS = 10 * 60 * 1000 // 10 minutes

export function useWaitlist() {
  const [count, setCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [alreadySignedUp, setAlreadySignedUp] = useState(false)

  // Real-time listener for count
  useEffect(() => {
    if (!isFirebaseConfigured) {
      const stored = JSON.parse(localStorage.getItem('aeo-waitlist') || '[]')
      setCount(stored.length)
      return
    }

    const unsubscribe = onSnapshot(
      collection(db, 'waitlist'),
      (snapshot) => setCount(snapshot.size),
      (err) => logger.error('Waitlist count error:', err),
    )
    return () => unsubscribe()
  }, [])

  const submitEmail = useCallback(async (email) => {
    setSubmitting(true)
    setError(null)
    setAlreadySignedUp(false)

    // Client-side rate limit
    const lastSubmitted = localStorage.getItem(RATE_LIMIT_KEY)
    if (lastSubmitted) {
      const elapsed = Date.now() - parseInt(lastSubmitted, 10)
      if (elapsed < RATE_LIMIT_MS) {
        setError('Please wait a few minutes before trying again.')
        setSubmitting(false)
        return
      }
    }

    if (!isFirebaseConfigured) {
      // Dev mode: localStorage
      const stored = JSON.parse(localStorage.getItem('aeo-waitlist') || '[]')
      if (stored.find(e => e.email === email)) {
        setAlreadySignedUp(true)
        setSubmitted(true)
        setSubmitting(false)
        return
      }
      stored.push({ email, signedUpAt: new Date().toISOString() })
      localStorage.setItem('aeo-waitlist', JSON.stringify(stored))
      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()))
      setCount(stored.length)
      setSubmitted(true)
      setSubmitting(false)
      return
    }

    try {
      // Check for duplicate
      const q = query(collection(db, 'waitlist'), where('email', '==', email))
      const existing = await getDocs(q)
      if (!existing.empty) {
        setAlreadySignedUp(true)
        setSubmitted(true)
        setSubmitting(false)
        return
      }

      await addDoc(collection(db, 'waitlist'), {
        email,
        signedUpAt: serverTimestamp(),
        source: 'direct',
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        status: 'active',
        notified: false,
      })

      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()))
      setSubmitted(true)
    } catch (err) {
      logger.error('Waitlist submit error:', err)
      if (err.code === 'permission-denied') {
        setError('Unable to join waitlist. Please try again later.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { count, submitting, submitted, error, alreadySignedUp, submitEmail }
}
