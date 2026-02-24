import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './hooks/useAuth'
import { useFirestoreProjects } from './hooks/useFirestoreProjects'
import { usePermission } from './hooks/usePermission'
import { usePresence } from './hooks/usePresence'
import { useNotifications } from './hooks/useNotifications'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useAutoMonitor } from './hooks/useAutoMonitor'
import { useDigestScheduler } from './hooks/useDigestScheduler'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import ErrorBoundary from './components/ErrorBoundary'
import ConnectionBanner from './components/ConnectionBanner'
import PresenceHint from './components/PresenceHint'
import { DashboardSkeleton, ChecklistSkeleton, MetricsSkeleton, DocsSkeleton, TestingSkeleton } from './components/Skeleton'
import { useChecklistTranslation } from './hooks/useChecklistTranslation'
import useHashRouter from './hooks/useHashRouter'
import useModalManager from './hooks/useModalManager'

// Lazy-loaded: LoginPage (only needed before auth) + aeo-checklist data (large string payload)
const LoginPage = lazy(() => import('./components/LoginPage'))

// Lazy-loaded views
const DashboardView = lazy(() => import('./views/DashboardView'))
const ChecklistView = lazy(() => import('./views/ChecklistView'))
const AnalyzerView = lazy(() => import('./views/AnalyzerView'))
const ContentWriterView = lazy(() => import('./views/ContentWriterView'))
const ContentScorerView = lazy(() => import('./views/ContentScorerView'))
const SchemaGeneratorView = lazy(() => import('./views/SchemaGeneratorView'))
const MonitoringView = lazy(() => import('./views/MonitoringView'))
const DocsView = lazy(() => import('./views/DocsView'))
const TestingView = lazy(() => import('./views/TestingView'))
const MetricsView = lazy(() => import('./views/MetricsView'))
const CompetitorsView = lazy(() => import('./views/CompetitorsView'))
const SettingsView = lazy(() => import('./views/SettingsView'))
const GscView = lazy(() => import('./views/GscView'))
const Ga4View = lazy(() => import('./views/Ga4View'))
const AeoImpactView = lazy(() => import('./views/AeoImpactView'))
const ContentOpsView = lazy(() => import('./views/content-ops/ContentOpsView'))

// Lazy-loaded modals (only loaded when opened)
const DocOverlay = lazy(() => import('./components/DocOverlay'))
const NewProjectModal = lazy(() => import('./components/NewProjectModal'))
const OnboardingTutorial = lazy(() => import('./components/OnboardingTutorial'))
const OnboardingQuiz = lazy(() => import('./components/OnboardingQuiz'))
const ProjectQuestionnaire = lazy(() => import('./components/ProjectQuestionnaire'))
const EmailReportDialog = lazy(() => import('./components/EmailReportDialog'))
const PdfExportDialog = lazy(() => import('./components/PdfExportDialog'))
const CsvExportDialog = lazy(() => import('./components/CsvExportDialog'))
const CommandPalette = lazy(() => import('./components/CommandPalette'))
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal'))
const HelpWidget = lazy(() => import('./components/HelpWidget'))

