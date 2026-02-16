import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, Search, BookOpen, Info, CheckCircle2, ListChecks, Star, StickyNote } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import VerifyDialog from '../components/VerifyDialog'
import { getPhasePriority, getFirstPriorityPhase } from '../utils/getRecommendations'

/* ── Animated Collapsible ── */
function CollapsibleContent({ expanded, children }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(expanded ? 'auto' : 0)
  const [overflow, setOverflow] = useState(expanded ? 'visible' : 'hidden')
  const reducedMotion = useReducedMotion()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (expanded) {
        setHeight('auto')
        setOverflow('visible')
      }
      return
    }

    if (expanded) {
      const h = contentRef.current?.scrollHeight || 0
      setHeight(h + 'px')
      setOverflow('hidden')
      const timer = setTimeout(() => {
        setHeight('auto')
        setOverflow('visible')
      }, reducedMotion ? 0 : 250)
      return () => clearTimeout(timer)
    } else {
      const h = contentRef.current?.scrollHeight || 0
      setHeight(h + 'px')
      setOverflow('hidden')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight('0px')
        })
      })
    }
  }, [expanded, reducedMotion])

  return (
    <div
      ref={contentRef}
      style={{
        height: height === 'auto' ? 'auto' : height,
        overflow,
        transition: reducedMotion ? 'none' : 'height 250ms ease-out',
      }}
    >
      {children}
    </div>
  )
}

