/**
 * TemplateManager — Lists pre-built and custom templates.
 * Pre-built: Preview + Duplicate as My Template.
 * Custom: Edit + Duplicate + Delete.
 */
import { useState, useMemo } from 'react'
import { Eye, Copy, Edit3, Trash2, Plus, Mail, RotateCcw } from 'lucide-react'
import { EMAIL_TEMPLATES, TEMPLATE_GROUPS } from '../constants/emailTemplates'
import EmailTemplateModal from './EmailTemplateModal'
import TemplateEditor from './TemplateEditor'

export default function TemplateManager({
  customTemplates = [], leads = [],
  onSaveCustom, onDeleteCustom, onDuplicate,
}) {
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [editTemplate, setEditTemplate] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  // Build a map of custom overrides keyed by id (includes pre-built overrides)
  const overrideMap = useMemo(() => {
    const map = new Map()
    customTemplates.forEach(t => map.set(t.id, t))
    return map
  }, [customTemplates])

  // Custom templates that are NOT overrides of pre-builts
  const prebuiltIds = new Set(EMAIL_TEMPLATES.map(t => t.id))
  const pureCustomTemplates = customTemplates.filter(t => !prebuiltIds.has(t.id))

  const handleDelete = async (template) => {
    if (!window.confirm(`Delete "${template.name}"?`)) return
    await onDeleteCustom?.(template.id)
  }

  const handleResetToDefault = async (templateId) => {
    if (!window.confirm('Reset to default? Your edits will be lost.')) return
    await onDeleteCustom?.(templateId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Pre-built Templates ── */}
      {TEMPLATE_GROUPS.map(group => (
        <div key={group.label}>
          <h4 style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem',
            margin: '0 0 0.5rem',
          }}>
            {group.label}
          </h4>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '0.75rem',
          }}>
            {group.ids.map(id => {
              const original = EMAIL_TEMPLATES.find(tpl => tpl.id === id)
              if (!original) return null
              const override = overrideMap.get(id)
              const t = override || original
              const isEdited = !!override
              return (
                <div key={t.id} className="card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ fontSize: '1rem' }}>{original.emoji}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{t.name}</span>
                    {isEdited && (
                      <span style={{
                        fontSize: '0.5rem', fontWeight: 700, padding: '0.0625rem 0.25rem', borderRadius: 99,
                        background: 'rgba(59,130,246,0.1)', color: '#3B82F6', textTransform: 'uppercase',
                      }}>
                        Edited
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
                    {(t.recommendedAudience || original.recommendedAudience).map(a => (
                      <span key={a} style={{
                        fontSize: '0.5625rem', fontWeight: 600, padding: '0.0625rem 0.375rem', borderRadius: 99,
                        background: 'var(--hover-bg)', color: 'var(--text-disabled)',
                      }}>
                        {a}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setPreviewTemplate(t)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600,
                      border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                      color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>
                      <Eye size={10} /> Preview
                    </button>
                    <button onClick={() => setEditTemplate({ ...t, id: original.id, emoji: original.emoji })} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600,
                      border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                      color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>
                      <Edit3 size={10} /> Edit
                    </button>
                    <button onClick={() => onDuplicate?.(t)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600,
                      border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                      color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>
                      <Copy size={10} /> Duplicate
                    </button>
                    {isEdited && (
                      <button onClick={() => handleResetToDefault(original.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600,
                        border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                        color: 'var(--color-error)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}>
                        <RotateCcw size={10} /> Reset
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* ── My Templates ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h4 style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem', margin: 0,
          }}>
            My Templates
          </h4>
          <button onClick={() => setShowCreate(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600,
            border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            <Plus size={12} /> Create Template
          </button>
        </div>
        {pureCustomTemplates.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
            No custom templates yet. Create one or duplicate a pre-built template.
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '0.75rem',
          }}>
            {pureCustomTemplates.map(t => (
              <div key={t.id} className="card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Mail size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{t.name}</span>
                </div>
                {t.description && (
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem' }}>
                  <button onClick={() => setEditTemplate(t)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600,
                    border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                    color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    <Edit3 size={10} /> Edit
                  </button>
                  <button onClick={() => onDuplicate?.(t)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600,
                    border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    <Copy size={10} /> Duplicate
                  </button>
                  <button onClick={() => handleDelete(t)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600,
                    border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                    color: 'var(--color-error)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EmailTemplateModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        leads={leads}
      />
      <TemplateEditor
        isOpen={!!editTemplate || showCreate}
        onClose={() => { setEditTemplate(null); setShowCreate(false) }}
        onSave={onSaveCustom}
        template={editTemplate}
      />
    </div>
  )
}
