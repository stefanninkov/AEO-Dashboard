/**
 * LeadDetailPanel — Slide-in panel showing full lead details.
 *
 * Shows: contact info, score ring, category bars, qualification,
 * individual answers per category, priorities, admin notes, actions.
 */
import { useState, useEffect, useRef } from 'react'
import { X, Mail, Globe, Clock, Monitor, Languages, Send, UserCheck, Copy, Check } from 'lucide-react'
import {
  CATEGORIES, SCORED_QUESTIONS, QUALIFYING_QUESTIONS, QUIZ_FLOW,
  getScoreTier, getLeadTier, MAX_TOTAL_SCORE,
} from '../../utils/scorecardScoring'

/* ── Helpers ── */
function formatDate(val) {
  if (!val) return '\u2014'
  const d = val.toDate ? val.toDate() : new Date(val)
  if (isNaN(d.getTime())) return '\u2014'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const LEAD_TIER_DISPLAY = {
  hot: { emoji: '\uD83D\uDD25', label: 'Hot', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  warm: { emoji: '\uD83D\uDFE1', label: 'Warm', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  cold: { emoji: '\u26AA', label: 'Cold', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
}

const ROLE_LABELS = {
  agency_owner: 'Agency Owner / Partner',
  seo_manager: 'SEO Manager / Director',
  inhouse: 'In-house Marketing / SEO',
  freelance: 'Freelance Consultant',
  other: 'Other / Just exploring',
}

const WEBSITE_LABELS = {
  '10plus': '10+ client websites',
  '3to9': '3\u20139 websites',
  '1to2': '1\u20132 websites',
  just_own: 'Just my own',
}

const TIMELINE_LABELS = {
  immediately: 'Immediately \u2014 urgent',
  '1to3months': 'Within 1\u20133 months',
  exploring: 'Exploring for the future',
  curious: 'Just curious for now',
}

const QUALIFYING_POINTS = {
  role: { agency_owner: 4, seo_manager: 3, inhouse: 2, freelance: 2, other: 0 },
  websiteCount: { '10plus': 4, '3to9': 3, '1to2': 1, just_own: 0 },
  timeline: { immediately: 4, '1to3months': 3, exploring: 1, curious: 0 },
}

/* ── Score Ring (mini) ── */
function MiniScoreRing({ score, max, color, size = 5 }) {
  const r = (size * 16 - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / max) * circ
  return (
    <div style={{ width: `${size}rem`, height: `${size}rem`, position: 'relative' }}>
      <svg viewBox={`0 0 ${size * 16} ${size * 16}`} style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
        <circle cx={size * 8} cy={size * 8} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
        <circle cx={size * 8} cy={size * 8} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem', color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>/ {max}</span>
      </div>
    </div>
  )
}

/* ── Category Bar ── */
function CategoryBar({ label, score, maxScore, color }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', width: '8rem', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '0.3125rem', background: 'var(--hover-bg)', borderRadius: '0.1875rem', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '0.1875rem', transition: 'width 400ms ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '2.25rem', textAlign: 'right' }}>{score}/{maxScore}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)', minWidth: '2rem', textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

/* ── Section Divider ── */
function SectionDivider({ title }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
      color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06rem',
      padding: '0.75rem 0 0.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
      marginBottom: '0.5rem',
    }}>
      {title}
    </div>
  )
}

