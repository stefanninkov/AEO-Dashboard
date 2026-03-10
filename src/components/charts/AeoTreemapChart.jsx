import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useChartColors } from '../../utils/chartColors'

/**
 * AeoTreemapChart — Treemap for site structure, content distribution, etc.
 *
 * Props:
 *   data: [{ name: 'Blog', size: 45, children?: [...] }, ...]
 *   height: number (default: 350)
 *   colorKey: string — key to determine color category (optional)
 *   onItemClick: (item) => void
 */

function CustomContent({ x, y, width, height, name, value, fill, isLight }) {
  if (width < 30 || height < 25) return null

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        style={{
          fill: fill || (isLight ? '#6366f1' : '#818cf8'),
          stroke: isLight ? '#ffffff' : '#111827',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - (height > 50 ? 6 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={Math.min(13, Math.max(9, width / 8))}
        fontWeight={600}
      >
        {name?.length > width / 8 ? name.slice(0, Math.floor(width / 8)) + '...' : name}
      </text>
      {height > 50 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.75)"
          fontSize={Math.min(11, Math.max(8, width / 10))}
        >
          {value}
        </text>
      )}
    </g>
  )
}

export default function AeoTreemapChart({
  data = [],
  height = 350,
  onItemClick,
}) {
  const { phaseColorArray, isLight } = useChartColors()

  if (!data.length) return null

  // Assign colors to top-level items
  const coloredData = data.map((item, i) => ({
    ...item,
    fill: item.fill || phaseColorArray[i % phaseColorArray.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={coloredData}
        dataKey="value"
        nameKey="name"
        stroke="none"
        animationDuration={400}
        onClick={onItemClick ? (item) => onItemClick(item) : undefined}
        content={<CustomContent isLight={isLight} />}
      >
        <Tooltip
          contentStyle={{
            background: isLight ? '#ffffff' : '#1f2937',
            border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
            borderRadius: '8px',
            fontSize: '13px',
            color: isLight ? '#111827' : '#f9fafb',
          }}
          formatter={(value, name) => [value, name]}
        />
      </Treemap>
    </ResponsiveContainer>
  )
}
