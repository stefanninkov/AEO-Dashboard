import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('reads existing value from localStorage', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('persists value to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorage('persist-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(window.localStorage.getItem('persist-key'))).toBe('updated')
  })

  it('handles objects as values', () => {
    const obj = { name: 'test', count: 42 }
    const { result } = renderHook(() => useLocalStorage('obj-key', null))

    act(() => {
      result.current[1](obj)
    })

    expect(result.current[0]).toEqual(obj)
    expect(JSON.parse(window.localStorage.getItem('obj-key'))).toEqual(obj)
  })

  it('handles arrays as values', () => {
    const arr = [1, 2, 3]
    const { result } = renderHook(() => useLocalStorage('arr-key', []))

    act(() => {
      result.current[1](arr)
    })

    expect(result.current[0]).toEqual(arr)
  })

  it('returns initial value when localStorage has invalid JSON', () => {
    // Manually set invalid JSON
    window.localStorage.setItem('bad-json', '{not valid json')
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage('bad-json', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('returns a stable setter function', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('stable-key', ''))
    const setter1 = result.current[1]
    rerender()
    const setter2 = result.current[1]
    expect(setter1).toBe(setter2)
  })
})
