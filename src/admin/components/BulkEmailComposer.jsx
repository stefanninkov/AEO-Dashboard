/**
 * BulkEmailComposer — 3-step modal: Choose Template → Customize → Preview & Export.
 */
import { useState, useMemo, useRef } from 'react'
import { X, ArrowLeft, ArrowRight, Copy, Download, Check, AlertTriangle, ChevronDown } from 'lucide-react'
import { EMAIL_TEMPLATES, fillTemplate, buildLeadVariables, getTemplatesForAudience } from '../constants/emailTemplates'

const STEPS = ['Choose Template', 'Customize', 'Preview & Export']

const AVAILABLE_VARIABLES = [
  '{name}', '{email}', '{score}', '{maxScore}', '{tierLabel}',
  '{weakestCategory}', '{websiteCount}', '{role}',
  '{priority1}', '{priority2}', '{priority3}', '{link}',
  '{customField1}', '{customField2}', '{customField3}',
]

export default function BulkEmailComposer({
  isOpen, onClose, leads = [], audienceLabel = '',
  customTemplates = [], onSaveCustom, onLogExport, onGenerateCsv,
}) {
  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [customOverrides, setCustomOverrides] = useState({})
  const [previewLeadId, setPreviewLeadId] = useState('')
  const [copied, setCopied] = useState(null)
  const [templateTab, setTemplateTab] = useState('prebuilt') // 'prebuilt' | 'custom'
  const bodyRef = useRef(null)

  if (!isOpen) return null

  const previewLead = leads.find(l => l.id === previewLeadId) || leads[0]
  const previewVars = previewLead ? buildLeadVariables(previewLead, customOverrides) : {}
  const filledSubject = fillTemplate(subject, previewVars)
  const filledBody = fillTemplate(body, previewVars)

  // Smart sort: matching audience first
  const sortedTemplates = useMemo(() => {
    const audience = audienceLabel.toLowerCase()
    return [...EMAIL_TEMPLATES].sort((a, b) => {
      const aMatch = a.recommendedAudience.includes(audience)
      const bMatch = b.recommendedAudience.includes(audience)
      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      return 0
    })
  }, [audienceLabel])

  const selectTemplate = (t) => {
    setSelectedTemplate(t)
    setSubject(t.subject)
    setBody(t.body)
    // Initialize custom field overrides
    const overrides = {}
    ;(t.customFields || []).forEach(cf => { overrides[cf.id] = cf.defaultValue || '' })
    setCustomOverrides(overrides)
    setStep(1)
  }

  const insertVariable = (variable) => {
    const el = bodyRef?.current
    if (!el) return
    const start = el.selectionStart || 0
    const end = el.selectionEnd || 0
    setBody(body.slice(0, start) + variable + body.slice(end))
    setTimeout(() => { el.focus(); el.setSelectionRange(start + variable.length, start + variable.length) }, 0)
  }

  const copyEmails = () => {
    const emails = leads.map(l => l.email).filter(Boolean).join(', ')
    navigator.clipboard.writeText(emails)
    setCopied('emails')
    onLogExport?.({ templateId: selectedTemplate?.id, templateName: selectedTemplate?.name || 'Custom', audience: audienceLabel, recipientCount: leads.length, recipientEmails: leads.map(l => l.email), exportMethod: 'copy_emails' })
    setTimeout(() => setCopied(null), 2000)
  }

  const exportCsv = () => {
    const csv = onGenerateCsv?.(leads, { subject, body }, customOverrides)
    if (!csv) return
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-email-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onLogExport?.({ templateId: selectedTemplate?.id, templateName: selectedTemplate?.name || 'Custom', audience: audienceLabel, recipientCount: leads.length, exportMethod: 'personalized_csv' })
    setCopied('csv')
    setTimeout(() => setCopied(null), 2000)
  }

  const copyGeneric = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
    setCopied('generic')
    onLogExport?.({ templateId: selectedTemplate?.id, templateName: selectedTemplate?.name || 'Custom', audience: audienceLabel, recipientCount: leads.length, exportMethod: 'copy_generic' })
    setTimeout(() => setCopied(null), 2000)
  }

  const saveAsCustom = async () => {
    await onSaveCustom?.({
      name: `${selectedTemplate?.name || 'Custom'} (Saved)`,
      description: '',
      recommendedAudience: selectedTemplate?.recommendedAudience || [],
      subject,
      body,
      customFields: selectedTemplate?.customFields || [],
    })
    setCopied('saved')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '42rem', maxWidth: '95vw', maxHeight: '85vh',
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
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Bulk Email — {leads.length} {audienceLabel || 'leads'}
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.375rem' }}>
              {STEPS.map((s, i) => (
                <span key={i} style={{
                  fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                  color: i === step ? 'var(--accent)' : i < step ? 'var(--color-success)' : 'var(--text-disabled)',
                  textTransform: 'uppercase',
                }}>
                  {i + 1}. {s}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>

          {/* ── Step 0: Choose Template ── */}
          {step === 0 && (
            <div>
              <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem' }}>
                {['prebuilt', 'custom'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTemplateTab(tab)}
                    style={{
                      padding: '0.375rem 0.75rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                      background: templateTab === tab ? 'var(--accent)' : 'var(--hover-bg)',
                      color: templateTab === tab ? '#fff' : 'var(--text-tertiary)',
                    }}
                  >
                    {tab === 'prebuilt' ? 'Pre-built Templates' : `My Templates (${customTemplates.length})`}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(templateTab === 'prebuilt' ? sortedTemplates : customTemplates).map(t => {
                  const isMatch = audienceLabel && t.recommendedAudience?.includes(audienceLabel.toLowerCase())
                  return (
                    <div
                      key={t.id}
                      onClick={() => selectTemplate(t)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1rem', borderRadius: '0.5rem',
                        border: `0.0625rem solid ${isMatch ? 'var(--accent)' : 'var(--border-subtle)'}`,
                        background: isMatch ? 'color-mix(in srgb, var(--accent) 4%, transparent)' : 'var(--bg-card)',
                        cursor: 'pointer', transition: 'border-color 150ms',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{t.emoji || '\u2709\uFE0F'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{t.description}</div>
                      </div>
                      {isMatch && (
                        <span style={{ fontSize: '0.5625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: 99, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                          Recommended
                        </span>
                      )}
                    </div>
                  )
                })}
                {templateTab === 'custom' && customTemplates.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem', padding: '2rem' }}>
                    No custom templates yet. Select a pre-built template and save it.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 1: Customize ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  style={{
                    display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem 0.75rem',
                    border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                    background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Body</label>
                <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)} rows={12}
                  style={{
                    display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.625rem 0.75rem',
                    border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                    background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem',
                    fontFamily: 'var(--font-body)', resize: 'vertical', lineHeight: 1.6,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Insert Variable</label>
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  {AVAILABLE_VARIABLES.map(v => (
                    <button key={v} onClick={() => insertVariable(v)} style={{
                      padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)', border: '0.0625rem solid var(--border-subtle)',
                      background: 'var(--bg-card)', color: 'var(--accent)', cursor: 'pointer',
                    }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom fields */}
              {selectedTemplate?.customFields?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Custom Fields</label>
                  {selectedTemplate.customFields.map(cf => (
                    <div key={cf.id}>
                      <label style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>{cf.label}</label>
                      <input type="text" value={customOverrides[cf.id] || ''} onChange={e => setCustomOverrides(prev => ({ ...prev, [cf.id]: e.target.value }))}
                        style={{
                          display: 'block', width: '100%', padding: '0.375rem 0.5rem',
                          border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                          background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button onClick={saveAsCustom} style={{
                alignSelf: 'flex-start', padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
                border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                {copied === 'saved' ? '\u2713 Saved!' : 'Save as My Template'}
              </button>
            </div>
          )}

          {/* ── Step 2: Preview & Export ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Lead picker */}
              {leads.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Preview for:</label>
                  <select value={previewLeadId || leads[0]?.id || ''} onChange={e => setPreviewLeadId(e.target.value)}
                    style={{
                      display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.375rem 0.5rem',
                      border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                      background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
                    }}
                  >
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name || l.email}</option>)}
                  </select>
                </div>
              )}

              {/* Preview */}
              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '0.0625rem solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Subject</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{filledSubject}</div>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Body</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{filledBody}</div>
              </div>

              {/* Export buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button onClick={copyEmails} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
                  borderRadius: '0.5rem', border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', width: '100%',
                }}>
                  {copied === 'emails' ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} style={{ color: 'var(--accent)' }} />}
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {copied === 'emails' ? 'Copied!' : 'Copy All Email Addresses'}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Comma-separated for Gmail BCC</div>
                  </div>
                </button>

                <button onClick={exportCsv} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
                  borderRadius: '0.5rem', border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', width: '100%',
                }}>
                  {copied === 'csv' ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Download size={16} style={{ color: 'var(--accent)' }} />}
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {copied === 'csv' ? 'Downloaded!' : 'Export Personalized CSV'}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Per-lead rows with filled Subject + Body for Mailchimp/Resend</div>
                  </div>
                </button>

                <button onClick={copyGeneric} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
                  borderRadius: '0.5rem', border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', width: '100%',
                }}>
                  {copied === 'generic' ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} style={{ color: 'var(--text-secondary)' }} />}
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {copied === 'generic' ? 'Copied!' : 'Copy Generic Template'}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Template with {'{variables}'} intact for email tool editors</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div style={{
          padding: '0.75rem 1.25rem', borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
              border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            <ArrowLeft size={14} /> {step > 0 ? 'Back' : 'Cancel'}
          </button>
          {step < 2 && step > 0 && (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem', borderRadius: '0.375rem',
                border: 'none', background: 'var(--accent)', color: '#fff',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              Next <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
