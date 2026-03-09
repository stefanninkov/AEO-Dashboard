/**
 * pushNotifications.js — Browser push notification utilities.
 *
 * Handles permission requests, subscription management, and
 * notification dispatch via the Notification API and Service Worker.
 *
 * Smart timing: only prompts after first meaningful action.
 */

const STORAGE_KEY = 'aeo-push-prefs'
const PROMPTED_KEY = 'aeo-push-prompted'

/**
 * Check if push notifications are supported.
 */
export function isPushSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator
}

/**
 * Get current permission state.
 * @returns {'granted'|'denied'|'default'|'unsupported'}
 */
export function getPermissionState() {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Request notification permission with smart timing.
 * Only prompts if user hasn't been prompted before and permission is 'default'.
 * @param {boolean} force - Skip smart timing checks
 * @returns {Promise<'granted'|'denied'|'default'>}
 */
export async function requestPermission(force = false) {
  if (!isPushSupported()) return 'unsupported'

  if (!force) {
    // Don't re-prompt if already decided
    if (Notification.permission !== 'default') return Notification.permission
    // Don't prompt if we already asked once this session
    if (sessionStorage.getItem(PROMPTED_KEY)) return Notification.permission
  }

  sessionStorage.setItem(PROMPTED_KEY, 'true')
  const result = await Notification.requestPermission()
  return result
}

/**
 * Show a browser notification.
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.body
 * @param {string} [options.icon]
 * @param {string} [options.tag] - Replaces existing notification with same tag
 * @param {string} [options.url] - URL to open on click
 * @param {Object} [options.data] - Custom data payload
 */
export function showNotification({ title, body, icon, tag, url, data }) {
  if (getPermissionState() !== 'granted') return null

  // Prefer service worker notifications (work when tab is backgrounded)
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: icon || '/icons/icon-192.png',
        tag,
        data: { url, ...data },
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        requireInteraction: false,
      })
    })
    return true
  }

  // Fallback to regular Notification API
  const notif = new Notification(title, {
    body,
    icon: icon || '/icons/icon-192.png',
    tag,
  })

  if (url) {
    notif.onclick = () => {
      window.focus()
      if (url.startsWith('#')) {
        window.location.hash = url
      }
      notif.close()
    }
  }

  return notif
}

/**
 * Push notification trigger types and their default enabled state.
 */
export const PUSH_TRIGGER_TYPES = {
  score_drop:       { label: 'Score drops > 5pts',        default: true,  priority: 'high' },
  task_assignment:  { label: 'New task assignments',       default: true,  priority: 'normal' },
  mention:          { label: '@mentions',                  default: true,  priority: 'high' },
  phase_completion: { label: 'Phase completions',          default: true,  priority: 'normal' },
  monitor_alert:    { label: 'Monitoring alerts',          default: true,  priority: 'high' },
  comment:          { label: 'New comments',               default: false, priority: 'low' },
  member_join:      { label: 'New team members',           default: false, priority: 'low' },
  report_ready:     { label: 'Reports ready',              default: true,  priority: 'normal' },
}

/**
 * Load user's push notification preferences from localStorage.
 */
export function loadPushPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}

  // Default: all triggers with their default states
  const prefs = { enabled: false, triggers: {} }
  Object.entries(PUSH_TRIGGER_TYPES).forEach(([key, config]) => {
    prefs.triggers[key] = config.default
  })
  return prefs
}

/**
 * Save push notification preferences.
 */
export function savePushPrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {}
}

/**
 * Check if a specific trigger type should fire a push notification.
 */
export function shouldPush(triggerType) {
  if (getPermissionState() !== 'granted') return false
  const prefs = loadPushPrefs()
  if (!prefs.enabled) return false
  return prefs.triggers[triggerType] !== false
}

/**
 * Fire a push notification for a specific event.
 * Checks preferences before showing.
 */
export function pushForEvent(triggerType, { title, body, url, data } = {}) {
  if (!shouldPush(triggerType)) return false

  const config = PUSH_TRIGGER_TYPES[triggerType]
  showNotification({
    title: title || config?.label || 'AEO Dashboard',
    body: body || '',
    tag: triggerType,
    url,
    data,
  })
  return true
}

/**
 * Register push event handler in service worker.
 * Call this from sw.js:
 *
 *   self.addEventListener('notificationclick', handleNotificationClick)
 */
export function getServiceWorkerHandlers() {
  return `
    self.addEventListener('notificationclick', function(event) {
      event.notification.close();
      const url = event.notification.data?.url;
      if (url) {
        event.waitUntil(
          clients.matchAll({ type: 'window' }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
              if (clientList[i].url.includes(self.location.origin) && 'focus' in clientList[i]) {
                clientList[i].focus();
                clientList[i].postMessage({ type: 'NOTIFICATION_CLICK', url: url });
                return;
              }
            }
            if (clients.openWindow) {
              return clients.openWindow(url);
            }
          })
        );
      }
    });
  `
}
