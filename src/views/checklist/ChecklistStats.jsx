import AnimatedNumber from '../../components/AnimatedNumber'
import StatCard from '../dashboard/StatCard'

export default function ChecklistStats({ totalProgress, phaseCount }) {
  return (
    <>
      {/* Stats Grid — 4 columns */}
      <div className="checklist-stats-grid">
        <StatCard label="Completed" value={<AnimatedNumber value={totalProgress.done} />} />
        <StatCard label="Remaining" value={<AnimatedNumber value={totalProgress.total - totalProgress.done} />} />
        <StatCard label="Phases" value={phaseCount} />
        <StatCard label="Total" value={totalProgress.total} />
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075rem', color: 'var(--text-tertiary)' }}>Overall Progress</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <AnimatedNumber value={totalProgress.done} />/{totalProgress.total} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(<AnimatedNumber value={totalProgress.percent} />%)</span>
          </span>
        </div>
        <div style={{ width: '100%', height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '6.1875rem', overflow: 'hidden' }}>
          <div
            style={{
              width: `${totalProgress.percent}%`,
              height: '100%',
              borderRadius: '6.1875rem',
              transition: 'width 500ms ease-out',
              background: 'linear-gradient(90deg, var(--color-phase-1), var(--color-phase-2), var(--color-phase-3), var(--color-phase-4), var(--color-phase-5), var(--color-phase-6), var(--color-phase-7))',
            }}
          />
        </div>
      </div>
    </>
  )
}
