import { useState, useEffect, useCallback } from 'react'
import {
  Zap, ArrowRight, X, Compass, Search, CheckSquare, LayoutDashboard, Rocket,
  BarChart3, Users, BookOpen, FlaskConical, Settings, TrendingUp, Target
} from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'

const STEPS = [
  // ── Getting Started ──
  {
    id: 'welcome',
    title: 'Welcome to AEO Dashboard!',
    description: 'Answer Engine Optimization made simple. This tour will walk you through every section of the app so you know exactly where everything is.',
    icon: <Zap size={24} />,
    target: null,
    position: 'center',
    view: null,
  },
  {
    id: 'sidebar',
    title: 'Navigate the App',
    description: 'The sidebar gives you quick access to all 9 sections of the app. Pro tip: press number keys 1-9 on your keyboard to jump between views instantly.',
    icon: <Compass size={24} />,
    target: '.sidebar',
    position: 'right',
    view: 'dashboard',
  },
  {
    id: 'project-switcher',
    title: 'Manage Projects',
    description: 'Switch between projects or create new ones here. Each project tracks a different website\'s AEO progress independently — with its own checklist, metrics, and analysis.',
    icon: <LayoutDashboard size={24} />,
    target: '.top-bar-row-1 .relative',
    position: 'bottom',
    view: 'dashboard',
  },
  {
    id: 'search',
    title: 'Quick Search',
    description: 'Press Ctrl+K (or Cmd+K on Mac) to instantly search across checklist items, documentation, competitors, and navigate anywhere in the app.',
    icon: <Search size={24} />,
    target: '.search-container',
    position: 'bottom',
    view: 'dashboard',
  },
  {
    id: 'progress',
    title: 'Track Overall Progress',
    description: 'The progress bar shows your total AEO completion percentage. The colored phase badges below break it down by each of the 7 AEO phases.',
    icon: <TrendingUp size={24} />,
    target: '.top-bar-progress',
    position: 'bottom',
    view: 'dashboard',
  },

  // ── Dashboard ──
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'Your command center. View stat cards, charts, phase progress, and quick actions. Switch between Overview, Citations, Prompts, and Chatbots sub-tabs for different metric views.',
    icon: <LayoutDashboard size={24} />,
    target: '.stat-card',
    position: 'bottom',
    view: 'dashboard',
  },

  // ── AEO Guide ──
  {
    id: 'checklist',
    title: 'AEO Guide',
    description: '200+ optimization tasks organized across 7 phases. Toggle between Checklist mode to track progress and Guide mode for detailed explanations, key principles, and deliverables.',
    icon: <CheckSquare size={24} />,
    target: '.checklist-stats-grid',
    position: 'bottom',
    view: 'checklist',
  },

  // ── Competitors ──
  {
    id: 'competitors',
    title: 'Competitor Tracking',
    description: 'Add competitors by name and URL to benchmark your AEO performance. Run analysis to compare scores, see heat maps of strengths/weaknesses, and get AI-generated competitive insights.',
    icon: <Users size={24} />,
    target: 'input[placeholder="e.g. TechLeader"]',
    position: 'bottom',
    view: 'competitors',
  },

  // ── Analyzer ──
  {
    id: 'analyzer',
    title: 'Site Analyzer',
    description: 'Enter any URL and AI will scan it for AEO readiness — checking schema markup, content structure, technical SEO, and authority signals. You\'ll get a score from 0-100 with specific recommendations.',
    icon: <Zap size={24} />,
    target: 'input[placeholder="https://example.com"]',
    position: 'bottom',
    view: 'analyzer',
  },

  // ── Metrics ──
  {
    id: 'metrics',
    title: 'Detailed Metrics',
    description: 'Run analysis to get citation counts, prompt visibility, and AI engine breakdowns over time. Track how your site appears in ChatGPT, Perplexity, Google AI Overviews, and more.',
    icon: <BarChart3 size={24} />,
    target: null,
    position: 'center',
    view: 'metrics',
  },

  // ── Documentation ──
  {
    id: 'docs',
    title: 'Documentation Library',
    description: 'In-depth guides for every AEO task in the checklist. Search by keyword or filter by phase. Click any item to open a detailed overlay with step-by-step instructions.',
    icon: <BookOpen size={24} />,
    target: 'input[placeholder="Search documentation..."]',
    position: 'bottom',
    view: 'docs',
  },

  // ── Testing ──
  {
    id: 'testing',
    title: 'Testing & Monitoring',
    description: 'Track target queries across AI platforms (ChatGPT, Perplexity, Google AIO, Bing Copilot, Claude). Set up auto-monitoring, follow weekly/monthly testing routines, and use quick links to validation tools.',
    icon: <FlaskConical size={24} />,
    target: null,
    position: 'center',
    view: 'testing',
  },

  // ── Settings ──
  {
    id: 'settings',
    title: 'Settings & API Key',
    description: 'Configure your profile, set your Anthropic API key (required for the Analyzer and AI verification), manage project settings, and access destructive actions like resetting data.',
    icon: <Settings size={24} />,
    target: null,
    position: 'center',
    view: 'settings',
  },

  // ── Final ──
  {
    id: 'get-started',
    title: 'You\'re Ready!',
    description: 'Start by setting your API key in Settings, then enter your website URL in the Analyzer. It will scan your site and give you an AEO score with actionable recommendations. Good luck!',
    icon: <Rocket size={24} />,
    target: null,
    position: 'center',
    view: null,
    cta: 'Start Analyzing',
  },
]

