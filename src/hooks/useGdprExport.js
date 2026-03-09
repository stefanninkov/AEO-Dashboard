import { useCallback, useState } from 'react'

/**
 * useGdprExport — GDPR-compliant data export and erasure utilities.
 *
 * Provides:
 * - Full data export (Article 20 - Right to data portability)
 * - Personal data inventory
 * - Data erasure preparation (Article 17 - Right to erasure)
 */
export function useGdprExport({ user, activeProject, projects = [] }) {
  const [exporting, setExporting] = useState(false)

  // Inventory of all personal data stored
  const personalDataInventory = useCallback(() => {
    if (!user) return []

    const inventory = [
      {
        category: 'Account Information',
        fields: [
          { name: 'User ID', value: user.uid, purpose: 'Authentication', retention: 'Account lifetime' },
          { name: 'Display Name', value: user.displayName || 'Not set', purpose: 'Display & collaboration', retention: 'Account lifetime' },
          { name: 'Email', value: user.email || 'Not set', purpose: 'Authentication & notifications', retention: 'Account lifetime' },
        ],
      },
      {
        category: 'Activity Data',
        fields: [
          { name: 'Activity Log Entries', value: `${(activeProject?.activityLog || []).filter(a => a.authorUid === user.uid).length} entries`, purpose: 'Audit trail & collaboration', retention: 'Per retention policy' },
          { name: 'Comments', value: `${countUserComments(activeProject?.comments, user.uid)} comments`, purpose: 'Collaboration', retention: 'Per retention policy' },
          { name: 'Task Assignments', value: `${countUserAssignments(activeProject?.assignments, user.uid)} assignments`, purpose: 'Task management', retention: 'Per retention policy' },
        ],
      },
      {
        category: 'Preferences & Settings',
        fields: [
          { name: 'Theme Preference', value: localStorage.getItem('aeo-theme') || 'auto', purpose: 'UI customization', retention: 'Local storage' },
          { name: 'Notification Preferences', value: localStorage.getItem('aeo-user-preferences') ? 'Stored' : 'Default', purpose: 'Notification delivery', retention: 'Local storage' },
          { name: 'Widget Layout', value: localStorage.getItem('aeo-widget-layouts') ? 'Custom' : 'Default', purpose: 'Dashboard customization', retention: 'Local storage' },
        ],
      },
      {
        category: 'Project Membership',
        fields: projects.map(p => ({
          name: `Project: ${p.name}`,
          value: p.ownerId === user.uid ? 'Owner' : (p.members || []).find(m => m.uid === user.uid)?.role || 'Member',
          purpose: 'Project access control',
          retention: 'Project lifetime',
        })),
      },
    ]

    return inventory
  }, [user, activeProject, projects])

  // Full GDPR data export (Article 20)
  const exportAllPersonalData = useCallback(async () => {
    if (!user) return
    setExporting(true)

    try {
      const exportData = {
        exportMetadata: {
          exportDate: new Date().toISOString(),
          requestedBy: user.uid,
          format: 'JSON (machine-readable)',
          gdprArticle: 'Article 20 - Right to data portability',
        },
        accountInfo: {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          creationTime: user.metadata?.creationTime,
          lastSignInTime: user.metadata?.lastSignInTime,
        },
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          url: p.url,
          role: p.ownerId === user.uid ? 'owner' : (p.members || []).find(m => m.uid === user.uid)?.role || 'member',
          joinedAt: (p.members || []).find(m => m.uid === user.uid)?.addedAt,
          // Activity authored by this user
          myActivity: (p.activityLog || []).filter(a => a.authorUid === user.uid),
          // Comments authored by this user
          myComments: extractUserComments(p.comments, user.uid),
          // Assignments to this user
          myAssignments: extractUserAssignments(p.assignments, user.uid),
          // Notifications for this user
          myNotifications: p.notifications?.[user.uid] || [],
        })),
        localPreferences: {
          theme: localStorage.getItem('aeo-theme'),
          userPreferences: safeParseJson(localStorage.getItem('aeo-user-preferences')),
          widgetLayouts: safeParseJson(localStorage.getItem('aeo-widget-layouts')),
          settingsTab: localStorage.getItem('aeo-settings-tab'),
        },
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gdpr-data-export-${user.uid.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }, [user, projects])

  // Generate erasure report (what would be deleted)
  const generateErasureReport = useCallback(() => {
    if (!user) return null

    return {
      generatedAt: new Date().toISOString(),
      userId: user.uid,
      gdprArticle: 'Article 17 - Right to erasure',
      dataToErase: [
        { type: 'Account', description: 'Firebase Authentication record', action: 'Delete via Firebase Admin' },
        { type: 'Activity Logs', description: `${projects.reduce((s, p) => s + (p.activityLog || []).filter(a => a.authorUid === user.uid).length, 0)} entries across ${projects.length} projects`, action: 'Remove entries with authorUid match' },
        { type: 'Comments', description: `${projects.reduce((s, p) => s + countUserComments(p.comments, user.uid), 0)} comments`, action: 'Remove or anonymize comments' },
        { type: 'Assignments', description: 'Unassign all tasks', action: 'Clear assigneeUid references' },
        { type: 'Notifications', description: 'All notification records', action: 'Remove notification arrays' },
        { type: 'Team Memberships', description: `Member of ${projects.length} projects`, action: 'Remove from members arrays' },
        { type: 'Local Storage', description: 'Theme, preferences, widget layouts', action: 'Clear via localStorage.clear()' },
        { type: 'Presence Data', description: 'Online status records', action: 'Remove from presence objects' },
      ],
      note: 'This report outlines data that would be affected by an erasure request. Actual erasure requires administrative action.',
    }
  }, [user, projects])

  return {
    exporting,
    personalDataInventory,
    exportAllPersonalData,
    generateErasureReport,
  }
}

// ── Helpers ──

function countUserComments(comments, uid) {
  if (!comments || typeof comments !== 'object') return 0
  return Object.values(comments).reduce((sum, thread) =>
    sum + (thread.comments || []).filter(c => c.authorUid === uid).length, 0)
}

function countUserAssignments(assignments, uid) {
  if (!assignments || typeof assignments !== 'object') return 0
  return Object.values(assignments).filter(a => a.assigneeUid === uid || a.assignedBy === uid).length
}

function extractUserComments(comments, uid) {
  if (!comments || typeof comments !== 'object') return []
  const result = []
  Object.entries(comments).forEach(([itemId, thread]) => {
    (thread.comments || []).forEach(c => {
      if (c.authorUid === uid) result.push({ itemId, ...c })
    })
  })
  return result
}

function extractUserAssignments(assignments, uid) {
  if (!assignments || typeof assignments !== 'object') return []
  return Object.entries(assignments)
    .filter(([, a]) => a.assigneeUid === uid)
    .map(([itemId, a]) => ({ itemId, ...a }))
}

function safeParseJson(str) {
  try { return JSON.parse(str) } catch { return null }
}
