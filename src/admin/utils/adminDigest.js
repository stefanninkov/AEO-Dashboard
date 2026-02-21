/**
 * Admin Digest — Compose summary email for admin daily/weekly digest.
 *
 * Reads from useAdminStats output and formats a summary email.
 * Sends via EmailJS if configured, otherwise opens mailto.
 */

const DIGEST_PREFS_KEY = 'aeo-admin-digest-prefs'

/**
 * Get admin digest preferences.
 */
export function getDigestPrefs() {
  try {
    return JSON.parse(localStorage.getItem(DIGEST_PREFS_KEY) || '{}')
  } catch {
    return {}
  }
}

/**
 * Save admin digest preferences.
 */
export function setDigestPrefs(prefs) {
  localStorage.setItem(DIGEST_PREFS_KEY, JSON.stringify(prefs))
}

/**
 * Compose a digest email body from admin stats.
 */
export function composeDigest(stats, period = 'daily') {
  const now = new Date()
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const lines = [
    `AEO Dashboard — ${period === 'weekly' ? 'Weekly' : 'Daily'} Admin Digest`,
    `${dateStr}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
  ]

  // Users summary
  const totalUsers = stats?.totalUsers || 0
  const newUsers = stats?.newUsersThisWeek || 0
  const atRisk = stats?.atRiskUsers?.length || 0
  const churned = stats?.churnedUsers?.length || 0

  lines.push('👥 USERS')
  lines.push(`  Total: ${totalUsers}`)
  lines.push(`  New this week: ${newUsers}`)
  lines.push(`  At-risk (7-14d inactive): ${atRisk}`)
  lines.push(`  Churned (30+ days): ${churned}`)
  lines.push('')

  // Projects summary
  const totalProjects = stats?.totalProjects || 0
  const thriving = stats?.thrivingProjects?.length || 0
  const stale = stats?.staleProjects?.length || 0
  const abandoned = stats?.abandonedProjects?.length || 0

  lines.push('📁 PROJECTS')
  lines.push(`  Total: ${totalProjects}`)
  lines.push(`  Thriving: ${thriving}`)
  lines.push(`  Stale (14+ days): ${stale}`)
  lines.push(`  Abandoned (30+ days): ${abandoned}`)
  lines.push('')

  // Engagement
  const avgProgress = stats?.avgProjectProgress || 0
  const activeToday = stats?.activeToday || 0

  lines.push('📊 ENGAGEMENT')
  lines.push(`  Active today: ${activeToday}`)
  lines.push(`  Avg project progress: ${avgProgress}%`)
  lines.push('')

  // Cold users
  const coldUsers = stats?.coldUsers || []
  if (coldUsers.length > 0) {
    lines.push('⚠️ NEEDS ATTENTION')
    coldUsers.slice(0, 5).forEach(u => {
      lines.push(`  - ${u.displayName || u.email} (${u.daysSinceLogin || '?'}d inactive)`)
    })
    if (coldUsers.length > 5) {
      lines.push(`  ... and ${coldUsers.length - 5} more`)
    }
    lines.push('')
  }

  // Feedback
  const feedbackCount = stats?.unreadFeedback || 0
  if (feedbackCount > 0) {
    lines.push(`💬 ${feedbackCount} new feedback items to review`)
    lines.push('')
  }

  // Waitlist
  const waitlistCount = stats?.waitlistThisWeek || 0
  if (waitlistCount > 0) {
    lines.push(`📋 ${waitlistCount} new waitlist signups this week`)
    lines.push('')
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('')
  lines.push(`View full dashboard: ${window.location.origin + window.location.pathname}?/admin`)

  return {
    subject: `[AEO Admin] ${period === 'weekly' ? 'Weekly' : 'Daily'} Digest — ${dateStr}`,
    body: lines.join('\n'),
  }
}

/**
 * Send digest email via EmailJS or open mailto.
 */
export async function sendDigest(stats, period = 'daily') {
  const { subject, body } = composeDigest(stats, period)
  const prefs = getDigestPrefs()
  const toEmail = prefs.digestEmail || ''

  if (!toEmail) {
    throw new Error('No digest email configured. Set it in Admin Settings.')
  }

  const serviceId = localStorage.getItem('emailjs-service-id')
  const templateId = localStorage.getItem('emailjs-template-id')
  const publicKey = localStorage.getItem('emailjs-public-key')

  if (serviceId && templateId && publicKey) {
    const emailjsModule = '@emailjs/browser'
    const emailjs = await import(/* @vite-ignore */ emailjsModule)
    await emailjs.send(serviceId, templateId, {
      to_email: toEmail,
      to_name: 'Admin',
      subject,
      message: body,
      from_name: 'AEO Dashboard Admin',
    }, publicKey)
  } else {
    // Fallback: open mailto
    const mailtoUrl = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')
  }
}

/* ── Admin Audit Log ── */

const AUDIT_LOG_KEY = 'aeo-admin-audit-log'
const MAX_AUDIT_ENTRIES = 200

export function getAuditLog() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]')
  } catch {
    return []
  }
}

export function addAuditEntry(action, details = '') {
  const log = getAuditLog()
  log.unshift({
    timestamp: new Date().toISOString(),
    action,
    details,
  })
  // Keep max entries
  if (log.length > MAX_AUDIT_ENTRIES) log.length = MAX_AUDIT_ENTRIES
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log))
}

export function clearAuditLog() {
  localStorage.removeItem(AUDIT_LOG_KEY)
}
