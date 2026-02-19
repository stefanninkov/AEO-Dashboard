import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Zap, ArrowRight, ArrowLeft, Compass, CheckSquare, LayoutDashboard, Rocket,
  BarChart3, BookOpen, FlaskConical, Settings, PenTool, Code2, Activity,
} from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'

const STEPS = [
  // ── Getting Started ──
  {
    id: 'welcome',
    title: 'Welcome to AEO Dashboard',
    description: 'Answer Engine Optimization (AEO) helps your website appear in AI-generated answers — from ChatGPT and Google AI Overviews to Perplexity and Bing Copilot. This tour will walk you through every tool so you know exactly how to use each one.',
    icon: <Zap size={24} />,
    section: 'Getting Started',
    target: null,
    view: null,
  },
  {
    id: 'sidebar',
    title: 'Sidebar Navigation',
    description: 'Use the sidebar to switch between all the tools in the app. Each tool handles a specific part of your AEO workflow. Pro tip: press number keys 1–9 to jump between views instantly, or press ⌘K (Ctrl+K) to open the Command Palette for fast search and navigation.',
    icon: <Compass size={24} />,
    section: 'Getting Started',
    target: '.sidebar',
    view: 'dashboard',
  },
  {
    id: 'project-switcher',
    title: 'Your Project',
    description: 'Each project tracks one website\'s AEO optimization. All your checklist progress, metrics, and settings are project-scoped. You can create multiple projects for different websites and switch between them here.',
    icon: <LayoutDashboard size={24} />,
    section: 'Getting Started',
    target: '.top-bar-row-1 .relative',
    view: 'dashboard',
  },
  {
    id: 'progress',
    title: 'Progress Tracking',
    description: 'The progress bar shows your overall AEO completion percentage across all 7 phases. The colored phase badges below break it down — aim to get all phases to 100%. This gives you a quick snapshot of where you stand and what needs attention.',
    icon: <BarChart3 size={24} />,
    section: 'Getting Started',
    target: '.top-bar-progress',
    view: 'dashboard',
  },

  // ── Core Tools ──
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Your command center for AEO. View key stat cards, progress charts, and phase breakdowns at a glance. Switch between sub-tabs (Overview, Citations, Prompts, Chatbots) to see different metric angles. This is where you check your overall AEO health.',
    icon: <LayoutDashboard size={24} />,
    section: 'Core Tools',
    target: '.stat-card',
    view: 'dashboard',
  },
  {
    id: 'checklist',
    title: 'AEO Guide',
    description: 'Your step-by-step roadmap with 99 tasks across 7 phases. Check items off as you complete them — progress saves automatically. Each task has a "Learn more" button with detailed documentation and an action button that takes you directly to the relevant tool. Start with Phase 1 to audit your technical foundation.',
    icon: <CheckSquare size={24} />,
    section: 'Core Tools',
    target: '.checklist-stats-grid',
    view: 'checklist',
  },
  {
    id: 'analyzer',
    title: 'Analyzer',
    description: 'Enter any URL and the AI will scan it for AEO readiness — checking schema markup, content structure, technical SEO, and authority signals. You\'ll get a score from 0–100 with specific, actionable recommendations. This should be your starting point: analyze your site to get a baseline score.',
    icon: <Zap size={24} />,
    section: 'Core Tools',
    target: 'input[placeholder="https://example.com"]',
    view: 'analyzer',
  },

  // ── Creation Tools ──
  {
    id: 'writer',
    title: 'Content Writer',
    description: 'AI-powered content creation specifically optimized for AEO. Generate FAQ pages, how-to guides, product descriptions, and other content formats that AI engines love to cite. The writer structures content with clear headings, concise answers, and proper formatting for maximum AI visibility.',
    icon: <PenTool size={24} />,
    section: 'Creation Tools',
    target: null,
    view: 'writer',
  },
  {
    id: 'schema',
    title: 'Schema Generator',
    description: 'Generate JSON-LD structured data markup for your pages. Schema is one of the most important AEO factors — it tells AI engines exactly what your content means. Select a schema type (FAQPage, HowTo, Article, Product, etc.), fill in the fields, and get valid JSON-LD ready to paste into your site.',
    icon: <Code2 size={24} />,
    section: 'Creation Tools',
    target: null,
    view: 'schema',
  },

  // ── Measurement ──
  {
    id: 'testing',
    title: 'Testing',
    description: 'Test real queries against AI engines (ChatGPT, Perplexity, Google AI, Bing Copilot, Claude) to see if your content appears in their answers. Track which queries you\'re winning and which need work. This is how you validate that your optimizations are actually working.',
    icon: <FlaskConical size={24} />,
    section: 'Measurement',
    target: null,
    view: 'testing',
  },
  {
    id: 'metrics-monitoring',
    title: 'Metrics & Monitoring',
    description: 'Track your AEO performance over time with detailed analytics. The Monitoring tab watches for issues in real-time, while Metrics shows trends in citations, visibility, and traffic. Connect Google Search Console and GA4 in Settings to pull in real performance data from your website.',
    icon: <Activity size={24} />,
    section: 'Measurement',
    target: null,
    view: 'metrics',
  },

  // ── Resources ──
  {
    id: 'docs',
    title: 'Documentation',
    description: 'Full documentation for every feature and every checklist task. The App Guide tab explains each tool in detail, AEO Reference has comprehensive docs for all 99 tasks, and FAQ answers common questions. Search across everything or browse by phase.',
    icon: <BookOpen size={24} />,
    section: 'Resources',
    target: null,
    view: 'docs',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure your project details, invite team members with role-based access (Owner, Admin, Editor, Viewer), and connect integrations — Google Search Console, Google Analytics 4, and Webflow. Set your Anthropic API key here — it\'s required for the Analyzer and AI-powered features.',
    icon: <Settings size={24} />,
    section: 'Resources',
    target: null,
    view: 'settings',
  },

  // ── Final ──
  {
    id: 'get-started',
    title: 'You\'re Ready!',
    description: 'Here\'s your game plan: First, go to Settings and set your API key. Then open the AEO Guide and start with Phase 1 to audit your technical foundation. Use the Analyzer to scan your website and get a baseline score. From there, work through the phases — each task links directly to the tool you need. Good luck!',
    icon: <Rocket size={24} />,
    section: "Let's Go",
    target: null,
    view: null,
    cta: 'Start with AEO Guide',
  },
]

export default function OnboardingTutorial({ onComplete, onSkip, setActiveView }) {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const prevHighlightRef = useRef(null)
  const trapRef = useFocusTrap(true)

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
            textTransform: 'uppercase', letterSpacing: '0.5px',
            padding: '2px 8px', borderRadius: 4,
            background: 'rgba(255,107,53,0.1)',
          }}>
            {currentStep.section}
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
          letterSpacing: '-0.3px',
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
                  padding: '7px 10px', fontSize: 11, fontWeight: 500,
                  borderRadius: 6, border: 'none',
                  background: 'transparent', color: 'var(--text-disabled)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                Skip tour
              </button>
            )}
            {step > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '7px 14px', fontSize: 12, fontWeight: 500,
                  borderRadius: 8, border: '1px solid var(--border-default)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <ArrowLeft size={13} />
                Back
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
