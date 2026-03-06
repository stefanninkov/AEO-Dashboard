import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { AeoRadarChart, WaterfallChart } from '../../components/charts'
import { useChartColors } from '../../utils/chartColors'
import { CATEGORY_LABELS } from './CompetitorsOverviewTab'

/**
 * BenchmarkTab — Side-by-side competitor comparison with radar charts and gap analysis.
 */
export default function BenchmarkTab({ activeProject }) {
  const { t } = useTranslation('app')
  const { phaseColorArray, scoreColors, isLight } = useChartColors()
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)

  const competitors = activeProject?.competitors || []
  const analysis = activeProject?.competitorAnalysis
  const heatMap = analysis?.heatMap

  // Get your own data from competitors list
  const yourSite = useMemo(() => competitors.find((c) => c.isOwn), [competitors])

  // Determine categories from heatmap or fallback
  const categories = useMemo(() => {
    if (heatMap?.categories) return heatMap.categories
    return ['conversational', 'factual', 'industrySpecific', 'comparison', 'technical']
  }, [heatMap])

  // Build radar data: your scores vs each competitor
  const radarData = useMemo(() => {
    if (!heatMap?.scores || !yourSite) return []
    return categories.map((cat) => {
      const row = { dimension: CATEGORY_LABELS[cat] || cat }
      row.you = heatMap.scores[cat]?.[yourSite.name] || 0
      // Add each competitor
      competitors
        .filter((c) => !c.isOwn)
        .forEach((comp) => {
          row[comp.name] = heatMap.scores[cat]?.[comp.name] || 0
        })
      return row
    })
  }, [categories, heatMap, competitors, yourSite])

  // Data keys for radar chart
  const radarKeys = useMemo(() => {
    const keys = []
    if (yourSite) keys.push({ key: 'you', name: 'Your Site', color: phaseColorArray[2] })
    competitors
      .filter((c) => !c.isOwn)
      .forEach((comp, i) => {
        keys.push({
          key: comp.name,
          name: comp.name,
          color: phaseColorArray[(i + 3) % phaseColorArray.length],
        })
      })
    return keys
  }, [competitors, yourSite, phaseColorArray])

  // Gap analysis: where you win/lose vs selected competitor
  const gapData = useMemo(() => {
    const target = selectedCompetitor || competitors.find((c) => !c.isOwn)
    if (!target || !yourSite || !heatMap?.scores) return []
    return categories.map((cat) => {
      const yourScore = heatMap.scores[cat]?.[yourSite.name] || 0
      const theirScore = heatMap.scores[cat]?.[target.name] || 0
      return {
        name: CATEGORY_LABELS[cat] || cat,
        value: yourScore - theirScore,
        yourScore,
        theirScore,
      }
    })
  }, [selectedCompetitor, competitors, yourSite, heatMap, categories])

  // Overall benchmark scores
  const benchmarkScores = useMemo(() => {
    if (!yourSite) return []
    return competitors
      .filter((c) => !c.isOwn)
      .map((comp) => ({
        name: comp.name,
        score: comp.aeoScore || 0,
        yourScore: yourSite.aeoScore || 0,
        diff: (yourSite.aeoScore || 0) - (comp.aeoScore || 0),
      }))
      .sort((a, b) => b.score - a.score)
  }, [competitors, yourSite])

  if (!yourSite || competitors.length < 2) {
    return (
      <div className="card card-lg" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={32} style={{ color: 'var(--text-disabled)', margin: '0 auto 0.75rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          {t('competitors.needTwoForBenchmark', 'Add your site and at least one competitor, then run an analysis to see benchmarks.')}
        </p>
      </div>
    )
  }

  if (!heatMap) {
    return (
      <div className="card card-lg" style={{ textAlign: 'center', padding: '3rem' }}>
        <BarChart3 size={32} style={{ color: 'var(--text-disabled)', margin: '0 auto 0.75rem' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          {t('competitors.runAnalysisForBenchmark', 'Run a competitor analysis first to see benchmark comparisons.')}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Overall Benchmark Scores */}
      <div className="card card-lg">
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700,
          marginBottom: '1rem', color: 'var(--text-primary)',
        }}>
          {t('competitors.overallBenchmark', 'Overall AEO Benchmark')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {benchmarkScores.map((item) => (
            <div key={item.name} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--hover-bg)', borderRadius: '0.75rem',
            }}>
              <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {item.name}
              </span>
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem',
                color: item.score >= 70 ? scoreColors.good : item.score >= 40 ? scoreColors.warning : scoreColors.error,
              }}>
                {item.score}
              </span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.25rem 0.625rem', borderRadius: '1rem',
                background: item.diff > 0
                  ? `${scoreColors.good}15`
                  : item.diff < 0
                    ? `${scoreColors.error}15`
                    : `${isLight ? '#6b7280' : '#9ca3af'}15`,
                fontSize: '0.75rem', fontWeight: 600,
                color: item.diff > 0 ? scoreColors.good : item.diff < 0 ? scoreColors.error : 'var(--text-tertiary)',
              }}>
                {item.diff > 0 ? <TrendingUp size={12} /> : item.diff < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                {item.diff > 0 ? '+' : ''}{item.diff}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar Chart */}
      <div className="card card-lg">
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700,
          marginBottom: '1rem', color: 'var(--text-primary)',
        }}>
          {t('competitors.radarComparison', 'Category Comparison')}
        </h3>
        <AeoRadarChart
          data={radarData}
          dataKeys={radarKeys}
          dimensionKey="dimension"
          maxValue={100}
          height={380}
        />
      </div>

      {/* Gap Analysis */}
      <div className="card card-lg">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {t('competitors.gapAnalysis', 'Gap Analysis')}
          </h3>
          {competitors.filter((c) => !c.isOwn).length > 1 && (
            <select
              value={selectedCompetitor?.id || ''}
              onChange={(e) => {
                const comp = competitors.find((c) => c.id === e.target.value)
                setSelectedCompetitor(comp || null)
              }}
              className="input-field"
              style={{ width: 'auto', fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
            >
              {competitors
                .filter((c) => !c.isOwn)
                .map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    vs {comp.name}
                  </option>
                ))}
            </select>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
          {t('competitors.gapDescription', 'Positive values = you\'re ahead. Negative values = competitor leads.')}
        </p>
        <WaterfallChart
          data={gapData}
          height={280}
          showTotal={false}
        />
      </div>
    </div>
  )
}
