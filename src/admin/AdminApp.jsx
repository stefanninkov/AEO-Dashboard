import { useState, useCallback, useMemo, lazy, Suspense } from 'react'
import { isSuperAdmin, hasConfiguredAdmins } from '../config/superAdmins'
import { ShieldOff, AlertCircle } from 'lucide-react'
import AdminSidebar from './components/AdminSidebar'
import AdminTopBar from './components/AdminTopBar'

// Lazy-loaded admin views
const AdminDashboard = lazy(() => import('./views/AdminDashboard'))
const AdminUsers = lazy(() => import('./views/AdminUsers'))
const AdminProjects = lazy(() => import('./views/AdminProjects'))
const AdminActivity = lazy(() => import('./views/AdminActivity'))
const AdminRevenue = lazy(() => import('./views/AdminRevenue'))
const AdminAnalytics = lazy(() => import('./views/AdminAnalytics'))
const AdminSettings = lazy(() => import('./views/AdminSettings'))
const AdminFeedback = lazy(() => import('./views/AdminFeedback'))
const AdminChatLogs = lazy(() => import('./views/AdminChatLogs'))
const AdminWaitlist = lazy(() => import('./views/AdminWaitlist'))

/* ── Loading Screen ── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '2px solid var(--color-phase-1)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading admin panel...</p>
      </div>
    </div>
  )
}

/* ── Access Denied Screen ── */
function AccessDenied() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '1.5rem',
    }}>
      <div className="card" style={{ maxWidth: '28rem', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '1rem',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <ShieldOff size={32} style={{ color: 'var(--color-error)' }} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}>
          Access Denied
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}>
          You do not have permission to access the admin panel. Only platform super administrators can access this area.
        </p>
        <button
          onClick={() => { window.location.href = window.location.origin + window.location.pathname + '?/app' }}
          className="btn-primary"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

/* ── Not Configured Warning ── */
function NotConfigured({ user }) {
  const [copied, setCopied] = useState(false)
  const uid = user?.uid || ''

  const handleCopy = () => {
    navigator.clipboard.writeText(uid).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '1.5rem',
    }}>
      <div className="card" style={{ maxWidth: '32rem', padding: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1rem',
          borderRadius: '0.75rem',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.15)',
        }}>
          <AlertCircle size={20} style={{ color: 'var(--color-warning)', marginTop: '0.125rem', flexShrink: 0 }} />
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              Admin Panel Not Configured
            </h3>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--text-tertiary)',
              lineHeight: 1.6,
              marginBottom: '0.75rem',
            }}>
              No super admin UIDs have been configured. Your UID is:
            </p>

            {/* UID display with copy button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
            }}>
              <code style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                flex: 1,
                wordBreak: 'break-all',
                userSelect: 'all',
              }}>{uid}</code>
              <button
                onClick={handleCopy}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: copied ? 'var(--color-success)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--text-tertiary)',
              lineHeight: 1.6,
              marginBottom: '0.75rem',
            }}>
              Add it to <code style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                background: 'var(--hover-bg)',
              }}>src/config/superAdmins.js</code> then redeploy.
            </p>
            <button
              onClick={() => { window.location.href = window.location.origin + window.location.pathname + '?/app' }}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Admin App ── */
export default function AdminApp({ user, onSignOut }) {
  const isAdmin = useMemo(() => isSuperAdmin(user?.uid), [user?.uid])
  const isConfigured = useMemo(() => hasConfiguredAdmins(), [])
  const [activeAdminView, setActiveAdminView] = useState('dashboard')

  if (!isConfigured) return <NotConfigured user={user} />
  if (!isAdmin) return <AccessDenied />

  const renderView = () => {
    switch (activeAdminView) {
      case 'dashboard':
        return <AdminDashboard user={user} />
      case 'users':
        return <AdminUsers user={user} />
      case 'projects':
        return <AdminProjects user={user} />
      case 'activity':
        return <AdminActivity user={user} />
      case 'revenue':
        return <AdminRevenue user={user} />
      case 'analytics':
        return <AdminAnalytics user={user} />
      case 'settings':
        return <AdminSettings user={user} />
      case 'feedback':
        return <AdminFeedback user={user} />
      case 'chatlogs':
        return <AdminChatLogs user={user} />
      case 'waitlist':
        return <AdminWaitlist user={user} />
      default:
        return <AdminDashboard user={user} />
    }
  }

  return (
    <>
      <a href="#admin-content" className="skip-nav-link">Skip to main content</a>

      <div className="app-shell">
        <AdminSidebar
          activeView={activeAdminView}
          setActiveView={setActiveAdminView}
          user={user}
          onSignOut={onSignOut}
        />

        <div className="main-area">
          <AdminTopBar user={user} activeView={activeAdminView} />

          <div className="content-scroll" id="admin-content" tabIndex="-1">
            <div className="content-wrapper">
              <Suspense fallback={<LoadingScreen />}>
                <div className="view-enter">
                  {renderView()}
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
