import { useState } from 'react'
import { X, Mail, Send, Copy, Check } from 'lucide-react'
import { generateEmailBody } from '../utils/generateReport'

export default function EmailReportDialog({ metrics, projectName, dateRange, onClose, isClosing, onExited }) {
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)

  const body = generateEmailBody(metrics, projectName, dateRange)
  const subject = `AEO Metrics Report - ${projectName}`

  const handleSendEmail = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')
  }

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(body)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = body
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 'var(--z-modal-backdrop)' }} onClick={onClose}>
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
        className="relative w-full max-w-lg rounded-xl overflow-hidden"
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
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded-lg bg-phase-1/15 flex items-center justify-center flex-shrink-0">
            <Mail size={16} className="text-phase-1" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-sm font-bold">Email Report</h3>
            <p className="text-xs text-text-tertiary">Send AEO metrics report via email</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary transition-all flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Email Input */}
          <div>
            <label className="text-xs font-heading font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
              Recipient Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && email.trim() && handleSendEmail()}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-phase-1 focus:ring-2 focus:ring-phase-1/20 transition-all duration-200"
              style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)' }}
              autoFocus
            />
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-heading font-semibold text-text-tertiary uppercase tracking-wider">
                Report Preview
              </label>
              <button
                onClick={handleCopyBody}
                className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="rounded-xl p-4 max-h-48 overflow-y-auto" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-subtle)' }}>
              <pre className="text-xs text-text-secondary font-body whitespace-pre-wrap leading-relaxed">
                {body}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={handleSendEmail}
            disabled={!email.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-phase-1 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={14} />
            Open Email Client
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-text-secondary rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
