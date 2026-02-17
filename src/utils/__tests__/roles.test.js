import { describe, it, expect } from 'vitest'
import { ROLES, PERMISSIONS, roleHasPermission, ROLE_LABELS } from '../roles'

describe('ROLES', () => {
  it('defines admin, editor, viewer', () => {
    expect(ROLES.admin).toBe('admin')
    expect(ROLES.editor).toBe('editor')
    expect(ROLES.viewer).toBe('viewer')
  })
})

describe('roleHasPermission', () => {
  describe('admin', () => {
    it('has all permissions', () => {
      for (const perm of Object.values(PERMISSIONS)) {
        expect(roleHasPermission('admin', perm)).toBe(true)
      }
    })
  })

  describe('editor', () => {
    it('can edit projects', () => {
      expect(roleHasPermission('editor', PERMISSIONS.PROJECT_EDIT)).toBe(true)
    })

    it('can toggle checklist', () => {
      expect(roleHasPermission('editor', PERMISSIONS.CHECKLIST_TOGGLE)).toBe(true)
    })

    it('can run analyzer', () => {
      expect(roleHasPermission('editor', PERMISSIONS.ANALYZER_RUN)).toBe(true)
    })

    it('cannot delete projects', () => {
      expect(roleHasPermission('editor', PERMISSIONS.PROJECT_DELETE)).toBe(false)
    })

    it('cannot manage members', () => {
      expect(roleHasPermission('editor', PERMISSIONS.PROJECT_MANAGE_MEMBERS)).toBe(false)
    })
  })

  describe('viewer', () => {
    it('can view activity', () => {
      expect(roleHasPermission('viewer', PERMISSIONS.ACTIVITY_VIEW)).toBe(true)
    })

    it('cannot edit projects', () => {
      expect(roleHasPermission('viewer', PERMISSIONS.PROJECT_EDIT)).toBe(false)
    })

    it('cannot toggle checklist', () => {
      expect(roleHasPermission('viewer', PERMISSIONS.CHECKLIST_TOGGLE)).toBe(false)
    })

    it('cannot run analyzer', () => {
      expect(roleHasPermission('viewer', PERMISSIONS.ANALYZER_RUN)).toBe(false)
    })

    it('cannot export', () => {
      expect(roleHasPermission('viewer', PERMISSIONS.EXPORT_PDF)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('returns false for unknown role', () => {
      expect(roleHasPermission('superadmin', PERMISSIONS.PROJECT_EDIT)).toBe(false)
    })

    it('returns false for undefined role', () => {
      expect(roleHasPermission(undefined, PERMISSIONS.PROJECT_EDIT)).toBe(false)
    })

    it('returns false for null role', () => {
      expect(roleHasPermission(null, PERMISSIONS.PROJECT_EDIT)).toBe(false)
    })
  })
})

describe('ROLE_LABELS', () => {
  it('provides human-readable labels for all roles', () => {
    expect(ROLE_LABELS[ROLES.admin]).toBe('Admin')
    expect(ROLE_LABELS[ROLES.editor]).toBe('Editor')
    expect(ROLE_LABELS[ROLES.viewer]).toBe('Viewer')
  })
})
