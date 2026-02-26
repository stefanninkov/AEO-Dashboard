/**
 * EmailTemplateModal — View a single template with variable auto-fill from a lead.
 * Copy buttons for subject, body, or both.
 */
import { useState, useMemo } from 'react'
import { X, Copy, Check, ChevronDown, Mail } from 'lucide-react'
import { fillTemplate, buildLeadVariables } from '../constants/emailTemplates'

export default function EmailTemplateModal({ isOpen, onClose, template, leads = [] }) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '')
  const [copiedField, setCopiedField] = useState(null)
  const [customOverrides, setCustomOverrides] = useState({})

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0]

  const variables = useMemo(() => {
    if (!selectedLead) return {}
    return buildLeadVariables(selectedLead, customOverrides)
  }, [selectedLead, customOverrides])

  const filledSubject = template ? fillTemplate(template.subject, variables) : ''
  const filledBody = template ? fillTemplate(template.body, variables) : ''

  if (!isOpen || !template) return null

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300,
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '38rem', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto',
        background: 'var(--bg-page)', borderRadius: '0.75rem',
        border: '0.0625rem solid var(--border-subtle)', zIndex: 301,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {template.icon ? <template.icon size={16} style={{ color: 'var(--accent)' }} /> : <Mail size={16} style={{ color: 'var(--accent)' }} />}
              {template.name}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {template.description}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Lead picker */}
        {leads.length > 0 && (
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>
              Preview for:
            </label>
            <select
              value={selectedLeadId}
              onChange={e => setSelectedLeadId(e.target.value)}
              style={{
                display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.375rem 0.5rem',
                border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem',
                fontFamily: 'var(--font-body)',
              }}
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.name || l.email} ({l.email})</option>
              ))}
            </select>
          </div>
        )}

        {/* Custom fields */}
        {template.customFields?.length > 0 && (
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {template.customFields.map(cf => (
              <div key={cf.id}>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>{cf.label}</label>
                <input
                  type="text"
                  value={customOverrides[cf.id] || cf.defaultValue || ''}
                  onChange={e => setCustomOverrides(prev => ({ ...prev, [cf.id]: e.target.value }))}
                  style={{
                    display: 'block', width: '100%', marginTop: '0.125rem', padding: '0.375rem 0.5rem',
                    border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                    background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Preview */}
        <div style={{ padding: '1.25rem', flex: 1 }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Subject</span>
              <button onClick={() => copyToClipboard(filledSubject, 'subject')} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                background: 'none', border: 'none', fontSize: '0.625rem', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                {copiedField === 'subject' ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
              </button>
            </div>
            <div style={{
              padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: '0.375rem',
              border: '0.0625rem solid var(--border-subtle)', fontSize: '0.8125rem', fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              {filledSubject}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Body</span>
              <button onClick={() => copyToClipboard(filledBody, 'body')} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                background: 'none', border: 'none', fontSize: '0.625rem', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                {copiedField === 'body' ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
              </button>
            </div>
            <div style={{
              padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '0.375rem',
              border: '0.0625rem solid var(--border-subtle)', fontSize: '0.8125rem',
              color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6,
            }}>
              {filledBody}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem', borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
        }}>
          <button
            onClick={() => copyToClipboard(`Subject: ${filledSubject}\n\n${filledBody}`, 'both')}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.375rem',
              background: 'var(--accent)', color: '#fff', border: 'none',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            }}
          >
            {copiedField === 'both' ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy All</>}
          </button>
        </div>
      </div>
    </>
  )
}
