/**
 * ScorecardResults — Displays the AEO Readiness Score results after quiz.
 *
 * Renders: score ring (animated SVG), tier badge, category breakdown bars,
 * top priorities, CTA button, share row, and counter.
 */
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Share2, Copy, Check } from 'lucide-react'
import {
  CATEGORIES, MAX_TOTAL_SCORE, getScoreTier,
} from '../utils/scorecardScoring'

const BASE_PATH = import.meta.env.BASE_URL || '/AEO-Dashboard/'
const SITE_URL = `https://stefanninkov.github.io${BASE_PATH}`

/* ── Score Ring (adapted from ContentScorerView.jsx) ── */
function ScoreRing({ score, max, color, size = 8 }) {
  const r = (size * 16 - 8) / 2
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ) // start fully hidden

  useEffect(() => {
    // trigger animation on mount
    const timer = requestAnimationFrame(() => {
      setOffset(circ - (score / max) * circ)
    })
    return () => cancelAnimationFrame(timer)
  }, [score, max, circ])

  return (
    <div className="wl-sc-ring" style={{ width: `${size}rem`, height: `${size}rem` }}>
      <svg
        viewBox={`0 0 ${size * 16} ${size * 16}`}
        style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}
      >
        <circle
          cx={size * 8} cy={size * 8} r={r}
          fill="none" stroke="var(--border-subtle)" strokeWidth="4"
        />
        <circle
          cx={size * 8} cy={size * 8} r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="wl-sc-ring-text">
        <span className="wl-sc-ring-score" style={{ color }}>{score}</span>
        <span className="wl-sc-ring-max">/ {max}</span>
      </div>
    </div>
  )
}

/* ── Category Bar (animated width) ── */
function CategoryBar({ label, score, maxScore, color, delay }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), delay)
    return () => clearTimeout(timer)
  }, [pct, delay])

  return (
    <div className="wl-sc-bar-row">
      <span className="wl-sc-bar-label">{label}</span>
      <div className="wl-sc-bar-track">
        <div
          className="wl-sc-bar-fill"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
      <span className="wl-sc-bar-value">{score}/{maxScore}</span>
      <span className="wl-sc-bar-pct">{pct}%</span>
    </div>
  )
}

/* ── Priority Icon ── */
function priorityIcon(score, maxScore) {
  const ratio = maxScore > 0 ? score / maxScore : 0
  if (ratio > 0.66) return '✅'
  if (ratio >= 0.33) return '⚠️'
  return '❌'
}

/* ── Main Component ── */
export default function ScorecardResults({
  totalScore, categoryScores, tier, priorities, count, docId, onConvert, onClose, onUpdateWebsite,
}) {
  const { t } = useTranslation('waitlist')
  const [converted, setConverted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [websiteSaved, setWebsiteSaved] = useState(false)
  const tierData = getScoreTier(totalScore)

  const handleConvert = async () => {
    if (converted) return
    try {
      await onConvert?.(docId)
      setConverted(true)
    } catch {
      // silent
    }
  }

  const shareText = `I scored ${totalScore}/${MAX_TOTAL_SCORE} on the AEO Readiness Assessment! How AI-ready is YOUR website?`

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SITE_URL)}`,
      '_blank', 'width=550,height=420',
    )
  }

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
      '_blank', 'width=550,height=420',
    )
  }

  const copyLink = () => {
    navigator.clipboard.writeText(SITE_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="wl-sc-results">

      {/* Score Ring */}
      <div className="wl-sc-results-ring">
        <ScoreRing
          score={totalScore}
          max={MAX_TOTAL_SCORE}
          color={tierData.color}
        />
      </div>

      {/* Tier Badge */}
      <div className="wl-sc-results-tier">
        <span
          className="wl-sc-tier-badge"
          style={{ background: tierData.bgColor, color: tierData.color }}
        >
          {t(`scorecard.tiers.${tier}.label`)}
        </span>
      </div>

      {/* Tier Description */}
      <p className="wl-sc-tier-desc">
        {t(`scorecard.tiers.${tier}.desc`)}
      </p>

      {/* Optional Website URL */}
      {onUpdateWebsite && !websiteSaved && (
        <div className="wl-sc-website-prompt">
          <label className="wl-sc-website-label">{t('scorecard.results.websitePrompt', { defaultValue: 'Want a site-specific report? Add your URL:' })}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              className="wl-sc-input"
              placeholder={t('scorecard.results.websitePlaceholder', { defaultValue: 'https://yourwebsite.com' })}
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="wl-submit-btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              disabled={!websiteUrl.trim()}
              onClick={() => {
                onUpdateWebsite(websiteUrl.trim())
                setWebsiteSaved(true)
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
      {websiteSaved && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--wl-accent)', textAlign: 'center' }}>
          ✓ Website saved — we'll include it in your action plan.
        </p>
      )}

      {/* Category Breakdown */}
      <h3 className="wl-sc-section-heading">{t('scorecard.results.breakdown')}</h3>
      <div className="wl-sc-bars">
        {CATEGORIES.map((cat, i) => (
          <CategoryBar
            key={cat.id}
            label={t(`scorecard.categories.${cat.id}`)}
            score={categoryScores[cat.id] || 0}
            maxScore={cat.maxScore}
            color={cat.color}
            delay={200 + i * 100}
          />
        ))}
      </div>

      {/* Top Priorities */}
      {priorities.length > 0 && (
        <>
          <h3 className="wl-sc-section-heading">{t('scorecard.results.priorities')}</h3>
          <div className="wl-sc-priorities">
            {priorities.map((p) => {
              const catScore = categoryScores[p.categoryId] || 0
              const catMax = CATEGORIES.find(c => c.id === p.categoryId)?.maxScore || 1
              return (
                <div key={p.id} className="wl-sc-priority-card">
                  <span className="wl-sc-priority-icon">{priorityIcon(catScore, catMax)}</span>
                  <div className="wl-sc-priority-text">
                    <strong>{t(`scorecard.priorities.${p.id}.title`)}</strong>
                    <span>{t(`scorecard.priorities.${p.id}.desc`)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* CTA */}
      <div className="wl-sc-cta-section">
        <p className="wl-sc-cta-title">{t('scorecard.results.ctaTitle')}</p>
        <button
          className={`wl-submit-btn wl-sc-cta-btn ${converted ? 'wl-sc-cta-done' : ''}`}
          onClick={handleConvert}
          disabled={converted}
        >
          {converted ? t('scorecard.results.ctaDone') : t('scorecard.results.ctaButton')}
        </button>
      </div>

      {/* What Happens Next */}
      <div className="wl-sc-next-steps">
        <h3 className="wl-sc-section-heading">{t('scorecard.results.whatHappensNext.title')}</h3>
        <div className="wl-sc-steps-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="wl-sc-step-card">
              <span className="wl-sc-step-number">{i}</span>
              <span className="wl-sc-step-text">{t(`scorecard.results.whatHappensNext.step${i}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share Row */}
      <div className="wl-sc-share-row">
        <button className="wl-share-btn" onClick={shareTwitter}>
          <Share2 size={14} />
          {t('scorecard.results.shareX')}
        </button>
        <button className="wl-share-btn" onClick={shareLinkedIn}>
          <Share2 size={14} />
          {t('scorecard.results.shareLI')}
        </button>
        <button className="wl-share-btn" onClick={copyLink}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t('scorecard.results.copied') : t('scorecard.results.copyLink')}
        </button>
      </div>

      {/* Counter */}
      <p className="wl-sc-results-counter">
        {t('scorecard.results.counter', { count: count.toLocaleString() })}
      </p>
    </div>
  )
}
