/**
 * SettingsView — Orchestrator that composes settings sub-sections.
 *
 * Refactored from a single 1,787-line file into focused sub-components:
 *   - UserSettingsSection     (Profile, API Key, Google, Appearance, Shortcuts, Tour)
 *   - ProjectGeneralSection   (Name, URL, Notes, Google Data Sources, Cache, Profile)
 *   - ProjectIntegrationsSection (Monitoring, Client Portal, EmailJS, Digest)
 *   - ProjectWebhooksSection  (Webhooks & Integrations)
 *   - ProjectDataSection      (Export/Import, Clear Data, Danger Zone)
 */
import { useGoogleIntegration } from '../hooks/useGoogleIntegration'
import { sectionLabelStyle } from './settings/SettingsShared'
import UserSettingsSection from './settings/UserSettingsSection'
import ProjectGeneralSection from './settings/ProjectGeneralSection'
import ProjectIntegrationsSection from './settings/ProjectIntegrationsSection'
import ProjectWebhooksSection from './settings/ProjectWebhooksSection'
import ProjectTeamSection from './settings/ProjectTeamSection'
import ProjectWebflowSection from './settings/ProjectWebflowSection'
import ProjectDataSection from './settings/ProjectDataSection'

export default function SettingsView({ activeProject, updateProject, deleteProject, user, setActiveView, permission }) {
  const google = useGoogleIntegration(user)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <UserSettingsSection user={user} />

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
