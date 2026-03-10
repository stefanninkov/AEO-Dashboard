import { useState, memo } from 'react'
import {
  Workflow, Plus, Trash2, Power, PowerOff, ChevronDown,
  ChevronRight, Zap, Bell, FileText, Copy, Activity,
} from 'lucide-react'
import { RULE_TEMPLATES } from '../hooks/useAutomations'
import CollapsibleContent from './shared/CollapsibleContent'

const TRIGGER_LABELS = {
  score_change: 'Score Change',
  checklist_progress: 'Checklist Progress',
  monitor_run: 'Monitor Run',
  team_change: 'Team Change',
  comment: 'New Comment',
  assignment: 'Task Assignment',
  analysis: 'Analysis Complete',
  any: 'Any Event',
}

const OPERATOR_LABELS = {
  eq: '=', neq: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤',
  contains: 'contains', exists: 'exists', empty: 'is empty',
}

const ACTION_ICONS = {
  notify: Bell,
  log: FileText,
  assign: Zap,
}

/**
 * AutomationRulesPanel — UI for managing automation rules.
 *
 * Props:
 *   rules       — from useAutomations
 *   stats       — from useAutomations
 *   onCreate    — callback(ruleData)
 *   onUpdate    — callback(ruleId, changes)
 *   onDelete    — callback(ruleId)
 *   onToggle    — callback(ruleId)
 */
