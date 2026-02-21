import { useState } from 'react'
import { Wand2, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { hasApiKey } from '../../utils/aiProvider'

/**
 * BulkFixGenerator — generates fixes for all fail/partial items at once.
 * Shows a progress bar and processes items sequentially to avoid rate limits.
 */
export default function BulkFixGenerator({ failItems, existingFixes, onStartBulk }) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, successes: 0, failures: 0 })

  const itemsNeedingFix = failItems.filter(
    fi => !existingFixes[`${fi.categoryName}::${fi.item.name}`]
  )

  if (itemsNeedingFix.length === 0 && failItems.length > 0) {
    return (
      <div className="bulk-fix-bar bulk-fix-complete">
        <CheckCircle2 size={14} />
        <span>All {failItems.length} issues have fixes generated</span>
      </div>
    )
  }

  if (failItems.length === 0) return null

  const handleBulk = async () => {
    setRunning(true)
    setProgress({ current: 0, total: itemsNeedingFix.length, successes: 0, failures: 0 })
    await onStartBulk(itemsNeedingFix, (current, success) => {
      setProgress(prev => ({
        ...prev,
        current,
        successes: prev.successes + (success ? 1 : 0),
        failures: prev.failures + (success ? 0 : 1),
      }))
    })
    setRunning(false)
  }

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="bulk-fix-bar">
      {!running ? (
        <>
          <button
            onClick={handleBulk}
            disabled={!hasApiKey()}
            className="bulk-fix-btn"
            title={!hasApiKey() ? 'API key required' : 'Generate fixes for all issues'}
          >
            <Wand2 size={14} />
            Generate All Fixes ({itemsNeedingFix.length} items)
          </button>
          {failItems.length !== itemsNeedingFix.length && (
            <span className="bulk-fix-cached">
              {failItems.length - itemsNeedingFix.length} already cached
            </span>
          )}
        </>
      ) : (
        <div className="bulk-fix-progress">
          <div className="bulk-fix-progress-info">
            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-phase-3)' }} />
            <span>Generating fixes... {progress.current}/{progress.total}</span>
            {progress.failures > 0 && (
              <span className="bulk-fix-failures">
                <XCircle size={12} /> {progress.failures} failed
              </span>
            )}
          </div>
          <div className="bulk-fix-progress-bar">
            <div
              className="bulk-fix-progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
