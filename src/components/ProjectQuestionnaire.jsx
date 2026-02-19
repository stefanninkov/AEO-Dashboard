import { useState, useCallback, useMemo } from 'react'
import {
  ArrowRight, ArrowLeft, Check, Rocket, Bot, X,
  Layers, ShoppingCart, Heart, Landmark, Scale, Home,
  GraduationCap, Megaphone, Store, Newspaper, Briefcase,
  Lightbulb, Search, Globe, Monitor,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  INDUSTRY_LABELS, REGION_LABELS, AUDIENCE_LABELS,
  GOAL_LABELS, MATURITY_LABELS, COUNTRY_OPTIONS, COUNTRY_LABELS,
  LANGUAGE_LABELS, LANGUAGE_OPTIONS, CMS_LABELS,
} from '../utils/getRecommendations'
import { useFocusTrap } from '../hooks/useFocusTrap'

const TOTAL_STEPS = 6

/* Non-translatable metadata — icons, colors, values stay module-scope */
const INDUSTRY_META = [
  { value: 'saas', icon: Layers },
  { value: 'ecommerce', icon: ShoppingCart },
  { value: 'healthcare', icon: Heart },
  { value: 'finance', icon: Landmark },
  { value: 'legal', icon: Scale },
  { value: 'realestate', icon: Home },
  { value: 'education', icon: GraduationCap },
  { value: 'agency', icon: Megaphone },
  { value: 'localbusiness', icon: Store },
  { value: 'media', icon: Newspaper },
  { value: 'other', icon: Briefcase },
]

const REGION_IDS = ['us', 'europe', 'uk', 'apac', 'latam', 'mena', 'global']
const AUDIENCE_IDS = ['b2b', 'b2c', 'both']
const GOAL_IDS = ['citations', 'answers', 'traffic', 'brand', 'all']

const ENGINE_META = [
  { value: 'chatgpt', color: '#10A37F' },
  { value: 'perplexity', color: '#7B2FBE' },
  { value: 'google-aio', color: '#4285F4' },
  { value: 'bing-copilot', color: '#00A4EF' },
  { value: 'claude', color: '#D97706' },
  { value: 'all', color: '#FF6B35' },
]

const CONTENT_IDS = ['blog', 'product', 'docs', 'landing', 'mixed']
const MATURITY_IDS = ['beginner', 'basics', 'intermediate', 'advanced']
const CMS_IDS = ['wordpress', 'shopify', 'webflow', 'wix', 'squarespace', 'custom', 'other']

