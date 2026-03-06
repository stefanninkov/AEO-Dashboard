import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useChartColors } from '../../utils/chartColors'

/**
 * WaterfallChart — Shows how individual factors contribute to a total score.
 *
 * Props:
 *   data: [{ name: 'Schema Markup', value: 15 }, { name: 'Page Speed', value: -8 }, ...]
 *   totalLabel: string (default: 'Total')
 *   height: number (default: 300)
 *   showTotal: boolean (default: true)
 */
export default function WaterfallChart({
  data = [],
  totalLabel = 'Total',
  height = 300,
  showTotal = true,
}) {
  const { scoreColors, isLight } = useChartColors()

  const chartData = useMemo(() => {
    let runningTotal = 0
    const items = data.map((d) => {
      const start = runningTotal
      runningTotal += d.value
      return {
        name: d.name,
        value: d.value,
        start: Math.min(start, runningTotal),
        end: Math.max(start, runningTotal),
        isPositive: d.value >= 0,
      }
    })

    if (showTotal) {
      items.push({
        name: totalLabel,
        value: runningTotal,
        start: 0,
        end: runningTotal,
        isTotal: true,
      })
    }

    return items
  }, [data, showTotal, totalLabel])

  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
      >
        <XAxis
          dataKey="name"
          tick={{ fill: isLight ? '#374151' : '#9ca3af', fontSize: 11 }}
          axisLine={{ stroke: isLight ? '#e5e7eb' : '#374151' }}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
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
          formatter={(value, name, props) => {
            const item = props.payload
            if (item.isTotal) return [item.value, 'Total']
            const sign = item.value >= 0 ? '+' : ''
            return [`${sign}${item.value}`, item.name]
          }}
        />
        <ReferenceLine y={0} stroke={isLight ? '#d1d5db' : '#4b5563'} />

        {/* Invisible bar for the base offset */}
        <Bar dataKey="start" stackId="waterfall" fill="transparent" />

        {/* Visible bar for the actual value */}
        <Bar
          dataKey={(entry) => entry.end - entry.start}
          stackId="waterfall"
          radius={[4, 4, 0, 0]}
          animationDuration={600}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.isTotal
                  ? (isLight ? '#2563eb' : '#3b82f6')
                  : entry.isPositive
                    ? scoreColors.good
                    : scoreColors.error
              }
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
