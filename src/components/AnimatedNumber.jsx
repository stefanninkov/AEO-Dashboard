import { memo } from 'react'
import { useCountUp } from '../hooks/useCountUp'

/**
 * Renders a number that animates from 0 to `value`.
 *
 * @param {number} value - Target number
 * @param {string} [prefix] - Text before number (e.g. "$")
 * @param {string} [suffix] - Text after number (e.g. "%")
 * @param {number} [duration=1] - Animation duration in seconds
 * @param {number} [decimals=0] - Decimal places
 * @param {boolean} [enabled=true]
 */
export default memo(function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1, decimals = 0, enabled = true, ...rest }) {
  const display = useCountUp(value, { duration, decimals, enabled })

  return (
    <span {...rest}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  )
})
