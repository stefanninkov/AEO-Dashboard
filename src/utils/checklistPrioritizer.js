// src/utils/checklistPrioritizer.js

/**
 * Reorders checklist items based on analyzer results.
 * Items that address actual detected issues get promoted.
 */
export function prioritizeChecklist(phases, analyzerResults, deterministicScore) {
  if (!deterministicScore) return [] // No data yet — no priorities

  const priorities = []

  // If schema score is low, promote Phase 2 (Schema)
  const schemaCategory = deterministicScore.categories['Schema Markup']
  if (schemaCategory && (schemaCategory.score / schemaCategory.maxScore) < 0.5) {
    priorities.push({ phaseId: 'phase-2', reason: 'Schema markup needs improvement', urgency: 'high' })
  }

  // If AI crawlers are blocked, promote relevant Technical items
  const aiCategory = deterministicScore.categories['AI Discoverability']
  if (aiCategory && (aiCategory.score / aiCategory.maxScore) < 0.5) {
    priorities.push({ phaseId: 'phase-1', reason: 'AI crawler access issues detected', urgency: 'critical' })
  }

  // If content is thin, promote Content Authority phase
  const contentCategory = deterministicScore.categories['Content Structure']
  if (contentCategory && (contentCategory.score / contentCategory.maxScore) < 0.5) {
    priorities.push({ phaseId: 'phase-3', reason: 'Content structure needs improvement', urgency: 'high' })
  }

  // If technical foundation is weak
  const techCategory = deterministicScore.categories['Technical']
  if (techCategory && (techCategory.score / techCategory.maxScore) < 0.5) {
    priorities.push({ phaseId: 'phase-1', reason: 'Technical foundation needs attention', urgency: 'high' })
  }

  // If authority signals are weak
  const authCategory = deterministicScore.categories['Authority Signals']
  if (authCategory && (authCategory.score / authCategory.maxScore) < 0.5) {
    priorities.push({ phaseId: 'phase-4', reason: 'Authority signals need strengthening', urgency: 'medium' })
  }

  return priorities
}
