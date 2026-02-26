/**
 * LeadEmailComposer — Full email composer modal for waitlist leads.
 *
 * Template picker, editable subject/body, contact history, mailto send.
 * Adapted from NudgeEmailDialog pattern for waitlist-specific templates.
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Send, Check, Mail, ChevronDown, Clock, ExternalLink } from 'lucide-react'
import { EMAIL_TEMPLATES, fillTemplate, buildLeadVariables } from '../constants/emailTemplates'

/* Auto-pick template based on lead tier */
function suggestTemplateId(lead, preselectedId) {
  if (preselectedId) return preselectedId
  const tier = lead?.leadTier
  if (tier === 'hot') return 'hot_lead_outreach'
  if (tier === 'warm') return 'warm_lead_nurture'
  if (tier === 'cold') return 'cold_lead_educate'
  if (lead?.scorecard?.abandonedAtStep != null && !lead?.scorecard?.completed) return 'abandoned_quiz_nudge'
  return 'hot_lead_outreach'
}

function formatHistoryDate(val) {
  if (!val) return '—'
  const d = val.toDate ? val.toDate() : new Date(val)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function LeadEmailComposer({
  isOpen, onClose, lead, preselectedTemplateId = null,
  onLogContact, customTemplates = [],
}) {
  const [selectedId, setSelectedId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)

  // All available templates (pre-built + custom)
  const allTemplates = useMemo(() => {
    const prebuiltIds = new Set(EMAIL_TEMPLATES.map(t => t.id))
    const customOnly = (customTemplates || []).filter(t => !prebuiltIds.has(t.id))
    return [...EMAIL_TEMPLATES, ...customOnly]
  }, [customTemplates])

  // Lead variables for template resolution
  const vars = useMemo(() => {
    if (!lead) return {}
    return buildLeadVariables(lead)
  }, [lead])

  // Contact history from lead doc
  const contactHistory = lead?.contactHistory || []

  // Initialize on open
  useEffect(() => {
    if (isOpen && lead) {
      const id = suggestTemplateId(lead, preselectedTemplateId)
      setSelectedId(id)
      const template = allTemplates.find(t => t.id === id)
      if (template) {
        setSubject(fillTemplate(template.subject, vars))
        setBody(fillTemplate(template.body, vars))
      }
      setSent(false)
    }
  }, [isOpen, lead, preselectedTemplateId])

  // Update content when template changes
  const handleTemplateChange = useCallback((templateId) => {
    setSelectedId(templateId)
    const template = allTemplates.find(t => t.id === templateId)
    if (template) {
      setSubject(fillTemplate(template.subject, vars))
      setBody(fillTemplate(template.body, vars))
    }
  }, [allTemplates, vars])

  // Send via mailto + log
  const handleSend = useCallback(async () => {
    if (!lead?.email) return

    // Open mailto
    const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')

    // Log to Firestore
    const template = allTemplates.find(t => t.id === selectedId)
    await onLogContact?.(lead.id, {
      templateId: selectedId,
      templateName: template?.name || 'Custom',
      subject,
      sentBy: 'admin',
    })

    setSent(true)
    setTimeout(() => onClose?.(), 2000)
  }, [lead, subject, body, selectedId, allTemplates, onLogContact, onClose])

  if (!isOpen || !lead) return null

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300,
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '38rem', maxWidth: '95vw', maxHeight: '90vh',
        background: 'var(--bg-page)', borderRadius: '0.75rem',
        border: '0.0625rem solid var(--border-subtle)', zIndex: 301,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <Mail size={18} style={{ color: 'var(--accent)' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {preselectedTemplateId === 'beta_invite' ? 'Send Invite' : 'Send Email'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.125rem 0 0' }}>
              To: {lead.name || 'Lead'} ({lead.email})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Contact History */}
          {contactHistory.length > 0 && (
            <div style={{
              padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
              background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
            }}>
              <div style={{
                fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-disabled)',
                textTransform: 'uppercase', letterSpacing: '0.04rem', marginBottom: '0.375rem',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}>
                <Clock size={10} /> Previous Contact ({contactHistory.length})
              </div>
              {contactHistory.slice(-5).reverse().map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.6875rem', padding: '0.125rem 0',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-disabled)', width: '7rem', flexShrink: 0 }}>
                    {formatHistoryDate(c.sentAt)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.templateName || c.subject || '—'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Template selector */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>
              Template
            </label>
            <select
              value={selectedId}
              onChange={e => handleTemplateChange(e.target.value)}
              style={{
                display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem 0.75rem',
                border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem',
                fontFamily: 'var(--font-body)', cursor: 'pointer',
              }}
            >
              {allTemplates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.emoji || '✉️'} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>
              Subject
            </label>
            <input
              type="text" value={subject} onChange={e => setSubject(e.target.value)}
              style={{
                display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem 0.75rem',
                border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Body */}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>
              Message
            </label>
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              rows={12}
              style={{
                display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.625rem 0.75rem',
                border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem',
                fontFamily: 'var(--font-body)', resize: 'vertical', lineHeight: 1.6, outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem', borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem',
        }}>
          <button onClick={onClose} style={{
            padding: '0.5rem 1rem', borderRadius: '0.375rem',
            border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
            color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            Cancel
          </button>
          <button onClick={handleSend} disabled={sent || !subject.trim() || !body.trim()} style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.375rem', border: 'none',
            background: sent ? 'var(--color-success)' : 'var(--accent)', color: '#fff',
            fontSize: '0.8125rem', fontWeight: 600, cursor: sent ? 'default' : 'pointer',
            fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            opacity: (!subject.trim() || !body.trim()) ? 0.5 : 1,
          }}>
            {sent ? <><Check size={14} /> Sent!</> : <><Send size={14} /> Send via Email</>}
          </button>
        </div>
      </div>
    </>
  )
}
