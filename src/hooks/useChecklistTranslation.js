import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * useChecklistTranslation — wraps phases data with translated strings from checklist.json.
 * Returns a new `phases` array with the same structure, but title/name/text/detail/doc/action.label
 * replaced with the current-language version (falling back to original English).
 */
export function useChecklistTranslation(phases) {
  const { t } = useTranslation('checklist')

  return useMemo(() => {
    if (!phases) return phases
    return phases.map(phase => ({
      ...phase,
      title: t(`phases.${phase.id}.title`, phase.title),
      timeline: t(`phases.${phase.id}.timeline`, phase.timeline),
      description: t(`phases.${phase.id}.description`, phase.description),
      categories: phase.categories.map(cat => ({
        ...cat,
        name: t(`categories.${cat.id}.name`, cat.name),
        items: cat.items.map(item => ({
          ...item,
          text: t(`items.${item.id}.text`, item.text),
          detail: t(`items.${item.id}.detail`, item.detail),
          action: item.action ? {
            ...item.action,
            label: t(`items.${item.id}.actionLabel`, item.action.label),
          } : item.action,
          doc: item.doc ? {
            title: t(`items.${item.id}.doc.title`, item.doc.title),
            sections: item.doc.sections.map((sec, idx) => ({
              heading: t(`items.${item.id}.doc.sections.${idx}.heading`, sec.heading),
              body: t(`items.${item.id}.doc.sections.${idx}.body`, sec.body),
            })),
          } : item.doc,
        })),
      })),
    }))
  }, [phases, t])
}
