import { useChartColors } from '../../utils/chartColors'

/**
 * LiveIndicator — Pulsing dot + "Live" badge for real-time data.
 *
 * Props:
 *   label: string (default: 'Live')
 *   size: 'sm' | 'md' | 'lg' (default: 'sm')
 *   color: string (optional — defaults to green)
 *   showLabel: boolean (default: true)
 */
export default function LiveIndicator({
  label = 'Live',
  size = 'sm',
  color,
  showLabel = true,
}) {
  const { scoreColors } = useChartColors()
  const dotColor = color || scoreColors.good

  const sizes = {
    sm: { dot: 6, text: 11, gap: 4, padding: '2px 8px' },
    md: { dot: 8, text: 12, gap: 6, padding: '3px 10px' },
    lg: { dot: 10, text: 13, gap: 6, padding: '4px 12px' },
  }

  const s = sizes[size] || sizes.sm

  return (
    <span
      className="inline-flex items-center rounded-full"
      style={{
        gap: s.gap,
        padding: showLabel ? s.padding : `${s.gap}px`,
        background: `${dotColor}14`,
        fontSize: s.text,
        fontWeight: 500,
        color: dotColor,
        lineHeight: 1,
      }}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          width: s.dot,
          height: s.dot,
          background: dotColor,
          animation: 'pulse 2s ease-in-out infinite',
          boxShadow: `0 0 0 0 ${dotColor}40`,
        }}
      />
      {showLabel && label}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${dotColor}40; }
          50% { opacity: 0.7; box-shadow: 0 0 0 ${s.dot}px ${dotColor}00; }
        }
      `}</style>
    </span>
  )
}
