/**
 * SettingsView — Tabbed settings layout.
 *
 * User-level tabs:
 *   - Profile      (name, email, appearance, shortcuts, tour)
 *   - API & Usage  (provider selector, API keys, model, usage dashboard)
 *   - Integrations (Google, EmailJS, future)
 *   - Projects     (overview of all projects with stats)
 *
 * Project-specific sections shown below tabs when a project is selected.
 */
import { useState } from 'react'
import { sectionLabelStyle } from './settings/SettingsShared'
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

export default function SettingsView({ activeProject, updateProject, deleteProject, user, setActiveView, permission, projects = [] }) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('aeo-settings-tab') || 'profile'
  })
  const google = useGoogleIntegration(user)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    localStorage.setItem('aeo-settings-tab', tab)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab content */}
      {activeTab === 'profile' && <UserSettingsSection user={user} />}
      {activeTab === 'api-usage' && <ApiUsageSection />}
      {activeTab === 'integrations' && <IntegrationsSection user={user} />}
      {activeTab === 'projects' && <ProjectsOverviewSection projects={projects} />}

      {/* Project-specific settings (always visible when project selected) */}
      {activeProject && (
        <>
          <div style={sectionLabelStyle}>Project Settings</div>
          <ProjectGeneralSection activeProject={activeProject} updateProject={updateProject} google={google} />
          <ProjectIntegrationsSection activeProject={activeProject} updateProject={updateProject} user={user} />
          <ProjectTeamSection activeProject={activeProject} updateProject={updateProject} user={user} permission={permission} />
          <ProjectWebflowSection activeProject={activeProject} updateProject={updateProject} />
          <ProjectWebhooksSection activeProject={activeProject} updateProject={updateProject} />
          <ProjectDataSection activeProject={activeProject} updateProject={updateProject} deleteProject={deleteProject} setActiveView={setActiveView} />
        </>
      )}
    </div>
  )
}
