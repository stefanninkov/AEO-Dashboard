import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LayoutGrid, ListChecks, Swords, ScanSearch, NotebookPen,
  CalendarCog, Braces, Radar, ChartSpline, SearchCode,
  ChartColumnIncreasing, Sparkles, FileText, FlaskConical,
  SlidersHorizontal, Sun, Moon, LogOut, Plus,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import PresenceAvatars from './PresenceAvatars'
import { getInitials, getAvatarColor } from '../utils/avatar'

const NAV_ICONS = {
  dashboard: LayoutGrid,
  checklist: ListChecks,
  competitors: Swords,
  analyzer: ScanSearch,
  writer: NotebookPen,
  'content-ops': CalendarCog,
  schema: Braces,
  monitoring: Radar,
  metrics: ChartSpline,
  gsc: SearchCode,
  ga4: ChartColumnIncreasing,
  'aeo-impact': Sparkles,
  docs: FileText,
  testing: FlaskConical,
  settings: SlidersHorizontal,
}

const NAV_KEYS = [
  'dashboard', 'checklist', 'competitors', 'analyzer', 'writer',
  'content-ops', 'schema', 'monitoring', 'metrics', 'gsc',
  'ga4', 'aeo-impact', 'docs', 'testing', 'settings',
]

const NAV_I18N_KEYS = {
  dashboard: 'nav.dashboard',
  checklist: 'nav.checklist',
  competitors: 'nav.competitors',
  analyzer: 'nav.analyzer',
  writer: 'nav.writer',
  'content-ops': 'nav.contentOps',
  schema: 'nav.schema',
  monitoring: 'nav.monitoring',
  metrics: 'nav.metrics',
  gsc: 'nav.searchConsole',
  ga4: 'nav.aiTraffic',
  'aeo-impact': 'nav.aeoImpact',
  docs: 'nav.docs',
  testing: 'nav.testing',
  settings: 'nav.settings',
}

export default memo(function Sidebar({ activeView, setActiveView, onNewProject, user, onSignOut, sidebarOpen, closeSidebar, onlineMembers }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()

  const navItems = useMemo(() =>
    NAV_KEYS.map(id => ({
      id,
      label: t(NAV_I18N_KEYS[id]),
      icon: NAV_ICONS[id],
    })),
  [t])

  const handleNav = (viewId) => {
    setActiveView(viewId)
    closeSidebar?.()
  }

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-scroll">
      {/* Logo */}
      <div className="sidebar-logo">
        <Sparkles size={20} className="text-phase-1" style={{ flexShrink: 0 }} />
        <span className="sidebar-logo-text">{t('sidebar.appName')}</span>
      </div>

      {/* New Project Button */}
      <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
        <button
          onClick={() => { onNewProject(); closeSidebar?.() }}
          className="btn-primary"
          style={{ width: '100%', padding: '0.5625rem 1rem', fontSize: '0.8125rem' }}
        >
          <Plus size={14} />
          {t('actions.newProject')}
        </button>
      </div>

      {/* Section: Main */}
      <div className="sidebar-section-label">{t('sections.main')}</div>

      {/* Nav Items */}
      <nav>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={{ width: '100%' }}
              aria-current={isActive ? 'page' : undefined}
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
      <div className="sidebar-section-label">{t('sections.tools')}</div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="sidebar-nav-item"
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={`Dark mode: ${theme === 'dark' ? 'on' : 'off'}`}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        {theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')}
      </button>
      </div>

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
            {user?.displayName || t('sidebar.user')}
          </p>
          <p className="sidebar-user-email">
            {user?.email || ''}
          </p>
        </div>
        <div className="sidebar-user-actions">
          <button
            onClick={() => { handleNav('settings'); }}
            className="icon-btn"
            title={t('nav.settings')}
            aria-label={t('nav.settings')}
          >
            <SlidersHorizontal size={14} />
          </button>
          <button
            onClick={onSignOut}
            className="icon-btn"
            title={t('auth.signOut')}
            aria-label={t('auth.signOut')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
})
