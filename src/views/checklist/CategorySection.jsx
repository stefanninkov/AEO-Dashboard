import { useState, useMemo, memo } from 'react'
import { ChevronDown } from 'lucide-react'
import CollapsibleContent from '../../components/shared/CollapsibleContent'
import ChecklistItem from './ChecklistItem'

const INITIAL_VISIBLE = 20

export default memo(function CategorySection({
  category,
  phase,
  checked,
  bouncingId,
  verifications,
  assignments,
  comments,
  openCommentId,
  commentDraft,
  members,
  isExpanded,
  onToggleCategory,
  onBulkCheck,
  onBulkUncheck,
  onToggle,
  onDocItem,
  onNavigate,
  onAssign,
  onUnassign,
  onToggleComments,
  onCommentChange,
  onCommentAdd,
  onCommentDelete,
}) {
  const [showAll, setShowAll] = useState(false)

  const catState = useMemo(() => {
    let total = 0, checkedCount = 0
    category.items.forEach(item => { total++; if (checked[item.id]) checkedCount++ })
    return { total, checkedCount, allChecked: checkedCount === total, someChecked: checkedCount > 0 }
  }, [category.items, checked])
  const items = category.items
  const hasMore = items.length > INITIAL_VISIBLE
  const visibleItems = showAll || !hasMore ? items : items.slice(0, INITIAL_VISIBLE)
  const hiddenCount = items.length - INITIAL_VISIBLE

  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        style={{ padding: '0.5rem 1rem', background: 'var(--bg-page)', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => onToggleCategory(category.id)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleCategory(category.id) } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ChevronDown
            size={10}
            style={{ color: 'var(--text-disabled)', transform: isExpanded ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }}
          />
          <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{category.name}</h4>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', fontWeight: 500 }}>{catState.checkedCount}/{catState.total}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
          {!catState.allChecked && (
            <button onClick={() => onBulkCheck(category)} className="checklist-bulk-link">Mark all</button>
          )}
          {catState.someChecked && (
            <button onClick={() => onBulkUncheck(category)} className="checklist-bulk-link">Clear all</button>
          )}
        </div>
      </div>
      <CollapsibleContent expanded={isExpanded}>
        <div>
          {visibleItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              phase={phase}
              checked={checked}
              bouncingId={bouncingId}
              verifications={verifications}
              assignments={assignments}
              comments={comments}
              openCommentId={openCommentId}
              commentDraft={commentDraft}
              members={members}
              onToggle={onToggle}
              onDocItem={onDocItem}
              onNavigate={onNavigate}
              onAssign={onAssign}
              onUnassign={onUnassign}
              onToggleComments={onToggleComments}
              onCommentChange={onCommentChange}
              onCommentAdd={onCommentAdd}
              onCommentDelete={onCommentDelete}
            />
          ))}
          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                width: '100%', padding: '0.625rem 1rem', border: 'none',
                background: 'var(--hover-bg)', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-phase-3)',
                fontFamily: 'var(--font-body)', transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-bg)'}
            >
              Show {hiddenCount} more item{hiddenCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </CollapsibleContent>
    </div>
  )
})
