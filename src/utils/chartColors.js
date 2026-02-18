/**
 * Shared chart/phase colors — single source of truth.
 * Recharts and canvas-based charts can't use CSS custom properties,
 * so we keep hex values here and reference them from CSS via --color-phase-*.
 */

import { useTheme } from '../contexts/ThemeContext'

/* ── Dark-mode palette (original) ── */
export const PHASE_COLORS = {
  1: '#FF6B35',
  2: '#7B2FBE',
  3: '#0EA5E9',
  4: '#10B981',
  5: '#F59E0B',
  6: '#EC4899',
  7: '#6366F1',
}

/* ── Light-mode palette (slightly darker / more saturated for white bg contrast) ── */
export const PHASE_COLORS_LIGHT = {
  1: '#E55A1B',
  2: '#6B21A8',
  3: '#0284C7',
  4: '#059669',
  5: '#D97706',
  6: '#DB2777',
  7: '#4F46E5',
}

/** Array form for indexed access (Recharts pie charts, etc.) */
export const PHASE_COLOR_ARRAY = Object.values(PHASE_COLORS)

/** Score threshold colors */
export const SCORE_COLORS = {
  good: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}

/** Light-mode score colors — darker for better contrast on white */
export const SCORE_COLORS_LIGHT = {
  good: '#059669',
  warning: '#D97706',
  error: '#DC2626',
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

/** Light-mode engine colors — darkened for white bg contrast */
export const ENGINE_COLORS_LIGHT = {
  ChatGPT: '#0d8a6a',
  Perplexity: '#0891b2',
  Claude: '#c2613f',
  Gemini: '#2563eb',
  SearchGPT: '#15803d',
  'You.com': '#7c3aed',
  'Bing Chat': '#065f46',
  Copilot: '#0059a0',
  Mistral: '#ea580c',
  Grok: '#374151',
}

/**
 * useChartColors — theme-aware hook for chart colors.
 * Returns the correct palette for the active theme.
 *
 * Usage:
 *   const { phaseColors, scoreColors, engineColors, getScore } = useChartColors()
 */
export function useChartColors() {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme === 'light'

  const phaseColors = isLight ? PHASE_COLORS_LIGHT : PHASE_COLORS
  const scoreColors = isLight ? SCORE_COLORS_LIGHT : SCORE_COLORS
  const engineColors = isLight ? ENGINE_COLORS_LIGHT : ENGINE_COLORS
  const phaseColorArray = Object.values(phaseColors)

  const getScore = (score) => {
    if (score >= 70) return scoreColors.good
    if (score >= 40) return scoreColors.warning
    return scoreColors.error
  }

  return { phaseColors, phaseColorArray, scoreColors, engineColors, getScore, isLight }
}
