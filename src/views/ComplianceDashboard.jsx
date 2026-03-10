import { memo, useState } from 'react'
import {
  ClipboardList, Database, Download, Trash2,
  AlertTriangle, CheckCircle2, Clock, HardDrive, FileText, User, Shield,
} from 'lucide-react'
import { useAuditTrail } from '../hooks/useAuditTrail'
import { useDataRetention } from '../hooks/useDataRetention'
import { useGdprExport } from '../hooks/useGdprExport'
import AuditLogViewer from '../components/AuditLogViewer'

/**
 * ComplianceDashboard — Audit trail, data retention, and GDPR compliance.
 */
function ComplianceDashboard({ activeProject, updateProject, user, projects = [] }) {
  const [tab, setTab] = useState('audit')

  const audit = useAuditTrail({ activeProject })
  const retention = useDataRetention({ activeProject, updateProject })
  const gdpr = useGdprExport({ user, activeProject, projects })

  const TABS = [
    { id: 'audit', label: 'Audit Log', icon: ClipboardList },
    { id: 'retention', label: 'Data Retention', icon: Database },
    { id: 'gdpr', label: 'Privacy & GDPR', icon: Shield },
  ]

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-header-text">
          <h1 className="view-title">Compliance & Audit</h1>
          <p className="view-subtitle">Audit trail, data retention policies, and privacy controls</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 'var(--space-1)',
        borderBottom: '0.0625rem solid var(--border-subtle)',
        paddingBottom: 'var(--space-1)', marginBottom: 'var(--space-4)',
      }}>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-tertiary)',
                borderBottom: tab === t.id ? '0.125rem solid var(--accent)' : '0.125rem solid transparent',
                marginBottom: '-0.0625rem', transition: 'all 100ms',
              }}
            >
              <Icon size={12} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'audit' && (
        <AuditLogViewer
          entries={audit.entries}
          totalEntries={audit.totalEntries}
          stats={audit.stats}
          search={audit.search}
          setSearch={audit.setSearch}
          typeFilter={audit.typeFilter}
          setTypeFilter={audit.setTypeFilter}
          authorFilter={audit.authorFilter}
          setAuthorFilter={audit.setAuthorFilter}
          dateRange={audit.dateRange}
          setDateRange={audit.setDateRange}
          uniqueTypes={audit.uniqueTypes}
          uniqueAuthors={audit.uniqueAuthors}
          page={audit.page}
          setPage={audit.setPage}
          totalPages={audit.totalPages}
          pageSize={audit.pageSize}
          exportCsv={audit.exportCsv}
          currentUserUid={user?.uid}
        />
      )}

      {tab === 'retention' && (
        <RetentionTab retention={retention} />
      )}

      {tab === 'gdpr' && (
        <GdprTab gdpr={gdpr} user={user} />
      )}
    </div>
  )
}