/* ── Suspense Fallback — picks the right skeleton per view ── */
function ViewSkeleton({ activeView }) {
  switch (activeView) {
    case 'dashboard': return <DashboardSkeleton />
    case 'checklist': return <ChecklistSkeleton />
    case 'metrics': return <MetricsSkeleton />
    case 'docs': return <DocsSkeleton />
    case 'testing': return <TestingSkeleton />
    default: return <DashboardSkeleton />
  }
}

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
          style={{ backgroundColor: 'rgba(37,99,235,0.12)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
          AEO Dashboard
        </h1>
        <p className="text-text-tertiary text-[0.8125rem] mt-2" style={{ animation: 'fade-in-up 400ms ease-out both', animationDelay: '400ms' }}>
          Answer Engine Optimization
        </p>
      </div>
      <div className="w-40 h-[0.1875rem] rounded-full mt-6 overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
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

/* ── Portal View (lazy — only loads if ?share= is in URL) ── */
const PortalView = lazy(() => import('./views/PortalView'))

/* ── Waitlist Page (lazy — default route, no auth required) ── */
const WaitlistPage = lazy(() => import('./views/WaitlistPage'))

/* ── Landing Page (lazy — loads at ?/features, no auth required) ── */
const LandingPage = lazy(() => import('./views/LandingPage'))

/* ── Admin Panel (lazy — only loads if ?/admin is in URL) ── */
const AdminApp = lazy(() => import('./admin/AdminApp'))

/** Detect whether the current URL targets the dashboard app (vs landing page) */
function isAppPath() {
  const p = window.location.pathname
  const s = window.location.search
  // Direct path: /AEO-Dashboard/app
  if (p.includes('/app')) return true
  // 404.html redirect format: /?/app
  if (s.startsWith('?/app')) return true
  return false
}

/** Detect whether the current URL targets the admin panel */
function isAdminPath() {
  const p = window.location.pathname
  const s = window.location.search
  if (p.includes('/admin')) return true
  if (s.startsWith('?/admin')) return true
  return false
}

/** Detect whether the current URL targets the full features/landing page */
function isFeaturesPath() {
  const p = window.location.pathname
  const s = window.location.search
  if (p.includes('/features')) return true
  if (s.startsWith('?/features')) return true
  return false
}

/* ── OAuth Callback — if this page loaded inside an OAuth popup, show a simple message ── */
function isOAuthCallback() {
  const hash = window.location.hash
  return hash.includes('access_token=') && window.opener
}

function OAuthCallbackScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-phase-1 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
        <p className="text-text-tertiary text-sm">Completing Google connection...</p>
      </div>
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  // 0. OAuth popup callback — show loading message (parent window reads the token)
  if (isOAuthCallback()) {
    return <OAuthCallbackScreen />
  }

  // 1. Share link — portal needs no login
  const shareToken = new URLSearchParams(window.location.search).get('share')
  if (shareToken) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <PortalView shareToken={shareToken} />
      </Suspense>
    )
  }

  // 2. Admin panel — needs auth + super admin check
  if (isAdminPath()) {
    return <AdminRouter />
  }

  // 3. Full features/landing page — ?/features
  if (isFeaturesPath()) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <LandingPage />
      </Suspense>
    )
  }

  // 4. Waitlist page — default for non-app paths
  if (!isAppPath()) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <WaitlistPage />
      </Suspense>
    )
  }

  // 5. Dashboard app — needs auth
  return <DashboardApp />
}

/** Admin panel — separate auth flow, lazy-loaded */
function AdminRouter() {
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signOut, resetPassword, error: authError, clearError } = useAuth()

  if (authLoading) return <LoadingScreen />

  if (!user) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <LoginPage
          onSignIn={signIn}
          onSignUp={signUp}
          onGoogleSignIn={signInWithGoogle}
          onResetPassword={resetPassword}
          error={authError}
          clearError={clearError}
        />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminApp user={user} onSignOut={signOut} />
    </Suspense>
  )
}

/** Extracted so useAuth() only runs when dashboard is active (hooks rules compliance) */
function DashboardApp() {
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signOut, resetPassword, updateUserProfile, error: authError, clearError } = useAuth()

  if (authLoading) return <LoadingScreen />

  if (!user) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <LoginPage
          onSignIn={signIn}
          onSignUp={signUp}
          onGoogleSignIn={signInWithGoogle}
          onResetPassword={resetPassword}
          error={authError}
          clearError={clearError}
        />
      </Suspense>
    )
  }

  return <AuthenticatedApp user={user} onSignOut={signOut} updateUserProfile={updateUserProfile} />
}

