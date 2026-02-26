/**
 * useLeadActivity — Real-time activity feed for a single lead.
 *
 * Subscribes to the waitlist/{docId}/activity subcollection,
 * provides addActivity (calls activityService) and
 * seedRetroactiveEvents (back-fills system events from existing doc data).
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, onSnapshot, query, orderBy, getDocs, limit,
} from 'firebase/firestore'
import { db } from '../../firebase'
import {
  logLeadActivity, logSystemActivity,
} from '../utils/activityService'

const isFirebaseConfigured = !!db

export function useLeadActivity(leadId) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const seededRef = useRef(new Set()) // track which leads we've already seeded

  // ── Real-time listener on activity subcollection ──
  useEffect(() => {
    if (!isFirebaseConfigured || !leadId) {
      setActivities([])
      setLoading(false)
      return
    }

    setLoading(true)
    const actRef = collection(db, 'waitlist', leadId, 'activity')
    const q = query(actRef, orderBy('createdAt', 'desc'))

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        // Normalize Firestore Timestamp → Date for display
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      }))
      setActivities(items)
      setLoading(false)
    }, (err) => {
      console.error('useLeadActivity listener error:', err)
      setLoading(false)
    })

    return () => unsub()
  }, [leadId])

  // ── Add a new activity (admin-triggered) ──
  const addActivity = useCallback(async (type, description, metadata = {}) => {
    if (!leadId) return null
    return logLeadActivity(leadId, { type, description, metadata })
  }, [leadId])

  // ── Add a note (convenience) ──
  const addNote = useCallback(async (noteText) => {
    if (!leadId || !noteText?.trim()) return null
    return logLeadActivity(leadId, {
      type: 'note_added',
      description: noteText.trim(),
      metadata: { note: noteText.trim() },
    })
  }, [leadId])

  // ── Seed retroactive events for leads with empty activity ──
  // Creates system events from existing doc data (signup, scorecard, conversion)
  const seedRetroactiveEvents = useCallback(async (lead) => {
    if (!isFirebaseConfigured || !lead?.id) return
    if (seededRef.current.has(lead.id)) return // already seeded this session

    try {
      // Check if subcollection already has entries
      const actRef = collection(db, 'waitlist', lead.id, 'activity')
      const existing = await getDocs(query(actRef, limit(1)))
      if (!existing.empty) {
        seededRef.current.add(lead.id)
        return // already has activity, skip seeding
      }

      seededRef.current.add(lead.id)

      // 1. Signup event
      if (lead.signedUpAt) {
        await logSystemActivity(lead.id, {
          type: 'signup',
          description: `Signed up via ${lead.source || 'direct'}`,
          metadata: { source: lead.source || 'direct' },
        })
      }

      // 2. Scorecard completed
      if (lead.scorecard?.completed && lead.scorecard?.completedAt) {
        await logSystemActivity(lead.id, {
          type: 'score_completed',
          description: `AEO Scorecard completed — ${lead.scorecard.totalScore}/33 (${lead.scorecard.tier})`,
          metadata: {
            totalScore: lead.scorecard.totalScore,
            tier: lead.scorecard.tier,
          },
        })
      }

      // 3. Converted
      if (lead.converted && lead.convertedAt) {
        await logSystemActivity(lead.id, {
          type: 'converted',
          description: 'Clicked "Get Early Access" on results page',
          metadata: {},
        })
      }

      // 4. Invited
      if (lead.invited && lead.invitedAt) {
        await logSystemActivity(lead.id, {
          type: 'email_sent',
          description: 'Marked as invited',
          metadata: { action: 'invited' },
        })
      }
    } catch (err) {
      console.error('seedRetroactiveEvents error:', err)
    }
  }, [])

  return { activities, loading, addActivity, addNote, seedRetroactiveEvents }
}
