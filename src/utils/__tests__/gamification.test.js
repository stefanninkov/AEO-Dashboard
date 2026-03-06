import { describe, it, expect } from 'vitest'
import {
  getLevel, getNextLevel, getLevelProgress, getEarnedBadges,
  getNewBadges, calculateStreak, getDefaultStats, addPoints,
  POINTS, BADGES, LEVELS,
} from '../gamification'

describe('gamification', () => {
  describe('getLevel', () => {
    it('returns Beginner for 0 points', () => {
      expect(getLevel(0)).toEqual(expect.objectContaining({ level: 1, name: 'Beginner' }))
    })

    it('returns Learner for 50 points', () => {
      expect(getLevel(50)).toEqual(expect.objectContaining({ level: 2, name: 'Learner' }))
    })

    it('returns Grandmaster for 2000+ points', () => {
      expect(getLevel(2000)).toEqual(expect.objectContaining({ level: 8, name: 'Grandmaster' }))
    })

    it('returns correct level at boundary', () => {
      expect(getLevel(149)).toEqual(expect.objectContaining({ level: 2 }))
      expect(getLevel(150)).toEqual(expect.objectContaining({ level: 3 }))
    })
  })

  describe('getNextLevel', () => {
    it('returns next level for 0 points', () => {
      expect(getNextLevel(0)).toEqual(expect.objectContaining({ level: 2, minPoints: 50 }))
    })

    it('returns null at max level', () => {
      expect(getNextLevel(2000)).toBeNull()
    })
  })

  describe('getLevelProgress', () => {
    it('returns 0 at level start', () => {
      expect(getLevelProgress(0)).toBe(0)
    })

    it('returns 50 at midpoint', () => {
      expect(getLevelProgress(25)).toBe(50) // 25 of 50 range
    })

    it('returns 100 at max level', () => {
      expect(getLevelProgress(2000)).toBe(100)
    })
  })

  describe('getEarnedBadges', () => {
    it('returns empty for default stats', () => {
      expect(getEarnedBadges(getDefaultStats())).toEqual([])
    })

    it('returns first-analysis badge', () => {
      const stats = { ...getDefaultStats(), totalAnalyses: 1 }
      const earned = getEarnedBadges(stats)
      expect(earned).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'first-analysis' }),
      ]))
    })

    it('returns streak badges', () => {
      const stats = { ...getDefaultStats(), currentStreak: 7 }
      const earned = getEarnedBadges(stats)
      const ids = earned.map(b => b.id)
      expect(ids).toContain('streak-3')
      expect(ids).toContain('streak-7')
      expect(ids).not.toContain('streak-30')
    })
  })

  describe('getNewBadges', () => {
    it('returns newly earned badges', () => {
      const stats = { ...getDefaultStats(), totalAnalyses: 1 }
      const newBadges = getNewBadges(stats, [])
      expect(newBadges.length).toBeGreaterThan(0)
    })

    it('excludes previously earned badges', () => {
      const stats = { ...getDefaultStats(), totalAnalyses: 1 }
      const newBadges = getNewBadges(stats, ['first-analysis'])
      expect(newBadges.find(b => b.id === 'first-analysis')).toBeUndefined()
    })
  })

  describe('calculateStreak', () => {
    it('returns 0 for empty dates', () => {
      const result = calculateStreak([])
      expect(result.currentStreak).toBe(0)
    })

    it('calculates streak for consecutive days', () => {
      const today = new Date()
      const dates = [
        today.toISOString(),
        new Date(today - 86400000).toISOString(),
        new Date(today - 86400000 * 2).toISOString(),
      ]
      const result = calculateStreak(dates)
      expect(result.currentStreak).toBe(3)
    })

    it('breaks streak on gap', () => {
      const today = new Date()
      const dates = [
        today.toISOString(),
        new Date(today - 86400000 * 3).toISOString(), // 3 days ago (gap)
      ]
      const result = calculateStreak(dates)
      expect(result.currentStreak).toBe(1)
    })
  })

  describe('addPoints', () => {
    it('adds correct points for action', () => {
      const stats = getDefaultStats()
      const updated = addPoints(stats, 'analyzePage')
      expect(updated.totalPoints).toBe(POINTS.analyzePage)
    })

    it('accumulates points', () => {
      let stats = getDefaultStats()
      stats = addPoints(stats, 'analyzePage')
      stats = addPoints(stats, 'completeCheckItem')
      expect(stats.totalPoints).toBe(POINTS.analyzePage + POINTS.completeCheckItem)
    })

    it('returns same stats for unknown action', () => {
      const stats = getDefaultStats()
      const updated = addPoints(stats, 'unknownAction')
      expect(updated.totalPoints).toBe(0)
    })
  })

  describe('constants', () => {
    it('has 12 badges', () => {
      expect(BADGES.length).toBe(12)
    })

    it('has 8 levels', () => {
      expect(LEVELS.length).toBe(8)
    })

    it('levels are ordered by minPoints', () => {
      for (let i = 1; i < LEVELS.length; i++) {
        expect(LEVELS[i].minPoints).toBeGreaterThan(LEVELS[i - 1].minPoints)
      }
    })
  })
})
