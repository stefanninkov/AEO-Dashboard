/**
 * PageDetailView — Detailed AEO analysis for a single page.
 *
 * Shows the full analysis results (categories, items, fix generation)
 * for a specific page URL. Reuses AnalysisResults from shared module.
 */

import { useMemo } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { AnalysisResults } from './AnalysisResultsShared'
import { shortPageUrl } from './usePageAnalyzer'
import { callAnthropicApi } from '../../utils/apiClient'
import { parseFixJSON } from './AnalysisResultsShared'
import logger from '../../utils/logger'

export default function PageDetailView({
  pageUrl,
  pageData,
  apiKey,
  fixes,
  onFixGenerated,
  onBulkFix,
  onBack,
}) {
  if (!pageData) return null

  // Collect fail/partial items for bulk fix
  const failItems = useMemo(() => {
    if (!pageData.categories) return []
    const items = []
    pageData.categories.forEach(cat => {
      cat.items?.forEach(item => {
        if (item.status === 'fail' || item.status === 'partial') {
          items.push({ item, categoryName: cat.name })
        }
      })
    })
    return items
  }, [pageData.categories])

  // Fix handler wraps parent handler with page URL context
  const handleFixGenerated = (fixData) => {
    onFixGenerated(pageUrl, fixData)
  }

  // Bulk fix handler
  const handleBulkFix = async (items, onProgress) => {
    await onBulkFix(pageUrl, items, onProgress)
  }

  const displayUrl = shortPageUrl(pageUrl)

  return (
    <div className="space-y-6">
      {/* Back button + page info */}
      <div>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', padding: '0.25rem 0',
            transition: 'color 100ms',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={14} />
          All pages
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {pageData.label || displayUrl}
          </h3>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.6875rem', color: 'var(--text-tertiary)',
              textDecoration: 'none',
            }}
          >
            {pageUrl}
            <ExternalLink size={10} />
          </a>
        </div>

        {pageData.analyzedAt && (
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>
            Analyzed {new Date(pageData.analyzedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Full analysis results (shared component) */}
      <AnalysisResults
        results={pageData}
        apiKey={apiKey}
        siteUrl={pageUrl}
        fixes={fixes}
        onFixGenerated={handleFixGenerated}
        failItems={failItems}
        onBulkFix={handleBulkFix}
      />
    </div>
  )
}
