import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Sparkles, ArrowRight, ArrowLeft, Compass, CheckSquare, LayoutDashboard, Rocket,
  ChartColumnIncreasing, BookOpen, FlaskConical, SlidersHorizontal, PenTool, Code2, Activity,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '../hooks/useFocusTrap'

/* Non-translatable step metadata — icons, targets, views stay module-scope */
const STEP_META = [
  { id: 'welcome',           icon: Sparkles,        sectionKey: 'gettingStarted', target: null,                                view: null },
  { id: 'sidebar',           icon: Compass,         sectionKey: 'gettingStarted', target: '.sidebar',                          view: 'dashboard' },
  { id: 'project-switcher',  icon: LayoutDashboard, sectionKey: 'gettingStarted', target: '.top-bar-row-1 .relative',          view: 'dashboard' },
  { id: 'progress',          icon: ChartColumnIncreasing, sectionKey: 'gettingStarted', target: '.top-bar-progress',                 view: 'dashboard' },
  { id: 'dashboard',         icon: LayoutDashboard, sectionKey: 'coreTools',      target: '.stat-card',                        view: 'dashboard' },
  { id: 'checklist',         icon: CheckSquare,     sectionKey: 'coreTools',      target: '.checklist-stats-grid',             view: 'checklist' },
  { id: 'analyzer',          icon: Sparkles,        sectionKey: 'coreTools',      target: 'input[placeholder="https://example.com"]', view: 'analyzer' },
  { id: 'writer',            icon: PenTool,         sectionKey: 'creationTools',  target: null,                                view: 'writer' },
  { id: 'schema',            icon: Code2,           sectionKey: 'creationTools',  target: null,                                view: 'schema' },
  { id: 'testing',           icon: FlaskConical,    sectionKey: 'measurement',    target: null,                                view: 'testing' },
  { id: 'metrics-monitoring', icon: Activity,       sectionKey: 'measurement',    target: null,                                view: 'metrics' },
  { id: 'docs',              icon: BookOpen,        sectionKey: 'resources',      target: null,                                view: 'docs' },
  { id: 'settings',          icon: SlidersHorizontal, sectionKey: 'resources',      target: null,                                view: 'settings' },
  { id: 'get-started',       icon: Rocket,          sectionKey: 'letsGo',        target: null,                                view: null, hasCta: true },
]

