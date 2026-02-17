/**
 * ProjectTeamSection — Team management as a Settings sub-section.
 * Moved from standalone TeamView into Settings.
 */
import { useState, useCallback } from 'react'
import {
  Users2, UserPlus, Shield, ShieldCheck, Eye, Crown,
  Mail, Trash2, Copy, Check, AlertCircle, Loader2, X,
} from 'lucide-react'
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '../../utils/roles'
import { useActivityWithWebhooks } from '../../hooks/useActivityWithWebhooks'
import { sectionTitleStyle } from './SettingsShared'

/* ── Avatar helpers ── */
const AVATAR_COLORS = [
  '#FF6B35', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899',
  '#F59E0B', '#06B6D4', '#EF4444', '#84CC16', '#6366F1',
]

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

/* ── Invite Modal ── */
const fieldLabelStyle = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  marginBottom: '0.375rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

function InviteModal({ onClose, onInvite, loading }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(ROLES.editor)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    onInvite(email.trim(), role)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '28rem',
          animation: 'scale-in 200ms ease-out both',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.125rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            Invite Team Member
          </h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={fieldLabelStyle}>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-disabled)',
                pointerEvents: 'none',
              }} />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.375rem' }}
                autoFocus
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={fieldLabelStyle}>Role</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.values(ROLES).filter(r => r !== ROLES.admin).map((r) => (
                <label
                  key={r}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    padding: '0.75rem',
                    borderRadius: '0.625rem',
                    border: `1px solid ${role === r ? 'var(--color-phase-1)' : 'var(--border-subtle)'}`,
                    background: role === r ? 'rgba(255,107,53,0.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    style={{ marginTop: '0.125rem', accentColor: 'var(--color-phase-1)' }}
                  />
                  <div>
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '0.125rem',
                    }}>
                      {ROLE_LABELS[r]}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      lineHeight: 1.5,
                    }}>
                      {ROLE_DESCRIPTIONS[r]}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !email.trim()}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Role Badge ── */
function RoleBadge({ role, isOwner }) {
  const config = {
    admin: { bg: 'rgba(255,107,53,0.1)', color: 'var(--color-phase-1)', icon: ShieldCheck },
    editor: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', icon: Shield },
    viewer: { bg: 'rgba(148,163,184,0.1)', color: 'var(--text-tertiary)', icon: Eye },
  }
  const c = config[role] || config.viewer
  const Icon = c.icon

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3125rem',
      fontSize: '0.6875rem',
      fontWeight: 600,
      padding: '0.1875rem 0.5rem',
      borderRadius: '0.375rem',
      background: c.bg,
      color: c.color,
      whiteSpace: 'nowrap',
    }}>
      {isOwner ? <Crown size={11} /> : <Icon size={11} />}
      {isOwner ? 'Owner' : ROLE_LABELS[role]}
    </span>
  )
}

const thStyle = {
  padding: '0.625rem 0.875rem',
  fontSize: '0.6875rem',
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  textAlign: 'left',
  borderBottom: '1px solid var(--border-subtle)',
}

