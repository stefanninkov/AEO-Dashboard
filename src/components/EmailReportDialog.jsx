import { useState } from 'react'
import { X, Mail, Send, Copy, Check, Loader2 } from 'lucide-react'
import { generateEmailBody } from '../utils/generateReport'
import { sendEmail, isEmailConfigured } from '../utils/emailService'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useToast } from './Toast'

export default function EmailReportDialog({ metrics, projectName, dateRange, onClose, isClosing, onExited }) {
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const trapRef = useFocusTrap(!isClosing)
  const { addToast } = useToast()

  const body = generateEmailBody(metrics, projectName, dateRange)
  const subject = `AEO Metrics Report - ${projectName}`

  const emailConfigured = isEmailConfigured()

  const handleSendEmail = async () => {
    if (!email.trim()) return

    if (!emailConfigured) {
      // Fallback to mailto if EmailJS is not configured
      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailtoUrl, '_blank')
      addToast('info', 'Opened email client — configure EmailJS in Settings for direct send')
      return
    }

    setSending(true)
    try {
      await sendEmail(email.trim(), subject, body)
      addToast('success', `Report sent to ${email.trim()}`)
      onClose()
    } catch (err) {
      addToast('error', err.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
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
    <div className="email-modal-backdrop" onClick={onClose}>
      {/* Backdrop */}
      <div
        className="email-modal-overlay"
        style={{
          animation: isClosing
            ? 'backdrop-fade-out 200ms ease-out forwards'
            : 'backdrop-fade-in 200ms ease-out both',
        }}
      />

      {/* Dialog */}
      <div
        ref={trapRef}
        className="email-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-report-title"
        onClick={e => e.stopPropagation()}
        style={{
          animation: isClosing
            ? 'dialog-scale-out 200ms ease-out forwards'
            : 'dialog-scale-in 250ms ease-out both',
        }}
        onAnimationEnd={() => isClosing && onExited?.()}
      >
        {/* Close button */}
        <button className="email-modal-close" onClick={onClose} aria-label="Close email dialog">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="email-modal-header">
          <div className="email-modal-header-icon">
            <Mail size={16} className="text-phase-1" />
          </div>
          <div className="email-modal-header-text">
            <h3 id="email-report-title" className="email-modal-title">Email Report</h3>
            <p className="email-modal-subtitle">
              {emailConfigured
                ? 'Send AEO metrics report directly via email'
                : 'Send AEO metrics report via email'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="email-modal-divider" />

        {/* Body */}
        <div className="email-modal-body">
          {/* EmailJS status hint */}
          {!emailConfigured && (
            <div style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(255,107,53,0.08)',
              border: '1px solid rgba(255,107,53,0.2)',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--color-phase-1)',
              lineHeight: 1.5,
            }}>
              💡 Configure EmailJS in Settings to send emails directly from the app. Currently using mail client fallback.
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="recipient-email" className="email-modal-label">
              Recipient Email
            </label>
            <input
              id="recipient-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && email.trim() && !sending && handleSendEmail()}
              className="email-modal-input"
              autoFocus
              disabled={sending}
            />
          </div>

          {/* Preview */}
          <div>
            <div className="email-modal-preview-header">
              <label className="email-modal-label">
                Report Preview
              </label>
              <button onClick={handleCopyBody} className="email-modal-copy-btn">
                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="email-modal-preview-box">
              <pre className="email-modal-preview-text">
                {body}
              </pre>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="email-modal-actions">
          <button
            onClick={handleSendEmail}
            disabled={!email.trim() || sending}
            className="email-modal-send-btn"
            style={{ flex: 1 }}
          >
            {sending
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={14} />
            }
            {sending ? 'Sending…' : emailConfigured ? 'Send Email' : 'Open Email Client'}
          </button>
          <button onClick={onClose} className="email-modal-cancel-btn" disabled={sending}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
