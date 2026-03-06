import { describe, it, expect } from 'vitest'
import {
  generateReferralCode, buildReferralLink, getCurrentTier,
  getNextTier, getShareText, REFERRAL_TIERS,
} from '../referralSystem'

describe('referralSystem', () => {
  describe('generateReferralCode', () => {
    it('generates a code from email', () => {
      const code = generateReferralCode('test@example.com')
      expect(code).toMatch(/^AEO-[A-Z0-9]+$/)
    })

    it('generates deterministic codes', () => {
      const code1 = generateReferralCode('user@test.com')
      const code2 = generateReferralCode('user@test.com')
      expect(code1).toBe(code2)
    })

    it('generates different codes for different emails', () => {
      const code1 = generateReferralCode('alice@test.com')
      const code2 = generateReferralCode('bob@test.com')
      expect(code1).not.toBe(code2)
    })
  })

  describe('buildReferralLink', () => {
    it('builds link with code', () => {
      const link = buildReferralLink('AEO-ABC123', 'https://example.com/')
      expect(link).toBe('https://example.com/?ref=AEO-ABC123')
    })
  })

  describe('getCurrentTier', () => {
    it('returns null for 0 referrals', () => {
      expect(getCurrentTier(0)).toBeNull()
    })

    it('returns first tier for 1 referral', () => {
      expect(getCurrentTier(1)).toEqual(expect.objectContaining({ count: 1 }))
    })

    it('returns highest qualifying tier', () => {
      expect(getCurrentTier(10)).toEqual(expect.objectContaining({ count: 10 }))
    })
  })

  describe('getNextTier', () => {
    it('returns first tier for 0 referrals', () => {
      expect(getNextTier(0)).toEqual(expect.objectContaining({ count: 1 }))
    })

    it('returns null when max tier reached', () => {
      expect(getNextTier(10)).toBeNull()
    })
  })

  describe('getShareText', () => {
    it('returns non-empty string', () => {
      expect(getShareText('AEO-TEST')).toBeTruthy()
      expect(typeof getShareText('AEO-TEST')).toBe('string')
    })
  })

  describe('REFERRAL_TIERS', () => {
    it('has 4 tiers', () => {
      expect(REFERRAL_TIERS.length).toBe(4)
    })

    it('tiers are ordered by count', () => {
      for (let i = 1; i < REFERRAL_TIERS.length; i++) {
        expect(REFERRAL_TIERS[i].count).toBeGreaterThan(REFERRAL_TIERS[i - 1].count)
      }
    })
  })
})
