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
    <div className="view-wrapper">
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
    <div className="view-wrapper">
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
    <div className="view-wrapper">
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
    <div className="view-wrapper">
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
    <div className="view-wrapper">
      <div className="card fade-in-up" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Skeleton width="4rem" height="4rem" borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="10rem" height="1rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="16rem" height="0.625rem" />
        </div>
      </div>
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

/* ── Competitors Skeleton ── */
export function CompetitorsSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton width="10rem" height="1.25rem" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1rem' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card fade-in-up" style={{ padding: '1rem', animationDelay: `${i * 80}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Skeleton width="2rem" height="2rem" borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="8rem" height="0.75rem" />
                <Skeleton width="12rem" height="0.5rem" style={{ marginTop: '0.25rem' }} />
              </div>
            </div>
            <Skeleton width="100%" height="0.375rem" borderRadius="99rem" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Analyzer Skeleton ── */
export function AnalyzerSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton width="12rem" height="1.25rem" />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Skeleton width="100%" height="2.5rem" />
        <Skeleton width="6rem" height="2.5rem" />
      </div>
      <div className="card fade-in-up" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Skeleton width="6rem" height="6rem" borderRadius="50%" />
        </div>
        <Skeleton width="60%" height="0.75rem" style={{ margin: '0 auto 0.5rem' }} />
        <Skeleton width="40%" height="0.5rem" style={{ margin: '0 auto' }} />
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} className="card fade-in-up" style={{ padding: '1rem', animationDelay: `${100 + i * 60}ms` }}>
          <Skeleton width="10rem" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="100%" height="0.5rem" />
          <Skeleton width="80%" height="0.5rem" style={{ marginTop: '0.25rem' }} />
        </div>
      ))}
    </div>
  )
}

/* ── Content Ops Skeleton ── */
export function ContentOpsSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="10rem" height="1.25rem" />
        <Skeleton width="6rem" height="2rem" />
      </div>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderBottom: '0.0625rem solid var(--border-subtle)', animationDelay: `${i * 50}ms` }}>
          <Skeleton width="1.5rem" height="1.5rem" borderRadius="0.25rem" />
          <div style={{ flex: 1 }}>
            <Skeleton width={`${50 + i * 5}%`} height="0.625rem" />
            <Skeleton width="4rem" height="0.5rem" style={{ marginTop: '0.25rem' }} />
          </div>
          <Skeleton width="3rem" height="1.25rem" borderRadius="99rem" />
        </div>
      ))}
    </div>
  )
}

/* ── GSC / GA4 Skeleton ── */
export function GscSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton width="12rem" height="1.25rem" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card fade-in-up" style={{ padding: '1rem', animationDelay: `${i * 60}ms` }}>
            <Skeleton width="4rem" height="0.5rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="5rem" height="1.25rem" />
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: '1rem' }}>
        <Skeleton width="100%" height="12rem" />
      </div>
    </div>
  )
}

/* ── Monitoring Skeleton ── */
export function MonitoringSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="10rem" height="1.25rem" />
        <Skeleton width="8rem" height="2rem" />
      </div>
      <div className="card" style={{ padding: '1.5rem' }}>
        <Skeleton width="100%" height="14rem" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[0, 1].map(i => (
          <div key={i} className="card fade-in-up" style={{ padding: '1rem', animationDelay: `${i * 80}ms` }}>
            <Skeleton width="6rem" height="0.75rem" style={{ marginBottom: '0.75rem' }} />
            {[0, 1, 2].map(j => (
              <SkeletonRow key={j} delay={100 + j * 50} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Settings Skeleton ── */
export function SettingsSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton width="8rem" height="1.25rem" />
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} width="5rem" height="1.75rem" borderRadius="99rem" />
        ))}
      </div>
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="card fade-in-up" style={{ padding: '1rem', animationDelay: `${i * 60}ms` }}>
          <Skeleton width="8rem" height="0.75rem" style={{ marginBottom: '0.75rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="14rem" height="0.625rem" />
            <Skeleton width="2.5rem" height="1.25rem" borderRadius="99rem" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── SEO Skeleton ── */
export function SeoSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton width="8rem" height="1.25rem" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="card fade-in-up" style={{ padding: '1rem', textAlign: 'center', animationDelay: `${i * 60}ms` }}>
            <Skeleton width="3rem" height="3rem" borderRadius="50%" style={{ margin: '0 auto 0.5rem' }} />
            <Skeleton width="5rem" height="0.75rem" style={{ margin: '0 auto 0.25rem' }} />
            <Skeleton width="3rem" height="0.5rem" style={{ margin: '0 auto' }} />
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: '1rem' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
            <Skeleton width="1rem" height="1rem" borderRadius="0.25rem" />
            <Skeleton width={`${40 + i * 8}%`} height="0.625rem" />
            <Skeleton width="3rem" height="1rem" borderRadius="99rem" style={{ marginLeft: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── AEO Impact Skeleton ── */
export function AeoImpactSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton width="10rem" height="1.25rem" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))', gap: '1rem' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card fade-in-up" style={{ padding: '1rem', animationDelay: `${i * 60}ms` }}>
            <Skeleton width="6rem" height="0.5rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="4rem" height="1.5rem" />
            <Skeleton width="100%" height="0.25rem" borderRadius="99rem" style={{ marginTop: '0.5rem' }} />
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: '1.5rem' }}>
        <Skeleton width="100%" height="10rem" />
      </div>
    </div>
  )
}

/* ── Portal Skeleton ── */
export function PortalSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Skeleton width="2.5rem" height="2.5rem" borderRadius="50%" />
        <div>
          <Skeleton width="10rem" height="1rem" />
          <Skeleton width="14rem" height="0.5rem" style={{ marginTop: '0.25rem' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <Skeleton key={i} width="5rem" height="1.75rem" borderRadius="99rem" />
        ))}
      </div>
      <div className="card" style={{ padding: '1.5rem' }}>
        <Skeleton width="100%" height="16rem" />
      </div>
    </div>
  )
}
