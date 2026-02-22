import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Tests for useShareLink — localStorage mode only.
 * Firebase is not configured in the test environment, so all storage
 * operations fall back to localStorage.
 */

// Mock firebase modules before importing the module under test
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.reject(new Error('Not configured'))),
  getDoc: vi.fn(() => Promise.reject(new Error('Not configured'))),
  deleteDoc: vi.fn(() => Promise.reject(new Error('Not configured'))),
}))

vi.mock('../../firebase', () => ({
  db: null,
}))

describe('useShareLink (localStorage mode)', () => {
  let createShareLink, fetchSharedProject, revokeShareLink, getProjectShares

  beforeEach(async () => {
    vi.resetModules()
    window.localStorage.clear()

    // Mock crypto.getRandomValues
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: (arr) => {
          for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
          return arr
        },
      },
      writable: true,
    })

    const mod = await import('../useShareLink')
    createShareLink = mod.createShareLink
    fetchSharedProject = mod.fetchSharedProject
    revokeShareLink = mod.revokeShareLink
    getProjectShares = mod.getProjectShares
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('createShareLink returns a URL containing ?share= token', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const project = { id: 'proj-1', name: 'My Site', url: 'https://example.com', checked: { 'p1-c1-i1': true } }
    const url = await createShareLink(project, 'user-123')

    expect(url).toContain('?share=')
    // Token should be 48-char hex (192 bits)
    const token = url.split('?share=')[1]
    expect(token.length).toBe(48)
    expect(/^[0-9a-f]+$/.test(token)).toBe(true)
  })

  it('fetchSharedProject retrieves data saved by createShareLink', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const project = { id: 'proj-2', name: 'Test', url: '', checked: {} }
    const url = await createShareLink(project, 'user-456')
    const token = url.split('?share=')[1]

    const data = await fetchSharedProject(token)
    expect(data.projectId).toBe('proj-2')
    expect(data.snapshot.name).toBe('Test')
    expect(data.userId).toBe('user-456')
  })

  it('fetchSharedProject throws for non-existent token', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(fetchSharedProject('non-existent-token')).rejects.toThrow('Share link not found or expired')
  })

  it('revokeShareLink removes the share', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const project = { id: 'proj-3', name: 'Revoke Test', url: '', checked: {} }
    const url = await createShareLink(project, 'user-789')
    const token = url.split('?share=')[1]

    // Verify it exists first
    const data = await fetchSharedProject(token)
    expect(data.projectId).toBe('proj-3')

    // Now revoke
    await revokeShareLink(token)

    // Should be gone
    await expect(fetchSharedProject(token)).rejects.toThrow()
  })

  it('getProjectShares returns shares for a specific project', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const project = { id: 'proj-shares', name: 'Shares Test', url: '', checked: {} }
    await createShareLink(project, 'user-1')
    await createShareLink(project, 'user-1')

    const shares = getProjectShares('proj-shares')
    expect(shares.length).toBe(2)
    shares.forEach(s => {
      expect(s.projectId).toBe('proj-shares')
      expect(s.token).toBeTruthy()
    })
  })

  it('getProjectShares returns empty array for unknown project', () => {
    const shares = getProjectShares('non-existent')
    expect(shares).toEqual([])
  })

  it('snapshot strips sensitive fields and limits history', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const bigHistory = Array.from({ length: 50 }, (_, i) => ({ date: `2024-01-${i}` }))
    const project = {
      id: 'proj-snap',
      name: 'Snapshot Test',
      url: 'https://example.com',
      checked: { 'p1-c1-i1': true },
      monitorHistory: bigHistory,
      metricsHistory: bigHistory,
      analyzerResults: { score: 80 },
      questionnaire: { q1: 'answer' },
      _internalField: 'should be stripped',
    }

    const url = await createShareLink(project, 'user-snap')
    const token = url.split('?share=')[1]
    const data = await fetchSharedProject(token)

    // History should be capped at 30
    expect(data.snapshot.monitorHistory.length).toBe(30)
    expect(data.snapshot.metricsHistory.length).toBe(30)
    // Snapshot should contain expected fields
    expect(data.snapshot.name).toBe('Snapshot Test')
    expect(data.snapshot.checked).toEqual({ 'p1-c1-i1': true })
    expect(data.snapshot.analyzerResults).toEqual({ score: 80 })
    // Internal fields should not be in snapshot
    expect(data.snapshot._internalField).toBeUndefined()
  })
})
