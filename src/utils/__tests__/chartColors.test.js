import { describe, it, expect } from 'vitest'
import {
  getScoreColor,
  PHASE_COLORS,
  PHASE_COLORS_LIGHT,
  PHASE_COLOR_ARRAY,
  SCORE_COLORS,
  ENGINE_COLORS,
} from '../chartColors'

describe('getScoreColor', () => {
  it('returns green for score >= 70', () => {
    expect(getScoreColor(70)).toBe(SCORE_COLORS.good)
    expect(getScoreColor(85)).toBe(SCORE_COLORS.good)
    expect(getScoreColor(100)).toBe(SCORE_COLORS.good)
  })

  it('returns yellow/warning for score >= 40 and < 70', () => {
    expect(getScoreColor(40)).toBe(SCORE_COLORS.warning)
    expect(getScoreColor(55)).toBe(SCORE_COLORS.warning)
    expect(getScoreColor(69)).toBe(SCORE_COLORS.warning)
  })

  it('returns red/error for score < 40', () => {
    expect(getScoreColor(39)).toBe(SCORE_COLORS.error)
    expect(getScoreColor(0)).toBe(SCORE_COLORS.error)
    expect(getScoreColor(10)).toBe(SCORE_COLORS.error)
  })
})

describe('PHASE_COLORS', () => {
  it('has entries for phases 1-7', () => {
    for (let i = 1; i <= 7; i++) {
      expect(PHASE_COLORS[i]).toBeDefined()
      expect(PHASE_COLORS[i]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('light palette has same phase keys', () => {
    for (let i = 1; i <= 7; i++) {
      expect(PHASE_COLORS_LIGHT[i]).toBeDefined()
      expect(PHASE_COLORS_LIGHT[i]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe('PHASE_COLOR_ARRAY', () => {
  it('has 7 entries matching PHASE_COLORS values', () => {
    expect(PHASE_COLOR_ARRAY).toHaveLength(7)
    expect(PHASE_COLOR_ARRAY).toEqual(Object.values(PHASE_COLORS))
  })
})

describe('ENGINE_COLORS', () => {
  const expectedEngines = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Copilot']

  it('has color entries for major AI engines', () => {
    for (const engine of expectedEngines) {
      expect(ENGINE_COLORS[engine]).toBeDefined()
      expect(ENGINE_COLORS[engine]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})
