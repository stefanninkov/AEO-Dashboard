import { Plus, ArrowRight, CheckSquare, Zap, FlaskConical } from 'lucide-react'

export default function DashboardView({ projects, activeProject, setActiveProjectId, setActiveView, onNewProject, phases, userName }) {
  const getProjectProgress = (project) => {
    if (!phases) return { total: 0, checked: 0, percent: 0 }
    let total = 0
    phases.forEach(phase => {
      phase.categories.forEach(cat => {
        total += cat.items.length
      })
    })
    const checked = Object.values(project.checked || {}).filter(Boolean).length
    return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }

  const getPhaseProgress = (phase) => {
    if (!activeProject) return { total: 0, checked: 0, percent: 0 }
    let total = 0, checked = 0
    phase.categories.forEach(cat => {
      cat.items.forEach(item => {
        total++
        if (activeProject.checked?.[item.id]) checked++
      })
    })
    return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }

  const totalProgress = activeProject ? getProjectProgress(activeProject) : { total: 0, checked: 0, percent: 0 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome back{userName ? `, ${userName}` : ''}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
          Here's an overview of your AEO projects and progress.
        </p>
      </div>

      {/* Stats Grid — 3 columns */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total Tasks</div>
          <div className="stat-card-value" style={{ color: 'var(--text-primary)' }}>{totalProgress.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>{totalProgress.checked}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Remaining</div>
          <div className="stat-card-value" style={{ color: 'var(--color-phase-1)' }}>{totalProgress.total - totalProgress.checked}</div>
        </div>
      </div>

      {/* Phase Progress Card — simple LIST */}
      {activeProject && phases && (
        <div className="phase-progress-card">
          <div className="phase-progress-card-header">Phase Progress</div>
          {phases.map(phase => {
            const pp = getPhaseProgress(phase)
            return (
              <div
                key={phase.id}
                className="phase-progress-row"
                onClick={() => setActiveView('checklist')}
              >
                <div
                  className="phase-row-icon"
                  style={{ background: phase.color + '15' }}
                >
                  {phase.icon}
                </div>
                <div className="phase-row-name">{phase.title}</div>
                <div className="phase-row-count">{pp.checked}/{pp.total}</div>
                <div className="phase-row-percent" style={{ color: phase.color }}>{pp.percent}%</div>
                <div className="phase-row-bar">
                  <div className="phase-row-bar-fill" style={{ width: `${pp.percent}%`, backgroundColor: phase.color }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-grid">
        <button
          className="quick-action-card"
          onClick={() => setActiveView('checklist')}
        >
          <CheckSquare size={24} className="text-phase-3" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Open Checklist</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Track your AEO tasks</p>
        </button>
        <button
          className="quick-action-card"
          onClick={() => setActiveView('analyzer')}
        >
          <Zap size={24} className="text-phase-1" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Run Analyzer</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Scan your site for AEO</p>
        </button>
        <button
          className="quick-action-card"
          onClick={() => setActiveView('testing')}
        >
          <FlaskConical size={24} className="text-phase-5" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Start Testing</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Test across AI platforms</p>
        </button>
      </div>

      {/* No project empty state */}
      {!activeProject && projects.length === 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <Zap size={32} className="text-phase-1" style={{ marginBottom: 16 }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No projects yet</h3>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20, textAlign: 'center', maxWidth: 300 }}>
            Create your first project to start tracking AEO progress.
          </p>
          <button onClick={onNewProject} className="btn-primary">
            <Plus size={14} />
            Create Project
          </button>
        </div>
      )}
    </div>
  )
}
