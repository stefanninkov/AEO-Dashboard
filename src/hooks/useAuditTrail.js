import { useState, useMemo, useCallback } from 'react'

/**
 * useAuditTrail — Advanced audit log querying and filtering.
 *
 * Provides search, date range filtering, type filtering, author filtering,
 * pagination, and export for the activity log.
 *
 * @param {Object} options
 * @param {Object} options.activeProject
 * @param {number} [options.pageSize=25] - Items per page
 */
export function useAuditTrail({ activeProject, pageSize = 25 }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [page, setPage] = useState(0)

  const rawLog = useMemo(() => activeProject?.activityLog || [], [activeProject?.activityLog])

  // Extract unique types and authors for filter dropdowns
  const uniqueTypes = useMemo(() => {
    const types = new Set(rawLog.map(e => e.type).filter(Boolean))
    return ['all', ...Array.from(types).sort()]
  }, [rawLog])

  const uniqueAuthors = useMemo(() => {
    const authors = new Map()
    rawLog.forEach(e => {
      if (e.authorUid && e.authorName) {
        authors.set(e.authorUid, e.authorName)
      }
    })
    return [{ uid: 'all', name: 'All Authors' }, ...Array.from(authors, ([uid, name]) => ({ uid, name }))]
  }, [rawLog])

  // Apply filters
  const filtered = useMemo(() => {
    let result = rawLog

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(e => e.type === typeFilter)
    }

    // Author filter
    if (authorFilter !== 'all') {
      result = result.filter(e => e.authorUid === authorFilter)
    }

    // Date range
    if (dateRange.start) {
      const start = new Date(dateRange.start).getTime()
      result = result.filter(e => new Date(e.timestamp).getTime() >= start)
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end).getTime() + 86400000 // include full day
      result = result.filter(e => new Date(e.timestamp).getTime() <= end)
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(e =>
        (e.type || '').toLowerCase().includes(q) ||
        (e.authorName || '').toLowerCase().includes(q) ||
        (e.taskText || '').toLowerCase().includes(q) ||
        (e.itemLabel || '').toLowerCase().includes(q) ||
        (e.assigneeName || '').toLowerCase().includes(q) ||
        (e.memberName || '').toLowerCase().includes(q) ||
        (e.commentText || '').toLowerCase().includes(q) ||
        (e.url || '').toLowerCase().includes(q)
      )
    }

    return result
  }, [rawLog, typeFilter, authorFilter, dateRange, search])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = page * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  // Reset page when filters change
  const applyFilter = useCallback((setter) => {
    return (value) => {
      setter(value)
      setPage(0)
    }
  }, [])

  // Stats
  const stats = useMemo(() => {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    return {
      total: rawLog.length,
      filtered: filtered.length,
      today: rawLog.filter(e => now - new Date(e.timestamp).getTime() < day).length,
      thisWeek: rawLog.filter(e => now - new Date(e.timestamp).getTime() < 7 * day).length,
      thisMonth: rawLog.filter(e => now - new Date(e.timestamp).getTime() < 30 * day).length,
      uniqueAuthors: new Set(rawLog.map(e => e.authorUid).filter(Boolean)).size,
      topTypes: getTopN(rawLog.map(e => e.type), 5),
    }
  }, [rawLog, filtered.length])

  // Export filtered log as CSV
  const exportCsv = useCallback(() => {
    const headers = ['Timestamp', 'Type', 'Author', 'Author Email', 'Details', 'Item ID']
    const rows = filtered.map(e => [
      e.timestamp || '',
      e.type || '',
      e.authorName || '',
      e.authorEmail || '',
      summarizeEntry(e),
      e.itemId || e.taskText || '',
    ])
    downloadCsv(headers, rows, `audit-log-${new Date().toISOString().slice(0, 10)}.csv`)
  }, [filtered])

  return {
    // Data
    entries: paginated,
    totalEntries: filtered.length,
    stats,
    // Filters
    search, setSearch: applyFilter(setSearch),
    typeFilter, setTypeFilter: applyFilter(setTypeFilter),
    authorFilter, setAuthorFilter: applyFilter(setAuthorFilter),
    dateRange, setDateRange: applyFilter(setDateRange),
    uniqueTypes,
    uniqueAuthors,
    // Pagination
    page, setPage,
    totalPages,
    pageSize,
    // Actions
    exportCsv,
  }
}

function getTopN(items, n) {
  const counts = {}
  items.forEach(i => { if (i) counts[i] = (counts[i] || 0) + 1 })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([type, count]) => ({ type, count }))
}

function summarizeEntry(e) {
  const parts = []
  if (e.taskText) parts.push(e.taskText)
  if (e.itemLabel) parts.push(e.itemLabel)
  if (e.assigneeName) parts.push(`assigned: ${e.assigneeName}`)
  if (e.memberName) parts.push(`member: ${e.memberName}`)
  if (e.commentText) parts.push(`comment: ${e.commentText}`)
  if (e.score != null) parts.push(`score: ${e.score}`)
  if (e.url) parts.push(e.url)
  return parts.join(' | ') || e.type || ''
}

function downloadCsv(headers, rows, filename) {
  const escape = (v) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const lines = [headers.map(escape).join(',')]
  rows.forEach(row => lines.push(row.map(escape).join(',')))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
