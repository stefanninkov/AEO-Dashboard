/**
 * LeadDetailPanel — CRM slide-in panel with 5-tab layout.
 *
 * Header: Name, tier badge, email, website, stage dropdown, tag pills, admin notes, quick actions.
 * Tabs: AEO Score | Qualification | Answers | Timeline | Tasks
 */
import { useState, useEffect, useRef } from 'react'
import {
  X, Mail, Globe, Clock, Monitor, Languages, Send, UserCheck, Copy, Check,
  Trash2, Ticket, Tag, ListTodo, Activity, BarChart3, FileQuestion, Plus,
  Flame, CircleDot, Circle,
} from 'lucide-react'
import LeadEmailComposer from './LeadEmailComposer'
import LeadTimeline from './LeadTimeline'
import LeadTasks from './LeadTasks'
import TaskCreatorModal from './TaskCreatorModal'
import TagSelector from './TagSelector'
import {
  CATEGORIES, SCORED_QUESTIONS, QUALIFYING_QUESTIONS, QUIZ_FLOW,
  getScoreTier, getLeadTier, MAX_TOTAL_SCORE,
} from '../../utils/scorecardScoring'
import { ALL_STAGES } from '../constants/pipelineStages'

/* ── Helpers ── */
function formatDate(val) {
  if (!val) return '\u2014'
  const d = val.toDate ? val.toDate() : new Date(val)
  if (isNaN(d.getTime())) return '\u2014'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const LEAD_TIER_DISPLAY = {
  hot: { icon: Flame, label: 'Hot', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  warm: { icon: CircleDot, label: 'Warm', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  cold: { icon: Circle, label: 'Cold', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
}

const ROLE_LABELS = {
  agency_owner: 'Agency Owner / Partner',
  seo_director: 'SEO Manager / Director',
  inhouse: 'In-house Marketing / SEO',
  freelancer: 'Freelance Consultant',
  other: 'Other / Just exploring',
}

const WEBSITE_LABELS = {
  '10+': '10+ client websites',
  '3-9': '3\u20139 websites',
  '1-2': '1\u20132 websites',
  own: 'Just my own',
}

const TIMELINE_LABELS = {
  immediately: 'Immediately \u2014 urgent',
  '1-3months': 'Within 1\u20133 months',
  exploring: 'Exploring for the future',
  curious: 'Just curious for now',
}

const QUALIFYING_POINTS = {
  role: { agency_owner: 4, seo_director: 3, inhouse: 2, freelancer: 2, other: 0 },
  websiteCount: { '10+': 4, '3-9': 3, '1-2': 1, own: 0 },
  timeline: { immediately: 4, '1-3months': 2, exploring: 1, curious: 0 },
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

/* ── Qualification Row ── */
function QualRow({ question, value, options, maxPts }) {
  const selected = options.find(o => o.value === value)
  const pts = selected?.pts ?? 0
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{question}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700, flexShrink: 0,
          marginLeft: '0.5rem', padding: '0.0625rem 0.375rem', borderRadius: 99,
          background: pts === maxPts ? 'rgba(16,185,129,0.1)' : 'var(--hover-bg)',
          color: pts === maxPts ? '#10B981' : 'var(--text-disabled)',
        }}>
          {pts}/{maxPts}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {options.map(opt => {
          const isSelected = opt.value === value
          return (
            <span key={opt.value} style={{
              fontSize: '0.625rem', fontWeight: isSelected ? 700 : 500,
              padding: '0.25rem 0.5rem', borderRadius: 99,
              background: isSelected ? 'rgba(16,185,129,0.1)' : 'var(--hover-bg)',
              color: isSelected ? '#10B981' : 'var(--text-disabled)',
              border: isSelected ? '0.0625rem solid rgba(16,185,129,0.3)' : '0.0625rem solid transparent',
              whiteSpace: 'nowrap',
            }}>
              {opt.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function LeadDetailPanel({
  lead, onClose, onMarkInvited, onMarkNudged, onUpdateNotes,
  onUpdateStatus, onDelete, onLogContact, onMoveStage,
  customTemplates, tags, tasks,
}) {
  const [notes, setNotes] = useState(lead?.adminNotes || '')
  const [copied, setCopied] = useState(false)
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [emailPreselect, setEmailPreselect] = useState(null)
  const [taskCreatorOpen, setTaskCreatorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('score')
  const notesRef = useRef(null)

  // Sync notes when lead changes
  useEffect(() => {
    setNotes(lead?.adminNotes || '')
    setActiveTab('score')
  }, [lead?.id])

  if (!lead) return null

  const scorecard = lead.scorecard || {}
  const qualification = lead.qualification || {}
  const isCompleted = scorecard.completed
  const tier = isCompleted ? getScoreTier(scorecard.totalScore) : null
  const leadTierInfo = LEAD_TIER_DISPLAY[lead.leadTier] || LEAD_TIER_DISPLAY.cold
  const catScores = scorecard.categoryScores || {}
  const answers = scorecard.answers || {}
  const leadTags = lead.tags || []
  const currentStage = lead.pipelineStage || 'new'

  const handleNotesBlur = () => {
    if (notes !== (lead.adminNotes || '')) {
      onUpdateNotes?.(notes)
    }
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(lead.email || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const CAT_LABELS = {
    contentStructure: 'Content & Structure',
    technicalSchema: 'Technical & Schema',
    aiVisibility: 'AI Visibility',
    strategyCompetition: 'Strategy & Competition',
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

  const Q_TEXT = {
    q1: 'Does your website have FAQ sections with clear Q&A formatting?',
    q2: 'How often do you publish or update content on your website?',
    q3: 'Does your content directly answer questions people ask AI assistants?',
    q4: 'Does your website use structured data (schema markup)?',
    q5: 'Are AI crawlers (GPTBot, PerplexityBot, etc.) allowed in your robots.txt?',
    q6: 'Does your website have an XML sitemap with accurate lastmod dates?',
    q7: 'Have you tested how your brand appears in AI search engines?',
    q8: 'Do you know if your content appears in Google AI Overviews?',
    q9: 'Do you track how much traffic comes from AI-powered sources?',
    q10: 'Do you know if your competitors are being cited by AI engines?',
    q11: 'Does your organization have a dedicated AEO strategy (beyond traditional SEO)?',
  }

  const ANSWER_LABELS = {
    q1: ['Yes, on most pages', 'On some pages', 'No / Not sure'],
    q2: ['Weekly or more', 'Monthly', 'Rarely or never'],
    q3: ['Yes, we write for this specifically', 'Some of our content does naturally', "We haven't thought about this"],
    q4: ['Yes, multiple types (FAQ, Article, HowTo\u2026)', 'Basic only (Organization, Breadcrumb)', "No / Don't know"],
    q5: ["Yes, they're all allowed", "I've checked some", "No / What's that?"],
    q6: ['Yes, auto-updated', 'Yes, but not sure about lastmod', "No / Don't know"],
    q7: ['Yes, we monitor this regularly', "I've checked a few times", 'Never'],
    q8: ['Yes, we track this', "I've noticed some", 'No idea'],
    q9: ['Yes, we have this set up', 'Planning to', 'No'],
    q10: ['Yes, we monitor this', "I've checked a few", 'No'],
    q11: ["Yes, it's part of our roadmap", "We're exploring it", 'No, SEO only'],
  }

  const detailTabs = [
    { id: 'score', label: 'AEO Score', icon: BarChart3 },
    { id: 'qualification', label: 'Qualification', icon: FileQuestion },
    { id: 'answers', label: 'Answers', icon: ListTodo },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
  ]

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        zIndex: 199, transition: 'opacity 200ms',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '30rem', maxWidth: '100vw',
        background: 'var(--bg-page)', borderLeft: '0.0625rem solid var(--border-subtle)',
        zIndex: 200, display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 200ms ease',
      }}>

        {/* ═══ Header ═══ */}
        <div style={{
          padding: '1rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0,
        }}>
          {/* Row 1: Name + Tier + Close */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lead.name || '\u2014'}
              </span>
              {lead.leadTier && (
                <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: 99, background: leadTierInfo.bg, color: leadTierInfo.color, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.175rem' }}>
                  <leadTierInfo.icon size={10} /> {leadTierInfo.label}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem', flexShrink: 0 }}>
              <X size={18} />
            </button>
          </div>

          {/* Row 2: Email + Website */}
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

          {/* Row 3: Stage dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-disabled)' }}>Status:</span>
            <select
              value={currentStage}
              onChange={(e) => onMoveStage?.(currentStage, e.target.value)}
              style={{
                padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.6875rem',
                fontWeight: 600, fontFamily: 'var(--font-body)',
                border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                color: 'var(--text-primary)', cursor: 'pointer', outline: 'none',
              }}
            >
              {ALL_STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginLeft: 'auto' }}>
              <Clock size={10} style={{ verticalAlign: 'middle' }} /> {formatDate(lead.signedUpAt)}
            </span>
          </div>

          {/* Row 4: Tag pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
            {leadTags.map((tagName) => {
              const color = tags?.getTagColor?.(tagName) || '#6B7280'
              return (
                <span key={tagName} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.5625rem', fontWeight: 600, padding: '0.125rem 0.375rem',
                  borderRadius: 99, background: `${color}15`, color,
                }}>
                  <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: color }} />
                  {tagName}
                  <button
                    onClick={() => tags?.removeTagFromLead?.(lead.id, tagName)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', color, opacity: 0.6 }}
                  >
                    <X size={8} />
                  </button>
                </span>
              )
            })}
            {tags && (
              <TagSelector
                allTags={tags.allTags}
                leadTags={leadTags}
                onAddTag={(tagName) => tags.addTagToLead(lead.id, tagName)}
                onRemoveTag={(tagName) => tags.removeTagFromLead(lead.id, tagName)}
                onCreateTag={tags.createTag}
                getTagColor={tags.getTagColor}
              />
            )}
          </div>

          {/* Row 5: Admin Notes (pinned) */}
          <textarea
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Admin notes..."
            rows={2}
            style={{
              width: '100%', padding: '0.5rem', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: '0.375rem', background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: '0.75rem', fontFamily: 'var(--font-body)', resize: 'none',
              outline: 'none', boxSizing: 'border-box',
            }}
          />

          {/* Row 6: Quick Actions */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            <button onClick={() => { setEmailPreselect(null); setEmailComposerOpen(true) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                border: 'none', background: 'var(--accent)', color: '#fff',
                fontSize: '0.625rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
              <Mail size={10} /> Email
            </button>
            <button onClick={() => setTaskCreatorOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: '0.625rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
              <ListTodo size={10} /> Task
            </button>
            <button onClick={() => { setEmailPreselect('beta_invite'); setEmailComposerOpen(true) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                border: '0.0625rem solid var(--accent)', background: 'transparent',
                color: 'var(--accent)', fontSize: '0.625rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
              <Ticket size={10} /> Invite
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete lead "${lead.name || lead.email}"? This cannot be undone.`)) {
                  onDelete?.()
                  onClose?.()
                }
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                border: '0.0625rem solid var(--border-subtle)', background: 'transparent',
                color: 'var(--color-error, #EF4444)', fontSize: '0.625rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)', marginLeft: 'auto',
              }}>
              <Trash2 size={10} /> Delete
            </button>
          </div>
        </div>

        {/* ═══ Tab Bar ═══ */}
        <div style={{
          display: 'flex', gap: '0', borderBottom: '0.0625rem solid var(--border-subtle)',
          flexShrink: 0, overflowX: 'auto',
        }}>
          {detailTabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.5rem 0.75rem', border: 'none', cursor: 'pointer',
                  fontSize: '0.625rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                  background: 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                  borderBottom: isActive ? '0.125rem solid var(--accent)' : '0.125rem solid transparent',
                  transition: 'all 100ms',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={11} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ═══ Tab Content ═══ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>

          {/* ── Tab: AEO Score ── */}
          {activeTab === 'score' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {isCompleted ? (
                <>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <MiniScoreRing score={scorecard.totalScore} max={MAX_TOTAL_SCORE} color={tier?.color || 'var(--accent)'} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
                      {CATEGORIES.map(cat => (
                        <CategoryBar
                          key={cat.id} label={CAT_LABELS[cat.id]}
                          score={catScores[cat.id] || 0} maxScore={cat.maxScore} color={cat.color}
                        />
                      ))}
                    </div>
                  </div>
                  {scorecard.priorities?.length > 0 && (
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                        color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06rem',
                        padding: '0.5rem 0 0.25rem', borderBottom: '0.0625rem solid var(--border-subtle)', marginBottom: '0.5rem',
                      }}>
                        Top Priorities
                      </div>
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
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-disabled)', fontStyle: 'italic' }}>
                  {scorecard.abandonedAtStep != null
                    ? `Abandoned at step ${scorecard.abandonedAtStep + 1} of 14`
                    : 'Quiz not started'}
                </p>
              )}
            </div>
          )}

          {/* ── Tab: Qualification ── */}
          {activeTab === 'qualification' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.keys(qualification).length > 0 ? (
                <div style={{
                  padding: '0.75rem', borderRadius: '0.5rem',
                  border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                  display: 'flex', flexDirection: 'column', gap: '0.625rem',
                }}>
                  {lead.leadScore != null && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.5rem 0.625rem', borderRadius: '0.375rem', background: leadTierInfo.bg,
                    }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Lead Score</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: leadTierInfo.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {lead.leadScore}/12 {'\u2192'} <leadTierInfo.icon size={12} /> {leadTierInfo.label}
                      </span>
                    </div>
                  )}
                  {qualification.role && (
                    <QualRow question="What best describes your role?" value={qualification.role}
                      options={[
                        { value: 'agency_owner', label: 'Agency Owner / Partner', pts: 4 },
                        { value: 'seo_director', label: 'SEO Manager / Director', pts: 3 },
                        { value: 'inhouse', label: 'In-house Marketing / SEO', pts: 2 },
                        { value: 'freelancer', label: 'Freelance Consultant', pts: 2 },
                        { value: 'other', label: 'Other / Just exploring', pts: 0 },
                      ]} maxPts={4} />
                  )}
                  {qualification.websiteCount && (
                    <QualRow question="How many websites do you manage?" value={qualification.websiteCount}
                      options={[
                        { value: '10+', label: '10+ client websites', pts: 4 },
                        { value: '3-9', label: '3\u20139 websites', pts: 3 },
                        { value: '1-2', label: '1\u20132 websites', pts: 1 },
                        { value: 'own', label: 'Just my own', pts: 0 },
                      ]} maxPts={4} />
                  )}
                  {qualification.timeline && (
                    <QualRow question="When are you looking to optimize for AI?" value={qualification.timeline}
                      options={[
                        { value: 'immediately', label: 'Immediately \u2014 this is urgent', pts: 4 },
                        { value: '1-3months', label: 'Within 1\u20133 months', pts: 2 },
                        { value: 'exploring', label: 'Exploring for the future', pts: 1 },
                        { value: 'curious', label: 'Just curious for now', pts: 0 },
                      ]} maxPts={4} />
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-disabled)', fontStyle: 'italic' }}>
                  No qualification data
                </p>
              )}
            </div>
          )}

          {/* ── Tab: Answers ── */}
          {activeTab === 'answers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {isCompleted ? (
                answersByCategory.map(cat => (
                  <div key={cat.id} style={{ marginBottom: '0.5rem' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '0.5rem', padding: '0.375rem 0.625rem', borderRadius: '0.375rem',
                      background: 'var(--hover-bg)',
                    }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{CAT_LABELS[cat.id]}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
                        padding: '0.0625rem 0.375rem', borderRadius: 99,
                        background: cat.subtotal === cat.maxScore ? 'rgba(16,185,129,0.1)' : 'transparent',
                        color: cat.subtotal === cat.maxScore ? '#10B981' : 'var(--text-disabled)',
                      }}>
                        {cat.subtotal}/{cat.maxScore} pts
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {cat.answers.map(a => {
                        const q = SCORED_QUESTIONS.find(sq => sq.id === a.id)
                        const labels = ANSWER_LABELS[a.id] || []
                        return (
                          <div key={a.id} style={{
                            padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                            border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
                          }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                              {Q_TEXT[a.id]}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {q?.options.map((opt, i) => {
                                const isSelected = i === a.optIndex
                                const pts = opt.points
                                return (
                                  <div key={opt.value} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.375rem 0.5rem', borderRadius: '0.375rem',
                                    background: isSelected ? 'rgba(16,185,129,0.08)' : 'transparent',
                                    border: isSelected ? '0.0625rem solid rgba(16,185,129,0.25)' : '0.0625rem solid transparent',
                                  }}>
                                    <div style={{
                                      width: '0.75rem', height: '0.75rem', borderRadius: '50%', flexShrink: 0,
                                      border: isSelected ? '0.1875rem solid #10B981' : '0.0625rem solid var(--border-subtle)',
                                      background: isSelected ? '#10B981' : 'transparent',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                      {isSelected && <div style={{ width: '0.25rem', height: '0.25rem', borderRadius: '50%', background: '#fff' }} />}
                                    </div>
                                    <span style={{
                                      flex: 1, fontSize: '0.6875rem', lineHeight: 1.3,
                                      color: isSelected ? '#10B981' : 'var(--text-tertiary)',
                                      fontWeight: isSelected ? 600 : 400,
                                    }}>
                                      {labels[i] || opt.value}
                                    </span>
                                    <span style={{
                                      fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700, flexShrink: 0,
                                      padding: '0.0625rem 0.3125rem', borderRadius: 99,
                                      background: isSelected ? (pts > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)') : 'transparent',
                                      color: isSelected ? (pts > 0 ? '#10B981' : '#EF4444') : 'var(--text-disabled)',
                                    }}>
                                      {pts} pts
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-disabled)', fontStyle: 'italic' }}>
                  Quiz not completed
                </p>
              )}
            </div>
          )}

          {/* ── Tab: Timeline ── */}
          {activeTab === 'timeline' && (
            <LeadTimeline lead={lead} />
          )}

          {/* ── Tab: Tasks ── */}
          {activeTab === 'tasks' && (
            <LeadTasks
              leadId={lead.id}
              tasks={tasks?.tasks || []}
              onComplete={tasks?.completeTask}
              onUncomplete={tasks?.uncompleteTask}
              onOpenCreate={() => setTaskCreatorOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      <LeadEmailComposer
        isOpen={emailComposerOpen}
        onClose={() => setEmailComposerOpen(false)}
        lead={lead}
        preselectedTemplateId={emailPreselect}
        onLogContact={onLogContact}
        customTemplates={customTemplates}
      />

      {/* Task Creator Modal */}
      <TaskCreatorModal
        isOpen={taskCreatorOpen}
        onClose={() => setTaskCreatorOpen(false)}
        lead={lead}
        onCreateTask={tasks?.createTask}
      />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
