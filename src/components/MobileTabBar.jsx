import { memo } from 'react'
import {
  Gauge, CheckSquare, Search, BarChart3, Menu,
} from 'lucide-react'

/**
 * MobileTabBar — Bottom navigation tab bar for mobile devices.
 *
 * Shows 5 primary tabs: Dashboard, Checklist, Analyzer, Metrics, More.
 * "More" opens the sidebar for full navigation.
 */

const TABS = [
  { id: 'dashboard', icon: Gauge, label: 'Home' },
  { id: 'checklist', icon: CheckSquare, label: 'Guide' },
  { id: 'analyzer', icon: Search, label: 'Analyze' },
  { id: 'metrics', icon: BarChart3, label: 'Metrics' },
  { id: 'more', icon: Menu, label: 'More' },
]

function MobileTabBar({ activeView, setActiveView, onToggleSidebar }) {
  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '3.5rem',
        background: 'var(--bg-card)',
        borderTop: '0.0625rem solid var(--border-subtle)',
        display: 'flex', alignItems: 'stretch',
        zIndex: 9000,
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {TABS.map(tab => {
        const isActive = tab.id === 'more' ? false : activeView === tab.id
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            onClick={() => {
              if (tab.id === 'more') {
                onToggleSidebar?.()
              } else {
                setActiveView(tab.id)
              }
            }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.125rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive ? 'var(--accent)' : 'var(--text-disabled)',
              transition: 'color 100ms',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '25%', right: '25%',
                height: '0.125rem', borderRadius: '0 0 0.125rem 0.125rem',
                background: 'var(--accent)',
              }} />
            )}

            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{
              fontSize: '0.5625rem', fontWeight: isActive ? 700 : 500,
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default memo(MobileTabBar)
