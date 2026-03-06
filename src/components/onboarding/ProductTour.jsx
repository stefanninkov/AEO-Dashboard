import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'

const TOUR_STEPS = [
  {
    target: '[data-tour="sidebar"]',
    i18nTitle: 'tour.sidebar.title',
    fallbackTitle: 'Navigation Sidebar',
    i18nBody: 'tour.sidebar.body',
    fallbackBody: 'Access all dashboard views from here — checklist, analyzer, content tools, SEO, competitors, and more.',
    position: 'right',
  },
  {
    target: '[data-tour="project-selector"]',
    i18nTitle: 'tour.projectSelector.title',
    fallbackTitle: 'Project Selector',
    i18nBody: 'tour.projectSelector.body',
    fallbackBody: 'Switch between your projects or create new ones. Each project tracks a separate website.',
    position: 'bottom',
  },
  {
    target: '[data-tour="dashboard-stats"]',
    i18nTitle: 'tour.dashboardStats.title',
    fallbackTitle: 'Key Metrics',
    i18nBody: 'tour.dashboardStats.body',
    fallbackBody: 'See your citations, prompts, active AI engines, and AEO score at a glance.',
    position: 'bottom',
  },
  {
    target: '[data-tour="quick-win"]',
    i18nTitle: 'tour.quickWin.title',
    fallbackTitle: 'Quick Win',
    i18nBody: 'tour.quickWin.body',
    fallbackBody: 'Your highest-impact next action. Follow these recommendations to improve your score fast.',
    position: 'bottom',
  },
  {
    target: '[data-tour="recommendations"]',
    i18nTitle: 'tour.recommendations.title',
    fallbackTitle: 'Smart Recommendations',
    i18nBody: 'tour.recommendations.body',
    fallbackBody: 'AI-powered suggestions tailored to your project, competitors, and scores.',
    position: 'top',
  },
]

const STORAGE_KEY = 'aeo-product-tour-completed'

function getTooltipStyle(position, rect) {
  const gap = 12
  const base = { position: 'fixed', zIndex: 'var(--z-modal)' }

  switch (position) {
    case 'right':
      return { ...base, top: rect.top, left: rect.right + gap }
    case 'left':
      return { ...base, top: rect.top, right: window.innerWidth - rect.left + gap }
    case 'bottom':
      return { ...base, top: rect.bottom + gap, left: rect.left }
    case 'top':
      return { ...base, bottom: window.innerHeight - rect.top + gap, left: rect.left }
    default:
      return { ...base, top: rect.bottom + gap, left: rect.left }
  }
}

const ProductTour = memo(function ProductTour({ onComplete, onSkip }) {
  const { t } = useTranslation('app')
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const tooltipRef = useRef(null)

  const currentStep = TOUR_STEPS[step]

  // Find and highlight target element
  useEffect(() => {
    const el = document.querySelector(currentStep.target)
    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.outline = '2px solid var(--accent)'
      el.style.outlineOffset = '4px'
      el.style.borderRadius = 'var(--radius-md)'
      el.style.transition = 'outline 0.3s ease'
      return () => {
        el.style.outline = ''
        el.style.outlineOffset = ''
      }
    } else {
      // Target not found, skip to next
      setTargetRect(null)
    }
  }, [step, currentStep.target])

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      localStorage.setItem(STORAGE_KEY, 'true')
      onComplete()
    }
  }, [step, onComplete])

  const handlePrev = useCallback(() => {
    if (step > 0) setStep(s => s - 1)
  }, [step])

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onSkip()
  }, [onSkip])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') handleSkip()
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSkip, handleNext, handlePrev])

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 'calc(var(--z-modal) - 1)',
          background: 'rgba(0, 0, 0, 0.5)',
        }}
        onClick={handleSkip}
      />

      {/* Tooltip */}
      {targetRect && (
        <div
          ref={tooltipRef}
          role="dialog"
          aria-label={t(currentStep.i18nTitle, currentStep.fallbackTitle)}
          style={{
            ...getTooltipStyle(currentStep.position, targetRect),
            width: '18rem', maxWidth: 'calc(100vw - 2rem)',
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
            padding: 'var(--space-4)',
            animation: 'fade-in 0.2s ease-out',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 'var(--space-2)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                {t(currentStep.i18nTitle, currentStep.fallbackTitle)}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="btn-ghost"
              style={{ padding: '2px', borderRadius: 'var(--radius-sm)' }}
              aria-label={t('tour.skip', 'Skip tour')}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{
            fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
            lineHeight: 1.5, marginBottom: 'var(--space-4)',
          }}>
            {t(currentStep.i18nBody, currentStep.fallbackBody)}
          </p>

          {/* Progress dots + nav */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === step ? '1rem' : '0.375rem', height: '0.375rem',
                    borderRadius: '0.1875rem',
                    background: i === step ? 'var(--accent)' : 'var(--border-default)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {step > 0 && (
                <button onClick={handlePrev} className="btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>
                  <ChevronLeft size={12} />
                  {t('tour.prev', 'Back')}
                </button>
              )}
              <button onClick={handleNext} className="btn-primary btn-sm" style={{ fontSize: 'var(--text-xs)' }}>
                {step === TOUR_STEPS.length - 1 ? t('tour.finish', 'Finish') : t('tour.next', 'Next')}
                {step < TOUR_STEPS.length - 1 && <ChevronRight size={12} />}
              </button>
            </div>
          </div>

          <div style={{
            fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)',
            marginTop: 'var(--space-2)', textAlign: 'center',
          }}>
            {step + 1} / {TOUR_STEPS.length}
          </div>
        </div>
      )}
    </>
  )
})

ProductTour.STORAGE_KEY = STORAGE_KEY
export default ProductTour
