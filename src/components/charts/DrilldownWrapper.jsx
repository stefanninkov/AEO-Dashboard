import { useState, useCallback } from 'react'
import { ChevronLeft } from 'lucide-react'

/**
 * DrilldownWrapper — Wraps a chart to enable drill-down navigation.
 *
 * Props:
 *   title: string — current view title
 *   onDrillDown: (item) => { title: string, data: any } — returns new view data
 *   children: (onItemClick) => ReactNode — render prop, passes click handler
 *   renderBreadcrumb: boolean (default: true)
 */
export default function DrilldownWrapper({
  title: rootTitle,
  children,
  renderBreadcrumb = true,
}) {
  const [stack, setStack] = useState([])

  const currentTitle = stack.length > 0 ? stack[stack.length - 1].title : rootTitle

  const drillDown = useCallback((title, data) => {
    setStack((prev) => [...prev, { title, data }])
  }, [])

  const goBack = useCallback(() => {
    setStack((prev) => prev.slice(0, -1))
  }, [])

  const goToLevel = useCallback((index) => {
    setStack((prev) => prev.slice(0, index))
  }, [])

  const currentData = stack.length > 0 ? stack[stack.length - 1].data : null

  return (
    <div>
      {/* Breadcrumb / Back navigation */}
      {renderBreadcrumb && stack.length > 0 && (
        <div className="flex items-center gap-1 mb-3 text-sm">
          <button
            onClick={goBack}
            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
            style={{
              color: 'var(--accent)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          {/* Breadcrumb trail */}
          <button
            onClick={() => goToLevel(0)}
            className="px-1 py-0.5 rounded transition-colors"
            style={{
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            {rootTitle}
          </button>
          {stack.map((level, i) => (
            <span key={i} className="flex items-center gap-1">
              <span style={{ color: 'var(--text-tertiary)' }}>/</span>
              {i < stack.length - 1 ? (
                <button
                  onClick={() => goToLevel(i + 1)}
                  className="px-1 py-0.5 rounded transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {level.title}
                </button>
              ) : (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {level.title}
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Chart content via render prop */}
      {children({ drillDown, currentData, currentTitle, depth: stack.length })}
    </div>
  )
}
