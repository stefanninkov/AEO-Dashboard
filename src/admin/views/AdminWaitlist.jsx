/**
 * AdminWaitlist — 3-tab admin view: Overview | Leads | Templates.
 *
 * Overview:  8 analytics sections (Recharts + custom SVG).
 * Leads:    Full table with filters, sort, pagination, detail panel, bulk email.
 * Templates: Pre-built + custom template management, send history.
 */
import { useState, useMemo, useCallback } from 'react'
import {
  Users, UserPlus, TrendingUp, RefreshCw, Download, Search, ChevronDown,
  CheckSquare, Target, BarChart4, AlertTriangle, ArrowUpDown, ChevronLeft,
  ChevronRight, Mail, Eye, ArrowUpRight, ArrowDownRight, Minus, Filter,
  Clock, Zap, Globe, Monitor, Sun, Moon, Sunrise, Sunset, Trash2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area,
} from 'recharts'
import { useWaitlistStats } from '../hooks/useWaitlistStats'
import { useBulkEmail } from '../hooks/useBulkEmail'
import { CATEGORIES, SCORE_TIERS, MAX_TOTAL_SCORE } from '../../utils/scorecardScoring'
import LeadDetailPanel from '../components/LeadDetailPanel'
import BulkEmailComposer from '../components/BulkEmailComposer'
import TemplateManager from '../components/TemplateManager'
import { useWaitlist } from '../../hooks/useWaitlist'

/* ─── Helpers ─── */

function timeAgo(dateInput) {
  if (!dateInput) return '—'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  if (isNaN(date.getTime())) return '—'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate(dateInput) {
  if (!dateInput) return '—'
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/* ─── Sub-components ─── */

function StatCard({ icon: Icon, label, value, sublabel, color, badge }) {
  return (
    <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
            background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} style={{ color }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem',
          }}>
            {label}
          </span>
        </div>
        {badge && (
          <span style={{
            fontSize: '0.5625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: 99,
            background: badge.bg, color: badge.color,
          }}>
            {badge.text}
          </span>
        )}
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          {value}
        </div>
        {sublabel && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, count, color, extra }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 1.25rem', borderBottom: '0.0625rem solid var(--border-subtle)',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
        color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <Icon size={14} style={{ color: color || 'var(--text-disabled)' }} />
        {title}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {extra}
        {count !== undefined && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>{count}</span>
        )}
      </div>
    </div>
  )
}

function FunnelStep({ label, count, total, prevCount, isLast }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const dropPct = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0
  const barColor = pct > 60 ? 'var(--color-success)' : pct > 30 ? 'var(--color-warning)' : 'var(--color-error)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {count}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
              ({pct}%)
            </span>
          </div>
        </div>
        <div style={{ height: '0.375rem', borderRadius: '0.1875rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: '0.1875rem', background: barColor, transition: 'width 0.3s ease' }} />
        </div>
      </div>
      {!isLast && dropPct > 0 && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
          color: 'var(--color-error)', minWidth: '2.5rem', textAlign: 'right',
        }}>
          −{dropPct}%
        </span>
      )}
    </div>
  )
}

function MiniDonut({ data, size = 80, innerRadius = 22, outerRadius = 36 }) {
  return (
    <PieChart width={size} height={size}>
      <Pie data={data} cx={size / 2} cy={size / 2} innerRadius={innerRadius} outerRadius={outerRadius}
        dataKey="count" strokeWidth={0}>
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  )
}

/* Custom tooltip for Recharts */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card-bg)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '0.6875rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text-secondary)' }}>
          {p.name || 'Count'}: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Filter Dropdown ─── */
function FilterDropdown({ label, value, options, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none', padding: '0.375rem 1.5rem 0.375rem 0.5rem', borderRadius: '0.375rem',
          fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-body)',
          border: '0.0625rem solid var(--border-subtle)', background: 'var(--card-bg)',
          color: value === 'all' ? 'var(--text-disabled)' : 'var(--text-primary)',
          cursor: 'pointer', outline: 'none',
        }}
        aria-label={label}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={10} style={{
        position: 'absolute', right: '0.375rem', top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: 'var(--text-disabled)',
      }} />
    </div>
  )
}

