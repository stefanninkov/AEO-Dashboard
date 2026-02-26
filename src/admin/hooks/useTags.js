/**
 * useTags — Global tag registry + per-lead tag CRUD.
 *
 * Registry lives at admin/settings (doc) → tags field: [{ name, color }]
 * Lead tags are stored as an array of tag name strings on the lead doc.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { logTagChange } from '../utils/activityService'
import { TAG_COLORS } from '../constants/pipelineStages'

const isFirebaseConfigured = !!db

export function useTags() {
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Listen to tag registry ──
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const ref = doc(db, 'admin', 'settings')
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setAllTags(snap.data().tags || [])
      } else {
        setAllTags([])
      }
      setLoading(false)
    }, (err) => {
      console.error('useTags registry error:', err)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  // ── Create a new tag in the registry ──
  const createTag = useCallback(async ({ name, color }) => {
    if (!isFirebaseConfigured || !name?.trim()) return
    const tagColor = color || TAG_COLORS[allTags.length % TAG_COLORS.length]
    const ref = doc(db, 'admin', 'settings')
    try {
      await setDoc(ref, {
        tags: arrayUnion({ name: name.trim(), color: tagColor }),
      }, { merge: true })
    } catch (err) {
      console.error('createTag error:', err)
    }
  }, [allTags.length])

  // ── Delete a tag from the registry (does NOT remove from leads) ──
  const deleteTag = useCallback(async (tagName) => {
    if (!isFirebaseConfigured) return
    const tagObj = allTags.find((t) => t.name === tagName)
    if (!tagObj) return
    const ref = doc(db, 'admin', 'settings')
    try {
      await updateDoc(ref, {
        tags: arrayRemove(tagObj),
      })
    } catch (err) {
      console.error('deleteTag error:', err)
    }
  }, [allTags])

  // ── Add a tag to a lead ──
  const addTagToLead = useCallback(async (leadId, tagName) => {
    if (!isFirebaseConfigured || !leadId || !tagName) return
    try {
      await updateDoc(doc(db, 'waitlist', leadId), {
        tags: arrayUnion(tagName),
      })
      await logTagChange(leadId, tagName, 'added')
    } catch (err) {
      console.error('addTagToLead error:', err)
    }
  }, [])

  // ── Remove a tag from a lead ──
  const removeTagFromLead = useCallback(async (leadId, tagName) => {
    if (!isFirebaseConfigured || !leadId || !tagName) return
    try {
      await updateDoc(doc(db, 'waitlist', leadId), {
        tags: arrayRemove(tagName),
      })
      await logTagChange(leadId, tagName, 'removed')
    } catch (err) {
      console.error('removeTagFromLead error:', err)
    }
  }, [])

  // ── Lookup helper: get color for a tag name ──
  const getTagColor = useCallback((tagName) => {
    const tag = allTags.find((t) => t.name === tagName)
    return tag?.color || '#6B7280'
  }, [allTags])

  return {
    allTags, loading,
    createTag, deleteTag,
    addTagToLead, removeTagFromLead,
    getTagColor,
  }
}
