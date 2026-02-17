/**
 * Super Admin UID Allowlist
 *
 * Only users whose Firebase UID appears here can access /admin.
 *
 * To find your UID:
 *   1. Sign in to the app
 *   2. Open browser console
 *   3. Run: firebase.auth().currentUser.uid
 *   4. Add the UID string to the array below
 */

const SUPER_ADMIN_UIDS = [
  // 'paste-your-firebase-uid-here',
]

export function isSuperAdmin(uid) {
  if (!uid) return false
  return SUPER_ADMIN_UIDS.includes(uid)
}

export function hasConfiguredAdmins() {
  return SUPER_ADMIN_UIDS.length > 0
}
