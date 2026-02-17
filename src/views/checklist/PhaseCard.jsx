import { ChevronDown, Star } from 'lucide-react'
import AnimatedNumber from '../../components/AnimatedNumber'
import CollapsibleContent from '../../components/shared/CollapsibleContent'
import CategorySection from './CategorySection'

export default function PhaseCard({
  phase,
  progress,
  isExpanded,
  isPriority,
  isCelebrating,
  expandedCategories,
  checked,
  bouncingId,
  notes,
  openNoteId,
  noteDraft,
  noteSaveStatus,
  noteTimestamps,
  verifications,
  quickViewItem,
  assignments,
  comments,
  openCommentId,
  commentDraft,
  members,
  onTogglePhase,
  onToggleCategory,
  isCategoryExpanded,
  onBulkCheck,
  onBulkUncheck,
  setExpandedCategories,
  onToggle,
  onQuickView,
  onDocItem,
  onToggleNote,
  onNoteChange,
  onNoteSave,
  onAssign,
  onUnassign,
  onToggleComments,
  onCommentChange,
  onCommentAdd,
  onCommentDelete,
}) {
  return (
    <div className={`card${isCelebrating ? ' phase-complete-pulse' : ''}`} style={{ padding: 0, overflow: 'hidden', '--phase-pulse-color': phase.color + '40' }}>
      {/* Phase Header */}
      <button
        onClick={() => onTogglePhase(phase.id)}
        aria-expanded={isExpanded}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
        }}
      >
        <span style={{ fontSize: '1.125rem' }}>{phase.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: phase.color }}>
              Phase {phase.number}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{phase.timeline}</span>
            {isPriority && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
                fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-phase-5)',
                padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
                background: 'rgba(245,158,11,0.1)',
              }}>
                <Star size={9} style={{ fill: 'var(--color-phase-5)' }} />
                Recommended
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.125rem', color: 'var(--text-primary)' }}>{phase.title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: phase.color }}>
              <AnimatedNumber value={progress.percent} />%
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-tertiary)' }}><AnimatedNumber value={progress.done} />/{progress.total}</span>
          </div>
          <div style={{ width: '4rem', height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '6.1875rem', overflow: 'hidden' }}>
            <div
              style={{ width: `${progress.percent}%`, height: '100%', borderRadius: '6.1875rem', backgroundColor: phase.color, transition: 'width 300ms' }}
            />
          </div>
          <ChevronDown
            size={14}
            style={{ color: 'var(--text-tertiary)', transform: isExpanded ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }}
          />
        </div>
      </button>

      {/* Phase Content — Animated */}
      <CollapsibleContent expanded={isExpanded}>
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {/* Phase-level expand/collapse categories */}
          {phase.categories.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.375rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                className="checklist-bulk-link"
                onClick={() => {
                  const allExpanded = phase.categories.every(cat => isCategoryExpanded(cat.id))
                  const newState = { ...expandedCategories }
                  phase.categories.forEach(cat => { newState[cat.id] = !allExpanded })
                  setExpandedCategories(newState)
                }}
              >
                {phase.categories.every(cat => isCategoryExpanded(cat.id)) ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
          )}
          {phase.categories.map(category => (
            <CategorySection
              key={category.id}
              category={category}
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
              assignments={assignments}
              comments={comments}
              openCommentId={openCommentId}
              commentDraft={commentDraft}
              members={members}
              isExpanded={isCategoryExpanded(category.id)}
              onToggleCategory={onToggleCategory}
              onBulkCheck={onBulkCheck}
              onBulkUncheck={onBulkUncheck}
              onToggle={onToggle}
              onQuickView={onQuickView}
              onDocItem={onDocItem}
              onToggleNote={onToggleNote}
              onNoteChange={onNoteChange}
              onNoteSave={onNoteSave}
              onAssign={onAssign}
              onUnassign={onUnassign}
              onToggleComments={onToggleComments}
              onCommentChange={onCommentChange}
              onCommentAdd={onCommentAdd}
              onCommentDelete={onCommentDelete}
            />
          ))}
        </div>
      </CollapsibleContent>
    </div>
  )
}
