import { memo } from 'react'
import { Shield, Menu } from 'lucide-react'

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

export default memo(function AdminTopBar({ user, activeView, onToggleSidebar }) {
  return (
    <div className="top-bar">
      <div className="top-bar-row-1" style={{ justifyContent: 'space-between' }}>
        {/* Hamburger + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="mobile-nav-group">
            <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
              <Menu size={18} />
            </button>
          </div>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            background: 'var(--accent-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={16} style={{ color: 'var(--accent)' }} />
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
            background: 'var(--accent-subtle)',
            color: 'var(--accent)',
            border: '0.0625rem solid var(--accent-subtle)',
          }}>
            SUPER ADMIN
          </span>
        </div>
      </div>
    </div>
  )
})
