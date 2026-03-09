import { useState, memo } from 'react'
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, AlertCircle, Settings } from 'lucide-react'

/**
 * AiInsightCard — Displays an AI-generated insight for a view.
 *
 * Props:
 *   insight    — The AI-generated text (string | null)
 *   loading    — Whether the AI is currently generating
 *   error      — Error message if generation failed
 *   onRefresh  — Callback to regenerate the insight
 *   hasApiKey  — Whether an API key is configured
 *   onOpenSettings — Optional callback to navigate to settings
 *   compact    — If true, uses smaller padding for inline use
 */
function AiInsightCard({ insight, loading, error, onRefresh, hasApiKey, onOpenSettings, compact = false }) {
  const [collapsed, setCollapsed] = useState(false)

  // No API key configured — show setup prompt
  if (!hasApiKey) {
    return (
      <div
        className="fade-in-up"
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: compact ? 'var(--space-3)' : 'var(--space-4)',
          background: 'color-mix(in srgb, var(--color-phase-2) 5%, var(--bg-card))',
          border: '0.0625rem solid color-mix(in srgb, var(--color-phase-2) 15%, var(--border-subtle))',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{
          width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
          background: 'color-mix(in srgb, var(--color-phase-2) 12%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Sparkles size={14} style={{ color: 'var(--color-phase-2)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Add your API key in Settings to unlock AI-powered insights for this view.
          </p>
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="btn-ghost btn-sm"
            style={{ fontSize: 'var(--text-2xs)', flexShrink: 0 }}
          >
            <Settings size={12} />
            Setup
          </button>
        )}
      </div>
    )
  }

  // Error state
  if (error && !insight && !loading) {
    return (
      <div
        className="fade-in-up"
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: compact ? 'var(--space-3)' : 'var(--space-4)',
          background: 'color-mix(in srgb, var(--color-error) 5%, var(--bg-card))',
          border: '0.0625rem solid color-mix(in srgb, var(--color-error) 15%, var(--border-subtle))',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
        <p style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          Couldn't generate insight. {error.includes('API key') ? error : 'Try again later.'}
        </p>
        <button onClick={() => onRefresh?.(true)} className="btn-ghost btn-sm" style={{ fontSize: 'var(--text-2xs)', flexShrink: 0 }}>
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    )
  }

  // Loading state (no previous insight)
  if (loading && !insight) {
    return (
      <div
        className="fade-in-up"
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: compact ? 'var(--space-3)' : 'var(--space-4)',
          background: 'color-mix(in srgb, var(--color-phase-2) 5%, var(--bg-card))',
          border: '0.0625rem solid color-mix(in srgb, var(--color-phase-2) 15%, var(--border-subtle))',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div className="skeleton" style={{ width: '80%', height: '0.625rem', borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ width: '55%', height: '0.625rem', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>
    )
  }

  // No insight and not loading
  if (!insight) return null

  return (
    <div
      className="fade-in-up"
      style={{
        padding: compact ? 'var(--space-3)' : 'var(--space-4)',
        background: 'color-mix(in srgb, var(--color-phase-2) 5%, var(--bg-card))',
        border: '0.0625rem solid color-mix(in srgb, var(--color-phase-2) 15%, var(--border-subtle))',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        marginBottom: collapsed ? 0 : 'var(--space-2)',
      }}>
        <div style={{
          width: '1.5rem', height: '1.5rem', borderRadius: 'var(--radius-sm)',
          background: 'color-mix(in srgb, var(--color-phase-2) 12%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Sparkles size={12} style={{ color: 'var(--color-phase-2)' }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.04rem', color: 'var(--color-phase-2)',
          flex: 1,
        }}>
          AI Insight
        </span>
        <button
          onClick={() => onRefresh?.(true)}
          className="btn-icon-sm"
          title="Regenerate insight"
          disabled={loading}
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          <RefreshCw size={12} className={loading ? 'spin' : ''} />
        </button>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="btn-icon-sm"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <p style={{
          fontSize: 'var(--text-sm)', lineHeight: 1.6,
          color: 'var(--text-secondary)', margin: 0,
        }}>
          {insight}
        </p>
      )}
    </div>
  )
}

export default memo(AiInsightCard)
