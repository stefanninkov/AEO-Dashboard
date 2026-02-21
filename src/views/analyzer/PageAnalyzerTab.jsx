/**
 * PageAnalyzerTab — Main container for the Page Analysis tab.
 *
 * Shows stat cards, URL input, batch progress, and either:
 *   - PageAnalysisTable (list of all pages)
 *   - PageDetailView (detail for a selected page)
 */

import { useState, useMemo } from 'react'
import { hasApiKey } from '../../utils/aiProvider'
import {
  FileText, TrendingDown, AlertTriangle, BarChart3,
  Zap, Loader2, Plus, Download as ImportIcon, Search,
} from 'lucide-react'
import { usePageAnalyzer, shortPageUrl } from './usePageAnalyzer'
import PageAnalysisTable from './PageAnalysisTable'
import PageDetailView from './PageDetailView'

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <div className="card" style={{ padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '0.5rem',
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginTop: '0.0625rem' }}>
          {label}
        </div>
        {subValue && (
          <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '0.0625rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */

export default function PageAnalyzerTab({ activeProject, updateProject, user, gscPageData }) {
  const [newUrl, setNewUrl] = useState('')

  const pa = usePageAnalyzer({ activeProject, updateProject, user })

  const apiKeyAvailable = hasApiKey()

  // ── Add & Analyze ──
  const handleAnalyze = async () => {
    if (!newUrl.trim()) return
    await pa.analyzePage(newUrl.trim())
    setNewUrl('')
  }

  // ── Import from GSC ──
  const handleImportGsc = async () => {
    const urls = pa.importFromGsc(gscPageData)
    if (urls.length === 0) {
      // Nothing new to import
      return
    }
    await pa.analyzePages(urls)
  }

  // ── If detail view selected ──
  if (pa.selectedPageUrl) {
    const pageData = pa.pageAnalyses[pa.selectedPageUrl]
    return (
      <PageDetailView
        pageUrl={pa.selectedPageUrl}
        pageData={pageData}
        fixes={pa.getPageFixes(pa.selectedPageUrl)}
        onFixGenerated={pa.handlePageFixGenerated}
        onBulkFix={pa.handlePageBulkFix}
        onBack={() => pa.selectPage(null)}
      />
    )
  }

  const hasGscData = !!gscPageData?.rows?.length

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      {pa.pages.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '0.625rem' }}>
          <StatCard
            icon={FileText}
            label="Pages Analyzed"
            value={pa.stats.count}
            color="#3B82F6"
          />
          <StatCard
            icon={BarChart3}
            label="Average Score"
            value={pa.stats.avgScore}
            color={pa.stats.avgScore >= 70 ? '#10B981' : pa.stats.avgScore >= 40 ? '#F59E0B' : '#EF4444'}
          />
          <StatCard
            icon={TrendingDown}
            label="Lowest Score"
            value={pa.stats.lowestScore}
            subValue={pa.stats.lowestUrl ? shortPageUrl(pa.stats.lowestUrl) : ''}
            color="#EF4444"
          />
          <StatCard
            icon={AlertTriangle}
            label="Needs Work"
            value={pa.stats.needsWork}
            subValue={pa.stats.needsWork > 0 ? 'score < 50' : 'all pages healthy'}
            color={pa.stats.needsWork > 0 ? '#F59E0B' : '#10B981'}
          />
        </div>
      )}

      {/* Add page URL */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Plus size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04rem', fontFamily: 'var(--font-mono)' }}>
            Add Page to Analyze
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="https://example.com/your-page"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            className="analyzer-url-input"
            style={{ flex: 1 }}
            disabled={pa.analyzing}
          />
          <button
            onClick={handleAnalyze}
            disabled={pa.analyzing || !newUrl.trim() || !apiKeyAvailable}
            className="metrics-run-btn"
            style={{ whiteSpace: 'nowrap' }}
          >
            {pa.analyzing && pa.progress.total <= 1 ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Zap size={14} />
            )}
            Analyze
          </button>
          {hasGscData && (
            <button
              onClick={handleImportGsc}
              disabled={pa.analyzing}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4375rem 0.75rem', whiteSpace: 'nowrap' }}
              title="Import top pages from Search Console data"
            >
              <ImportIcon size={13} />
              Import from GSC
            </button>
          )}
        </div>

        {!apiKeyAvailable && (
          <p style={{ fontSize: '0.6875rem', color: 'var(--color-warning)', marginTop: '0.375rem' }}>
            Set your API key in Settings → API & Usage first.
          </p>
        )}
      </div>

      {/* Batch Progress */}
      {pa.analyzing && pa.progress.total > 1 && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Analyzing pages...
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {pa.progress.current} / {pa.progress.total}
            </span>
          </div>
          <div style={{
            width: '100%', height: '0.375rem', borderRadius: '0.25rem',
            background: 'var(--hover-bg)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${(pa.progress.current / pa.progress.total) * 100}%`,
              height: '100%', borderRadius: '0.25rem',
              background: 'var(--color-phase-1)',
              transition: 'width 300ms ease',
            }} />
          </div>
        </div>
      )}

      {/* Error */}
      {pa.error && (
        <div className="card" style={{
          padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(239,68,68,0.06)', border: '0.0625rem solid rgba(239,68,68,0.15)',
        }}>
          <AlertTriangle size={14} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-error)', flex: 1 }}>{pa.error}</span>
          <button
            onClick={pa.clearError}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Single page loading */}
      {pa.analyzing && pa.progress.total <= 1 && (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{
            width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--hover-bg)',
            borderTopColor: 'var(--color-phase-1)', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem',
          }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            Analyzing page...
          </p>
          <p style={{ color: 'var(--text-disabled)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            This may take 10-20 seconds while the AI visits and evaluates the page.
          </p>
        </div>
      )}

      {/* Table */}
      {pa.pages.length > 0 && !pa.analyzing && (
        <PageAnalysisTable
          pages={pa.pages}
          onSelectPage={pa.selectPage}
          onReanalyze={pa.reanalyzePage}
          onRemove={pa.removePage}
          analyzing={pa.analyzing}
        />
      )}

      {/* Empty state */}
      {pa.pages.length === 0 && !pa.analyzing && (
        <div className="card" style={{
          padding: '3rem 2rem', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        }}>
          <Search size={28} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No pages analyzed yet
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '28rem' }}>
              Add individual page URLs to get per-page AEO scores. This tells you exactly which pages need work and what to fix first.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
