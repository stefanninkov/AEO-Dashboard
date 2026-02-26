/**
 * LeadTimeline — Activity feed for a single lead.
 *
 * Groups events by date, shows emoji per event type, includes "Add Note" inline input.
 */
import { useState, useEffect, useRef } from 'react'
import { MessageSquarePlus, Loader } from 'lucide-react'
import { useLeadActivity } from '../hooks/useLeadActivity'
import { ACTIVITY_TYPES } from '../constants/pipelineStages'

function formatDay(date) {
  if (!date) return 'Unknown'
  const d = date instanceof Date ? date : new Date(date)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function LeadTimeline({ lead }) {
  const { activities, loading, addNote, seedRetroactiveEvents } = useLeadActivity(lead?.id)
  const [noteText, setNoteText] = useState('')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef(null)

  // Seed retroactive events on mount
  useEffect(() => {
    if (lead) {
      seedRetroactiveEvents(lead)
    }
  }, [lead?.id])

  const handleAddNote = async () => {
    if (!noteText.trim() || adding) return
    setAdding(true)
    await addNote(noteText.trim())
    setNoteText('')
    setAdding(false)
  }

  // Group by day
  const grouped = {}
  activities.forEach((act) => {
    const day = formatDay(act.createdAt)
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(act)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Add Note */}
      <div style={{
        display: 'flex', gap: '0.375rem', alignItems: 'center',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          placeholder="Add a note..."
          style={{
            flex: 1, padding: '0.5rem 0.625rem', borderRadius: '0.375rem',
            border: '0.0625rem solid var(--border-subtle)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleAddNote}
          disabled={!noteText.trim() || adding}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.5rem 0.625rem', borderRadius: '0.375rem',
            border: 'none', background: noteText.trim() ? 'var(--accent)' : 'var(--hover-bg)',
            color: noteText.trim() ? '#fff' : 'var(--text-disabled)',
            fontSize: '0.6875rem', fontWeight: 600, cursor: noteText.trim() ? 'pointer' : 'default',
            fontFamily: 'var(--font-body)', opacity: adding ? 0.5 : 1,
          }}
        >
          <MessageSquarePlus size={12} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', justifyContent: 'center' }}>
          <Loader size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-disabled)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>Loading activity...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && activities.length === 0 && (
        <div style={{
          padding: '1.5rem', textAlign: 'center',
          fontSize: '0.75rem', color: 'var(--text-disabled)', fontStyle: 'italic',
        }}>
          No activity yet
        </div>
      )}

      {/* Activity Groups */}
      {Object.entries(grouped).map(([day, events]) => (
        <div key={day}>
          {/* Day header */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700,
            color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04rem',
            padding: '0.25rem 0', marginBottom: '0.375rem',
            borderBottom: '0.0625rem solid var(--border-subtle)',
          }}>
            {day}
          </div>

          {/* Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {events.map((act) => {
              const typeInfo = ACTIVITY_TYPES[act.type] || ACTIVITY_TYPES.system
              return (
                <div key={act.id} style={{
                  display: 'flex', gap: '0.5rem', padding: '0.375rem 0.25rem',
                  alignItems: 'flex-start',
                }}>
                  {/* Icon */}
                  <span style={{
                    width: '1.25rem', height: '1.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, borderRadius: '0.25rem',
                    background: `${typeInfo.color}15`,
                  }}>
                    <typeInfo.icon size={11} style={{ color: typeInfo.color }} />
                  </span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.6875rem', color: 'var(--text-primary)',
                      lineHeight: 1.4, wordBreak: 'break-word',
                    }}>
                      {act.description}
                    </div>
                    <div style={{
                      display: 'flex', gap: '0.5rem', marginTop: '0.125rem',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.5625rem',
                        color: 'var(--text-disabled)',
                      }}>
                        {formatTime(act.createdAt)}
                      </span>
                      <span style={{
                        fontSize: '0.5625rem', color: 'var(--text-disabled)',
                      }}>
                        {act.createdBy === 'system' ? 'System' : 'Admin'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
