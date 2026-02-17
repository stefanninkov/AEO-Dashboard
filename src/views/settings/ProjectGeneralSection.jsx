/**
 * ProjectGeneralSection — Project name/URL/notes, Google Data Sources, Cache, Project Profile.
 */
import { useState, useCallback } from 'react'
import { FolderCog, Plug, Database, Save, Check, Trash2, ClipboardList } from 'lucide-react'
import { useToast } from '../../components/Toast'
import GscPropertySelector from '../../components/GscPropertySelector'
import Ga4PropertySelector from '../../components/Ga4PropertySelector'
import { getCacheStats, clearAllCache } from '../../utils/dataCache'
import {
  INDUSTRY_LABELS, REGION_LABELS, AUDIENCE_LABELS,
  GOAL_LABELS, MATURITY_LABELS, CONTENT_LABELS, ENGINE_LABELS,
} from '../../utils/getRecommendations'
import {
  sectionTitleStyle, settingsRowStyle, lastRowStyle,
  labelStyle, inlineSaveBtnStyle, flash,
} from './SettingsShared'

export default function ProjectGeneralSection({ activeProject, updateProject, google }) {
  const { addToast } = useToast()

  // Project fields
  const [projectName, setProjectName] = useState(activeProject?.name || '')
  const [projectUrl, setProjectUrl] = useState(activeProject?.url || '')
  const [webflowSiteId, setWebflowSiteId] = useState(activeProject?.webflowSiteId || '')
  const [projectNotes, setProjectNotes] = useState(activeProject?.notes || '')
  const [projectNameSaved, setProjectNameSaved] = useState(false)
  const [projectUrlSaved, setProjectUrlSaved] = useState(false)
  const [webflowSaved, setWebflowSaved] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  // Cache state
  const [cacheStats, setCacheStats] = useState(() => getCacheStats())
  const [clearCacheConfirm, setClearCacheConfirm] = useState(false)

  const handleSaveProjectName = useCallback(() => {
    if (!activeProject || !projectName.trim()) return
    updateProject(activeProject.id, { name: projectName.trim() })
    flash(setProjectNameSaved)
  }, [activeProject, projectName, updateProject])

  const handleSaveProjectUrl = useCallback(() => {
    if (!activeProject) return
    updateProject(activeProject.id, { url: projectUrl.trim() })
    flash(setProjectUrlSaved)
  }, [activeProject, projectUrl, updateProject])

  const handleSaveWebflowId = useCallback(() => {
    if (!activeProject) return
    updateProject(activeProject.id, { webflowSiteId: webflowSiteId.trim() })
    flash(setWebflowSaved)
  }, [activeProject, webflowSiteId, updateProject])

  const handleSaveNotes = useCallback(() => {
    if (!activeProject) return
    updateProject(activeProject.id, { notes: projectNotes })
    flash(setNotesSaved)
  }, [activeProject, projectNotes, updateProject])

  const handleClearGoogleCache = () => {
    if (!clearCacheConfirm) {
      setClearCacheConfirm(true)
      setTimeout(() => setClearCacheConfirm(false), 3000)
      return
    }
    clearAllCache()
    setCacheStats(getCacheStats())
    setClearCacheConfirm(false)
    addToast('success', 'Google data cache cleared')
  }

  const q = activeProject?.questionnaire

  return (
    <>
      {/* ── General ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><FolderCog size={15} /> General</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Project Name</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="input-field" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" aria-label="Project name" style={{ flex: 1 }} />
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveProjectName} disabled={!projectName.trim()}>
              {projectNameSaved ? <Check size={13} /> : <Save size={13} />}
              {projectNameSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Website URL</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="input-field" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://example.com" aria-label="Website URL" style={{ flex: 1 }} />
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveProjectUrl}>
              {projectUrlSaved ? <Check size={13} /> : <Save size={13} />}
              {projectUrlSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>Webflow Site ID</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="input-field" value={webflowSiteId} onChange={(e) => setWebflowSiteId(e.target.value)} placeholder="Optional" aria-label="Webflow site ID" style={{ flex: 1 }} />
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveWebflowId}>
              {webflowSaved ? <Check size={13} /> : <Save size={13} />}
              {webflowSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={{ ...labelStyle, alignSelf: 'flex-start', paddingTop: '0.625rem' }}>Notes</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <textarea className="input-field" value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} placeholder="Add notes about this project..." aria-label="Project notes" rows={3} style={{ flex: 1, resize: 'vertical', minHeight: '3.75rem' }} />
            <button className="btn-primary" style={{ ...inlineSaveBtnStyle, alignSelf: 'flex-start', marginTop: '0.125rem' }} onClick={handleSaveNotes}>
              {notesSaved ? <Check size={13} /> : <Save size={13} />}
              {notesSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Google Data Sources ── */}
      {google?.isConnected && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={sectionTitleStyle}><Plug size={15} /> Google Data Sources</div>
          <div style={{ padding: '0 1.25rem 0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
              Select which Search Console and Analytics properties to use for this project.
            </p>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>Search Console</span>
            <div style={{ flex: 1 }}>
              <GscPropertySelector
                accessToken={google.accessToken}
                selectedProperty={activeProject?.gscProperty || null}
                onSelectProperty={(siteUrl) => {
                  if (activeProject) {
                    updateProject(activeProject.id, { gscProperty: siteUrl })
                    addToast('success', `Search Console property set: ${siteUrl}`)
                  }
                }}
              />
            </div>
          </div>

          <div style={lastRowStyle}>
            <span style={labelStyle}>Analytics 4</span>
            <div style={{ flex: 1 }}>
              <Ga4PropertySelector
                accessToken={google.accessToken}
                selectedProperty={activeProject?.ga4Property || null}
                onSelectProperty={(propertyName) => {
                  if (activeProject) {
                    updateProject(activeProject.id, { ga4Property: propertyName })
                    addToast('success', `GA4 property set: ${propertyName}`)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Google Data Cache ── */}
      {google?.isConnected && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={sectionTitleStyle}><Database size={15} /> Google Data Cache</div>
          <div style={{ padding: '0 1.25rem 0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
              GSC and GA4 data is cached locally to improve performance. Stale data is shown while fresh data loads in the background.
            </p>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>Memory</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}><strong>{cacheStats.memoryEntries}</strong> entries</span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>Storage</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}><strong>{cacheStats.localStorageEntries}</strong> entries ({cacheStats.totalSizeKB} KB)</span>
          </div>

          <div style={lastRowStyle}>
            <span style={labelStyle} />
            <button
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem', color: clearCacheConfirm ? 'var(--color-error)' : undefined, borderColor: clearCacheConfirm ? 'var(--color-error)' : undefined }}
              onClick={handleClearGoogleCache}
            >
              <Trash2 size={13} />
              {clearCacheConfirm ? 'Are you sure?' : 'Clear All Cached Data'}
            </button>
          </div>
        </div>
      )}

      {/* ── Project Profile (from Questionnaire) ── */}
      {q?.completedAt && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={sectionTitleStyle}><ClipboardList size={15} /> Project Profile</div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>Industry</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
              {INDUSTRY_LABELS[q.industry] || q.industry || '\u2014'}
              {q.industryOther ? ` (${q.industryOther})` : ''}
            </span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>Region</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{REGION_LABELS[q.region] || q.region || '\u2014'}</span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>Audience</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{AUDIENCE_LABELS[q.audience] || q.audience || '\u2014'}</span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>Primary Goal</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{GOAL_LABELS[q.primaryGoal] || q.primaryGoal || '\u2014'}</span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>Target Engines</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {(q.targetEngines || []).map(e => (
                <span key={e} style={{ fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(255,107,53,0.1)', color: 'var(--color-phase-1)', fontWeight: 500 }}>
                  {ENGINE_LABELS[e] || e}
                </span>
              ))}
              {(!q.targetEngines || q.targetEngines.length === 0) && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{'\u2014'}</span>
              )}
            </div>
          </div>

          {q.maturity && (
            <div style={settingsRowStyle}>
              <span style={labelStyle}>AEO Maturity</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{MATURITY_LABELS[q.maturity] || q.maturity}</span>
            </div>
          )}

          {q.contentType && (
            <div style={settingsRowStyle}>
              <span style={labelStyle}>Content Type</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{CONTENT_LABELS[q.contentType] || q.contentType}</span>
            </div>
          )}

          <div style={lastRowStyle}>
            <span style={labelStyle}>Completed</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {new Date(q.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
