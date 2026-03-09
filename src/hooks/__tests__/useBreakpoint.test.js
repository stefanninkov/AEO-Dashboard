import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBreakpoint } from '../useBreakpoint'

describe('useBreakpoint', () => {
  let originalInnerWidth

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
  })

  function setWidth(w) {
    Object.defineProperty(window, 'innerWidth', { value: w, writable: true })
    window.dispatchEvent(new Event('resize'))
  }

  it('returns desktop for default jsdom width (1024)', () => {
    const { result } = renderHook(() => useBreakpoint())
    // jsdom default is 1024
    expect(['desktop', 'wide']).toContain(result.current.breakpoint)
  })

  it('detects mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true })
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current.isMobile).toBe(true)
    expect(result.current.breakpoint).toBe('mobile')
  })

  it('detects tablet breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true })
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current.isTablet).toBe(true)
    expect(result.current.breakpoint).toBe('tablet')
  })

  it('isMobileOrTablet is true for mobile', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true })
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current.isMobileOrTablet).toBe(true)
  })

  it('isMobileOrTablet is true for tablet', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true })
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current.isMobileOrTablet).toBe(true)
  })

  it('returns width property', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current.width).toBe(1200)
  })
})
