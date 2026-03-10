/**
 * ProjectProfileForm — Full-screen modal to edit all project questionnaire fields.
 * Rendered from ProjectGeneralSection when user clicks "Edit Profile".
 */
import { useState, useCallback, useMemo } from 'react'
import {
  X, Check, Save, SearchCheck, Globe, Monitor, Bot,
  Layers, ShoppingCart, Heart, Landmark, Scale, Home,
  GraduationCap, Megaphone, Store, Newspaper, Briefcase,
} from 'lucide-react'
import {
  INDUSTRY_IDS, INDUSTRY_LABELS, REGION_IDS, REGION_LABELS,
  AUDIENCE_IDS, AUDIENCE_LABELS, GOAL_IDS, GOAL_LABELS,
  ENGINE_IDS, ENGINE_LABELS, ENGINE_COLORS,
  CONTENT_IDS, CONTENT_LABELS, MATURITY_IDS, MATURITY_LABELS,
  CMS_IDS, CMS_LABELS,
  COUNTRY_OPTIONS, COUNTRY_LABELS, LANGUAGE_OPTIONS,
} from '../utils/fieldDefinitions'
import { useFocusTrap } from '../hooks/useFocusTrap'

/* Icon map for industries (same as ProjectQuestionnaire) */
const INDUSTRY_ICON_MAP = {
  saas: Layers, ecommerce: ShoppingCart, healthcare: Heart, finance: Landmark,
  legal: Scale, realestate: Home, education: GraduationCap, agency: Megaphone,
  localbusiness: Store, media: Newspaper, other: Briefcase,
}

