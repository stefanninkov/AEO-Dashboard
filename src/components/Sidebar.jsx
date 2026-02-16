import {
  Zap, LayoutDashboard, CheckSquare, GitBranch, Zap as ZapIcon,
  BarChart3, BookOpen, FlaskConical, Sun, Moon, LogOut, User, Plus,
  Users, Settings
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'process', label: 'Process Map', icon: GitBranch },
  { id: 'analyzer', label: 'Analyzer', icon: ZapIcon },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'testing', label: 'Testing', icon: FlaskConical },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeView, setActiveView, onNewProject, user, onSignOut, sidebarOpen, closeSidebar }) {
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
        <div className="sidebar-user-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" />
          ) : (
            <User size={14} className="text-phase-1" />
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
        <button
          onClick={onSignOut}
          className="icon-btn"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
