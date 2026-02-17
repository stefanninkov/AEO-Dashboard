import { memo } from 'react'
import {
  Zap, LayoutDashboard, CheckSquare, GitBranch, Zap as ZapIcon,
  BarChart3, BookOpen, FlaskConical, Sun, Moon, LogOut, Plus,
  Users, Users2, Settings, PenTool, Code2, Activity, Globe, Search
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import PresenceAvatars from './PresenceAvatars'

/* Generate consistent avatar color from a name string */
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

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'process', label: 'Process Map', icon: GitBranch },
  { id: 'analyzer', label: 'Analyzer', icon: ZapIcon },
  { id: 'writer', label: 'Content Writer', icon: PenTool },
  { id: 'schema', label: 'Schema Generator', icon: Code2 },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'gsc', label: 'Search Console', icon: Search },
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'testing', label: 'Testing', icon: FlaskConical },
  { id: 'team', label: 'Team', icon: Users2 },
  { id: 'webflow', label: 'Webflow', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default memo(function Sidebar({ activeView, setActiveView, onNewProject, user, onSignOut, sidebarOpen, closeSidebar, onlineMembers }) {
  const { theme, toggleTheme } = useTheme()

  const handleNav = (viewId) => {
    setActiveView(viewId)
    closeSidebar?.()
  }

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <Zap size={20} className="text-phase-1" style={{ flexShrink: 0 }} />
        <span className="sidebar-logo-text">AEO Dashboard</span>
      </div>

      {/* New Project Button */}
      <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
        <button
          onClick={() => { onNewProject(); closeSidebar?.() }}
          className="btn-primary"
          style={{ width: '100%', padding: '0.5625rem 1rem', fontSize: '0.8125rem' }}
        >
          <Plus size={14} />
          New Project
        </button>
      </div>

      {/* Section: Main */}
      <div className="sidebar-section-label">Main</div>

      {/* Nav Items */}
      <nav>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Online Members */}
      {onlineMembers && onlineMembers.length > 1 && (
        <div style={{ padding: '0.375rem 1rem' }}>
          <PresenceAvatars
            members={onlineMembers}
            currentUserUid={user?.uid}
            variant="compact"
          />
        </div>
      )}

      {/* Section: Tools */}
      <div className="sidebar-section-label">Tools</div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="sidebar-nav-item"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
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
            {user?.displayName || 'User'}
          </p>
          <p className="sidebar-user-email">
            {user?.email || ''}
          </p>
        </div>
        <div className="sidebar-user-actions">
          <button
            onClick={() => { handleNav('settings'); }}
            className="icon-btn"
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={14} />
          </button>
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
