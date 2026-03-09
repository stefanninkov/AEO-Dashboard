import { memo, useEffect, useRef } from 'react'
import {
  Search, X, FileText, MessageSquare, Users, Bookmark,
  Activity, FolderOpen, CheckSquare,
} from 'lucide-react'

const TYPE_CONFIG = {
  project:   { icon: FolderOpen,    color: 'var(--accent)',         label: 'Projects' },
  task:      { icon: CheckSquare,   color: 'var(--color-phase-1)',  label: 'Tasks' },
  activity:  { icon: Activity,      color: 'var(--color-phase-2)',  label: 'Activity' },
  comment:   { icon: MessageSquare, color: 'var(--color-phase-3)',  label: 'Comments' },
  member:    { icon: Users,         color: 'var(--color-phase-4)',  label: 'Members' },
  savedView: { icon: Bookmark,      color: 'var(--color-phase-5)',  label: 'Saved Views' },
}

/**
 * GlobalSearchOverlay — Full-screen search with categorized results.
 */
function GlobalSearchOverlay({
  open, onClose, query, setQuery, category, setCategory,
  categories = [], results = [], groupedResults = {},
  totalResults, onSelectResult,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 55000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh',
        animation: 'fadeIn 100ms',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)', width: '36rem', maxWidth: '92vw',
          maxHeight: '70vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', animation: 'scaleIn 100ms ease-out',
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
        }}>
          <Search size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search everything..."
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none',
              fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: 'var(--space-1)', padding: 'var(--space-2) var(--space-4)',
          borderBottom: '0.0625rem solid var(--border-subtle)', overflowX: 'auto',
        }}>
          {categories.map(cat => {
            const cfg = TYPE_CONFIG[cat]
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.125rem var(--space-2)', fontSize: 'var(--text-2xs)',
                  fontWeight: 600, border: 'none', borderRadius: 'var(--radius-full)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  background: category === cat ? 'var(--accent)' : 'var(--hover-bg)',
                  color: category === cat ? '#fff' : 'var(--text-tertiary)',
                  transition: 'all 100ms',
                }}
              >
                {cat === 'all' ? 'All' : cfg?.label || cat}
              </button>
            )
          })}
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!query.trim() ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-disabled)' }}>
              <Search size={28} style={{ margin: '0 auto var(--space-2)', opacity: 0.2 }} />
              <div style={{ fontSize: 'var(--text-xs)' }}>Type to search across projects, tasks, comments, and more</div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-disabled)' }}>
              <div style={{ fontSize: 'var(--text-xs)' }}>No results for "{query}"</div>
            </div>
          ) : category === 'all' ? (
            // Grouped display
            Object.entries(groupedResults).map(([type, items]) => {
              const cfg = TYPE_CONFIG[type] || { icon: FileText, color: 'var(--text-tertiary)', label: type }
              return (
                <div key={type}>
                  <div style={{
                    padding: 'var(--space-1) var(--space-4)',
                    fontSize: '0.5625rem', fontWeight: 700, color: cfg.color,
                    textTransform: 'uppercase', letterSpacing: '0.04rem',
                    background: 'var(--hover-bg)',
                  }}>
                    {cfg.label} ({items.length})
                  </div>
                  {items.slice(0, 5).map(item => (
                    <ResultRow key={item.id} item={item} cfg={cfg} onSelect={onSelectResult} />
                  ))}
                  {items.length > 5 && (
                    <div style={{ padding: 'var(--space-1) var(--space-4)', fontSize: '0.5rem', color: 'var(--text-disabled)' }}>
                      +{items.length - 5} more
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            results.map(item => {
              const cfg = TYPE_CONFIG[item.type] || { icon: FileText, color: 'var(--text-tertiary)', label: item.type }
              return <ResultRow key={item.id} item={item} cfg={cfg} onSelect={onSelectResult} />
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-2) var(--space-4)',
          borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.5625rem', color: 'var(--text-disabled)',
        }}>
          <span>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
          <span>Esc to close</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.97); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  )
}

function ResultRow({ item, cfg, onSelect }) {
  const Icon = cfg.icon
  return (
    <div
      onClick={() => onSelect?.(item)}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-4)', cursor: 'pointer',
        borderBottom: '0.0625rem solid var(--border-subtle)',
        transition: 'background 80ms',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: '1.25rem', height: '1.25rem', borderRadius: '50%', flexShrink: 0,
        background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={10} style={{ color: cfg.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.title}
        </div>
        <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.subtitle}
        </div>
      </div>
      {item.score > 0 && (
        <span style={{
          fontSize: '0.5rem', color: 'var(--text-disabled)',
          fontVariantNumeric: 'tabular-nums', flexShrink: 0,
        }}>
          {Math.round(item.score)}%
        </span>
      )}
    </div>
  )
}

export default memo(GlobalSearchOverlay)
