/**
 * CRM Constants — Pipeline stages, activity types, task priorities, tag colors.
 * Single source of truth for all CRM feature definitions.
 *
 * DESIGN POLICY: No emojis. All visual indicators use lucide-react icons.
 */
import {
  Inbox, Send, MessageCircle, Ticket, UserCheck, DollarSign,
  LogOut, EyeOff, TrendingDown,
  ArrowRightLeft, PenLine, Tag, ListPlus, CheckCircle, ClipboardCheck,
  Target, Settings,
  AlertCircle, Circle, CircleDot,
} from 'lucide-react'

// ══════════════════════════════════════════════
// PIPELINE STAGES
// ══════════════════════════════════════════════

export const PIPELINE_STAGES = [
  { id: 'new',        label: 'New',         color: '#6B7280', icon: Inbox,          description: 'Just signed up, not yet contacted' },
  { id: 'contacted',  label: 'Contacted',   color: '#3B82F6', icon: Send,           description: 'Admin has reached out via email' },
  { id: 'engaged',    label: 'Engaged',     color: '#8B5CF6', icon: MessageCircle,  description: 'Lead replied or showed interest' },
  { id: 'invited',    label: 'Invited',     color: '#F59E0B', icon: Ticket,         description: 'Sent beta access or invite link' },
  { id: 'activeUser', label: 'Active User', color: '#10B981', icon: UserCheck,      description: 'Signed in and using the platform' },
  { id: 'paying',     label: 'Paying',      color: '#059669', icon: DollarSign,     description: 'Converted to paid customer' },
]

export const OFF_PIPELINE_STAGES = [
  { id: 'abandoned',    label: 'Abandoned',    color: '#9CA3AF', icon: LogOut,       description: 'Started but dropped off, no response' },
  { id: 'unresponsive', label: 'Unresponsive', color: '#D1D5DB', icon: EyeOff,      description: 'Multiple attempts, no reply' },
  { id: 'churned',      label: 'Churned',      color: '#EF4444', icon: TrendingDown, description: 'Was active but stopped using' },
]

export const ALL_STAGES = [...PIPELINE_STAGES, ...OFF_PIPELINE_STAGES]

/** Lookup helpers */
export const getStage = (id) => ALL_STAGES.find(s => s.id === id) || ALL_STAGES[0]
export const isOffPipeline = (id) => OFF_PIPELINE_STAGES.some(s => s.id === id)

// ══════════════════════════════════════════════
// ACTIVITY EVENT TYPES
// ══════════════════════════════════════════════

export const ACTIVITY_TYPES = {
  stage_change:    { label: 'Stage Changed',    icon: ArrowRightLeft, color: '#8B5CF6' },
  email_sent:      { label: 'Email Sent',       icon: Send,           color: '#3B82F6' },
  note_added:      { label: 'Note Added',       icon: PenLine,        color: '#06B6D4' },
  tag_added:       { label: 'Tag Added',        icon: Tag,            color: '#10B981' },
  tag_removed:     { label: 'Tag Removed',      icon: Tag,            color: '#F59E0B' },
  task_created:    { label: 'Task Created',     icon: ListPlus,       color: '#8B5CF6' },
  task_completed:  { label: 'Task Completed',   icon: CheckCircle,    color: '#10B981' },
  score_completed: { label: 'Score Completed',  icon: ClipboardCheck, color: '#F59E0B' },
  converted:       { label: 'Converted',        icon: Target,         color: '#059669' },
  signup:          { label: 'Signed Up',        icon: Inbox,          color: '#6B7280' },
  system:          { label: 'System Event',     icon: Settings,       color: '#6B7280' },
}

// ══════════════════════════════════════════════
// TASK PRIORITIES
// ══════════════════════════════════════════════

export const TASK_PRIORITIES = [
  { id: 'high',   label: 'High',   color: '#EF4444', icon: AlertCircle },
  { id: 'medium', label: 'Medium', color: '#F59E0B', icon: Circle },
  { id: 'low',    label: 'Low',    color: '#6B7280', icon: CircleDot },
]

// ══════════════════════════════════════════════
// TAG COLORS (for auto-assign on creation)
// ══════════════════════════════════════════════

export const TAG_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#6366F1', '#84CC16', '#F97316',
  '#14B8A6', '#A855F7', '#E11D48', '#0EA5E9', '#65A30D',
]
