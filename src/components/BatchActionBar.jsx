import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X, CheckSquare, Square, Trash2, Download, FileDown, Play, Copy,
} from 'lucide-react'

/**
 * Floating batch action bar that appears when items are selected.
 *
 * @param {number}   selectedCount     - Number of selected items
 * @param {number}   totalCount        - Total items available
 * @param {function} onSelectAll       - Select/deselect all
 * @param {function} onClearSelection  - Clear current selection
 * @param {Array}    actions           - Array of { id, label, icon, onClick, variant? }
 * @param {boolean}  allSelected       - Whether all items are currently selected
 */
const BatchActionBar = memo(function BatchActionBar({
  selectedCount, totalCount, onSelectAll, onClearSelection,
  actions = [], allSelected = false,
}) {
  const { t } = useTranslation('app')

  if (selectedCount === 0) return null

  return (
    <div
      role="toolbar"
      aria-label={t('batch.toolbar', 'Batch actions')}
      style={{
        position: 'fixed', bottom: 'var(--space-6)', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
        zIndex: 'var(--z-toast)',
        animation: 'fade-in-up 0.2s ease-out',
      }}
    >
      {/* Select all / count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button
          onClick={onSelectAll}
          className="btn-ghost"
          style={{ padding: '2px' }}
          aria-label={allSelected ? t('batch.deselectAll', 'Deselect all') : t('batch.selectAll', 'Select all')}
        >
          {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
        </button>
        <span style={{
          fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent)',
          fontFamily: 'var(--font-heading)',
        }}>
          {t('batch.selected', { count: selectedCount, total: totalCount }, `${selectedCount} of ${totalCount} selected`)}
        </span>
      </div>

      {/* Divider */}
      <div style={{
        width: '1px', height: '1.5rem', background: 'var(--border-default)',
      }} />

      {/* Action buttons */}
      {actions.map(action => {
        const ActionIcon = action.icon
        return (
          <button
            key={action.id}
            onClick={action.onClick}
            className={action.variant === 'danger' ? 'btn-ghost' : 'btn-ghost btn-sm'}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              fontSize: 'var(--text-xs)', fontWeight: 500,
              color: action.variant === 'danger' ? 'var(--color-error)' : 'var(--text-primary)',
              padding: 'var(--space-1) var(--space-2)',
            }}
            aria-label={action.label}
          >
            {ActionIcon && <ActionIcon size={14} />}
            <span className="hide-mobile">{action.label}</span>
          </button>
        )
      })}

      {/* Divider */}
      <div style={{
        width: '1px', height: '1.5rem', background: 'var(--border-default)',
      }} />

      {/* Clear selection */}
      <button
        onClick={onClearSelection}
        className="btn-ghost"
        style={{ padding: '4px' }}
        aria-label={t('batch.clear', 'Clear selection')}
      >
        <X size={16} />
      </button>
    </div>
  )
})

/** Hook for managing multi-select state */
export function useMultiSelect(items = []) {
  const [selected, setSelected] = useState(new Set())

  const toggle = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map(item => item.id || item)))
    }
  }, [items, selected.size])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
  }, [])

  const isSelected = useCallback((id) => selected.has(id), [selected])

  return {
    selected,
    selectedCount: selected.size,
    toggle,
    selectAll,
    clearSelection,
    isSelected,
    allSelected: selected.size === items.length && items.length > 0,
    selectedItems: items.filter(item => selected.has(item.id || item)),
  }
}

export default BatchActionBar
