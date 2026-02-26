/**
 * WaitlistScorecard — Full-screen overlay quiz: capture → 14 questions → results.
 *
 * 16 steps total:
 *   0  = Capture screen (name, email, optional website)
 *   1–14 = Quiz questions (interleaved scored + qualifying)
 *   15 = Results
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Loader2, ArrowLeft } from 'lucide-react'
import {
  QUIZ_FLOW, SCORED_QUESTIONS, QUALIFYING_QUESTIONS,
  computeScores, computeLeadScore, getScoreTier, getLeadTier,
  getTopPriorities, MAX_TOTAL_SCORE,
} from '../utils/scorecardScoring'
import { useWaitlist } from '../hooks/useWaitlist'
import ScorecardResults from './ScorecardResults'

const TOTAL_QUESTION_STEPS = QUIZ_FLOW.length   // 14
const TOTAL_STEPS = TOTAL_QUESTION_STEPS + 1     // 15 (capture excluded from progress)

export default function WaitlistScorecard({ onClose, onComplete }) {
  const { t } = useTranslation('waitlist')
  const {
    count, createLead, completeScorecard, trackAbandonment, markConverted,
  } = useWaitlist()

  // ── State ──
  const [step, setStep] = useState(0)       // 0=capture, 1-14=questions, 15=results
  const [answers, setAnswers] = useState({}) // { q1: 'yes_most', role: 'agency_owner', ... }
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', websiteUrl: '' })
  const [docId, setDocId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [animClass, setAnimClass] = useState('wl-sc-step-active')
  const containerRef = useRef(null)

  // ── Results (computed once at step 15) ──
  const [results, setResults] = useState(null)

  // Scroll to top on step change
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  // ── Step transition animation ──
  const goToStep = useCallback((nextStep) => {
    setAnimClass('wl-sc-step-enter')
    setTimeout(() => {
      setStep(nextStep)
      setAnimClass('wl-sc-step-active')
    }, 100)
  }, [])

  // ── Email validation ──
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  // ── Step 0: Submit capture form ──
  const handleCapture = async (e) => {
    e.preventDefault()
    if (!contactInfo.name.trim() || !isValidEmail(contactInfo.email.trim())) return
    setIsSubmitting(true)
    setError(null)

    try {
      const id = await createLead({
        name: contactInfo.name.trim(),
        email: contactInfo.email.trim().toLowerCase(),
        websiteUrl: contactInfo.websiteUrl.trim() || null,
      })
      setDocId(id)
      goToStep(1)
    } catch (err) {
      if (err.message === 'already_signed_up') {
        setError(t('scorecard.capture.duplicate'))
      } else {
        setError(t('scorecard.capture.duplicate'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Steps 1-14: Select answer ──
  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))

    // Auto-advance after 300ms
    setTimeout(() => {
      if (step < TOTAL_QUESTION_STEPS) {
        goToStep(step + 1)
      } else {
        // Last question answered → compute results
        computeAndShowResults({ ...answers, [questionId]: value })
      }
    }, 300)
  }

  // ── Back button ──
  const handleBack = () => {
    if (step > 1) {
      goToStep(step - 1)
    } else if (step === 1) {
      goToStep(0) // back to capture
    }
  }

  // ── Compute results and go to step 15 ──
  const computeAndShowResults = useCallback(async (finalAnswers) => {
    // Split scored vs qualifying answers
    const scoredAnswers = {}
    const qualifyingAnswers = {}

    QUIZ_FLOW.forEach((item) => {
      const val = finalAnswers[item.id]
      if (!val) return
      if (item.type === 'scored') scoredAnswers[item.id] = val
      else qualifyingAnswers[item.id] = val
    })

    const { totalScore, categoryScores } = computeScores(scoredAnswers)
    const tier = getScoreTier(totalScore)
    const leadScore = computeLeadScore(qualifyingAnswers)
    const leadTier = getLeadTier(leadScore)
    const priorities = getTopPriorities(categoryScores)

    const resultData = {
      totalScore,
      categoryScores,
      tier: tier.id,
      priorities,
      leadScore,
      leadTier,
      qualifyingAnswers,
      answers: scoredAnswers,
    }

    setResults(resultData)
    goToStep(TOTAL_QUESTION_STEPS + 1) // step 15

    // Save to Firestore
    try {
      await completeScorecard(docId, resultData)
    } catch {
      // silent — results are still shown
    }
  }, [docId, completeScorecard, goToStep])

  // ── Skip / Close with abandonment tracking ──
  const handleSkip = async () => {
    const confirmed = window.confirm(t('scorecard.skipConfirm'))
    if (!confirmed) return
    if (docId && step > 0 && step <= TOTAL_QUESTION_STEPS) {
      await trackAbandonment(docId, step - 1)
    }
    onClose?.()
  }

  const handleClose = async () => {
    if (step > 0 && step <= TOTAL_QUESTION_STEPS) {
      const confirmed = window.confirm(t('scorecard.closeConfirm'))
      if (!confirmed) return
      if (docId) await trackAbandonment(docId, step - 1)
    }
    onClose?.()
  }

  // ── Convert handler (from results CTA) ──
  const handleConvert = async (id) => {
    await markConverted(id)
  }

  // ── Render current question (steps 1-14) ──
  const renderQuestion = () => {
    const flowItem = QUIZ_FLOW[step - 1]
    if (!flowItem) return null

    const { type, id } = flowItem
    let questionText, options, categoryLabel

    if (type === 'scored') {
      const q = SCORED_QUESTIONS.find(sq => sq.id === id)
      if (!q) return null
      questionText = t(`scorecard.questions.${id}.text`)
      options = q.options.map((opt, i) => ({
        value: opt.value,
        label: t(`scorecard.questions.${id}.options.${i}`),
      }))
      categoryLabel = t(`scorecard.categories.${q.category}`)
    } else {
      const q = QUALIFYING_QUESTIONS.find(qq => qq.id === id)
      if (!q) return null
      questionText = t(`scorecard.qualifying.${id}.text`)
      options = q.options.map((opt, i) => ({
        value: opt.value,
        label: t(`scorecard.qualifying.${id}.options.${i}`),
      }))
      categoryLabel = null
    }

    const currentAnswer = answers[id]

    return (
      <div className={`wl-sc-question-wrapper ${animClass}`}>
        {/* Step + category labels */}
        <div className="wl-sc-step-meta">
          <span className="wl-sc-step-label">
            {t('scorecard.progress', { current: step, total: TOTAL_QUESTION_STEPS })}
          </span>
          {categoryLabel && (
            <span className="wl-sc-category">{categoryLabel}</span>
          )}
        </div>

        {/* Question text */}
        <h2 className="wl-sc-question">{questionText}</h2>

        {/* Options */}
        <div className="wl-sc-options">
          {options.map((opt) => (
            <button
              key={opt.value}
              className="wl-sc-option"
              data-active={currentAnswer === opt.value ? '' : undefined}
              onClick={() => handleAnswer(id, opt.value)}
            >
              <span className="wl-sc-option-radio" />
              <span className="wl-sc-option-label">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="wl-sc-nav">
          {step > 1 ? (
            <button className="wl-sc-back-btn" onClick={handleBack}>
              <ArrowLeft size={14} />
              {t('scorecard.back')}
            </button>
          ) : <span />}
          <button className="wl-sc-skip-link" onClick={handleSkip}>
            {t('scorecard.skip')}
          </button>
        </div>
      </div>
    )
  }

  // ── Progress bar width ──
  const progressPct = step === 0 ? 0
    : step > TOTAL_QUESTION_STEPS ? 100
    : (step / TOTAL_QUESTION_STEPS) * 100

  return (
    <div className="wl-sc-overlay" ref={containerRef}>
      <div className="wl-sc-container">

        {/* Close button */}
        <button className="wl-sc-close" onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Progress bar (hidden on capture, full on results) */}
        {step > 0 && (
          <div className="wl-sc-progress">
            <div
              className="wl-sc-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* ── Step 0: Capture ── */}
        {step === 0 && (
          <div className={`wl-sc-capture ${animClass}`}>
            <h1 className="wl-sc-capture-title">{t('scorecard.capture.title')}</h1>
            <p className="wl-sc-capture-subtitle">{t('scorecard.capture.subtitle')}</p>
            <p className="wl-sc-capture-time">{t('scorecard.capture.timeNote')}</p>

            <form className="wl-sc-capture-form" onSubmit={handleCapture}>
              <input
                type="text"
                className="wl-sc-input"
                placeholder={t('scorecard.capture.name')}
                value={contactInfo.name}
                onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                required
                autoFocus
              />
              <input
                type="email"
                className="wl-sc-input"
                placeholder={t('scorecard.capture.email')}
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                type="url"
                className="wl-sc-input"
                placeholder={t('scorecard.capture.website')}
                value={contactInfo.websiteUrl}
                onChange={(e) => setContactInfo(prev => ({ ...prev, websiteUrl: e.target.value }))}
              />

              {error && <p className="wl-sc-error">{error}</p>}

              <button
                type="submit"
                className="wl-submit-btn wl-sc-start-btn"
                disabled={isSubmitting || !contactInfo.name.trim() || !contactInfo.email.trim()}
              >
                {isSubmitting
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : t('scorecard.capture.start')}
              </button>

              <p className="wl-sc-consent">{t('scorecard.capture.consent')}</p>
            </form>
          </div>
        )}

        {/* ── Steps 1-14: Questions ── */}
        {step >= 1 && step <= TOTAL_QUESTION_STEPS && renderQuestion()}

        {/* ── Step 15: Results ── */}
        {step > TOTAL_QUESTION_STEPS && results && (
          <div className={`wl-sc-results-wrapper ${animClass}`}>
            <ScorecardResults
              totalScore={results.totalScore}
              categoryScores={results.categoryScores}
              tier={results.tier}
              priorities={results.priorities}
              count={count}
              docId={docId}
              onConvert={handleConvert}
              onClose={onClose}
            />
          </div>
        )}

      </div>
    </div>
  )
}
