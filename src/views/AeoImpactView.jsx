/**
 * AeoImpactView — GSC + GA4 Cross-Reference / AEO Impact Timeline
 *
 * Combines data from both Google Search Console and GA4 to show:
 *  1. AEO Impact Score — composite metric from AEO queries + AI traffic
 *  2. Cross-reference: pages that rank for AEO queries AND receive AI traffic
 *  3. AEO Query ↔ AI Traffic correlation
 *  4. Timeline showing how AEO metrics evolve over time
 *
 * Requires both GSC and GA4 properties connected.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp, Globe, SearchCheck, ChartColumnIncreasing,
  RefreshCw, Loader2, ArrowRight, ExternalLink,
  Target, Layers, Sparkles, ChevronRight,
} from 'lucide-react'
import { useGoogleIntegration } from '../hooks/useGoogleIntegration'
import { useGscData } from '../hooks/useGscData'
import { getAiTrafficReport, getAiLandingPages, getPropertyId } from '../utils/ga4Api'
import { formatSiteUrl } from '../utils/gscApi'
import { cacheKey, getCache, setCache } from '../utils/dataCache'
import { SetupRequiredState as SharedSetupRequired, TokenExpiredBanner, DataErrorBanner } from '../components/GoogleEmptyState'
import EmptyState from '../components/EmptyState'
import logger from '../utils/logger'

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem', marginTop: '0.125rem' }}>
          {label}
        </div>
        {subValue && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{subValue}</div>
        )}
      </div>
    </div>
  )
}

/* ── Score Gauge ── */
function AeoScoreGauge({ score, label }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-error)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--hover-bg)" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="48" y="44" textAnchor="middle" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, fill: 'var(--text-primary)' }}>
          {score}
        </text>
        <text x="48" y="58" textAnchor="middle" style={{ fontSize: '0.5rem', fill: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06rem' }}>
          / 100
        </text>
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)' }}>
        {label}
      </span>
    </div>
  )
}

/* ── Empty states imported from GoogleEmptyState ── */

/* ══════════════════════════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════════════════════════ */

