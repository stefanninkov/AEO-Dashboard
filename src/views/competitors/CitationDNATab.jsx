/**
 * CitationDNATab — Reverse-engineer why content gets cited by AI engines.
 *
 * Radar chart "DNA fingerprint", winning pattern cards, replication suggestions.
 */
import { useTranslation } from 'react-i18next'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import {
  Dna, Loader2, AlertTriangle, Sparkles, ArrowUpRight,
  Shield, TrendingUp, Zap,
} from 'lucide-react'
import { useCitationDNA } from '../../hooks/useCitationDNA'

const STRENGTH_COLORS = {
  high: 'var(--color-phase-4)',
  medium: 'var(--color-phase-5)',
  low: 'var(--text-tertiary)',
}

const IMPACT_ICONS = {
  high: TrendingUp,
  medium: Zap,
  low: ArrowUpRight,
}

export default function CitationDNATab({ activeProject }) {
  const { t } = useTranslation('app')
  const {
    analyzing, dnaProfile, patterns, suggestions,
    error, hasData, excerptCount, runAnalysis,
  } = useCitationDNA(activeProject)

  const radarData = dnaProfile ? [
    { dimension: t('competitors.citationDNA.factualDensity'), value: dnaProfile.factualDensity, fullMark: 100 },
    { dimension: t('competitors.citationDNA.structureClarity'), value: dnaProfile.structureClarity, fullMark: 100 },
    { dimension: t('competitors.citationDNA.authoritySignals'), value: dnaProfile.authoritySignals, fullMark: 100 },
    { dimension: t('competitors.citationDNA.freshness'), value: dnaProfile.freshness, fullMark: 100 },
    { dimension: t('competitors.citationDNA.schemaPresence'), value: dnaProfile.schemaPresence, fullMark: 100 },
    { dimension: t('competitors.citationDNA.conversationalFit'), value: dnaProfile.conversationalFit, fullMark: 100 },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* ── Run Analysis Card ── */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 'var(--space-3)',
        }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)',
            }}>
              <Dna size={15} style={{ color: 'var(--color-phase-6)' }} />
              {t('competitors.citationDNA.title')}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {t('competitors.citationDNA.subtitle')}
            </p>
            {hasData && (
              <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)', marginTop: 'var(--space-1)' }}>
                {t('competitors.citationDNA.excerptCount', { count: excerptCount })}
              </p>
            )}
          </div>
          <button
            className="btn-primary btn-sm"
            onClick={runAnalysis}
            disabled={analyzing || !hasData}
            style={!hasData ? { opacity: 0.5 } : undefined}
          >
            {analyzing
              ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> {t('competitors.citationDNA.analyzing')}</>
              : <><Sparkles size={13} /> {t('competitors.citationDNA.runAnalysis')}</>
            }
          </button>
        </div>

        {!hasData && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)', marginTop: 'var(--space-3)',
            background: 'rgba(255, 107, 53, 0.08)', borderRadius: 'var(--radius-md)',
            border: '0.0625rem solid rgba(255, 107, 53, 0.2)',
            fontSize: 'var(--text-xs)', color: 'var(--color-phase-1)',
          }}>
            <AlertTriangle size={13} />
            {t('competitors.citationDNA.noData')}
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)', marginTop: 'var(--space-3)',
            background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)',
            border: '0.0625rem solid rgba(239, 68, 68, 0.2)',
            fontSize: 'var(--text-xs)', color: 'var(--color-error)',
          }}>
            <AlertTriangle size={13} />
            {error}
          </div>
        )}
      </div>

      {/* ── DNA Fingerprint Radar ── */}
      {dnaProfile && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{
            fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          }}>
            <Shield size={13} style={{ color: 'var(--color-phase-6)' }} />
            {t('competitors.citationDNA.fingerprint')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ height: '14rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: '0.5625rem', fill: 'var(--text-tertiary)' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="value"
                    stroke="var(--color-phase-6)"
                    fill="var(--color-phase-6)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Dimension scores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {radarData.map(d => (
                <div key={d.dimension} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{
                    fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)',
                    flex: 1, minWidth: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {d.dimension}
                  </span>
                  <div style={{
                    width: '3rem', height: '0.25rem', borderRadius: 'var(--radius-full)',
                    background: 'var(--hover-bg)', overflow: 'hidden', flexShrink: 0,
                  }}>
                    <div style={{
                      width: `${d.value}%`, height: '100%',
                      background: d.value >= 70 ? 'var(--color-phase-4)' : d.value >= 40 ? 'var(--color-phase-5)' : 'var(--color-phase-7)',
                      borderRadius: 'var(--radius-full)',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 'var(--text-2xs)', fontFamily: 'var(--font-mono)',
                    color: d.value >= 70 ? 'var(--color-phase-4)' : d.value >= 40 ? 'var(--color-phase-5)' : 'var(--color-phase-7)',
                    minWidth: '1.5rem', textAlign: 'right', fontWeight: 600,
                  }}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Winning Patterns ── */}
      {patterns.length > 0 && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{
            fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          }}>
            <Sparkles size={13} style={{ color: 'var(--color-phase-4)' }} />
            {t('competitors.citationDNA.winningPatterns')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {patterns.map((p, i) => (
              <div key={i} style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '0.0625rem solid var(--border-subtle)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  marginBottom: 'var(--space-1)',
                }}>
                  <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)',
                  }}>
                    {p.title}
                  </span>
                  <span style={{
                    fontSize: 'var(--text-2xs)', fontWeight: 600,
                    padding: '0 var(--space-2)', borderRadius: 'var(--radius-full)',
                    color: STRENGTH_COLORS[p.strength] || 'var(--text-tertiary)',
                    background: p.strength === 'high' ? 'rgba(16, 185, 129, 0.1)' :
                      p.strength === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'var(--hover-bg)',
                  }}>
                    {p.strength}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', lineHeight: 1.5, margin: 0 }}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Suggestions ── */}
      {suggestions.length > 0 && (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{
            fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          }}>
            <TrendingUp size={13} style={{ color: 'var(--color-phase-1)' }} />
            {t('competitors.citationDNA.suggestions')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {suggestions.map((s, i) => {
              const Icon = IMPACT_ICONS[s.impact] || ArrowUpRight
              return (
                <div key={i} style={{
                  display: 'flex', gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '0.0625rem solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: '1.5rem', height: '1.5rem', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: s.impact === 'high' ? 'rgba(255, 107, 53, 0.1)' :
                      s.impact === 'medium' ? 'rgba(14, 165, 233, 0.1)' : 'var(--hover-bg)',
                  }}>
                    <Icon size={11} style={{
                      color: s.impact === 'high' ? 'var(--color-phase-1)' :
                        s.impact === 'medium' ? 'var(--color-phase-3)' : 'var(--text-tertiary)',
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                      {s.title}
                    </div>
                    <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', lineHeight: 1.5, margin: 0 }}>
                      {s.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
