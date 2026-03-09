import { memo } from 'react'

/**
 * SkipToContent — Accessibility skip-navigation link.
 *
 * Hidden by default, appears on Tab focus for keyboard users
 * to skip past navigation directly to main content.
 */
function SkipToContent({ targetId = 'main-content' }) {
  return (
    <a
      href={`#${targetId}`}
      style={{
        position: 'fixed', top: '-100%', left: 'var(--space-2)',
        zIndex: 100000,
        padding: 'var(--space-2) var(--space-3)',
        background: 'var(--accent)', color: '#fff',
        fontSize: 'var(--text-xs)', fontWeight: 700,
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        transition: 'top 150ms',
      }}
      onFocus={e => e.currentTarget.style.top = 'var(--space-2)'}
      onBlur={e => e.currentTarget.style.top = '-100%'}
    >
      Skip to content
    </a>
  )
}

export default memo(SkipToContent)
