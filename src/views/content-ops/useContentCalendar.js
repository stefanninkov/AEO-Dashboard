import { useState, useMemo, useCallback } from 'react'
import { createActivity, appendActivity } from '../../utils/activityLogger'
import { fireWebhooks } from '../../utils/webhookDispatcher'

/* ── Status config ── */
export const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', color: 'var(--color-phase-1)' },
  { value: 'in-progress', label: 'In Progress', color: 'var(--color-phase-2)' },
  { value: 'review', label: 'Review', color: 'var(--color-phase-4)' },
  { value: 'published', label: 'Published', color: 'var(--color-phase-3)' },
]

export const STATUS_COLORS = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s.color]))

/* ── Date helpers ── */
export function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday start
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekDays(weekStart) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

export function getMonthDays(year, month) {
  // Returns array of weeks, each with 7 days (some from prev/next month)
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const start = getWeekStart(firstDay)
  const weeks = []
  let current = new Date(start)
  while (current <= lastDay || weeks.length < 5) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    if (weeks.length >= 6) break
  }
  return weeks
}

export function formatDateKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isToday(date) {
  const today = new Date()
  const d = new Date(date)
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
}

export function isOverdue(entry) {
  if (entry.status === 'published') return false
  const today = formatDateKey(new Date())
  return entry.scheduledDate < today
}

/* ── Hook ── */
export default function useContentCalendar({ activeProject, updateProject, user, toggleCheckItem }) {
  const [selectedDate, setSelectedDate] = useState(null) // date being clicked for new entry
  const [editingEntry, setEditingEntry] = useState(null) // entry being edited
  const [viewDate, setViewDate] = useState(new Date())   // current calendar position
  const [calendarMode, setCalendarMode] = useState('week') // 'week' | 'month'

  const calendar = activeProject?.contentCalendar || []

  /* ── Sorted entries ── */
  const entries = useMemo(() => {
    return [...calendar].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
  }, [calendar])

  /* ── Entries grouped by date ── */
  const entriesByDate = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      if (!map[e.scheduledDate]) map[e.scheduledDate] = []
      map[e.scheduledDate].push(e)
    })
    return map
  }, [entries])

  /* ── Stats ── */
  const stats = useMemo(() => {
    const today = formatDateKey(new Date())
    let scheduled = 0, inProgress = 0, review = 0, published = 0, overdue = 0
    entries.forEach(e => {
      if (e.status === 'scheduled') scheduled++
      if (e.status === 'in-progress') inProgress++
      if (e.status === 'review') review++
      if (e.status === 'published') published++
      if (e.status !== 'published' && e.scheduledDate < today) overdue++
    })
    return { total: entries.length, scheduled, inProgress, review, published, overdue }
  }, [entries])

  /* ── CRUD Operations ── */
  const saveCalendar = useCallback((newCalendar) => {
    updateProject(activeProject.id, { contentCalendar: newCalendar })
  }, [activeProject?.id, updateProject])

  const addEntry = useCallback(({ title, scheduledDate, checklistItemId, pageUrl, assignedTo, notes, briefId }) => {
    const entry = {
      id: crypto.randomUUID(),
      checklistItemId: checklistItemId || null,
      title: title || 'Untitled',
      pageUrl: pageUrl || '',
      scheduledDate: scheduledDate || formatDateKey(new Date()),
      status: 'scheduled',
      assignedTo: assignedTo || null,
      notes: notes || '',
      briefId: briefId || null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }
    const updated = [...calendar, entry]
    saveCalendar(updated)

    // Log activity + webhooks
    const addData = { title: title?.slice(0, 60), date: scheduledDate }
    const act = createActivity('calendarAdd', addData, user)
    updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, act) })
    fireWebhooks(activeProject, 'calendarAdd', addData, updateProject)

    return entry
  }, [calendar, saveCalendar, user, activeProject, updateProject])

  const updateEntry = useCallback((id, updates) => {
    const updated = calendar.map(e => e.id === id ? { ...e, ...updates } : e)
    saveCalendar(updated)
  }, [calendar, saveCalendar])

  const removeEntry = useCallback((id) => {
    const entry = calendar.find(e => e.id === id)
    const updated = calendar.filter(e => e.id !== id)
    saveCalendar(updated)

    if (entry) {
      const removeData = { title: entry.title?.slice(0, 60) }
      const act = createActivity('calendarRemove', removeData, user)
      updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, act) })
      fireWebhooks(activeProject, 'calendarRemove', removeData, updateProject)
    }
  }, [calendar, saveCalendar, user, activeProject, updateProject])

  const markPublished = useCallback((id) => {
    const entry = calendar.find(e => e.id === id)
    if (!entry) return

    const updated = calendar.map(e => e.id === id
      ? { ...e, status: 'published', completedAt: new Date().toISOString() }
      : e
    )
    saveCalendar(updated)

    // Auto-complete linked checklist item
    if (entry.checklistItemId && toggleCheckItem) {
      const checked = activeProject?.checked || {}
      if (!checked[entry.checklistItemId]) {
        toggleCheckItem(entry.checklistItemId)
      }
    }

    const publishData = { title: entry.title?.slice(0, 60), checklistItemId: entry.checklistItemId }
    const act = createActivity('calendarPublish', publishData, user)
    updateProject(activeProject.id, { activityLog: appendActivity(activeProject.activityLog, act) })
    fireWebhooks(activeProject, 'calendarPublish', publishData, updateProject)
  }, [calendar, saveCalendar, toggleCheckItem, activeProject, user, updateProject])

  const scheduleFromChecklist = useCallback((itemId, itemText, date) => {
    return addEntry({
      title: itemText,
      scheduledDate: date || formatDateKey(new Date()),
      checklistItemId: itemId,
    })
  }, [addEntry])

  /* ── Navigation ── */
  const goToPreviousWeek = useCallback(() => {
    setViewDate(d => {
      const n = new Date(d)
      n.setDate(n.getDate() - 7)
      return n
    })
  }, [])

  const goToNextWeek = useCallback(() => {
    setViewDate(d => {
      const n = new Date(d)
      n.setDate(n.getDate() + 7)
      return n
    })
  }, [])

  const goToPreviousMonth = useCallback(() => {
    setViewDate(d => {
      const n = new Date(d)
      n.setMonth(n.getMonth() - 1)
      return n
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewDate(d => {
      const n = new Date(d)
      n.setMonth(n.getMonth() + 1)
      return n
    })
  }, [])

  const goToToday = useCallback(() => {
    setViewDate(new Date())
  }, [])

  return {
    // State
    entries,
    entriesByDate,
    stats,
    viewDate,
    calendarMode,
    selectedDate,
    editingEntry,

    // Setters
    setViewDate,
    setCalendarMode,
    setSelectedDate,
    setEditingEntry,

    // CRUD
    addEntry,
    updateEntry,
    removeEntry,
    markPublished,
    scheduleFromChecklist,

    // Navigation
    goToPreviousWeek,
    goToNextWeek,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  }
}
