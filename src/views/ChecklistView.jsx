import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Search, CheckCircle2 } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useDebounce } from '../hooks/useDebounce'
import VerifyDialog from '../components/VerifyDialog'
import { getPhasePriority, getFirstPriorityPhase } from '../utils/getRecommendations'
import { useActivityWithWebhooks } from '../hooks/useActivityWithWebhooks'
import { fireWebhooks } from '../utils/webhookDispatcher'
import ChecklistStats from './checklist/ChecklistStats'
import PhaseCard from './checklist/PhaseCard'
import PresenceAvatars from '../components/PresenceAvatars'

export default function ChecklistView({ phases, activeProject, toggleCheckItem, setActiveView, setDocItem, updateProject, user, onlineMembers, addNotification }) {
  const firstPriority = getFirstPriorityPhase(activeProject?.questionnaire)
  const [expandedPhases, setExpandedPhases] = useState({ [firstPriority]: true })
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 200)
  const [quickViewItem, setQuickViewItem] = useState(null)
  const [bouncingId, setBouncingId] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [verifyItem, setVerifyItem] = useState(null)
  const [verifyClosing, setVerifyClosing] = useState(false)

  // Notes state
  const [openNoteId, setOpenNoteId] = useState(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [noteSaveStatus, setNoteSaveStatus] = useState(null)
  const saveTimerRef = useRef(null)
  const savedTimerRef = useRef(null)

  // Comments state
  const [openCommentId, setOpenCommentId] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')

  // Category collapse state (absent = expanded)
  const [expandedCategories, setExpandedCategories] = useState({})

  // Micro-interactions
  const { addToast } = useToast()
  const [celebratingPhase, setCelebratingPhase] = useState(null)
  const prevPhaseProgressRef = useRef({})
  const activeProjectIdRef = useRef(activeProject?.id)

  const checked = activeProject?.checked || {}
  const notes = activeProject?.notes || {}
  const noteTimestamps = activeProject?.noteTimestamps || {}
  const assignments = activeProject?.assignments || {}
  const comments = activeProject?.comments || {}
  const members = activeProject?.members || []

  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })

  // ── Handlers (memoized for child component stability) ──

  const handleToggle = useCallback((itemId, item, phaseNumber) => {
    if (checked[itemId]) {
      toggleCheckItem(itemId)
      logAndDispatch('uncheck', { taskId: itemId, taskText: item.text.slice(0, 80), phase: phaseNumber }, user)
    } else {
      setVerifyItem({ ...item, _phaseNumber: phaseNumber })
    }
  }, [checked, toggleCheckItem, logAndDispatch, user])

  const handleCloseVerify = useCallback(() => { setVerifyClosing(true) }, [])
  const handleVerifyExited = useCallback(() => { setVerifyClosing(false); setVerifyItem(null) }, [])

  const handleVerified = useCallback((verification) => {
    const newVerifications = {
      ...(activeProject.verifications || {}),
      [verifyItem.id]: verification,
    }
    updateProject(activeProject.id, { verifications: newVerifications })
    toggleCheckItem(verifyItem.id)
    logAndDispatch('check', { taskId: verifyItem.id, taskText: verifyItem.text.slice(0, 80), phase: verifyItem._phaseNumber }, user)

    // Phase completion detection — fire synthetic event if phase is now 100%
    const phaseNum = verifyItem._phaseNumber
    const phase = phases.find(p => p.number === phaseNum)
    if (phase) {
      const newChecked = { ...checked, [verifyItem.id]: true }
      let total = 0, done = 0
      phase.categories.forEach(cat => {
        cat.items.forEach(it => { total++; if (newChecked[it.id]) done++ })
      })
      if (done === total && total > 0) {
        fireWebhooks(activeProject, 'phase_complete', {
          phase: phaseNum,
          phaseTitle: phase.title,
          totalTasks: total,
        }, updateProject)
      }
    }

    setBouncingId(verifyItem.id)
    setTimeout(() => setBouncingId(null), 450)
    handleCloseVerify()
  }, [verifyItem, activeProject, checked, phases, updateProject, toggleCheckItem, logAndDispatch, user, handleCloseVerify])

  // Notes handlers
  const saveNote = useCallback((itemId, text) => {
    clearTimeout(saveTimerRef.current)
    clearTimeout(savedTimerRef.current)
    const trimmed = text.trim()
    const newNotes = { ...notes, [itemId]: trimmed }
    const newTimestamps = { ...noteTimestamps, [itemId]: new Date().toISOString() }
    if (!trimmed) { delete newNotes[itemId]; delete newTimestamps[itemId] }
    updateProject(activeProject.id, { notes: newNotes, noteTimestamps: newTimestamps })
    if (trimmed) {
      let taskText = '', phaseNum = 0
      for (const phase of phases) {
        for (const cat of phase.categories) {
          for (const it of cat.items) {
            if (it.id === itemId) { taskText = it.text.slice(0, 80); phaseNum = phase.number; break }
          }
        }
      }
      logAndDispatch('note', { taskId: itemId, taskText, phase: phaseNum }, user)
    }
    setNoteSaveStatus('saved')
    savedTimerRef.current = setTimeout(() => setNoteSaveStatus(null), 2000)
  }, [notes, noteTimestamps, activeProject?.id, updateProject, phases, logAndDispatch, user])

  const handleNoteChange = useCallback((itemId, text) => {
    setNoteDraft(text)
    clearTimeout(saveTimerRef.current)
    setNoteSaveStatus(null)
    saveTimerRef.current = setTimeout(() => saveNote(itemId, text), 1000)
  }, [saveNote])

  const toggleNote = useCallback((itemId) => {
    setOpenNoteId(prev => {
      if (prev === itemId) {
        saveNote(itemId, noteDraft)
        setNoteDraft('')
        return null
      }
      if (prev) saveNote(prev, noteDraft)
      setNoteDraft(notes[itemId] || '')
      setNoteSaveStatus(null)
      return itemId
    })
  }, [saveNote, noteDraft, notes])

  const handleAssign = useCallback((itemId, memberUid, item, phaseNumber) => {
    const member = members.find(m => m.uid === memberUid)
    if (!member) return
    const newAssignments = { ...assignments, [itemId]: memberUid }
    updateProject(activeProject.id, { assignments: newAssignments })
    logAndDispatch('task_assign', {
      taskId: itemId, taskText: item.text.slice(0, 80), phase: phaseNumber,
      assigneeUid: member.uid, assigneeName: member.displayName || member.email,
    }, user)
    // Notify the assignee (unless assigning to self)
    if (memberUid !== user?.uid && addNotification) {
      const actorName = user?.displayName || user?.email || 'Someone'
      addNotification(memberUid, 'task_assign', `${actorName} assigned you to "${item.text.slice(0, 60)}"`, { taskId: itemId, phase: phaseNumber })
    }
  }, [assignments, members, activeProject?.id, updateProject, logAndDispatch, user, addNotification])

  const handleUnassign = useCallback((itemId, item, phaseNumber) => {
    const prevUid = assignments[itemId]
    const prevMember = members.find(m => m.uid === prevUid)
    const newAssignments = { ...assignments }
    delete newAssignments[itemId]
    updateProject(activeProject.id, { assignments: newAssignments })
    logAndDispatch('task_unassign', {
      taskId: itemId, taskText: item.text.slice(0, 80), phase: phaseNumber,
      assigneeUid: prevUid, assigneeName: prevMember?.displayName || prevMember?.email || 'Unknown',
    }, user)
    // Notify the unassigned user (unless unassigning self)
    if (prevUid && prevUid !== user?.uid && addNotification) {
      const actorName = user?.displayName || user?.email || 'Someone'
      addNotification(prevUid, 'task_unassign', `${actorName} unassigned you from "${item.text.slice(0, 60)}"`, { taskId: itemId, phase: phaseNumber })
    }
  }, [assignments, members, activeProject?.id, updateProject, logAndDispatch, user, addNotification])

  // Comments handlers
  const toggleComments = useCallback((itemId) => {
    setOpenCommentId(prev => {
      if (prev === itemId) { setCommentDraft(''); return null }
      setCommentDraft('')
      return itemId
    })
  }, [])

  const handleCommentAdd = useCallback((itemId, text, item, phaseNumber) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: trimmed,
      authorUid: user?.uid || '',
      authorName: user?.displayName || user?.email || 'Unknown',
      authorEmail: user?.email || '',
      timestamp: new Date().toISOString(),
    }
    const taskComments = comments[itemId] || []
    const newComments = { ...comments, [itemId]: [...taskComments, newComment] }
    updateProject(activeProject.id, { comments: newComments })
    logAndDispatch('comment', {
      taskId: itemId, taskText: item.text.slice(0, 80), phase: phaseNumber,
    }, user)
    // Notify the task assignee about the comment (unless commenter is the assignee)
    if (addNotification) {
      const assigneeUid = assignments[itemId]
      if (assigneeUid && assigneeUid !== user?.uid) {
        const actorName = user?.displayName || user?.email || 'Someone'
        addNotification(assigneeUid, 'comment', `${actorName} commented on "${item.text.slice(0, 60)}"`, { taskId: itemId, phase: phaseNumber })
      }
    }
    setCommentDraft('')
  }, [comments, assignments, activeProject?.id, updateProject, logAndDispatch, user, addNotification])

  const handleCommentDelete = useCallback((itemId, commentId) => {
    const taskComments = comments[itemId] || []
    const newComments = { ...comments, [itemId]: taskComments.filter(c => c.id !== commentId) }
    if (newComments[itemId].length === 0) delete newComments[itemId]
    updateProject(activeProject.id, { comments: newComments })
  }, [comments, activeProject?.id, updateProject])

  const togglePhase = useCallback((phaseId) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }))
  }, [])

  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: prev[categoryId] === false ? true : false }))
  }, [])
  const isCategoryExpanded = useCallback((categoryId) => expandedCategories[categoryId] !== false, [expandedCategories])

  const handleBulkCheck = useCallback((category) => {
    const newChecked = { ...checked }
    category.items.forEach(item => { newChecked[item.id] = true })
    updateProject(activeProject.id, { checked: newChecked })
  }, [checked, activeProject?.id, updateProject])

  const handleQuickView = useCallback((id) => {
    setQuickViewItem(prev => prev === id ? null : id)
  }, [])

  const handleBulkUncheck = useCallback((category) => {
    const newChecked = { ...checked }
    category.items.forEach(item => { newChecked[item.id] = false })
    updateProject(activeProject.id, { checked: newChecked })
  }, [checked, activeProject?.id, updateProject])

  // ── Progress helpers ──

  const getPhaseProgress = (phase) => {
    let total = 0, done = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => { total++; if (checked[item.id]) done++ })
    })
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  const totalProgress = useMemo(() => {
    let total = 0, done = 0
    phases.forEach(phase => {
      phase.categories.forEach(cat => {
        cat.items.forEach(item => { total++; if (checked[item.id]) done++ })
      })
    })
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [phases, checked])

  // ── Phase completion detection ──

  useEffect(() => {
    if (activeProject?.id !== activeProjectIdRef.current) {
      activeProjectIdRef.current = activeProject?.id
      const init = {}
      phases.forEach(phase => { init[phase.id] = getPhaseProgress(phase).percent })
      prevPhaseProgressRef.current = init
    }
  }, [activeProject?.id])

  useEffect(() => {
    const prev = prevPhaseProgressRef.current
    phases.forEach(phase => {
      const progress = getPhaseProgress(phase)
      const prevPercent = prev[phase.id]
      if (prevPercent !== undefined && prevPercent < 100 && progress.percent === 100) {
        setCelebratingPhase(phase.id)
        addToast('success', `${phase.icon} Phase ${phase.number} complete: ${phase.title}`)
        setTimeout(() => setCelebratingPhase(null), 650)
      }
    })
    const next = {}
    phases.forEach(phase => { next[phase.id] = getPhaseProgress(phase).percent })
    prevPhaseProgressRef.current = next
  }, [checked])

  // ── Filtering ──

  const filteredPhases = useMemo(() => {
    if (!debouncedSearch.trim()) return phases
    const q = debouncedSearch.toLowerCase()
    return phases.map(phase => ({
      ...phase,
      categories: phase.categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.text.toLowerCase().includes(q) ||
          item.detail.toLowerCase().includes(q)
        )
      })).filter(cat => cat.items.length > 0)
    })).filter(phase => phase.categories.length > 0)
  }, [debouncedSearch, phases])

  // ── Render ──

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Project Context */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Checklist</h2>
          <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '6.1875rem', background: 'rgba(46,204,113,0.1)', color: 'var(--color-phase-3)', fontWeight: 500 }}>{activeProject?.name}</span>
          <div style={{ marginLeft: 'auto' }}>
            <PresenceAvatars members={onlineMembers} currentUserUid={user?.uid} variant="compact" />
          </div>
        </div>
        {activeProject?.url && <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{activeProject.url}</p>}
      </div>

      <ChecklistStats totalProgress={totalProgress} phaseCount={phases.length} />

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: searchFocused ? 'var(--color-phase-3)' : 'var(--text-disabled)', transition: 'color 200ms' }} />
        <input
          type="text"
          placeholder="Search tasks... (Ctrl+K)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="input-field"
          aria-label="Search tasks"
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {/* Global expand/collapse all phases */}
      {!debouncedSearch.trim() && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              const allExpanded = phases.every(phase => expandedPhases[phase.id])
              const newState = {}
              phases.forEach(phase => { newState[phase.id] = !allExpanded })
              setExpandedPhases(newState)
            }}
            className="checklist-bulk-link"
          >
            {phases.every(phase => expandedPhases[phase.id]) ? 'Collapse all phases' : 'Expand all phases'}
          </button>
        </div>
      )}

      {/* No search results */}
      {debouncedSearch.trim() && filteredPhases.length === 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', border: '2px dashed var(--border-default)' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Search size={20} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>No matching tasks</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Try a different search term</p>
        </div>
      )}

      {/* All complete state */}
      {totalProgress.done === totalProgress.total && totalProgress.total > 0 && !searchQuery.trim() && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', border: '1px solid rgba(46,204,113,0.2)', background: 'rgba(46,204,113,0.03)' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(46,204,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '0.25rem' }}>All tasks complete!</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Your AEO implementation is fully optimized.</p>
        </div>
      )}

      {/* Verify Dialog */}
      {(verifyItem || verifyClosing) && (
        <VerifyDialog
          item={verifyItem}
          projectUrl={activeProject?.url || ''}
          onVerified={handleVerified}
          onCancel={handleCloseVerify}
          isClosing={verifyClosing}
          onExited={handleVerifyExited}
        />
      )}

      {/* Phase Cards */}
      {filteredPhases.map(phase => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          progress={getPhaseProgress(phase)}
          isExpanded={expandedPhases[phase.id] || !!debouncedSearch.trim()}
          isPriority={getPhasePriority(phase.number, activeProject?.questionnaire)}
          isCelebrating={celebratingPhase === phase.id}
          expandedCategories={expandedCategories}
          checked={checked}
          bouncingId={bouncingId}
          notes={notes}
          openNoteId={openNoteId}
          noteDraft={noteDraft}
          noteSaveStatus={noteSaveStatus}
          noteTimestamps={noteTimestamps}
          verifications={activeProject?.verifications}
          quickViewItem={quickViewItem}
          assignments={assignments}
          comments={comments}
          openCommentId={openCommentId}
          commentDraft={commentDraft}
          members={members}
          onTogglePhase={togglePhase}
          onToggleCategory={toggleCategory}
          isCategoryExpanded={isCategoryExpanded}
          onBulkCheck={handleBulkCheck}
          onBulkUncheck={handleBulkUncheck}
          setExpandedCategories={setExpandedCategories}
          onToggle={handleToggle}
          onQuickView={handleQuickView}
          onDocItem={setDocItem}
          onToggleNote={toggleNote}
          onNoteChange={handleNoteChange}
          onNoteSave={saveNote}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
          onToggleComments={toggleComments}
          onCommentChange={setCommentDraft}
          onCommentAdd={handleCommentAdd}
          onCommentDelete={handleCommentDelete}
        />
      ))}
    </div>
  )
}