/* ── Main Component ── */
export default function LeadDetailPanel({ lead, onClose, onMarkInvited, onMarkNudged, onUpdateNotes }) {
  const [notes, setNotes] = useState(lead?.adminNotes || '')
  const [copied, setCopied] = useState(false)
  const notesRef = useRef(null)

  // Sync notes when lead changes
  useEffect(() => {
    setNotes(lead?.adminNotes || '')
  }, [lead?.id])

  if (!lead) return null

  const scorecard = lead.scorecard || {}
  const qualification = lead.qualification || {}
  const isCompleted = scorecard.completed
  const tier = isCompleted ? getScoreTier(scorecard.totalScore) : null
  const leadTierInfo = LEAD_TIER_DISPLAY[lead.leadTier] || LEAD_TIER_DISPLAY.cold
  const catScores = scorecard.categoryScores || {}
  const answers = scorecard.answers || {}

  // Status label
  let statusLabel = 'Active'
  if (lead.converted) statusLabel = 'Converted'
  else if (lead.invited) statusLabel = 'Invited'
  else if (scorecard.abandonedAtStep != null && !isCompleted) statusLabel = `Abandoned at step ${scorecard.abandonedAtStep + 1}`

  const handleNotesBlur = () => {
    if (notes !== (lead.adminNotes || '')) {
      onUpdateNotes?.(lead.id, notes)
    }
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(lead.email || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Build individual answers grouped by category
  const answersByCategory = CATEGORIES.map(cat => {
    const qs = SCORED_QUESTIONS.filter(q => q.category === cat.id)
    const catAnswers = qs.map(q => {
      const val = answers[q.id]
      const opt = q.options.find(o => o.value === val)
      return { id: q.id, answer: val, points: opt?.points ?? null, optIndex: opt ? q.options.indexOf(opt) : -1 }
    })
    return { ...cat, answers: catAnswers, subtotal: catAnswers.reduce((s, a) => s + (a.points || 0), 0) }
  })

  const CAT_LABELS = {
    contentStructure: 'Content & Structure',
    technicalSchema: 'Technical & Schema',
    aiVisibility: 'AI Visibility',
    strategyCompetition: 'Strategy & Competition',
  }

  // Question text lookup (hardcoded since admin doesn't use i18n)
  const Q_TEXT = {
    q1: 'FAQ sections?', q2: 'Update frequency?', q3: 'AI-friendly content?',
    q4: 'Schema / JSON-LD?', q5: 'AI crawlers?', q6: 'Sitemap?',
    q7: 'AI citation testing?', q8: 'AI Overviews?', q9: 'AI traffic tracking?',
    q10: 'Competitor AI?', q11: 'AEO strategy?',
  }

  // Answer text
  const getAnswerText = (qId, optIndex) => {
    const q = SCORED_QUESTIONS.find(sq => sq.id === qId)
    if (!q || optIndex < 0) return '\u2014'
    // Short labels
    return q.options[optIndex]?.value?.replace(/_/g, ' ') || '\u2014'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          zIndex: 199, transition: 'opacity 200ms',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '28rem', maxWidth: '100vw',
        background: 'var(--bg-page)', borderLeft: '0.0625rem solid var(--border-subtle)',
        zIndex: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 200ms ease',
      }}>

        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{lead.name || '\u2014'}</span>
              {lead.leadTier && (
                <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: 99, background: leadTierInfo.bg, color: leadTierInfo.color }}>
                  {leadTierInfo.emoji} {leadTierInfo.label}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={copyEmail} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0 }}>
              {copied ? <Check size={11} /> : <Mail size={11} />}
              {lead.email}
            </button>
            {lead.websiteUrl && (
              <a href={lead.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                <Globe size={11} />
                {lead.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={10} /> {formatDate(lead.signedUpAt)}
            </span>
            {lead.language && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Languages size={10} /> {lead.language}
              </span>
            )}
            {lead.screenSize && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Monitor size={10} /> {lead.screenSize}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>

          {/* ── AEO Score ── */}
          {isCompleted ? (
            <>
              <SectionDivider title={`AEO Score: ${scorecard.totalScore}/${MAX_TOTAL_SCORE} \u2014 ${tier?.label || ''}`} />
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <MiniScoreRing score={scorecard.totalScore} max={MAX_TOTAL_SCORE} color={tier?.color || 'var(--accent)'} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  {CATEGORIES.map(cat => (
                    <CategoryBar
                      key={cat.id}
                      label={CAT_LABELS[cat.id]}
                      score={catScores[cat.id] || 0}
                      maxScore={cat.maxScore}
                      color={cat.color}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <SectionDivider title="AEO Score" />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-disabled)', fontStyle: 'italic' }}>
                {scorecard.abandonedAtStep != null
                  ? `Abandoned at step ${scorecard.abandonedAtStep + 1} of 14`
                  : 'Quiz not started'}
              </p>
            </>
          )}

          {/* ── Qualification ── */}
          {Object.keys(qualification).length > 0 && (
            <>
              <SectionDivider title="Qualification" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {qualification.role && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Role:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {ROLE_LABELS[qualification.role] || qualification.role}
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-disabled)', marginLeft: '0.5rem' }}>
                        ({QUALIFYING_POINTS.role[qualification.role] ?? '?'}/4 pts)
                      </span>
                    </span>
                  </div>
                )}
                {qualification.websiteCount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Websites:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {WEBSITE_LABELS[qualification.websiteCount] || qualification.websiteCount}
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-disabled)', marginLeft: '0.5rem' }}>
                        ({QUALIFYING_POINTS.websiteCount[qualification.websiteCount] ?? '?'}/4 pts)
                      </span>
                    </span>
                  </div>
                )}
                {qualification.timeline && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Timeline:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {TIMELINE_LABELS[qualification.timeline] || qualification.timeline}
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-disabled)', marginLeft: '0.5rem' }}>
                        ({QUALIFYING_POINTS.timeline[qualification.timeline] ?? '?'}/4 pts)
                      </span>
                    </span>
                  </div>
                )}
                {lead.leadScore != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '0.25rem', borderTop: '0.0625rem solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Lead Score:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: leadTierInfo.color }}>
                      {lead.leadScore}/12 \u2192 {leadTierInfo.emoji} {leadTierInfo.label}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Individual Answers ── */}
          {isCompleted && (
            <>
              <SectionDivider title="Individual Answers" />
              {answersByCategory.map(cat => (
                <div key={cat.id} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {CAT_LABELS[cat.id]} ({cat.subtotal}/{cat.maxScore})
                  </div>
                  {cat.answers.map(a => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', padding: '0.125rem 0', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-tertiary)', minWidth: 0 }}>{Q_TEXT[a.id]}</span>
                      <span style={{ color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                        {getAnswerText(a.id, a.optIndex)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: a.points > 0 ? 'var(--color-success)' : 'var(--text-disabled)', fontWeight: 600, minWidth: '2rem', textAlign: 'right', flexShrink: 0 }}>
                        {a.points ?? '\u2014'} pts
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* ── Priorities ── */}
          {isCompleted && scorecard.priorities?.length > 0 && (
            <>
              <SectionDivider title="Top Priorities" />
              {scorecard.priorities.map((p, i) => {
                const catScore = catScores[p.categoryId] || 0
                const catMax = CATEGORIES.find(c => c.id === p.categoryId)?.maxScore || 1
                const ratio = catMax > 0 ? catScore / catMax : 0
                const icon = ratio > 0.66 ? '\u2705' : ratio >= 0.33 ? '\u26A0\uFE0F' : '\u274C'
                return (
                  <div key={p.id} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0' }}>
                    <span>{icon}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.title || p.id}</span>
                  </div>
                )
              })}
            </>
          )}

          {/* ── Admin Notes ── */}
          <SectionDivider title="Admin Notes" />
          <textarea
            ref={notesRef}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes about this lead..."
            rows={3}
            style={{
              width: '100%', padding: '0.625rem', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: '0.5rem', background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: '0.8125rem', fontFamily: 'var(--font-body)', resize: 'vertical',
              outline: 'none',
            }}
          />

          {/* ── Actions ── */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!lead.invited && (
              <button
                onClick={() => onMarkInvited?.(lead.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
                  border: '0.0625rem solid var(--accent)', background: 'transparent',
                  color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <UserCheck size={13} /> Mark as Invited
              </button>
            )}
            {!lead.nudged && (
              <button
                onClick={() => onMarkNudged?.(lead.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
                  border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                  color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <Send size={13} /> Send Nudge
              </button>
            )}
          </div>

          {/* ── Status Row ── */}
          <div style={{
            display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
            fontSize: '0.625rem', color: 'var(--text-disabled)', paddingTop: '0.5rem',
            borderTop: '0.0625rem solid var(--border-subtle)',
          }}>
            <span>Status: <strong style={{ color: 'var(--text-secondary)' }}>{statusLabel}</strong></span>
            <span>Invited: {lead.invited ? '\u2713' : '\u2014'}</span>
            <span>Nudged: {lead.nudged ? '\u2713' : '\u2014'}</span>
            <span>Converted: {lead.converted ? '\u2713' : '\u2014'}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
