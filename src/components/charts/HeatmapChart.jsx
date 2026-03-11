import { useMemo, useCallback } from 'react'
import { useChartColors } from '../../utils/chartColors'

/**
 * HeatmapChart — Custom heatmap for content performance, keyword density, etc.
 *
 * Props:
 *   data: [{ row: 'Page A', col: 'Keyword 1', value: 85 }, ...]
 *   rows: string[] — row labels (auto-derived if not provided)
 *   cols: string[] — column labels (auto-derived if not provided)
 *   minValue: number (default: 0)
 *   maxValue: number (default: 100)
 *   colorScale: 'green' | 'blue' | 'red' | 'diverging' (default: 'green')
 *   height: number (auto-calculated if not provided)
 *   cellSize: number (default: 48)
 *   showValues: boolean (default: true)
 *   onCellClick: (row, col, value) => void
 */
export default function HeatmapChart({
  data = [],
  rows: rowsProp,
  cols: colsProp,
  minValue = 0,
  maxValue = 100,
  colorScale = 'green',
  cellSize = 48,
  showValues = true,
  onCellClick,
}) {
  const { isLight } = useChartColors()

  const rows = useMemo(
    () => rowsProp || [...new Set(data.map((d) => d.row))],
    [rowsProp, data]
  )
  const cols = useMemo(
    () => colsProp || [...new Set(data.map((d) => d.col))],
    [colsProp, data]
  )

  const valueMap = useMemo(() => {
    const map = {}
    data.forEach((d) => {
      map[`${d.row}::${d.col}`] = d.value
    })
    return map
  }, [data])

  const getColor = useCallback(
    (value) => {
      if (value == null) return isLight ? '#f3f4f6' : '#1f2937'
      const ratio = maxValue === minValue ? 0.5 : Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)))

      const scales = {
        green: {
          low: isLight ? [243, 244, 246] : [31, 41, 55],
          high: isLight ? [5, 150, 105] : [16, 185, 129],
        },
        blue: {
          low: isLight ? [243, 244, 246] : [31, 41, 55],
          high: isLight ? [2, 132, 199] : [14, 165, 233],
        },
        red: {
          low: isLight ? [243, 244, 246] : [31, 41, 55],
          high: isLight ? [220, 38, 38] : [239, 68, 68],
        },
        diverging: {
          low: isLight ? [220, 38, 38] : [239, 68, 68],
          mid: isLight ? [243, 244, 246] : [31, 41, 55],
          high: isLight ? [5, 150, 105] : [16, 185, 129],
        },
      }

      const scale = scales[colorScale] || scales.green

      if (colorScale === 'diverging') {
        const r = ratio < 0.5
          ? scale.low.map((c, i) => Math.round(c + (scale.mid[i] - c) * (ratio * 2)))
          : scale.mid.map((c, i) => Math.round(c + (scale.high[i] - c) * ((ratio - 0.5) * 2)))
        return `rgb(${r[0]}, ${r[1]}, ${r[2]})`
      }

      const r = scale.low.map((c, i) => Math.round(c + (scale.high[i] - c) * ratio))
      return `rgb(${r[0]}, ${r[1]}, ${r[2]})`
    },
    [minValue, maxValue, colorScale, isLight]
  )

  const getTextColor = useCallback(
    (value) => {
      if (value == null) return isLight ? '#9ca3af' : '#4b5563'
      const ratio = (value - minValue) / (maxValue - minValue)
      if (colorScale === 'diverging') {
        return ratio < 0.3 || ratio > 0.7 ? '#ffffff' : isLight ? '#374151' : '#d1d5db'
      }
      return ratio > 0.5 ? '#ffffff' : isLight ? '#374151' : '#d1d5db'
    },
    [minValue, maxValue, colorScale, isLight]
  )

  if (!data.length) return null

  const labelWidth = 120
  const headerHeight = 60
  const totalWidth = labelWidth + cols.length * cellSize
  const totalHeight = headerHeight + rows.length * cellSize

  return (
    <div className="overflow-auto" style={{ maxWidth: '100%' }}>
      <svg
        width={totalWidth}
        height={totalHeight}
        style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11 }}
      >
        {/* Column headers */}
        {cols.map((col, ci) => (
          <text
            key={`col-${ci}`}
            x={labelWidth + ci * cellSize + cellSize / 2}
            y={headerHeight - 8}
            textAnchor="end"
            fill={isLight ? '#374151' : '#9ca3af'}
            fontSize={10}
            transform={`rotate(-45, ${labelWidth + ci * cellSize + cellSize / 2}, ${headerHeight - 8})`}
          >
            {col.length > 12 ? col.slice(0, 12) + '...' : col}
          </text>
        ))}

        {/* Rows */}
        {rows.map((row, ri) => (
          <g key={`row-${ri}`}>
            {/* Row label */}
            <text
              x={labelWidth - 8}
              y={headerHeight + ri * cellSize + cellSize / 2 + 4}
              textAnchor="end"
              fill={isLight ? '#374151' : '#9ca3af'}
              fontSize={11}
            >
              {row.length > 16 ? row.slice(0, 16) + '...' : row}
            </text>

            {/* Cells */}
            {cols.map((col, ci) => {
              const value = valueMap[`${row}::${col}`]
              return (
                <g
                  key={`cell-${ri}-${ci}`}
                  onClick={() => onCellClick?.(row, col, value)}
                  style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                >
                  <rect
                    x={labelWidth + ci * cellSize + 1}
                    y={headerHeight + ri * cellSize + 1}
                    width={cellSize - 2}
                    height={cellSize - 2}
                    rx={4}
                    fill={getColor(value)}
                    opacity={0.9}
                  >
                    <title>{`${row} × ${col}: ${value ?? 'N/A'}`}</title>
                  </rect>
                  {showValues && value != null && (
                    <text
                      x={labelWidth + ci * cellSize + cellSize / 2}
                      y={headerHeight + ri * cellSize + cellSize / 2 + 4}
                      textAnchor="middle"
                      fill={getTextColor(value)}
                      fontSize={11}
                      fontWeight={500}
                    >
                      {value}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        ))}
      </svg>
    </div>
  )
}
