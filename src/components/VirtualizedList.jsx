import { useState, useRef, useCallback, useEffect, memo } from 'react'

/**
 * VirtualizedList — Renders only visible items for large datasets.
 *
 * Props:
 *   items        — array of items to render
 *   rowHeight    — pixel height of each row (default 48)
 *   overscan     — extra rows above/below viewport (default 5)
 *   renderItem   — (item, index, style) => JSX
 *   containerStyle — optional style for the outer scroll container
 *   className    — optional className for the outer container
 *   emptyMessage — text when items is empty
 */
function VirtualizedList({
  items = [],
  rowHeight = 48,
  overscan = 5,
  renderItem,
  containerStyle,
  className,
  emptyMessage = 'No items to display',
}) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // Measure container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    observer.observe(el)
    setContainerHeight(el.clientHeight)

    return () => observer.disconnect()
  }, [])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const totalHeight = items.length * rowHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  )

  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    const style = {
      position: 'absolute',
      top: i * rowHeight,
      left: 0,
      right: 0,
      height: rowHeight,
    }
    visibleItems.push(renderItem(items[i], i, style))
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '2rem', textAlign: 'center',
          color: 'var(--text-tertiary)', fontSize: '0.8125rem',
          ...containerStyle,
        }}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onScroll={handleScroll}
      style={{
        overflow: 'auto',
        position: 'relative',
        ...containerStyle,
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  )
}

export default memo(VirtualizedList)
