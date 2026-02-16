export default function PhaseDonut({ phases, getPhaseProgress, onNavigate }) {
  const phaseData = phases.map(phase => {
    const prog = getPhaseProgress(phase)
    return { ...phase, ...prog }
  })
  const totalItems = phaseData.reduce((s, p) => s + p.total, 0)
  const totalDone = phaseData.reduce((s, p) => s + p.checked, 0)
  const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0
  const radius = 70
  const circumference = 2 * Math.PI * radius

  // Build segments
  let offset = 0
  const segments = phaseData.map(p => {
    const fraction = totalItems > 0 ? p.checked / totalItems : 0
    const length = fraction * circumference
    const seg = { color: p.color, length, offset, title: p.title, checked: p.checked, total: p.total, percent: p.percent }
    offset += length
    return seg
  })

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {/* SVG Donut */}
      <div style={{ flexShrink: 0 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="16" />
          {/* Phase segments */}
          {segments.map((seg, i) => seg.length > 0 && (
            <circle
              key={i}
              cx="80" cy="80" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dasharray 500ms ease' }}
            />
          ))}
          {/* Center text */}
          <text x="80" y="74" textAnchor="middle" style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, fill: 'var(--text-primary)' }}>
            {overallPercent}%
          </text>
          <text x="80" y="94" textAnchor="middle" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fill: 'var(--text-tertiary)' }}>
            Complete
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ flex: 1, minWidth: '10rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.75px', color: 'var(--text-tertiary)',
          marginBottom: '0.25rem',
        }}>
          Phase Progress
        </div>
        {phaseData.map(p => (
          <button
            key={p.id}
            onClick={onNavigate}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.25rem 0.375rem', borderRadius: '0.375rem',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'background 150ms', textAlign: 'left', width: '100%',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{p.title}</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', fontFamily: 'var(--font-heading)' }}>
              {p.checked}/{p.total}
            </span>
            <span style={{ fontSize: '0.6875rem', color: p.percent === 100 ? 'var(--color-success)' : 'var(--text-tertiary)', fontWeight: 600, fontFamily: 'var(--font-heading)', minWidth: '2rem', textAlign: 'right' }}>
              {p.percent}%
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