export default function OnboardingTutorial({ onComplete, onSkip, setActiveView }) {
  const { t } = useTranslation('app')
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const prevHighlightRef = useRef(null)
  const trapRef = useFocusTrap(true)

  const STEPS = useMemo(() => STEP_META.map(meta => {
    const Icon = meta.icon
    return {
      ...meta,
      icon: <Icon size={24} />,
      title: t(`onboarding.steps.${meta.id}.title`),
      description: t(`onboarding.steps.${meta.id}.desc`),
      section: t(`onboarding.sections.${meta.sectionKey}`),
      cta: meta.hasCta ? t(`onboarding.steps.${meta.id}.cta`) : undefined,
    }
  }), [t])

  const currentStep = STEPS[step]

  // Apply highlight glow to target element
  const updateHighlight = useCallback(() => {
    // Remove previous highlight
    if (prevHighlightRef.current) {
      prevHighlightRef.current.classList.remove('onboarding-highlight')
      prevHighlightRef.current = null
    }
    if (!currentStep.target) return

    const el = document.querySelector(currentStep.target)
    if (el) {
      el.classList.add('onboarding-highlight')
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      prevHighlightRef.current = el
    }
  }, [currentStep])

  useEffect(() => {
    const delay = currentStep.view ? 500 : 100
    const timer = setTimeout(updateHighlight, delay)
    return () => clearTimeout(timer)
  }, [updateHighlight, currentStep])

  // Cleanup highlight on unmount
  useEffect(() => {
    return () => {
      if (prevHighlightRef.current) {
        prevHighlightRef.current.classList.remove('onboarding-highlight')
      }
    }
  }, [])

  const navigateToStep = (nextStep, currentView) => {
    if (nextStep.view && nextStep.view !== currentView && setActiveView) {
      setActiveView(nextStep.view)
    }
  }

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      handleComplete()
      return
    }
    setAnimating(true)
    const nextStep = STEPS[step + 1]
    const currentView = STEPS[step].view
    navigateToStep(nextStep, currentView)
    const delay = nextStep.view && nextStep.view !== currentView ? 350 : 150
    setTimeout(() => {
      setStep(s => s + 1)
      setAnimating(false)
    }, delay)
  }

  const handlePrev = () => {
    if (step === 0) return
    setAnimating(true)
    const prevStep = STEPS[step - 1]
    const currentView = STEPS[step].view
    navigateToStep(prevStep, currentView)
    const delay = prevStep.view && prevStep.view !== currentView ? 350 : 150
    setTimeout(() => {
      setStep(s => s - 1)
      setAnimating(false)
    }, delay)
  }

  const handleComplete = () => {
    if (prevHighlightRef.current) {
      prevHighlightRef.current.classList.remove('onboarding-highlight')
    }
    localStorage.setItem('aeo-onboarding-completed', 'true')
    onComplete()
  }

  const handleSkip = () => {
    if (prevHighlightRef.current) {
      prevHighlightRef.current.classList.remove('onboarding-highlight')
    }
    localStorage.setItem('aeo-onboarding-completed', 'true')
    onSkip()
  }

  const handleCta = () => {
    handleComplete()
    if (setActiveView) setActiveView('checklist')
  }

  return (
    <div className="onboarding-overlay">
      {/* Dark overlay */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 300,
        }}
      />

      {/* Tutorial card — always centered */}
      <div
        ref={trapRef}
        className="onboarding-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: animating ? 0 : 1,
          transition: 'opacity 150ms ease',
        }}
      >
        {/* Section label + Step counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--color-phase-1)',
            textTransform: 'uppercase', letterSpacing: '0.0313rem',
            padding: '0.125rem 0.5rem', borderRadius: 4,
            background: 'rgba(255,107,53,0.1)',
          }}>
            {currentStep.section}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-disabled)',
            textTransform: 'uppercase', letterSpacing: '0.0313rem',
          }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(255,107,53,0.12)', color: 'var(--color-phase-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          {currentStep.icon}
        </div>

        {/* Title */}
        <h3 id="onboarding-title" style={{
          fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: 10,
          letterSpacing: '-0.0187rem',
        }}>
          {currentStep.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)',
          marginBottom: 24,
        }}>
          {currentStep.description}
        </p>

        {/* Footer: progress + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Progress bar */}
          <div style={{
            flex: 1, maxWidth: 120, height: 3, borderRadius: 2,
            background: 'var(--border-subtle)', marginRight: 16,
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: 'var(--color-phase-1)',
              width: `${((step + 1) / STEPS.length) * 100}%`,
              transition: 'width 300ms ease',
            }} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {step > 0 && (
              <button
                onClick={handleSkip}
                style={{
                  padding: '0.4375rem 0.625rem', fontSize: 11, fontWeight: 500,
                  borderRadius: 6, border: 'none',
                  background: 'transparent', color: 'var(--text-disabled)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                {t('onboarding.skipTour')}
              </button>
            )}
            {step > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '0.4375rem 0.875rem', fontSize: 12, fontWeight: 500,
                  borderRadius: 8, border: '0.0625rem solid var(--border-default)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <ArrowLeft size={13} />
                {t('onboarding.back')}
              </button>
            )}
            {currentStep.cta ? (
              <button
                onClick={handleCta}
                className="btn-primary"
                style={{ padding: '0.4375rem 1rem', fontSize: 12 }}
              >
                {currentStep.cta}
                <ArrowRight size={13} style={{ marginLeft: 4 }} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ padding: '0.4375rem 1rem', fontSize: 12 }}
              >
                {step === STEPS.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
                <ArrowRight size={13} style={{ marginLeft: 4 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
