/**
 * Centralized logger — only outputs in development mode.
 * In production builds, Vite eliminates dead code behind import.meta.env.DEV,
 * making these calls zero-cost no-ops.
 */

function noop() {}

const logger = {
  error: import.meta.env.DEV
    ? (...args) => console.error('[AEO]', ...args)
    : noop,
  warn: import.meta.env.DEV
    ? (...args) => console.warn('[AEO]', ...args)
    : noop,
  info: import.meta.env.DEV
    ? (...args) => console.info('[AEO]', ...args)
    : noop,
}

export default logger
