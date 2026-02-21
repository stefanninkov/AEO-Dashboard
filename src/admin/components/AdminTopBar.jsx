import { memo } from 'react'
import { Shield } from 'lucide-react'

const VIEW_TITLES = {
  dashboard: 'Dashboard Overview',
  waitlist: 'Waitlist Signups',
  users: 'User Management',
  projects: 'Project Management',
  activity: 'Global Activity Log',
  feedback: 'User Feedback',
  chatlogs: 'AI Chat Logs',
  revenue: 'Revenue Dashboard',
  analytics: 'Platform Analytics',
  settings: 'Admin Settings',
}

export default memo(function AdminTopBar({ user, activeView }) {
  return (
    <div className="top-bar">
      <div className="top-bar-row-1" style={{ justifyContent: 'space-between' }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            background: 'rgba(255,107,53,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={16} style={{ color: 'var(--color-phase-1)' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {VIEW_TITLES[activeView] || 'Admin Panel'}
          </h1>
        </div>

        {/* User badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '0.5rem',
          background: 'var(--hover-bg)',
          border: '0.0625rem solid var(--border-subtle)',
        }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
          }}>
            {user?.displayName || user?.email}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5625rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04rem',
            padding: '0.125rem 0.4375rem',
            borderRadius: '0.25rem',
            background: 'rgba(255,107,53,0.1)',
            color: 'var(--color-phase-1)',
            border: '0.0625rem solid rgba(255,107,53,0.15)',
          }}>
            SUPER ADMIN
          </span>
        </div>
      </div>
    </div>
  )
})
