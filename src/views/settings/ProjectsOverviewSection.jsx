/**
 * ProjectsOverviewSection — Overview of all user's projects with stats.
 * Shown in the "Projects" tab of the redesigned Settings view.
 */
import { useMemo } from 'react'
import { FolderKanban, Globe, Clock, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
import { phases as CHECKLIST_DATA } from '../../data/aeo-checklist'
import {
  sectionTitleStyle,
} from './SettingsShared'

// Phase colors
const PHASE_COLORS = [
  '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
]

function getProjectProgress(project) {
  if (!project?.checklist) return { checked: 0, total: 0, pct: 0, byPhase: [] }

  let totalItems = 0
  let checkedItems = 0
  const byPhase = []

  CHECKLIST_DATA.forEach((phase, phaseIdx) => {
    let phaseTotal = 0
    let phaseChecked = 0
    phase.categories?.forEach(cat => {
      cat.items?.forEach(item => {
        phaseTotal++
        totalItems++
        if (project.checklist?.[item.id]) {
          phaseChecked++
          checkedItems++
        }
      })
    })
    byPhase.push({
      id: phase.id,
      title: phase.title,
      checked: phaseChecked,
      total: phaseTotal,
      pct: phaseTotal > 0 ? Math.round((phaseChecked / phaseTotal) * 100) : 0,
      color: PHASE_COLORS[phaseIdx % PHASE_COLORS.length],
    })
  })

  return {
    checked: checkedItems,
    total: totalItems,
    pct: totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0,
    byPhase,
  }
}

function getFeatureCount(project) {
  let count = 0
  if (project?.analyzerResults) count++
  if (project?.contentHistory?.length > 0) count++
  if (project?.competitors?.length > 0) count++
  if (project?.schemas?.length > 0) count++
  if (project?.contentCalendar?.length > 0) count++
  return count
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never'
  const date = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function ProjectsOverviewSection({ projects = [], onNavigateToProject }) {
  const projectStats = useMemo(() => {
    return projects.map(p => ({
      ...p,
      progress: getProjectProgress(p),
      featureCount: getFeatureCount(p),
    }))
  }, [projects])

  // Summary
  const totalProjects = projectStats.length
  const avgProgress = totalProjects > 0
    ? Math.round(projectStats.reduce((s, p) => s + p.progress.pct, 0) / totalProjects)
    : 0
  const activeProjects = projectStats.filter(p => {
    const updated = p.updatedAt?.toDate ? p.updatedAt.toDate() : new Date(p.updatedAt || 0)
    return (Date.now() - updated.getTime()) < 14 * 86400000
  }).length

  return (
    <>
      {/* Summary */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={sectionTitleStyle}><FolderKanban size={15} /> Projects Overview</div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
          padding: '1rem 1.25rem',
        }}>
          <div style={{
            padding: '0.875rem', borderRadius: '0.625rem',
            background: 'var(--bg-input)', border: '0.0625rem solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
              fontWeight: 700, color: 'var(--text-primary)',
            }}>
              {totalProjects}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
              Total Projects
            </div>
          </div>

          <div style={{
            padding: '0.875rem', borderRadius: '0.625rem',
            background: 'var(--bg-input)', border: '0.0625rem solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
              fontWeight: 700, color: 'var(--color-phase-1)',
            }}>
              {avgProgress}%
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
              Avg Progress
            </div>
          </div>

          <div style={{
            padding: '0.875rem', borderRadius: '0.625rem',
            background: 'var(--bg-input)', border: '0.0625rem solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
              fontWeight: 700, color: 'var(--color-success)',
            }}>
              {activeProjects}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
              Active (14d)
            </div>
          </div>
        </div>
      </div>

      {/* Project cards */}
      {projectStats.length === 0 ? (
        <div className="card" style={{
          padding: '2rem 1.25rem', textAlign: 'center',
          color: 'var(--text-disabled)', fontSize: '0.8125rem',
        }}>
          No projects yet. Create one to get started!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {projectStats.map(project => (
            <div
              key={project.id}
              className="card"
              style={{
                cursor: onNavigateToProject ? 'pointer' : 'default',
                transition: 'border-color 0.15s ease',
              }}
              onClick={() => onNavigateToProject?.(project)}
            >
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1.25rem',
                borderBottom: '0.0625rem solid var(--border-subtle)',
              }}>
                <Globe size={14} style={{ color: 'var(--color-phase-1)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)', fontSize: '0.8125rem',
                    fontWeight: 700, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {project.name || 'Untitled Project'}
                  </div>
                  {project.url && (
                    <div style={{
                      fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {project.url}
                    </div>
                  )}
                </div>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.875rem',
                  fontWeight: 700,
                  color: project.progress.pct >= 75 ? 'var(--color-success)'
                    : project.progress.pct >= 40 ? 'var(--color-phase-1)'
                    : 'var(--text-tertiary)',
                }}>
                  {project.progress.pct}%
                </div>
              </div>

              {/* Phase bars */}
              <div style={{
                display: 'flex', gap: '0.1875rem',
                padding: '0.75rem 1.25rem',
              }}>
                {project.progress.byPhase.map(phase => (
                  <div
                    key={phase.id}
                    title={`${phase.title}: ${phase.pct}%`}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                  >
                    <div style={{
                      height: '0.25rem', borderRadius: '0.125rem',
                      background: 'var(--border-subtle)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${phase.pct}%`,
                        background: phase.color,
                        borderRadius: '0.125rem',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0 1.25rem 0.875rem',
                fontSize: '0.6875rem', color: 'var(--text-tertiary)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={11} />
                  {project.progress.checked}/{project.progress.total} items
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={11} />
                  {timeAgo(project.updatedAt)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {project.featureCount} features used
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