function AutomationRulesPanel({ rules = [], stats = {}, onCreate, onUpdate, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showCreator, setShowCreator] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header + stats */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 'var(--space-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Workflow size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Automation Rules
          </h3>
          <span style={{
            fontSize: 'var(--text-2xs)', padding: '0.125rem 0.375rem',
            background: 'var(--hover-bg)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-tertiary)', fontWeight: 600,
          }}>
            {stats.enabled || 0} active
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-secondary)',
            }}
          >
            <Copy size={10} /> Templates
          </button>
          <button
            onClick={() => setShowCreator(!showCreator)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-2)',
              background: 'var(--accent)', border: 'none',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontSize: 'var(--text-2xs)', fontWeight: 600, color: '#fff',
            }}
          >
            <Plus size={10} /> New Rule
          </button>
        </div>
      </div>

      {/* Templates panel */}
      {showTemplates && (
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
        }}>
          <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>
            Quick Start Templates
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))', gap: 'var(--space-2)' }}>
            {RULE_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => { onCreate?.(t); setShowTemplates(false) }}
                style={{
                  padding: 'var(--space-2) var(--space-3)', textAlign: 'left',
                  background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  transition: 'border-color 100ms',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                  {t.name}
                </div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                  {t.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rule creator */}
      {showCreator && (
        <RuleCreator
          onCreate={(data) => { onCreate?.(data); setShowCreator(false) }}
          onCancel={() => setShowCreator(false)}
        />
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 'var(--space-8)', textAlign: 'center',
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <Workflow size={24} style={{ color: 'var(--text-disabled)', marginBottom: 'var(--space-2)' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>
            No automation rules yet. Use a template or create a custom rule.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {rules.map(rule => {
            const isExpanded = expanded === rule.id
            return (
              <div key={rule.id} style={{
                background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                opacity: rule.enabled ? 1 : 0.6,
              }}>
                {/* Rule header */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : rule.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-3)', cursor: 'pointer',
                  }}
                >
                  {isExpanded ? <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rule.name}
                      </span>
                      <span style={{
                        fontSize: '0.5625rem', padding: '0.0625rem 0.375rem',
                        borderRadius: 'var(--radius-sm)',
                        background: `color-mix(in srgb, var(--accent) 12%, transparent)`,
                        color: 'var(--accent)', fontWeight: 600,
                      }}>
                        {TRIGGER_LABELS[rule.trigger?.type] || rule.trigger?.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', marginTop: '0.125rem' }}>
                      {rule.triggerCount || 0} triggers
                      {rule.lastTriggered ? ` · Last: ${new Date(rule.lastTriggered).toLocaleDateString()}` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onToggle?.(rule.id)}
                      className="btn-icon-sm"
                      title={rule.enabled ? 'Disable' : 'Enable'}
                      style={{ color: rule.enabled ? 'var(--color-success)' : 'var(--text-disabled)' }}
                    >
                      {rule.enabled ? <Power size={14} /> : <PowerOff size={14} />}
                    </button>
                    <button
                      onClick={() => onDelete?.(rule.id)}
                      className="btn-icon-sm"
                      title="Delete"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <CollapsibleContent expanded={isExpanded}>
                  <div style={{
                    padding: '0 var(--space-3) var(--space-3)',
                    borderTop: '0.0625rem solid var(--border-subtle)',
                    paddingTop: 'var(--space-2)',
                  }}>
                    {/* Conditions */}
                    {rule.conditions?.length > 0 && (
                      <div style={{ marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03rem' }}>
                          Conditions
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                          {rule.conditions.map((c, i) => (
                            <div key={i} style={{
                              fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                              padding: 'var(--space-1) var(--space-2)',
                              background: 'var(--hover-bg)', borderRadius: 'var(--radius-sm)',
                              fontFamily: 'var(--font-mono)',
                            }}>
                              {c.field} <span style={{ color: 'var(--accent)' }}>{OPERATOR_LABELS[c.operator] || c.operator}</span> {String(c.value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div>
                      <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03rem' }}>
                        Actions
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                        {(rule.actions || []).map((a, i) => {
                          const Icon = ACTION_ICONS[a.type] || Activity
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                              fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                              padding: 'var(--space-1) var(--space-2)',
                              background: 'var(--hover-bg)', borderRadius: 'var(--radius-sm)',
                            }}>
                              <Icon size={12} style={{ color: 'var(--accent)' }} />
                              <span style={{ textTransform: 'capitalize' }}>{a.type}</span>
                              {a.config?.message && (
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.5625rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  — "{a.config.message}"
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            )
          })}
        </div>
      )}

      {/* Stats footer */}
      {rules.length > 0 && (
        <div style={{
          display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-2xs)',
          color: 'var(--text-disabled)', justifyContent: 'center',
        }}>
          <span>{stats.total} rule{stats.total !== 1 ? 's' : ''}</span>
          <span>{stats.enabled} active</span>
          <span>{stats.totalTriggers} total triggers</span>
        </div>
      )}
    </div>
  )
}

/**
 * RuleCreator — Inline form for creating a new rule.
 */
function RuleCreator({ onCreate, onCancel }) {
  const [name, setName] = useState('')
  const [triggerType, setTriggerType] = useState('score_change')
  const [condField, setCondField] = useState('event.overallScore')
  const [condOp, setCondOp] = useState('lt')
  const [condVal, setCondVal] = useState('50')
  const [actionType, setActionType] = useState('notify')
  const [actionMsg, setActionMsg] = useState('')

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({
      name: name.trim(),
      trigger: { type: triggerType },
      conditions: condField ? [{ field: condField, operator: condOp, value: condVal }] : [],
      actions: [{ type: actionType, config: { message: actionMsg || `Rule "${name}" triggered` } }],
    })
  }

  const inputStyle = {
    padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)',
    border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
  }
  const selectStyle = { ...inputStyle, cursor: 'pointer' }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--accent)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
    }}>
      <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)' }}>
        Create Rule
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div>
          <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.125rem' }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Rule name..." style={{ ...inputStyle, width: '100%' }} autoFocus />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.125rem' }}>Trigger</label>
            <select value={triggerType} onChange={e => setTriggerType(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.125rem' }}>Action</label>
            <select value={actionType} onChange={e => setActionType(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="notify">Notify Team</option>
              <option value="log">Log Event</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-2)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.125rem' }}>Condition Field</label>
            <input value={condField} onChange={e => setCondField(e.target.value)} placeholder="event.overallScore" style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.125rem' }}>Operator</label>
            <select value={condOp} onChange={e => setCondOp(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              {Object.entries(OPERATOR_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.125rem' }}>Value</label>
            <input value={condVal} onChange={e => setCondVal(e.target.value)} placeholder="50" style={{ ...inputStyle, width: '100%' }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.125rem' }}>Action Message</label>
          <input value={actionMsg} onChange={e => setActionMsg(e.target.value)} placeholder="Alert message..." style={{ ...inputStyle, width: '100%' }} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
          <button onClick={onCancel} style={{
            padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)',
            background: 'transparent', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-secondary)',
          }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim()} style={{
            padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)',
            background: name.trim() ? 'var(--accent)' : 'var(--border-subtle)',
            border: 'none', borderRadius: 'var(--radius-md)',
            cursor: name.trim() ? 'pointer' : 'default', color: '#fff', fontWeight: 600,
          }}>Create Rule</button>
        </div>
      </div>
    </div>
  )
}

export default memo(AutomationRulesPanel)
