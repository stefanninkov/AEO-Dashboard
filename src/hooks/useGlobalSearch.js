import { useState, useMemo, useCallback } from 'react'

/**
 * useGlobalSearch — Cross-entity search across projects, tasks, activity, and more.
 *
 * Provides fuzzy-ish search across:
 * - Checklist items (tasks)
 * - Activity log entries
 * - Comments
 * - Team members
 * - Navigation views
 * - Saved views
 * - Project names
 *
 * Returns categorized, ranked results.
 */
export function useGlobalSearch({ projects = [], activeProject, phases = [], savedViews = [] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  // Build search index
  const index = useMemo(() => {
    const items = []

    // Projects
    projects.forEach(p => {
      items.push({
        id: `project-${p.id}`,
        type: 'project',
        title: p.name,
        subtitle: p.url || '',
        score: 0,
        meta: { projectId: p.id },
      })
    })

    // Checklist items from active project phases
    if (phases?.length) {
      phases.forEach(phase => {
        (phase.items || []).forEach(item => {
          items.push({
            id: `task-${phase.id}-${item.id || item.label}`,
            type: 'task',
            title: item.label || item.text || '',
            subtitle: `Phase ${phase.id}: ${phase.title}`,
            score: 0,
            meta: { phaseId: phase.id, view: 'checklist' },
          })
        })
      })
    }

    // Activity log
    ;(activeProject?.activityLog || []).slice(0, 200).forEach(entry => {
      items.push({
        id: `activity-${entry.id}`,
        type: 'activity',
        title: formatActivityTitle(entry),
        subtitle: `${entry.authorName || 'System'} · ${entry.type}`,
        timestamp: entry.timestamp,
        score: 0,
        meta: { view: 'compliance' },
      })
    })

    // Comments
    if (activeProject?.comments) {
      Object.entries(activeProject.comments).forEach(([itemId, thread]) => {
        (thread.comments || []).forEach(comment => {
          items.push({
            id: `comment-${itemId}-${comment.id}`,
            type: 'comment',
            title: comment.text || '',
            subtitle: `${comment.authorName || 'Unknown'} on ${itemId}`,
            timestamp: comment.createdAt,
            score: 0,
            meta: { view: 'checklist', itemId },
          })
        })
      })
    }

    // Team members
    ;(activeProject?.members || []).forEach(member => {
      items.push({
        id: `member-${member.uid}`,
        type: 'member',
        title: member.displayName || member.email || member.uid,
        subtitle: `${member.role || 'member'}`,
        score: 0,
        meta: { view: 'settings' },
      })
    })

    // Saved views
    savedViews.forEach(sv => {
      items.push({
        id: `savedview-${sv.id}`,
        type: 'savedView',
        title: sv.label,
        subtitle: `Saved: ${sv.view} view`,
        score: 0,
        meta: { view: sv.view, savedViewId: sv.id },
      })
    })

    return items
  }, [projects, activeProject, phases, savedViews])

  // Search + rank
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { all: [], grouped: {} }

    const scored = index.map(item => {
      const titleLower = item.title.toLowerCase()
      const subtitleLower = item.subtitle.toLowerCase()

      let score = 0
      if (titleLower === q) score = 100
      else if (titleLower.startsWith(q)) score = 80
      else if (titleLower.includes(q)) score = 60
      else if (subtitleLower.includes(q)) score = 30
      else {
        // Fuzzy: check if all words in query appear somewhere
        const words = q.split(/\s+/)
        const combined = `${titleLower} ${subtitleLower}`
        const matches = words.filter(w => combined.includes(w))
        if (matches.length === words.length) score = 20
        else if (matches.length > 0) score = 10 * (matches.length / words.length)
      }

      return { ...item, score }
    }).filter(item => item.score > 0)

    // Filter by category
    const filtered = category === 'all'
      ? scored
      : scored.filter(item => item.type === category)

    // Sort by score desc, then recency
    filtered.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (a.timestamp && b.timestamp) return new Date(b.timestamp) - new Date(a.timestamp)
      return 0
    })

    // Group
    const grouped = {}
    filtered.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = []
      grouped[item.type].push(item)
    })

    return { all: filtered.slice(0, 50), grouped }
  }, [query, index, category])

  const categories = useMemo(() => {
    const types = new Set(index.map(i => i.type))
    return ['all', ...Array.from(types).sort()]
  }, [index])

  const clearSearch = useCallback(() => {
    setQuery('')
    setCategory('all')
  }, [])

  return {
    query, setQuery,
    category, setCategory,
    categories,
    results: results.all,
    groupedResults: results.grouped,
    totalResults: results.all.length,
    clearSearch,
    hasQuery: query.trim().length > 0,
  }
}

function formatActivityTitle(entry) {
  switch (entry.type) {
    case 'check': return `Checked: ${entry.taskText || ''}`
    case 'uncheck': return `Unchecked: ${entry.taskText || ''}`
    case 'comment': return `Comment: ${(entry.commentText || '').slice(0, 60)}`
    case 'mention': return `Mentioned in: ${(entry.commentText || '').slice(0, 60)}`
    case 'task_assign': return `Assigned: ${entry.taskText || ''} → ${entry.assigneeName || ''}`
    case 'member_add': return `Added member: ${entry.memberName || ''}`
    case 'member_remove': return `Removed: ${entry.memberName || ''}`
    case 'role_change': return `Role changed: ${entry.memberName || ''} → ${entry.newRole || ''}`
    default: return entry.type || 'Activity'
  }
}
