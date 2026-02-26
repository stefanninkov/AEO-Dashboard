/**
 * CRM Constants — Pipeline stages, activity types, task priorities, tag colors.
 * Single source of truth for all CRM feature definitions.
 */

// ══════════════════════════════════════════════
// PIPELINE STAGES
// ══════════════════════════════════════════════

export const PIPELINE_STAGES = [
  { id: 'new',        label: 'New',         color: '#6B7280', emoji: '📥', description: 'Signed up, not yet contacted' },
  { id: 'contacted',  label: 'Contacted',   color: '#3B82F6', emoji: '📧', description: 'First email sent' },
  { id: 'engaged',    label: 'Engaged',     color: '#8B5CF6', emoji: '💬', description: 'Replied, showed interest' },
  { id: 'invited',    label: 'Invited',     color: '#F59E0B', emoji: '🎟️', description: 'Beta access sent' },
  { id: 'activeUser', label: 'Active User', color: '#10B981', emoji: '✅', description: 'Using the product' },
  { id: 'paying',     label: 'Paying',      color: '#059669', emoji: '💰', description: 'Subscribed / paid' },
]

export const OFF_PIPELINE_STAGES = [
  { id: 'abandoned',    label: 'Abandoned',    color: '#9CA3AF', emoji: '🚪', description: "Didn't finish quiz" },
  { id: 'unresponsive', label: 'Unresponsive', color: '#D1D5DB', emoji: '😶', description: 'No response after contact' },
  { id: 'churned',      label: 'Churned',      color: '#EF4444', emoji: '📉', description: 'Was active, stopped' },
]

export const ALL_STAGES = [...PIPELINE_STAGES, ...OFF_PIPELINE_STAGES]

/** Lookup helpers */
export const getStage = (id) => ALL_STAGES.find(s => s.id === id) || ALL_STAGES[0]
export const isOffPipeline = (id) => OFF_PIPELINE_STAGES.some(s => s.id === id)

// ══════════════════════════════════════════════
// ACTIVITY EVENT TYPES
// ══════════════════════════════════════════════

export const ACTIVITY_TYPES = {
  stage_change:    { label: 'Stage Changed',    emoji: '📋', color: '#8B5CF6' },
  email_sent:      { label: 'Email Sent',       emoji: '📧', color: '#3B82F6' },
  note_added:      { label: 'Note Added',       emoji: '📝', color: '#06B6D4' },
  tag_added:       { label: 'Tag Added',        emoji: '🏷️', color: '#10B981' },
  tag_removed:     { label: 'Tag Removed',      emoji: '🏷️', color: '#F59E0B' },
  task_created:    { label: 'Task Created',     emoji: '📌', color: '#8B5CF6' },
  task_completed:  { label: 'Task Completed',   emoji: '✓',  color: '#10B981' },
  score_completed: { label: 'Score Completed',  emoji: '✅', color: '#F59E0B' },
  converted:       { label: 'Converted',        emoji: '🎯', color: '#059669' },
  signup:          { label: 'Signed Up',        emoji: '📥', color: '#6B7280' },
  system:          { label: 'System Event',     emoji: '⚙️', color: '#6B7280' },
}

// ══════════════════════════════════════════════
// TASK PRIORITIES
// ══════════════════════════════════════════════

export const TASK_PRIORITIES = [
  { id: 'high',   label: 'High',   color: '#EF4444', emoji: '🔴' },
  { id: 'medium', label: 'Medium', color: '#F59E0B', emoji: '🟡' },
  { id: 'low',    label: 'Low',    color: '#6B7280', emoji: '⚪' },
]

// ══════════════════════════════════════════════
// TAG COLORS (for auto-assign on creation)
// ══════════════════════════════════════════════

export const TAG_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#6366F1', '#84CC16', '#F97316',
  '#14B8A6', '#A855F7', '#E11D48', '#0EA5E9', '#65A30D',
]
