import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, Search, BookOpen, Info, CheckCircle2, ListChecks, Star } from 'lucide-react'
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

  const checked = activeProject?.checked || {}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Project Context */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Checklist</h2>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(46,204,113,0.1)', color: 'var(--color-phase-3)', fontWeight: 500 }}>{activeProject?.name}</span>
        </div>
        {activeProject?.url && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{activeProject.url}</p>}
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
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)' }}>Overall Progress</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalProgress.done}/{totalProgress.total} <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>({totalProgress.percent}%)</span>
          </span>
        </div>
        <div style={{ width: '100%', height: 6, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              width: `${totalProgress.percent}%`,
              height: '100%',
              borderRadius: 99,
              transition: 'width 500ms ease-out',
              background: 'linear-gradient(90deg, var(--color-phase-1), var(--color-phase-2), var(--color-phase-3), var(--color-phase-4), var(--color-phase-5), var(--color-phase-6), var(--color-phase-7))',
            }}
          />
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: searchFocused ? 'var(--color-phase-3)' : 'var(--text-disabled)', transition: 'color 200ms' }} />
        <input
          type="text"
          placeholder="Search tasks... (Ctrl+K)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="input-field"
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* No search results */}
      {searchQuery.trim() && filteredPhases.length === 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', border: '2px dashed var(--border-default)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Search size={20} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>No matching tasks</h3>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Try a different search term</p>
        </div>
      )}

      {/* All complete state */}
      {totalProgress.done === totalProgress.total && totalProgress.total > 0 && !searchQuery.trim() && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', border: '1px solid rgba(46,204,113,0.2)', background: 'rgba(46,204,113,0.03)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(46,204,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--color-success)', marginBottom: 4 }}>All tasks complete!</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your AEO implementation is fully optimized.</p>
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
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: 18 }}>{phase.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: phase.color }}>
                    Phase {phase.number}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{phase.timeline}</span>
                  {isPriority && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 10, fontWeight: 600, color: 'var(--color-phase-5)',
                      padding: '1px 6px', borderRadius: 4,
                      background: 'rgba(245,158,11,0.1)',
                    }}>
                      <Star size={9} style={{ fill: 'var(--color-phase-5)' }} />
                      Recommended
                    </span>
                  )}
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, marginTop: 2, color: 'var(--text-primary)' }}>{phase.title}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: phase.color }}>
                    {progress.percent}%
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)' }}>{progress.done}/{progress.total}</span>
                </div>
                <div style={{ width: 64, height: 6, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{ width: `${progress.percent}%`, height: '100%', borderRadius: 99, backgroundColor: phase.color, transition: 'width 300ms' }}
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
                    <div style={{ padding: '8px 16px', background: 'var(--bg-page)', opacity: 0.8 }}>
                      <h4 style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{category.name}</h4>
                    </div>
                    <div>
                      {category.items.map(item => (
                        <div key={item.id} className="group" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px' }}>
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggle(item.id, item)}
                              className={bouncingId === item.id ? 'check-bounce' : ''}
                              style={{
                                marginTop: 2, flexShrink: 0, width: 18, height: 18, borderRadius: 4,
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
                              <p style={{ fontSize: 13, color: checked[item.id] ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: checked[item.id] ? 'line-through' : 'none', transition: 'all 200ms' }}>
                                {item.text}
                                {checked[item.id] && activeProject?.verifications?.[item.id] && (
                                  <span
                                    style={{
                                      display: 'inline-block', fontSize: 10, padding: '2px 6px', borderRadius: 99, fontWeight: 500, marginLeft: 8, verticalAlign: 'middle',
                                      background: activeProject.verifications[item.id].method === 'ai' ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.06)',
                                      color: activeProject.verifications[item.id].method === 'ai' ? 'var(--color-phase-3)' : 'var(--text-tertiary)',
                                    }}
                                    title={activeProject.verifications[item.id].note}
                                  >
                                    {activeProject.verifications[item.id].method === 'ai' ? 'AI Verified' : 'Manual'}
                                  </span>
                                )}
                              </p>
                              {quickViewItem === item.id && (
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>{item.detail}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, opacity: 0 }} className="group-hover:opacity-100 transition-opacity duration-150">
                              <button
                                onClick={() => setQuickViewItem(quickViewItem === item.id ? null : item.id)}
                                style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                                title="Quick view"
                              >
                                <Info size={13} />
                              </button>
                              <button
                                onClick={() => setDocItem(item)}
                                style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                                title="Full documentation"
                              >
                                <BookOpen size={13} />
                              </button>
                            </div>
                          </div>
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
