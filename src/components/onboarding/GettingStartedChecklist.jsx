import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, X,
  FolderPlus, SearchCheck, ListChecks, Globe, Users, Activity,
  Sparkles, PartyPopper,
} from 'lucide-react'

const CHECKLIST_STEPS = [
  {
    id: 'create-project',
    i18nKey: 'gettingStarted.createProject',
    fallbackLabel: 'Create a project',
    icon: FolderPlus,
    action: 'new-project',
  },
  {
    id: 'run-analysis',
    i18nKey: 'gettingStarted.runAnalysis',
    fallbackLabel: 'Run your first analysis',
    icon: SearchCheck,
    action: 'analyzer',
  },
  {
    id: 'check-checklist',
    i18nKey: 'gettingStarted.checkChecklist',
    fallbackLabel: 'Review the AEO checklist',
    icon: ListChecks,
    action: 'checklist',
  },
  {
    id: 'connect-gsc',
    i18nKey: 'gettingStarted.connectGsc',
    fallbackLabel: 'Connect Google Search Console',
    icon: Globe,
    action: 'gsc',
  },
  {
    id: 'invite-team',
    i18nKey: 'gettingStarted.inviteTeam',
    fallbackLabel: 'Invite a team member',
    icon: Users,
    action: 'settings',
  },
  {
    id: 'setup-monitoring',
    i18nKey: 'gettingStarted.setupMonitoring',
    fallbackLabel: 'Set up monitoring',
    icon: Activity,
    action: 'monitoring',
  },
]

const STORAGE_KEY = 'aeo-getting-started'
const DISMISSED_KEY = 'aeo-getting-started-dismissed'

function loadCheckedSteps() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveCheckedSteps(steps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(steps))
  } catch { /* non-critical */ }
}

/** Auto-detect which steps are done based on project state */
function detectCompletedSteps(activeProject, projects) {
  const completed = []
  if (projects?.length > 0) completed.push('create-project')
  if (activeProject?.deterministicScore) completed.push('run-analysis')
  if (activeProject?.checked && Object.keys(activeProject.checked).length > 0) completed.push('check-checklist')
  if (activeProject?.gscConnected) completed.push('connect-gsc')
  if (activeProject?.team?.length > 1) completed.push('invite-team')
  if (activeProject?.monitoringEnabled) completed.push('setup-monitoring')
  return completed
}

const GettingStartedChecklist = memo(function GettingStartedChecklist({
  activeProject, projects, setActiveView, onNewProject,
}) {
const [expanded, setExpanded] = useState(false)
  const [manualChecked, setManualChecked] = useState(() => loadCheckedSteps())
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISSED_KEY) === 'true' } catch { return false }
  })
  const [celebrating, setCelebrating] = useState(false)

  const autoCompleted = useMemo(
    () => detectCompletedSteps(activeProject, projects),
    [activeProject, projects]
  )

  const allChecked = useMemo(
    () => [...new Set([...manualChecked, ...autoCompleted])],
    [manualChecked, autoCompleted]
  )

  const completedCount = allChecked.length
  const totalSteps = CHECKLIST_STEPS.length
  const progressPct = Math.round((completedCount / totalSteps) * 100)
  const allDone = completedCount === totalSteps

  // Celebrate when all done
  useEffect(() => {
    if (allDone && !dismissed) {
      setCelebrating(true)
      const timer = setTimeout(() => setCelebrating(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [allDone, dismissed])

  const handleToggleStep = useCallback((stepId) => {
    setManualChecked(prev => {
      const next = prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
      saveCheckedSteps(next)
      return next
    })
  }, [])

  const handleAction = useCallback((action) => {
    if (action === 'new-project') {
      onNewProject?.()
    } else {
      setActiveView?.(action)
    }
    setExpanded(false)
  }, [setActiveView, onNewProject])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    try { localStorage.setItem(DISMISSED_KEY, 'true') } catch { /* non-critical */ }
  }, [])

  if (dismissed) return null

  return (
    <div
      style={{
        maxWidth: '20rem', width: '100%',
      }}
    >
      {/* Collapsed: floating bubble */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '2.25rem', height: '2.25rem',
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: '50%',
            cursor: 'pointer', boxShadow: 'var(--shadow-lg)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            marginLeft: 'auto', position: 'relative',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          aria-label={`Getting Started ${completedCount}/${totalSteps}`}
        >
          {celebrating ? <PartyPopper size={16} /> : <Sparkles size={16} />}
          <span style={{
            position: 'absolute', top: '-0.1875rem', right: '-0.1875rem',
            background: 'var(--bg-card)', color: 'var(--accent)',
            fontSize: '0.5625rem', fontWeight: 700,
            width: '1rem', height: '1rem',
            borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>
            {completedCount}
          </span>
        </button>
      )}

      {/* Expanded: checklist panel */}
      {expanded && (
        <div
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
            animation: 'fade-in 0.2s ease-out',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)',
                fontWeight: 700, color: 'var(--text-primary)',
              }}>
                {'Getting Started'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <button
                onClick={() => setExpanded(false)}
                className="btn-ghost"
                style={{ padding: '2px' }}
                aria-label="Minimize"
              >
                <ChevronDown size={14} />
              </button>
              {allDone && (
                <button
                  onClick={handleDismiss}
                  className="btn-ghost"
                  style={{ padding: '2px' }}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ padding: '0 var(--space-4)', marginTop: 'var(--space-2)' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-2xs)',
              color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)',
            }}>
              <span>{'Progress'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{progressPct}%</span>
            </div>
            <div style={{
              height: '0.375rem', borderRadius: '0.1875rem',
              background: 'var(--border-subtle)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '0.1875rem',
                background: allDone ? 'var(--color-success)' : 'var(--accent)',
                width: `${progressPct}%`, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* Steps */}
          <div style={{ padding: 'var(--space-2) var(--space-3)', maxHeight: '16rem', overflowY: 'auto' }}>
            {CHECKLIST_STEPS.map(step => {
              const isChecked = allChecked.includes(step.id)
              const StepIcon = step.icon
              return (
                <div
                  key={step.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    opacity: isChecked ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <button
                    onClick={() => handleToggleStep(step.id)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      cursor: 'pointer', flexShrink: 0,
                      color: isChecked ? 'var(--color-success)' : 'var(--text-disabled)',
                    }}
                    aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {isChecked
                      ? <CheckCircle2 size={16} />
                      : <Circle size={16} />
                    }
                  </button>
                  <button
                    onClick={() => handleAction(step.action)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      cursor: 'pointer', flex: 1, textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                      fontSize: 'var(--text-xs)', color: 'var(--text-primary)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: 500,
                    }}
                  >
                    <StepIcon size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    {step.fallbackLabel}
                  </button>
                </div>
              )
            })}
          </div>

          {/* All done message */}
          {allDone && (
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                {'All done! You\'re all set up.'}
              </p>
              <button
                onClick={handleDismiss}
                className="btn-ghost btn-sm"
                style={{ fontSize: 'var(--text-2xs)', marginTop: 'var(--space-1)' }}
              >
                {'Dismiss checklist'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default GettingStartedChecklist
