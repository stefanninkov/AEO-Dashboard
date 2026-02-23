/**
 * calendarBridge — Maps content calendar entries to relevant AEO checklist tasks.
 *
 * Given a calendar entry title/type, suggests which checklist items
 * are most relevant. Enables auto-linking between calendar and checklist.
 */

// Keywords → phase/category patterns
const CONTENT_PATTERNS = [
  {
    keywords: ['faq', 'question', 'q&a', 'answer'],
    tasks: [
      { phase: 1, category: 'content-audit', reason: 'FAQ content needs question-intent audit' },
      { phase: 2, category: 'faq', reason: 'FAQPage schema for question-answer pairs' },
      { phase: 3, category: 'content', reason: 'Structure answers for AI citation' },
    ],
  },
  {
    keywords: ['schema', 'structured data', 'json-ld', 'markup'],
    tasks: [
      { phase: 2, category: 'schema', reason: 'Schema markup implementation' },
      { phase: 2, category: 'technical', reason: 'Technical schema validation' },
    ],
  },
  {
    keywords: ['blog', 'article', 'post', 'write', 'content'],
    tasks: [
      { phase: 3, category: 'content', reason: 'Content optimization for AEO' },
      { phase: 1, category: 'content-audit', reason: 'Audit content for AEO readiness' },
      { phase: 4, category: 'authority', reason: 'Build authority signals' },
    ],
  },
  {
    keywords: ['product', 'service', 'pricing', 'feature'],
    tasks: [
      { phase: 2, category: 'schema', reason: 'Product/Service schema' },
      { phase: 3, category: 'content', reason: 'Product content optimization' },
    ],
  },
  {
    keywords: ['link', 'internal', 'navigation', 'site structure'],
    tasks: [
      { phase: 5, category: 'linking', reason: 'Internal linking strategy' },
      { phase: 1, category: 'technical', reason: 'Site structure audit' },
    ],
  },
  {
    keywords: ['monitor', 'track', 'check', 'audit', 'review'],
    tasks: [
      { phase: 6, category: 'monitoring', reason: 'Ongoing monitoring setup' },
      { phase: 7, category: 'review', reason: 'Regular performance review' },
    ],
  },
  {
    keywords: ['competitor', 'compare', 'benchmark', 'vs'],
    tasks: [
      { phase: 1, category: 'competitor', reason: 'Competitor analysis' },
      { phase: 6, category: 'monitoring', reason: 'Competitor monitoring' },
    ],
  },
  {
    keywords: ['local', 'location', 'map', 'address', 'business'],
    tasks: [
      { phase: 2, category: 'local', reason: 'Local business schema' },
      { phase: 3, category: 'content', reason: 'Local content optimization' },
    ],
  },
]

/**
 * Find checklist items relevant to a calendar entry's content.
 *
 * @param {string} title — Calendar entry title
 * @param {Array} phases — AEO checklist phases
 * @param {Object} checked — Current checked state { [itemId]: boolean }
 * @returns {Array} Suggested items with { id, text, phase, phaseTitle, category, reason, isChecked }
 */
export function generateLinkedTasks(title, phases, checked = {}) {
  if (!title || !phases?.length) return []

  const titleLower = title.toLowerCase()
  const matchedPatterns = CONTENT_PATTERNS.filter(p =>
    p.keywords.some(kw => titleLower.includes(kw))
  )

  if (matchedPatterns.length === 0) {
    // Default: suggest foundational items (phase 1-3)
    return getDefaultSuggestions(phases, checked)
  }

  const suggestions = []
  const seenIds = new Set()

  matchedPatterns.forEach(pattern => {
    pattern.tasks.forEach(task => {
      const phase = phases.find(p => p.number === task.phase)
      if (!phase) return

      // Find relevant items from this phase
      phase.categories.forEach(cat => {
        const catNameLower = cat.name?.toLowerCase() || cat.id?.toLowerCase() || ''
        const taskCatLower = task.category.toLowerCase()

        // Match by category name containing the pattern category
        if (catNameLower.includes(taskCatLower) || cat.id?.includes(taskCatLower)) {
          cat.items.forEach(item => {
            if (seenIds.has(item.id)) return
            seenIds.add(item.id)
            suggestions.push({
              id: item.id,
              text: item.text,
              phase: phase.number,
              phaseTitle: phase.title,
              phaseColor: phase.color,
              category: cat.name,
              reason: task.reason,
              isChecked: !!checked[item.id],
            })
          })
        }
      })
    })
  })

  // Limit to 6 suggestions, prioritize unchecked items
  return suggestions
    .sort((a, b) => {
      if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1
      return a.phase - b.phase
    })
    .slice(0, 6)
}

function getDefaultSuggestions(phases, checked) {
  const suggestions = []
  // Grab first unchecked item from phases 1-3
  for (const phase of phases.slice(0, 3)) {
    for (const cat of phase.categories) {
      for (const item of cat.items) {
        if (!checked[item.id] && suggestions.length < 3) {
          suggestions.push({
            id: item.id,
            text: item.text,
            phase: phase.number,
            phaseTitle: phase.title,
            phaseColor: phase.color,
            category: cat.name,
            reason: 'Foundation task',
            isChecked: false,
          })
        }
      }
    }
  }
  return suggestions
}

/**
 * Get completion stats for linked tasks.
 *
 * @param {Array} linkedTaskIds — Array of checklist item IDs linked to calendar entries
 * @param {Object} checked — Current checked state
 * @returns {{ total: number, completed: number, percentage: number }}
 */
export function getLinkedTaskProgress(linkedTaskIds, checked = {}) {
  if (!linkedTaskIds?.length) return { total: 0, completed: 0, percentage: 0 }
  const completed = linkedTaskIds.filter(id => checked[id]).length
  return {
    total: linkedTaskIds.length,
    completed,
    percentage: Math.round((completed / linkedTaskIds.length) * 100),
  }
}
