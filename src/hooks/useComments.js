import { useState, useCallback, useMemo } from 'react'
import { createActivity, appendActivity } from '../utils/activityLogger'

/**
 * useComments — Manages inline comment threads on any item (checklist task,
 * analyzer result, competitor card, metric, etc.)
 *
 * Data model: project.comments = {
 *   [itemId]: {
 *     id: string,
 *     comments: [{ id, text, authorUid, authorName, authorEmail, timestamp, mentions, edited }]
 *   }
 * }
 *
 * @param {Object} options
 * @param {Object} options.activeProject
 * @param {Function} options.updateProject
 * @param {Object} options.user - Firebase user { uid, displayName, email }
 * @param {Function} [options.addNotification] - from useNotifications
 */
export function useComments({ activeProject, updateProject, user, addNotification }) {
  const [openThreadId, setOpenThreadId] = useState(null)

  const allComments = useMemo(() => activeProject?.comments || {}, [activeProject?.comments])

  const getThread = useCallback((itemId) => {
    return allComments[itemId]?.comments || []
  }, [allComments])

  const getThreadCount = useCallback((itemId) => {
    return allComments[itemId]?.comments?.length || 0
  }, [allComments])

  const addComment = useCallback((itemId, text, itemLabel) => {
    if (!activeProject?.id || !user?.uid || !text.trim()) return

    const mentions = parseMentions(text, activeProject.members || [])
    const comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: text.trim(),
      authorUid: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      authorEmail: user.email || '',
      timestamp: new Date().toISOString(),
      mentions: mentions.map(m => m.uid),
      edited: false,
    }

    const existing = allComments[itemId] || { id: itemId, comments: [] }
    const updated = {
      ...allComments,
      [itemId]: {
        ...existing,
        comments: [...existing.comments, comment],
      },
    }

    // Update project
    const activity = createActivity('comment', {
      itemId,
      itemLabel: itemLabel || itemId,
      commentText: text.trim().slice(0, 100),
    }, user)

    updateProject(activeProject.id, {
      comments: updated,
      activityLog: appendActivity(activeProject.activityLog, activity),
    })

    // Notify mentioned users
    if (addNotification && mentions.length > 0) {
      mentions.forEach(m => {
        if (m.uid !== user.uid) {
          addNotification(m.uid, 'mention', `${comment.authorName} mentioned you: "${text.trim().slice(0, 60)}${text.length > 60 ? '...' : ''}"`, {
            itemId,
            commentId: comment.id,
          })
        }
      })
    }
  }, [activeProject, user, allComments, updateProject, addNotification])

  const editComment = useCallback((itemId, commentId, newText) => {
    if (!activeProject?.id || !user?.uid || !newText.trim()) return

    const thread = allComments[itemId]
    if (!thread) return

    const updatedComments = thread.comments.map(c => {
      if (c.id === commentId && c.authorUid === user.uid) {
        return { ...c, text: newText.trim(), edited: true, editedAt: new Date().toISOString() }
      }
      return c
    })

    updateProject(activeProject.id, {
      comments: {
        ...allComments,
        [itemId]: { ...thread, comments: updatedComments },
      },
    })
  }, [activeProject, user, allComments, updateProject])

  const deleteComment = useCallback((itemId, commentId) => {
    if (!activeProject?.id || !user?.uid) return

    const thread = allComments[itemId]
    if (!thread) return

    const updatedComments = thread.comments.filter(c =>
      !(c.id === commentId && c.authorUid === user.uid)
    )

    const updatedThreads = { ...allComments }
    if (updatedComments.length === 0) {
      delete updatedThreads[itemId]
    } else {
      updatedThreads[itemId] = { ...thread, comments: updatedComments }
    }

    updateProject(activeProject.id, { comments: updatedThreads })
  }, [activeProject, user, allComments, updateProject])

  const toggleThread = useCallback((itemId) => {
    setOpenThreadId(prev => prev === itemId ? null : itemId)
  }, [])

  return {
    getThread,
    getThreadCount,
    addComment,
    editComment,
    deleteComment,
    openThreadId,
    toggleThread,
    setOpenThreadId,
  }
}

/**
 * Parse @mentions from text. Matches @displayName against project members.
 */
function parseMentions(text, members) {
  if (!text || !members?.length) return []
  const found = []
  const mentionRegex = /@([\w\s.]+?)(?=\s@|\s|$|[,;!?])/g
  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    const name = match[1].trim().toLowerCase()
    const member = members.find(m =>
      (m.displayName || '').toLowerCase() === name ||
      (m.email || '').split('@')[0].toLowerCase() === name
    )
    if (member) found.push(member)
  }
  return found
}

export { parseMentions }
