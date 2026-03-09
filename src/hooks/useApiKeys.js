import { useState, useCallback, useMemo } from 'react'

/**
 * useApiKeys — API key management for external integrations.
 *
 * Manages creation, revocation, and usage tracking of API keys.
 * Stored in project.apiKeys = ApiKey[]
 *
 * ApiKey: {
 *   id, name, prefix, hashedKey, permissions[], createdBy, createdAt,
 *   lastUsed, usageCount, expiresAt, revoked, revokedAt
 * }
 */
export function useApiKeys({ activeProject, updateProject, user }) {
  const [showNewKey, setShowNewKey] = useState(null) // Temporarily shows full key after creation

  const keys = useMemo(() =>
    activeProject?.apiKeys || [],
    [activeProject?.apiKeys]
  )

  const activeKeys = useMemo(() =>
    keys.filter(k => !k.revoked && (!k.expiresAt || new Date(k.expiresAt) > new Date())),
    [keys]
  )

  const revokedKeys = useMemo(() =>
    keys.filter(k => k.revoked),
    [keys]
  )

  const createKey = useCallback(({ name, permissions = ['read'], expiresInDays = null }) => {
    if (!activeProject?.id || !user?.uid) return null

    // Generate a random API key
    const rawKey = generateApiKey()
    const prefix = rawKey.slice(0, 8)

    const newKey = {
      id: `key-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name || 'Untitled Key',
      prefix,
      // In production this would be hashed server-side; here we store prefix only
      hashedKey: `${prefix}...${rawKey.slice(-4)}`,
      permissions,
      createdBy: user.uid,
      createdByName: user.displayName || user.email || 'Unknown',
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0,
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
        : null,
      revoked: false,
      revokedAt: null,
    }

    updateProject(activeProject.id, {
      apiKeys: [...keys, newKey],
    })

    // Temporarily show the full key (only time it's visible)
    setShowNewKey({ id: newKey.id, fullKey: rawKey })
    return newKey.id
  }, [activeProject, keys, user, updateProject])

  const revokeKey = useCallback((keyId) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      apiKeys: keys.map(k =>
        k.id === keyId ? { ...k, revoked: true, revokedAt: new Date().toISOString() } : k
      ),
    })
  }, [activeProject, keys, updateProject])

  const deleteKey = useCallback((keyId) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      apiKeys: keys.filter(k => k.id !== keyId),
    })
  }, [activeProject, keys, updateProject])

  const updateKeyName = useCallback((keyId, name) => {
    if (!activeProject?.id) return
    updateProject(activeProject.id, {
      apiKeys: keys.map(k =>
        k.id === keyId ? { ...k, name } : k
      ),
    })
  }, [activeProject, keys, updateProject])

  const dismissNewKey = useCallback(() => {
    setShowNewKey(null)
  }, [])

  return {
    keys,
    activeKeys,
    revokedKeys,
    createKey,
    revokeKey,
    deleteKey,
    updateKeyName,
    showNewKey,
    dismissNewKey,
  }
}

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const segments = []
  for (let s = 0; s < 4; s++) {
    let seg = ''
    for (let i = 0; i < 8; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(seg)
  }
  return `aeo_${segments.join('_')}`
}
