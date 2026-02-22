/**
 * NudgeEmailDialog — Modal for sending re-engagement emails to users.
 *
 * Features:
 * - Template selector (auto-picks based on user context)
 * - Editable subject + body
 * - EmailJS integration for sending
 * - Nudge tracking (writes to Firestore user doc)
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Send, Loader2, Check, Mail, ChevronDown } from 'lucide-react'
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import logger from '../../utils/logger'
import { NUDGE_TEMPLATES, suggestTemplate, getTemplateById } from '../utils/nudgeTemplates'

export default function NudgeEmailDialog({ isOpen, onClose, targetUser, adminUser, context = {} }) {
  // context: { project, progress, phase, daysSinceActivity }
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  // Template variables
  const vars = useMemo(() => ({
    name: targetUser?.displayName || targetUser?.email?.split('@')[0] || 'there',
    email: targetUser?.email || '',
    project: context.project || '',
    progress: context.progress || 0,
    phase: context.phase || '',
    days: context.daysSinceActivity || '?',
    appUrl: window.location.origin + window.location.pathname + '?/app',
  }), [targetUser, context])

  // Auto-pick template on open
  useEffect(() => {
    if (isOpen && targetUser) {
      const suggested = suggestTemplate({
        hasProject: context.progress > 0 || !!context.project,
        progress: context.progress || 0,
        daysSinceActivity: context.daysSinceActivity || 30,
        phase: context.phase,
      })
      setSelectedTemplateId(suggested.id)
      setSubject(suggested.subject(vars))
      setBody(suggested.body(vars))
      setSent(false)
      setError(null)
    }
  }, [isOpen, targetUser])

  // Update content when template changes
  const handleTemplateChange = useCallback((templateId) => {
    setSelectedTemplateId(templateId)
    const template = getTemplateById(templateId)
    setSubject(template.subject(vars))
    setBody(template.body(vars))
  }, [vars])

  // Send email via EmailJS
  const handleSend = useCallback(async () => {
    if (!targetUser?.email) {
      setError('No email address for this user')
      return
    }

    setSending(true)
    setError(null)

    try {
      // Try EmailJS if configured
      const serviceId = localStorage.getItem('emailjs-service-id')
      const templateIdEmailJs = localStorage.getItem('emailjs-template-id')
      const publicKey = localStorage.getItem('emailjs-public-key')

      if (serviceId && templateIdEmailJs && publicKey) {
        const emailjsModule = '@emailjs/browser'
        const emailjs = await import(/* @vite-ignore */ emailjsModule)
        await emailjs.send(serviceId, templateIdEmailJs, {
          to_email: targetUser.email,
          to_name: vars.name,
          subject: subject,
          message: body,
          from_name: 'AEO Dashboard',
        }, publicKey)
      } else {
        // Fallback: open mailto link
        const mailtoUrl = `mailto:${targetUser.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        window.open(mailtoUrl, '_blank')
      }

      // Record nudge in Firestore
      if (targetUser?.uid) {
        try {
          const userRef = doc(db, 'users', targetUser.uid)
          await updateDoc(userRef, {
            nudgeHistory: arrayUnion({
              sentAt: new Date().toISOString(),
              type: selectedTemplateId,
              template: selectedTemplateId,
              sentBy: adminUser?.uid || 'admin',
              subject: subject,
            }),
            lastNudgedAt: new Date().toISOString(),
          })
        } catch (firestoreErr) {
          // Don't fail the nudge if Firestore write fails
          logger.warn('Failed to record nudge in Firestore:', firestoreErr)
        }
      }

      setSent(true)
      setTimeout(() => {
        onClose?.()
      }, 2000)
    } catch (err) {
      logger.error('Failed to send nudge:', err)
      setError(`Failed to send: ${err.message}`)
    } finally {
      setSending(false)
    }
  }, [targetUser, subject, body, selectedTemplateId, adminUser, vars, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div
        className="card"
        style={{
          width: '100%', maxWidth: '36rem', maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          animation: 'fadeIn 0.15s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1.25rem 1.5rem',
          borderBottom: '0.0625rem solid var(--border-subtle)',
        }}>
          <Mail size={18} style={{ color: 'var(--color-phase-1)' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.9375rem',
              fontWeight: 700, color: 'var(--text-primary)', margin: 0,
            }}>
              Send Nudge Email
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.125rem 0 0' }}>
              To: {targetUser?.displayName || 'User'} ({targetUser?.email || 'no email'})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', padding: '0.25rem',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflow: 'auto', padding: '1.25rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          {/* Template selector */}
          <div>
            <label style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
              display: 'block', marginBottom: '0.375rem',
            }}>
              Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              style={{
                width: '100%', padding: '0.5rem 0.75rem',
                background: 'var(--bg-input)', border: '0.0625rem solid var(--border-default)',
                borderRadius: '0.625rem', color: 'var(--text-primary)',
                fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
                cursor: 'pointer',
              }}
            >
              {NUDGE_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
              display: 'block', marginBottom: '0.375rem',
            }}>
              Subject
            </label>
            <input
              className="input-field"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              style={{ width: '100%' }}
            />
          </div>

          {/* Body */}
          <div style={{ flex: 1 }}>
            <label style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
              display: 'block', marginBottom: '0.375rem',
            }}>
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              style={{
                width: '100%', padding: '0.75rem',
                background: 'var(--bg-input)', border: '0.0625rem solid var(--border-default)',
                borderRadius: '0.625rem', color: 'var(--text-primary)',
                fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
                lineHeight: 1.6, resize: 'vertical', outline: 'none',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              background: 'rgba(239,68,68,0.08)', border: '0.0625rem solid rgba(239,68,68,0.15)',
              fontSize: '0.75rem', color: 'var(--color-error)',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '0.75rem', padding: '1rem 1.5rem',
          borderTop: '0.0625rem solid var(--border-subtle)',
        }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={sending}
            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={sending || sent || !subject.trim() || !body.trim()}
            style={{
              fontSize: '0.8125rem', padding: '0.5rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}
          >
            {sending ? (
              <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
            ) : sent ? (
              <><Check size={14} /> Sent!</>
            ) : (
              <><Send size={14} /> Send Nudge</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