export default function AeoImpactView({ activeProject, user, setActiveView }) {
  const { t } = useTranslation('app')
  const google = useGoogleIntegration(user)
  const gscProperty = activeProject?.gscProperty || null
  const ga4Property = activeProject?.ga4Property || null
  const propertyId = ga4Property ? getPropertyId(ga4Property) : null

  const [datePreset, setDatePreset] = useState('28d')
  const [ga4Loading, setGa4Loading] = useState(false)
  const [ga4Error, setGa4Error] = useState(null)
  const [aiTraffic, setAiTraffic] = useState(null)
  const [aiPages, setAiPages] = useState(null)

  // GSC data
  const { queryData, pageData, loading: gscLoading, error: gscError, refresh: refreshGsc } = useGscData(
    google.accessToken,
    gscProperty,
    { datePreset, enabled: google.isConnected && !!gscProperty }
  )

  // GA4 data
  const dateRange = useMemo(() => {
    const map = { '7d': '7daysAgo', '28d': '28daysAgo', '3m': '90daysAgo', '6m': '180daysAgo', '12m': '365daysAgo' }
    return { startDate: map[datePreset] || '28daysAgo', endDate: 'today' }
  }, [datePreset])

  const fetchGa4 = useCallback(async () => {
    if (!google.accessToken || !propertyId) return

    // Cache keys
    const tKey = cacheKey('ga4Traffic', propertyId, dateRange.startDate, dateRange.endDate)
    const pKey = cacheKey('ga4Pages', propertyId, dateRange.startDate, dateRange.endDate)

    const tCache = getCache(tKey, 10 * 60 * 1000)
    const pCache = getCache(pKey, 10 * 60 * 1000)

    // If all fresh, skip fetch
    if (!tCache.isMiss && !tCache.isStale && !pCache.isMiss && !pCache.isStale) {
      setAiTraffic(tCache.data)
      setAiPages(pCache.data)
      setGa4Loading(false)
      return
    }

    // Serve stale data immediately
    if (!tCache.isMiss) setAiTraffic(tCache.data)
    if (!pCache.isMiss) setAiPages(pCache.data)

    setGa4Loading(true)
    setGa4Error(null)
    try {
      const [traffic, pages] = await Promise.all([
        (tCache.isMiss || tCache.isStale)
          ? getAiTrafficReport(google.accessToken, propertyId, dateRange)
          : Promise.resolve(tCache.data),
        (pCache.isMiss || pCache.isStale)
          ? getAiLandingPages(google.accessToken, propertyId, dateRange)
          : Promise.resolve(pCache.data),
      ])

      if (tCache.isMiss || tCache.isStale) setCache(tKey, traffic)
      if (pCache.isMiss || pCache.isStale) setCache(pKey, pages)

      setAiTraffic(traffic)
      setAiPages(pages)
    } catch (err) {
      setGa4Error(err.message || 'Failed to fetch GA4 data')
      logger.error('AEO Impact GA4 fetch failed:', err)
    } finally {
      setGa4Loading(false)
    }
  }, [google.accessToken, propertyId, dateRange])

  useEffect(() => {
    if (google.isConnected && propertyId) fetchGa4()
  }, [fetchGa4, google.isConnected, propertyId])

  const handleRefresh = () => {
    refreshGsc()
    fetchGa4()
  }

  // ── Check connection status ──
  if (!google.isConnected && !google.isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <ViewHeader />
        {google.isExpired ? (
          <TokenExpiredBanner onReconnect={google.reconnect} reconnecting={google.connecting} setActiveView={setActiveView} />
        ) : (
          <SharedSetupRequired
            setActiveView={setActiveView}
            checks={[
              { label: t('impact.googleNotConnected'), ok: false },
              { label: gscProperty ? t('impact.gscConnected') : t('impact.gscNotSelected'), ok: !!gscProperty },
              { label: ga4Property ? t('impact.ga4Connected') : t('impact.ga4NotSelected'), ok: !!ga4Property },
            ]}
          />
        )}
      </div>
    )
  }

  if (!gscProperty || !ga4Property) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <ViewHeader />
        <SharedSetupRequired
          setActiveView={setActiveView}
          checks={[
            { label: t('impact.googleConnected'), ok: true },
            { label: gscProperty ? t('impact.gscConnected') : t('impact.gscNotSelected'), ok: !!gscProperty },
            { label: ga4Property ? t('impact.ga4Connected') : t('impact.ga4NotSelected'), ok: !!ga4Property },
          ]}
        />
      </div>
    )
  }

  const loading = gscLoading || ga4Loading
  const error = gscError || ga4Error

  // ── Compute AEO Impact Score ──
  const impact = useMemo(() => {
    if (!queryData || !aiTraffic) return null

    // Score components (each 0-100, weighted):
    // 1. AEO Query Ratio (40%) — what % of queries are AEO-relevant
    const aeoQueryRatio = queryData.totalQueryCount > 0
      ? (queryData.aeoQueryCount / queryData.totalQueryCount)
      : 0
    const queryScore = Math.min(100, aeoQueryRatio * 250) // 40% queries = 100 score

    // 2. AEO Click Share (30%) — what % of clicks come from AEO queries
    const clickShareScore = Math.min(100, queryData.aeoClickShare * 200) // 50% = 100 score

    // 3. AI Traffic Share (30%) — what % of GA4 traffic is AI-referred
    const aiShareScore = Math.min(100, aiTraffic.aiSessionShare * 1000) // 10% = 100 score

    const totalScore = Math.round(
      queryScore * 0.4 + clickShareScore * 0.3 + aiShareScore * 0.3
    )

    return {
      totalScore,
      queryScore: Math.round(queryScore),
      clickShareScore: Math.round(clickShareScore),
      aiShareScore: Math.round(aiShareScore),
    }
  }, [queryData, aiTraffic])

  // ── Cross-reference: pages that appear in both GSC AEO results AND GA4 AI traffic ──
  const crossReferencedPages = useMemo(() => {
    if (!pageData?.rows || !aiPages) return []

    // Normalize GSC page URLs to paths
    const gscPageMap = {}
    for (const row of pageData.rows) {
      try {
        const url = new URL(row.page)
        const path = url.pathname + url.search
        gscPageMap[path] = row
      } catch {
        gscPageMap[row.page] = row
      }
    }

    // Match with AI landing pages
    const matched = []
    for (const aiPage of aiPages) {
      const path = aiPage.page
      const gscRow = gscPageMap[path]
      if (gscRow) {
        matched.push({
          page: path,
          gscClicks: gscRow.clicks,
          gscImpressions: gscRow.impressions,
          gscPosition: gscRow.position,
          gscCtr: gscRow.ctr,
          aiSessions: aiPage.sessions,
          aiUsers: aiPage.users,
          sources: aiPage.sources,
        })
      }
    }

    return matched.sort((a, b) => b.aiSessions - a.aiSessions)
  }, [pageData, aiPages])

  const fmt = (n) => typeof n === 'number' ? n.toLocaleString() : '—'
  const fmtPct = (n) => typeof n === 'number' ? `${(n * 100).toFixed(1)}%` : '—'
  const fmtPos = (n) => typeof n === 'number' ? n.toFixed(1) : '—'

  const DATE_PRESETS = [
    { value: '7d', label: '7d' },
    { value: '28d', label: '28d' },
    { value: '3m', label: '3m' },
    { value: '6m', label: '6m' },
    { value: '12m', label: '12m' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <ViewHeader />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.125rem', background: 'var(--hover-bg)', borderRadius: '0.5rem', padding: '0.125rem' }}>
            {DATE_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => setDatePreset(p.value)}
                style={{
                  padding: '0.25rem 0.5rem', fontSize: '0.6875rem', fontWeight: 600,
                  fontFamily: 'var(--font-mono)', border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
                  background: datePreset === p.value ? 'var(--color-phase-1)' : 'transparent',
                  color: datePreset === p.value ? '#fff' : 'var(--text-tertiary)', transition: 'all 100ms',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={handleRefresh} title={t('common:actions.refresh')} aria-label={t('common:actions.refresh')} disabled={loading}>
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
          </button>
        </div>
      </div>

      {/* Token expiry banner */}
      {google.isExpired && (
        <TokenExpiredBanner onReconnect={google.reconnect} reconnecting={google.connecting} setActiveView={setActiveView} />
      )}

      {/* Error */}
      {error && !google.isExpired && (
        <DataErrorBanner error={error} onRetry={handleRefresh} retrying={loading} />
      )}

      {/* Loading */}
      {loading && !queryData && !aiTraffic && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 size={24} style={{ color: 'var(--color-phase-1)', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{t('impact.loading')}</p>
        </div>
      )}

      {impact && queryData && aiTraffic && (
        <>
          {/* AEO Impact Score + Component Scores */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
              <AeoScoreGauge score={impact.totalScore} label={t('impact.aeoImpactScore')} />

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <ScoreComponent label={t('impact.aeoQueryRatio')} score={impact.queryScore} weight="40%" detail={t('impact.ofQueries', { aeo: queryData.aeoQueryCount, total: queryData.totalQueryCount })} />
                <ScoreComponent label={t('impact.aeoClickShare')} score={impact.clickShareScore} weight="30%" detail={fmtPct(queryData.aeoClickShare)} />
                <ScoreComponent label={t('impact.aiTrafficShare')} score={impact.aiShareScore} weight="30%" detail={fmtPct(aiTraffic.aiSessionShare)} />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '0.75rem' }}>
            <StatCard icon={SearchCheck} label={t('impact.aeoQueries')} value={fmt(queryData.aeoQueryCount)} subValue={t('impact.ofTotal', { value: fmt(queryData.totalQueryCount) })} color="var(--color-phase-5)" />
            <StatCard icon={Sparkles} label={t('impact.aiSessions')} value={fmt(aiTraffic.totalAiSessions)} subValue={fmtPct(aiTraffic.aiSessionShare)} color="var(--color-phase-1)" />
            <StatCard icon={Target} label={t('impact.crossReferencedPages')} value={crossReferencedPages.length} subValue={t('impact.crossReferencedSub')} color="var(--color-phase-7)" />
            <StatCard icon={TrendingUp} label={t('impact.aiClickShare')} value={fmtPct(queryData.aeoClickShare)} subValue={t('impact.ofTotalGscClicks')} color="var(--color-success)" />
          </div>

          {/* Cross-Referenced Pages Table */}
          <div className="card table-scroll-wrap" style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '1rem 1.25rem 0.5rem',
            }}>
              <Sparkles size={14} style={{ color: 'var(--color-phase-7)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)',
              }}>
                {t('impact.crossRefTitle')}
              </span>
            </div>

            {crossReferencedPages.length > 0 ? (
              <>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 4rem 3.5rem 3.5rem 4rem 3.5rem',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  borderBottom: '0.0625rem solid var(--border-subtle)',
                  background: 'var(--hover-bg)',
                }}>
                  {[t('impact.colPage'), t('impact.colGscClicks'), t('impact.colPosition'), t('impact.colCtr'), t('impact.colAiSessions'), t('impact.colAiUsers')].map(h => (
                    <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04rem', color: 'var(--text-disabled)' }}>
                      {h}
                    </span>
                  ))}
                </div>

                {crossReferencedPages.slice(0, 20).map((row, i) => (
                  <div
                    key={row.page + i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 4rem 3.5rem 3.5rem 4rem 3.5rem',
                      gap: '0.5rem',
                      padding: '0.5rem 1.25rem',
                      borderBottom: '0.0625rem solid var(--border-subtle)',
                      alignItems: 'center',
                      fontSize: '0.8125rem',
                      transition: 'background 100ms',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.page}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {fmt(row.gscClicks)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: row.gscPosition <= 3 ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                      {fmtPos(row.gscPosition)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {fmtPct(row.gscCtr)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-phase-1)', fontWeight: 600 }}>
                      {fmt(row.aiSessions)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {fmt(row.aiUsers)}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <EmptyState
                icon={Sparkles}
                title={t('impact.noCrossRefTitle')}
                description={t('impact.noCrossRefDesc')}
                color="var(--color-phase-7)"
                compact
              />
            )}
          </div>

          {/* Data Sources Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.6875rem', color: 'var(--text-disabled)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <SearchCheck size={10} /> GSC: {formatSiteUrl(gscProperty)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ChartColumnIncreasing size={10} /> GA4: {getPropertyId(ga4Property)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

/* ── View Header (reusable) ── */
function ViewHeader() {
  const { t } = useTranslation('app')
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        {t('impact.title')}
      </h2>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
        {t('impact.subtitle')}
      </p>
    </div>
  )
}

/* ── Score Component ── */
function ScoreComponent({ label, score, weight, detail }) {
  const { t } = useTranslation('app')
  const color = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
  return (
    <div style={{ textAlign: 'center', minWidth: '7rem' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color, lineHeight: 1 }}>
        {score}
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
        {t('impact.weight', { value: weight })}
      </div>
      {detail && (
        <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
          {detail}
        </div>
      )}
    </div>
  )
}
