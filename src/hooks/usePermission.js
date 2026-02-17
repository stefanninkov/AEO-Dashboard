import { useMemo, useCallback } from 'react'
import { ROLES, PERMISSIONS, roleHasPermission } from '../utils/roles'

/**
 * Determines the current user's role and permissions for the active project.
 *
 * @param {{ user: object|null, activeProject: object|null }} opts
 * @returns {{
 *   currentRole: string,
 *   hasPermission: (p: string) => boolean,
 *   isOwner: boolean,
 *   canEdit: boolean,
 *   isAdmin: boolean,
 *   isViewer: boolean,
 *   PERMISSIONS: object,
 * }}
 */
export function usePermission({ user, activeProject }) {
  const currentRole = useMemo(() => {
    if (!user || !activeProject) return ROLES.viewer

    // Legacy project without ownerId — treat current user as admin
    if (!activeProject.ownerId) return ROLES.admin

    // Owner is always admin
    if (activeProject.ownerId === user.uid) return ROLES.admin

    // Look up role in members array
    const member = activeProject.members?.find(m => m.uid === user.uid)
    return member?.role || ROLES.viewer
  }, [user, activeProject])

  const hasPermission = useCallback(
    (permission) => roleHasPermission(currentRole, permission),
    [currentRole],
  )

  const isOwner = useMemo(
    () => Boolean(user && activeProject && activeProject.ownerId === user.uid),
    [user, activeProject],
  )

  const canEdit = useMemo(() => hasPermission(PERMISSIONS.PROJECT_EDIT), [hasPermission])
  const isAdmin = currentRole === ROLES.admin
  const isViewer = currentRole === ROLES.viewer

  return { currentRole, hasPermission, isOwner, canEdit, isAdmin, isViewer, PERMISSIONS }
}