function RetentionTab({ retention }) {
  const { policy, updatePolicy, dataInventory, totalSizeKb, totalExpired, cleanupExpired } = retention

  const inputStyle = {
    padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)',
    border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
    width: '5rem', textAlign: 'center',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)',
      }}>
        <SummaryCard icon={HardDrive} color="var(--accent)" label="Total Data Size" value={`${totalSizeKb} KB`} />
        <SummaryCard icon={Clock} color="var(--color-warning)" label="Expired Records" value={totalExpired} />
        <SummaryCard
          icon={CheckCircle2}
          color="var(--color-success)"
          label="Last Cleanup"
          value={policy.lastCleanup ? new Date(policy.lastCleanup).toLocaleDateString() : 'Never'}
        />
      </div>

      {/* Data inventory */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Data Inventory
          </h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
          <thead>
            <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
              <th style={thStyle}>Data Type</th>
              <th style={thStyle}>Records</th>
              <th style={thStyle}>Size</th>
              <th style={thStyle}>Retention</th>
              <th style={thStyle}>Expired</th>
              <th style={thStyle}>Oldest</th>
            </tr>
          </thead>
          <tbody>
            {dataInventory.map(item => (
              <tr key={item.id} style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {item.label}
                </td>
                <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {item.count.toLocaleString()}
                </td>
                <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                  {item.estimatedSizeKb} KB
                </td>
                <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)' }}>
                  {item.retentionDays} days
                </td>
                <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                  {item.expiredCount > 0 ? (
                    <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{item.expiredCount}</span>
                  ) : (
                    <span style={{ color: 'var(--color-success)' }}>0</span>
                  )}
                </td>
                <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-disabled)', fontSize: '0.5625rem' }}>
                  {item.oldestTimestamp ? new Date(item.oldestTimestamp).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Retention settings */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)' }}>
          Retention Policy
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))', gap: 'var(--space-3)' }}>
          {[
            { key: 'activityLogDays', label: 'Activity Log' },
            { key: 'metricsHistoryDays', label: 'Metrics History' },
            { key: 'monitorHistoryDays', label: 'Monitor History' },
            { key: 'notificationDays', label: 'Notifications' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>
                {field.label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <input
                  type="number"
                  value={policy[field.key]}
                  onChange={e => updatePolicy({ [field.key]: Math.max(1, parseInt(e.target.value) || 1) })}
                  min="1"
                  style={inputStyle}
                />
                <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cleanup action */}
      {totalExpired > 0 && (
        <div style={{
          background: 'color-mix(in srgb, var(--color-warning) 6%, transparent)',
          border: '0.0625rem solid var(--color-warning)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {totalExpired} expired records found
              </div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
                These records exceed your retention policy limits
              </div>
            </div>
          </div>
          <button
            onClick={cleanupExpired}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-warning)', border: 'none',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontSize: 'var(--text-xs)', fontWeight: 600, color: '#fff',
            }}
          >
            <Trash2 size={12} /> Cleanup Now
          </button>
        </div>
      )}
    </div>
  )
}

function GdprTab({ gdpr, user }) {
  const inventory = gdpr.personalDataInventory()
  const erasureReport = gdpr.generateErasureReport()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Data portability */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--accent)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Download size={14} style={{ color: 'var(--accent)' }} />
            Data Portability (Article 20)
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
            Export all your personal data in a machine-readable format
          </p>
        </div>
        <button
          onClick={gdpr.exportAllPersonalData}
          disabled={gdpr.exporting}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--accent)', border: 'none',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            fontSize: 'var(--text-xs)', fontWeight: 600, color: '#fff',
            opacity: gdpr.exporting ? 0.5 : 1,
          }}
        >
          <Download size={12} />
          {gdpr.exporting ? 'Exporting...' : 'Export My Data'}
        </button>
      </div>

      {/* Personal data inventory */}
      <div style={{
        background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <User size={14} style={{ color: 'var(--accent)' }} />
            Personal Data Inventory
          </h3>
        </div>

        {inventory.map(category => (
          <div key={category.category}>
            <div style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--hover-bg)',
              fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.03rem',
            }}>
              {category.category}
            </div>
            {category.fields.map((field, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                padding: 'var(--space-2) var(--space-4)',
                borderBottom: '0.0625rem solid var(--border-subtle)',
                fontSize: 'var(--text-xs)',
              }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{field.name}</span>
                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.value}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>{field.purpose}</span>
                <span style={{ color: 'var(--text-disabled)', fontSize: '0.5625rem' }}>{field.retention}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Erasure report */}
      {erasureReport && (
        <div style={{
          background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <FileText size={14} style={{ color: 'var(--color-warning)' }} />
            Erasure Report (Article 17)
          </h3>
          <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', margin: '0 0 var(--space-3)' }}>
            Summary of data that would be affected by a deletion request
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {erasureReport.dataToErase.map((item, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '8rem 1fr 1fr',
                padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)',
                background: i % 2 === 0 ? 'var(--hover-bg)' : 'transparent',
                fontSize: 'var(--text-xs)',
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.type}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.description}</span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.5625rem' }}>{item.action}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)', margin: 'var(--space-3) 0 0', fontStyle: 'italic' }}>
            {erasureReport.note}
          </p>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon: Icon, color, label, value }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center',
    }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '50%', margin: '0 auto var(--space-2)',
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-disabled)' }}>{label}</div>
    </div>
  )
}

const thStyle = {
  padding: 'var(--space-2) var(--space-3)', textAlign: 'left',
  fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-tertiary)',
  textTransform: 'uppercase', letterSpacing: '0.03rem',
}

export default memo(ComplianceDashboard)
