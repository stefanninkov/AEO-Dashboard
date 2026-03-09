import { memo } from 'react'
import {
  Search, Download, ChevronLeft, ChevronRight, Filter,
  CheckCircle2, MessageSquare, UserPlus, Shield, BarChart3,
  RefreshCw, FileText, Activity, Sparkles,
} from 'lucide-react'

const TYPE_ICONS = {
  check: CheckCircle2, uncheck: CheckCircle2,
  comment: MessageSquare, mention: MessageSquare,
  task_assign: UserPlus, task_unassign: UserPlus,
  member_add: UserPlus, member_remove: UserPlus,
  role_change: Shield,
  analyze: BarChart3, monitor: RefreshCw,
  score_change: Sparkles, note: FileText,
  automation_create: Activity,
}

const TYPE_COLORS = {
  check: 'var(--color-success)', uncheck: 'var(--text-disabled)',
  comment: 'var(--accent)', mention: 'var(--color-phase-2)',
  task_assign: 'var(--color-phase-3)', task_unassign: 'var(--text-tertiary)',
  member_add: 'var(--color-phase-4)', member_remove: 'var(--color-error)',
  role_change: 'var(--color-phase-5)',
  analyze: 'var(--color-phase-1)', monitor: 'var(--color-phase-6)',
  score_change: 'var(--color-phase-2)', note: 'var(--color-phase-7)',
  automation_create: 'var(--accent)',
}

/**
 * AuditLogViewer — Advanced audit log table with filters, search, and pagination.
 */
function AuditLogViewer({
  entries = [], totalEntries = 0, stats = {},
  search, setSearch, typeFilter, setTypeFilter,
  authorFilter, setAuthorFilter, dateRange, setDateRange,
  uniqueTypes = [], uniqueAuthors = [],
  page, setPage, totalPages, pageSize,
  exportCsv, currentUserUid,
}) {
  const selectStyle = {
    padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-2xs)',
    border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-input)', color: 'var(--text-primary)',
    outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-3)',
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', flexWrap: 'wrap',
      }}>
        <StatPill label="Total" value={stats.total || 0} />
        <StatPill label="Today" value={stats.today || 0} />
        <StatPill label="This Week" value={stats.thisWeek || 0} />
        <StatPill label="This Month" value={stats.thisMonth || 0} />
        <StatPill label="Authors" value={stats.uniqueAuthors || 0} />
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 12rem' }}>
          <Search size={12} style={{ position: 'absolute', left: 'var(--space-2)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit log..."
            style={{
              width: '100%', padding: 'var(--space-1) var(--space-2) var(--space-1) 1.75rem',
              fontSize: 'var(--text-2xs)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', background: 'var(--bg-input)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>

        {/* Type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
          {uniqueTypes.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
          ))}
        </select>

        {/* Author filter */}
        <select value={authorFilter} onChange={e => setAuthorFilter(e.target.value)} style={selectStyle}>
          {uniqueAuthors.map(a => (
            <option key={a.uid} value={a.uid}>{a.name}</option>
          ))}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={dateRange.start || ''}
          onChange={e => setDateRange({ ...dateRange, start: e.target.value || null })}
          style={{ ...selectStyle, width: '8rem' }}
          title="Start date"
        />
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>to</span>
        <input
          type="date"
          value={dateRange.end || ''}
          onChange={e => setDateRange({ ...dateRange, end: e.target.value || null })}
          style={{ ...selectStyle, width: '8rem' }}
          title="End date"
        />

        {/* Export */}
        <button
          onClick={exportCsv}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            background: 'var(--hover-bg)', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-secondary)',
          }}
        >
          <Download size={10} /> Export
        </button>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>
        Showing {entries.length} of {totalEntries} entries
        {totalEntries !== stats.total && ` (filtered from ${stats.total})`}
      </div>

      {/* Log table */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
          <thead>
            <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Event</th>
              <th style={thStyle}>Author</th>
              <th style={thStyle}>Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  No audit entries match your filters
                </td>
              </tr>
            ) : (
              entries.map(entry => {
                const Icon = TYPE_ICONS[entry.type] || Activity
                const color = TYPE_COLORS[entry.type] || 'var(--text-tertiary)'
                const isMe = entry.authorUid === currentUserUid
                return (
                  <tr key={entry.id} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', width: '10rem', fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <div style={{
                          width: '1.25rem', height: '1.25rem', borderRadius: '50%', flexShrink: 0,
                          background: `color-mix(in srgb, ${color} 12%, transparent)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={10} style={{ color }} />
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {formatEventType(entry.type)}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: isMe ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {isMe ? 'You' : (entry.authorName || entry.authorEmail || 'System')}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--text-tertiary)', maxWidth: '20rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getEntryDetails(entry)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="btn-icon-sm"
            style={{ opacity: page === 0 ? 0.3 : 1 }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="btn-icon-sm"
            style={{ opacity: page >= totalPages - 1 ? 0.3 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  padding: 'var(--space-2) var(--space-3)', textAlign: 'left',
  fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)',
  textTransform: 'uppercase', letterSpacing: '0.03rem',
}

const tdStyle = {
  padding: 'var(--space-2) var(--space-3)',
}

function StatPill({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>{label}</div>
    </div>
  )
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${d.toLocaleDateString('en-CA')} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`
}

function formatEventType(type) {
  if (!type) return 'Unknown'
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getEntryDetails(entry) {
  const parts = []
  if (entry.taskText) parts.push(entry.taskText)
  if (entry.itemLabel) parts.push(entry.itemLabel)
  if (entry.assigneeName) parts.push(`→ ${entry.assigneeName}`)
  if (entry.memberName) parts.push(entry.memberName)
  if (entry.commentText) parts.push(`"${entry.commentText}"`)
  if (entry.newRole) parts.push(`role: ${entry.newRole}`)
  if (entry.score != null) parts.push(`score: ${entry.score}%`)
  if (entry.ruleName) parts.push(`rule: ${entry.ruleName}`)
  return parts.join(' · ') || '—'
}

export default memo(AuditLogViewer)