function AuthenticatedApp({ user, onSignOut, updateUserProfile }) {
  const { activeView, setActiveView } = useHashRouter()
  const [docItem, setDocItem] = useState(null)
  const [overlayClosing, setOverlayClosing] = useState(false)
  const [splashVisible, setSplashVisible] = useState(true)
  const [dateRange, setDateRange] = useState('7d')
  const modals = useModalManager(['email', 'pdf', 'csv', 'cmdPalette', 'shortcuts'])
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)
  const [questionnaireProjectId, setQuestionnaireProjectId] = useState(null)
  const [pendingProject, setPendingProject] = useState(null) // { name, url } — deferred creation
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('aeo-onboarding-completed') !== 'true'
  })

  // Onboarding quiz — shown once after first login (before tutorial)
  const [showQuiz, setShowQuiz] = useState(false)
  const quizChecked = useRef(false)

  useEffect(() => {
    if (!user?.uid || quizChecked.current) return
    quizChecked.current = true

    const isFirebaseConfigured = (() => {
      try {
        const key = import.meta.env.VITE_FIREBASE_API_KEY || ''
        return key.length > 0 && !key.startsWith('YOUR_')
      } catch { return false }
    })()

    if (isFirebaseConfigured) {
      // Firebase mode: check Firestore
      getDoc(doc(db, 'users', user.uid))
        .then(snap => {
          if (snap.exists() && snap.data().onboardingCompleted) {
            setShowQuiz(false)
          } else {
            setShowQuiz(true)
          }
        })
        .catch(() => setShowQuiz(false)) // fail silently
    } else {
      // Dev mode: check localStorage
      const key = `aeo-quiz-completed-${user.uid}`
      setShowQuiz(localStorage.getItem(key) !== 'true')
    }
  }, [user?.uid])

  const handleQuizComplete = useCallback(async (quizAnswers) => {
    setShowQuiz(false)

    const isFirebaseConfigured = (() => {
      try {
        const key = import.meta.env.VITE_FIREBASE_API_KEY || ''
        return key.length > 0 && !key.startsWith('YOUR_')
      } catch { return false }
    })()

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          onboarding: { ...quizAnswers, completedAt: new Date().toISOString() },
          onboardingCompleted: true,
        }, { merge: true })
      } catch { /* non-critical */ }
    } else {
      localStorage.setItem(`aeo-quiz-completed-${user.uid}`, 'true')
      localStorage.setItem(`aeo-quiz-data-${user.uid}`, JSON.stringify(quizAnswers))
    }
  }, [user?.uid])

  const handleQuizSkip = useCallback(async () => {
    setShowQuiz(false)

    const isFirebaseConfigured = (() => {
      try {
        const key = import.meta.env.VITE_FIREBASE_API_KEY || ''
        return key.length > 0 && !key.startsWith('YOUR_')
      } catch { return false }
    })()

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          onboardingCompleted: true,
        }, { merge: true })
      } catch { /* non-critical */ }
    } else {
      localStorage.setItem(`aeo-quiz-completed-${user.uid}`, 'true')
    }
  }, [user?.uid])

  // Lazy-load the checklist data (large string payload — ~60-80 KB minified)
  const [rawPhases, setRawPhases] = useState(null)
  useEffect(() => {
    import('./data/aeo-checklist').then(mod => setRawPhases(mod.phases))
  }, [])

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

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
    firestoreError,
  } = useFirestoreProjects(user)

  const permission = usePermission({ user, activeProject })
  const { onlineMembers } = usePresence({ user, activeProject, activeView, updateProject })
  const { notifications, unreadCount, addNotification, markRead, markAllRead, clearAll: clearNotifications } = useNotifications({ user, activeProject, updateProject })

  // Translated checklist phases (rawPhases is null until dynamic import resolves)
  const phases = useChecklistTranslation(rawPhases)

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

  // Email digest scheduler
  useDigestScheduler({ activeProject, updateProject })

  // Auto-open project creation when user has no projects
  const noProjects = !projectsLoading && projects.length === 0

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (!modals.isOpen('cmdPalette')) modals.open('cmdPalette')
      }
      if (e.key === 'Escape') {
        if (modals.isOpen('cmdPalette')) { modals.close('cmdPalette'); return }
        if (modals.isOpen('shortcuts')) { modals.close('shortcuts'); return }
        if (newProjectModalOpen && projects.length > 0) { setNewProjectModalOpen(false); return }
        if (modals.isOpen('csv')) { modals.close('csv'); return }
        if (modals.isOpen('pdf')) { modals.close('pdf'); return }
        if (modals.isOpen('email')) { modals.close('email'); return }
        if (docItem && !overlayClosing) handleCloseOverlay()
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        const views = ['dashboard', 'checklist', 'competitors', 'analyzer', 'writer', 'schema', 'monitoring', 'metrics', 'gsc']
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) {
          setActiveView(views[num - 1])
        }
        if (e.key === '?' && !modals.isOpen('cmdPalette') && !modals.isOpen('shortcuts') && !docItem && !newProjectModalOpen) {
          modals.open('shortcuts')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modals.state, docItem, overlayClosing, newProjectModalOpen])

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
  }, [setActiveView])

  // Reset scroll position when switching views
  useEffect(() => {
    const scrollEl = document.getElementById('main-content')
    if (scrollEl) scrollEl.scrollTop = 0
  }, [activeView])

  const [refreshing, setRefreshing] = useState(false)
  const handleRefresh = useCallback(() => {
    if (refreshing) return
    setRefreshing(true)
    // Dispatch global refresh event (listened by useAeoMetrics and other hooks)
    window.dispatchEvent(new CustomEvent('aeo-refresh', { detail: { dateRange } }))
    // Visual feedback: spin for 800ms
    setTimeout(() => setRefreshing(false), 800)
  }, [dateRange, refreshing])

  const handleExport = useCallback(() => {
    modals.open('pdf')
  }, [modals])

  const handleCsvExport = useCallback(() => {
    modals.open('csv')
  }, [modals])

  const handleEmail = useCallback(() => {
    modals.open('email')
  }, [modals])

  const handleCreateProject = useCallback((name, url) => {
    setNewProjectModalOpen(false)
    // Defer project creation — store name/url, open questionnaire
    setPendingProject({ name, url })
  }, [])

  const handleQuestionnaireComplete = useCallback(async (answers) => {
    if (pendingProject) {
      // Deferred creation: create project + save questionnaire in one shot
      const project = await createProject(pendingProject.name, pendingProject.url)
      const newId = project?.id || activeProjectId
      if (newId) {
        updateProject(newId, {
          questionnaire: { ...answers, completedAt: new Date().toISOString() },
        })
      }
      setPendingProject(null)
    } else if (questionnaireProjectId) {
      // Re-take flow: project already exists
      updateProject(questionnaireProjectId, {
        questionnaire: { ...answers, completedAt: new Date().toISOString() },
      })
      setQuestionnaireProjectId(null)
    }
  }, [pendingProject, questionnaireProjectId, createProject, activeProjectId, updateProject])

  const handleQuestionnaireCancel = useCallback(() => {
    // Cancel deferred creation — clear pending data
    setPendingProject(null)
    // If user has no projects yet, re-open the "Create first project" modal
    // so they don't land on an empty dashboard
    if (noProjects) {
      setNewProjectModalOpen(true)
    }
  }, [noProjects])

  useEffect(() => {
    if (noProjects && !questionnaireProjectId && !pendingProject) {
      setNewProjectModalOpen(true)
    }
  }, [noProjects, questionnaireProjectId, pendingProject])

  const renderView = () => {
    // Show loading skeleton while checklist data or projects are loading
    if (!phases || projectsLoading) {
      switch (activeView) {
        case 'dashboard': return <DashboardSkeleton />
        case 'checklist': return <ChecklistSkeleton />
        case 'metrics': return <MetricsSkeleton />
        case 'docs': return <DocsSkeleton />
        case 'testing': return <TestingSkeleton />
        default: return <DashboardSkeleton />
      }
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
            currentUserUid={user?.uid}
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
            user={user}
            onlineMembers={onlineMembers}
            addNotification={addNotification}
          />
        )
      case 'analyzer':
        return (
          <AnalyzerView
            activeProject={activeProject}
            updateProject={updateProject}
            user={user}
          />
        )
      case 'writer':
        return (
          <ContentWriterView
            activeProject={activeProject}
            updateProject={updateProject}
            user={user}
          />
        )
      case 'scorer':
        return (
          <ContentScorerView
            activeProject={activeProject}
          />
        )
      case 'content-ops':
        return (
          <ContentOpsView
            activeProject={activeProject}
            updateProject={updateProject}
            user={user}
            phases={phases}
            toggleCheckItem={toggleCheckItem}
          />
        )
      case 'schema':
        return (
          <SchemaGeneratorView
            activeProject={activeProject}
            updateProject={updateProject}
            user={user}
          />
        )
      case 'monitoring':
        return (
          <MonitoringView
            activeProject={activeProject}
            updateProject={updateProject}
            user={user}
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
            setActiveView={setActiveView}
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
            user={user}
          />
        )
      case 'gsc':
        return (
          <GscView
            activeProject={activeProject}
            updateProject={updateProject}
            user={user}
            setActiveView={setActiveView}
          />
        )
      case 'ga4':
        return (
          <Ga4View
            activeProject={activeProject}
            user={user}
            setActiveView={setActiveView}
          />
        )
      case 'aeo-impact':
        return (
          <AeoImpactView
            activeProject={activeProject}
            user={user}
            setActiveView={setActiveView}
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
            permission={permission}
            projects={projects}
            updateUserProfile={updateUserProfile}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {splashVisible && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Skip Navigation Link */}
      <a href="#main-content" className="skip-nav-link">Skip to main content</a>

      {/* ── APP SHELL — flex row, sidebar + main-area ── */}
      <div className="app-shell">
        <Sidebar
          activeView={activeView}
          setActiveView={handleNavigation}
          onNewProject={() => setNewProjectModalOpen(true)}
          user={user}
          onSignOut={onSignOut}
          sidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
          onlineMembers={onlineMembers}
        />
        <div
          className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
          onClick={closeSidebar}
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
            refreshing={refreshing}
            onExport={handleExport}
            onCsvExport={handleCsvExport}
            onEmail={handleEmail}
            onNewProject={() => setNewProjectModalOpen(true)}
            setActiveView={setActiveView}
            setDocItem={handleSetDocItem}
            onToggleSidebar={toggleSidebar}
            onOpenCommandPalette={() => modals.open('cmdPalette')}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
            onClearNotifications={clearNotifications}
          />

          <ConnectionBanner error={firestoreError} />
          <PresenceHint
            onlineMembers={onlineMembers}
            activeView={activeView}
            currentUid={user?.uid}
            activityLog={activeProject?.activityLog}
          />

          <div className="content-scroll" id="main-content" tabIndex="-1">
            <div className="content-wrapper">
              <ErrorBoundary key={activeView}>
                <Suspense fallback={<ViewSkeleton activeView={activeView} />}>
                  <div className="view-enter">
                    {renderView()}
                  </div>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overlays / Modals ── */}
      <Suspense fallback={null}>
      {(docItem || overlayClosing) && (
        <DocOverlay
          item={docItem}
          onClose={handleCloseOverlay}
          onExited={handleOverlayExited}
          isClosing={overlayClosing}
          phases={phases}
          setActiveView={setActiveView}
        />
      )}

      {!splashVisible && showQuiz && (
        <Suspense fallback={null}>
          <OnboardingQuiz
            onComplete={handleQuizComplete}
            onSkip={handleQuizSkip}
          />
        </Suspense>
      )}

      {!splashVisible && !showQuiz && showOnboarding && (
        <OnboardingTutorial
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
          setActiveView={setActiveView}
        />
      )}

      {newProjectModalOpen && (
        <NewProjectModal
          onClose={projects.length === 0 ? undefined : () => setNewProjectModalOpen(false)}
          onCreate={handleCreateProject}
          required={projects.length === 0}
        />
      )}

      {(questionnaireProjectId || pendingProject) && (
        <ProjectQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onCancel={pendingProject && projects.length > 0 ? handleQuestionnaireCancel : undefined}
          isNewProject={!!pendingProject}
          initialData={questionnaireProjectId ? projects.find(p => p.id === questionnaireProjectId)?.questionnaire : undefined}
        />
      )}

      {modals.state.email !== 'closed' && (
        <EmailReportDialog
          metrics={activeProject?.metricsHistory?.length ? activeProject.metricsHistory[activeProject.metricsHistory.length - 1] : null}
          projectName={activeProject?.name || 'No Project'}
          dateRange={dateRange}
          onClose={() => modals.close('email')}
          isClosing={modals.state.email === 'closing'}
          onExited={() => modals.onExited('email')}
        />
      )}

      {modals.state.pdf !== 'closed' && (
        <PdfExportDialog
          activeProject={activeProject}
          phases={phases}
          updateProject={updateProject}
          user={user}
          onClose={() => modals.close('pdf')}
          isClosing={modals.state.pdf === 'closing'}
          onExited={() => modals.onExited('pdf')}
        />
      )}

      {modals.state.csv !== 'closed' && (
        <CsvExportDialog
          activeProject={activeProject}
          phases={phases}
          updateProject={updateProject}
          user={user}
          onClose={() => modals.close('csv')}
          isClosing={modals.state.csv === 'closing'}
          onExited={() => modals.onExited('csv')}
        />
      )}

      {modals.state.cmdPalette !== 'closed' && (
        <CommandPalette
          isOpen={modals.state.cmdPalette === 'open'}
          isClosing={modals.state.cmdPalette === 'closing'}
          onClose={() => modals.close('cmdPalette')}
          onExited={() => modals.onExited('cmdPalette')}
          phases={phases}
          activeProject={activeProject}
          projects={projects}
          setActiveView={setActiveView}
          setActiveProjectId={setActiveProjectId}
          onNewProject={() => setNewProjectModalOpen(true)}
          onExport={handleExport}
          setDocItem={handleSetDocItem}
        />
      )}

      {modals.state.shortcuts !== 'closed' && (
        <KeyboardShortcutsModal
          isOpen={modals.state.shortcuts === 'open'}
          isClosing={modals.state.shortcuts === 'closing'}
          onClose={() => modals.close('shortcuts')}
          onExited={() => modals.onExited('shortcuts')}
        />
      )}

      {/* Help & Feedback Widget */}
      <HelpWidget
        user={user}
        activeView={activeView}
        activeProject={activeProject}
        setActiveView={setActiveView}
      />
      </Suspense>
    </>
  )
}
