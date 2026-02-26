/**
 * Activity Service — Standalone Firestore functions for logging lead activities.
 *
 * Used by hooks and components to log events to the
 * waitlist/{docId}/activity/{activityId} subcollection.
 * Not a React hook — can be called from anywhere.
 */
import {
  collection, addDoc, serverTimestamp, doc, updateDoc, increment,
} from 'firebase/firestore'
import { db } from '../../firebase'

const isFirebaseConfigured = !!db

/**
 * Log an activity event to a lead's activity subcollection.
 * Also bumps lastActivityAt + totalActivities on the parent doc.
 */
export async function logLeadActivity(leadId, { type, description, metadata = {} }) {
  if (!isFirebaseConfigured || !leadId) return null
  try {
    const actRef = collection(db, 'waitlist', leadId, 'activity')
    const docRef = await addDoc(actRef, {
      type,
      description,
      metadata,
      createdAt: serverTimestamp(),
      createdBy: 'admin',
    })

    // Bump counters on parent lead doc
    await updateDoc(doc(db, 'waitlist', leadId), {
      lastActivityAt: serverTimestamp(),
      totalActivities: increment(1),
    })

    return docRef.id
  } catch (err) {
    console.error('logLeadActivity error:', err)
    return null
  }
}

/**
 * Log a system-generated event (not admin-triggered).
 */
export async function logSystemActivity(leadId, { type, description, metadata = {} }) {
  if (!isFirebaseConfigured || !leadId) return null
  try {
    const actRef = collection(db, 'waitlist', leadId, 'activity')
    await addDoc(actRef, {
      type,
      description,
      metadata,
      createdAt: serverTimestamp(),
      createdBy: 'system',
    })
    await updateDoc(doc(db, 'waitlist', leadId), {
      lastActivityAt: serverTimestamp(),
      totalActivities: increment(1),
    })
  } catch (err) {
    console.error('logSystemActivity error:', err)
  }
}

/* ── Convenience wrappers ── */

export function logStageChange(leadId, fromStage, toStage) {
  return logLeadActivity(leadId, {
    type: 'stage_change',
    description: `Stage: ${fromStage} → ${toStage}`,
    metadata: { fromStage, toStage },
  })
}

export function logTagChange(leadId, tag, action) {
  return logLeadActivity(leadId, {
    type: action === 'added' ? 'tag_added' : 'tag_removed',
    description: `Tag ${action}: ${tag}`,
    metadata: { tag, action },
  })
}

export function logTaskEvent(leadId, taskTitle, action) {
  return logLeadActivity(leadId, {
    type: action === 'created' ? 'task_created' : 'task_completed',
    description: `Task ${action}: ${taskTitle}`,
    metadata: { taskTitle, action },
  })
}

export function logEmailSent(leadId, { templateName, subject, method = 'individual' }) {
  return logLeadActivity(leadId, {
    type: 'email_sent',
    description: `Email sent: ${templateName}`,
    metadata: { templateName, subject, method },
  })
}

export function logNoteAdded(leadId, noteText) {
  return logLeadActivity(leadId, {
    type: 'note_added',
    description: noteText,
    metadata: { note: noteText },
  })
}
