/**
 * EmptyState — Universal empty/no-data state component.
 *
 * Props:
 *   icon         — Lucide icon component (required unless illustration is provided)
 *   illustration — key from ILLUSTRATION_MAP (e.g., 'rocket', 'clipboard')
 *                  or a React component that renders an SVG illustration
 *   title        — heading text (required)
 *   description  — body text (required)
 *   action       — optional { label, onClick } for a CTA button
 *   color        — icon accent color (defaults to --text-tertiary)
 *   compact      — if true, reduces padding for inline use within cards
 */
import { ILLUSTRATION_MAP } from './illustrations'

export default function EmptyState({ icon: Icon, illustration, title, description, action, color, compact = false }) {
  const accent = color || 'var(--text-tertiary)'

  // Resolve illustration: string key or component
  const IllustrationComponent = typeof illustration === 'string'
    ? ILLUSTRATION_MAP[illustration] || null
    : illustration || null

  return (
    <div
      className="fade-in-up"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        padding: compact ? '1.5rem 1rem' : '3rem 1.5rem',
        ...(compact ? {} : {
          background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)',
          borderRadius: '0.75rem',
        }),
      }}
    >
      {/* Illustration or Icon */}
      {IllustrationComponent ? (
        <div style={{ marginBottom: '1rem' }}>
          <IllustrationComponent size={compact ? 80 : 120} />
        </div>
      ) : Icon ? (
        <div style={{
          width: '3rem', height: '3rem', borderRadius: '0.875rem',
          background: `color-mix(in srgb, ${accent} 10%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.875rem',
        }}>
          <Icon size={22} style={{ color: accent }} />
        </div>
      ) : null}

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: '0.25rem',
      }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '0.8125rem', color: 'var(--text-tertiary)',
        lineHeight: 1.6, maxWidth: '24rem',
      }}>
        {description}
      </p>

      {/* Optional CTA button */}
      {action && (
        <button
          className="btn-primary"
          style={{ marginTop: '1rem', fontSize: '0.8125rem' }}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
