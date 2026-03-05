import { memo, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LayoutGrid, ListChecks, Swords, ScanSearch, NotebookPen,
  CalendarCog, Braces, Radar, ChartSpline, SearchCode,
  ChartColumnIncreasing, Sparkles, FileText, FlaskConical,
  SlidersHorizontal, Sun, Moon, LogOut, Plus, Star, ChevronDown, Search,
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
  scorer: Star,
  'content-ops': CalendarCog,
  schema: Braces,
  seo: Search,
  monitoring: Radar,
  metrics: ChartSpline,
  gsc: SearchCode,
  ga4: ChartColumnIncreasing,
  'aeo-impact': Sparkles,
  docs: FileText,
  testing: FlaskConical,
  settings: SlidersHorizontal,
}

const NAV_I18N_KEYS = {
  dashboard: 'nav.dashboard',
  checklist: 'nav.checklist',
  competitors: 'nav.competitors',
  analyzer: 'nav.analyzer',
  writer: 'nav.writer',
  scorer: 'nav.scorer',
  'content-ops': 'nav.contentOps',
  schema: 'nav.schema',
  seo: 'nav.seo',
  monitoring: 'nav.monitoring',
  metrics: 'nav.metrics',
  gsc: 'nav.searchConsole',
  ga4: 'nav.aiTraffic',
  'aeo-impact': 'nav.aeoImpact',
  docs: 'nav.docs',
  testing: 'nav.testing',
  settings: 'nav.settings',
}

/** Sidebar navigation groups — ordered top-to-bottom */
const NAV_GROUPS = [
  {
    i18nKey: 'sections.overview',
    items: ['dashboard', 'checklist'],
  },
  {
    i18nKey: 'sections.content',
    items: ['analyzer', 'writer', 'scorer', 'content-ops', 'schema', 'seo'],
  },
  {
    i18nKey: 'sections.analytics',
    items: ['monitoring', 'metrics', 'gsc', 'ga4', 'aeo-impact'],
  },
  {
    i18nKey: 'sections.reference',
    items: ['competitors', 'docs', 'testing'],
  },
]

/** Read collapsed state from localStorage — groups 1,2,3 collapsed by default */
const DEFAULT_COLLAPSED = { 1: true, 2: true, 3: true }

function getInitialCollapsed() {
  try {
    const stored = localStorage.getItem('aeo-sidebar-collapsed')
    return stored ? JSON.parse(stored) : DEFAULT_COLLAPSED
  } catch {
    return DEFAULT_COLLAPSED
  }
}

export default memo(function Sidebar({ activeView, setActiveView, onNewProject, user, onSignOut, sidebarOpen, closeSidebar, onlineMembers }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(getInitialCollapsed)

  const toggleGroup = useCallback((groupIndex) => {
    setCollapsed(prev => {
      const next = { ...prev, [groupIndex]: !prev[groupIndex] }
      try { localStorage.setItem('aeo-sidebar-collapsed', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const navGroups = useMemo(() =>
    NAV_GROUPS.map(group => ({
      label: t(group.i18nKey),
      items: group.items.map(id => ({
        id,
        label: t(NAV_I18N_KEYS[id]),
        icon: NAV_ICONS[id],
      })),
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

      {/* Nav Groups */}
      <nav>
        {navGroups.map((group, gi) => {
          const isCollapsed = !!collapsed[gi]
          const hasActiveChild = group.items.some(item => activeView === item.id)
          const isOverview = gi === 0
          return (
            <div key={gi} className="sidebar-group">
              {isOverview ? (
                <div className="sidebar-section-label">{group.label}</div>
              ) : (
                <button
                  className="sidebar-section-label sidebar-section-toggle"
                  onClick={() => toggleGroup(gi)}
                  aria-expanded={!isCollapsed}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={12}
                    className={`sidebar-section-chevron ${isCollapsed ? 'collapsed' : ''}`}
                  />
                </button>
              )}
              {isOverview ? (
                group.items.map(item => {
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
                })
              ) : (
                <div className={`sidebar-group-items ${isCollapsed && !hasActiveChild ? 'collapsed' : ''}`}>
                  <div className="sidebar-group-items-inner">
                    {group.items.map(item => {
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
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Settings — separate from groups */}
      <div className="sidebar-section-label">{t('sections.tools')}</div>
      <button
        onClick={() => handleNav('settings')}
        className={`sidebar-nav-item ${activeView === 'settings' ? 'active' : ''}`}
        style={{ width: '100%' }}
        aria-current={activeView === 'settings' ? 'page' : undefined}
      >
        <SlidersHorizontal size={16} strokeWidth={activeView === 'settings' ? 2 : 1.5} />
        {t('nav.settings')}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={(e) => toggleTheme(e)}
        className="sidebar-nav-item"
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={`Dark mode: ${theme === 'dark' ? 'on' : 'off'}`}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        {theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')}
      </button>

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
