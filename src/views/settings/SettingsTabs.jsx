/**
 * SettingsTabs — Horizontal tab navigation for the redesigned Settings view.
 *
 * Tabs: Profile | API & Usage | Integrations | Projects
 */
import { useRef } from 'react'
import { UserRound, KeyRound, Unplug, FolderKanban } from 'lucide-react'
import { useScrollActiveTab } from '../../hooks/useScrollActiveTab'

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'api-usage', label: 'API & Usage', icon: KeyRound },
  { id: 'integrations', label: 'Integrations', icon: Unplug },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
]

export default function SettingsTabs({ activeTab, onTabChange }) {
  const tabsRef = useRef(null)
  useScrollActiveTab(tabsRef, activeTab)
  return (
    <div ref={tabsRef} className="scrollable-tabs tab-bar-segmented" role="tablist" style={{ marginBottom: '1.25rem' }}>
      {TABS.map(tab => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            className="tab-segmented"
            role="tab"
            aria-selected={isActive}
            data-active={isActive || undefined}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
            <span className="hide-mobile-text">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
