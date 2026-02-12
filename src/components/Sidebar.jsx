import {
  Zap, LayoutDashboard, CheckSquare, GitBranch, Zap as ZapIcon,
  BarChart3, BookOpen, FlaskConical, Sun, Moon, LogOut, User, Plus,
  Users, Settings
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import HintBadge from './HintBadge'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'Overview of all your AEO metrics and progress' },
  { id: 'competitors', label: 'Competitors', icon: Users, hint: 'Compare your AEO performance against competitors' },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare, hint: 'Track 200+ AEO tasks across 7 phases' },
  { id: 'process', label: 'Process Map', icon: GitBranch, hint: 'Visual flowchart of the AEO optimization process' },
  { id: 'analyzer', label: 'Analyzer', icon: ZapIcon, hint: 'AI-powered analysis of your website\'s AEO readiness' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, hint: 'Detailed metrics about your AI engine visibility' },
  { id: 'docs', label: 'Documentation', icon: BookOpen, hint: 'In-depth guides for every AEO task' },
  { id: 'testing', label: 'Testing', icon: FlaskConical, hint: 'Test your content across AI platforms' },
  { id: 'settings', label: 'Settings', icon: Settings, hint: 'Manage your profile, API key, and project settings' },
]

export default function Sidebar({ activeView, setActiveView, onNewProject, user, onSignOut, hintsMode }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Zap size={20} className="text-phase-1" style={{ flexShrink: 0 }} />
        <span className="sidebar-logo-text">AEO Dashboard</span>
      </div>

      {/* New Project Button */}
      <div style={{ padding: '0 16px', marginBottom: '8px' }}>
        <button
          onClick={onNewProject}
          className="btn-primary"
          style={{ width: '100%', padding: '9px 16px', fontSize: '13px' }}
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
            <HintBadge key={item.id} hint={item.hint} active={hintsMode} position="right">
              <button
                onClick={() => setActiveView(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                style={{ width: '100%' }}
              >
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                {item.label}
              </button>
            </HintBadge>
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
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,107,53,0.1)', flexShrink: 0 }}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <User size={14} className="text-phase-1" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.displayName || 'User'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || ''}
          </p>
        </div>
        <button
          onClick={onSignOut}
          style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Sign out"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
