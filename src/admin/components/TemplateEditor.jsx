/**
 * TemplateEditor — Create/edit custom email templates.
 * Modal with name, description, audience, subject, body, custom fields.
 */
import { useState, useRef } from 'react'
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react'

const AUDIENCE_OPTIONS = [
  { value: 'hot', label: '\uD83D\uDD25 Hot', color: '#EF4444' },
  { value: 'warm', label: '\uD83D\uDFE1 Warm', color: '#F59E0B' },
  { value: 'cold', label: '\u26AA Cold', color: '#6B7280' },
  { value: 'abandoned', label: '\uD83D\uDCE9 Abandoned', color: '#8B5CF6' },
]

const AVAILABLE_VARIABLES = [
  '{name}', '{email}', '{score}', '{maxScore}', '{tierLabel}',
  '{weakestCategory}', '{websiteCount}', '{role}',
  '{priority1}', '{priority2}', '{priority3}', '{link}',
  '{customField1}', '{customField2}', '{customField3}',
]

export default function TemplateEditor({ isOpen, onClose, onSave, template = null }) {
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [audience, setAudience] = useState(template?.recommendedAudience || [])
  const [subject, setSubject] = useState(template?.subject || '')
  const [body, setBody] = useState(template?.body || '')
  const [customFields, setCustomFields] = useState(template?.customFields || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const bodyRef = useRef(null)
  const subjectRef = useRef(null)

  if (!isOpen) return null

  const toggleAudience = (val) => {
    setAudience(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const addCustomField = () => {
    const idx = customFields.length + 1
    setCustomFields(prev => [...prev, { id: `customField${idx}`, label: '', defaultValue: '' }])
  }

  const removeCustomField = (idx) => {
    setCustomFields(prev => prev.filter((_, i) => i !== idx))
  }

  const updateCustomField = (idx, field, value) => {
    setCustomFields(prev => prev.map((cf, i) => i === idx ? { ...cf, [field]: value } : cf))
  }

  const insertVariable = (variable, targetRef) => {
    const el = targetRef?.current
    if (!el) return
    const start = el.selectionStart || 0
    const end = el.selectionEnd || 0
    const setter = targetRef === bodyRef ? setBody : setSubject
    const current = targetRef === bodyRef ? body : subject
    setter(current.slice(0, start) + variable + current.slice(end))
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setError('Name, subject, and body are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave?.({
        ...(template?.id ? { id: template.id } : {}),
        name: name.trim(),
        description: description.trim(),
        recommendedAudience: audience,
        subject: subject.trim(),
        body: body.trim(),
        customFields: customFields.filter(cf => cf.label.trim()),
      })
      onClose?.()
    } catch (err) {
      setError('Failed to save template.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '36rem', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto',
        background: 'var(--bg-page)', borderRadius: '0.75rem',
        border: '0.0625rem solid var(--border-subtle)', zIndex: 301,
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {template?.id ? 'Edit Template' : 'Create Template'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>Template Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Monthly Newsletter"
              style={{
                display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem 0.75rem',
                border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description"
              style={{
                display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem 0.75rem',
                border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Audience */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>Recommended Audience</label>
            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              {AUDIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => toggleAudience(opt.value)}
                  style={{
                    padding: '0.25rem 0.625rem', borderRadius: 99, fontSize: '0.6875rem', fontWeight: 600,
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    background: audience.includes(opt.value) ? `${opt.color}20` : 'var(--hover-bg)',
                    color: audience.includes(opt.value) ? opt.color : 'var(--text-tertiary)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variable chips */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>Insert Variable (click to add to body)</label>
            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              {AVAILABLE_VARIABLES.map(v => (
                <button
                  key={v}
                  onClick={() => insertVariable(v, bodyRef)}
                  style={{
                    padding: '0.125rem 0.375rem', borderRadius: '0.25rem', fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)', border: '0.0625rem solid var(--border-subtle)',
                    background: 'var(--bg-card)', color: 'var(--accent)', cursor: 'pointer',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>Subject *</label>
            <input
              ref={subjectRef}
              type="text" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Email subject line with {variables}"
              style={{
                display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem 0.75rem',
                border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Body */}
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>Body *</label>
            <textarea
              ref={bodyRef}
              value={body} onChange={e => setBody(e.target.value)}
              placeholder="Email body with {variables}..."
              rows={10}
              style={{
                display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.625rem 0.75rem',
                border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8125rem',
                fontFamily: 'var(--font-body)', resize: 'vertical', lineHeight: 1.6,
              }}
            />
          </div>

          {/* Custom Fields */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>Custom Fields</label>
              <button onClick={addCustomField} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                background: 'none', border: 'none', fontSize: '0.6875rem', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                <Plus size={12} /> Add Field
              </button>
            </div>
            {customFields.map((cf, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', alignItems: 'center' }}>
                <input type="text" value={cf.label} onChange={e => updateCustomField(i, 'label', e.target.value)} placeholder="Field label"
                  style={{ flex: 1, padding: '0.375rem 0.5rem', border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}
                />
                <input type="text" value={cf.defaultValue} onChange={e => updateCustomField(i, 'defaultValue', e.target.value)} placeholder="Default value"
                  style={{ flex: 1, padding: '0.375rem 0.5rem', border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.375rem', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}
                />
                <button onClick={() => removeCustomField(i)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '0.25rem' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {error && <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', margin: 0 }}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem', borderTop: '0.0625rem solid var(--border-subtle)',
          display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
        }}>
          <button onClick={onClose} style={{
            padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '0.0625rem solid var(--border-subtle)',
            background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: '0.8125rem', fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer', fontFamily: 'var(--font-body)',
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {template?.id ? 'Update' : 'Create'} Template
          </button>
        </div>
      </div>
    </>
  )
}
