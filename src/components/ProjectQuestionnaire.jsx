import { useState, useCallback, useMemo } from 'react'
import {
  ArrowRight, ArrowLeft, Check, Rocket, Bot, X,
  Layers, ShoppingCart, Heart, Landmark, Scale, Home,
  GraduationCap, Megaphone, Store, Newspaper, Briefcase,
  Lightbulb, Search, Globe, Monitor,
} from 'lucide-react'
import {
  INDUSTRY_LABELS, REGION_LABELS, AUDIENCE_LABELS,
  GOAL_LABELS, MATURITY_LABELS, COUNTRY_OPTIONS, COUNTRY_LABELS,
  LANGUAGE_LABELS, LANGUAGE_OPTIONS, CMS_LABELS,
} from '../utils/getRecommendations'
import { useFocusTrap } from '../hooks/useFocusTrap'

const TOTAL_STEPS = 6

const INDUSTRY_OPTIONS = [
  { value: 'saas', label: 'SaaS / Software', icon: Layers },
  { value: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
  { value: 'healthcare', label: 'Healthcare', icon: Heart },
  { value: 'finance', label: 'Finance', icon: Landmark },
  { value: 'legal', label: 'Legal', icon: Scale },
  { value: 'realestate', label: 'Real Estate', icon: Home },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'agency', label: 'Agency', icon: Megaphone },
  { value: 'localbusiness', label: 'Local Business', icon: Store },
  { value: 'media', label: 'Media', icon: Newspaper },
  { value: 'other', label: 'Other', icon: Briefcase },
]

const REGION_OPTIONS = [
  { value: 'us', label: 'US' },
  { value: 'europe', label: 'Europe' },
  { value: 'uk', label: 'UK' },
  { value: 'apac', label: 'Asia-Pacific' },
  { value: 'latam', label: 'LATAM' },
  { value: 'mena', label: 'MENA' },
  { value: 'global', label: 'Global' },
]

const AUDIENCE_OPTIONS = [
  { value: 'b2b', label: 'B2B', desc: 'Business customers' },
  { value: 'b2c', label: 'B2C', desc: 'Individual consumers' },
  { value: 'both', label: 'Both', desc: 'B2B and B2C' },
]

const GOAL_OPTIONS = [
  { value: 'citations', label: 'Get Cited', desc: 'Appear as a source in AI answers' },
  { value: 'answers', label: 'Show in Answers', desc: 'Be directly featured in AI results' },
  { value: 'traffic', label: 'Drive Traffic', desc: 'Get referral visits from AI engines' },
  { value: 'brand', label: 'Brand Authority', desc: 'Build recognition in AI ecosystems' },
  { value: 'all', label: 'All of Above', desc: 'Comprehensive AEO strategy' },
]

const ENGINE_OPTIONS = [
  { value: 'chatgpt', label: 'ChatGPT', color: '#10A37F' },
  { value: 'perplexity', label: 'Perplexity', color: '#7B2FBE' },
  { value: 'google-aio', label: 'Google AI', color: '#4285F4' },
  { value: 'bing-copilot', label: 'Bing Copilot', color: '#00A4EF' },
  { value: 'claude', label: 'Claude', color: '#D97706' },
  { value: 'all', label: 'All Engines', color: '#FF6B35' },
]

const CONTENT_OPTIONS = [
  { value: 'blog', label: 'Blog / Articles', desc: 'Written content & guides' },
  { value: 'product', label: 'Product Pages', desc: 'Product listings & info' },
  { value: 'docs', label: 'Documentation', desc: 'Technical docs & guides' },
  { value: 'landing', label: 'Landing Pages', desc: 'Marketing & conversion pages' },
  { value: 'mixed', label: 'Mixed', desc: 'Multiple content types' },
]

const MATURITY_OPTIONS = [
  { value: 'beginner', label: 'Just Starting', desc: 'New to AEO, starting from scratch' },
  { value: 'basics', label: 'Some Basics', desc: 'Basic SEO done, AEO is new' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some AEO implemented already' },
  { value: 'advanced', label: 'Advanced', desc: 'Active AEO, looking to optimize' },
]

const CMS_OPTIONS = [
  { value: 'wordpress', label: 'WordPress' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'webflow', label: 'Webflow' },
  { value: 'wix', label: 'Wix' },
  { value: 'squarespace', label: 'Squarespace' },
  { value: 'custom', label: 'Custom' },
  { value: 'other', label: 'Other' },
]

export default function ProjectQuestionnaire({ onComplete, onCancel, initialData, isNewProject }) {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const trapRef = useFocusTrap(true)
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
              Step {step + 1} of {TOTAL_STEPS}
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
                Tell us about your business
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                This helps us tailor recommendations to your industry.
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
                  <strong style={{ color: 'var(--text-primary)' }}>Why this matters:</strong> Your answers directly shape every recommendation, schema suggestion, and content strategy in this dashboard. The more accurate your profile, the more relevant and actionable your AEO roadmap becomes.
                </p>
              </div>

              {/* Industry Grid */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Industry
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
                  placeholder="Describe your industry..."
                  value={answers.industryOther}
                  onChange={e => update('industryOther', e.target.value)}
                  className="input-field"
                  style={{ marginBottom: 16, width: '100%' }}
                />
              )}

              {/* Region Chips */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Primary Region
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
                    Countries <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — select one or more for local targeting)</span>
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
                      placeholder="Search countries..."
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
                Who are you targeting?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                Understanding your audience and goals helps us prioritize the right AEO strategies.
              </p>

              {/* Audience */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Target Audience
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
                Primary Goal
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
                Which AI engines matter most?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                Select the AI platforms you want to optimize for. We'll focus your metrics and testing on these.
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
                Your content & experience
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                This helps us customize your checklist priority order.
              </p>

              {/* Content Type */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Main Content Type
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
                AEO Experience Level
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
                About your business
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                Help us understand your business so we can give you specific, actionable advice.
              </p>

              {/* Languages */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Globe size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Target Languages
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
                Business Description
              </p>
              <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 6, lineHeight: 1.4 }}>
                The more detail you provide, the more personalized your schema suggestions, content strategies, and recommendations will be.
              </p>
              <textarea
                value={answers.businessDescription}
                onChange={e => update('businessDescription', e.target.value)}
                placeholder="Briefly describe what your business does and who you serve. E.g.: We're a cloud hosting company serving small businesses across Europe, offering managed hosting and API integrations."
                className="input-field"
                rows={3}
                style={{ width: '100%', resize: 'vertical', fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}
              />

              {/* Top Products/Services */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Products / Services
              </p>
              <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 6, lineHeight: 1.4 }}>
                List your main offerings — this helps us suggest the right schema types and content topics for your business.
              </p>
              <input
                type="text"
                value={answers.topServices}
                onChange={e => update('topServices', e.target.value)}
                placeholder="e.g., cloud hosting, API integrations, consulting services"
                className="input-field"
                style={{ width: '100%', marginBottom: 14, fontSize: 12 }}
              />

              {/* CMS */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Monitor size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                CMS / Platform <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
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
                Current technical state
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                This helps us suggest the right starting point for your optimization.
              </p>

              {/* Schema */}
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Do you have schema markup on your site?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'unknown', label: "Don't Know" },
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
                How often do you update content?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'rarely', label: 'Rarely' },
                  { value: 'never', label: 'Never' },
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
                  Your Profile Summary
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
                      {answers.targetEngines.includes('all') ? 'All Engines' : `${answers.targetEngines.length} engines`}
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
                Back
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
                  Finish Setup
                </>
              ) : (
                <>
                  Next
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