export default function ChecklistView({ phases, activeProject, toggleCheckItem, setActiveView, setDocItem, updateProject }) {
  const firstPriority = getFirstPriorityPhase(activeProject?.questionnaire)
  const [expandedPhases, setExpandedPhases] = useState({ [firstPriority]: true })
  const [searchQuery, setSearchQuery] = useState('')
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

  const checked = activeProject?.checked || {}
  const notes = activeProject?.notes || {}
  const noteTimestamps = activeProject?.noteTimestamps || {}

  const handleToggle = (itemId, item) => {
    if (checked[itemId]) {
      toggleCheckItem(itemId)
    } else {
      setVerifyItem(item)
    }
  }

  const handleVerified = (verification) => {
    const newVerifications = {
      ...(activeProject.verifications || {}),
      [verifyItem.id]: verification,
    }
    updateProject(activeProject.id, { verifications: newVerifications })
    toggleCheckItem(verifyItem.id)
    setBouncingId(verifyItem.id)
    setTimeout(() => setBouncingId(null), 350)
    handleCloseVerify()
  }

  const handleCloseVerify = () => {
    setVerifyClosing(true)
  }

  const handleVerifyExited = () => {
    setVerifyClosing(false)
    setVerifyItem(null)
  }

  // Notes handlers
  const saveNote = (itemId, text) => {
    clearTimeout(saveTimerRef.current)
    clearTimeout(savedTimerRef.current)
    const trimmed = text.trim()
    const newNotes = { ...notes, [itemId]: trimmed }
    const newTimestamps = { ...noteTimestamps, [itemId]: new Date().toISOString() }
    // Remove empty notes
    if (!trimmed) {
      delete newNotes[itemId]
      delete newTimestamps[itemId]
    }
    updateProject(activeProject.id, { notes: newNotes, noteTimestamps: newTimestamps })
    setNoteSaveStatus('saved')
    savedTimerRef.current = setTimeout(() => setNoteSaveStatus(null), 2000)
  }

  const handleNoteChange = (itemId, text) => {
    setNoteDraft(text)
    clearTimeout(saveTimerRef.current)
    setNoteSaveStatus(null)
    saveTimerRef.current = setTimeout(() => saveNote(itemId, text), 1000)
  }

  const toggleNote = (itemId) => {
    if (openNoteId === itemId) {
      // Close — save current draft first
      saveNote(itemId, noteDraft)
      setOpenNoteId(null)
      setNoteDraft('')
    } else {
      // Save any previously open note
      if (openNoteId) {
        saveNote(openNoteId, noteDraft)
      }
      // Open new note
      setOpenNoteId(itemId)
      setNoteDraft(notes[itemId] || '')
      setNoteSaveStatus(null)
    }
  }

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }))
  }

  const getPhaseProgress = (phase) => {
    let total = 0, done = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => {
        total++
        if (checked[item.id]) done++
      })
    })
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  const getTotalProgress = () => {
    let total = 0, done = 0
    phases.forEach(phase => {
      phase.categories.forEach(cat => {
        cat.items.forEach(item => {
          total++
          if (checked[item.id]) done++
        })
      })
    })
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  const totalProgress = getTotalProgress()

  const filteredPhases = searchQuery.trim()
    ? phases.map(phase => ({
        ...phase,
        categories: phase.categories.map(cat => ({
          ...cat,
          items: cat.items.filter(item =>
            item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.detail.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })).filter(cat => cat.items.length > 0)
      })).filter(phase => phase.categories.length > 0)
    : phases

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Project Context */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Checklist</h2>
          <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '6.1875rem', background: 'rgba(46,204,113,0.1)', color: 'var(--color-phase-3)', fontWeight: 500 }}>{activeProject?.name}</span>
        </div>
        {activeProject?.url && <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{activeProject.url}</p>}
      </div>

      {/* Stats Grid — 4 columns */}
      <div className="checklist-stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>{totalProgress.done}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Remaining</div>
          <div className="stat-card-value" style={{ color: 'var(--color-phase-1)' }}>{totalProgress.total - totalProgress.done}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Phases</div>
          <div className="stat-card-value" style={{ color: 'var(--text-primary)' }}>{phases.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total</div>
          <div className="stat-card-value" style={{ color: 'var(--text-primary)' }}>{totalProgress.total}</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)' }}>Overall Progress</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalProgress.done}/{totalProgress.total} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({totalProgress.percent}%)</span>
          </span>
        </div>
        <div style={{ width: '100%', height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '6.1875rem', overflow: 'hidden' }}>
          <div
            style={{
              width: `${totalProgress.percent}%`,
              height: '100%',
              borderRadius: '6.1875rem',
              transition: 'width 500ms ease-out',
              background: 'linear-gradient(90deg, var(--color-phase-1), var(--color-phase-2), var(--color-phase-3), var(--color-phase-4), var(--color-phase-5), var(--color-phase-6), var(--color-phase-7))',
            }}
          />
        </div>
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
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {/* No search results */}
      {searchQuery.trim() && filteredPhases.length === 0 && (
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
      {filteredPhases.map(phase => {
        const progress = getPhaseProgress(phase)
        const isExpanded = expandedPhases[phase.id] || searchQuery.trim()
        const isPriority = getPhasePriority(phase.number, activeProject?.questionnaire)

        return (
          <div key={phase.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(phase.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: '1.125rem' }}>{phase.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: phase.color }}>
                    Phase {phase.number}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{phase.timeline}</span>
                  {isPriority && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
                      fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-phase-5)',
                      padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
                      background: 'rgba(245,158,11,0.1)',
                    }}>
                      <Star size={9} style={{ fill: 'var(--color-phase-5)' }} />
                      Recommended
                    </span>
                  )}
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.125rem', color: 'var(--text-primary)' }}>{phase.title}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: phase.color }}>
                    {progress.percent}%
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>{progress.done}/{progress.total}</span>
                </div>
                <div style={{ width: '4rem', height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '6.1875rem', overflow: 'hidden' }}>
                  <div
                    style={{ width: `${progress.percent}%`, height: '100%', borderRadius: '6.1875rem', backgroundColor: phase.color, transition: 'width 300ms' }}
                  />
                </div>
                <ChevronDown
                  size={14}
                  style={{ color: 'var(--text-tertiary)', transform: isExpanded ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }}
                />
              </div>
            </button>

            {/* Phase Content — Animated */}
            <CollapsibleContent expanded={isExpanded}>
              <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {phase.categories.map(category => (
                  <div key={category.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-page)', opacity: 0.8 }}>
                      <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{category.name}</h4>
                    </div>
                    <div>
                      {category.items.map(item => (
                        <div key={item.id} className="group" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggle(item.id, item)}
                              className={bouncingId === item.id ? 'check-bounce' : ''}
                              style={{
                                marginTop: '0.125rem', flexShrink: 0, width: '1.125rem', height: '1.125rem', borderRadius: '0.25rem',
                                border: `2px solid ${checked[item.id] ? phase.color : 'var(--border-default)'}`,
                                background: checked[item.id] ? phase.color : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 150ms', padding: 0,
                              }}
                            >
                              {checked[item.id] && <CheckCircle2 size={11} style={{ color: '#fff' }} />}
                            </button>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '0.8125rem', color: checked[item.id] ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: checked[item.id] ? 'line-through' : 'none', transition: 'all 200ms' }}>
                                {item.text}
                                {checked[item.id] && activeProject?.verifications?.[item.id] && (
                                  <span
                                    style={{
                                      display: 'inline-block', fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '6.1875rem', fontWeight: 500, marginLeft: '0.5rem', verticalAlign: 'middle',
                                      background: activeProject.verifications[item.id].method === 'ai' ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.06)',
                                      color: activeProject.verifications[item.id].method === 'ai' ? 'var(--color-phase-3)' : 'var(--text-tertiary)',
                                    }}
                                    title={activeProject.verifications[item.id].note}
                                  >
                                    {activeProject.verifications[item.id].method === 'ai' ? 'AI Verified' : 'Manual'}
                                  </span>
                                )}
                                {notes[item.id] && openNoteId !== item.id && (
                                  <span className="checklist-note-indicator" title="Has notes">
                                    <StickyNote size={10} />
                                  </span>
                                )}
                              </p>
                              {quickViewItem === item.id && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem', lineHeight: 1.5 }}>{item.detail}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, opacity: 0 }} className="group-hover:opacity-100 transition-opacity duration-150">
                              <button
                                onClick={() => setQuickViewItem(quickViewItem === item.id ? null : item.id)}
                                style={{ padding: '0.375rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                                title="Quick view"
                              >
                                <Info size={13} />
                              </button>
                              <button
                                onClick={() => setDocItem(item)}
                                style={{ padding: '0.375rem', borderRadius: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                                title="Full documentation"
                              >
                                <BookOpen size={13} />
                              </button>
                              <button
                                onClick={() => toggleNote(item.id)}
                                className={`checklist-note-btn${notes[item.id] ? ' has-notes' : ''}`}
                                title={notes[item.id] ? 'Edit notes' : 'Add notes'}
                              >
                                <StickyNote size={13} />
                              </button>
                            </div>
                          </div>
                          {/* Notes Panel */}
                          {openNoteId === item.id && (
                            <div className="checklist-note-panel" style={{ margin: '0.25rem 1rem 0.5rem 1.875rem' }}>
                              <div className="checklist-note-header">
                                <span className="checklist-note-label">Notes</span>
                                {noteSaveStatus === 'saved' && (
                                  <span className="checklist-note-saved">Saved ✓</span>
                                )}
                              </div>
                              <textarea
                                className="checklist-note-textarea"
                                value={noteDraft}
                                onChange={e => handleNoteChange(item.id, e.target.value)}
                                onBlur={() => saveNote(item.id, noteDraft)}
                                placeholder="Add notes about this task..."
                                rows={3}
                                autoFocus
                              />
                              {noteTimestamps[item.id] && (
                                <span className="checklist-note-timestamp">
                                  Updated: {new Date(noteTimestamps[item.id]).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        )
      })}
    </div>
  )
}