export default function ProjectQuestionnaire({ onComplete, onCancel, initialData, isNewProject }) {
  const { t } = useTranslation('app')
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const trapRef = useFocusTrap(true)

  /* Build translated option arrays */
  const INDUSTRY_OPTIONS = useMemo(() => INDUSTRY_META.map(m => ({
    ...m, label: t(`labels.industry.${m.value}`),
  })), [t])

  const REGION_OPTIONS = useMemo(() => REGION_IDS.map(id => ({
    value: id, label: t(`labels.region.${id}`),
  })), [t])

  const AUDIENCE_OPTIONS = useMemo(() => AUDIENCE_IDS.map(id => ({
    value: id, label: t(`questionnaire.audience.${id}.label`), desc: t(`questionnaire.audience.${id}.desc`),
  })), [t])

  const GOAL_OPTIONS = useMemo(() => GOAL_IDS.map(id => ({
    value: id, label: t(`questionnaire.goal.${id}.label`), desc: t(`questionnaire.goal.${id}.desc`),
  })), [t])

  const ENGINE_OPTIONS = useMemo(() => ENGINE_META.map(m => ({
    ...m, label: t(`labels.engine.${m.value}`),
  })), [t])

  const CONTENT_OPTIONS = useMemo(() => CONTENT_IDS.map(id => ({
    value: id, label: t(`questionnaire.content.${id}.label`), desc: t(`questionnaire.content.${id}.desc`),
  })), [t])

  const MATURITY_OPTIONS = useMemo(() => MATURITY_IDS.map(id => ({
    value: id, label: t(`questionnaire.maturity.${id}.label`), desc: t(`questionnaire.maturity.${id}.desc`),
  })), [t])

  const CMS_OPTIONS = useMemo(() => CMS_IDS.map(id => ({
    value: id, label: t(`labels.cms.${id}`),
  })), [t])
  const [answers, setAnswers] = useState({
    industry: initialData?.industry || null,
    industryOther: initialData?.industryOther || '',
    region: initialData?.region || null,
    countries: initialData?.countries?.length > 0 ? initialData.countries : initialData?.country ? [initialData.country] : [],
    audience: initialData?.audience || null,
    targetEngines: initialData?.targetEngines || [],
    primaryGoal: initialData?.primaryGoal || null,
    contentType: initialData?.contentType || null,
    maturity: initialData?.maturity || null,
    hasSchema: initialData?.hasSchema || null,
    updateCadence: initialData?.updateCadence || null,
    languages: initialData?.languages || ['en'],
    businessDescription: initialData?.businessDescription || '',
    topServices: initialData?.topServices || '',
    cms: initialData?.cms || null,
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

  // Countries filtered by selected region (excluding already selected)
  const countryOptions = useMemo(() => {
    if (!answers.region || answers.region === 'global') return []
    const options = (COUNTRY_OPTIONS[answers.region] || []).filter(c => !(answers.countries || []).includes(c.value))
    if (!countrySearch.trim()) return options
    const q = countrySearch.toLowerCase()
    return options.filter(c => c.label.toLowerCase().includes(q))
  }, [answers.region, countrySearch, answers.countries])

  const canProceed = () => {
    switch (step) {
      case 0: return answers.industry && answers.region
      case 1: return answers.audience && answers.primaryGoal
      case 2: return answers.targetEngines.length > 0
      case 3: return answers.contentType && answers.maturity
      case 4: return answers.languages.length > 0 && answers.businessDescription.trim().length > 0 && answers.topServices.trim().length > 0
      case 5: return answers.hasSchema && answers.updateCadence
      default: return true
    }
  }

  const handleNext = () => {
    if (step === TOTAL_STEPS - 1) {
      onComplete(answers)
      return
    }
    setAnimating(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setAnimating(false)
    }, 150)
  }

  const handlePrev = () => {
    if (step === 0) return
    setAnimating(true)
    setTimeout(() => {
      setStep(s => s - 1)
      setAnimating(false)
    }, 150)
  }

  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Backdrop — no click to dismiss */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          animation: 'backdrop-fade-in 200ms ease-out both',
        }}
      />

      {/* Card */}
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="questionnaire-title"
        style={{
          position: 'relative',
          width: '100%', maxWidth: 560,
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'dialog-scale-in 250ms ease-out both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div style={{ height: 3, background: 'var(--border-subtle)', flexShrink: 0 }}>
          <div
            style={{
              height: '100%', borderRadius: 2,
              background: 'linear-gradient(90deg, var(--color-phase-1), var(--color-phase-3))',
              width: `${progressPercent}%`,
              transition: 'width 300ms ease',
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            padding: '32px 32px 24px',
            opacity: animating ? 0 : 1,
            transition: 'opacity 120ms ease',
            minHeight: 340,
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* Header row: step indicator + cancel button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--color-phase-1)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              padding: '2px 8px', borderRadius: 4,
              background: 'rgba(255,107,53,0.1)',
            }}>
              {t('questionnaire.stepOf', { current: step + 1, total: TOTAL_STEPS })}
            </span>
            {onCancel && isNewProject && (
              <button
                onClick={onCancel}
                style={{
                  padding: 4, borderRadius: 6, border: 'none', background: 'none',
                  cursor: 'pointer', color: 'var(--text-tertiary)',
                  display: 'flex', alignItems: 'center',
                }}
                aria-label="Cancel questionnaire"
                title="Cancel"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ── Step 0: Industry & Region ── */}
          {step === 0 && (
            <div>
              <h3 id="questionnaire-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {t('questionnaire.step0.title')}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                {t('questionnaire.step0.desc')}
              </p>

              {/* Why this matters callout */}
              <div style={{
                display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,107,53,0.06)',
                border: '1px solid rgba(255,107,53,0.12)',
                marginBottom: 18,
              }}>
                <Lightbulb size={15} style={{ color: 'var(--color-phase-1)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{t('questionnaire.step0.whyMatters')}</strong> {t('questionnaire.step0.whyMattersDesc')}
                </p>
              </div>

              {/* Industry Grid */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step0.industryLabel')}
              </p>
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
                        padding: '12px 6px', borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(255,107,53,0.1)' : 'var(--hover-bg)',
                        border: isSelected ? '2px solid var(--color-phase-1)' : '2px solid transparent',
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
                  placeholder={t('questionnaire.step0.industryOtherPlaceholder')}
                  value={answers.industryOther}
                  onChange={e => update('industryOther', e.target.value)}
                  className="input-field"
                  style={{ marginBottom: 16, width: '100%' }}
                />
              )}

              {/* Region Chips */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step0.regionLabel')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: countryOptions.length > 0 ? 14 : 0 }}>
                {REGION_OPTIONS.map(opt => {
                  const isSelected = answers.region === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        update('region', opt.value)
                        update('countries', [])
                        setCountrySearch('')
                      }}
                      style={{
                        padding: '7px 14px', borderRadius: 99, cursor: 'pointer',
                        fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: isSelected ? 'var(--color-phase-1)' : 'var(--hover-bg)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        border: 'none', transition: 'all 150ms',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Country Selection (optional, multi-select, only when region has countries) */}
              {(countryOptions.length > 0 || (answers.countries?.length > 0)) && answers.region && answers.region !== 'global' && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('questionnaire.step0.countriesLabel')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{t('questionnaire.step0.countriesHint')}</span>
                  </p>

                  {/* Selected countries chips */}
                  {answers.countries?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                      {answers.countries.map(code => (
                        <span key={code} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          background: 'rgba(255,107,53,0.1)', color: 'var(--color-phase-1)',
                          border: '1px solid rgba(255,107,53,0.2)',
                        }}>
                          {COUNTRY_LABELS[code] || code}
                          <button
                            onClick={() => toggleCountry(code)}
                            style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-phase-1)', display: 'flex', opacity: 0.7 }}
                            aria-label={`Remove ${COUNTRY_LABELS[code] || code}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search input */}
                  <div style={{ position: 'relative' }}>
                    <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder={t('questionnaire.step0.searchCountries')}
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: 30, width: '100%', fontSize: 12 }}
                    />
                  </div>

                  {/* Available country chips */}
                  {countryOptions.length > 0 && (
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8,
                      maxHeight: 96, overflowY: 'auto',
                    }}>
                      {(countrySearch ? countryOptions : countryOptions.slice(0, 20)).map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => toggleCountry(opt.value)}
                          style={{
                            padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                            fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)',
                            background: 'var(--hover-bg)', color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)', transition: 'all 120ms',
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Audience & Goals ── */}
          {step === 1 && (
            <div>
              <h3 id="questionnaire-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {t('questionnaire.step1.title')}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                {t('questionnaire.step1.desc')}
              </p>

              {/* Audience */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step1.audienceLabel')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {AUDIENCE_OPTIONS.map(opt => {
                  const isSelected = answers.audience === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update('audience', opt.value)}
                      style={{
                        padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(255,107,53,0.1)' : 'var(--hover-bg)',
                        border: isSelected ? '2px solid var(--color-phase-1)' : '2px solid transparent',
                        textAlign: 'center', fontFamily: 'var(--font-body)',
                        transition: 'all 150ms',
                      }}
                    >
                      <p style={{ fontSize: 14, fontWeight: 600, color: isSelected ? 'var(--color-phase-1)' : 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* Primary Goal */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step1.goalLabel')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {GOAL_OPTIONS.map(opt => {
                  const isSelected = answers.primaryGoal === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update('primaryGoal', opt.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(255,107,53,0.1)' : 'var(--hover-bg)',
                        border: isSelected ? '2px solid var(--color-phase-1)' : '2px solid transparent',
                        textAlign: 'left', fontFamily: 'var(--font-body)',
                        transition: 'all 150ms',
                      }}
                    >
                      {isSelected && <Check size={14} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: isSelected ? 'var(--color-phase-1)' : 'var(--text-primary)' }}>{opt.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: AI Engines ── */}
          {step === 2 && (
            <div>
              <h3 id="questionnaire-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {t('questionnaire.step2.title')}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                {t('questionnaire.step2.desc')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
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
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '16px 10px', borderRadius: 12, cursor: disabled ? 'default' : 'pointer',
                        background: isSelected ? `${opt.color}15` : 'var(--hover-bg)',
                        border: isSelected ? `2px solid ${opt.color}` : '2px solid transparent',
                        opacity: disabled ? 0.4 : 1,
                        transition: 'all 150ms', fontFamily: 'var(--font-body)',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: isSelected ? opt.color : 'var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 150ms',
                      }}>
                        <Bot size={18} style={{ color: isSelected ? '#fff' : 'var(--text-tertiary)' }} />
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: isSelected ? opt.color : 'var(--text-secondary)',
                      }}>
                        {opt.label}
                      </span>
                      {isSelected && <Check size={12} style={{ color: opt.color }} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 3: Content & Maturity ── */}
          {step === 3 && (
            <div>
              <h3 id="questionnaire-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {t('questionnaire.step3.title')}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                {t('questionnaire.step3.desc')}
              </p>

              {/* Content Type */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step3.contentLabel')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {CONTENT_OPTIONS.map(opt => {
                  const isSelected = answers.contentType === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update('contentType', opt.value)}
                      style={{
                        padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(46,204,113,0.1)' : 'var(--hover-bg)',
                        border: isSelected ? '2px solid var(--color-phase-3)' : '2px solid transparent',
                        textAlign: 'center', fontFamily: 'var(--font-body)',
                        transition: 'all 150ms',
                      }}
                    >
                      <p style={{ fontSize: 12, fontWeight: 600, color: isSelected ? 'var(--color-phase-3)' : 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* Maturity */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step3.maturityLabel')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {MATURITY_OPTIONS.map(opt => {
                  const isSelected = answers.maturity === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update('maturity', opt.value)}
                      style={{
                        padding: '12px', borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(46,204,113,0.1)' : 'var(--hover-bg)',
                        border: isSelected ? '2px solid var(--color-phase-3)' : '2px solid transparent',
                        textAlign: 'left', fontFamily: 'var(--font-body)',
                        transition: 'all 150ms',
                      }}
                    >
                      <p style={{ fontSize: 12, fontWeight: 600, color: isSelected ? 'var(--color-phase-3)' : 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 4: About Your Business (NEW) ── */}
          {step === 4 && (
            <div>
              <h3 id="questionnaire-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {t('questionnaire.step4.title')}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                {t('questionnaire.step4.desc')}
              </p>

              {/* Languages */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Globe size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                {t('questionnaire.step4.languagesLabel')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                {LANGUAGE_OPTIONS.map(opt => {
                  const isSelected = answers.languages.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleLanguage(opt.value)}
                      style={{
                        padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
                        fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: isSelected ? 'var(--color-phase-4)' : 'var(--hover-bg)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        border: 'none', transition: 'all 150ms',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Business Description */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step4.businessDescLabel')}
              </p>
              <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 6, lineHeight: 1.4 }}>
                {t('questionnaire.step4.businessDescHint')}
              </p>
              <textarea
                value={answers.businessDescription}
                onChange={e => update('businessDescription', e.target.value)}
                placeholder={t('questionnaire.step4.businessDescPlaceholder')}
                className="input-field"
                rows={3}
                style={{ width: '100%', resize: 'vertical', fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}
              />

              {/* Top Products/Services */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step4.servicesLabel')}
              </p>
              <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 6, lineHeight: 1.4 }}>
                {t('questionnaire.step4.servicesHint')}
              </p>
              <input
                type="text"
                value={answers.topServices}
                onChange={e => update('topServices', e.target.value)}
                placeholder={t('questionnaire.step4.servicesPlaceholder')}
                className="input-field"
                style={{ width: '100%', marginBottom: 14, fontSize: 12 }}
              />

              {/* CMS */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Monitor size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                {t('questionnaire.step4.cmsLabel')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{t('questionnaire.step4.cmsHint')}</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CMS_OPTIONS.map(opt => {
                  const isSelected = answers.cms === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update('cms', isSelected ? null : opt.value)}
                      style={{
                        padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
                        fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: isSelected ? 'var(--color-phase-4)' : 'var(--hover-bg)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        border: 'none', transition: 'all 150ms',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 5: Current State ── */}
          {step === 5 && (
            <div>
              <h3 id="questionnaire-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {t('questionnaire.step5.title')}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                {t('questionnaire.step5.desc')}
              </p>

              {/* Schema */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step5.schemaLabel')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {[
                  { value: 'yes', label: t('questionnaire.step5.schemaYes') },
                  { value: 'no', label: t('questionnaire.step5.schemaNo') },
                  { value: 'unknown', label: t('questionnaire.step5.schemaDontKnow') },
                ].map(opt => {
                  const isSelected = answers.hasSchema === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update('hasSchema', opt.value)}
                      style={{
                        padding: '14px', borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(123,47,190,0.1)' : 'var(--hover-bg)',
                        border: isSelected ? '2px solid var(--color-phase-2)' : '2px solid transparent',
                        textAlign: 'center', fontFamily: 'var(--font-body)',
                        fontSize: 13, fontWeight: 600,
                        color: isSelected ? 'var(--color-phase-2)' : 'var(--text-secondary)',
                        transition: 'all 150ms',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Update cadence */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('questionnaire.step5.cadenceLabel')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { value: 'weekly', label: t('questionnaire.step5.cadenceWeekly') },
                  { value: 'monthly', label: t('questionnaire.step5.cadenceMonthly') },
                  { value: 'rarely', label: t('questionnaire.step5.cadenceRarely') },
                  { value: 'never', label: t('questionnaire.step5.cadenceNever') },
                ].map(opt => {
                  const isSelected = answers.updateCadence === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => update('updateCadence', opt.value)}
                      style={{
                        padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
                        fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: isSelected ? 'var(--color-phase-2)' : 'var(--hover-bg)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        border: 'none', transition: 'all 150ms',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Summary preview */}
              <div style={{
                marginTop: 24, padding: 16, borderRadius: 12,
                background: 'rgba(255,107,53,0.05)',
                border: '1px solid rgba(255,107,53,0.1)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-phase-1)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  {t('questionnaire.step5.profileSummary')}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {answers.industry && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {INDUSTRY_LABELS[answers.industry] || answers.industry}
                    </span>
                  )}
                  {answers.countries?.length > 0 ? (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {answers.countries.map(c => COUNTRY_LABELS[c] || c).join(', ')}{answers.region ? `, ${REGION_LABELS[answers.region]}` : ''}
                    </span>
                  ) : answers.region && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {REGION_LABELS[answers.region]}
                    </span>
                  )}
                  {answers.audience && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {AUDIENCE_LABELS[answers.audience]}
                    </span>
                  )}
                  {answers.primaryGoal && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {GOAL_LABELS[answers.primaryGoal]}
                    </span>
                  )}
                  {answers.targetEngines.length > 0 && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {answers.targetEngines.includes('all') ? t('questionnaire.step5.allEngines') : t('questionnaire.step5.enginesCount', { count: answers.targetEngines.length })}
                    </span>
                  )}
                  {answers.maturity && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {MATURITY_LABELS[answers.maturity]}
                    </span>
                  )}
                  {answers.languages.length > 0 && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {answers.languages.map(l => LANGUAGE_LABELS[l] || l).join(', ')}
                    </span>
                  )}
                  {answers.cms && (
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                      {CMS_LABELS[answers.cms] || answers.cms}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', borderTop: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                  background: i <= step ? 'var(--color-phase-1)' : 'var(--border-subtle)',
                  transition: 'all 250ms',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 14px', fontSize: 12, fontWeight: 500,
                  borderRadius: 8, border: '1px solid var(--border-default)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <ArrowLeft size={13} />
                {t('questionnaire.back')}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary"
              style={{
                padding: '8px 18px', fontSize: 12,
                opacity: canProceed() ? 1 : 0.4,
              }}
            >
              {step === TOTAL_STEPS - 1 ? (
                <>
                  <Rocket size={13} />
                  {t('questionnaire.finish')}
                </>
              ) : (
                <>
                  {t('questionnaire.next')}
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
