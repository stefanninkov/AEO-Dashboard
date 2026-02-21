/**
 * SettingsTabs — Horizontal tab navigation for the redesigned Settings view.
 *
 * Tabs: Profile | API & Usage | Integrations | Projects
 */
import { UserRound, KeyRound, Unplug, FolderKanban } from 'lucide-react'

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'api-usage', label: 'API & Usage', icon: KeyRound },
  { id: 'integrations', label: 'Integrations', icon: Unplug },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
]

export default function SettingsTabs({ activeTab, onTabChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.25rem',
      padding: '0.25rem',
      background: 'var(--bg-input)',
      borderRadius: '0.75rem',
      marginBottom: '1.25rem',
      border: '1px solid var(--border-subtle)',
    }}>
      {TABS.map(tab => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.5625rem 0.75rem',
              borderRadius: '0.5625rem',
              border: 'none',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
            <span className="hide-mobile-text">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
