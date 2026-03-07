/**
 * useChecklistTranslation — returns checklist phases data.
 * Previously handled i18n translation; now returns data directly.
 * Accepts rawPhases from lazy import to preserve code splitting.
 */
import { useMemo } from 'react'

export function useChecklistTranslation(rawPhases) {
  return useMemo(() => {
    if (!rawPhases) return null
    return rawPhases.map(phase => ({
      ...phase,
      categories: phase.categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => ({ ...item })),
      })),
    }))
  }, [rawPhases])
}
