import { useState, useEffect, useCallback } from 'react'
import {
  collection, addDoc, getDocs, onSnapshot,
  query, where, serverTimestamp, doc, updateDoc,
  deleteDoc, arrayUnion,
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

  // ── Legacy: simple email submission (backward compat) ──
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

  // ── Scorecard: create lead on capture step ──
  const createLead = useCallback(async ({ name, email, websiteUrl }) => {
    if (!isFirebaseConfigured) {
      // Dev mode: localStorage
      const stored = JSON.parse(localStorage.getItem('aeo-waitlist') || '[]')
      if (stored.find(e => e.email === email)) {
        throw new Error('already_signed_up')
      }
      const fakeId = `dev_${Date.now()}`
      stored.push({
        id: fakeId, name, email, websiteUrl: websiteUrl || null,
        signedUpAt: new Date().toISOString(), source: 'scorecard',
      })
      localStorage.setItem('aeo-waitlist', JSON.stringify(stored))
      setCount(stored.length)
      return fakeId
    }

    // Check for duplicate
    const q = query(collection(db, 'waitlist'), where('email', '==', email))
    const existing = await getDocs(q)
    if (!existing.empty) {
      throw new Error('already_signed_up')
    }

    const docRef = await addDoc(collection(db, 'waitlist'), {
      // ── Capture ──
      name,
      email,
      websiteUrl: websiteUrl || null,
      signedUpAt: serverTimestamp(),
      source: 'scorecard',
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: document.documentElement.lang || 'en',
      status: 'active',
      notified: false,

      // ── Scorecard (placeholder until completed) ──
      scorecard: {
        completed: false,
        completedAt: null,
        abandonedAtStep: null,
        totalScore: null,
        tier: null,
        categoryScores: {},
        answers: {},
        priorities: [],
      },

      // ── Qualification (filled after quiz) ──
      qualification: {},
      leadScore: null,
      leadTier: null,

      // ── Admin state (initialized for Pass 2) ──
      adminNotes: '',
      invited: false,
      invitedAt: null,
      converted: false,
      convertedAt: null,
      nudged: false,
      nudgedAt: null,
      pipelineStage: 'new',
      stageChangedAt: serverTimestamp(),
      stageHistory: [],
      tags: [],
      lastActivityAt: serverTimestamp(),
      lastContactedAt: null,
      totalActivities: 0,
    })

    return docRef.id
  }, [])

  // ── Scorecard: save completed quiz results ──
  const completeScorecard = useCallback(async (docId, data) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return

    await updateDoc(doc(db, 'waitlist', docId), {
      'scorecard.completed': true,
      'scorecard.completedAt': serverTimestamp(),
      'scorecard.abandonedAtStep': null,
      'scorecard.totalScore': data.totalScore,
      'scorecard.tier': data.tier,
      'scorecard.categoryScores': data.categoryScores,
      'scorecard.answers': data.answers,
      'scorecard.priorities': data.priorities,
      qualification: data.qualifyingAnswers,
      leadScore: data.leadScore,
      leadTier: data.leadTier,
      lastActivityAt: serverTimestamp(),
    })
  }, [])

  // ── Scorecard: track abandonment ──
  const trackAbandonment = useCallback(async (docId, stepIndex) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return

    try {
      await updateDoc(doc(db, 'waitlist', docId), {
        'scorecard.abandonedAtStep': stepIndex,
      })
    } catch (err) {
      logger.error('Track abandonment error:', err)
    }
  }, [])

  // ── Scorecard: mark converted (clicked "Get Early Access" on results) ──
  const markConverted = useCallback(async (docId) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return

    try {
      await updateDoc(doc(db, 'waitlist', docId), {
        converted: true,
        convertedAt: serverTimestamp(),
      })
    } catch (err) {
      logger.error('Mark converted error:', err)
    }
  }, [])

  // ── Admin: mark lead as invited ──
  const markInvited = useCallback(async (docId, currentStage) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return
    try {
      const updates = {
        invited: true,
        invitedAt: serverTimestamp(),
        status: 'invited',
      }
      // Auto-move to 'invited' stage if currently new or contacted
      if (!currentStage || currentStage === 'new' || currentStage === 'contacted') {
        updates.pipelineStage = 'invited'
        updates.stageChangedAt = serverTimestamp()
        updates.stageHistory = arrayUnion({
          from: currentStage || 'new',
          to: 'invited',
          changedAt: new Date().toISOString(),
          changedBy: 'admin',
        })
      }
      await updateDoc(doc(db, 'waitlist', docId), updates)
    } catch (err) {
      logger.error('Mark invited error:', err)
    }
  }, [])

  // ── Admin: mark lead as nudged ──
  const markNudged = useCallback(async (docId) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return
    try {
      await updateDoc(doc(db, 'waitlist', docId), {
        nudged: true,
        nudgedAt: serverTimestamp(),
      })
    } catch (err) {
      logger.error('Mark nudged error:', err)
    }
  }, [])

  // ── Admin: update admin notes ──
  const updateAdminNotes = useCallback(async (docId, notes) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return
    try {
      await updateDoc(doc(db, 'waitlist', docId), { adminNotes: notes })
    } catch (err) {
      logger.error('Update admin notes error:', err)
    }
  }, [])

  // ── Admin: update lead status ──
  const updateLeadStatus = useCallback(async (docId, status) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return
    try {
      const updates = { status }
      if (status === 'converted') {
        updates.converted = true
        updates.convertedAt = serverTimestamp()
      }
      if (status === 'invited') {
        updates.invited = true
        updates.invitedAt = serverTimestamp()
      }
      await updateDoc(doc(db, 'waitlist', docId), updates)
    } catch (err) {
      logger.error('Update lead status error:', err)
    }
  }, [])

  // ── Admin: delete lead ──
  const deleteLead = useCallback(async (docId) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return
    try {
      await deleteDoc(doc(db, 'waitlist', docId))
    } catch (err) {
      logger.error('Delete lead error:', err)
    }
  }, [])

  // ── Admin: log contact to lead's history ──
  const logContact = useCallback(async (docId, contactEntry, currentStage) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return
    try {
      const updates = {
        contactHistory: arrayUnion({
          ...contactEntry,
          sentAt: new Date().toISOString(),
        }),
        lastContactedAt: serverTimestamp(),
        nudged: true,
        nudgedAt: serverTimestamp(),
      }
      // Auto-move to 'contacted' if currently 'new'
      if (currentStage === 'new') {
        updates.pipelineStage = 'contacted'
        updates.stageChangedAt = serverTimestamp()
        updates.stageHistory = arrayUnion({
          from: 'new',
          to: 'contacted',
          changedAt: new Date().toISOString(),
          changedBy: 'admin',
        })
      }
      await updateDoc(doc(db, 'waitlist', docId), updates)
    } catch (err) {
      logger.error('Log contact error:', err)
    }
  }, [])

  const updateWebsiteUrl = useCallback(async (docId, websiteUrl) => {
    if (!isFirebaseConfigured || !docId || docId.startsWith('dev_')) return
    try {
      await updateDoc(doc(db, 'waitlist', docId), { websiteUrl })
    } catch { /* silent */ }
  }, [])

  return {
    count, submitting, submitted, error, alreadySignedUp,
    submitEmail,        // legacy
    createLead,         // scorecard: step 1
    completeScorecard,  // scorecard: after quiz
    trackAbandonment,   // scorecard: on close/skip
    markConverted,      // scorecard: results CTA
    updateWebsiteUrl,   // scorecard: results page optional URL
    markInvited,        // admin
    markNudged,         // admin
    updateAdminNotes,   // admin
    updateLeadStatus,   // admin
    deleteLead,         // admin
    logContact,         // admin
  }
}
