/**
 * Whitelisted fields for project JSON import.
 * Derived from DEFAULT_PROJECT_DATA shape in useFirestoreProjects.js.
 * Fields NOT in this list are silently stripped during import.
 */
export const ALLOWED_IMPORT_FIELDS = [
  'name', 'url', 'webflowSiteId', 'checked', 'verifications',
  'assignments', 'comments', 'notifications',
  'analyzerResults', 'analyzerFixes', 'pageAnalyses', 'pageAnalyzerFixes',
  'contentCalendar', 'contentBriefs', 'contentHistory', 'schemaHistory',
  'queryTracker', 'monitorHistory', 'lastMonitorRun',
  'metricsHistory', 'lastMetricsRun', 'notes',
  'competitors', 'competitorAnalysis', 'lastCompetitorRun',
  'competitorMonitorHistory', 'lastCompetitorMonitorRun',
  'competitorAlerts', 'citationShareHistory', 'lastCitationShareRun',
  'questionnaire', 'settings', 'webhooks',
]

/**
 * Pick only allowed fields from an imported object.
 */
export function sanitizeImport(obj) {
  if (!obj || typeof obj !== 'object') return {}
  const cleaned = {}
  for (const key of ALLOWED_IMPORT_FIELDS) {
    if (key in obj) cleaned[key] = obj[key]
  }
  return cleaned
}
