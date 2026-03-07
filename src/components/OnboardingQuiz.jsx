import { useState, useCallback, useMemo } from 'react'
import {
  ArrowRight, ArrowLeft, Rocket, X, Check,
  Briefcase, Users, Target, BookOpen, Share2,
} from 'lucide-react'
import {
  ROLE_IDS, TEAM_SIZE_IDS, USER_GOAL_IDS,
  FAMILIARITY_IDS, REFERRAL_IDS,
} from '../utils/fieldDefinitions'
import { useFocusTrap } from '../hooks/useFocusTrap'

const TOTAL_STEPS = 5

/* Step metadata — icons for each step */
const STEP_ICONS = [Briefcase, Users, Target, BookOpen, Share2]

export default function OnboardingQuiz({ onComplete, onSkip }) {
const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const trapRef = useFocusTrap(true)

  const [answers, setAnswers] = useState({
    role: null,
    teamSize: null,
    primaryGoal: null,
    aeoFamiliarity: null,
    referralSource: null,
  })

  const update = useCallback((key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }, [])

  /* Build translated option arrays */
  const ROLE_OPTIONS = useMemo(() => ROLE_IDS.map(id => ({
    value: id, label: '${id}',
  })), [])

  const TEAM_SIZE_OPTIONS = useMemo(() => TEAM_SIZE_IDS.map(id => ({
    value: id, label: '${id}',
  })), [])

  const GOAL_OPTIONS = useMemo(() => USER_GOAL_IDS.map(id => ({
    value: id, label: '${id}',
  })), [])

  const FAMILIARITY_OPTIONS = useMemo(() => FAMILIARITY_IDS.map(id => ({
    value: id, label: '${id}',
  })), [])

  const REFERRAL_OPTIONS = useMemo(() => REFERRAL_IDS.map(id => ({
    value: id, label: '${id}',
  })), [])

  const STEP_KEYS = ['role', 'teamSize', 'primaryGoal', 'aeoFamiliarity', 'referralSource']
  const STEP_OPTIONS = [ROLE_OPTIONS, TEAM_SIZE_OPTIONS, GOAL_OPTIONS, FAMILIARITY_OPTIONS, REFERRAL_OPTIONS]

  const canProceed = () => {
    return answers[STEP_KEYS[step]] !== null
  }

  const handleNext = () => {
    if (step === TOTAL_STEPS - 1) {
      onComplete(answers)
      return
    }
    setAnimating(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setAnimating(false)
    }, 150)
  }

  const handlePrev = () => {
    if (step === 0) return
    setAnimating(true)
    setTimeout(() => {
      setStep(s => s - 1)
      setAnimating(false)
    }, 150)
  }

  // Auto-advance when user selects an option (except last step)
  const handleSelect = useCallback((key, value) => {
    update(key, value)
    if (step < TOTAL_STEPS - 1) {
      setTimeout(() => {
        setAnimating(true)
        setTimeout(() => {
          setStep(s => s + 1)
          setAnimating(false)
        }, 150)
      }, 200)
    }
  }, [step, update])

  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100
  const StepIcon = STEP_ICONS[step]
  const currentKey = STEP_KEYS[step]
  const currentOptions = STEP_OPTIONS[step]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 410,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(0.75rem)',
          animation: 'backdrop-fade-in 200ms ease-out both',
        }}
      />

      {/* Card */}
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-title"
        style={{
          position: 'relative',
          width: '100%', maxWidth: 480,
          maxHeight: 'calc(100vh - 2.5rem)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'dialog-scale-in 250ms ease-out both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div style={{ height: 3, background: 'var(--border-subtle)', flexShrink: 0 }}>
          <div
            style={{
              height: '100%', borderRadius: 2,
              background: 'linear-gradient(90deg, var(--accent), var(--color-phase-3))',
              width: `${progressPercent}%`,
              transition: 'width 300ms ease',
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            padding: '2rem 2rem 1.5rem',
            opacity: animating ? 0 : 1,
            transition: 'opacity 120ms ease',
            minHeight: 320,
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* Header row: step indicator + skip button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.0313rem',
              padding: '0.125rem 0.5rem', borderRadius: 4,
              background: 'var(--accent-subtle)',
            }}>
              {`${step + 1} of ${TOTAL_STEPS}`}
            </span>
            <button
              onClick={onSkip}
              style={{
                padding: '0.25rem 0.75rem', borderRadius: 6,
                border: '0.0625rem solid var(--border-subtle)',
                background: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 500,
                fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              aria-label="Skip quiz"
            >
              {'Skip for now'}
              <X size={12} />
            </button>
          </div>

          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'var(--accent-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <StepIcon size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <h3
              id="quiz-title"
              style={{
                fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700,
                color: 'var(--text-primary)', margin: 0,
              }}
            >
              {'Title'}
            </h3>
          </div>

          {step === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20, marginLeft: 42 }}>
              {'Help us personalize your experience — takes 30 seconds'}
            </p>
          )}
          {step > 0 && <div style={{ height: 14 }} />}

          {/* Option Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: currentOptions.length <= 5 ? '1fr' : 'repeat(2, 1fr)',
            gap: 8,
          }}>
            {currentOptions.map(opt => {
              const isSelected = answers[currentKey] === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(currentKey, opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--hover-bg)',
                    border: isSelected ? '0.125rem solid var(--accent)' : '0.125rem solid transparent',
                    textAlign: 'left', fontFamily: 'var(--font-body)',
                    transition: 'all 150ms',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: isSelected ? '0.125rem solid var(--accent)' : '0.125rem solid var(--border-default)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 150ms',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                  }}>
                    {isSelected && <Check size={10} style={{ color: '#fff' }} />}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 500,
                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  }}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 2rem', borderTop: '0.0625rem solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                  background: i <= step ? 'var(--accent)' : 'var(--border-subtle)',
                  transition: 'all 250ms',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '0.5rem 0.875rem', fontSize: 12, fontWeight: 500,
                  borderRadius: 8, border: '0.0625rem solid var(--border-default)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <ArrowLeft size={13} />
                {'Back'}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary"
              style={{
                padding: '0.5rem 1.125rem', fontSize: 12,
                opacity: canProceed() ? 1 : 0.4,
              }}
            >
              {step === TOTAL_STEPS - 1 ? (
                <>
                  <Rocket size={13} />
                  {'Get Started'}
                </>
              ) : (
                <>
                  {'Continue'}
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
