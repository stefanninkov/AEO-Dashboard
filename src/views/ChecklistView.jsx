import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Search, CheckCircle2, Lightbulb, ChevronDown } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useDebounce } from '../hooks/useDebounce'
import VerifyDialog from '../components/VerifyDialog'
import { getPhasePriority, getFirstPriorityPhase } from '../utils/getRecommendations'
import { useActivityWithWebhooks } from '../hooks/useActivityWithWebhooks'
import { fireWebhooks } from '../utils/webhookDispatcher'
import ChecklistStats from './checklist/ChecklistStats'
import PhaseCard from './checklist/PhaseCard'
import PresenceAvatars from '../components/PresenceAvatars'

const KEY_PRINCIPLES = [
  'AEO is about being the best answer, not just being found',
  'Structured data is non-negotiable',
  'The 40-60 word answer paragraph is your most powerful weapon',
  'E-E-A-T matters more in AI search',
  'Monitor relentlessly \u2014 AI engines evolve weekly',
  'Test across ALL platforms \u2014 each behaves differently',
  'AEO and SEO are complementary',
]

const DELIVERABLES = {
  1: 'Complete audit document with content gaps and technical baseline metrics.',
  2: 'Schema markup implemented and validated on all page templates.',
  3: 'Optimized content with answer paragraphs, FAQ sections, and proper hierarchy.',
  4: 'Fully crawlable site with semantic HTML, feeds, and optimized meta tags.',
  5: 'Established brand entity with authority signals and citation network.',
  6: 'Validated AEO implementation with test results across all AI platforms.',
  7: 'Ongoing monitoring system with monthly reports and iteration plan.',
}

export default function ChecklistView({ phases, activeProject, toggleCheckItem, setActiveView, setDocItem, updateProject, user, onlineMembers, addNotification }) {
  const firstPriority = getFirstPriorityPhase(activeProject?.questionnaire)
  const [principlesOpen, setPrinciplesOpen] = useState(false)
  const [expandedPhases, setExpandedPhases] = useState({ [firstPriority]: true })
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 200)
  const [bouncingId, setBouncingId] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [verifyItem, setVerifyItem] = useState(null)
  const [verifyClosing, setVerifyClosing] = useState(false)

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
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>AEO Guide</h2>
          <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '6.1875rem', background: 'rgba(46,204,113,0.1)', color: 'var(--color-phase-3)', fontWeight: 500 }}>{activeProject?.name}</span>
          <div style={{ marginLeft: 'auto' }}>
            <PresenceAvatars members={onlineMembers} currentUserUid={user?.uid} variant="compact" />
          </div>
        </div>
        {activeProject?.url && <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{activeProject.url}</p>}
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          Follow this step-by-step process to optimize your site for AI search engines.
        </p>
      </div>

      <ChecklistStats totalProgress={totalProgress} phaseCount={phases.length} />

      {/* Key Principles */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setPrinciplesOpen(prev => !prev)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          <Lightbulb size={14} style={{ color: 'var(--color-phase-5)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Key Principles</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginLeft: '0.25rem' }}>7 fundamentals</span>
          <ChevronDown size={12} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', transform: principlesOpen ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }} />
        </button>
        {principlesOpen && (
          <div style={{ padding: '0 1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            {KEY_PRINCIPLES.map((principle, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', paddingTop: idx === 0 ? '0.75rem' : 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-phase-5)', minWidth: '1.25rem', textAlign: 'right', flexShrink: 0, marginTop: '0.0625rem' }}>{idx + 1}.</span>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{principle}</p>
              </div>
            ))}
          </div>
        )}
      </div>

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
          deliverable={DELIVERABLES[phase.number]}
          isExpanded={expandedPhases[phase.id] || !!debouncedSearch.trim()}
          isPriority={getPhasePriority(phase.number, activeProject?.questionnaire)}
          isCelebrating={celebratingPhase === phase.id}
          expandedCategories={expandedCategories}
          checked={checked}
          bouncingId={bouncingId}
          verifications={activeProject?.verifications}
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
          onDocItem={setDocItem}
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
