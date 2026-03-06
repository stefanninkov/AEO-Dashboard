import { useMemo } from 'react'
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useChartColors } from '../../utils/chartColors'

/**
 * AeoRadarChart — Spider/radar chart for comparing dimensions across entities.
 *
 * Props:
 *   data: [{ dimension: 'Technical SEO', you: 85, competitor: 72 }, ...]
 *   dataKeys: [{ key: 'you', name: 'Your Site', color?: '#hex' }, { key: 'competitor', name: 'Competitor' }]
 *   dimensionKey: string — key for the dimension label (default: 'dimension')
 *   maxValue: number — max scale value (default: 100)
 *   height: number (default: 350)
 *   showLegend: boolean (default: true)
 *   onDimensionClick: (dimension) => void
 */
export default function AeoRadarChart({
  data = [],
  dataKeys = [],
  dimensionKey = 'dimension',
  maxValue = 100,
  height = 350,
  showLegend = true,
  onDimensionClick,
}) {
  const { phaseColorArray, isLight } = useChartColors()

  const keysWithColors = useMemo(
    () =>
      dataKeys.map((dk, i) => ({
        ...dk,
        color: dk.color || phaseColorArray[i % phaseColorArray.length],
      })),
    [dataKeys, phaseColorArray]
  )

  if (!data.length || !dataKeys.length) return null

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadar
        cx="50%"
        cy="50%"
        outerRadius="75%"
        data={data}
      >
        <PolarGrid
          stroke={isLight ? '#e5e7eb' : '#374151'}
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey={dimensionKey}
          tick={{
            fill: isLight ? '#374151' : '#9ca3af',
            fontSize: 12,
            cursor: onDimensionClick ? 'pointer' : 'default',
          }}
          onClick={onDimensionClick ? (e) => onDimensionClick(e.value) : undefined}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, maxValue]}
          tick={{ fill: isLight ? '#6b7280' : '#6b7280', fontSize: 10 }}
          tickCount={5}
        />
        {keysWithColors.map((dk) => (
          <Radar
            key={dk.key}
            name={dk.name}
            dataKey={dk.key}
            stroke={dk.color}
            fill={dk.color}
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 3, fill: dk.color }}
            animationDuration={600}
          />
        ))}
        <Tooltip
          contentStyle={{
            background: isLight ? '#ffffff' : '#1f2937',
            border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
            borderRadius: '8px',
            fontSize: '13px',
            color: isLight ? '#111827' : '#f9fafb',
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: '12px', color: isLight ? '#374151' : '#9ca3af' }}
          />
        )}
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
