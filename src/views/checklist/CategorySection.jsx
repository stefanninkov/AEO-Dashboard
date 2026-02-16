import { ChevronDown } from 'lucide-react'
import CollapsibleContent from '../../components/shared/CollapsibleContent'
import ChecklistItem from './ChecklistItem'

export default function CategorySection({
  category,
  phase,
  checked,
  bouncingId,
  notes,
  openNoteId,
  noteDraft,
  noteSaveStatus,
  noteTimestamps,
  verifications,
  quickViewItem,
  isExpanded,
  onToggleCategory,
  onBulkCheck,
  onBulkUncheck,
  onToggle,
  onQuickView,
  onDocItem,
  onToggleNote,
  onNoteChange,
  onNoteSave,
}) {
  const getCategoryCheckState = () => {
    let total = 0, checkedCount = 0
    category.items.forEach(item => { total++; if (checked[item.id]) checkedCount++ })
    return { total, checkedCount, allChecked: checkedCount === total, someChecked: checkedCount > 0 }
  }

  const catState = getCategoryCheckState()

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
          {category.items.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              phase={phase}
              checked={checked}
              bouncingId={bouncingId}
              notes={notes}
              openNoteId={openNoteId}
              noteDraft={noteDraft}
              noteSaveStatus={noteSaveStatus}
              noteTimestamps={noteTimestamps}
              verifications={verifications}
              quickViewItem={quickViewItem}
              onToggle={onToggle}
              onQuickView={onQuickView}
              onDocItem={onDocItem}
              onToggleNote={onToggleNote}
              onNoteChange={onNoteChange}
              onNoteSave={onNoteSave}
            />
          ))}
        </div>
      </CollapsibleContent>
    </div>
  )
}
