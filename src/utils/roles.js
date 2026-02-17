/*
 * Role-based permission system for team collaboration.
 * Pure utility — no React dependencies.
 */

export const ROLES = {
  admin: 'admin',
  editor: 'editor',
  viewer: 'viewer',
}

export const PERMISSIONS = {
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE_MEMBERS: 'project:manage_members',
  CHECKLIST_TOGGLE: 'checklist:toggle',
  CHECKLIST_ADD_NOTE: 'checklist:add_note',
  ANALYZER_RUN: 'analyzer:run',
  CONTENT_WRITE: 'content:write',
  SCHEMA_GENERATE: 'schema:generate',
  MONITORING_CONFIGURE: 'monitoring:configure',
  SETTINGS_EDIT: 'settings:edit',
  EXPORT_PDF: 'export:pdf',
  EXPORT_EMAIL: 'export:email',
  COMPETITORS_MANAGE: 'competitors:manage',
  WEBFLOW_MANAGE: 'webflow:manage',
  ACTIVITY_VIEW: 'activity:view',
}

const ALL_PERMISSIONS = Object.values(PERMISSIONS)

const EDITOR_EXCLUDED = [
  PERMISSIONS.PROJECT_DELETE,
  PERMISSIONS.PROJECT_MANAGE_MEMBERS,
]

const ROLE_PERMISSIONS = {
  [ROLES.admin]: ALL_PERMISSIONS,
  [ROLES.editor]: ALL_PERMISSIONS.filter(p => !EDITOR_EXCLUDED.includes(p)),
  [ROLES.viewer]: [PERMISSIONS.ACTIVITY_VIEW],
}

export function roleHasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role]
  if (!perms) return false
  return perms.includes(permission)
}

export const ROLE_LABELS = {
  [ROLES.admin]: 'Admin',
  [ROLES.editor]: 'Editor',
  [ROLES.viewer]: 'Viewer',
}

export const ROLE_DESCRIPTIONS = {
  [ROLES.admin]: 'Full access — can manage members, delete projects, and configure all settings.',
  [ROLES.editor]: 'Can edit content, run tools, and manage checklist items. Cannot delete projects or manage members.',
  [ROLES.viewer]: 'Read-only access — can view project data and activity.',
}
