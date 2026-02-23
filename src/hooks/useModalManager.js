import { useState, useCallback, useRef } from 'react'

/**
 * useModalManager — Consolidates animated modal open/closing state pairs.
 *
 * Replaces the pattern of [open, setOpen] + [closing, setClosing] × N modals
 * with a single state object. Each modal can be 'closed', 'open', or 'closing'.
 *
 * Usage:
 *   const modals = useModalManager(['email', 'pdf', 'csv', 'cmdPalette', 'shortcuts'])
 *   modals.open('email')
 *   modals.close('email')       // starts closing animation
 *   modals.onExited('email')    // cleanup after animation ends
 *   modals.isOpen('email')      // true when open or closing
 *   modals.isClosing('email')   // true only during closing animation
 *   modals.isVisible('email')   // true when open or closing (for conditional render)
 */
export default function useModalManager(names) {
  // State: { email: 'closed', pdf: 'closed', ... }
  const [state, setState] = useState(() => {
    const initial = {}
    for (const name of names) initial[name] = 'closed'
    return initial
  })

  // Use ref for instant reads in event handlers (avoids stale closures)
  const stateRef = useRef(state)
  stateRef.current = state

  const open = useCallback((name) => {
    setState(prev => ({ ...prev, [name]: 'open' }))
  }, [])

  const close = useCallback((name) => {
    setState(prev => {
      if (prev[name] !== 'open') return prev
      return { ...prev, [name]: 'closing' }
    })
  }, [])

  const onExited = useCallback((name) => {
    setState(prev => ({ ...prev, [name]: 'closed' }))
  }, [])

  const isOpen = useCallback((name) => {
    return stateRef.current[name] === 'open'
  }, [])

  const isClosing = useCallback((name) => {
    return stateRef.current[name] === 'closing'
  }, [])

  const isVisible = useCallback((name) => {
    return stateRef.current[name] !== 'closed'
  }, [])

  return { state, open, close, onExited, isOpen, isClosing, isVisible }
}
