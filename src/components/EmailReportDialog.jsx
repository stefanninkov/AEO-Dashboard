import { useState } from 'react'
import { X, Mail, Send, Copy, Check } from 'lucide-react'
import { generateEmailBody } from '../utils/generateReport'
import { useFocusTrap } from '../hooks/useFocusTrap'

export default function EmailReportDialog({ metrics, projectName, dateRange, onClose, isClosing, onExited }) {
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const trapRef = useFocusTrap(!isClosing)

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
            <p className="email-modal-subtitle">Send AEO metrics report via email</p>
          </div>
        </div>

        {/* Divider */}
        <div className="email-modal-divider" />

        {/* Body */}
        <div className="email-modal-body">
          {/* Email Input */}
          <div>
            <label className="email-modal-label">
              Recipient Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && email.trim() && handleSendEmail()}
              className="email-modal-input"
              autoFocus
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
            disabled={!email.trim()}
            className="email-modal-send-btn"
            style={{ flex: 1 }}
          >
            <Send size={14} />
            Open Email Client
          </button>
          <button onClick={onClose} className="email-modal-cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
