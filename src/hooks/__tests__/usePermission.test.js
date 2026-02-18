import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermission } from '../usePermission'
import { ROLES, PERMISSIONS } from '../../utils/roles'

/* ── Helper ── */
const setup = (user, activeProject) =>
  renderHook(() => usePermission({ user, activeProject }))

/* ══════════════════════════════════════════
   Role Detection
   ══════════════════════════════════════════ */

describe('usePermission — role detection', () => {
  it('returns viewer when user is null', () => {
    const { result } = setup(null, { ownerId: 'x' })
    expect(result.current.currentRole).toBe(ROLES.viewer)
  })

  it('returns viewer when project is null', () => {
    const { result } = setup({ uid: 'u1' }, null)
    expect(result.current.currentRole).toBe(ROLES.viewer)
  })

  it('returns admin for legacy project with no ownerId', () => {
    const { result } = setup({ uid: 'u1' }, { name: 'Legacy' })
    expect(result.current.currentRole).toBe(ROLES.admin)
  })

  it('returns admin when user is owner', () => {
    const { result } = setup({ uid: 'owner1' }, { ownerId: 'owner1' })
    expect(result.current.currentRole).toBe(ROLES.admin)
    expect(result.current.isOwner).toBe(true)
  })

  it('returns member role from members array', () => {
    const project = {
      ownerId: 'someone-else',
      members: [{ uid: 'u1', role: ROLES.editor }],
    }
    const { result } = setup({ uid: 'u1' }, project)
    expect(result.current.currentRole).toBe(ROLES.editor)
  })

  it('returns viewer when user not found in members', () => {
    const project = {
      ownerId: 'someone-else',
      members: [{ uid: 'other', role: ROLES.editor }],
    }
    const { result } = setup({ uid: 'u1' }, project)
    expect(result.current.currentRole).toBe(ROLES.viewer)
  })

  it('returns viewer when members array is empty', () => {
    const project = { ownerId: 'someone-else', members: [] }
    const { result } = setup({ uid: 'u1' }, project)
    expect(result.current.currentRole).toBe(ROLES.viewer)
  })
})

/* ══════════════════════════════════════════
   Derived Values
   ══════════════════════════════════════════ */

describe('usePermission — derived values', () => {
  it('isOwner is true only when user UID matches ownerId', () => {
    const { result } = setup({ uid: 'owner1' }, { ownerId: 'owner1' })
    expect(result.current.isOwner).toBe(true)
  })

  it('isOwner is false for non-owners', () => {
    const { result } = setup({ uid: 'u1' }, { ownerId: 'owner1', members: [{ uid: 'u1', role: ROLES.editor }] })
    expect(result.current.isOwner).toBe(false)
  })

  it('canEdit is true for admin', () => {
    const { result } = setup({ uid: 'owner1' }, { ownerId: 'owner1' })
    expect(result.current.canEdit).toBe(true)
    expect(result.current.isAdmin).toBe(true)
  })

  it('isViewer is true for viewer role', () => {
    const { result } = setup(null, { ownerId: 'x' })
    expect(result.current.isViewer).toBe(true)
  })

  it('hasPermission delegates to roleHasPermission', () => {
    const { result } = setup({ uid: 'owner1' }, { ownerId: 'owner1' })
    // Admin should have all permissions
    expect(result.current.hasPermission(PERMISSIONS.PROJECT_EDIT)).toBe(true)
    expect(result.current.hasPermission(PERMISSIONS.PROJECT_MANAGE_MEMBERS)).toBe(true)
  })

  it('viewer has limited permissions', () => {
    const { result } = setup(null, { ownerId: 'x' })
    expect(result.current.hasPermission(PERMISSIONS.PROJECT_EDIT)).toBe(false)
  })

  it('exposes PERMISSIONS constant', () => {
    const { result } = setup(null, null)
    expect(result.current.PERMISSIONS).toBe(PERMISSIONS)
  })
})
