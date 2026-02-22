/**
 * secureStorage — AES-GCM encryption for sensitive localStorage values.
 *
 * Design:
 *  - initSecureStorage(uid) derives an AES-GCM key from the user's UID via PBKDF2
 *  - Decrypts all known sensitive keys into a memory cache
 *  - secureGet(key) reads synchronously from cache
 *  - secureSet(key, value) writes to cache + async encrypts to localStorage
 *  - clearSecureStorage() wipes key material + cache on logout
 *
 * Encrypted format in localStorage:
 *  "enc:v1:{base64_iv}:{base64_ciphertext}"
 */

import logger from './logger'

// Keys that contain sensitive credentials and must be encrypted
const SENSITIVE_KEYS = [
  'anthropic-api-key',
  'openai-api-key',
  'emailjs-config',
]

const ENCRYPTION_PREFIX = 'enc:v1:'
const PBKDF2_SALT = 'aeo-dashboard-v1'
const PBKDF2_ITERATIONS = 100_000
const IV_BYTES = 12

// Module-level state (singleton)
let _cryptoKey = null
let _cache = new Map()
let _initialized = false

/* ── Base64 helpers ── */

function _b64(uint8) {
  let bin = ''
  for (let i = 0; i < uint8.length; i++) bin += String.fromCharCode(uint8[i])
  return btoa(bin)
}

function _unb64(str) {
  const bin = atob(str)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

/* ── Key Derivation ── */

async function _deriveKey(uid) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(uid), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(PBKDF2_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/* ── Encrypt / Decrypt ── */

async function _encrypt(plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, _cryptoKey, encoded
  )
  return ENCRYPTION_PREFIX + _b64(iv) + ':' + _b64(new Uint8Array(ciphertext))
}

async function _decrypt(stored) {
  if (!stored.startsWith(ENCRYPTION_PREFIX)) return stored
  const parts = stored.slice(ENCRYPTION_PREFIX.length).split(':')
  if (parts.length !== 2) throw new Error('Invalid encrypted format')
  const iv = _unb64(parts[0])
  const ciphertext = _unb64(parts[1])
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, _cryptoKey, ciphertext
  )
  return new TextDecoder().decode(decrypted)
}

async function _encryptAndStore(key, value) {
  try {
    const encrypted = await _encrypt(value)
    localStorage.setItem(key, encrypted)
  } catch (err) {
    logger.warn(`secureStorage: failed to encrypt ${key}:`, err.message)
  }
}

/* ── Public API ── */

/**
 * Initialize secure storage — derive key and decrypt sensitive keys into cache.
 * Must be awaited before the app renders authenticated content.
 */
export async function initSecureStorage(uid) {
  if (!uid) {
    logger.warn('initSecureStorage called without uid')
    return
  }

  // Check Web Crypto availability
  if (!crypto?.subtle) {
    logger.warn('Web Crypto API not available — secure storage disabled')
    for (const key of SENSITIVE_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw) _cache.set(key, raw)
    }
    _initialized = true
    return
  }

  try {
    _cryptoKey = await _deriveKey(uid)
  } catch (err) {
    logger.error('Failed to derive encryption key:', err)
    for (const key of SENSITIVE_KEYS) {
      const raw = localStorage.getItem(key)
      if (raw && !raw.startsWith(ENCRYPTION_PREFIX)) _cache.set(key, raw)
    }
    _initialized = true
    return
  }

  // Decrypt each sensitive key into cache, auto-migrate plaintext
  for (const key of SENSITIVE_KEYS) {
    const raw = localStorage.getItem(key)
    if (!raw) continue

    if (raw.startsWith(ENCRYPTION_PREFIX)) {
      try {
        _cache.set(key, await _decrypt(raw))
      } catch (err) {
        logger.warn(`secureStorage: failed to decrypt ${key}, skipping:`, err.message)
      }
    } else {
      // Plaintext legacy — cache it and migrate to encrypted
      _cache.set(key, raw)
      try {
        const encrypted = await _encrypt(raw)
        localStorage.setItem(key, encrypted)
      } catch (err) {
        logger.warn(`secureStorage: failed to migrate ${key}:`, err.message)
      }
    }
  }

  _initialized = true
}

/** Clear key material and cache on sign-out. */
export function clearSecureStorage() {
  _cryptoKey = null
  _cache = new Map()
  _initialized = false
}

/** Synchronous read from memory cache. Returns '' if not initialized or key missing. */
export function secureGet(key) {
  if (!_initialized) return ''
  return _cache.get(key) || ''
}

/** Update cache immediately + async encrypt to localStorage. */
export function secureSet(key, value) {
  if (!value || !value.trim()) {
    _cache.delete(key)
    localStorage.removeItem(key)
    return
  }
  _cache.set(key, value)
  if (_cryptoKey) {
    _encryptAndStore(key, value)
  } else {
    // Fallback: store plaintext if crypto not available
    localStorage.setItem(key, value)
  }
}

/** Remove from both cache and localStorage. */
export function secureRemove(key) {
  _cache.delete(key)
  localStorage.removeItem(key)
}

/** Check if secure storage is initialized. */
export function isSecureStorageInitialized() {
  return _initialized
}

/** Standalone encrypt — for use by googleAuth.js to encrypt tokens before Firestore write. */
export async function encryptValue(plaintext) {
  if (!_cryptoKey) throw new Error('Secure storage not initialized')
  return _encrypt(plaintext)
}

/** Standalone decrypt — returns plaintext as-is if no enc:v1: prefix. */
export async function decryptValue(encrypted) {
  if (!encrypted || !encrypted.startsWith(ENCRYPTION_PREFIX)) return encrypted
  if (!_cryptoKey) throw new Error('Secure storage not initialized')
  return _decrypt(encrypted)
}
