import { useMemo } from 'react'
import { useChartColors } from '../../utils/chartColors'

/**
 * AeoFunnelChart — Custom funnel chart for conversion flows.
 *
 * Props:
 *   data: [{ name: 'Visitors', value: 10000 }, { name: 'Signups', value: 3000 }, ...]
 *   height: number (default: 300)
 *   showPercentages: boolean (default: true)
 *   showDropoff: boolean (default: true)
 *   onStageClick: (stage, index) => void
 */
export default function AeoFunnelChart({
  data = [],
  height = 300,
  showPercentages = true,
  showDropoff = true,
  onStageClick,
}) {
  const { phaseColorArray, isLight } = useChartColors()

  const stages = useMemo(() => {
    if (!data.length) return []
    const maxValue = data[0].value || 1
    return data.map((d, i) => {
      const ratio = d.value / maxValue
      const prevValue = i > 0 ? data[i - 1].value : d.value
      const dropoff = prevValue > 0 ? ((prevValue - d.value) / prevValue * 100) : 0
      const conversionFromTop = (d.value / maxValue * 100)
      return {
        ...d,
        ratio,
        dropoff: Math.round(dropoff),
        conversionFromTop: Math.round(conversionFromTop * 10) / 10,
        color: d.color || phaseColorArray[i % phaseColorArray.length],
      }
    })
  }, [data, phaseColorArray])

  if (!stages.length) return null

  const stageHeight = Math.min(56, (height - 20) / stages.length)
  const svgHeight = stages.length * stageHeight + 20
  const maxWidth = 100 // percentage-based

  return (
    <div style={{ height: Math.max(height, svgHeight) }}>
      <div className="flex flex-col gap-1" style={{ height: '100%' }}>
        {stages.map((stage, i) => {
          const widthPercent = 30 + stage.ratio * 70 // Min 30% width
          return (
            <div
              key={i}
              className="flex items-center gap-3 group"
              style={{ cursor: onStageClick ? 'pointer' : 'default' }}
              onClick={() => onStageClick?.(stage, i)}
            >
              {/* Funnel bar */}
              <div className="flex-1 relative" style={{ height: stageHeight - 4 }}>
                <div
                  className="absolute inset-y-0 left-1/2 rounded-lg transition-all duration-300 group-hover:opacity-100"
                  style={{
                    width: `${widthPercent}%`,
                    transform: 'translateX(-50%)',
                    background: stage.color,
                    opacity: 0.85,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {stage.name}
                    <span className="ml-2 font-normal opacity-90">
                      {typeof stage.value === 'number'
                        ? stage.value.toLocaleString()
                        : stage.value}
                    </span>
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div
                className="flex flex-col items-end text-xs shrink-0"
                style={{ width: 80 }}
              >
                {showPercentages && (
                  <span style={{ color: isLight ? '#374151' : '#d1d5db', fontWeight: 600 }}>
                    {stage.conversionFromTop}%
                  </span>
                )}
                {showDropoff && i > 0 && (
                  <span style={{ color: isLight ? '#dc2626' : '#ef4444', fontSize: 10 }}>
                    -{stage.dropoff}% drop
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