export default function OnboardingTutorial({ onComplete, onSkip, setActiveView }) {
  const [step, setStep] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState(null)
  const [animating, setAnimating] = useState(false)
  const trapRef = useFocusTrap(true)

  const currentStep = STEPS[step]

  // Calculate spotlight position for current step
  const updateSpotlight = useCallback(() => {
    if (!currentStep.target) {
      setSpotlightRect(null)
      return
    }
    const el = document.querySelector(currentStep.target)
    if (el) {
      // Scroll the element into view within .content-scroll
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Wait for scroll to settle, then measure
      setTimeout(() => {
        const rect = el.getBoundingClientRect()
        setSpotlightRect({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        })
      }, 400)
    } else {
      setSpotlightRect(null)
    }
  }, [currentStep])

  useEffect(() => {
    // Delay spotlight update if we might be waiting for a view to mount
    const delay = currentStep.view ? 500 : 100
    const timer = setTimeout(updateSpotlight, delay)
    window.addEventListener('resize', updateSpotlight)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateSpotlight)
    }
  }, [updateSpotlight, currentStep])

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

  // Calculate card position based on spotlight (clamped to viewport)
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
    const cardW = 360
    const cardH = 280

    if (position === 'right') {
      return {
        top: Math.min(spotlightRect.top, window.innerHeight - cardH),
        left: Math.min(spotlightRect.left + spotlightRect.width + margin, window.innerWidth - cardW),
      }
    }
    if (position === 'bottom') {
      return {
        top: Math.min(spotlightRect.top + spotlightRect.height + margin, window.innerHeight - cardH),
        left: Math.min(spotlightRect.left, window.innerWidth - cardW),
      }
    }
    if (position === 'top') {
      return {
        bottom: Math.max(window.innerHeight - spotlightRect.top + margin, 20),
        left: Math.min(spotlightRect.left, window.innerWidth - cardW),
      }
    }
    return {
      top: Math.min(spotlightRect.top + spotlightRect.height + margin, window.innerHeight - cardH),
      left: Math.min(spotlightRect.left, window.innerWidth - cardW),
    }
  }

  // Section label for step groups
  const getSectionLabel = () => {
    if (step <= 4) return 'Getting Started'
    if (step <= 13) return 'Exploring the App'
    return "Let's Go"
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
        ref={trapRef}
        className="onboarding-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
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
          aria-label="Skip tutorial"
        >
          <X size={16} />
        </button>

        {/* Section label + Step counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--color-phase-1)',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            padding: '2px 6px', borderRadius: 4,
            background: 'rgba(255,107,53,0.1)',
          }}>
            {getSectionLabel()}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-disabled)',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

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
        <h3 id="onboarding-title" style={{
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
          {/* Progress bar instead of dots (better for 15 steps) */}
          <div style={{
            flex: 1, maxWidth: 100, height: 3, borderRadius: 2,
            background: 'var(--border-subtle)', marginRight: 12,
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: 'var(--color-phase-1)',
              width: `${((step + 1) / STEPS.length) * 100}%`,
              transition: 'width 300ms ease',
            }} />
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
