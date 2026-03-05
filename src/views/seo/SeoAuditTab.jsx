import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Globe, Loader2, AlertCircle, CheckCircle2, XCircle, MinusCircle,
  TrendingUp, Zap, ExternalLink, ChevronDown, ChevronUp, Lightbulb,
  Copy, Check, Filter, Heart, RefreshCw, Users, List, Map, Eye,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

/* ── 4-tier score color ── */
function scoreColor(score) {
  if (score >= 90) return '#10b981'
  if (score >= 70) return 'var(--color-success)'
  if (score >= 40) return 'var(--color-warning)'
  return 'var(--color-error)'
}

/* ── Copy Button ── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e) => {
    e.stopPropagation()
    const copyText = Array.isArray(text) ? text.join('\n') : text
    navigator.clipboard.writeText(copyText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy'}
      style={{
        background: 'none', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)', padding: '0.25rem', cursor: 'pointer',
        color: copied ? 'var(--color-success)' : 'var(--text-tertiary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'color 200ms',
      }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  )
}

/* ── Score Ring ── */
function ScoreRing({ score, label, size = 'lg' }) {
  const color = scoreColor(score)
  const isLg = size === 'lg'
  const dim = isLg ? '5rem' : '3.5rem'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: dim, height: dim, borderRadius: '50%', border: `3px solid ${color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: isLg ? '1.5rem' : '1rem', color, lineHeight: 1 }}>
          {score}
        </span>
        {isLg && <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>/100</span>}
      </div>
      {label && <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>}
    </div>
  )
}

/* ── Category Bar ── */
function CategoryBar({ name, score, maxScore }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const color = scoreColor(pct)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '10rem', flexShrink: 0 }}>{name}</span>
      <div style={{ flex: 1, height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '0.25rem', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '0.25rem', transition: 'width 500ms ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, fontWeight: 600, width: '2.5rem', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

/* ── Check Item Row with expandable fix guidance + copy + re-check ── */
function CheckRow({ check, onRecheck, rechecking }) {
  const [expanded, setExpanded] = useState(false)
  const icon = check.status === 'pass' ? <CheckCircle2 size={14} /> : check.status === 'fail' ? <XCircle size={14} /> : <MinusCircle size={14} />
  const color = check.status === 'pass' ? 'var(--color-success)' : check.status === 'fail' ? 'var(--color-error)' : 'var(--color-warning)'
  const hasFix = check.status !== 'pass' && check.fix
  return (
    <div style={{ padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: hasFix ? 'pointer' : 'default' }}
        onClick={() => hasFix && setExpanded(prev => !prev)}
      >
        <span style={{ color, flexShrink: 0, marginTop: '0.0625rem' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{check.item}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {check.status !== 'pass' && onRecheck && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRecheck() }}
                  disabled={rechecking}
                  title="Re-check"
                  style={{
                    background: 'none', border: 'none', cursor: rechecking ? 'wait' : 'pointer',
                    color: 'var(--text-tertiary)', padding: '0.125rem', display: 'inline-flex',
                  }}
                >
                  <RefreshCw size={11} className={rechecking ? 'animate-spin' : ''} />
                </button>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, fontWeight: 600 }}>
                {check.points}/{check.maxPoints}
              </span>
              {hasFix && (
                expanded
                  ? <ChevronUp size={12} style={{ color: 'var(--text-tertiary)' }} />
                  : <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
          </div>
          {check.detail && (
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem', lineHeight: 1.4 }}>
              {check.detail}
            </p>
          )}
        </div>
      </div>
      {/* Expandable fix guidance */}
      {expanded && check.fix && (
        <div style={{
          marginTop: '0.5rem', marginLeft: '1.375rem', padding: '0.625rem 0.75rem',
          background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--accent) 12%, transparent)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lightbulb size={12} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)' }}>How to fix</span>
            </div>
            <CopyButton text={check.fix} />
          </div>
          {Array.isArray(check.fix) ? (
            <ol style={{ margin: 0, paddingLeft: '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {check.fix.map((step, i) => (
                <li key={i} style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{check.fix}</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Custom chart tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.625rem', fontSize: '0.6875rem',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          {p.name}: <span style={{ fontWeight: 600, color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Filter Chip ── */
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.25rem 0.625rem', fontSize: '0.6875rem', fontWeight: 500,
        border: `0.0625rem solid ${active ? 'var(--accent)' : 'var(--border-subtle)'}`,
        borderRadius: '1rem', cursor: 'pointer', whiteSpace: 'nowrap',
        background: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--bg-card)',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        transition: 'all 150ms ease',
      }}
    >
      {label}
    </button>
  )
}

/* ── Scan Mode Tabs ── */
function ScanModeTabs({ mode, onChange }) {
  const { t } = useTranslation('app')
  const modes = [
    { key: 'single', label: t('seo.singleUrl', 'Single URL'), icon: Globe },
    { key: 'bulk', label: t('seo.bulkUrls', 'Bulk Scan'), icon: List },
    { key: 'sitemap', label: t('seo.sitemapScan', 'Sitemap'), icon: Map },
  ]
  return (
    <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', border: '0.0625rem solid var(--border-subtle)' }}>
      {modes.map(m => {
        const Icon = m.icon
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            style={{
              padding: '0.375rem 0.625rem', fontSize: '0.6875rem', fontWeight: 500,
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              background: mode === m.key ? 'var(--bg-card)' : 'transparent',
              color: mode === m.key ? 'var(--accent)' : 'var(--text-tertiary)',
              boxShadow: mode === m.key ? 'var(--shadow-sm)' : 'none',
              transition: 'all 150ms ease',
            }}
          >
            <Icon size={12} />
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Competitor Comparison Section ── */
function CompetitorSection({ analyzer }) {
  const { t } = useTranslation('app')
  const [compUrl, setCompUrl] = useState('')
  const { scanning, scanCompetitor, competitorScans, lastScan } = analyzer

  const handleScanCompetitor = async () => {
    if (!compUrl.trim() || scanning) return
    await scanCompetitor(compUrl.trim())
    setCompUrl('')
  }

  const compEntries = Object.entries(competitorScans || {})
  const yourScore = lastScan?.seoScore?.overallScore || 0
  const yourAeo = lastScan?.aeoScore?.overallScore || 0

  return (
    <div style={{
      padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users size={16} style={{ color: 'var(--accent)' }} />
        {t('seo.compare', 'Competitor Comparison')}
      </h3>
      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
        {t('seo.compareDesc', 'Compare your SEO scores against competitors')}
      </p>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="url"
          value={compUrl}
          onChange={e => setCompUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScanCompetitor()}
          placeholder={t('seo.competitorUrl', 'Enter competitor URL...')}
          style={{
            flex: 1, padding: '0.5rem 0.75rem', background: 'var(--bg-page)', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleScanCompetitor}
          disabled={scanning || !compUrl.trim()}
          className="btn-primary"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
        >
          {scanning ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
          {t('seo.runAudit')}
        </button>
      </div>

      {/* Results table */}
      {compEntries.length > 0 && lastScan && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>URL</th>
                <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>SEO</th>
                <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>AEO</th>
                {lastScan.seoScore?.categories && Object.keys(lastScan.seoScore.categories).map(cat => (
                  <th key={cat} style={{ textAlign: 'center', padding: '0.5rem 0.5rem', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.625rem' }}>
                    {cat.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Your site row */}
              <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)', background: 'color-mix(in srgb, var(--accent) 4%, transparent)' }}>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                  {t('seo.yourSite', 'Your Site')}
                </td>
                <td style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 700, color: scoreColor(yourScore) }}>{yourScore}</td>
                <td style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 700, color: scoreColor(yourAeo) }}>{yourAeo}</td>
                {lastScan.seoScore?.categories && Object.values(lastScan.seoScore.categories).map((cat, i) => {
                  const pct = cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0
                  return (
                    <td key={i} style={{ textAlign: 'center', padding: '0.5rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.625rem', fontWeight: 600, color: scoreColor(pct),
                        background: `color-mix(in srgb, ${scoreColor(pct)} 10%, transparent)`,
                      }}>{pct}%</span>
                    </td>
                  )
                })}
              </tr>
              {/* Competitor rows */}
              {compEntries.map(([url, scan]) => {
                const compSeo = scan.seoScore?.overallScore || 0
                const compAeo = scan.aeoScore?.overallScore || 0
                return (
                  <tr key={url} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {new URL(url).hostname}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 700, color: scoreColor(compSeo) }}>{compSeo}</td>
                    <td style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 700, color: scoreColor(compAeo) }}>{compAeo}</td>
                    {scan.seoScore?.categories && Object.values(scan.seoScore.categories).map((cat, i) => {
                      const pct = cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0
                      return (
                        <td key={i} style={{ textAlign: 'center', padding: '0.5rem' }}>
                          <span style={{
                            display: 'inline-block', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.625rem', fontWeight: 600, color: scoreColor(pct),
                            background: `color-mix(in srgb, ${scoreColor(pct)} 10%, transparent)`,
                          }}>{pct}%</span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function SeoAuditTab({ analyzer, activeProject }) {
  const { t } = useTranslation('app')
  const [urlInput, setUrlInput] = useState(analyzer.lastScanUrl || activeProject?.url || '')
  const [activeFilter, setActiveFilter] = useState('all')
  const [scanMode, setScanMode] = useState('single')
  const [bulkText, setBulkText] = useState('')
  const [sitemapUrl, setSitemapUrl] = useState('')
  const { scanning, error, lastScan, auditHistory, scanUrl, scanBulk, bulkProgress, recheckUrl, recheckingId, sitemapAudit } = analyzer

  // Reset URL input when project changes
  const projectId = activeProject?.id
  useEffect(() => {
    setUrlInput(analyzer.lastScanUrl || activeProject?.url || '')
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScan = async () => {
    if (!urlInput.trim() || scanning) return
    await scanUrl(urlInput.trim())
  }

  const handleBulkScan = async () => {
    const urls = bulkText.split('\n').map(u => u.trim()).filter(Boolean)
    if (urls.length === 0 || scanning) return
    await scanBulk(urls)
  }

  const handleSitemapScan = async () => {
    const url = sitemapUrl.trim() || (lastScan?.sitemapData?.url)
    if (!url || scanning) return
    await analyzer.scanSitemap(url)
  }

  const handleRecheck = async () => {
    if (!lastScan?.url) return
    await recheckUrl(lastScan.url)
  }

  const seoScore = lastScan?.seoScore
  const aeoScore = lastScan?.aeoScore

  // Combined Site Health Score
  const healthScore = seoScore && aeoScore
    ? Math.round((seoScore.overallScore + aeoScore.overallScore) / 2)
    : seoScore?.overallScore || 0

  // Delta from previous scan
  const prevEntry = auditHistory.length > 1 ? auditHistory[auditHistory.length - 2] : null
  const delta = prevEntry && seoScore ? seoScore.overallScore - prevEntry.overall : null

  // Filter chips
  const FILTERS = [
    { key: 'all', label: t('seo.filter.all', 'All') },
    { key: 'failing', label: t('seo.filter.failing', 'Failing') },
    { key: 'Keyword Optimization', label: t('seo.filter.keyword', 'Keywords') },
    { key: 'Readability & UX', label: t('seo.filter.readability', 'Readability') },
    { key: 'URL & Technical', label: t('seo.filter.technical', 'Technical') },
    { key: 'Social & Sharing', label: t('seo.filter.social', 'Social') },
    { key: 'Image Optimization', label: t('seo.filter.images', 'Images') },
  ]

  // Filtered checks
  const filteredChecks = useMemo(() => {
    if (!seoScore?.checks) return []
    if (activeFilter === 'all') return null // use default priority/quick wins view
    if (activeFilter === 'failing') return seoScore.checks.filter(c => c.status === 'fail' || c.status === 'partial')
    return seoScore.checks.filter(c => c.category === activeFilter)
  }, [seoScore, activeFilter])

  // Priority issues & quick wins (for "all" filter)
  const priorityIssues = seoScore?.checks
    ?.filter(c => c.status === 'fail')
    ?.sort((a, b) => b.maxPoints - a.maxPoints)
    ?.slice(0, 10) || []

  const quickWins = seoScore?.checks
    ?.filter(c => c.status === 'partial')
    ?.sort((a, b) => a.maxPoints - b.maxPoints)
    ?.slice(0, 5) || []

  // History chart data
  const chartData = useMemo(() => {
    if (auditHistory.length < 2) return []
    return auditHistory.slice(-20).map(e => ({
      date: new Date(e.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      seo: e.overall || 0,
      aeo: e.aeoOverall || 0,
      health: Math.round(((e.overall || 0) + (e.aeoOverall || 0)) / 2),
    }))
  }, [auditHistory])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 0' }}>
      {/* Scan Mode Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <ScanModeTabs mode={scanMode} onChange={setScanMode} />
      </div>

      {/* ── Single URL Input ── */}
      {scanMode === 'single' && (
        <div style={{
          display: 'flex', gap: '0.75rem', alignItems: 'center',
          padding: '1rem 1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <Globe size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder={t('seo.scanUrl')}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: '0.875rem', color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            onClick={handleScan}
            disabled={scanning || !urlInput.trim()}
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {scanning ? t('seo.scanning') : t('seo.runAudit')}
          </button>
        </div>
      )}

      {/* ── Bulk URL Scan ── */}
      {scanMode === 'bulk' && (
        <div style={{
          padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <List size={16} style={{ color: 'var(--accent)' }} />
            {t('seo.bulkScan', 'Bulk URL Scan')}
          </h3>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
            {t('seo.bulkScanDesc', 'Enter up to 10 URLs (one per line) to scan them all sequentially.')}
          </p>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder={t('seo.bulkPlaceholder', 'https://example.com\nhttps://example.com/about\nhttps://example.com/blog')}
            rows={5}
            style={{
              width: '100%', padding: '0.75rem', background: 'var(--bg-page)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              resize: 'vertical', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              onClick={handleBulkScan}
              disabled={scanning || !bulkText.trim()}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              {t('seo.scanAll', 'Scan All')}
            </button>
            {bulkProgress && scanning && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t('seo.scanProgress', 'Scanning {{current}}/{{total}}...').replace('{{current}}', bulkProgress.current).replace('{{total}}', bulkProgress.total)}
              </span>
            )}
          </div>

          {/* Bulk Progress Bar */}
          {bulkProgress && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                <div style={{
                  width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                  height: '100%', background: 'var(--accent)', borderRadius: '0.25rem',
                  transition: 'width 300ms ease',
                }} />
              </div>
            </div>
          )}

          {/* Bulk Results Table */}
          {bulkProgress?.results?.length > 0 && (
            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>URL</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>SEO</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>AEO</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Top Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkProgress.results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.success ? new URL(r.url).pathname || '/' : r.url}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 700, color: r.success ? scoreColor(r.seoScore) : 'var(--color-error)' }}>
                        {r.success ? r.seoScore : 'Err'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 700, color: r.success ? scoreColor(r.aeoScore) : 'var(--color-error)' }}>
                        {r.success ? r.aeoScore : '-'}
                      </td>
                      <td style={{ padding: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>
                        {r.success ? r.topIssue : r.error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sitemap Scan ── */}
      {scanMode === 'sitemap' && (
        <div style={{
          padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Map size={16} style={{ color: 'var(--accent)' }} />
            {t('seo.sitemapAudit', 'Sitemap Audit')}
          </h3>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
            Scans up to 20 pages from your sitemap for a site-wide SEO health overview.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="url"
              value={sitemapUrl}
              onChange={e => setSitemapUrl(e.target.value)}
              placeholder={lastScan?.sitemapData?.url || 'https://example.com/sitemap.xml'}
              style={{
                flex: 1, padding: '0.5rem 0.75rem', background: 'var(--bg-page)', border: '0.0625rem solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSitemapScan}
              disabled={scanning}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Map size={14} />}
              {scanning ? t('seo.scanning') : 'Scan Sitemap'}
            </button>
          </div>

          {/* Progress */}
          {bulkProgress && scanning && (
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t('seo.sitemapProgress', 'Auditing page {{current}}/{{total}}...').replace('{{current}}', bulkProgress.current).replace('{{total}}', bulkProgress.total)}
              </span>
              <div style={{ height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '0.25rem', overflow: 'hidden', marginTop: '0.375rem' }}>
                <div style={{
                  width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                  height: '100%', background: 'var(--accent)', borderRadius: '0.25rem', transition: 'width 300ms ease',
                }} />
              </div>
            </div>
          )}

          {/* Sitemap Audit Results */}
          {sitemapAudit && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '0.625rem 1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)',
                  border: '0.0625rem solid var(--border-subtle)', textAlign: 'center', flex: 1, minWidth: '5rem',
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: scoreColor(sitemapAudit.avgSeoScore) }}>{sitemapAudit.avgSeoScore}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>{t('seo.avgScore', 'Avg SEO Score')}</div>
                </div>
                <div style={{
                  padding: '0.625rem 1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)',
                  border: '0.0625rem solid var(--border-subtle)', textAlign: 'center', flex: 1, minWidth: '5rem',
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: scoreColor(sitemapAudit.avgAeoScore) }}>{sitemapAudit.avgAeoScore}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>Avg AEO</div>
                </div>
                <div style={{
                  padding: '0.625rem 1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)',
                  border: '0.0625rem solid var(--border-subtle)', textAlign: 'center', flex: 1, minWidth: '5rem',
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sitemapAudit.scannedPages}/{sitemapAudit.totalPages}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>Pages</div>
                </div>
              </div>

              {/* Worst & Best pages */}
              {sitemapAudit.worst?.length > 0 && (
                <>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-error)', marginBottom: '0.375rem' }}>{t('seo.worstPages', 'Worst Pages')}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    {sitemapAudit.worst.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6875rem' }}>
                        <span style={{ fontWeight: 700, color: scoreColor(p.seoScore), width: '2rem', textAlign: 'right' }}>{p.seoScore}</span>
                        <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new URL(p.url).pathname || '/'}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {sitemapAudit.best?.length > 0 && (
                <>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', marginBottom: '0.375rem' }}>{t('seo.bestPages', 'Best Pages')}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {sitemapAudit.best.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6875rem' }}>
                        <span style={{ fontWeight: 700, color: scoreColor(p.seoScore), width: '2rem', textAlign: 'right' }}>{p.seoScore}</span>
                        <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new URL(p.url).pathname || '/'}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--color-error) 20%, transparent)',
          borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: '0.8125rem',
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* No scans yet */}
      {!lastScan && !scanning && scanMode === 'single' && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          color: 'var(--text-tertiary)',
        }}>
          <Globe size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {t('seo.noScans')}
          </h3>
          <p style={{ fontSize: '0.875rem', maxWidth: '24rem', margin: '0 auto' }}>
            {t('seo.noScansDesc')}
          </p>
        </div>
      )}

      {/* Results */}
      {seoScore && (
        <>
          {/* Site Health + Score Rings */}
          <div style={{
            padding: '1.5rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}>
            {/* Site Health Header */}
            {aeoScore && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Heart size={16} style={{ color: scoreColor(healthScore) }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('seo.siteHealth', 'Site Health')}
                </span>
                <span style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
                  color: scoreColor(healthScore),
                }}>
                  {healthScore}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>/100</span>
              </div>
            )}

            {/* Score Rings Row */}
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'flex-end' }}>
              <div style={{ position: 'relative' }}>
                <ScoreRing score={seoScore.overallScore} label={t('seo.seoScore')} />
                {/* Delta Badge */}
                {delta != null && delta !== 0 && (
                  <span style={{
                    position: 'absolute', top: '-0.375rem', right: '-1.5rem',
                    fontSize: '0.625rem', fontWeight: 700,
                    color: delta > 0 ? 'var(--color-success)' : 'var(--color-error)',
                    background: delta > 0
                      ? 'color-mix(in srgb, var(--color-success) 12%, transparent)'
                      : 'color-mix(in srgb, var(--color-error) 12%, transparent)',
                    padding: '0.125rem 0.375rem', borderRadius: '1rem',
                    whiteSpace: 'nowrap',
                  }}>
                    {delta > 0 ? '\u2191' : '\u2193'}{Math.abs(delta)}
                  </span>
                )}
              </div>
              {aeoScore && <ScoreRing score={aeoScore.overallScore} label={t('seo.aeoScore')} size="sm" />}
              <div style={{ flex: 1, maxWidth: '20rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{lastScan.url}</span>
                  <button
                    onClick={handleRecheck}
                    disabled={!!recheckingId}
                    title={t('seo.recheck', 'Re-check')}
                    style={{ background: 'none', border: 'none', cursor: recheckingId ? 'wait' : 'pointer', color: 'var(--text-tertiary)', padding: '0.125rem', display: 'inline-flex' }}
                  >
                    <RefreshCw size={11} className={recheckingId ? 'animate-spin' : ''} />
                  </button>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  {new Date(lastScan.timestamp).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{seoScore.checks.filter(c => c.status === 'pass').length}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}> {t('seo.passed')}</span>
                  </span>
                  <span style={{ fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{seoScore.checks.filter(c => c.status === 'partial').length}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}> {t('seo.partial')}</span>
                  </span>
                  <span style={{ fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>{seoScore.checks.filter(c => c.status === 'fail').length}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}> {t('seo.failed')}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{
            padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '0.625rem',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {t('seo.categoryBreakdown')}
            </h3>
            {Object.entries(seoScore.categories).map(([name, cat]) => (
              <CategoryBar key={name} name={name} score={cat.score} maxScore={cat.maxScore} />
            ))}
          </div>

          {/* AEO Cross-reference */}
          {aeoScore && (
            <div style={{
              padding: '1rem 1.25rem', background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
              border: '0.0625rem solid color-mix(in srgb, var(--accent) 15%, transparent)',
              borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <ExternalLink size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {t('seo.aeoReference')}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
                  {t('seo.aeoReferenceDesc')}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)', fontSize: '0.875rem' }}>
                {aeoScore.overallScore}/100
              </span>
            </div>
          )}

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={14} style={{ color: 'var(--text-tertiary)', marginRight: '0.25rem' }} />
            {FILTERS.map(f => (
              <FilterChip key={f.key} label={f.label} active={activeFilter === f.key} onClick={() => setActiveFilter(f.key)} />
            ))}
          </div>

          {/* Filtered checks view */}
          {filteredChecks && filteredChecks.length > 0 && (
            <div style={{
              padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {activeFilter === 'failing' ? t('seo.filter.failing', 'Failing Checks') : activeFilter} ({filteredChecks.length})
              </h3>
              {filteredChecks.map((check, i) => (
                <CheckRow key={i} check={check} onRecheck={handleRecheck} rechecking={!!recheckingId} />
              ))}
            </div>
          )}

          {filteredChecks && filteredChecks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              {activeFilter === 'failing' ? 'No failing checks!' : 'No checks in this category.'}
            </div>
          )}

          {/* Default view: Priority Issues + Quick Wins */}
          {!filteredChecks && (
            <>
              {priorityIssues.length > 0 && (
                <div style={{
                  padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} style={{ color: 'var(--color-error)' }} />
                    {t('seo.priorityIssues')} ({priorityIssues.length})
                  </h3>
                  {priorityIssues.map((check, i) => (
                    <CheckRow key={i} check={check} onRecheck={handleRecheck} rechecking={!!recheckingId} />
                  ))}
                </div>
              )}

              {quickWins.length > 0 && (
                <div style={{
                  padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={16} style={{ color: 'var(--color-warning)' }} />
                    {t('seo.quickWins')} ({quickWins.length})
                  </h3>
                  {quickWins.map((check, i) => (
                    <CheckRow key={i} check={check} onRecheck={handleRecheck} rechecking={!!recheckingId} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Competitor Comparison */}
          <CompetitorSection analyzer={analyzer} />

          {/* Score History Chart */}
          {chartData.length > 1 && (
            <div style={{
              padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                {t('seo.scoreHistory')}
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="seoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aeoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="seo" name="SEO" stroke="var(--accent)" fill="url(#seoGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="aeo" name="AEO" stroke="var(--color-success)" fill="url(#aeoGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="health" name="Health" stroke="var(--color-warning)" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
