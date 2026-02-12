import { useState, useEffect, useCallback } from 'react'
import { Zap, ArrowRight, X, Compass, Search, CheckSquare, LayoutDashboard, Rocket } from 'lucide-react'

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to AEO Dashboard!',
    description: 'Answer Engine Optimization made simple. Let\'s take a quick tour to help you get started.',
    icon: <Zap size={24} />,
    target: null, // centered modal, no spotlight
    position: 'center',
  },
  {
    id: 'sidebar',
    title: 'Navigate the App',
    description: 'Use the sidebar to switch between views. Dashboard gives you an overview, Checklist tracks your tasks, and Analyzer scans your site.',
    icon: <Compass size={24} />,
    target: '.sidebar',
    position: 'right',
  },
  {
    id: 'project-switcher',
    title: 'Manage Projects',
    description: 'Switch between projects or create new ones here. Each project tracks a different website\'s AEO progress independently.',
    icon: <LayoutDashboard size={24} />,
    target: '.top-bar-row-1 .relative',
    position: 'bottom',
  },
  {
    id: 'search',
    title: 'Quick Search',
    description: 'Use search (Ctrl+K) to instantly find checklist items, documentation, and navigate anywhere in the app.',
    icon: <Search size={24} />,
    target: '.search-container',
    position: 'bottom',
  },
  {
    id: 'checklist',
    title: 'Track Your Progress',
    description: 'The checklist has 200+ AEO tasks across 7 phases. Check items off as you optimize your site for AI engines.',
    icon: <CheckSquare size={24} />,
    target: '.quick-actions-grid',
    position: 'top',
  },
  {
    id: 'get-started',
    title: 'You\'re All Set!',
    description: 'Start by entering your website URL and running the Analyzer. It will scan your site and give you an AEO score with recommendations.',
    icon: <Rocket size={24} />,
    target: null,
    position: 'center',
    cta: 'Go to Analyzer',
  },
]

export default function OnboardingTutorial({ onComplete, onSkip, setActiveView }) {
  const [step, setStep] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState(null)
  const [animating, setAnimating] = useState(false)

  const currentStep = STEPS[step]

  // Calculate spotlight position for current step
  const updateSpotlight = useCallback(() => {
    if (!currentStep.target) {
      setSpotlightRect(null)
      return
    }
    const el = document.querySelector(currentStep.target)
    if (el) {
      const rect = el.getBoundingClientRect()
      setSpotlightRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      })
    } else {
      setSpotlightRect(null)
    }
  }, [currentStep])

  useEffect(() => {
    updateSpotlight()
    window.addEventListener('resize', updateSpotlight)
    return () => window.removeEventListener('resize', updateSpotlight)
  }, [updateSpotlight])

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      handleComplete()
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

  const handleComplete = () => {
    localStorage.setItem('aeo-onboarding-completed', 'true')
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem('aeo-onboarding-completed', 'true')
    onSkip()
  }

  const handleCta = () => {
    handleComplete()
    if (setActiveView) setActiveView('analyzer')
  }

  // Calculate card position based on spotlight
  const getCardStyle = () => {
    if (currentStep.position === 'center' || !spotlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
    const { position } = currentStep
    const margin = 16

    if (position === 'right') {
      return {
        top: spotlightRect.top,
        left: spotlightRect.left + spotlightRect.width + margin,
      }
    }
    if (position === 'bottom') {
      return {
        top: spotlightRect.top + spotlightRect.height + margin,
        left: spotlightRect.left,
      }
    }
    if (position === 'top') {
      return {
        bottom: window.innerHeight - spotlightRect.top + margin,
        left: spotlightRect.left,
      }
    }
    return {
      top: spotlightRect.top + spotlightRect.height + margin,
      left: spotlightRect.left,
    }
  }

  return (
    <div className="onboarding-overlay">
      {/* Dark overlay */}
      {!spotlightRect && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 300,
          }}
        />
      )}

      {/* Spotlight cutout */}
      {spotlightRect && (
        <div
          className="onboarding-spotlight"
          style={{
            position: 'fixed',
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      )}

      {/* Tutorial card */}
      <div
        className="onboarding-card"
        style={{
          ...getCardStyle(),
          opacity: animating ? 0 : 1,
          transition: 'opacity 150ms ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center',
          }}
          title="Skip tutorial"
        >
          <X size={16} />
        </button>

        {/* Step counter */}
        <p style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text-disabled)',
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12,
        }}>
          Step {step + 1} of {STEPS.length}
        </p>

        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(255,107,53,0.12)', color: 'var(--color-phase-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          {currentStep.icon}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: 8,
        }}>
          {currentStep.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13, lineHeight: 1.55, color: 'var(--text-secondary)',
          marginBottom: 20,
        }}>
          {currentStep.description}
        </p>

        {/* Footer: dots + buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Dots */}
          <div className="onboarding-dots">
            {STEPS.map((_, i) => (
              <div key={i} className={`onboarding-dot${i === step ? ' active' : ''}`} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  padding: '7px 14px', fontSize: 12, fontWeight: 500,
                  borderRadius: 8, border: '1px solid var(--border-default)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                Back
              </button>
            )}
            {step === 0 && (
              <button
                onClick={handleSkip}
                style={{
                  padding: '7px 14px', fontSize: 12, fontWeight: 500,
                  borderRadius: 8, border: 'none',
                  background: 'transparent', color: 'var(--text-tertiary)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                Skip
              </button>
            )}
            {currentStep.cta ? (
              <button
                onClick={handleCta}
                className="btn-primary"
                style={{ padding: '7px 16px', fontSize: 12 }}
              >
                {currentStep.cta}
                <ArrowRight size={13} style={{ marginLeft: 4 }} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ padding: '7px 16px', fontSize: 12 }}
              >
                {step === STEPS.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight size={13} style={{ marginLeft: 4 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
