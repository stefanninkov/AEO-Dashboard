import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useChartColors } from '../../utils/chartColors'

const RANGE_OPTIONS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: Infinity },
]

const SCORE_KEYS = [
  { key: 'overall', label: 'Overall', default: true },
  { key: 'technical', label: 'Technical' },
  { key: 'content', label: 'Content' },
  { key: 'schema', label: 'Schema' },
  { key: 'authority', label: 'Authority' },
  { key: 'citations', label: 'Citations' },
]

/**
 * ScoreHistoryChart — Area/line chart showing score trends over time.
 *
 * Props:
 *   data: array from useScoreHistory().trendData
 *   height: number (default: 300)
 *   showRangeSelector: boolean (default: true)
 *   showKeySelector: boolean (default: true)
 *   comparisonData: optional second dataset for overlay comparison
 *   comparisonLabel: string label for comparison dataset
 */
export default function ScoreHistoryChart({
  data = [],
  height = 300,
  showRangeSelector = true,
  showKeySelector = true,
  comparisonData,
  comparisonLabel = 'Previous Period',
}) {
  const { phaseColorArray, isLight } = useChartColors()
  const [range, setRange] = useState('30d')
  const [activeKeys, setActiveKeys] = useState(['overall'])

  const filteredData = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.label === range)
    if (!opt || opt.days === Infinity) return data
    const cutoff = Date.now() - opt.days * 24 * 60 * 60 * 1000
    return data.filter((d) => new Date(d.timestamp).getTime() >= cutoff)
  }, [data, range])

  // Detect which score keys actually exist in the data
  const availableKeys = useMemo(() => {
    if (!data.length) return SCORE_KEYS.filter((sk) => sk.default)
    const sampleKeys = new Set(Object.keys(data[0]).filter((k) => k !== 'date' && k !== 'timestamp'))
    return SCORE_KEYS.filter((sk) => sampleKeys.has(sk.key))
  }, [data])

  const toggleKey = (key) => {
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          height,
          background: isLight ? '#f9fafb' : '#111827',
          border: `1px dashed ${isLight ? '#d1d5db' : '#374151'}`,
          color: isLight ? '#6b7280' : '#9ca3af',
          fontSize: 13,
        }}
      >
        No score history yet. Run an analysis to start tracking.
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      {(showRangeSelector || showKeySelector) && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Range selector */}
          {showRangeSelector && (
            <div className="flex gap-1">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setRange(opt.label)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background:
                      range === opt.label
                        ? 'var(--accent)'
                        : isLight
                          ? '#f3f4f6'
                          : '#1f2937',
                    color:
                      range === opt.label
                        ? '#ffffff'
                        : isLight
                          ? '#374151'
                          : '#9ca3af',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Key selector */}
          {showKeySelector && (
            <div className="flex flex-wrap gap-1">
              {availableKeys.map((sk, i) => (
                <button
                  key={sk.key}
                  onClick={() => toggleKey(sk.key)}
                  className="px-2 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: activeKeys.includes(sk.key)
                      ? `${phaseColorArray[i % phaseColorArray.length]}20`
                      : 'transparent',
                    color: activeKeys.includes(sk.key)
                      ? phaseColorArray[i % phaseColorArray.length]
                      : isLight
                        ? '#9ca3af'
                        : '#6b7280',
                    border: `1px solid ${
                      activeKeys.includes(sk.key)
                        ? phaseColorArray[i % phaseColorArray.length]
                        : isLight
                          ? '#e5e7eb'
                          : '#374151'
                    }`,
                    cursor: 'pointer',
                  }}
                >
                  {sk.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <defs>
            {activeKeys.map((key, i) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={phaseColorArray[i % phaseColorArray.length]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={phaseColorArray[i % phaseColorArray.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isLight ? '#f3f4f6' : '#1f2937'}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: isLight ? '#6b7280' : '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: isLight ? '#6b7280' : '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: isLight ? '#ffffff' : '#1f2937',
              border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
              borderRadius: '8px',
              fontSize: '13px',
              color: isLight ? '#111827' : '#f9fafb',
            }}
          />
          {activeKeys.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
          {activeKeys.map((key, i) => {
            const sk = SCORE_KEYS.find((s) => s.key === key)
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={sk?.label || key}
                stroke={phaseColorArray[i % phaseColorArray.length]}
                fill={`url(#grad-${key})`}
                strokeWidth={2}
                dot={{ r: 3, fill: phaseColorArray[i % phaseColorArray.length] }}
                activeDot={{ r: 5 }}
                animationDuration={600}
              />
            )
          })}
          {/* Comparison overlay */}
          {comparisonData && activeKeys.map((key, i) => (
            <Area
              key={`cmp-${key}`}
              type="monotone"
              data={comparisonData}
              dataKey={key}
              name={`${comparisonLabel}`}
              stroke={phaseColorArray[i % phaseColorArray.length]}
              fill="none"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={600}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
