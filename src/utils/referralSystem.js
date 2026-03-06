/**
 * Referral System — Generate unique referral links, track referrals, manage rewards.
 *
 * Data stored in Firestore `waitlist` collection with referral fields.
 */

// ── Generate Referral Code ──

export function generateReferralCode(email) {
  // Create a short deterministic code from email
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32bit int
  }
  const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 6)
  return `AEO-${code}`
}

// ── Build Referral Link ──

export function buildReferralLink(code, baseUrl = '') {
  const base = baseUrl || (typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://stefanninkov.github.io/AEO-Dashboard/')
  return `${base}?ref=${code}`
}

// ── Parse Referral Code from URL ──

export function getReferralFromUrl() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('ref') || null
}

// ── Referral Reward Tiers ──

export const REFERRAL_TIERS = [
  { count: 1, reward: 'Priority access to beta', icon: '⭐' },
  { count: 3, reward: '1 month free on launch', icon: '🎁' },
  { count: 5, reward: '3 months free on launch', icon: '🏆' },
  { count: 10, reward: 'Lifetime early adopter discount', icon: '💎' },
]

export function getCurrentTier(referralCount) {
  let current = null
  for (const tier of REFERRAL_TIERS) {
    if (referralCount >= tier.count) current = tier
  }
  return current
}

export function getNextTier(referralCount) {
  for (const tier of REFERRAL_TIERS) {
    if (referralCount < tier.count) return tier
  }
  return null // Max tier reached
}

// ── Share Helpers ──

export function getShareText(code) {
  return `I just signed up for AEO Dashboard — an AI-powered SEO platform. Join the waitlist with my referral link and get priority access!`
}

export function shareOnTwitter(link, text) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`
  window.open(url, '_blank', 'width=550,height=420')
}

export function shareOnLinkedIn(link) {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`
  window.open(url, '_blank', 'width=550,height=420')
}

export function shareViaEmail(link, text) {
  const subject = encodeURIComponent('Check out AEO Dashboard')
  const body = encodeURIComponent(`${text}\n\n${link}`)
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  }
}
