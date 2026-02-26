/**
 * PipelineBoard — Kanban-style pipeline board with native HTML5 drag-and-drop.
 *
 * All 9 stages as regular columns (pipeline + off-pipeline), each scrollable.
 * Column descriptions visible in headers.
 *
 * DESIGN POLICY: No emojis. All visual indicators use lucide-react icons.
 */
import { useState, useCallback } from 'react'
import { Flame, CircleDot, Circle } from 'lucide-react'
import { ALL_STAGES } from '../constants/pipelineStages'

const LEAD_TIER_DISPLAY = {
  hot:  { icon: Flame,    color: '#EF4444' },
  warm: { icon: CircleDot, color: '#F59E0B' },
  cold: { icon: Circle,   color: '#6B7280' },
}

const MAX_VISIBLE = 8

function daysBetween(a, b) {
  if (!a || !b) return 0
  const msA = a instanceof Date ? a.getTime() : a?.toDate?.()?.getTime?.() || new Date(a).getTime()
  return Math.max(0, Math.round(Math.abs(b - msA) / (1000 * 60 * 60 * 24)))
}

/* ── Pipeline Card ── */
function PipelineCard({ lead, onSelect, onDragStart }) {
  const tier = LEAD_TIER_DISPLAY[lead.leadTier] || LEAD_TIER_DISPLAY.cold
  const TierIcon = tier.icon
  const daysInStage = daysBetween(
    lead.stageChangedAt?.toDate?.() || lead.stageChangedAt || lead.signedUpAt?.toDate?.() || lead.signedUpAt,
    Date.now(),
  )
  const tags = lead.tags || []
  const qual = lead.qualification || {}

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          leadId: lead.id,
          fromStage: lead.pipelineStage || 'new',
        }))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart?.(lead.id)
      }}
      onClick={() => onSelect?.(lead)}
      style={{
        padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
        border: '0.0625rem solid var(--border-subtle)', background: 'var(--card-bg)',
        cursor: 'grab', transition: 'box-shadow 150ms, opacity 150ms',
        display: 'flex', flexDirection: 'column', gap: '0.375rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Row 1: Name + Tier */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {lead.name || lead.email?.split('@')[0] || '\u2014'}
        </span>
        {lead.leadTier && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.125rem',
            fontSize: '0.625rem', fontWeight: 700, flexShrink: 0, color: tier.color,
          }}>
            <TierIcon size={10} /> {lead.scorecard?.totalScore || 0}/33
          </span>
        )}
      </div>

      {/* Row 2: Role + Sites */}
      {(qual.role || qual.websiteCount) && (
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {qual.role && (
            <span style={{
              fontSize: '0.5625rem', fontWeight: 500, padding: '0.0625rem 0.375rem',
              borderRadius: 99, background: 'var(--hover-bg)', color: 'var(--text-tertiary)',
            }}>
              {qual.role === 'agency_owner' ? 'Agency' : qual.role === 'seo_director' ? 'SEO Dir' :
               qual.role === 'inhouse' ? 'In-house' : qual.role === 'freelancer' ? 'Freelance' : 'Other'}
            </span>
          )}
          {qual.websiteCount && (
            <span style={{
              fontSize: '0.5625rem', fontWeight: 500, padding: '0.0625rem 0.375rem',
              borderRadius: 99, background: 'var(--hover-bg)', color: 'var(--text-tertiary)',
            }}>
              {qual.websiteCount} sites
            </span>
          )}
        </div>
      )}

      {/* Row 3: Tags (max 3) + Days */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} style={{
              fontSize: '0.5625rem', fontWeight: 600, padding: '0.0625rem 0.375rem',
              borderRadius: 99, background: 'var(--hover-bg)', color: 'var(--text-secondary)',
              maxWidth: '5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span style={{ fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>
              +{tags.length - 3}
            </span>
          )}
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-disabled)', flexShrink: 0,
        }}>
          {daysInStage}d
        </span>
      </div>
    </div>
  )
}

/* ── Column ── */
function PipelineColumn({ stage, leads, onSelect, onDragStart, onDrop, dragOverStage, setDragOverStage }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? leads : leads.slice(0, MAX_VISIBLE)
  const hasMore = leads.length > MAX_VISIBLE && !expanded
  const isDragTarget = dragOverStage === stage.id
  const StageIcon = stage.icon

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverStage(stage.id)
      }}
      onDragLeave={() => setDragOverStage(null)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOverStage(null)
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'))
          if (data.leadId && data.fromStage !== stage.id) {
            onDrop(data.leadId, data.fromStage, stage.id)
          }
        } catch {}
      }}
      style={{
        flex: '1 1 0', minWidth: '11rem', maxWidth: '15rem',
        display: 'flex', flexDirection: 'column',
        background: isDragTarget ? 'var(--hover-bg)' : 'transparent',
        border: isDragTarget ? '0.125rem dashed var(--accent)' : '0.125rem solid transparent',
        borderRadius: '0.5rem', transition: 'all 150ms',
      }}
    >
      {/* Column Header */}
      <div style={{
        padding: '0.5rem 0.625rem', marginBottom: '0.375rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <div style={{
            width: '1.375rem', height: '1.375rem', borderRadius: '0.25rem',
            background: `${stage.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <StageIcon size={12} style={{ color: stage.color }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02rem',
          }}>
            {stage.label}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
            padding: '0.0625rem 0.375rem', borderRadius: 99,
            background: leads.length > 0 ? `${stage.color}15` : 'var(--hover-bg)',
            color: leads.length > 0 ? stage.color : 'var(--text-disabled)',
          }}>
            {leads.length}
          </span>
        </div>
        {/* Description */}
        {stage.description && (
          <div style={{
            fontSize: '0.5625rem', color: 'var(--text-disabled)', fontStyle: 'italic',
            marginTop: '0.25rem', paddingLeft: '1.75rem', lineHeight: 1.3,
          }}>
            {stage.description}
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.375rem',
        overflowY: 'auto', flex: 1, padding: '0 0.25rem 0.25rem',
        maxHeight: '60vh',
      }}>
        {visible.map(lead => (
          <PipelineCard
            key={lead.id}
            lead={lead}
            onSelect={onSelect}
            onDragStart={onDragStart}
          />
        ))}

        {leads.length === 0 && (
          <div style={{
            padding: '1.5rem 0.5rem', textAlign: 'center',
            fontSize: '0.6875rem', color: 'var(--text-disabled)', fontStyle: 'italic',
          }}>
            No leads
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)',
              padding: '0.375rem', fontFamily: 'var(--font-body)', textAlign: 'center',
            }}
          >
            +{leads.length - MAX_VISIBLE} more
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function PipelineBoard({ leadsByStage, onMoveStage, onSelectLead }) {
  const [dragOverStage, setDragOverStage] = useState(null)
  const [draggingId, setDraggingId] = useState(null)

  const handleDrop = useCallback((leadId, fromStage, toStage) => {
    setDraggingId(null)
    onMoveStage?.(leadId, fromStage, toStage)
  }, [onMoveStage])

  return (
    <div className="card" style={{
      padding: '0.75rem', flex: 1, minHeight: 0, overflow: 'auto',
    }}>
      <div style={{
        display: 'flex', gap: '0.5rem', minWidth: 'fit-content',
      }}>
        {ALL_STAGES.map(stage => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            leads={leadsByStage[stage.id] || []}
            onSelect={onSelectLead}
            onDragStart={setDraggingId}
            onDrop={handleDrop}
            dragOverStage={dragOverStage}
            setDragOverStage={setDragOverStage}
          />
        ))}
      </div>
    </div>
  )
}
