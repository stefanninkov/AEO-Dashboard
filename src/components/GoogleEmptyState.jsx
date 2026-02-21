/**
 * GoogleEmptyState — Shared empty/disconnected state components
 * for Google integration views (GSC, GA4, AEO Impact).
 *
 * Provides:
 *  - NotConnectedState — Google account not linked
 *  - NoPropertyState — Account linked but no property selected
 *  - TokenExpiredBanner — Inline warning when access token expires
 *  - DataErrorBanner — Generic error banner with optional reconnect
 *  - SetupRequiredState — Multi-service check (e.g. AEO Impact needs both GSC + GA4)
 */

import { Globe, Search, Zap, BarChart3, Layers, Settings, AlertCircle, RefreshCw } from 'lucide-react'

/* ── Icon presets by view ── */
const ICON_PRESETS = {
  gsc: { Icon: Globe, color: '#3B82F6' },
  ga4: { Icon: BarChart3, color: '#10B981' },
  'aeo-impact': { Icon: Layers, color: '#8B5CF6' },
  search: { Icon: Search, color: '#FF6B35' },
  default: { Icon: Globe, color: '#3B82F6' },
}

/**
 * NotConnectedState — Shown when Google account is not connected
 */
export function NotConnectedState({ setActiveView, preset = 'default', title, description }) {
  const { Icon, color } = ICON_PRESETS[preset] || ICON_PRESETS.default
  return (
    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
          {title || 'Connect Google Account'}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '28rem' }}>
          {description || 'Connect your Google account in Settings to access real data from Google Search Console and Google Analytics.'}
        </p>
      </div>
      <button className="btn-primary" style={{ fontSize: '0.8125rem' }} onClick={() => setActiveView('settings')}>
        <Settings size={14} />
        Go to Settings
      </button>
    </div>
  )
}

/**
 * NoPropertyState — Shown when Google is connected but no property selected
 */
export function NoPropertyState({ setActiveView, preset = 'search', title, description }) {
  const { Icon, color } = ICON_PRESETS[preset] || ICON_PRESETS.search
  return (
    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
          {title || 'Select a Property'}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '28rem' }}>
          {description || 'Your Google account is connected. Select a property in the project settings to start viewing data.'}
        </p>
      </div>
      <button className="btn-primary" style={{ fontSize: '0.8125rem' }} onClick={() => setActiveView('settings')}>
        <Settings size={14} />
        Select Property
      </button>
    </div>
  )
}

/**
 * SetupRequiredState — Multi-service check (AEO Impact)
 */
export function SetupRequiredState({ setActiveView, checks = [] }) {
  return (
    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Layers size={24} style={{ color: '#8B5CF6' }} />
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
          Setup Required
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '28rem' }}>
          This view needs multiple data sources connected. Check the status below:
        </p>
        {checks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.75rem', textAlign: 'left', maxWidth: '20rem', margin: '0.75rem auto 0' }}>
            {checks.map((check, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div style={{
                  width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                  background: check.ok ? 'var(--color-success)' : 'var(--color-error)', flexShrink: 0,
                }} />
                <span style={{ color: check.ok ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className="btn-primary" style={{ fontSize: '0.8125rem' }} onClick={() => setActiveView('settings')}>
        <Settings size={14} />
        Go to Settings
      </button>
    </div>
  )
}

/**
 * TokenExpiredBanner — Inline banner when Google token expires mid-session
 */
export function TokenExpiredBanner({ onReconnect, reconnecting, setActiveView }) {
  return (
    <div className="card" style={{
      padding: '0.75rem 1rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: 'rgba(245,158,11,0.06)',
      border: '0.0625rem solid rgba(245,158,11,0.2)',
      flexWrap: 'wrap',
    }}>
      <AlertCircle size={14} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)', flex: 1 }}>
        Google token expired. Reconnect to continue viewing live data.
      </span>
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        {onReconnect && (
          <button
            className="btn-primary"
            style={{ fontSize: '0.6875rem', padding: '0.3125rem 0.625rem' }}
            onClick={onReconnect}
            disabled={reconnecting}
          >
            <RefreshCw size={12} />
            {reconnecting ? 'Reconnecting...' : 'Reconnect'}
          </button>
        )}
        <button
          className="btn-secondary"
          style={{ fontSize: '0.6875rem', padding: '0.3125rem 0.625rem' }}
          onClick={() => setActiveView('settings')}
        >
          <Settings size={12} />
          Settings
        </button>
      </div>
    </div>
  )
}

/**
 * DataErrorBanner — Generic error banner for data fetch failures
 */
export function DataErrorBanner({ error, onRetry, retrying }) {
  const isTokenError = error?.toLowerCase().includes('token expired') || error?.toLowerCase().includes('reconnect')
  return (
    <div className="card" style={{
      padding: '0.75rem 1rem',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      background: isTokenError ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)',
      border: `0.0625rem solid ${isTokenError ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}`,
      flexWrap: 'wrap',
    }}>
      <AlertCircle size={14} style={{ color: isTokenError ? 'var(--color-warning)' : 'var(--color-error)', flexShrink: 0 }} />
      <span style={{ fontSize: '0.8125rem', color: isTokenError ? 'var(--color-warning)' : 'var(--color-error)', flex: 1 }}>
        {error}
      </span>
      {onRetry && (
        <button
          className="btn-secondary"
          style={{ fontSize: '0.6875rem', padding: '0.3125rem 0.625rem' }}
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  )
}

/**
 * LoadingState — Full-card loading placeholder
 */
export function LoadingState({ message = 'Loading data...' }) {
  return (
    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
      <div style={{
        width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--hover-bg)',
        borderTopColor: 'var(--color-phase-1)', borderRadius: '50%',
        animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem',
      }} />
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{message}</p>
    </div>
  )
}

/**
 * NoDataState — When data loads successfully but is empty
 */
export function NoDataState({ icon: Icon = Search, title, description, color = 'var(--text-tertiary)' }) {
  return (
    <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <Icon size={24} style={{ color, opacity: 0.5 }} />
      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {title || 'No data yet'}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '24rem' }}>
          {description || 'Data will appear here once enough information is collected.'}
        </p>
      </div>
    </div>
  )
}
