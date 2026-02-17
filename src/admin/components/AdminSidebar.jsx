import { memo } from 'react'
import {
  Shield, LayoutDashboard, Users, FolderKanban, Activity,
  DollarSign, BarChart3, Settings, LogOut, Sun, Moon, ArrowLeft,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const AVATAR_COLORS = [
  '#FF6B35', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899',
  '#F59E0B', '#06B6D4', '#EF4444', '#84CC16', '#6366F1',
]

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default memo(function AdminSidebar({ activeView, setActiveView, user, onSignOut }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Shield size={20} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />
        <span className="sidebar-logo-text">Admin Panel</span>
      </div>

      {/* Section: Administration */}
      <div className="sidebar-section-label">Administration</div>

      {/* Nav Items */}
      <nav>
        {ADMIN_NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Section: Tools */}
      <div className="sidebar-section-label">Tools</div>

      {/* Theme Toggle */}
      <button onClick={toggleTheme} className="sidebar-nav-item">
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Back to App */}
      <button
        onClick={() => { window.location.href = window.location.origin + window.location.pathname + '?/app' }}
        className="sidebar-nav-item"
      >
        <ArrowLeft size={16} />
        Back to App
      </button>

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* User */}
      <div className="sidebar-user">
        <div
          className="sidebar-user-avatar"
          style={{
            background: user?.photoURL ? 'transparent' : getAvatarColor(user?.displayName),
            color: 'white',
          }}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" />
          ) : (
            <span className="sidebar-user-initials">{getInitials(user?.displayName)}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="sidebar-user-name">
            {user?.displayName || 'Admin'}
          </p>
          <p className="sidebar-user-email" style={{ color: 'var(--color-phase-1)' }}>
            Super Admin
          </p>
        </div>
        <div className="sidebar-user-actions">
          <button
            onClick={onSignOut}
            className="icon-btn"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
})