/* ─── Role / Website / Timeline labels ─── */
const ROLE_LABELS = {
  agency_owner: 'Agency Owner', seo_director: 'SEO Director', inhouse: 'In-house',
  freelancer: 'Freelancer', other: 'Other',
}
const WEBSITE_LABELS = { '10+': '10+', '3-9': '3–9', '1-2': '1–2', own: 'Own site' }
const TIMELINE_LABELS = {
  immediately: 'Immediately', '1-3months': '1–3 months', exploring: 'Exploring', curious: 'Curious',
}
const LEAD_TIER_DISPLAY = {
  hot: { emoji: '🔥', label: 'Hot', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  warm: { emoji: '🟡', label: 'Warm', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  cold: { emoji: '⚪', label: 'Cold', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
}
const SCORE_TIER_LABELS = { invisible: 'Invisible', starting: 'Starting', onTrack: 'On Track', aiReady: 'AI Ready' }

/* Category labels */
const CATEGORY_LABELS = {
  contentStructure: 'Content & Structure',
  technicalSchema: 'Technical & Schema',
  aiVisibility: 'AI Visibility',
  strategyCompetition: 'Strategy & Competition',
}

/* ─── Page size ─── */
const PAGE_SIZE = 25

/* ═══════════════════════════════════════════════ */
/*  MAIN COMPONENT                                 */
/* ═══════════════════════════════════════════════ */

export default function AdminWaitlist({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const { leads, loading, error, refresh, ...stats } = useWaitlistStats()
  const bulkEmail = useBulkEmail()
  const { markInvited, markNudged, updateAdminNotes, updateLeadStatus, deleteLead, logContact } = useWaitlist()

  /* Leads tab state */
  const [search, setSearch] = useState('')
  const [leadTierFilter, setLeadTierFilter] = useState('all')
  const [scoreTierFilter, setScoreTierFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [timelineFilter, setTimelineFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('signedUpAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [selectedLead, setSelectedLead] = useState(null)
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false)
  const [bulkEmailLeads, setBulkEmailLeads] = useState([])
  const [bulkEmailLabel, setBulkEmailLabel] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    await bulkEmail.refresh()
    setRefreshing(false)
  }

  /* ─── Filtering + Sorting (Leads tab) ─── */

  const filteredLeads = useMemo(() => {
    let result = leads
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.website || '').toLowerCase().includes(q)
      )
    }
    if (leadTierFilter !== 'all') {
      result = result.filter(l => l.leadTier === leadTierFilter)
    }
    if (scoreTierFilter !== 'all') {
      result = result.filter(l => l.scorecard?.tier === scoreTierFilter)
    }
    if (roleFilter !== 'all') {
      result = result.filter(l => l.qualification?.role === roleFilter)
    }
    if (timelineFilter !== 'all') {
      result = result.filter(l => l.qualification?.timeline === timelineFilter)
    }
    if (statusFilter !== 'all') {
      result = result.filter(l => {
        const s = l.status || (l.invited ? 'invited' : l.converted ? 'converted' : l.scorecard?.completed ? 'active' : l.scorecard?.abandonedAtStep != null ? 'abandoned' : 'active')
        return s === statusFilter
      })
    }
    return result
  }, [leads, search, leadTierFilter, scoreTierFilter, roleFilter, timelineFilter, statusFilter])

  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads]
    sorted.sort((a, b) => {
      let va, vb
      switch (sortField) {
        case 'name': va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); break
        case 'email': va = (a.email || '').toLowerCase(); vb = (b.email || '').toLowerCase(); break
        case 'score': va = a.scorecard?.totalScore ?? -1; vb = b.scorecard?.totalScore ?? -1; break
        case 'leadTier': {
          const order = { hot: 3, warm: 2, cold: 1 }
          va = order[a.leadTier] || 0; vb = order[b.leadTier] || 0; break
        }
        case 'role': va = a.qualification?.role || ''; vb = b.qualification?.role || ''; break
        case 'timeline': va = a.qualification?.timeline || ''; vb = b.qualification?.timeline || ''; break
        case 'signedUpAt':
        default: {
          const da = a.signedUpAt?.toDate ? a.signedUpAt.toDate() : new Date(a.signedUpAt || 0)
          const db = b.signedUpAt?.toDate ? b.signedUpAt.toDate() : new Date(b.signedUpAt || 0)
          va = da.getTime(); vb = db.getTime(); break
        }
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredLeads, sortField, sortDir])

  const totalPages = Math.ceil(sortedLeads.length / PAGE_SIZE)
  const pagedLeads = sortedLeads.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSort = useCallback((field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
    setPage(0)
  }, [sortField])

  /* ─── CSV Export ─── */

  const handleExportCsv = useCallback(() => {
    const headers = ['Name', 'Email', 'Website', 'Score', 'Score Tier', 'Lead Tier', 'Role', 'Websites', 'Timeline', 'Status', 'Signed Up']
    const rows = filteredLeads.map(l => [
      l.name || '', l.email || '', l.website || '',
      l.scorecard?.totalScore ?? '', l.scorecard?.tier || '',
      l.leadTier || '', l.qualification?.role || '', l.qualification?.websiteCount || '',
      l.qualification?.timeline || '', l.invited ? 'invited' : l.converted ? 'converted' : l.scorecard?.completed ? 'completed' : 'pending',
      formatDate(l.signedUpAt),
    ])
    const escape = (s) => `"${String(s || '').replace(/"/g, '""')}"`
    const csv = [headers.map(escape).join(','), ...rows.map(row => row.map(escape).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredLeads])

  /* ─── Bulk Email Actions ─── */

  const openBulkEmail = useCallback((tier) => {
    let targets, label
    if (tier === 'current') {
      targets = filteredLeads.filter(l => l.scorecard?.completed && l.email)
      label = `Current Filter (${targets.length})`
    } else if (tier === 'all') {
      targets = leads.filter(l => l.scorecard?.completed && l.email)
      label = `All Completed (${targets.length})`
    } else {
      targets = leads.filter(l => l.leadTier === tier && l.scorecard?.completed && l.email)
      label = `${LEAD_TIER_DISPLAY[tier]?.label || tier} Leads (${targets.length})`
    }
    setBulkEmailLeads(targets)
    setBulkEmailLabel(label)
    setBulkEmailOpen(true)
  }, [filteredLeads, leads])

  /* ─── Loading ─── */

  if (loading) {
    return (
      <div className="view-wrapper">
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{
            width: '1.5rem', height: '1.5rem', border: '0.125rem solid var(--accent)',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 1rem',
          }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading waitlist data…</p>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════ */
  /*  TABS                                           */
  /* ═══════════════════════════════════════════════ */

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'leads', label: 'Leads', count: stats.total },
    { id: 'templates', label: 'Templates' },
  ]

  return (
    <div className="view-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
          }}>
            Waitlist Intelligence
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
            {stats.total} total · {stats.thisWeek} this week · {stats.today} today
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem',
            fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
            border: '0.0625rem solid var(--border-subtle)', background: 'var(--card-bg)',
            color: 'var(--text-secondary)', opacity: refreshing ? 0.5 : 1,
          }}
        >
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: '0.25rem', padding: '0.25rem',
        background: 'var(--hover-bg)', borderRadius: '0.5rem', width: 'fit-content',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.375rem 0.875rem', borderRadius: '0.375rem',
              fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
              cursor: 'pointer', border: 'none', transition: 'all 150ms',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: activeTab === tab.id ? 'var(--card-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
                padding: '0 0.375rem', borderRadius: 99,
                background: activeTab === tab.id ? 'var(--accent)' : 'var(--hover-bg)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-disabled)',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab stats={stats} leads={leads} />}
      {activeTab === 'leads' && (
        <LeadsTab
          leads={leads}
          filteredLeads={filteredLeads}
          sortedLeads={sortedLeads}
          pagedLeads={pagedLeads}
          stats={stats}
          search={search}
          setSearch={setSearch}
          leadTierFilter={leadTierFilter}
          setLeadTierFilter={setLeadTierFilter}
          scoreTierFilter={scoreTierFilter}
          setScoreTierFilter={setScoreTierFilter}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          timelineFilter={timelineFilter}
          setTimelineFilter={setTimelineFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortField={sortField}
          sortDir={sortDir}
          handleSort={handleSort}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          selectedLead={selectedLead}
          setSelectedLead={setSelectedLead}
          handleExportCsv={handleExportCsv}
          openBulkEmail={openBulkEmail}
          markInvited={markInvited}
          markNudged={markNudged}
          updateAdminNotes={updateAdminNotes}
          updateLeadStatus={updateLeadStatus}
          deleteLead={deleteLead}
          logContact={logContact}
          customTemplates={bulkEmail.customTemplates}
          refresh={refresh}
        />
      )}
      {activeTab === 'templates' && (
        <TemplatesTab
          bulkEmail={bulkEmail}
          leads={leads}
        />
      )}

      {/* Bulk Email Composer Modal */}
      <BulkEmailComposer
        isOpen={bulkEmailOpen}
        onClose={() => setBulkEmailOpen(false)}
        leads={bulkEmailLeads}
        audienceLabel={bulkEmailLabel}
        customTemplates={bulkEmail.customTemplates}
        onSaveCustom={bulkEmail.saveCustomTemplate}
        onLogExport={bulkEmail.logBulkExport}
        onGenerateCsv={bulkEmail.generatePersonalizedCsv}
      />
    </div>
  )
}


