import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { useFirestoreProjects } from './hooks/useFirestoreProjects'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useAutoMonitor } from './hooks/useAutoMonitor'
import LoginPage from './components/LoginPage'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import DocOverlay from './components/DocOverlay'
import NewProjectModal from './components/NewProjectModal'
import DashboardView from './views/DashboardView'
import ChecklistView from './views/ChecklistView'
import ProcessMapView from './views/ProcessMapView'
import AnalyzerView from './views/AnalyzerView'
import DocsView from './views/DocsView'
import TestingView from './views/TestingView'
import MetricsView from './views/MetricsView'
import CompetitorsView from './views/CompetitorsView'
import SettingsView from './views/SettingsView'
import OnboardingTutorial from './components/OnboardingTutorial'
import EmailReportDialog from './components/EmailReportDialog'
import { generateReport } from './utils/generateReport'
import { phases } from './data/aeo-checklist'

/* ── Splash Screen ── */
function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) { onComplete(); return }
    const timer = setTimeout(() => setFadeOut(true), 1600)
    return () => clearTimeout(timer)
  }, [reducedMotion, onComplete])

  if (reducedMotion) return null

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 'var(--z-toast)',
        background: 'var(--bg-page)',
        ...(fadeOut ? { animation: 'splash-fade-out 400ms ease-out forwards' } : {}),
      }}
      onAnimationEnd={() => fadeOut && onComplete()}
    >
      <div
        className="flex flex-col items-center"
        style={{ animation: 'scale-in 500ms ease-out both' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(255,107,53,0.12)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-phase-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
          AEO Dashboard
        </h1>
        <p className="text-text-tertiary text-[13px] mt-2" style={{ animation: 'fade-in-up 400ms ease-out both', animationDelay: '400ms' }}>
          Answer Engine Optimization
        </p>
      </div>
      <div className="w-40 h-[3px] rounded-full mt-6 overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, var(--color-phase-1), var(--color-phase-2), var(--color-phase-3), var(--color-phase-4))',
            animation: 'fill-bar 1.2s ease-out forwards',
            animationDelay: '300ms',
            width: '100%',
          }}
        />
      </div>
    </div>
  )
}

/* ── Loading Screen ── */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-phase-1 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
        <p className="text-text-tertiary text-sm">Loading...</p>
      </div>
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signOut, error: authError, clearError } = useAuth()

  if (authLoading) return <LoadingScreen />

  if (!user) {
    return (
      <LoginPage
        onSignIn={signIn}
        onSignUp={signUp}
        onGoogleSignIn={signInWithGoogle}
        error={authError}
        clearError={clearError}
      />
    )
  }

  return <AuthenticatedApp user={user} onSignOut={signOut} />
}

