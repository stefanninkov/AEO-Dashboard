import { memo, useState } from 'react'
import {
  BarChart3, Download, FileJson, FileSpreadsheet, FileText,
  LayoutGrid, ChevronDown,
} from 'lucide-react'
import { useTrendAnalysis } from '../hooks/useTrendAnalysis'
import { useBulkExport } from '../hooks/useBulkExport'
import TrendAnalysisPanel from '../components/TrendAnalysisPanel'
import DigestPreview from '../components/DigestPreview'

/**
 * AnalyticsView — Advanced analytics hub combining trend analysis,
 * digest previews, and data export.
 */
function AnalyticsView({
  activeProject, projects, projectSummaries, portfolioStats,
  phases, setActiveView, updateProject,
}) {
  const [tab, setTab] = useState('trends')

  const trendData = useTrendAnalysis({ activeProject, lookback: 30 })
  const exportTools = useBulkExport({ activeProject, projects, projectSummaries })

  // Simple digest data (inline to avoid circular dep)
  const history = activeProject?.metricsHistory || []
  const latest = history[history.length - 1]
  const previous = history[history.length - 2]
  const projectReport = activeProject ? {
    type: 'project',
    generatedAt: new Date().toISOString(),
    project: { name: activeProject.name, url: activeProject.url },
    metrics: {
      score: latest?.overallScore ?? 0,
      scoreDelta: previous ? (latest?.overallScore ?? 0) - (previous?.overallScore ?? 0) : 0,
      citations: latest?.citations?.total ?? 0,
      citationsDelta: 0,
      prompts: latest?.prompts?.total ?? 0,
      checkedCount: Object.values(activeProject.checked || {}).filter(Boolean).length,
    },
    activity: {
      recent: (activeProject.activityLog || []).slice(0, 10),
      byType: {},
      total: Math.min((activeProject.activityLog || []).length, 10),
    },
    automation: {
      totalRules: (activeProject.automationRules || []).length,
      enabledRules: (activeProject.automationRules || []).filter(r => r.enabled).length,
      rulesTriggered: 0,
    },
  } : null

  const TABS = [
    { id: 'trends', label: 'Trend Analysis' },
    { id: 'digest', label: 'Digest Preview' },
    { id: 'export', label: 'Export Data' },
  ]

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '76rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Analytics
          </h1>
        </div>
        {setActiveView && (
          <button
            onClick={() => setActiveView('custom-dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--accent)', border: 'none',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontSize: 'var(--text-2xs)', fontWeight: 600, color: '#fff',
            }}
          >
            <LayoutGrid size={10} /> Custom Dashboard
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 'var(--space-1)',
        marginBottom: 'var(--space-4)',
        borderBottom: '0.0625rem solid var(--border-subtle)',
        paddingBottom: 'var(--space-1)',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-xs)', fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t.id ? 'var(--accent)' : 'var(--text-tertiary)',
              borderBottom: tab === t.id ? '0.125rem solid var(--accent)' : '0.125rem solid transparent',
              marginBottom: '-0.0625rem',
              transition: 'all 100ms',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'trends' && (
        <TrendAnalysisPanel
          trends={trendData.trends}
          anomalies={trendData.anomalies}
          periodComparison={trendData.periodComparison}
          forecast={trendData.forecast}
          insights={trendData.insights}
          historyLength={trendData.historyLength}
          history={activeProject?.metricsHistory || []}
        />
      )}

      {tab === 'digest' && (
        <DigestPreview
          projectReport={projectReport}
          portfolioReport={null}
          onExport={() => {
            const blob = new Blob([JSON.stringify(projectReport, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `digest-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
        />
      )}

      {tab === 'export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{
            background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
          }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-3)' }}>
              Export Data
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: '0 0 var(--space-4)' }}>
              Download your project data in various formats for reporting or backup.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))', gap: 'var(--space-3)' }}>
              <ExportCard
                icon={<FileJson size={16} />}
                title="Project Data (JSON)"
                description="Full project data including all settings, metrics, and history"
                onClick={exportTools.exportProjectJson}
              />
              <ExportCard
                icon={<FileSpreadsheet size={16} />}
                title="Metrics History (CSV)"
                description="Score, citations, and prompts over time"
                onClick={exportTools.exportMetricsCsv}
                disabled={!activeProject?.metricsHistory?.length}
              />
              <ExportCard
                icon={<FileSpreadsheet size={16} />}
                title="Checklist Status (CSV)"
                description="All checklist items with completion status"
                onClick={() => exportTools.exportChecklistCsv(phases)}
                disabled={!phases?.length}
              />
              <ExportCard
                icon={<FileSpreadsheet size={16} />}
                title="Activity Log (CSV)"
                description="Full activity history with timestamps and authors"
                onClick={exportTools.exportActivityCsv}
                disabled={!activeProject?.activityLog?.length}
              />
              <ExportCard
                icon={<FileText size={16} />}
                title="Report (Markdown)"
                description="Human-readable report with key metrics and engine breakdown"
                onClick={exportTools.exportMarkdownReport}
              />
              {projectSummaries?.length > 1 && (
                <ExportCard
                  icon={<FileSpreadsheet size={16} />}
                  title="Portfolio Summary (CSV)"
                  description="All projects with scores, citations, and completion"
                  onClick={exportTools.exportPortfolioCsv}
                />
              )}
            </div>
          </div>

          {/* Bulk export */}
          <div style={{
            background: 'var(--bg-card)', border: '0.0625rem solid var(--accent)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.125rem' }}>
                Bulk Export
              </h4>
              <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                Download all formats at once (JSON + CSV + Markdown)
              </p>
            </div>
            <button
              onClick={() => exportTools.exportAll(phases)}
              disabled={exportTools.exporting}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--accent)', border: 'none',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontSize: 'var(--text-xs)', fontWeight: 600, color: '#fff',
                opacity: exportTools.exporting ? 0.5 : 1,
              }}
            >
              <Download size={12} />
              {exportTools.exporting ? 'Exporting...' : 'Export All'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExportCard({ icon, title, description, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
        padding: 'var(--space-3)', textAlign: 'left',
        background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'border-color 100ms',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      <div style={{ color: 'var(--accent)' }}>{icon}</div>
      <div>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    </button>
  )
}

export default memo(AnalyticsView)