/* ═══════════════════════════════════════════════ */
/*  TAB 1 — OVERVIEW                               */
/* ═══════════════════════════════════════════════ */

function OverviewTab({ stats, leads }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* 1. Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))', gap: '0.75rem' }}>
        <StatCard icon={Users} label="Total Leads" value={stats.total} color="#3B82F6"
          sublabel={`${stats.today} today · ${stats.thisWeek} this week`} />
        <StatCard icon={CheckSquare} label="Completed" value={stats.completedCount} color="#10B981"
          sublabel={`${stats.completionRate}% completion rate`}
          badge={{ text: `${stats.completionRate}%`, bg: 'rgba(16,185,129,0.1)', color: '#10B981' }} />
        <StatCard icon={Target} label="Hot Leads" value={stats.hotLeads.length} color="#EF4444"
          sublabel={`${stats.hotNotInvited.length} not contacted`}
          badge={stats.hotNotInvited.length > 0 ? { text: `${stats.hotNotInvited.length} new`, bg: 'rgba(239,68,68,0.1)', color: '#EF4444' } : undefined} />
        <StatCard icon={BarChart4} label="Avg Score" value={`${stats.avgScore}/${MAX_TOTAL_SCORE}`} color="#8B5CF6"
          sublabel={stats.avgScoreTier ? SCORE_TIER_LABELS[stats.avgScoreTier.id] || '' : ''}
          badge={stats.avgScoreTier ? { text: SCORE_TIER_LABELS[stats.avgScoreTier.id], bg: `${stats.avgScoreTier.color}15`, color: stats.avgScoreTier.color } : undefined} />
        <StatCard icon={AlertTriangle} label="Abandoned" value={stats.abandonedCount} color="#F59E0B"
          sublabel={`${stats.abandonmentRate}% abandonment rate`} />
        <StatCard icon={TrendingUp} label="Converted" value={leads.filter(l => l.converted).length} color="#06B6D4"
          sublabel={`${leads.filter(l => l.invited).length} invited`} />
      </div>

      {/* 2. Score Distribution Histogram */}
      {stats.scoreDistribution.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader icon={BarChart4} title="Score Distribution" color="#8B5CF6"
            count={`${stats.completedCount} completed`} />
          <div style={{ padding: '1rem 1.25rem' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.scoreDistribution} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--hover-bg)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {stats.scoreDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{
              display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap',
            }}>
              {SCORE_TIERS.map(tier => (
                <div key={tier.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.625rem', color: 'var(--text-disabled)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: tier.color }} />
                  {SCORE_TIER_LABELS[tier.id]} ({tier.min}–{tier.max})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Lead Tier Donut + Conversion Funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '0.75rem' }}>
        {/* Lead Tier Donut */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader icon={Target} title="Lead Tiers" color="#EF4444" />
          <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {stats.leadTierDistribution.some(d => d.count > 0) ? (
              <>
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={stats.leadTierDistribution} cx="50%" cy="50%"
                      innerRadius={30} outerRadius={52} dataKey="count" strokeWidth={0}>
                      {stats.leadTierDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  {stats.leadTierDistribution.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem', width: '100%' }}>
                No completed leads yet
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader icon={TrendingUp} title="Conversion Funnel" color="#10B981" />
          <div style={{ padding: '1rem 1.25rem' }}>
            {stats.funnel.map((step, i) => (
              <FunnelStep
                key={step.label}
                label={step.label}
                count={step.count}
                total={stats.funnel[0]?.count || 0}
                prevCount={i > 0 ? stats.funnel[i - 1].count : step.count}
                isLast={i === stats.funnel.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Category Weakness Analysis */}
      {stats.avgCategoryScores.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader icon={AlertTriangle} title="Category Weakness Analysis" color="#F59E0B"
            count="Sorted weakest → strongest" />
          <div style={{ padding: '1rem 1.25rem' }}>
            {stats.avgCategoryScores.map(cat => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, width: '10rem', flexShrink: 0 }}>
                  {CATEGORY_LABELS[cat.id] || cat.id}
                </span>
                <div style={{ flex: 1, height: '0.5rem', borderRadius: '0.25rem', background: 'var(--hover-bg)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${cat.pct}%`, height: '100%', borderRadius: '0.25rem',
                    background: cat.color, transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-primary)', width: '3.5rem', textAlign: 'right' }}>
                  {cat.avgScore}/{cat.maxScore}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-disabled)', width: '2.5rem', textAlign: 'right' }}>
                  {cat.pct}%
                </span>
              </div>
            ))}
            {stats.avgCategoryScores.length > 0 && stats.avgCategoryScores[0].pct < 50 && (
              <div style={{
                marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.375rem',
                background: 'rgba(245,158,11,0.08)', border: '0.0625rem solid rgba(245,158,11,0.2)',
                fontSize: '0.6875rem', color: 'var(--text-secondary)',
              }}>
                <strong style={{ color: '#F59E0B' }}>Insight:</strong> {CATEGORY_LABELS[stats.avgCategoryScores[0].id]} is the weakest area across all leads ({stats.avgCategoryScores[0].pct}% avg). This is a great topic for educational content.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Qualification Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))', gap: '0.75rem' }}>
        {[
          { title: 'By Role', data: stats.byRole, icon: Users, color: '#3B82F6' },
          { title: 'By Website Count', data: stats.byWebsiteCount, icon: Globe, color: '#8B5CF6' },
          { title: 'By Timeline', data: stats.byTimeline, icon: Clock, color: '#06B6D4' },
        ].map(section => (
          <div key={section.title} className="card" style={{ overflow: 'hidden' }}>
            <SectionHeader icon={section.icon} title={section.title} color={section.color} />
            <div style={{ padding: '1rem 1.25rem' }}>
              {section.data.length > 0 ? section.data.map(item => {
                const total = section.data.reduce((s, d) => s + d.count, 0)
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', flex: 1 }}>
                      {ROLE_LABELS[item.name] || WEBSITE_LABELS[item.name] || TIMELINE_LABELS[item.name] || item.name}
                    </span>
                    <div style={{ width: '4rem', height: '0.375rem', borderRadius: 99, background: 'var(--hover-bg)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: section.color, opacity: 0.7 }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-primary)', width: '1.5rem', textAlign: 'right' }}>
                      {item.count}
                    </span>
                  </div>
                )
              }) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', textAlign: 'center', padding: '1rem 0' }}>No data yet</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 6. Abandonment Analysis */}
      {stats.abandonmentByStep.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader icon={AlertTriangle} title="Abandonment by Step" color="#EF4444"
            count={`${stats.totalAbandonment} total (${stats.abandonmentRate}%)`} />
          <div style={{ padding: '1rem 1.25rem' }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.abandonmentByStep} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="step" tick={{ fontSize: 11, fill: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} tickFormatter={(v) => `Step ${v}`} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--hover-bg)' }} />
                <Bar dataKey="count" fill="#EF4444" opacity={0.7} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
            {stats.captureAbandonment > 0 && (
              <div style={{
                marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.375rem',
                background: 'rgba(239,68,68,0.08)', border: '0.0625rem solid rgba(239,68,68,0.2)',
                fontSize: '0.6875rem', color: 'var(--text-secondary)',
              }}>
                <strong style={{ color: '#EF4444' }}>Note:</strong> {stats.captureAbandonment} signups never started the quiz (capture abandonment).
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Signup Trend (last 30 days) */}
      {stats.signupsByDay.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <SectionHeader icon={TrendingUp} title="Signup Trend (30 Days)" color="#3B82F6" />
          <div style={{ padding: '1rem 1.25rem' }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={stats.signupsByDay} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} interval={6}
                  tickFormatter={v => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}` }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-subtle)' }} />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2}
                  fill="url(#signupGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 8. Metadata — Language, Device, Time of Day */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '0.75rem' }}>
        {[
          { title: 'By Language', data: stats.byLanguage, icon: Globe, color: '#8B5CF6' },
          { title: 'By Device', data: stats.byDevice, icon: Monitor, color: '#06B6D4' },
          { title: 'By Time of Day', data: stats.byTimeOfDay, icon: Clock, color: '#F59E0B' },
        ].map(section => (
          <div key={section.title} className="card" style={{ overflow: 'hidden' }}>
            <SectionHeader icon={section.icon} title={section.title} color={section.color} />
            <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {section.data.length > 0 && section.data.some(d => d.count > 0) && (
                <MiniDonut data={section.data.filter(d => d.count > 0).map((d, i) => ({
                  ...d, color: [section.color, `${section.color}99`, `${section.color}55`, `${section.color}33`][i] || section.color,
                }))} size={64} innerRadius={18} outerRadius={28} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                {section.data.length > 0 ? section.data.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem' }}>
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{d.count}</span>
                  </div>
                )) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>No data</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════ */
/*  TAB 2 — LEADS                                  */
/* ═══════════════════════════════════════════════ */

function LeadsTab({
  leads, filteredLeads, sortedLeads, pagedLeads, stats,
  search, setSearch, leadTierFilter, setLeadTierFilter,
  scoreTierFilter, setScoreTierFilter, roleFilter, setRoleFilter,
  timelineFilter, setTimelineFilter, statusFilter, setStatusFilter,
  sortField, sortDir, handleSort, page, setPage, totalPages,
  selectedLead, setSelectedLead, handleExportCsv, openBulkEmail,
  markInvited, markNudged, updateAdminNotes,
  updateLeadStatus, deleteLead, logContact, customTemplates,
  refresh,
}) {
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minHeight: 0 }}>
      {/* Filters Row */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="card" style={{
          padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
          flex: 1, minWidth: '12rem',
        }}>
          <Search size={12} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <input
            type="text" placeholder="Search name, email, website…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            aria-label="Search leads"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <FilterDropdown label="Lead Tier" value={leadTierFilter} onChange={v => { setLeadTierFilter(v); setPage(0) }}
          options={[{ value: 'all', label: 'Lead Tier' }, { value: 'hot', label: '🔥 Hot' }, { value: 'warm', label: '🟡 Warm' }, { value: 'cold', label: '⚪ Cold' }]} />
        <FilterDropdown label="Score Tier" value={scoreTierFilter} onChange={v => { setScoreTierFilter(v); setPage(0) }}
          options={[{ value: 'all', label: 'Score Tier' }, ...SCORE_TIERS.map(t => ({ value: t.id, label: SCORE_TIER_LABELS[t.id] }))]} />
        <FilterDropdown label="Role" value={roleFilter} onChange={v => { setRoleFilter(v); setPage(0) }}
          options={[{ value: 'all', label: 'Role' }, ...Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))]} />
        <FilterDropdown label="Timeline" value={timelineFilter} onChange={v => { setTimelineFilter(v); setPage(0) }}
          options={[{ value: 'all', label: 'Timeline' }, ...Object.entries(TIMELINE_LABELS).map(([v, l]) => ({ value: v, label: l }))]} />
        <FilterDropdown label="Status" value={statusFilter} onChange={v => { setStatusFilter(v); setPage(0) }}
          options={[
            { value: 'all', label: 'Status' }, { value: 'active', label: 'Active' },
            { value: 'invited', label: 'Invited' }, { value: 'converted', label: 'Converted' },
            { value: 'unsubscribed', label: 'Unsubscribed' }, { value: 'archived', label: 'Archived' },
            { value: 'abandoned', label: 'Abandoned' },
          ]} />

        {/* Actions */}
        <button onClick={handleExportCsv} title="Export CSV" disabled={filteredLeads.length === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.375rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.6875rem',
            fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
            border: '0.0625rem solid var(--border-subtle)', background: 'var(--card-bg)',
            color: 'var(--text-secondary)', opacity: filteredLeads.length === 0 ? 0.4 : 1,
          }}>
          <Download size={11} /> CSV
        </button>

        {/* Bulk Email Dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setBulkDropdownOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.375rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.6875rem',
              fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
              border: 'none', background: 'var(--accent)', color: '#fff',
            }}>
            <Mail size={11} /> Email <ChevronDown size={9} />
          </button>
          {bulkDropdownOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setBulkDropdownOpen(false)} />
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: '0.25rem', zIndex: 100,
                background: 'var(--card-bg)', border: '0.0625rem solid var(--border-subtle)',
                borderRadius: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                minWidth: '12rem', overflow: 'hidden',
              }}>
                {[
                  { label: '🔥 Email Hot Leads', action: () => openBulkEmail('hot') },
                  { label: '🟡 Email Warm Leads', action: () => openBulkEmail('warm') },
                  { label: '⚪ Email Cold Leads', action: () => openBulkEmail('cold') },
                  null,
                  { label: 'Email Current Filter', action: () => openBulkEmail('current') },
                  { label: 'Email All Completed', action: () => openBulkEmail('all') },
                ].map((item, i) => item === null ? (
                  <div key={i} style={{ height: '0.0625rem', background: 'var(--border-subtle)', margin: '0.25rem 0' }} />
                ) : (
                  <button key={i} onClick={() => { item.action(); setBulkDropdownOpen(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.875rem',
                      fontSize: '0.75rem', fontWeight: 500, fontFamily: 'var(--font-body)',
                      background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>
        Showing {sortedLeads.length > 0 ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, sortedLeads.length)} of {sortedLeads.length} leads
        {sortedLeads.length !== leads.length && ` (filtered from ${leads.length})`}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, minHeight: 0 }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem',
            borderBottom: '0.0625rem solid var(--border-subtle)', background: 'var(--hover-bg)',
            minWidth: '60rem',
          }}>
            {[
              { label: 'Name', field: 'name', width: '10rem' },
              { label: 'Email', field: 'email', width: '12rem' },
              { label: 'Score', field: 'score', width: '4.5rem' },
              { label: 'Lead', field: 'leadTier', width: '3.5rem' },
              { label: 'Role', field: 'role', width: '6rem' },
              { label: 'Sites', field: null, width: '3rem' },
              { label: 'Timeline', field: 'timeline', width: '5rem' },
              { label: 'Status', field: null, width: '5rem' },
              { label: 'Signed Up', field: 'signedUpAt', width: '5.5rem' },
              { label: 'Actions', field: null, width: '4rem' },
            ].map(col => (
              <div key={col.label} style={{
                width: col.width, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem',
                cursor: col.field ? 'pointer' : 'default',
                fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-disabled)',
                textTransform: 'uppercase', letterSpacing: '0.04rem', fontFamily: 'var(--font-mono)',
              }}
                onClick={() => col.field && handleSort(col.field)}>
                {col.label}
                {col.field && sortField === col.field && (
                  <ArrowUpDown size={8} style={{ color: 'var(--accent)', opacity: 0.7 }} />
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          {pagedLeads.map(lead => {
            const tier = LEAD_TIER_DISPLAY[lead.leadTier]
            const scoreTier = lead.scorecard?.tier ? SCORE_TIERS.find(t => t.id === lead.scorecard.tier) : null
            const status = lead.status || (lead.invited ? 'invited' : lead.converted ? 'converted' : lead.scorecard?.completed ? 'completed' : lead.scorecard?.abandonedAtStep != null ? 'abandoned' : 'active')
            const statusColors = {
              active: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'Active' },
              completed: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'Completed' },
              invited: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', label: 'Invited' },
              converted: { bg: 'rgba(6,182,212,0.1)', color: '#06B6D4', label: 'Converted' },
              abandoned: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', label: 'Abandoned' },
              unsubscribed: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', label: 'Unsubscribed' },
              archived: { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', label: 'Archived' },
              pending: { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', label: 'Pending' },
            }
            const sc = statusColors[status] || statusColors.pending

            return (
              <div key={lead.id}
                onClick={() => setSelectedLead(lead)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem',
                  borderBottom: '0.0625rem solid var(--border-subtle)', cursor: 'pointer',
                  transition: 'background 150ms', minWidth: '60rem',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {/* Name */}
                <div style={{ width: '10rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: '1.25rem', height: '1.25rem', borderRadius: '50%',
                    background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.5rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
                  }}>
                    {(lead.name || '?')[0].toUpperCase()}
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {lead.name || '—'}
                  </span>
                </div>
                {/* Email */}
                <span style={{
                  width: '12rem', flexShrink: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {lead.email || '—'}
                </span>
                {/* Score */}
                <div style={{ width: '4.5rem', flexShrink: 0 }}>
                  {lead.scorecard?.totalScore != null ? (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
                      padding: '0.125rem 0.375rem', borderRadius: 4,
                      background: scoreTier ? `${scoreTier.color}15` : 'var(--hover-bg)',
                      color: scoreTier?.color || 'var(--text-primary)',
                    }}>
                      {lead.scorecard.totalScore}/{MAX_TOTAL_SCORE}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>—</span>
                  )}
                </div>
                {/* Lead Tier */}
                <div style={{ width: '3.5rem', flexShrink: 0 }}>
                  {tier ? (
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700,
                      padding: '0.0625rem 0.375rem', borderRadius: 99,
                      background: tier.bg, color: tier.color,
                    }}>
                      {tier.emoji} {tier.label}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>—</span>
                  )}
                </div>
                {/* Role */}
                <span style={{ width: '6rem', flexShrink: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  {ROLE_LABELS[lead.qualification?.role] || '—'}
                </span>
                {/* Sites */}
                <span style={{ width: '3rem', flexShrink: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {WEBSITE_LABELS[lead.qualification?.websiteCount] || '—'}
                </span>
                {/* Timeline */}
                <span style={{ width: '5rem', flexShrink: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  {TIMELINE_LABELS[lead.qualification?.timeline] || '—'}
                </span>
                {/* Status */}
                <div style={{ width: '5rem', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                    padding: '0.125rem 0.375rem', borderRadius: 99,
                    background: sc.bg, color: sc.color,
                  }}>
                    {sc.label}
                  </span>
                </div>
                {/* Signed Up */}
                <span style={{
                  width: '5.5rem', flexShrink: 0, fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem', color: 'var(--text-disabled)',
                }}>
                  {timeAgo(lead.signedUpAt)}
                </span>
                {/* Actions */}
                <div style={{ width: '4rem', flexShrink: 0, display: 'flex', gap: '0.25rem' }}
                  onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedLead(lead)} title="View details"
                    style={{
                      background: 'none', border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.25rem',
                      padding: '0.125rem 0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    }}>
                    <Eye size={10} style={{ color: 'var(--accent)' }} />
                  </button>
                  <button onClick={async () => {
                    if (window.confirm(`Delete ${lead.name || lead.email}?`)) {
                      await deleteLead(lead.id)
                      await refresh()
                    }
                  }} title="Delete lead"
                    style={{
                      background: 'none', border: '0.0625rem solid var(--border-subtle)', borderRadius: '0.25rem',
                      padding: '0.125rem 0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    }}>
                    <Trash2 size={10} style={{ color: 'var(--color-error, #EF4444)' }} />
                  </button>
                </div>
              </div>
            )
          })}

          {pagedLeads.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
              {search || leadTierFilter !== 'all' || scoreTierFilter !== 'all' || roleFilter !== 'all' || timelineFilter !== 'all' || statusFilter !== 'all'
                ? 'No leads match your filters'
                : 'No waitlist signups yet'}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
              fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
              border: '0.0625rem solid var(--border-subtle)', background: 'var(--card-bg)',
              color: 'var(--text-secondary)', opacity: page === 0 ? 0.4 : 1,
            }}>
            <ChevronLeft size={12} /> Prev
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
            {page + 1} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
              fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer',
              border: '0.0625rem solid var(--border-subtle)', background: 'var(--card-bg)',
              color: 'var(--text-secondary)', opacity: page >= totalPages - 1 ? 0.4 : 1,
            }}>
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Lead Detail Panel */}
      <LeadDetailPanel
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onMarkInvited={async () => {
          if (selectedLead) {
            await markInvited(selectedLead.id)
            await refresh()
            setSelectedLead(prev => prev ? { ...prev, invited: true } : null)
          }
        }}
        onMarkNudged={async () => {
          if (selectedLead) {
            await markNudged(selectedLead.id)
            await refresh()
            setSelectedLead(prev => prev ? { ...prev, nudged: true } : null)
          }
        }}
        onUpdateNotes={async (notes) => {
          if (selectedLead) {
            await updateAdminNotes(selectedLead.id, notes)
          }
        }}
        onUpdateStatus={async (status) => {
          if (selectedLead) {
            await updateLeadStatus(selectedLead.id, status)
            await refresh()
            setSelectedLead(prev => prev ? { ...prev, status } : null)
          }
        }}
        onDelete={async () => {
          if (selectedLead) {
            await deleteLead(selectedLead.id)
            setSelectedLead(null)
            await refresh()
          }
        }}
        onLogContact={async (leadId, contactEntry) => {
          await logContact(leadId, contactEntry)
          await refresh()
          setSelectedLead(prev => {
            if (!prev) return null
            const history = prev.contactHistory || []
            return { ...prev, contactHistory: [...history, { ...contactEntry, sentAt: new Date().toISOString() }] }
          })
        }}
        customTemplates={customTemplates}
      />
    </div>
  )
}


/* ═══════════════════════════════════════════════ */
/*  TAB 3 — TEMPLATES                              */
/* ═══════════════════════════════════════════════ */

function TemplatesTab({ bulkEmail, leads }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Template Manager */}
      <TemplateManager
        customTemplates={bulkEmail.customTemplates}
        leads={leads}
        onSaveCustom={bulkEmail.saveCustomTemplate}
        onDeleteCustom={bulkEmail.deleteCustomTemplate}
        onDuplicate={bulkEmail.duplicateTemplate}
      />

      {/* Send History */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <SectionHeader icon={Clock} title="Send History" color="#06B6D4"
          count={`${bulkEmail.sendHistory.length} exports`} />
        {bulkEmail.sendHistory.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
            No bulk exports yet. Use the Bulk Email composer from the Leads tab.
          </div>
        ) : (
          <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem',
              borderBottom: '0.0625rem solid var(--border-subtle)', background: 'var(--hover-bg)',
              fontSize: '0.5625rem', fontWeight: 700, color: 'var(--text-disabled)',
              textTransform: 'uppercase', letterSpacing: '0.04rem', fontFamily: 'var(--font-mono)',
            }}>
              <span style={{ flex: 1 }}>Template</span>
              <span style={{ width: '5rem' }}>Audience</span>
              <span style={{ width: '3.5rem' }}>Recipients</span>
              <span style={{ width: '4.5rem' }}>Method</span>
              <span style={{ width: '5.5rem' }}>Date</span>
            </div>
            {/* Rows */}
            {bulkEmail.sendHistory.map(h => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 1rem', borderBottom: '0.0625rem solid var(--border-subtle)',
                fontSize: '0.6875rem',
              }}>
                <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h.templateName || '—'}
                </span>
                <span style={{ width: '5rem', color: 'var(--text-secondary)' }}>
                  {h.audience || '—'}
                </span>
                <span style={{ width: '3.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {h.recipientCount || 0}
                </span>
                <span style={{ width: '4.5rem' }}>
                  <span style={{
                    fontSize: '0.5625rem', fontWeight: 600, padding: '0.0625rem 0.375rem',
                    borderRadius: 99, background: 'var(--hover-bg)', color: 'var(--text-disabled)',
                  }}>
                    {h.exportMethod || '—'}
                  </span>
                </span>
                <span style={{
                  width: '5.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                  color: 'var(--text-disabled)',
                }}>
                  {formatDate(h.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
