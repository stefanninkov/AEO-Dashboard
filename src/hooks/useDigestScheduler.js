import { useEffect, useRef, useCallback, useState } from 'react'
import { sendDigestEmail } from '../utils/emailDigest'
import { isEmailConfigured } from '../utils/emailService'
import logger from '../utils/logger'

const INTERVAL_MS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
}

const CHECK_EVERY = 30 * 60 * 1000 // Check every 30 minutes

/**
 * Scheduler hook that auto-sends digest emails based on project settings.
 * Follows the same pattern as useAutoMonitor.
 */
export function useDigestScheduler({ activeProject, updateProject }) {
  const [sending, setSending] = useState(false)
  const intervalRef = useRef(null)

  const shouldSendDigest = useCallback(() => {
    if (!activeProject) return false
    const settings = activeProject.settings || {}

    if (!settings.digestEnabled) return false
    if (!settings.digestEmail) return false
    if (!isEmailConfigured()) return false

    const interval = INTERVAL_MS[settings.digestInterval] || INTERVAL_MS.weekly
    const lastSent = settings.lastDigestSent

    if (!lastSent) return true

    return Date.now() - new Date(lastSent).getTime() > interval
  }, [activeProject])

  const sendDigest = useCallback(async () => {
    if (sending) return
    if (!activeProject) return

    setSending(true)
    try {
      await sendDigestEmail(activeProject)

      // Update lastDigestSent
      updateProject(activeProject.id, {
        settings: {
          ...activeProject.settings,
          lastDigestSent: new Date().toISOString(),
        },
      })

      logger.info('Digest email sent successfully')
    } catch (err) {
      logger.error('Digest email failed:', err)
    } finally {
      setSending(false)
    }
  }, [activeProject, updateProject, sending])

  // Periodic check
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      if (shouldSendDigest()) {
        sendDigest()
      }
    }, CHECK_EVERY)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [shouldSendDigest, sendDigest])

  return { sending, shouldSendDigest, sendDigest }
}
