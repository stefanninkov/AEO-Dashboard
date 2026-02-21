/**
 * Ga4View — GA4 AI Traffic Dashboard
 *
 * THE money view — shows traffic from AI engines:
 *  - AI traffic summary (total sessions, share of total, trend)
 *  - Traffic by AI platform (ChatGPT, Perplexity, Gemini, Claude, Copilot, etc.)
 *  - Top landing pages receiving AI traffic
 *  - Daily AI vs total traffic trend
 *  - Quality comparison: AI vs organic engagement metrics
 *
 * Requires: Google integration connected + GA4 property selected on the project.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkles, ChartColumnIncreasing, Users, Clock, ArrowUpDown, Globe,
  RefreshCw, Loader2, TrendingUp, ExternalLink,
  ArrowDown, ArrowUp, ChevronRight,
} from 'lucide-react'
import { useGoogleIntegration } from '../hooks/useGoogleIntegration'
import { getAiTrafficReport, getAiLandingPages, getAiTrafficTrend, getPropertyId, AI_REFERRAL_SOURCES } from '../utils/ga4Api'
import { cacheKey, getCache, setCache } from '../utils/dataCache'
import { NotConnectedState, NoPropertyState, TokenExpiredBanner, DataErrorBanner } from '../components/GoogleEmptyState'
import logger from '../utils/logger'

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, subValue, color, trend }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}
          </span>
          {trend && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.125rem',
              fontSize: '0.625rem', fontWeight: 600,
              color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : 'var(--text-tertiary)',
            }}>
              {trend > 0 ? <ArrowUp size={9} /> : trend < 0 ? <ArrowDown size={9} /> : null}
              {trend > 0 ? '+' : ''}{typeof trend === 'number' ? `${trend.toFixed(1)}%` : ''}
            </span>
          )}
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

/* ── AI Source Bar ── */
function AiSourceBar({ source, sessions, maxSessions, totalAiSessions }) {
  const pct = maxSessions > 0 ? (sessions / maxSessions) * 100 : 0
  const shareOfAi = totalAiSessions > 0 ? ((sessions / totalAiSessions) * 100).toFixed(1) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
      <div style={{
        width: '0.5rem', height: '0.5rem', borderRadius: '50%',
        background: source.color, flexShrink: 0,
      }} />
      <div style={{ width: '5.5rem', fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500, flexShrink: 0 }}>
        {source.label}
      </div>
      <div style={{ flex: 1, height: '1.25rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: '0.25rem',
          background: source.color, transition: 'width 0.3s', opacity: 0.7,
        }} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', width: '3.5rem', textAlign: 'right', fontWeight: 600, flexShrink: 0 }}>
        {sessions.toLocaleString()}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-tertiary)', width: '3rem', textAlign: 'right', flexShrink: 0 }}>
        {shareOfAi}%
      </div>
    </div>
  )
}

/* ── Trend Sparkline ── */
function TrendChart({ data, height = 64 }) {
  if (!data || data.length === 0) return null
  const maxAi = Math.max(...data.map(d => d.aiSessions), 1)
  const barWidth = Math.max(3, Math.min(8, 300 / data.length))

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.0625rem', height }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', height: '100%', justifyContent: 'flex-end' }}>
          <div
            style={{
              width: barWidth, borderRadius: '0.0625rem 0.0625rem 0 0',
              height: `${Math.max(1, (d.aiSessions / maxAi) * 100)}%`,
              background: 'var(--color-phase-1)',
              opacity: 0.6 + (i / data.length) * 0.4,
            }}
            title={`${d.dateFormatted}: ${d.aiSessions} AI sessions`}
          />
        </div>
      ))}
    </div>
  )
}

/* ── Empty states imported from GoogleEmptyState ── */

/* ══════════════════════════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════════════════════════ */

