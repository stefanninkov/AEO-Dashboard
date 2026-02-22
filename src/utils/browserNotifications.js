/**
 * Browser Notification API utility — opt-in push notifications
 * when the tab is backgrounded.
 */

const PREF_KEY = 'aeo-browser-notifications'

/** Check if the browser supports the Notification API */
export function isSupported() {
  return 'Notification' in window
}

/** Current permission state: 'granted' | 'denied' | 'default' */
export function getPermission() {
  if (!isSupported()) return 'unsupported'
  return Notification.permission
}

/** Whether the user has opted in via our settings toggle */
export function isEnabled() {
  return localStorage.getItem(PREF_KEY) === 'true'
}

/** Toggle preference on/off */
export function setEnabled(value) {
  localStorage.setItem(PREF_KEY, String(!!value))
}

/** Request browser permission (returns 'granted' | 'denied' | 'default') */
export async function requestPermission() {
  if (!isSupported()) return 'unsupported'
  return Notification.requestPermission()
}

/**
 * Show a browser notification if:
 * 1. Browser supports it
 * 2. Permission is granted
 * 3. User has enabled the feature
 * 4. Tab is not focused
 */
export function showNotification(title, body) {
  if (!isSupported()) return
  if (Notification.permission !== 'granted') return
  if (!isEnabled()) return
  if (!document.hidden) return

  const notif = new Notification(title, {
    body,
    icon: '/AEO-Dashboard/favicon.svg',
    tag: 'aeo-notification',
  })

  notif.onclick = () => {
    window.focus()
    notif.close()
  }
}
