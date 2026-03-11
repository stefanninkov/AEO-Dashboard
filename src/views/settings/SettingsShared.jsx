/**
 * SettingsShared — Reusable components and style helpers for Settings sub-sections.
 */

export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle-switch ${checked ? 'active' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="toggle-switch-dot" />
    </button>
  )
}

/* ── Shared inline style objects ── */

export const sectionLabelStyle = {
  fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.0938rem', color: 'var(--text-disabled)',
  padding: '1.5rem 0 0.75rem',
}

export const sectionTitleStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)',
  fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', padding: '1.125rem 1.25rem 0.875rem',
  borderBottom: '0.0625rem solid var(--border-subtle)',
}

export const settingsRowStyle = {
  display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem',
  borderBottom: '0.0625rem solid var(--border-subtle)', flexWrap: 'wrap',
}

export const lastRowStyle = {
  display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem',
  flexWrap: 'wrap',
}

export const labelStyle = {
  fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500,
  width: '8.125rem', flexShrink: 0,
}

/** Flash a boolean setter true for 1.5s (for "Saved" confirmation).
 *  Pass a ref to track the timeout for cleanup on unmount. */
export function flash(setter, timerRef) {
  setter(true)
  if (timerRef?.current) clearTimeout(timerRef.current)
  const id = setTimeout(() => setter(false), 1500)
  if (timerRef) timerRef.current = id
}
