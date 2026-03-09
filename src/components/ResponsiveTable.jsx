import { memo } from 'react'

/**
 * ResponsiveTable — Responsive data table that switches to card layout on mobile.
 *
 * Props:
 *   columns   — Array of { key, label, width?, render? }
 *   rows      — Array of data objects
 *   isMobile  — Boolean, switches to card layout
 *   onRowClick — Optional row click handler
 *   emptyText — Text when no rows
 */
function ResponsiveTable({ columns = [], rows = [], isMobile = false, onRowClick, emptyText = 'No data' }) {
  if (rows.length === 0) {
    return (
      <div style={{
        padding: 'var(--space-6)', textAlign: 'center',
        color: 'var(--text-disabled)', fontSize: 'var(--text-xs)',
      }}>
        {emptyText}
      </div>
    )
  }

  // Mobile: card layout
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {rows.map((row, i) => (
          <div
            key={row.id || i}
            onClick={() => onRowClick?.(row)}
            style={{
              background: 'var(--bg-card)',
              border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              cursor: onRowClick ? 'pointer' : 'default',
            }}
          >
            {columns.map(col => {
              const value = col.render ? col.render(row[col.key], row) : row[col.key]
              return (
                <div key={col.key} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '0.1875rem 0',
                  borderBottom: '0.0625rem solid var(--border-subtle)',
                }}>
                  <span style={{
                    fontSize: 'var(--text-2xs)', fontWeight: 600,
                    color: 'var(--text-tertiary)', textTransform: 'uppercase',
                    letterSpacing: '0.02rem',
                  }}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textAlign: 'right' }}>
                    {value ?? '—'}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // Desktop: standard table
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'auto',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
        <thead>
          <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: 'var(--space-2) var(--space-3)',
                textAlign: 'left', fontSize: 'var(--text-2xs)',
                fontWeight: 600, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.03rem',
                whiteSpace: 'nowrap',
                ...(col.width ? { width: col.width } : {}),
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: '0.0625rem solid var(--border-subtle)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 80ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: 'var(--space-2) var(--space-3)' }}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(ResponsiveTable)
