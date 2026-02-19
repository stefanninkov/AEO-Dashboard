/**
 * ProjectGeneralSection — Project name/URL/notes, Google Data Sources, Cache, Project Profile.
 */
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderCog, Plug, Database, Save, Check, Trash2, ClipboardList } from 'lucide-react'
import { useToast } from '../../components/Toast'
import GscPropertySelector from '../../components/GscPropertySelector'
import Ga4PropertySelector from '../../components/Ga4PropertySelector'
import { getCacheStats, clearAllCache } from '../../utils/dataCache'
import {
  INDUSTRY_LABELS, REGION_LABELS, AUDIENCE_LABELS,
  GOAL_LABELS, MATURITY_LABELS, CONTENT_LABELS, ENGINE_LABELS,
  COUNTRY_LABELS, LANGUAGE_LABELS, CMS_LABELS,
} from '../../utils/getRecommendations'
import {
  sectionTitleStyle, settingsRowStyle, lastRowStyle,
  labelStyle, inlineSaveBtnStyle, flash,
} from './SettingsShared'

export default function ProjectGeneralSection({ activeProject, updateProject, google }) {
  const { t } = useTranslation('app')
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
    addToast('success', t('projectGeneral.cacheCleared'))
  }

  const q = activeProject?.questionnaire

  return (
    <>
      {/* ── General ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><FolderCog size={15} /> {t('projectGeneral.general')}</div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectGeneral.projectName')}</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="input-field" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder={t('projectGeneral.projectNamePlaceholder')} aria-label={t('projectGeneral.projectNamePlaceholder')} style={{ flex: 1 }} />
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveProjectName} disabled={!projectName.trim()}>
              {projectNameSaved ? <Check size={13} /> : <Save size={13} />}
              {projectNameSaved ? t('projectGeneral.saved') : t('projectGeneral.save')}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectGeneral.websiteUrl')}</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="input-field" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://example.com" aria-label={t('projectGeneral.websiteUrl')} style={{ flex: 1 }} />
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveProjectUrl}>
              {projectUrlSaved ? <Check size={13} /> : <Save size={13} />}
              {projectUrlSaved ? t('projectGeneral.saved') : t('projectGeneral.save')}
            </button>
          </div>
        </div>

        <div style={settingsRowStyle}>
          <span style={labelStyle}>{t('projectGeneral.webflowSiteId')}</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="input-field" value={webflowSiteId} onChange={(e) => setWebflowSiteId(e.target.value)} placeholder={t('projectGeneral.optional')} aria-label={t('projectGeneral.webflowSiteId')} style={{ flex: 1 }} />
            <button className="btn-primary" style={inlineSaveBtnStyle} onClick={handleSaveWebflowId}>
              {webflowSaved ? <Check size={13} /> : <Save size={13} />}
              {webflowSaved ? t('projectGeneral.saved') : t('projectGeneral.save')}
            </button>
          </div>
        </div>

        <div style={lastRowStyle}>
          <span style={{ ...labelStyle, alignSelf: 'flex-start', paddingTop: '0.625rem' }}>{t('projectGeneral.notes')}</span>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <textarea className="input-field" value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} placeholder={t('projectGeneral.notesPlaceholder')} aria-label={t('projectGeneral.notes')} rows={3} style={{ flex: 1, resize: 'vertical', minHeight: '3.75rem' }} />
            <button className="btn-primary" style={{ ...inlineSaveBtnStyle, alignSelf: 'flex-start', marginTop: '0.125rem' }} onClick={handleSaveNotes}>
              {notesSaved ? <Check size={13} /> : <Save size={13} />}
              {notesSaved ? t('projectGeneral.saved') : t('projectGeneral.save')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Google Data Sources ── */}
      {google?.isConnected && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={sectionTitleStyle}><Plug size={15} /> {t('projectGeneral.googleDataSources')}</div>
          <div style={{ padding: '0 1.25rem 0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
              {t('projectGeneral.googleDataDesc')}
            </p>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.searchConsole')}</span>
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
            <span style={labelStyle}>{t('projectGeneral.analytics4')}</span>
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
          <div style={sectionTitleStyle}><Database size={15} /> {t('projectGeneral.googleCache')}</div>
          <div style={{ padding: '0 1.25rem 0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
              {t('projectGeneral.cacheDesc')}
            </p>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.memory')}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{t('projectGeneral.entries', { count: cacheStats.memoryEntries })}</span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.storage')}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{t('projectGeneral.entriesWithSize', { count: cacheStats.localStorageEntries, size: cacheStats.totalSizeKB })}</span>
          </div>

          <div style={lastRowStyle}>
            <span style={labelStyle} />
            <button
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4375rem 0.875rem', color: clearCacheConfirm ? 'var(--color-error)' : undefined, borderColor: clearCacheConfirm ? 'var(--color-error)' : undefined }}
              onClick={handleClearGoogleCache}
            >
              <Trash2 size={13} />
              {clearCacheConfirm ? t('projectGeneral.clearCacheConfirm') : t('projectGeneral.clearCache')}
            </button>
          </div>
        </div>
      )}

      {/* ── Project Profile (from Questionnaire) ── */}
      {q?.completedAt && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={sectionTitleStyle}><ClipboardList size={15} /> {t('projectGeneral.projectProfile')}</div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.industry')}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
              {INDUSTRY_LABELS[q.industry] || q.industry || '\u2014'}
              {q.industryOther ? ` (${q.industryOther})` : ''}
            </span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.region')}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
              {(q.countries?.length > 0 || q.country) ? `${(q.countries?.length > 0 ? q.countries : [q.country]).map(c => COUNTRY_LABELS[c] || c).join(', ')}, ` : ''}
              {REGION_LABELS[q.region] || q.region || '\u2014'}
            </span>
          </div>

          {q.languages?.length > 0 && (
            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('projectGeneral.languages')}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {q.languages.map(l => (
                  <span key={l} style={{ fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(46,204,113,0.1)', color: 'var(--color-phase-3)', fontWeight: 500 }}>
                    {LANGUAGE_LABELS[l] || l}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={settingsRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.audience')}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{AUDIENCE_LABELS[q.audience] || q.audience || '\u2014'}</span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.primaryGoal')}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{GOAL_LABELS[q.primaryGoal] || q.primaryGoal || '\u2014'}</span>
          </div>

          <div style={settingsRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.targetEngines')}</span>
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
              <span style={labelStyle}>{t('projectGeneral.aeoMaturity')}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{MATURITY_LABELS[q.maturity] || q.maturity}</span>
            </div>
          )}

          {q.contentType && (
            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('projectGeneral.contentType')}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{CONTENT_LABELS[q.contentType] || q.contentType}</span>
            </div>
          )}

          {q.cms && (
            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('projectGeneral.cmsPlatform')}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{CMS_LABELS[q.cms] || q.cms}</span>
            </div>
          )}

          {q.businessDescription?.trim() && (
            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('projectGeneral.description')}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {q.businessDescription.trim()}
              </span>
            </div>
          )}

          {q.topServices?.trim() && (
            <div style={settingsRowStyle}>
              <span style={labelStyle}>{t('projectGeneral.services')}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {q.topServices.trim()}
              </span>
            </div>
          )}

          <div style={lastRowStyle}>
            <span style={labelStyle}>{t('projectGeneral.completed')}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {new Date(q.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
