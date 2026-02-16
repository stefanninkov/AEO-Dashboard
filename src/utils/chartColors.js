/**
 * Shared chart/phase colors — single source of truth.
 * Recharts and canvas-based charts can't use CSS custom properties,
 * so we keep hex values here and reference them from CSS via --color-phase-*.
 */

export const PHASE_COLORS = {
  1: '#FF6B35',
  2: '#7B2FBE',
  3: '#0EA5E9',
  4: '#10B981',
  5: '#F59E0B',
  6: '#EC4899',
  7: '#6366F1',
}

/** Array form for indexed access (Recharts pie charts, etc.) */
export const PHASE_COLOR_ARRAY = Object.values(PHASE_COLORS)

/** Score threshold colors */
export const SCORE_COLORS = {
  good: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}

/** Get score color based on threshold */
export function getScoreColor(score) {
  if (score >= 70) return SCORE_COLORS.good
  if (score >= 40) return SCORE_COLORS.warning
  return SCORE_COLORS.error
}

/** AI engine brand colors (for metrics charts) */
export const ENGINE_COLORS = {
  ChatGPT: '#10a37f',
  Perplexity: '#1fb6ff',
  Claude: '#d97757',
  Gemini: '#4285f4',
  SearchGPT: '#19c37d',
  'You.com': '#8b5cf6',
  'Bing Chat': '#008373',
  Copilot: '#0078d4',
  Mistral: '#f97316',
  Grok: '#000000',
}