export default function Ga4View({ activeProject, user, setActiveView }) {
  const { t } = useTranslation('app')
  const google = useGoogleIntegration(user)
  const ga4Property = activeProject?.ga4Property || null
  const propertyId = ga4Property ? getPropertyId(ga4Property) : null

  const [datePreset, setDatePreset] = useState('28d')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Data state
  const [trafficData, setTrafficData] = useState(null)
  const [landingPages, setLandingPages] = useState(null)
  const [trendData, setTrendData] = useState(null)

  const dateRange = useMemo(() => {
    const map = { '7d': '7daysAgo', '28d': '28daysAgo', '3m': '90daysAgo', '6m': '180daysAgo', '12m': '365daysAgo' }
    return { startDate: map[datePreset] || '28daysAgo', endDate: 'today' }
  }, [datePreset])

  const fetchData = useCallback(async () => {
    if (!google.accessToken || !propertyId) return

    // Cache keys
    const tKey = cacheKey('ga4Traffic', propertyId, dateRange.startDate, dateRange.endDate)
    const pKey = cacheKey('ga4Pages', propertyId, dateRange.startDate, dateRange.endDate)
    const dKey = cacheKey('ga4Trend', propertyId, dateRange.startDate, dateRange.endDate)

    const tCache = getCache(tKey, 10 * 60 * 1000)
    const pCache = getCache(pKey, 10 * 60 * 1000)
    const dCache = getCache(dKey, 10 * 60 * 1000)

    // If all fresh, skip fetch
    if (!tCache.isMiss && !tCache.isStale && !pCache.isMiss && !pCache.isStale && !dCache.isMiss && !dCache.isStale) {
      setTrafficData(tCache.data)
      setLandingPages(pCache.data)
      setTrendData(dCache.data)
      setLoading(false)
      return
    }

    // Show stale data immediately
    if (!tCache.isMiss) setTrafficData(tCache.data)
    if (!pCache.isMiss) setLandingPages(pCache.data)
    if (!dCache.isMiss) setTrendData(dCache.data)

    setLoading(true)
    setError(null)

    try {
      const [traffic, pages, trend] = await Promise.all([
        (tCache.isMiss || tCache.isStale)
          ? getAiTrafficReport(google.accessToken, propertyId, dateRange)
          : Promise.resolve(tCache.data),
        (pCache.isMiss || pCache.isStale)
          ? getAiLandingPages(google.accessToken, propertyId, dateRange)
          : Promise.resolve(pCache.data),
        (dCache.isMiss || dCache.isStale)
          ? getAiTrafficTrend(google.accessToken, propertyId, dateRange)
          : Promise.resolve(dCache.data),
      ])

      // Update cache
      if (tCache.isMiss || tCache.isStale) setCache(tKey, traffic)
      if (pCache.isMiss || pCache.isStale) setCache(pKey, pages)
      if (dCache.isMiss || dCache.isStale) setCache(dKey, trend)

      setTrafficData(traffic)
      setLandingPages(pages)
      setTrendData(trend)
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        setError('Google token expired. Reconnect in Settings.')
      } else {
        setError(err.message || 'Failed to fetch GA4 data')
      }
      logger.error('GA4 data fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [google.accessToken, propertyId, dateRange])

  useEffect(() => {
    if (google.isConnected && propertyId) {
      fetchData()
    }
  }, [fetchData, google.isConnected, propertyId])

  // Compute AI source breakdown (must be before early returns to satisfy Rules of Hooks)
  const aiSourceBreakdown = useMemo(() => {
    if (!trafficData?.aiRows) return []

    const sourceMap = {}
    for (const row of trafficData.aiRows) {
      if (row.aiSource) {
        const id = row.aiSource.id
        if (!sourceMap[id]) {
          sourceMap[id] = { source: row.aiSource, sessions: 0, users: 0 }
        }
        sourceMap[id].sessions += row.sessions || 0
        sourceMap[id].users += row.totalUsers || 0
      }
    }

    return Object.values(sourceMap).sort((a, b) => b.sessions - a.sessions)
  }, [trafficData])

  const maxSourceSessions = aiSourceBreakdown.length > 0 ? aiSourceBreakdown[0].sessions : 1

  // ── Empty states ──
  if (!google.isConnected && !google.isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {t('ga4.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {t('ga4.subtitle')}
          </p>
        </div>
        {google.isExpired ? (
          <TokenExpiredBanner onReconnect={google.reconnect} reconnecting={google.connecting} setActiveView={setActiveView} />
        ) : (
          <NotConnectedState
            setActiveView={setActiveView}
            preset="ga4"
            title={t('ga4.connectTitle')}
            description={t('ga4.connectDesc')}
          />
        )}
      </div>
    )
  }

  if (google.isConnected && !ga4Property) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {t('ga4.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {t('ga4.subtitle')}
          </p>
        </div>
        <NoPropertyState
          setActiveView={setActiveView}
          preset="search"
          title={t('ga4.selectTitle')}
          description={t('ga4.selectDesc')}
        />
      </div>
    )
  }

  const DATE_PRESETS = [
    { value: '7d', label: '7d' },
    { value: '28d', label: '28d' },
    { value: '3m', label: '3m' },
    { value: '6m', label: '6m' },
    { value: '12m', label: '12m' },
  ]

  const fmt = (n) => typeof n === 'number' ? n.toLocaleString() : '—'
  const fmtPct = (n) => typeof n === 'number' ? `${(n * 100).toFixed(1)}%` : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {t('ga4.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
            {t('ga4.subtitleShort')}
          </p>
        </div>
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
          <button className="icon-btn" onClick={fetchData} title={t('common:actions.refresh')} disabled={loading}>
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
        <DataErrorBanner error={error} onRetry={fetchData} retrying={loading} />
      )}

      {/* Loading */}
      {loading && !trafficData && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 size={24} style={{ color: 'var(--color-phase-1)', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{t('ga4.loading')}</p>
        </div>
      )}

      {trafficData && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '0.75rem' }}>
            <StatCard
              icon={Sparkles}
              label={t('ga4.aiSessions')}
              value={fmt(trafficData.totalAiSessions)}
              subValue={t('ga4.ofTotalTraffic', { value: fmtPct(trafficData.aiSessionShare) })}
              color="#FF6B35"
            />
            <StatCard
              icon={Globe}
              label={t('ga4.totalSessions')}
              value={fmt(trafficData.totalSessions)}
              color="#3B82F6"
            />
            <StatCard
              icon={Users}
              label={t('ga4.aiSources')}
              value={aiSourceBreakdown.length}
              subValue={t('ga4.outOfTracked', { count: AI_REFERRAL_SOURCES.length })}
              color="#8B5CF6"
            />
            <StatCard
              icon={TrendingUp}
              label={t('ga4.topAiSource')}
              value={aiSourceBreakdown[0]?.source.label || '—'}
              subValue={aiSourceBreakdown[0] ? `${fmt(aiSourceBreakdown[0].sessions)} ${t('ga4.sessions').toLowerCase()}` : ''}
              color={aiSourceBreakdown[0]?.source.color || '#6B7280'}
            />
          </div>

          {/* Two columns: AI Sources + Trend */}
          <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* AI Source Breakdown */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)', marginBottom: '0.75rem',
              }}>
                {t('ga4.trafficByPlatform')}
              </div>
              {aiSourceBreakdown.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {aiSourceBreakdown.map(item => (
                    <AiSourceBar
                      key={item.source.id}
                      source={item.source}
                      sessions={item.sessions}
                      maxSessions={maxSourceSessions}
                      totalAiSessions={trafficData.totalAiSessions}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  {t('ga4.noAiTraffic')}
                  <br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
                    {t('ga4.noAiTrafficNormal')}
                  </span>
                </div>
              )}
            </div>

            {/* Daily Trend */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)', marginBottom: '0.75rem',
              }}>
                {t('ga4.dailyTrend')}
              </div>
              {trendData && trendData.length > 0 ? (
                <>
                  <TrendChart data={trendData} height={80} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                      {trendData[0]?.dateFormatted}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                      {trendData[trendData.length - 1]?.dateFormatted}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  {t('ga4.noTrendData')}
                </div>
              )}
            </div>
          </div>

          {/* Top Landing Pages */}
          {landingPages && landingPages.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)',
                padding: '1rem 1.25rem 0.5rem',
              }}>
                {t('ga4.topLandingPages')}
              </div>

              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 4.5rem 4rem 6rem',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                borderBottom: '0.0625rem solid var(--border-subtle)',
                background: 'var(--hover-bg)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)' }}>{t('gsc.page')}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)', textAlign: 'right' }}>{t('ga4.sessions')}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)', textAlign: 'right' }}>{t('ga4.users')}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06rem', color: 'var(--text-disabled)' }}>{t('ga4.sources')}</span>
              </div>

              {landingPages.slice(0, 20).map((page, i) => (
                <div
                  key={page.page + i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 4.5rem 4rem 6rem',
                    gap: '0.5rem',
                    padding: '0.5rem 1.25rem',
                    borderBottom: '0.0625rem solid var(--border-subtle)',
                    alignItems: 'center',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    fontSize: '0.8125rem', color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {page.page}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>
                    {fmt(page.sessions)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {fmt(page.users)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {Object.entries(page.sources).map(([srcId, count]) => {
                      const src = AI_REFERRAL_SOURCES.find(s => s.id === srcId)
                      if (!src) return null
                      return (
                        <span
                          key={srcId}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
                            fontSize: '0.5625rem', fontWeight: 600,
                            padding: '0.0625rem 0.3125rem', borderRadius: '0.25rem',
                            background: `${src.color}15`, color: src.color,
                          }}
                          title={`${src.label}: ${count} sessions`}
                        >
                          <div style={{ width: '0.3125rem', height: '0.3125rem', borderRadius: '50%', background: src.color }} />
                          {count}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No AI Traffic Message */}
          {trafficData.totalAiSessions === 0 && (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                {t('ga4.noAiTrafficYetTitle')}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '32rem', margin: '0 auto' }}>
                {t('ga4.noAiTrafficYetDesc')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