export default function ProjectProfileForm({ questionnaire, onSave, onCancel }) {
const trapRef = useFocusTrap(true)
  const [countrySearch, setCountrySearch] = useState('')

  const [answers, setAnswers] = useState({
    industry: questionnaire?.industry || null,
    industryOther: questionnaire?.industryOther || '',
    region: questionnaire?.region || null,
    countries: questionnaire?.countries?.length > 0 ? questionnaire.countries : questionnaire?.country ? [questionnaire.country] : [],
    audience: questionnaire?.audience || null,
    targetEngines: questionnaire?.targetEngines || [],
    primaryGoal: questionnaire?.primaryGoal || null,
    contentType: questionnaire?.contentType || null,
    maturity: questionnaire?.maturity || null,
    hasSchema: questionnaire?.hasSchema || null,
    updateCadence: questionnaire?.updateCadence || null,
    languages: questionnaire?.languages || ['en'],
    businessDescription: questionnaire?.businessDescription || '',
    topServices: questionnaire?.topServices || '',
    cms: questionnaire?.cms || null,
  })

  const update = useCallback((key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleEngine = useCallback((engine) => {
    setAnswers(prev => {
      if (engine === 'all') {
        return { ...prev, targetEngines: prev.targetEngines.includes('all') ? [] : ['all'] }
      }
      let next = prev.targetEngines.filter(e => e !== 'all')
      if (next.includes(engine)) {
        next = next.filter(e => e !== engine)
      } else {
        next = [...next, engine]
      }
      return { ...prev, targetEngines: next }
    })
  }, [])

  const toggleLanguage = useCallback((lang) => {
    setAnswers(prev => {
      const current = prev.languages || []
      if (current.includes(lang)) {
        return { ...prev, languages: current.filter(l => l !== lang) }
      }
      return { ...prev, languages: [...current, lang] }
    })
  }, [])

  const toggleCountry = useCallback((code) => {
    setAnswers(prev => {
      const current = prev.countries || []
      if (current.includes(code)) {
        return { ...prev, countries: current.filter(c => c !== code) }
      }
      return { ...prev, countries: [...current, code] }
    })
    setCountrySearch('')
  }, [])

  /* Translated option arrays */
  const INDUSTRY_OPTIONS = useMemo(() => INDUSTRY_IDS.map(id => ({
    value: id, icon: INDUSTRY_ICON_MAP[id], label: INDUSTRY_LABELS[id] || id,
  })), [])

  const REGION_OPTIONS = useMemo(() => REGION_IDS.map(id => ({
    value: id, label: REGION_LABELS[id] || id,
  })), [])

  const AUDIENCE_OPTIONS = useMemo(() => AUDIENCE_IDS.map(id => ({
    value: id, label: AUDIENCE_LABELS[id] || id,
  })), [])

  const GOAL_OPTIONS = useMemo(() => GOAL_IDS.map(id => ({
    value: id, label: GOAL_LABELS[id] || id,
  })), [])

  const ENGINE_OPTIONS = useMemo(() => ENGINE_IDS.map(id => ({
    value: id, color: ENGINE_COLORS[id], label: ENGINE_LABELS[id] || id,
  })), [])

  const CONTENT_OPTIONS = useMemo(() => CONTENT_IDS.map(id => ({
    value: id, label: CONTENT_LABELS[id] || id,
  })), [])

  const MATURITY_OPTIONS = useMemo(() => MATURITY_IDS.map(id => ({
    value: id, label: MATURITY_LABELS[id] || id,
  })), [])

  const CMS_OPTIONS = useMemo(() => CMS_IDS.map(id => ({
    value: id, label: CMS_LABELS[id] || id,
  })), [])

  const countryOptions = useMemo(() => {
    if (!answers.region || answers.region === 'global') return []
    const options = (COUNTRY_OPTIONS[answers.region] || []).filter(c => !(answers.countries || []).includes(c.value))
    if (!countrySearch.trim()) return options
    const q = countrySearch.toLowerCase()
    return options.filter(c => c.label.toLowerCase().includes(q))
  }, [answers.region, countrySearch, answers.countries])

  const handleSave = () => {
    onSave(answers)
  }

  /* ── Shared sub-component styles ── */
  const sectionLabel = (text) => (
    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.0313rem' }}>
      {text}
    </p>
  )

  const chipButton = (value, label, isSelected, onClick, color = 'var(--accent)') => (
    <button
      key={value}
      onClick={onClick}
      style={{
        padding: '0.4375rem 0.875rem', borderRadius: 99, cursor: 'pointer',
        fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)',
        background: isSelected ? color : 'var(--hover-bg)',
        color: isSelected ? '#fff' : 'var(--text-secondary)',
        border: 'none', transition: 'all 150ms',
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(0.5rem)',
          animation: 'backdrop-fade-in 200ms ease-out both',
        }}
      />

      {/* Modal Card */}
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-form-title"
        style={{
          position: 'relative',
          width: '100%', maxWidth: 600,
          maxHeight: 'calc(100vh - 2.5rem)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'dialog-scale-in 250ms ease-out both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.125rem 1.5rem',
          borderBottom: '0.0625rem solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <h3 id="profile-form-title" style={{
            fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
          }}>
            {'Edit Project Profile'}
          </h3>
          <button
            onClick={onCancel}
            style={{
              padding: 4, borderRadius: 6, border: 'none', background: 'none',
              cursor: 'pointer', color: 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center',
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>

          {/* ── Industry ── */}
          {sectionLabel('Industry')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {INDUSTRY_OPTIONS.map(opt => {
              const Icon = opt.icon
              const isSelected = answers.industry === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => update('industry', opt.value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '0.75rem 0.375rem', borderRadius: 10, cursor: 'pointer',
                    background: isSelected ? 'rgba(255,107,53,0.1)' : 'var(--hover-bg)',
                    border: isSelected ? '0.125rem solid var(--color-phase-1)' : '0.125rem solid transparent',
                    color: isSelected ? 'var(--color-phase-1)' : 'var(--text-secondary)',
                    transition: 'all 150ms', fontFamily: 'var(--font-body)',
                  }}
                >
                  <Icon size={18} />
                  <span style={{ fontSize: 11, fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{opt.label}</span>
                </button>
              )
            })}
          </div>

          {answers.industry === 'other' && (
            <input
              type="text"
              placeholder={'Describe your industry...'}
              value={answers.industryOther}
              onChange={e => update('industryOther', e.target.value)}
              className="input-field"
              style={{ marginBottom: 16, width: '100%' }}
            />
          )}

          {/* ── Region ── */}
          {sectionLabel('Region')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {REGION_OPTIONS.map(opt => chipButton(
              opt.value, opt.label,
              answers.region === opt.value,
              () => { update('region', opt.value); update('countries', []); setCountrySearch('') },
              'var(--color-phase-1)',
            ))}
          </div>

          {/* Countries */}
          {(countryOptions.length > 0 || (answers.countries?.length > 0)) && answers.region && answers.region !== 'global' && (
            <div style={{ marginBottom: 16 }}>
              {answers.countries?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                  {answers.countries.map(code => (
                    <span key={code} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '0.25rem 0.625rem', borderRadius: 6,
                      fontSize: 11, fontWeight: 600,
                      background: 'rgba(255,107,53,0.1)', color: 'var(--color-phase-1)',
                      border: '0.0625rem solid rgba(255,107,53,0.2)',
                    }}>
                      {COUNTRY_LABELS[code] || code}
                      <button
                        onClick={() => toggleCountry(code)}
                        style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-phase-1)', display: 'flex', opacity: 0.7 }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <SearchCheck size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder={'Search countries...'}
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 30, width: '100%', fontSize: 12 }}
                />
              </div>
              {countryOptions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8, maxHeight: 80, overflowY: 'auto' }}>
                  {(countrySearch ? countryOptions : countryOptions.slice(0, 15)).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleCountry(opt.value)}
                      style={{
                        padding: '0.25rem 0.625rem', borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: 'var(--hover-bg)', color: 'var(--text-secondary)',
                        border: '0.0625rem solid var(--border-subtle)', transition: 'all 120ms',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Audience ── */}
          {sectionLabel('Audience')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {AUDIENCE_OPTIONS.map(opt => chipButton(
              opt.value, opt.label,
              answers.audience === opt.value,
              () => update('audience', opt.value),
              'var(--color-phase-1)',
            ))}
          </div>

          {/* ── Primary Goal ── */}
          {sectionLabel('Primary Goal')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {GOAL_OPTIONS.map(opt => chipButton(
              opt.value, opt.label,
              answers.primaryGoal === opt.value,
              () => update('primaryGoal', opt.value),
              'var(--color-phase-1)',
            ))}
          </div>

          {/* ── Target Engines ── */}
          {sectionLabel('Target Engines')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {ENGINE_OPTIONS.map(opt => {
              const isSelected = answers.targetEngines.includes(opt.value)
              const isAllSelected = answers.targetEngines.includes('all')
              const disabled = opt.value !== 'all' && isAllSelected
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleEngine(opt.value)}
                  disabled={disabled}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0.5rem 0.75rem', borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
                    background: isSelected ? `${opt.color}15` : 'var(--hover-bg)',
                    border: isSelected ? `0.125rem solid ${opt.color}` : '0.125rem solid transparent',
                    opacity: disabled ? 0.4 : 1,
                    transition: 'all 150ms', fontFamily: 'var(--font-body)',
                  }}
                >
                  <Bot size={13} style={{ color: isSelected ? opt.color : 'var(--text-tertiary)' }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: isSelected ? opt.color : 'var(--text-secondary)' }}>
                    {opt.label}
                  </span>
                  {isSelected && <Check size={11} style={{ color: opt.color }} />}
                </button>
              )
            })}
          </div>

          {/* ── Content Type ── */}
          {sectionLabel('Content Type')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {CONTENT_OPTIONS.map(opt => chipButton(
              opt.value, opt.label,
              answers.contentType === opt.value,
              () => update('contentType', opt.value),
              'var(--color-phase-3)',
            ))}
          </div>

          {/* ── Maturity ── */}
          {sectionLabel('AEO Maturity')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {MATURITY_OPTIONS.map(opt => chipButton(
              opt.value, opt.label,
              answers.maturity === opt.value,
              () => update('maturity', opt.value),
              'var(--color-phase-3)',
            ))}
          </div>

          {/* ── Schema ── */}
          {sectionLabel('Do you have schema markup on your site?')}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'unknown', label: 'Don\'t Know' },
            ].map(opt => chipButton(
              opt.value, opt.label,
              answers.hasSchema === opt.value,
              () => update('hasSchema', opt.value),
              'var(--color-phase-2)',
            ))}
          </div>

          {/* ── Update Cadence ── */}
          {sectionLabel('How often do you update content?')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ].map(opt => chipButton(
              opt.value, opt.label,
              answers.updateCadence === opt.value,
              () => update('updateCadence', opt.value),
              'var(--color-phase-2)',
            ))}
          </div>

          {/* ── Languages ── */}
          {sectionLabel(<><Globe size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />{'Languages'}</>)}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {LANGUAGE_OPTIONS.map(opt => chipButton(
              opt.value, opt.label,
              answers.languages.includes(opt.value),
              () => toggleLanguage(opt.value),
              'var(--color-phase-4)',
            ))}
          </div>

          {/* ── Business Description ── */}
          {sectionLabel('Description')}
          <textarea
            value={answers.businessDescription}
            onChange={e => update('businessDescription', e.target.value)}
            placeholder={'Briefly describe what your business does and who you serve. E.g.: We\'re a cloud hosting company serving small businesses across Europe, offering managed hosting and API integrations.'}
            className="input-field"
            rows={3}
            style={{ width: '100%', resize: 'vertical', fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}
          />

          {/* ── Top Services ── */}
          {sectionLabel('Services')}
          <input
            type="text"
            value={answers.topServices}
            onChange={e => update('topServices', e.target.value)}
            placeholder={'e.g., cloud hosting, API integrations, consulting services'}
            className="input-field"
            style={{ width: '100%', marginBottom: 14, fontSize: 12 }}
          />

          {/* ── CMS ── */}
          {sectionLabel(<><Monitor size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />{'CMS / Platform'}</>)}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {CMS_OPTIONS.map(opt => chipButton(
              opt.value, opt.label,
              answers.cms === opt.value,
              () => update('cms', answers.cms === opt.value ? null : opt.value),
              'var(--color-phase-4)',
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
          padding: '1rem 1.5rem',
          borderTop: '0.0625rem solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <button
            onClick={onCancel}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.5rem 1rem', fontSize: 12, fontWeight: 500,
              borderRadius: 8, border: '0.0625rem solid var(--border-default)',
              background: 'transparent', color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            {'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ padding: '0.5rem 1.125rem', fontSize: 12 }}
          >
            <Save size={13} />
            {'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
