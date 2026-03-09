import { memo } from 'react'
import { Sparkles, ChevronRight, X, CheckCircle2, Circle, ArrowRight } from 'lucide-react'

/**
 * OnboardingWizard — Full-screen first-run onboarding overlay.
 */
function OnboardingWizard({
  isOpen, currentStep, wizardSteps = [], completedSteps = [],
  wizardProgress, nextStep, skipWizard, onNavigate,
}) {
  if (!isOpen || !currentStep) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 200ms ease-out',
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)', width: '32rem', maxWidth: '90vw',
        overflow: 'hidden', animation: 'scaleIn 200ms ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-5) var(--space-5) var(--space-3)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--accent), var(--color-phase-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>
                Step {wizardSteps.indexOf(currentStep) + 1} of {wizardSteps.length}
              </div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {currentStep.title}
              </div>
            </div>
          </div>
          <button
            onClick={skipWizard}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: 'var(--space-1)' }}
            title="Skip onboarding"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '0 var(--space-5) var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--space-4)', lineHeight: 1.5 }}>
            {currentStep.description}
          </p>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {wizardSteps.map((step, i) => {
              const done = completedSteps.includes(step.id)
              const active = step.id === currentStep.id
              return (
                <div key={step.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                  fontSize: 'var(--text-2xs)', color: active ? 'var(--accent)' : done ? 'var(--color-success)' : 'var(--text-disabled)',
                  fontWeight: active ? 600 : 400,
                }}>
                  {done ? <CheckCircle2 size={12} /> : <Circle size={12} style={{ opacity: active ? 1 : 0.4 }} />}
                  <span style={{ display: i < 3 ? 'inline' : 'none' }}>{step.title.split(' ').slice(0, 3).join(' ')}</span>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div style={{
            height: '0.25rem', borderRadius: '9999px',
            background: 'var(--border-subtle)', overflow: 'hidden',
            marginBottom: 'var(--space-4)',
          }}>
            <div style={{
              height: '100%', borderRadius: '9999px',
              background: 'linear-gradient(90deg, var(--accent), var(--color-phase-2))',
              width: `${wizardProgress * 100}%`,
              transition: 'width 300ms ease-out',
            }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-3) var(--space-5)',
          borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            onClick={skipWizard}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
            }}
          >
            Skip all
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {currentStep.view && onNavigate && (
              <button
                onClick={() => { onNavigate(currentStep.view); nextStep() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)',
                }}
              >
                <ArrowRight size={12} /> Go there
              </button>
            )}
            <button
              onClick={nextStep}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--accent)', border: 'none',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontSize: 'var(--text-xs)', fontWeight: 600, color: '#fff',
              }}
            >
              {wizardSteps.indexOf(currentStep) === wizardSteps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  )
}

export default memo(OnboardingWizard)