function AuthenticatedApp({ user, onSignOut }) {
  const [activeView, setActiveView] = useState('dashboard')
  const [docItem, setDocItem] = useState(null)
  const [overlayClosing, setOverlayClosing] = useState(false)
  const [splashVisible, setSplashVisible] = useState(true)
  const [dateRange, setDateRange] = useState('7d')
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailDialogClosing, setEmailDialogClosing] = useState(false)
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)
  const [hintsMode, setHintsMode] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('aeo-onboarding-completed') !== 'true'
  })

  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    deleteProject,
    renameProject,
    updateProject,
    toggleCheckItem,
    loading: projectsLoading,
  } = useFirestoreProjects(user?.uid)

  // Auto-monitor
  const { shouldAutoRun, runMonitor } = useAutoMonitor({ activeProject, updateProject })
  const autoMonitorTriggered = useRef(false)

  useEffect(() => {
    if (!splashVisible && !autoMonitorTriggered.current && shouldAutoRun()) {
      autoMonitorTriggered.current = true
      const timer = setTimeout(() => { runMonitor() }, 2000)
      return () => clearTimeout(timer)
    }
  }, [splashVisible, shouldAutoRun, runMonitor])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]')
        if (searchInput) searchInput.focus()
      }
      if (e.key === 'Escape') {
        if (newProjectModalOpen) { setNewProjectModalOpen(false); return }
        if (emailDialogOpen && !emailDialogClosing) { setEmailDialogClosing(true); return }
        if (docItem && !overlayClosing) handleCloseOverlay()
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        const views = ['dashboard', 'competitors', 'checklist', 'process', 'analyzer', 'metrics', 'docs', 'testing', 'settings']
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) {
          setActiveView(views[num - 1])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [docItem, overlayClosing, newProjectModalOpen, emailDialogOpen, emailDialogClosing])

  const handleSetDocItem = useCallback((item) => {
    setOverlayClosing(false)
    setDocItem(item)
  }, [])

  const handleCloseOverlay = useCallback(() => {
    setOverlayClosing(true)
  }, [])

  const handleOverlayExited = useCallback(() => {
    setOverlayClosing(false)
    setDocItem(null)
  }, [])

  const handleSplashComplete = useCallback(() => {
    setSplashVisible(false)
  }, [])

  const handleNavigation = useCallback((view) => {
    setActiveView(view)
  }, [])

  const handleRefresh = useCallback(() => {
    window.dispatchEvent(new CustomEvent('aeo-refresh', { detail: { dateRange } }))
  }, [dateRange])

  const handleExport = useCallback(() => {
    const metricsHistory = activeProject?.metricsHistory
    const latestMetrics = metricsHistory?.length ? metricsHistory[metricsHistory.length - 1] : null
    generateReport(latestMetrics, activeProject?.name || 'No Project', dateRange)
  }, [dateRange, activeProject])

  const handleEmail = useCallback(() => {
    setEmailDialogClosing(false)
    setEmailDialogOpen(true)
  }, [])

  const handleCreateProject = useCallback((name, url) => {
    createProject(name, url)
    setNewProjectModalOpen(false)
  }, [createProject])

  const renderView = () => {
    if (projectsLoading) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-phase-1 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
            <p className="text-text-tertiary text-sm">Loading projects...</p>
            <p className="text-text-tertiary text-xs">This should only take a moment.</p>
          </div>
        </div>
      )
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            projects={projects}
            activeProject={activeProject}
            setActiveProjectId={setActiveProjectId}
            setActiveView={setActiveView}
            onNewProject={() => setNewProjectModalOpen(true)}
            phases={phases}
            userName={user?.displayName}
          />
        )
      case 'checklist':
        return (
          <ChecklistView
            phases={phases}
            activeProject={activeProject}
            toggleCheckItem={toggleCheckItem}
            setActiveView={setActiveView}
            setDocItem={handleSetDocItem}
            updateProject={updateProject}
          />
        )
      case 'process':
        return (
          <ProcessMapView
            phases={phases}
            setDocItem={handleSetDocItem}
            setActiveView={setActiveView}
          />
        )
      case 'analyzer':
        return (
          <AnalyzerView
            activeProject={activeProject}
            updateProject={updateProject}
          />
        )
      case 'metrics':
        return (
          <MetricsView
            activeProject={activeProject}
            updateProject={updateProject}
            dateRange={dateRange}
          />
        )
      case 'docs':
        return (
          <DocsView
            phases={phases}
            setDocItem={handleSetDocItem}
          />
        )
      case 'testing':
        return (
          <TestingView
            activeProject={activeProject}
            updateProject={updateProject}
          />
        )
      case 'competitors':
        return (
          <CompetitorsView
            activeProject={activeProject}
            updateProject={updateProject}
          />
        )
      case 'settings':
        return (
          <SettingsView
            activeProject={activeProject}
            updateProject={updateProject}
            deleteProject={deleteProject}
            user={user}
            setActiveView={setActiveView}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {splashVisible && <SplashScreen onComplete={handleSplashComplete} />}

      {/* ── APP SHELL — flex row, sidebar + main-area ── */}
      <div className="app-shell">
        <Sidebar
          activeView={activeView}
          setActiveView={handleNavigation}
          onNewProject={() => setNewProjectModalOpen(true)}
          user={user}
          onSignOut={onSignOut}
          hintsMode={hintsMode}
        />

        <div className="main-area">
          <TopBar
            projects={projects}
            activeProject={activeProject}
            setActiveProjectId={setActiveProjectId}
            deleteProject={deleteProject}
            renameProject={renameProject}
            phases={phases}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onEmail={handleEmail}
            onNewProject={() => setNewProjectModalOpen(true)}
            setActiveView={setActiveView}
            setDocItem={handleSetDocItem}
            hintsMode={hintsMode}
            setHintsMode={setHintsMode}
          />

          <div className="content-scroll">
            <div className="content-wrapper">
              <div key={activeView} className="view-enter">
                {renderView()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overlays / Modals ── */}
      {(docItem || overlayClosing) && (
        <DocOverlay
          item={docItem}
          onClose={handleCloseOverlay}
          onExited={handleOverlayExited}
          isClosing={overlayClosing}
          phases={phases}
        />
      )}

      {!splashVisible && showOnboarding && (
        <OnboardingTutorial
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
          setActiveView={setActiveView}
        />
      )}

      {newProjectModalOpen && (
        <NewProjectModal
          onClose={() => setNewProjectModalOpen(false)}
          onCreate={handleCreateProject}
        />
      )}

      {(emailDialogOpen || emailDialogClosing) && (
        <EmailReportDialog
          metrics={activeProject?.metricsHistory?.length ? activeProject.metricsHistory[activeProject.metricsHistory.length - 1] : null}
          projectName={activeProject?.name || 'No Project'}
          dateRange={dateRange}
          onClose={() => setEmailDialogClosing(true)}
          isClosing={emailDialogClosing}
          onExited={() => { setEmailDialogOpen(false); setEmailDialogClosing(false) }}
        />
      )}
    </>
  )
}
