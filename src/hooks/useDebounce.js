import { useState, useEffect } from 'react'

/**
 * Debounces a value by the given delay (ms).
 * Returns the debounced value — updates only after the caller
 * stops changing the input for `delay` milliseconds.
 */
export function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
