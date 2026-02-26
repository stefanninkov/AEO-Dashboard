/**
 * LeadTasks — Per-lead task list with checkbox completion + create button.
 */
import { useState, useMemo } from 'react'
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react'
import { TASK_PRIORITIES } from '../constants/pipelineStages'

function formatDueDate(date) {
  if (!date) return 'No due date'
  const d = date instanceof Date ? date : new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(d)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24))

  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function LeadTasks({ leadId, tasks, onComplete, onUncomplete, onOpenCreate }) {
  const leadTasks = useMemo(() =>
    (tasks || []).filter(t => t.leadId === leadId),
  [tasks, leadId])

  const active = leadTasks.filter(t => !t.completed)
  const completed = leadTasks.filter(t => t.completed)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Create Task Button */}
      <button
        onClick={() => onOpenCreate?.()}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
          border: '0.0625rem dashed var(--border-subtle)', background: 'transparent',
          color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%',
          justifyContent: 'center',
        }}
      >
        <Plus size={13} /> Create Task
      </button>

      {/* Active Tasks */}
      {active.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {active.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
            const priority = TASK_PRIORITIES.find(p => p.id === task.priority) || TASK_PRIORITIES[1]
            return (
              <div key={task.id} style={{
                display: 'flex', gap: '0.5rem', padding: '0.5rem 0.625rem',
                borderRadius: '0.375rem', border: '0.0625rem solid var(--border-subtle)',
                background: isOverdue ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)',
                alignItems: 'flex-start',
              }}>
                <button
                  onClick={() => onComplete?.(task.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0.0625rem', display: 'flex', flexShrink: 0, marginTop: '0.0625rem',
                  }}
                >
                  <Circle size={14} style={{ color: isOverdue ? '#EF4444' : 'var(--border-subtle)' }} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
                    lineHeight: 1.3,
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.125rem',
                      fontSize: '0.5625rem', fontWeight: 600,
                      color: isOverdue ? '#EF4444' : 'var(--text-disabled)',
                    }}>
                      {isOverdue ? <AlertTriangle size={9} /> : <Clock size={9} />}
                      {formatDueDate(task.dueDate)}
                    </span>
                    <span style={{
                      fontSize: '0.5rem', fontWeight: 700, padding: '0.0625rem 0.25rem',
                      borderRadius: 99, background: `${priority.color}15`, color: priority.color,
                    }}>
                      {priority.emoji}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem',
            padding: '0.25rem 0', marginBottom: '0.25rem',
          }}>
            Completed ({completed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {completed.slice(0, 5).map(task => (
              <div key={task.id} style={{
                display: 'flex', gap: '0.5rem', padding: '0.25rem 0.625rem',
                alignItems: 'center', opacity: 0.5,
              }}>
                <button
                  onClick={() => onUncomplete?.(task.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0.0625rem', display: 'flex', flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                </button>
                <span style={{
                  fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                  textDecoration: 'line-through',
                }}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {leadTasks.length === 0 && (
        <div style={{
          padding: '1.5rem', textAlign: 'center',
          fontSize: '0.75rem', color: 'var(--text-disabled)', fontStyle: 'italic',
        }}>
          No tasks yet
        </div>
      )}
    </div>
  )
}
