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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', height: '100%' }}>
        {stages.map((stage, i) => {
          const widthPercent = 30 + stage.ratio * 70
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                cursor: onStageClick ? 'pointer' : 'default',
              }}
              onClick={() => onStageClick?.(stage, i)}
            >
              {/* Funnel bar */}
              <div style={{ flex: 1, position: 'relative', height: stageHeight - 4 }}>
                <div
                  style={{
                    position: 'absolute', top: 0, bottom: 0, left: '50%',
                    width: `${widthPercent}%`,
                    transform: 'translateX(-50%)',
                    borderRadius: '0.5rem',
                    background: stage.color,
                    opacity: 0.85,
                    transition: 'all 300ms',
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1,
                }}>
                  <span style={{
                    fontWeight: 600, fontSize: '0.8125rem',
                    color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}>
                    {stage.name}
                    <span style={{ marginLeft: '0.5rem', fontWeight: 400, opacity: 0.9 }}>
                      {typeof stage.value === 'number'
                        ? stage.value.toLocaleString()
                        : stage.value}
                    </span>
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                fontSize: '0.75rem', flexShrink: 0, width: 80,
              }}>
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
