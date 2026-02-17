import { useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  CheckCircle2, Clock, AlertTriangle, LayoutGrid, List,
} from 'lucide-react'
import useContentCalendar, {
  STATUS_COLORS, getWeekStart, getWeekDays, getMonthDays,
  formatDateKey, isToday, isOverdue,
} from './useContentCalendar'
import EntryForm from './EntryForm'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

/* ── Stat Card ── */
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '0.75rem',
      padding: '0.875rem 1rem',
      flex: '1 1 0',
      minWidth: '7rem',
    }}>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: color || 'var(--text-primary)', marginTop: '0.25rem' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{sub}</div>}
    </div>
  )
}

/* ── Entry Card (rendered inside day cells) ── */
function EntryCard({ entry, compact, onClick, members }) {
  const statusColor = STATUS_COLORS[entry.status] || 'var(--text-tertiary)'
  const overdue = isOverdue(entry)
  const assignee = members?.find(m => m.uid === entry.assignedTo)

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(entry) }}
      className="content-cal-entry"
      style={{
        padding: compact ? '0.25rem 0.375rem' : '0.375rem 0.5rem',
        borderRadius: '0.375rem',
        border: `1px solid ${overdue ? '#EF4444' : 'var(--border-subtle)'}`,
        borderLeft: `3px solid ${statusColor}`,
        background: overdue ? 'rgba(239,68,68,0.06)' : 'var(--hover-bg)',
        cursor: 'pointer',
        transition: 'transform 100ms, box-shadow 100ms',
        marginBottom: '0.25rem',
      }}
    >
      <div style={{
        fontSize: compact ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: 1.3,
      }}>
        {entry.title}
      </div>
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
          <span style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: statusColor,
            fontFamily: 'var(--font-heading)',
          }}>
            {entry.status}
          </span>
          {entry.checklistItemId && (
            <CheckCircle2 size={10} style={{ color: 'var(--text-tertiary)' }} />
          )}
          {assignee && (
            <span style={{
              fontSize: '0.5625rem',
              color: 'var(--text-tertiary)',
              maxWidth: '4rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {assignee.displayName?.split(' ')[0] || assignee.email?.split('@')[0]}
            </span>
          )}
          {overdue && <AlertTriangle size={10} style={{ color: '#EF4444' }} />}
        </div>
      )}
    </div>
  )
}

