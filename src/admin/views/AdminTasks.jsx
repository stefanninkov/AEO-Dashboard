/**
 * AdminTasks — Full-page task management view.
 *
 * Sections: Overdue (red), Today (amber), Upcoming (next 7 days), Completed (collapsed).
 * Task rows: checkbox, title, lead name, due date, priority badge.
 */
import { useState, useMemo } from 'react'
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Search, Filter,
  ListTodo, ChevronDown, ChevronRight,
} from 'lucide-react'
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

function TaskRow({ task, onComplete, onUncomplete, onNavigateToLead }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  const priority = TASK_PRIORITIES.find(p => p.id === task.priority) || TASK_PRIORITIES[1]

  return (
    <div style={{
      display: 'flex', gap: '0.625rem', padding: '0.625rem 0.875rem',
      borderRadius: '0.375rem', border: '0.0625rem solid var(--border-subtle)',
      background: task.completed ? 'transparent' : isOverdue ? 'rgba(239,68,68,0.04)' : 'var(--card-bg)',
      alignItems: 'center', opacity: task.completed ? 0.5 : 1,
    }}>
      {/* Checkbox */}
      <button
        onClick={() => task.completed ? onUncomplete?.(task.id) : onComplete?.(task.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.125rem', display: 'flex', flexShrink: 0 }}
      >
        {task.completed
          ? <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          : <Circle size={16} style={{ color: isOverdue ? '#EF4444' : 'var(--border-subtle)' }} />
        }
      </button>

      {/* Title */}
      <span style={{
        flex: 1, fontSize: '0.8125rem', fontWeight: 600,
        color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
        textDecoration: task.completed ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {task.title}
      </span>

      {/* Lead name */}
      {task.leadName && (
        <button
          onClick={() => onNavigateToLead?.(task.leadId)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.6875rem', color: 'var(--accent)', fontWeight: 500,
            fontFamily: 'var(--font-body)', padding: 0,
            maxWidth: '8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {task.leadName}
        </button>
      )}

      {/* Due date */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
        color: task.completed ? 'var(--text-disabled)' : isOverdue ? '#EF4444' : 'var(--text-tertiary)',
        flexShrink: 0, minWidth: '5rem',
      }}>
        {isOverdue ? <AlertTriangle size={10} /> : <Clock size={10} />}
        {formatDueDate(task.dueDate)}
      </span>

      {/* Priority */}
      <span style={{
        fontSize: '0.5625rem', fontWeight: 700, padding: '0.125rem 0.375rem',
        borderRadius: 99, background: `${priority.color}15`, color: priority.color,
        flexShrink: 0,
      }}>
        {priority.emoji} {priority.label}
      </span>
    </div>
  )
}

function TaskSection({ title, emoji, color, tasks, defaultOpen = true, onComplete, onUncomplete, onNavigateToLead }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (tasks.length === 0) return null

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
          padding: '0.5rem 0', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={{ fontSize: '0.875rem' }}>{emoji}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
          color: color || 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02rem',
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
          padding: '0.0625rem 0.375rem', borderRadius: 99,
          background: `${color}15`, color,
        }}>
          {tasks.length}
        </span>
      </button>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.25rem' }}>
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onNavigateToLead={onNavigateToLead}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminTasks({ user, onNavigate, tasksHook }) {
  const tasks = tasksHook || { tasks: [], overdueTasks: [], todayTasks: [], upcomingTasks: [], unscheduledTasks: [], completedTasks: [], completeTask: () => {}, uncompleteTask: () => {} }
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filterTasks = (list) => {
    let result = list
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.leadName || '').toLowerCase().includes(q)
      )
    }
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter)
    }
    return result
  }

  const handleNavigateToLead = (leadId) => {
    onNavigate?.('waitlist')
  }

  return (
    <div className="view-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
          color: 'var(--text-primary)', margin: 0,
        }}>
          Tasks
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
          {tasks.overdueTasks.length > 0 && (
            <span style={{ color: '#EF4444', fontWeight: 600 }}>
              {tasks.overdueTasks.length} overdue
            </span>
          )}
          {tasks.overdueTasks.length > 0 && ' \u00B7 '}
          {tasks.todayTasks.length} today \u00B7 {tasks.upcomingTasks.length} upcoming
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div className="card" style={{
          padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
          flex: 1, maxWidth: '20rem',
        }}>
          <Search size={12} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <input
            type="text" placeholder="Search tasks..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)',
            }}
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: '0.375rem 1.5rem 0.375rem 0.5rem', borderRadius: '0.375rem',
            fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-body)',
            border: '0.0625rem solid var(--border-subtle)', background: 'var(--card-bg)',
            color: priorityFilter === 'all' ? 'var(--text-disabled)' : 'var(--text-primary)',
            cursor: 'pointer', outline: 'none', appearance: 'none',
          }}
        >
          <option value="all">All Priorities</option>
          {TASK_PRIORITIES.map(p => (
            <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
          ))}
        </select>
      </div>

      {/* Task Sections */}
      <div className="card" style={{ padding: '1rem' }}>
        <TaskSection
          title="Overdue" emoji="\uD83D\uDEA8" color="#EF4444"
          tasks={filterTasks(tasks.overdueTasks)}
          onComplete={tasks.completeTask}
          onUncomplete={tasks.uncompleteTask}
          onNavigateToLead={handleNavigateToLead}
        />
        <TaskSection
          title="Today" emoji="\uD83D\uDCC5" color="#F59E0B"
          tasks={filterTasks(tasks.todayTasks)}
          onComplete={tasks.completeTask}
          onUncomplete={tasks.uncompleteTask}
          onNavigateToLead={handleNavigateToLead}
        />
        <TaskSection
          title="Upcoming" emoji="\uD83D\uDD52" color="#3B82F6"
          tasks={filterTasks(tasks.upcomingTasks)}
          onComplete={tasks.completeTask}
          onUncomplete={tasks.uncompleteTask}
          onNavigateToLead={handleNavigateToLead}
        />
        <TaskSection
          title="Unscheduled" emoji="\uD83D\uDCCB" color="#6B7280"
          tasks={filterTasks(tasks.unscheduledTasks)}
          onComplete={tasks.completeTask}
          onUncomplete={tasks.uncompleteTask}
          onNavigateToLead={handleNavigateToLead}
        />
        <TaskSection
          title="Completed" emoji="\u2705" color="#10B981"
          tasks={filterTasks(tasks.completedTasks).slice(0, 20)}
          defaultOpen={false}
          onComplete={tasks.completeTask}
          onUncomplete={tasks.uncompleteTask}
          onNavigateToLead={handleNavigateToLead}
        />

        {tasks.tasks.length === 0 && (
          <div style={{
            padding: '3rem', textAlign: 'center',
            color: 'var(--text-disabled)', fontSize: '0.875rem',
          }}>
            <ListTodo size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p>No tasks yet</p>
            <p style={{ fontSize: '0.75rem' }}>Create tasks from the lead detail panel</p>
          </div>
        )}
      </div>
    </div>
  )
}
