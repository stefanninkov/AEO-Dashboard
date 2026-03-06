import { useState, useCallback, useRef } from 'react'

/**
 * Generic undo/redo hook with configurable history size.
 *
 * @param {*} initialState - The initial state value
 * @param {number} [maxHistory=50] - Maximum history entries to keep
 * @returns {{ state, setState, undo, redo, canUndo, canRedo, reset }}
 */
export default function useUndoRedo(initialState, maxHistory = 50) {
  const [state, setStateRaw] = useState(initialState)
  const past = useRef([])
  const future = useRef([])

  const setState = useCallback((nextOrFn) => {
    setStateRaw((prev) => {
      const next = typeof nextOrFn === 'function' ? nextOrFn(prev) : nextOrFn
      // Don't push identical states
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev
      past.current = [...past.current.slice(-(maxHistory - 1)), prev]
      future.current = []
      return next
    })
  }, [maxHistory])

  const undo = useCallback(() => {
    if (past.current.length === 0) return
    setStateRaw((current) => {
      const previous = past.current[past.current.length - 1]
      past.current = past.current.slice(0, -1)
      future.current = [current, ...future.current]
      return previous
    })
  }, [])

  const redo = useCallback(() => {
    if (future.current.length === 0) return
    setStateRaw((current) => {
      const next = future.current[0]
      future.current = future.current.slice(1)
      past.current = [...past.current, current]
      return next
    })
  }, [])

  const reset = useCallback((newState) => {
    past.current = []
    future.current = []
    setStateRaw(newState !== undefined ? newState : initialState)
  }, [initialState])

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    reset,
  }
}
