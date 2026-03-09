import { memo, useRef, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { DataConfidenceLabel } from '../../components/DataConfidenceLabel'
import { gsap } from '../../lib/gsap'

/**
 * Unified stat card — used across Dashboard, Metrics, GSC, GA4, AeoImpact.
 * Supports vertical (default) and horizontal layout.
 *
 * @param {string} label - Metric label
 * @param {string|number} value - Large display value
 * @param {number|null} [trend] - Percentage change (optional)
 * @param {ReactNode} [icon] - Icon element
 * @param {string} [iconColor] - CSS color for icon + tinted bg
 * @param {string} [subValue] - Secondary info below value (horizontal mode)
 * @param {'vertical'|'horizontal'} [layout='vertical'] - Card layout direction
 * @param {string} [className] - Extra class names
 * @param {'measured'|'estimated'|'mixed'} [confidence] - Data confidence indicator
 */
export default memo(function StatCard({ label, value, trend, icon, iconColor, subValue, layout = 'vertical', className = '', confidence }) {
const isHorizontal = layout === 'horizontal'
  const cardRef = useRef(null)

  const onEnter = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.to(cardRef.current, { scale: 1.02, duration: 0.2, ease: 'power2.out' })
  }, [])
  const onLeave = useCallback(() => {
    gsap.to(cardRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' })
  }, [])

  return (
    <div ref={cardRef} className={`stat-card ${className}`} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {isHorizontal ? (
        /* ── Horizontal: icon left, content right ── */
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {icon && (
            <div className="stat-card-icon" style={{ background: iconColor + '15', color: iconColor }}>
              {icon}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="stat-card-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {label}
              {confidence && <DataConfidenceLabel type={confidence} />}
            </div>
            <div className="stat-card-value" style={{ fontSize: 'var(--text-xl)' }}>{value}</div>
            {subValue && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>{subValue}</div>
            )}
          </div>
          {trend !== null && trend !== undefined && (
            <TrendBadge trend={trend} />
          )}
        </div>
      ) : (
        /* ── Vertical: label + icon header, big value, trend ── */
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-card-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {label}
              {confidence && <DataConfidenceLabel type={confidence} />}
            </span>
            {icon && (
              <div className="stat-card-icon" style={{ background: iconColor + '18', color: iconColor }}>
                {icon}
              </div>
            )}
          </div>
          <div className="stat-card-value">{value}</div>
          {trend !== null && trend !== undefined && (
            <TrendBadge trend={trend} />
          )}
        </>
      )}
    </div>
  )
})

function TrendBadge({ trend }) {
  return (
    <div className={`stat-card-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : ''}`}>
      {trend > 0 ? (
        <TrendingUp size={12} />
      ) : trend < 0 ? (
        <TrendingDown size={12} />
      ) : (
        <Minus size={12} style={{ color: 'var(--text-tertiary)' }} />
      )}
      <span style={{
        color: trend > 0 ? undefined : trend < 0 ? undefined : 'var(--text-tertiary)',
      }}>
        {trend > 0 ? '+' : ''}{trend}% {'vs last period'}
      </span>
    </div>
  )
}
