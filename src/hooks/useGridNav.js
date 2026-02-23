/**
 * useGridNav — Arrow-key navigation for stat-card grids.
 *
 * Attaches to a grid container ref. Makes direct children focusable (tabIndex)
 * and enables arrow-key movement based on actual rendered column count.
 *
 * Keys:
 *   Arrow Left/Right — previous/next item
 *   Arrow Up/Down    — same column in previous/next row
 *   Home / End       — first/last item in current row
 *   Ctrl+Home/End    — first/last item in entire grid
 *
 * Usage:
 *   const gridRef = useRef(null)
 *   useGridNav(gridRef)
 *   <div ref={gridRef} className="stats-grid-4"> ... </div>
 */
import { useEffect, useCallback } from 'react'

function getColumnCount(container) {
  const style = window.getComputedStyle(container)
  const cols = style.getPropertyValue('grid-template-columns')
  if (!cols || cols === 'none') return 1
  // Count explicit column tracks (split by spaces, ignoring subpixel diffs)
  return cols.split(/\s+/).filter(Boolean).length
}

function getFocusableChildren(container) {
  return Array.from(container.children).filter(
    child => child.offsetParent !== null // visible
  )
}

export default function useGridNav(gridRef) {
  const handleKeyDown = useCallback((e) => {
    const container = gridRef.current
    if (!container) return

    const { key, ctrlKey, metaKey } = e
    const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
    if (!arrows.includes(key)) return

    const items = getFocusableChildren(container)
    if (items.length === 0) return

    const active = document.activeElement
    const idx = items.indexOf(active)
    if (idx === -1) return // only navigate when a grid child has focus

    const cols = getColumnCount(container)
    let next = idx

    if (key === 'ArrowRight') {
      next = Math.min(idx + 1, items.length - 1)
    } else if (key === 'ArrowLeft') {
      next = Math.max(idx - 1, 0)
    } else if (key === 'ArrowDown') {
      next = Math.min(idx + cols, items.length - 1)
    } else if (key === 'ArrowUp') {
      next = Math.max(idx - cols, 0)
    } else if (key === 'Home') {
      if (ctrlKey || metaKey) {
        next = 0
      } else {
        // first item in current row
        next = idx - (idx % cols)
      }
    } else if (key === 'End') {
      if (ctrlKey || metaKey) {
        next = items.length - 1
      } else {
        // last item in current row
        next = Math.min(idx - (idx % cols) + cols - 1, items.length - 1)
      }
    }

    if (next !== idx) {
      e.preventDefault()
      items[next].focus()
    }
  }, [gridRef])

  useEffect(() => {
    const container = gridRef.current
    if (!container) return

    // Make direct children focusable via roving tabindex
    const items = getFocusableChildren(container)
    items.forEach((child, i) => {
      if (!child.hasAttribute('tabindex')) {
        child.setAttribute('tabindex', i === 0 ? '0' : '-1')
      }
    })

    // Update roving tabindex on focus
    const onFocusIn = (e) => {
      const target = e.target
      if (!items.includes(target)) return
      items.forEach(item => {
        item.setAttribute('tabindex', item === target ? '0' : '-1')
      })
    }

    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('focusin', onFocusIn)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('focusin', onFocusIn)
    }
  }, [gridRef, handleKeyDown])
}
