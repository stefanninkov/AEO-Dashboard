/**
 * Super Admin UID Allowlist
 *
 * Only users whose Firebase UID appears here can access /admin.
 * Also checks VITE_SUPER_ADMIN_UID env variable as a fallback.
 */

const SUPER_ADMIN_UIDS = [
  // Add Firebase UIDs here, e.g.: 'abc123xyz456'
]

// Also accept admin UID from environment variable
const envAdminUid = import.meta.env.VITE_SUPER_ADMIN_UID || ''

export function isSuperAdmin(uid) {
  if (!uid) return false
  if (SUPER_ADMIN_UIDS.includes(uid)) return true
  if (envAdminUid && uid === envAdminUid) return true
  return false
}

export function hasConfiguredAdmins() {
  return SUPER_ADMIN_UIDS.length > 0 || envAdminUid.length > 0
}
