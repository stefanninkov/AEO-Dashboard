import { useState, useCallback, useMemo } from 'react'

/**
 * useOnboarding — First-run wizard and feature tour state management.
 *
 * Tracks onboarding progress, completed steps, dismissed tours,
 * and feature discovery milestones.
 *
 * Stored in localStorage per user: aeo-onboarding-{uid}
 */

const STORAGE_PREFIX = 'aeo-onboarding-'

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to AEO Dashboard', description: 'Your AI Engine Optimization command center', view: null },
  { id: 'create-project', title: 'Create Your First Project', description: 'Add a website URL to start tracking its AEO performance', view: 'dashboard' },
  { id: 'run-analysis', title: 'Run Your First Analysis', description: 'Analyze your site to get an AEO score and recommendations', view: 'analyzer' },
  { id: 'explore-checklist', title: 'Explore the AEO Checklist', description: 'Review optimization tasks organized by implementation phase', view: 'checklist' },
  { id: 'check-metrics', title: 'Review Your Metrics', description: 'See how your site performs across key AEO indicators', view: 'metrics' },
  { id: 'set-monitoring', title: 'Set Up Monitoring', description: 'Track your AEO score over time with automated monitoring', view: 'monitoring' },
]

const FEATURE_TOURS = {
  dashboard: [
    { target: '[data-tour="score-card"]', title: 'AEO Score', body: 'Your overall AEO optimization score at a glance', position: 'bottom' },
    { target: '[data-tour="quick-actions"]', title: 'Quick Actions', body: 'Run analysis, export data, or share reports', position: 'bottom' },
    { target: '[data-tour="ai-insights"]', title: 'AI Insights', body: 'AI-powered recommendations tailored to your site', position: 'left' },
  ],
  checklist: [
    { target: '[data-tour="phase-tabs"]', title: 'Implementation Phases', body: 'Tasks are organized into logical phases — start with Phase 1', position: 'bottom' },
    { target: '[data-tour="task-item"]', title: 'Checklist Items', body: 'Check off items as you complete them. Click for details.', position: 'right' },
    { target: '[data-tour="progress-bar"]', title: 'Progress Tracking', body: 'See your completion progress across all phases', position: 'bottom' },
  ],
  analyzer: [
    { target: '[data-tour="url-input"]', title: 'Enter a URL', body: 'Type or paste any URL to analyze its AEO optimization', position: 'bottom' },
    { target: '[data-tour="analyze-btn"]', title: 'Run Analysis', body: 'Click to start a comprehensive AEO analysis', position: 'left' },
  ],
  monitoring: [
    { target: '[data-tour="monitor-chart"]', title: 'Score History', body: 'Track how your AEO score changes over time', position: 'bottom' },
    { target: '[data-tour="auto-monitor"]', title: 'Auto Monitor', body: 'Set up automatic periodic monitoring', position: 'left' },
  ],
}

export function useOnboarding({ user }) {
  const storageKey = user?.uid ? `${STORAGE_PREFIX}${user.uid}` : null

  const loadState = useCallback(() => {
    if (!storageKey) return { completed: false, currentStep: 0, completedSteps: [], dismissedTours: [], featuresSeen: [] }
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : { completed: false, currentStep: 0, completedSteps: [], dismissedTours: [], featuresSeen: [] }
    } catch {
      return { completed: false, currentStep: 0, completedSteps: [], dismissedTours: [], featuresSeen: [] }
    }
  }, [storageKey])

  const [state, setState] = useState(loadState)

  const save = useCallback((next) => {
    setState(next)
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
    }
  }, [storageKey])

  // Wizard controls
  const isWizardOpen = !state.completed && state.currentStep < ONBOARDING_STEPS.length
  const currentWizardStep = ONBOARDING_STEPS[state.currentStep] || null
  const wizardProgress = state.currentStep / ONBOARDING_STEPS.length

  const nextStep = useCallback(() => {
    const next = {
      ...state,
      currentStep: state.currentStep + 1,
      completedSteps: [...new Set([...state.completedSteps, ONBOARDING_STEPS[state.currentStep]?.id])],
    }
    if (next.currentStep >= ONBOARDING_STEPS.length) next.completed = true
    save(next)
  }, [state, save])

  const skipWizard = useCallback(() => {
    save({ ...state, completed: true })
  }, [state, save])

  const resetOnboarding = useCallback(() => {
    save({ completed: false, currentStep: 0, completedSteps: [], dismissedTours: [], featuresSeen: [] })
  }, [save])

  // Feature tours
  const getTour = useCallback((viewId) => {
    if (state.dismissedTours.includes(viewId)) return null
    return FEATURE_TOURS[viewId] || null
  }, [state.dismissedTours])

  const dismissTour = useCallback((viewId) => {
    save({ ...state, dismissedTours: [...new Set([...state.dismissedTours, viewId])] })
  }, [state, save])

  const markFeatureSeen = useCallback((featureId) => {
    if (state.featuresSeen.includes(featureId)) return
    save({ ...state, featuresSeen: [...state.featuresSeen, featureId] })
  }, [state, save])

  // Discovery progress
  const discoveryProgress = useMemo(() => {
    const totalFeatures = Object.values(FEATURE_TOURS).flat().length
    return { seen: state.featuresSeen.length, total: totalFeatures, pct: totalFeatures > 0 ? Math.round((state.featuresSeen.length / totalFeatures) * 100) : 0 }
  }, [state.featuresSeen])

  return {
    // Wizard
    isWizardOpen,
    currentWizardStep,
    wizardProgress,
    wizardSteps: ONBOARDING_STEPS,
    completedSteps: state.completedSteps,
    nextStep,
    skipWizard,
    resetOnboarding,
    // Tours
    getTour,
    dismissTour,
    markFeatureSeen,
    // Progress
    discoveryProgress,
    onboardingCompleted: state.completed,
  }
}
