/**
 * AnalysisResultsShared — Shared components for displaying AEO analysis results.
 * Used by both the Site Analyzer and the Page Analyzer.
 *
 * Extracted from AnalyzerView.jsx for reuse across:
 *   - AnalyzerView (site-level analysis)
 *   - PageDetailView (page-level analysis)
 */

import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'
import { useFixGenerator, FixButton, FixPanel } from './FixGenerator'
import BulkFixGenerator from './BulkFixGenerator'
import logger from '../../utils/logger'

/* ── Status configuration ── */
export const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Pass' },
  partial: { icon: MinusCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'Partial' },
  fail: { icon: XCircle, color: 'text-error', bg: 'bg-error/10', label: 'Fail' },
}

/* ── JSON parsing ── */
export function parseAnalysisJSON(text) {
  try {
    const clean = text.replace(/```json\s?|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    logger.warn('JSON parse error:', e)
  }
  return null
}

export function parseFixJSON(text) {
  try {
    const clean = text.replace(/```json\s?|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.explanation && parsed.codeBlocks) {
        return parsed
      }
    }
  } catch (e) {
    logger.warn('Fix JSON parse error:', e)
  }
  return null
}

/* ── Compute category score from items ── */
export function computeCategoryScore(items) {
  if (!items || items.length === 0) return 0
  const scoreMap = { pass: 100, partial: 50, fail: 0 }
  const total = items.reduce((sum, item) => sum + (scoreMap[item.status] ?? 0), 0)
  return Math.round(total / items.length)
}

/* ── Plain item row for 'pass' status items ── */
export function AnalyzerItemRow({ item }) {
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.fail
  const Icon = config.icon
  return (
    <div className="analyzer-category-item">
      <Icon size={16} className={`${config.color} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{item.name}</p>
        <p className="text-xs text-text-tertiary mt-0.5">{item.note}</p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
        {config.label}
      </span>
    </div>
  )
}

/* ── Item row with fix generator hook ── */
export function AnalyzerItemWithFix({ item, categoryName, siteUrl, apiKey, existingFix, onFixGenerated }) {
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.fail
  const Icon = config.icon

  const {
    fix, loading, error, showPanel, copied,
    generateFix, togglePanel, copyToClipboard,
  } = useFixGenerator({ item, categoryName, siteUrl, apiKey, existingFix, onFixGenerated })

  return (
    <div>
      <div className="analyzer-category-item">
        <Icon size={16} className={`${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{item.note}</p>
        </div>
        <div className="flex items-center gap-2">
          <FixButton
            hasFix={!!fix}
            loading={loading}
            showPanel={showPanel}
            apiKey={apiKey}
            itemName={item.name}
            onGenerate={generateFix}
            onTogglePanel={togglePanel}
          />
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
            {config.label}
          </span>
        </div>
      </div>
      {showPanel && (
        <FixPanel
          fix={fix}
          loading={loading}
          error={error}
          itemName={item.name}
          copied={copied}
          onRegenerate={generateFix}
          onRetry={generateFix}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  )
}

/* ── Full Analysis Results Display ── */
export function AnalysisResults({ results, apiKey, siteUrl, fixes, onFixGenerated, failItems, onBulkFix }) {
  const scoreColor = results.overallScore >= 70 ? 'text-success' : results.overallScore >= 40 ? 'text-warning' : 'text-error'

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="analyzer-results-card fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-base font-bold">AEO Score</h3>
            <p className="text-xs text-text-tertiary">{results.url} {results.source === 'webflow' ? '(Webflow)' : '(URL Scan)'}</p>
          </div>
          <div className={`font-heading text-4xl font-bold ${scoreColor}`}>
            {results.overallScore}
          </div>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-page)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${results.overallScore}%`,
              backgroundColor: results.overallScore >= 70 ? 'var(--color-success)' : results.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
              animation: 'fill-bar 800ms ease-out forwards',
            }}
          />
        </div>
        {results.summary && (
          <p className="text-sm text-text-secondary mt-3">{results.summary}</p>
        )}
      </div>

      {/* Bulk Fix Generator */}
      <BulkFixGenerator
        failItems={failItems}
        apiKey={apiKey}
        existingFixes={fixes}
        onStartBulk={onBulkFix}
      />

      {/* Categories */}
      {results.categories?.map((category, catIdx) => (
        <div
          key={catIdx}
          className="analyzer-category-card fade-in-up"
          style={{ animationDelay: `${(catIdx + 1) * 80}ms` }}
        >
          <div className="analyzer-category-header">
            <h3 className="font-heading text-sm font-bold">{category.name}</h3>
          </div>
          <div>
            {category.items?.map((item, itemIdx) => {
              const showFix = item.status === 'fail' || item.status === 'partial'
              return showFix ? (
                <AnalyzerItemWithFix
                  key={itemIdx}
                  item={item}
                  categoryName={category.name}
                  siteUrl={siteUrl}
                  apiKey={apiKey}
                  existingFix={fixes[`${category.name}::${item.name}`]}
                  onFixGenerated={onFixGenerated}
                />
              ) : (
                <AnalyzerItemRow key={itemIdx} item={item} />
              )
            })}
          </div>
        </div>
      ))}

      {/* Top Priorities */}
      {results.topPriorities?.length > 0 && (
        <div className="analyzer-priorities-card fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="font-heading text-sm font-bold mb-3 text-phase-5">Top Priorities</h3>
          <div className="space-y-2">
            {results.topPriorities.map((priority, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-heading text-xs text-phase-5 mt-0.5 w-4 text-right flex-shrink-0">{idx + 1}.</span>
                <p className="text-sm text-text-secondary">{priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Skeleton Loader ── */
export function SkeletonLoader() {
  return (
    <div className="space-y-6 fade-in-up">
      <div className="analyzer-results-card">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-3 w-40" />
          </div>
          <div className="skeleton h-12 w-16 rounded-lg" />
        </div>
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-4 w-3/4 mt-3" />
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="analyzer-category-card" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="analyzer-category-header">
            <div className="skeleton h-4 w-32" />
          </div>
          <div>
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="analyzer-category-item">
                <div className="skeleton h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-full" />
                </div>
                <div className="skeleton h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
