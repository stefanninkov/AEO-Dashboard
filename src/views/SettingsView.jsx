/**
 * SettingsView — Tabbed settings layout.
 *
 * User-level tabs:
 *   - Profile      (name, email, appearance, shortcuts, tour)
 *   - API & Usage  (provider selector, API keys, model, usage dashboard)
 *   - Integrations (Google, EmailJS, future)
 *   - Projects     (overview grid → drill into project settings via sub-tabs)
 */
import { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft, ArrowRight, FolderCog, Unplug, UsersRound, Globe2, Webhook, HardDrive,
} from 'lucide-react'
import SettingsTabs from './settings/SettingsTabs'
import UserSettingsSection from './settings/UserSettingsSection'
import ApiUsageSection from './settings/ApiUsageSection'
import IntegrationsSection from './settings/IntegrationsSection'
import ProjectsOverviewSection from './settings/ProjectsOverviewSection'
import ProjectGeneralSection from './settings/ProjectGeneralSection'
import ProjectIntegrationsSection from './settings/ProjectIntegrationsSection'
import ProjectWebhooksSection from './settings/ProjectWebhooksSection'
import ProjectTeamSection from './settings/ProjectTeamSection'
import ProjectWebflowSection from './settings/ProjectWebflowSection'
import ProjectDataSection from './settings/ProjectDataSection'
import { useGoogleIntegration } from '../hooks/useGoogleIntegration'

/* ── Project settings sub-tab definitions ── */
const PROJECT_SUB_TABS = [
  { id: 'general', label: 'General', icon: FolderCog },
  { id: 'integrations', label: 'Integrations', icon: Unplug },
  { id: 'team', label: 'Team', icon: UsersRound },
  { id: 'webflow', label: 'Webflow', icon: Globe2 },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'data', label: 'Data', icon: HardDrive },
]

function ProjectSettingsSubTabs({ activeSubTab, onSubTabChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.125rem',
      borderBottom: '0.0625rem solid var(--border-subtle)',
      marginBottom: '1rem',
      overflowX: 'auto',
    }}>
      {PROJECT_SUB_TABS.map(tab => {
        const Icon = tab.icon
        const isActive = activeSubTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onSubTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: isActive ? 700 : 500,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: `0.125rem solid ${isActive ? 'var(--color-phase-1)' : 'transparent'}`,
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              transition: 'all 150ms',
              marginBottom: '-0.0625rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Icon size={13} strokeWidth={isActive ? 2 : 1.5} />
            <span className="hide-mobile-text">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function SettingsView({ activeProject, updateProject, deleteProject, user, setActiveView, permission, projects = [] }) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('aeo-settings-tab') || 'profile'
  })
  // Auto-select the active project when entering the Projects tab
  const [selectedProjectForSettings, setSelectedProjectForSettings] = useState(activeProject || null)
  const [activeProjectSubTab, setActiveProjectSubTab] = useState('general')
  const google = useGoogleIntegration(user)

  // Keep selectedProject in sync with live projects array (Firestore updates)
  const resolvedProject = useMemo(() => {
    if (!selectedProjectForSettings) return null
    return projects.find(p => p.id === selectedProjectForSettings.id) || selectedProjectForSettings
  }, [projects, selectedProjectForSettings])

  // Auto-select active project when it changes
  useEffect(() => {
    if (activeProject && !selectedProjectForSettings) {
      setSelectedProjectForSettings(activeProject)
    }
  }, [activeProject]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear drill-down if the selected project was deleted
  useEffect(() => {
    if (selectedProjectForSettings && !projects.find(p => p.id === selectedProjectForSettings.id)) {
      setSelectedProjectForSettings(null)
    }
  }, [projects, selectedProjectForSettings])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    localStorage.setItem('aeo-settings-tab', tab)
    // Reset project drill-down when switching tabs
    if (tab !== 'projects') {
      setSelectedProjectForSettings(null)
      setActiveProjectSubTab('general')
    }
  }

  const handleNavigateToProject = (project) => {
    setSelectedProjectForSettings(project)
    setActiveProjectSubTab('general')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab content */}
      {activeTab === 'profile' && <UserSettingsSection user={user} />}
      {activeTab === 'api-usage' && <ApiUsageSection />}
      {activeTab === 'integrations' && <IntegrationsSection user={user} />}

      {/* Projects tab — overview grid OR project drill-down */}
      {activeTab === 'projects' && !selectedProjectForSettings && (
        <>
          {/* Quick access banner for the currently active project */}
          {activeProject && (
            <div
              onClick={() => handleNavigateToProject(activeProject)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavigateToProject(activeProject) } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                marginBottom: '0.75rem',
                background: 'var(--bg-input)',
                borderRadius: '0.625rem',
                border: '0.0625rem solid var(--border-subtle)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                transition: 'border-color 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-phase-1)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <FolderCog size={13} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />
              <span>Quick access: <strong style={{ color: 'var(--text-primary)' }}>{activeProject.name || 'Untitled'}</strong> settings</span>
              <ArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </div>
          )}

          <ProjectsOverviewSection
            projects={projects}
            onNavigateToProject={handleNavigateToProject}
          />
        </>
      )}

      {/* Project drill-down view */}
      {activeTab === 'projects' && resolvedProject && (
        <>
          {/* Back button */}
          <div
            onClick={() => setSelectedProjectForSettings(null)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedProjectForSettings(null) } }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              transition: 'color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            <ArrowLeft size={13} />
            Back to all projects
          </div>

          {/* Project name header */}
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            padding: '0.25rem 0 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <FolderCog size={16} style={{ color: 'var(--color-phase-1)' }} />
            {resolvedProject.name || 'Untitled Project'} Settings
          </div>

          {/* Sub-tabs */}
          <ProjectSettingsSubTabs
            activeSubTab={activeProjectSubTab}
            onSubTabChange={setActiveProjectSubTab}
          />

          {/* Project section content */}
          {activeProjectSubTab === 'general' && (
            <ProjectGeneralSection activeProject={resolvedProject} updateProject={updateProject} google={google} permission={permission} />
          )}
          {activeProjectSubTab === 'integrations' && (
            <ProjectIntegrationsSection activeProject={resolvedProject} updateProject={updateProject} user={user} />
          )}
          {activeProjectSubTab === 'team' && (
            <ProjectTeamSection activeProject={resolvedProject} updateProject={updateProject} user={user} permission={permission} />
          )}
          {activeProjectSubTab === 'webflow' && (
            <ProjectWebflowSection activeProject={resolvedProject} updateProject={updateProject} />
          )}
          {activeProjectSubTab === 'webhooks' && (
            <ProjectWebhooksSection activeProject={resolvedProject} updateProject={updateProject} />
          )}
          {activeProjectSubTab === 'data' && (
            <ProjectDataSection activeProject={resolvedProject} updateProject={updateProject} deleteProject={deleteProject} setActiveView={setActiveView} permission={permission} />
          )}
        </>
      )}
    </div>
  )
}
