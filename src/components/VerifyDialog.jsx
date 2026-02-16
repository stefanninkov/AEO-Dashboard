import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Zap, CheckCircle2, MinusCircle, XCircle,
  Loader2, AlertCircle, ShieldCheck, UserCheck
} from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'

export default function VerifyDialog({ item, projectUrl, onVerified, onCancel, isClosing, onExited }) {
  const [mode, setMode] = useState(null) // null | 'ai' | 'manual'
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [error, setError] = useState(null)
  const trapRef = useFocusTrap(!!item && !isClosing)

  if (!item && !isClosing) return null

  const startAiVerification = async () => {
    setMode('ai')
    setLoading(true)
    setError(null)

    const apiKey = localStorage.getItem('anthropic-api-key')
    if (!apiKey) {
      setError('No Anthropic API key found. Please set it in the Analyzer tab first.')
      setLoading(false)
      return
    }

    try {
      const { callAnthropicApi } = await import('../utils/apiClient')
      const data = await callAnthropicApi({
        apiKey,
        maxTokens: 1500,
        messages: [{
          role: 'user',
          content: `Check if the website ${projectUrl} has implemented the following AEO checklist item:

"${item.text}"

Details: ${item.detail}

Search for and visit this website, then evaluate whether this specific item has been implemented. Return ONLY valid JSON:
{
  "status": "pass" or "fail" or "partial",
  "note": "Brief explanation of what you found (1-2 sentences)"
}`
        }],
        extraBody: {
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        },
      })
      if (data.error) throw new Error(data.error.message)

      const textContent = data.content
        ?.filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n') || ''

      const clean = textContent.replace(/```json\s?|```/g, '').trim()
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setAiResult(JSON.parse(jsonMatch[0]))
      } else {
        setError('Could not parse verification result.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = (method) => {
    const verification = {
      status: method === 'manual' ? 'pass' : aiResult.status,
      note: method === 'manual' ? 'Manually verified by user' : aiResult.note,
      checkedAt: new Date().toISOString(),
      method,
    }
    onVerified(verification)
  }

  const statusConfig = {
    pass: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Verified — Pass' },
    partial: { icon: MinusCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'Partially Implemented' },
    fail: { icon: XCircle, color: 'text-error', bg: 'bg-error/10', label: 'Not Found' },
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 'var(--z-modal-backdrop)' }} onClick={onCancel}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--backdrop-color)',
          animation: isClosing
            ? 'backdrop-fade-out 200ms ease-out forwards'
            : 'backdrop-fade-in 200ms ease-out both',
        }}
      />

      {/* Dialog */}
      <div
        ref={trapRef}
        className="relative w-full max-w-lg rounded-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-dialog-title"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          zIndex: 'var(--z-modal)',
          boxShadow: 'var(--shadow-lg)',
          animation: isClosing
            ? 'dialog-scale-out 200ms ease-out forwards'
            : 'dialog-scale-in 250ms ease-out both',
        }}
        onAnimationEnd={() => isClosing && onExited?.()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-start gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded-lg bg-phase-3/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck size={16} className="text-phase-3" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="verify-dialog-title" className="font-heading text-sm font-bold">Verify Before Marking Done</h3>
            <p className="text-sm text-text-primary mt-1">{item?.text}</p>
            <p className="text-xs text-text-tertiary mt-1">{item?.detail}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary transition-all flex-shrink-0"
            aria-label="Close verification dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Mode Selection */}
          {!mode && !error && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">How would you like to verify this task?</p>

              {/* AI Verify */}
              <button
                onClick={startAiVerification}
                disabled={!projectUrl}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:border-phase-3 hover:bg-phase-3/5 transition-all duration-150 text-left group disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-phase-3/15 flex items-center justify-center flex-shrink-0 group-hover:bg-phase-3/25 transition-colors">
                  <Zap size={18} className="text-phase-3" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">AI Verify</p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {projectUrl
                      ? `Checks ${projectUrl} for this implementation`
                      : 'Requires a project URL — set it in the project settings'}
                  </p>
                </div>
                {projectUrl && <span className="text-xs px-2 py-0.5 rounded-full bg-phase-3/15 text-phase-3 font-medium">Recommended</span>}
              </button>

              {/* Manual Verify */}
              <button
                onClick={() => setMode('manual')}
                className="w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-150 text-left group"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: 'var(--hover-bg)' }}>
                  <UserCheck size={18} className="text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">Skip Verification</p>
                  <p className="text-xs text-text-tertiary mt-0.5">I've verified this myself on the website</p>
                </div>
              </button>
            </div>
          )}

          {/* AI Loading */}
          {mode === 'ai' && loading && (
            <div className="flex flex-col items-center py-6 fade-in-up">
              <Loader2 size={28} className="text-phase-3 animate-spin mb-3" />
              <p className="text-sm text-text-secondary">Checking <span className="text-text-primary font-medium">{projectUrl}</span></p>
              <p className="text-xs text-text-tertiary mt-1">This may take 15-30 seconds...</p>
            </div>
          )}

          {/* AI Result */}
          {mode === 'ai' && aiResult && !loading && (
            <div className="space-y-4 fade-in-up">
              {(() => {
                const config = statusConfig[aiResult.status] || statusConfig.fail
                const StatusIcon = config.icon
                return (
                  <div className={`flex items-start gap-3 p-4 rounded-xl ${config.bg}`}>
                    <StatusIcon size={18} className={`${config.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
                      <p className="text-xs text-text-secondary mt-1">{aiResult.note}</p>
                    </div>
                  </div>
                )
              })()}

              <div className="flex gap-2">
                {aiResult.status !== 'fail' ? (
                  <button
                    onClick={() => handleConfirm('ai')}
                    className="flex-1 px-4 py-2.5 bg-phase-3 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                  >
                    Mark as Done
                  </button>
                ) : (
                  <button
                    onClick={() => handleConfirm('ai')}
                    className="flex-1 px-4 py-2.5 text-text-secondary rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150"
                    style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)' }}
                  >
                    Mark Done Anyway
                  </button>
                )}
                <button
                  onClick={onCancel}
                  className="px-4 py-2.5 text-text-secondary rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150"
                  style={{ border: '1px solid var(--border-subtle)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Manual Confirmation */}
          {mode === 'manual' && (
            <div className="space-y-4 fade-in-up">
              <div className="p-4 rounded-xl" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-sm text-text-secondary">
                  By confirming, you acknowledge that you have manually verified this item is implemented on your website.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirm('manual')}
                  className="flex-1 px-4 py-2.5 bg-phase-3 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                >
                  Confirm & Mark Done
                </button>
                <button
                  onClick={() => setMode(null)}
                  className="px-4 py-2.5 text-text-secondary rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150"
                  style={{ border: '1px solid var(--border-subtle)' }}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="space-y-4 fade-in-up">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-error/10">
                <AlertCircle size={16} className="text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-error">Verification Error</p>
                  <p className="text-xs text-text-secondary mt-1">{error}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setError(null); setMode(null); setAiResult(null) }}
                  className="flex-1 px-4 py-2.5 text-text-primary rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150"
                  style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)' }}
                >
                  Try Again
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2.5 text-text-secondary rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150"
                  style={{ border: '1px solid var(--border-subtle)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
