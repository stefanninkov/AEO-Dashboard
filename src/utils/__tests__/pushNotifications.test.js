import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isPushSupported, getPermissionState, loadPushPrefs,
  savePushPrefs, PUSH_TRIGGER_TYPES,
} from '../pushNotifications'

describe('pushNotifications', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('isPushSupported', () => {
    it('returns true when Notification and serviceWorker exist', () => {
      // jsdom doesn't have them, so mock
      window.Notification = { permission: 'default' }
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {}, writable: true, configurable: true,
      })
      expect(isPushSupported()).toBe(true)
      delete window.Notification
    })

    it('returns false when Notification is missing', () => {
      delete window.Notification
      expect(isPushSupported()).toBe(false)
    })
  })

  describe('getPermissionState', () => {
    it('returns unsupported when push is not supported', () => {
      delete window.Notification
      expect(getPermissionState()).toBe('unsupported')
    })

    it('returns the Notification.permission value', () => {
      window.Notification = { permission: 'granted' }
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {}, writable: true, configurable: true,
      })
      expect(getPermissionState()).toBe('granted')
      delete window.Notification
    })
  })

  describe('PUSH_TRIGGER_TYPES', () => {
    it('has expected trigger types', () => {
      expect(PUSH_TRIGGER_TYPES).toHaveProperty('score_drop')
      expect(PUSH_TRIGGER_TYPES).toHaveProperty('mention')
      expect(PUSH_TRIGGER_TYPES).toHaveProperty('monitor_alert')
      expect(PUSH_TRIGGER_TYPES).toHaveProperty('comment')
    })

    it('each trigger has label, default, and priority', () => {
      Object.values(PUSH_TRIGGER_TYPES).forEach(config => {
        expect(config).toHaveProperty('label')
        expect(config).toHaveProperty('default')
        expect(config).toHaveProperty('priority')
      })
    })
  })

  describe('loadPushPrefs', () => {
    it('returns defaults when nothing stored', () => {
      const prefs = loadPushPrefs()
      expect(prefs.enabled).toBe(false)
      expect(prefs.triggers).toBeDefined()
      expect(prefs.triggers.score_drop).toBe(true)
      expect(prefs.triggers.comment).toBe(false)
    })

    it('returns stored prefs', () => {
      const custom = { enabled: true, triggers: { score_drop: false, comment: true } }
      localStorage.setItem('aeo-push-prefs', JSON.stringify(custom))
      const prefs = loadPushPrefs()
      expect(prefs.enabled).toBe(true)
      expect(prefs.triggers.score_drop).toBe(false)
    })
  })

  describe('savePushPrefs', () => {
    it('persists prefs to localStorage', () => {
      const prefs = { enabled: true, triggers: { mention: true } }
      savePushPrefs(prefs)
      const stored = JSON.parse(localStorage.getItem('aeo-push-prefs'))
      expect(stored.enabled).toBe(true)
      expect(stored.triggers.mention).toBe(true)
    })
  })
})
