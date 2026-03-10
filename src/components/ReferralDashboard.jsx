import { useState, useMemo } from 'react'
import { Share2, Copy, Check, Gift, Star, Trophy, Gem, Users, ArrowRight } from 'lucide-react'
import { getCurrentTier, getNextTier, REFERRAL_TIERS, buildReferralLink, getShareText } from '../utils/referralSystem'

const TIER_ICONS = {
  1: Star,
  3: Gift,
  5: Trophy,
  10: Gem,
}

/**
 * ReferralDashboard — Shows referral stats, tier progress, and share tools.
 *
 * Props:
 *   referralCode: string
 *   referralCount: number (how many people referred)
 *   baseUrl: string
 */
export default function ReferralDashboard({ referralCode, referralCount = 0, baseUrl }) {
  const [copied, setCopied] = useState(false)

  const referralLink = useMemo(
    () => referralCode ? buildReferralLink(referralCode, baseUrl) : '',
    [referralCode, baseUrl]
  )

  const currentTier = getCurrentTier(referralCount)
  const nextTier = getNextTier(referralCount)
  const shareText = getShareText(referralCode)

  const progressToNext = nextTier
    ? Math.round((referralCount / nextTier.count) * 100)
    : 100

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`,
      '_blank', 'width=550,height=420'
    )
  }

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      '_blank', 'width=550,height=420'
    )
  }

  if (!referralCode) return null

  return (
    <div style={{
      background: 'var(--bg-card, #1a1a2e)',
      border: '0.0625rem solid var(--border-subtle, #2a2a4a)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      maxWidth: '32rem',
      margin: '1.5rem auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Users size={18} style={{ color: 'var(--accent, #6366f1)' }} />
        <h3 style={{
          fontFamily: 'var(--font-heading, system-ui)', fontSize: '1rem', fontWeight: 700,
          color: 'var(--text-primary, #fff)', margin: 0,
        }}>
          Your Referral Dashboard
        </h3>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          background: 'var(--hover-bg, rgba(255,255,255,0.05))',
          borderRadius: '0.5rem', padding: '0.875rem', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading, system-ui)', fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--accent, #6366f1)',
          }}>
            {referralCount}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary, #888)', marginTop: '0.125rem' }}>
            People Referred
          </div>
        </div>
        <div style={{
          background: 'var(--hover-bg, rgba(255,255,255,0.05))',
          borderRadius: '0.5rem', padding: '0.875rem', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading, system-ui)', fontSize: '1.5rem', fontWeight: 700,
            color: currentTier ? '#10B981' : 'var(--text-tertiary, #888)',
          }}>
            {currentTier ? currentTier.icon : '—'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary, #888)', marginTop: '0.125rem' }}>
            {currentTier ? currentTier.reward : 'No tier yet'}
          </div>
        </div>
      </div>

      {/* Tier Progress */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #aaa)' }}>
            {nextTier ? `Next: ${nextTier.reward}` : 'Max tier reached!'}
          </span>
          {nextTier && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary, #888)' }}>
              {referralCount}/{nextTier.count}
            </span>
          )}
        </div>
        <div style={{
          height: '0.5rem', background: 'var(--border-subtle, #2a2a4a)',
          borderRadius: '0.25rem', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${Math.min(progressToNext, 100)}%`,
            background: 'linear-gradient(90deg, var(--accent, #6366f1), #10B981)',
            borderRadius: '0.25rem', transition: 'width 500ms ease',
          }} />
        </div>
      </div>

      {/* All Tiers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1.25rem' }}>
        {REFERRAL_TIERS.map(tier => {
          const TierIcon = TIER_ICONS[tier.count] || Star
          const reached = referralCount >= tier.count
          return (
            <div
              key={tier.count}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.625rem', borderRadius: '0.375rem',
                background: reached ? 'color-mix(in srgb, #10B981 10%, transparent)' : 'transparent',
                border: reached ? '0.0625rem solid color-mix(in srgb, #10B981 20%, transparent)' : '0.0625rem solid transparent',
              }}
            >
              <TierIcon size={14} style={{ color: reached ? '#10B981' : 'var(--text-disabled, #555)', flexShrink: 0 }} />
              <span style={{
                fontSize: '0.75rem', fontWeight: 600, flex: 1,
                color: reached ? '#10B981' : 'var(--text-tertiary, #888)',
              }}>
                {tier.count} referral{tier.count > 1 ? 's' : ''}
              </span>
              <span style={{
                fontSize: '0.6875rem',
                color: reached ? 'var(--text-secondary, #aaa)' : 'var(--text-disabled, #555)',
              }}>
                {tier.reward}
              </span>
              {reached && <Check size={12} style={{ color: 'var(--color-success)', flexShrink: 0 }} />}
            </div>
          )
        })}
      </div>

      {/* Referral Link */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem', borderRadius: '0.5rem',
        background: 'var(--hover-bg, rgba(255,255,255,0.05))',
        border: '0.0625rem solid var(--border-subtle, #2a2a4a)',
        marginBottom: '0.75rem',
      }}>
        <input
          type="text"
          readOnly
          value={referralLink}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: '0.6875rem', color: 'var(--text-secondary, #aaa)',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        />
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.375rem 0.625rem', borderRadius: '0.375rem',
            background: copied ? '#10B981' : 'var(--accent, #6366f1)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: '0.6875rem', fontWeight: 600,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Share Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleShareTwitter}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.375rem', padding: '0.5rem',
            background: 'transparent', border: '0.0625rem solid var(--border-subtle, #2a2a4a)',
            borderRadius: '0.375rem', color: 'var(--text-secondary, #aaa)',
            cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 600,
          }}
        >
          <Share2 size={12} /> Share on X
        </button>
        <button
          onClick={handleShareLinkedIn}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.375rem', padding: '0.5rem',
            background: 'transparent', border: '0.0625rem solid var(--border-subtle, #2a2a4a)',
            borderRadius: '0.375rem', color: 'var(--text-secondary, #aaa)',
            cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 600,
          }}
        >
          <Share2 size={12} /> LinkedIn
        </button>
      </div>
    </div>
  )
}
