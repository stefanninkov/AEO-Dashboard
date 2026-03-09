import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSavedViews } from '../useSavedViews'

describe('useSavedViews', () => {
  const user = { uid: 'user-1', displayName: 'Test User', email: 'test@test.com' }

  function setup(savedViews = []) {
    const updateProject = vi.fn()
    const activeProject = { id: 'proj-1', savedViews }
    return {
      updateProject,
      activeProject,
      ...renderHook(() => useSavedViews({ activeProject, updateProject, user })),
    }
  }

  it('returns empty views when project has none', () => {
    const { result } = setup()
    expect(result.current.views).toEqual([])
    expect(result.current.pinnedViews).toEqual([])
  })

  it('saveView calls updateProject with new view', () => {
    const { result, updateProject } = setup()
    let viewId
    act(() => {
      viewId = result.current.saveView({ label: 'My View', view: 'dashboard', filters: { status: 'active' } })
    })

    expect(viewId).toBeTruthy()
    expect(updateProject).toHaveBeenCalledWith('proj-1', expect.objectContaining({
      savedViews: expect.arrayContaining([
        expect.objectContaining({
          label: 'My View',
          view: 'dashboard',
          filters: { status: 'active' },
          createdBy: 'user-1',
          shared: false,
          pinned: false,
        }),
      ]),
    }))
  })

  it('deleteView removes the specified view', () => {
    const existingViews = [
      { id: 'sv-1', label: 'V1', createdBy: 'user-1', shared: false },
      { id: 'sv-2', label: 'V2', createdBy: 'user-1', shared: false },
    ]
    const { result, updateProject } = setup(existingViews)
    act(() => result.current.deleteView('sv-1'))

    expect(updateProject).toHaveBeenCalledWith('proj-1', {
      savedViews: [expect.objectContaining({ id: 'sv-2' })],
    })
  })

  it('togglePin toggles the pinned flag', () => {
    const existingViews = [
      { id: 'sv-1', label: 'V1', createdBy: 'user-1', shared: false, pinned: false },
    ]
    const { result, updateProject } = setup(existingViews)
    act(() => result.current.togglePin('sv-1'))

    expect(updateProject).toHaveBeenCalledWith('proj-1', {
      savedViews: [expect.objectContaining({ id: 'sv-1', pinned: true })],
    })
  })

  it('toggleShare toggles the shared flag', () => {
    const existingViews = [
      { id: 'sv-1', label: 'V1', createdBy: 'user-1', shared: false, pinned: false },
    ]
    const { result, updateProject } = setup(existingViews)
    act(() => result.current.toggleShare('sv-1'))

    expect(updateProject).toHaveBeenCalledWith('proj-1', {
      savedViews: [expect.objectContaining({ id: 'sv-1', shared: true })],
    })
  })

  it('only shows own + shared views', () => {
    const existingViews = [
      { id: 'sv-1', label: 'Mine', createdBy: 'user-1', shared: false },
      { id: 'sv-2', label: 'Other Shared', createdBy: 'user-2', shared: true },
      { id: 'sv-3', label: 'Other Private', createdBy: 'user-2', shared: false },
    ]
    const { result } = setup(existingViews)
    expect(result.current.views).toHaveLength(2)
    expect(result.current.views.map(v => v.id)).toEqual(['sv-1', 'sv-2'])
  })

  it('pinnedViews only includes pinned visible views', () => {
    const existingViews = [
      { id: 'sv-1', label: 'V1', createdBy: 'user-1', shared: false, pinned: true },
      { id: 'sv-2', label: 'V2', createdBy: 'user-1', shared: false, pinned: false },
    ]
    const { result } = setup(existingViews)
    expect(result.current.pinnedViews).toHaveLength(1)
    expect(result.current.pinnedViews[0].id).toBe('sv-1')
  })

  it('saveView returns null if no project', () => {
    const updateProject = vi.fn()
    const { result } = renderHook(() =>
      useSavedViews({ activeProject: null, updateProject, user })
    )
    let viewId
    act(() => {
      viewId = result.current.saveView({ label: 'Test', view: 'dashboard' })
    })
    expect(viewId).toBeNull()
    expect(updateProject).not.toHaveBeenCalled()
  })
})
