import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnboarding } from '../useOnboarding'

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const user = { uid: 'test-user-123' }

  it('starts with wizard open for new users', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    expect(result.current.isWizardOpen).toBe(true)
    expect(result.current.onboardingCompleted).toBe(false)
    expect(result.current.wizardProgress).toBe(0)
  })

  it('advances to next step', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    const initialStep = result.current.currentWizardStep

    act(() => result.current.nextStep())

    expect(result.current.currentWizardStep).not.toEqual(initialStep)
    expect(result.current.completedSteps).toContain(initialStep.id)
  })

  it('completes wizard after all steps', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    const totalSteps = result.current.wizardSteps.length

    for (let i = 0; i < totalSteps; i++) {
      act(() => result.current.nextStep())
    }

    expect(result.current.onboardingCompleted).toBe(true)
    expect(result.current.isWizardOpen).toBe(false)
  })

  it('skipWizard marks as completed', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    act(() => result.current.skipWizard())
    expect(result.current.onboardingCompleted).toBe(true)
    expect(result.current.isWizardOpen).toBe(false)
  })

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    act(() => result.current.nextStep())

    const stored = JSON.parse(localStorage.getItem(`aeo-onboarding-${user.uid}`))
    expect(stored.currentStep).toBe(1)
    expect(stored.completedSteps.length).toBe(1)
  })

  it('restores state from localStorage', () => {
    localStorage.setItem(`aeo-onboarding-${user.uid}`, JSON.stringify({
      completed: true, currentStep: 6, completedSteps: ['welcome'], dismissedTours: ['dashboard'], featuresSeen: [],
    }))

    const { result } = renderHook(() => useOnboarding({ user }))
    expect(result.current.onboardingCompleted).toBe(true)
    expect(result.current.isWizardOpen).toBe(false)
  })

  it('getTour returns tour steps for a view', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    const tour = result.current.getTour('dashboard')
    expect(tour).toBeInstanceOf(Array)
    expect(tour.length).toBeGreaterThan(0)
    expect(tour[0]).toHaveProperty('target')
    expect(tour[0]).toHaveProperty('title')
  })

  it('getTour returns null for dismissed tours', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    act(() => result.current.dismissTour('dashboard'))
    expect(result.current.getTour('dashboard')).toBeNull()
  })

  it('resetOnboarding restores initial state', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    act(() => result.current.skipWizard())
    expect(result.current.onboardingCompleted).toBe(true)

    act(() => result.current.resetOnboarding())
    expect(result.current.onboardingCompleted).toBe(false)
    expect(result.current.isWizardOpen).toBe(true)
  })

  it('markFeatureSeen updates discovery progress', () => {
    const { result } = renderHook(() => useOnboarding({ user }))
    expect(result.current.discoveryProgress.seen).toBe(0)

    act(() => result.current.markFeatureSeen('feature-1'))
    expect(result.current.discoveryProgress.seen).toBe(1)
  })

  it('handles null user gracefully', () => {
    const { result } = renderHook(() => useOnboarding({ user: null }))
    expect(result.current.isWizardOpen).toBe(true)
    // Should not throw
    act(() => result.current.nextStep())
  })
})
