import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThemeCustomizer } from '../useThemeCustomizer'

describe('useThemeCustomizer', () => {
  beforeEach(() => {
    localStorage.clear()
    // Clean up CSS custom properties
    const root = document.documentElement
    root.style.removeProperty('--accent')
    root.style.removeProperty('--accent-hover')
    root.style.removeProperty('--font-body')
    root.style.removeProperty('--font-scale')
    root.style.removeProperty('--radius-md')
    root.style.removeProperty('--density-scale')
  })

  it('returns default config on first load', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    expect(result.current.config.preset).toBe('default')
    expect(result.current.config.fontSize).toBe('medium')
    expect(result.current.config.borderRadius).toBe('medium')
    expect(result.current.config.density).toBe('comfortable')
  })

  it('provides preset themes', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    expect(result.current.presets.length).toBeGreaterThan(0)
    expect(result.current.presets[0]).toHaveProperty('id')
    expect(result.current.presets[0]).toHaveProperty('accent')
  })

  it('returns active accent from default preset', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    expect(result.current.activeAccent).toBe('#3b82f6')
  })

  it('selectPreset changes the active accent', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    act(() => result.current.selectPreset('emerald'))
    expect(result.current.config.preset).toBe('emerald')
    expect(result.current.activeAccent).toBe('#10b981')
  })

  it('updateConfig applies partial changes', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    act(() => result.current.updateConfig({ fontSize: 'large' }))
    expect(result.current.config.fontSize).toBe('large')
    expect(result.current.config.preset).toBe('default') // unchanged
  })

  it('custom accent overrides preset accent', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    act(() => result.current.updateConfig({ customAccent: '#ff0000' }))
    expect(result.current.activeAccent).toBe('#ff0000')
  })

  it('resetToDefault restores all settings', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    act(() => {
      result.current.selectPreset('rose')
      result.current.updateConfig({ fontSize: 'large', brandName: 'My Brand' })
    })
    act(() => result.current.resetToDefault())
    expect(result.current.config.preset).toBe('default')
    expect(result.current.config.fontSize).toBe('medium')
    expect(result.current.config.brandName).toBeNull()
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    act(() => result.current.selectPreset('violet'))

    const stored = JSON.parse(localStorage.getItem('aeo-custom-theme'))
    expect(stored.preset).toBe('violet')
  })

  it('restores from localStorage', () => {
    localStorage.setItem('aeo-custom-theme', JSON.stringify({
      preset: 'amber', fontSize: 'small', borderRadius: 'large',
      density: 'compact', customAccent: null, fontFamily: null,
      brandName: null, brandLogoUrl: null,
    }))
    const { result } = renderHook(() => useThemeCustomizer())
    expect(result.current.config.preset).toBe('amber')
    expect(result.current.config.fontSize).toBe('small')
  })

  it('applies CSS custom properties to document root', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    act(() => result.current.selectPreset('cyan'))

    const root = document.documentElement
    expect(root.style.getPropertyValue('--accent')).toBe('#06b6d4')
  })

  it('provides size, radius, and density option arrays', () => {
    const { result } = renderHook(() => useThemeCustomizer())
    expect(result.current.sizeOptions).toContain('small')
    expect(result.current.sizeOptions).toContain('medium')
    expect(result.current.sizeOptions).toContain('large')
    expect(result.current.radiusOptions).toContain('none')
    expect(result.current.densityOptions).toContain('compact')
  })
})