/* ── Main Calendar View ── */
export default function CalendarView({ activeProject, updateProject, user, phases, toggleCheckItem }) {
  const cal = useContentCalendar({ activeProject, updateProject, user, toggleCheckItem })
  const [showForm, setShowForm] = useState(false)

  const members = activeProject?.members || []
  const briefs = activeProject?.contentBriefs || []

  /* ── Week data ── */
  const weekStart = useMemo(() => getWeekStart(cal.viewDate), [cal.viewDate])
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])

  /* ── Month data ── */
  const monthWeeks = useMemo(
    () => getMonthDays(cal.viewDate.getFullYear(), cal.viewDate.getMonth()),
    [cal.viewDate]
  )

  const handleDayClick = (date) => {
    cal.setSelectedDate(date)
    cal.setEditingEntry(null)
    setShowForm(true)
  }

  const handleEntryClick = (entry) => {
    cal.setEditingEntry(entry)
    cal.setSelectedDate(null)
    setShowForm(true)
  }

  const handleSave = (formData) => {
    if (cal.editingEntry) {
      // Update existing
      cal.updateEntry(cal.editingEntry.id, formData)
      // If status changed to published, auto-complete checklist
      if (formData.status === 'published' && cal.editingEntry.status !== 'published') {
        cal.markPublished(cal.editingEntry.id)
      }
    } else {
      // Create new
      cal.addEntry(formData)
    }
  }

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    const sameMonth = weekStart.getMonth() === end.getMonth()
    if (sameMonth) {
      return `${weekStart.getDate()} - ${end.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    }
    return `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`
  }, [weekStart])

  const monthLabel = `${MONTH_NAMES[cal.viewDate.getMonth()]} ${cal.viewDate.getFullYear()}`

  const navBtnStyle = {
    background: 'none', border: '1px solid var(--border-subtle)',
    borderRadius: '0.375rem', cursor: 'pointer', padding: '0.3125rem',
    color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
  }

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <StatCard label="Total" value={cal.stats.total} />
        <StatCard label="Scheduled" value={cal.stats.scheduled} color="var(--color-phase-1)" />
        <StatCard label="In Progress" value={cal.stats.inProgress} color="var(--color-phase-2)" />
        <StatCard label="Published" value={cal.stats.published} color="var(--color-phase-3)" />
        {cal.stats.overdue > 0 && (
          <StatCard label="Overdue" value={cal.stats.overdue} color="#EF4444" />
        )}
      </div>

      {/* Toolbar: nav + mode toggle + add */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={cal.calendarMode === 'week' ? cal.goToPreviousWeek : cal.goToPreviousMonth} style={navBtnStyle}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={cal.goToToday} style={{
            ...navBtnStyle, fontSize: '0.75rem', padding: '0.3125rem 0.625rem',
            fontFamily: 'var(--font-body)', fontWeight: 600,
          }}>
            Today
          </button>
          <button onClick={cal.calendarMode === 'week' ? cal.goToNextWeek : cal.goToNextMonth} style={navBtnStyle}>
            <ChevronRight size={14} />
          </button>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700,
            color: 'var(--text-primary)', marginLeft: '0.5rem',
          }}>
            {cal.calendarMode === 'week' ? weekLabel : monthLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Week / Month toggle */}
          <div style={{
            display: 'flex', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}>
            {[{ id: 'week', icon: List, label: 'Week' }, { id: 'month', icon: LayoutGrid, label: 'Month' }].map(v => (
              <button
                key={v.id}
                onClick={() => cal.setCalendarMode(v.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.3125rem 0.625rem', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                  background: cal.calendarMode === v.id ? 'var(--color-phase-1)' : 'transparent',
                  color: cal.calendarMode === v.id ? '#fff' : 'var(--text-secondary)',
                  transition: 'background 150ms, color 150ms',
                }}
              >
                <v.icon size={12} /> {v.label}
              </button>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={() => handleDayClick(new Date())}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.4375rem 0.75rem', borderRadius: '0.5rem',
              border: 'none', background: 'var(--color-phase-1)', color: '#fff',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Plus size={14} /> Add Entry
          </button>
        </div>
      </div>

      {/* ── Week View ── */}
      {cal.calendarMode === 'week' && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px', background: 'var(--border-subtle)', borderRadius: '0.75rem',
          overflow: 'hidden', border: '1px solid var(--border-subtle)',
        }}>
          {weekDays.map((day, i) => {
            const dateKey = formatDateKey(day)
            const dayEntries = cal.entriesByDate[dateKey] || []
            const today = isToday(day)

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                style={{
                  background: today ? 'rgba(255,107,53,0.04)' : 'var(--card-bg)',
                  minHeight: '10rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Day header */}
                <div style={{
                  padding: '0.5rem 0.5rem 0.375rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: '0.625rem', fontFamily: 'var(--font-heading)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: today ? 'var(--color-phase-1)' : 'var(--text-tertiary)',
                  }}>
                    {DAY_NAMES[i]}
                  </span>
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: today ? 'var(--color-phase-1)' : 'var(--text-primary)',
                    width: '1.5rem', height: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    background: today ? 'var(--color-phase-1)' : 'transparent',
                    ...(today ? { color: '#fff' } : {}),
                  }}>
                    {day.getDate()}
                  </span>
                </div>
                {/* Entries */}
                <div style={{ padding: '0.375rem', flex: 1, overflow: 'auto' }}>
                  {dayEntries.map(entry => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      compact={false}
                      onClick={handleEntryClick}
                      members={members}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Month View ── */}
      {cal.calendarMode === 'month' && (
        <div>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0,
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{
                padding: '0.375rem', textAlign: 'center',
                fontSize: '0.625rem', fontFamily: 'var(--font-heading)', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.5px',
                color: 'var(--text-tertiary)',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          <div style={{
            display: 'grid', gridTemplateRows: `repeat(${monthWeeks.length}, 1fr)`,
            gap: '1px', background: 'var(--border-subtle)', borderRadius: '0 0 0.75rem 0.75rem',
            overflow: 'hidden', border: '1px solid var(--border-subtle)', borderTop: 'none',
          }}>
            {monthWeeks.map((week, wi) => (
              <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                {week.map((day, di) => {
                  const dateKey = formatDateKey(day)
                  const dayEntries = cal.entriesByDate[dateKey] || []
                  const today = isToday(day)
                  const isCurrentMonth = day.getMonth() === cal.viewDate.getMonth()

                  return (
                    <div
                      key={di}
                      onClick={() => handleDayClick(day)}
                      style={{
                        background: today ? 'rgba(255,107,53,0.04)' : 'var(--card-bg)',
                        minHeight: '5rem',
                        cursor: 'pointer',
                        opacity: isCurrentMonth ? 1 : 0.4,
                        padding: '0.25rem',
                      }}
                    >
                      <div style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        fontFamily: 'var(--font-heading)',
                        color: today ? 'var(--color-phase-1)' : 'var(--text-primary)',
                        textAlign: 'right',
                        padding: '0.125rem 0.25rem',
                      }}>
                        {day.getDate()}
                      </div>
                      {dayEntries.slice(0, 2).map(entry => (
                        <EntryCard
                          key={entry.id}
                          entry={entry}
                          compact
                          onClick={handleEntryClick}
                          members={members}
                        />
                      ))}
                      {dayEntries.length > 2 && (
                        <div style={{
                          fontSize: '0.5625rem', color: 'var(--text-tertiary)',
                          textAlign: 'center', fontWeight: 600,
                        }}>
                          +{dayEntries.length - 2} more
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {cal.entries.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem 1.5rem',
          color: 'var(--text-tertiary)',
        }}>
          <CalendarIcon size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.9375rem',
            fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.375rem',
          }}>
            No content scheduled yet
          </div>
          <div style={{ fontSize: '0.8125rem', maxWidth: '24rem', margin: '0 auto', lineHeight: 1.5 }}>
            Click any day or the "Add Entry" button to schedule content work.
            Link entries to checklist tasks to auto-complete them when published.
          </div>
        </div>
      )}

      {/* Entry Form (slide-out panel) */}
      {showForm && (
        <EntryForm
          entry={cal.editingEntry}
          initialDate={cal.selectedDate}
          phases={phases}
          members={members}
          briefs={briefs}
          onSave={handleSave}
          onDelete={cal.removeEntry}
          onClose={() => { setShowForm(false); cal.setEditingEntry(null); cal.setSelectedDate(null) }}
        />
      )}
    </div>
  )
}