/* ── Main Section ── */
export default function ProjectTeamSection({ activeProject, updateProject, user, permission }) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState(null)
  const [inviteSuccess, setInviteSuccess] = useState(null)
  const [copied, setCopied] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)

  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })

  const members = activeProject?.members || []
  const invitations = activeProject?.invitations || []
  const canManage = permission?.hasPermission('project:manage_members')

  const handleInvite = useCallback(async (email, role) => {
    setInviteError(null)
    setInviteSuccess(null)

    if (members.some(m => m.email === email)) {
      setInviteError('This person is already a team member.')
      return
    }
    if (invitations.some(i => i.email === email)) {
      setInviteError('An invitation has already been sent to this email.')
      return
    }

    setInviteLoading(true)
    try {
      const newInvitation = {
        email,
        role,
        invitedBy: user?.uid,
        invitedByName: user?.displayName || 'Unknown',
        invitedAt: new Date().toISOString(),
        status: 'pending',
      }
      await updateProject(activeProject.id, {
        invitations: [...invitations, newInvitation],
      })
      logAndDispatch('member_add', { memberName: email, memberRole: role }, user)
      setInviteSuccess(`Invitation sent to ${email}`)
      setInviteOpen(false)
      setTimeout(() => setInviteSuccess(null), 4000)
    } catch {
      setInviteError('Failed to send invitation. Please try again.')
    } finally {
      setInviteLoading(false)
    }
  }, [members, invitations, user, activeProject, updateProject])

  const handleRoleChange = useCallback(async (memberUid, newRole) => {
    if (!activeProject) return
    const member = members.find(m => m.uid === memberUid)
    const updatedMembers = members.map(m =>
      m.uid === memberUid ? { ...m, role: newRole } : m
    )
    await updateProject(activeProject.id, { members: updatedMembers })
    logAndDispatch('role_change', {
      memberUid, memberName: member?.displayName || member?.email || 'member',
      previousRole: member?.role, newRole,
    }, user)
  }, [members, activeProject, updateProject, user])

  const handleRemoveMember = useCallback(async (memberUid) => {
    if (!activeProject) return
    const member = members.find(m => m.uid === memberUid)
    const updatedMembers = members.filter(m => m.uid !== memberUid)
    const updatedMemberIds = (activeProject.memberIds || []).filter(id => id !== memberUid)
    await updateProject(activeProject.id, {
      members: updatedMembers,
      memberIds: updatedMemberIds,
    })
    logAndDispatch('member_remove', {
      memberUid, memberName: member?.displayName || member?.email || 'member',
    }, user)
    setConfirmRemove(null)
  }, [members, activeProject, updateProject, user])

  const handleCancelInvitation = useCallback(async (email) => {
    if (!activeProject) return
    const updatedInvitations = invitations.filter(i => i.email !== email)
    await updateProject(activeProject.id, { invitations: updatedInvitations })
  }, [invitations, activeProject, updateProject])

  const handleCopyInviteLink = useCallback(() => {
    const link = `${window.location.origin}${window.location.pathname}?invite=${activeProject?.id}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [activeProject])

  return (
    <>
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Section Title */}
        <div style={{ ...sectionTitleStyle, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users2 size={15} />
            Team
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 500,
              padding: '0.125rem 0.4375rem',
              borderRadius: '0.375rem',
              background: 'var(--hover-bg)',
              color: 'var(--text-tertiary)',
            }}>
              {members.length}
            </span>
          </div>
          {canManage && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-secondary"
                onClick={handleCopyInviteLink}
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.6875rem' }}
              >
                {copied ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Invite Link'}
              </button>
              <button
                className="btn-primary"
                onClick={() => { setInviteOpen(true); setInviteError(null) }}
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.6875rem' }}
              >
                <UserPlus size={12} />
                Invite
              </button>
            </div>
          )}
        </div>

        {/* Success / Error banners */}
        {inviteSuccess && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            background: 'rgba(16,185,129,0.06)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.75rem', color: 'var(--color-success)',
          }}>
            <Check size={13} />
            {inviteSuccess}
          </div>
        )}

        {inviteError && !inviteOpen && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            background: 'rgba(239,68,68,0.06)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.75rem', color: 'var(--color-error)',
          }}>
            <AlertCircle size={13} />
            {inviteError}
          </div>
        )}

        {/* Members Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th scope="col" style={thStyle}>Member</th>
                <th scope="col" style={thStyle}>Role</th>
                <th scope="col" style={{ ...thStyle, width: '7.5rem' }}>Joined</th>
                {canManage && <th scope="col" style={{ ...thStyle, width: '4rem', textAlign: 'center' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isOwner = activeProject.ownerId === member.uid
                const isSelf = user?.uid === member.uid

                return (
                  <tr
                    key={member.uid}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 100ms',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '0.5rem',
                          background: getAvatarColor(member.displayName),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {getInitials(member.displayName)}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                          }}>
                            {member.displayName || 'Unknown'}
                            {isSelf && (
                              <span style={{
                                fontSize: '0.625rem',
                                padding: '0.0625rem 0.3125rem',
                                borderRadius: '0.25rem',
                                background: 'var(--hover-bg)',
                                color: 'var(--text-tertiary)',
                                fontWeight: 500,
                              }}>
                                you
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            marginTop: '0.0625rem',
                          }}>
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      {canManage && !isOwner && !isSelf ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.uid, e.target.value)}
                          style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '0.375rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <RoleBadge role={member.role} isOwner={isOwner} />
                      )}
                    </td>
                    <td style={{
                      padding: '0.75rem 0.875rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                    }}>
                      {member.addedAt ? new Date(member.addedAt).toLocaleDateString() : '—'}
                    </td>
                    {canManage && (
                      <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                        {!isOwner && !isSelf ? (
                          confirmRemove === member.uid ? (
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                              <button
                                className="icon-btn"
                                onClick={() => handleRemoveMember(member.uid)}
                                title="Confirm remove"
                                style={{ color: 'var(--color-error)' }}
                              >
                                <Check size={14} />
                              </button>
                              <button
                                className="icon-btn"
                                onClick={() => setConfirmRemove(null)}
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="icon-btn"
                              onClick={() => setConfirmRemove(member.uid)}
                              title="Remove member"
                            >
                              <Trash2 size={14} />
                            </button>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-disabled)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
            }}>
              <Mail size={13} />
              Pending Invitations
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 500,
                padding: '0.0625rem 0.375rem',
                borderRadius: '0.375rem',
                background: 'rgba(245,158,11,0.1)',
                color: '#F59E0B',
              }}>
                {invitations.length}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th scope="col" style={thStyle}>Email</th>
                    <th scope="col" style={thStyle}>Role</th>
                    <th scope="col" style={thStyle}>Invited By</th>
                    <th scope="col" style={{ ...thStyle, width: '7.5rem' }}>Date</th>
                    {canManage && <th scope="col" style={{ ...thStyle, width: '4rem', textAlign: 'center' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr
                      key={inv.email}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 100ms',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '0.5rem',
                            background: 'var(--hover-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-disabled)',
                            flexShrink: 0,
                          }}>
                            <Mail size={14} />
                          </div>
                          <span style={{ color: 'var(--text-secondary)' }}>{inv.email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <RoleBadge role={inv.role} />
                      </td>
                      <td style={{
                        padding: '0.75rem 0.875rem',
                        color: 'var(--text-tertiary)',
                      }}>
                        {inv.invitedByName || '—'}
                      </td>
                      <td style={{
                        padding: '0.75rem 0.875rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                      }}>
                        {inv.invitedAt ? new Date(inv.invitedAt).toLocaleDateString() : '—'}
                      </td>
                      {canManage && (
                        <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                          <button
                            className="icon-btn"
                            onClick={() => handleCancelInvitation(inv.email)}
                            title="Cancel invitation"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Roles Reference */}
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
          }}>
            <Shield size={13} />
            Role Permissions
          </div>

          <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.values(ROLES).map((r) => (
              <div
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: 'var(--hover-bg)',
                }}
              >
                <RoleBadge role={r} />
                <p style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.5,
                  flex: 1,
                }}>
                  {ROLE_DESCRIPTIONS[r]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onInvite={handleInvite}
          loading={inviteLoading}
        />
      )}
    </>
  )
}
