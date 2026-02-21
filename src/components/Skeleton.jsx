/* ══════════════════════════════════════════════════
   SKELETON LOADING COMPONENTS
   Reusable shimmer placeholders for every view
   ══════════════════════════════════════════════════ */

/* ── Base Skeleton ── */
export function Skeleton({ width = '100%', height = '1rem', borderRadius = '0.5rem', className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius, ...style }}
    />
  )
}

/* ── Skeleton Row (icon + text) ── */
function SkeletonRow({ iconSize = '1rem', lines = 1, delay = 0 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', animationDelay: `${delay}ms` }} className="fade-in-up">
      <Skeleton width={iconSize} height={iconSize} borderRadius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <Skeleton height="0.75rem" width="70%" />
        {lines > 1 && <Skeleton height="0.625rem" width="45%" />}
      </div>
    </div>
  )
}

/* ── Dashboard Skeleton ── */
export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title area */}
      <div className="fade-in-up">
        <Skeleton width="12rem" height="1.25rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="18rem" height="0.75rem" />
      </div>

      {/* Stat cards grid */}
      <div className="checklist-stats-grid">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="stat-card fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <Skeleton width="4rem" height="0.625rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="3rem" height="1.5rem" />
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div className="card fade-in-up" style={{ padding: '1.25rem', animationDelay: '200ms' }}>
        <Skeleton width="8rem" height="0.625rem" style={{ marginBottom: '1rem' }} />
        <Skeleton width="100%" height="10rem" borderRadius="0.75rem" />
      </div>

      {/* Phase list card */}
      <div className="card fade-in-up" style={{ padding: '1rem', animationDelay: '300ms' }}>
        <Skeleton width="10rem" height="0.625rem" style={{ marginBottom: '1rem' }} />
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: i < 3 ? '0.0625rem solid var(--border-subtle)' : 'none' }}>
            <Skeleton width="1.5rem" height="1.5rem" borderRadius="0.375rem" />
            <div style={{ flex: 1 }}>
              <Skeleton width={`${60 + i * 8}%`} height="0.75rem" style={{ marginBottom: '0.25rem' }} />
              <Skeleton width="4rem" height="0.5rem" />
            </div>
            <Skeleton width="3rem" height="0.375rem" borderRadius="99rem" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Checklist Skeleton ── */
export function ChecklistSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title */}
      <div className="fade-in-up">
        <Skeleton width="6rem" height="1rem" />
      </div>

      {/* Stats grid */}
      <div className="checklist-stats-grid">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="stat-card fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <Skeleton width="4rem" height="0.625rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="2rem" height="1.25rem" />
          </div>
        ))}
      </div>

      {/* Progress bar card */}
      <div className="card fade-in-up" style={{ padding: '1.25rem', animationDelay: '200ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <Skeleton width="7rem" height="0.625rem" />
          <Skeleton width="4rem" height="1rem" />
        </div>
        <Skeleton width="100%" height="0.375rem" borderRadius="99rem" />
      </div>

      {/* Search */}
      <Skeleton width="100%" height="2.5rem" borderRadius="0.625rem" className="fade-in-up" style={{ animationDelay: '250ms' }} />

      {/* Phase cards */}
      {[0, 1, 2].map(i => (
        <div key={i} className="card fade-in-up" style={{ padding: '1rem', animationDelay: `${300 + i * 80}ms` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Skeleton width="1.5rem" height="1.5rem" borderRadius="0.375rem" />
            <div style={{ flex: 1 }}>
              <Skeleton width="5rem" height="0.5rem" style={{ marginBottom: '0.375rem' }} />
              <Skeleton width={`${50 + i * 10}%`} height="0.75rem" />
            </div>
            <Skeleton width="2.5rem" height="0.75rem" />
            <Skeleton width="4rem" height="0.375rem" borderRadius="99rem" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Metrics Skeleton ── */
export function MetricsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="8rem" height="1rem" />
        <Skeleton width="6rem" height="2rem" borderRadius="0.5rem" />
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))', gap: '1rem' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card fade-in-up" style={{ padding: '1.125rem', animationDelay: `${i * 60}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <Skeleton width="5rem" height="0.625rem" />
              <Skeleton width="2.25rem" height="2.25rem" borderRadius="0.5rem" />
            </div>
            <Skeleton width="4rem" height="1.75rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="6rem" height="0.625rem" />
          </div>
        ))}
      </div>

      {/* Chart cards */}
      {[0, 1].map(i => (
        <div key={i} className="card fade-in-up" style={{ padding: '1.25rem', animationDelay: `${300 + i * 100}ms` }}>
          <Skeleton width="10rem" height="0.75rem" style={{ marginBottom: '1rem' }} />
          <Skeleton width="100%" height="12rem" borderRadius="0.75rem" />
        </div>
      ))}
    </div>
  )
}

/* ── Docs Skeleton ── */
export function DocsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search bar */}
      <Skeleton width="100%" height="2.5rem" borderRadius="0.625rem" className="fade-in-up" />

      {/* Filter pills */}
      <div className="fade-in-up" style={{ display: 'flex', gap: '0.5rem', animationDelay: '100ms' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <Skeleton key={i} width={`${3.5 + i * 0.5}rem`} height="1.75rem" borderRadius="99rem" />
        ))}
      </div>

      {/* Doc items */}
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="card fade-in-up" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', animationDelay: `${200 + i * 60}ms` }}>
          <Skeleton width="2.25rem" height="2.25rem" borderRadius="0.625rem" />
          <div style={{ flex: 1 }}>
            <Skeleton width={`${55 + i * 5}%`} height="0.75rem" style={{ marginBottom: '0.375rem' }} />
            <Skeleton width="90%" height="0.625rem" />
          </div>
          <Skeleton width="1rem" height="1rem" borderRadius="50%" />
        </div>
      ))}
    </div>
  )
}

/* ── Testing Skeleton ── */
export function TestingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Score card */}
      <div className="card fade-in-up" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Skeleton width="4rem" height="4rem" borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="10rem" height="1rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="16rem" height="0.625rem" />
        </div>
      </div>

      {/* Section cards */}
      {[0, 1, 2].map(i => (
        <div key={i} className="card fade-in-up" style={{ padding: '1rem', animationDelay: `${150 + i * 80}ms` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <Skeleton width="8rem" height="0.75rem" />
            <Skeleton width="3rem" height="0.75rem" />
          </div>
          {[0, 1, 2].map(j => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', borderTop: '0.0625rem solid var(--border-subtle)' }}>
              <Skeleton width="1rem" height="1rem" borderRadius="50%" />
              <Skeleton width={`${60 + j * 10}%`} height="0.625rem" />
              <Skeleton width="2.5rem" height="1.25rem" borderRadius="99rem" style={{ marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
