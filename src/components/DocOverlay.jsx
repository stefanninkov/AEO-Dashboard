import { X, ArrowRight, ExternalLink } from 'lucide-react'
import { safeHref } from '../utils/sanitizeUrl'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '../hooks/useFocusTrap'

export default function DocOverlay({ item, onClose, onExited, isClosing, phases, setActiveView }) {
  const { t } = useTranslation('app')
  const trapRef = useFocusTrap(!!item && !isClosing)

  if (!item && !isClosing) return null

  // Find phase info
  let phaseColor = 'var(--color-phase-3)'
  let phaseNumber = ''
  let categoryName = ''
  if (phases && item) {
    outer:
    for (const phase of phases) {
      for (const cat of phase.categories) {
        if (cat.items.some(i => i.id === item.id)) {
          phaseColor = phase.color
          phaseNumber = phase.number
          categoryName = cat.name
          break outer
        }
      }
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal-backdrop)' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--backdrop-color)',
          animation: isClosing
            ? 'backdrop-fade-out 250ms ease-out forwards'
            : 'backdrop-fade-in 250ms ease-out both',
        }}
      />

      {/* Panel — centered modal */}
      <div
        ref={trapRef}
        className="relative w-full max-w-[45rem] max-h-[85vh] rounded-xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-overlay-title"
        style={{
          background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)',
          zIndex: 'var(--z-modal)',
          boxShadow: 'var(--shadow-lg)',
          animation: isClosing
            ? 'dialog-scale-out 250ms ease-out forwards'
            : 'dialog-scale-in 250ms ease-out both',
        }}
        onClick={e => e.stopPropagation()}
        onAnimationEnd={() => isClosing && onExited?.()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-start gap-3 flex-shrink-0" style={{ background: 'var(--bg-card)', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary transition-all duration-150 flex-shrink-0 mt-0.5 active:scale-95"
            aria-label="Close documentation overlay"
          >
            <X size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-heading font-bold px-2 py-0.5 rounded"
                style={{ color: phaseColor, backgroundColor: phaseColor + '15' }}
              >
                {t('docOverlay.phase', { number: phaseNumber })}
              </span>
              <span className="text-xs text-text-tertiary">{categoryName}</span>
            </div>
            <h2 id="doc-overlay-title" className="font-heading text-lg font-bold text-text-primary">{item?.doc?.title}</h2>
            <p className="text-sm text-text-secondary mt-1">{item?.detail}</p>
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {item?.doc?.sections?.map((section, idx) => (
            <div key={idx} className="fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <h3 className="font-heading text-sm font-bold mb-3" style={{ color: phaseColor }}>
                {section.heading}
              </h3>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        {/* Footer — task reference + action button */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '0.0625rem solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <p className="text-xs text-text-tertiary" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t('docOverlay.task')} {item?.text}
          </p>
          {item?.action?.view && setActiveView && (
            <button
              onClick={() => { setActiveView(item.action.view); onClose() }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4375rem 0.875rem', borderRadius: '0.5rem',
                border: 'none', cursor: 'pointer',
                background: phaseColor, color: '#fff',
                fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'opacity 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {item.action.label}
              <ArrowRight size={13} />
            </button>
          )}
          {item?.action?.external && (
            <a
              href={safeHref(item.action.external)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4375rem 0.875rem', borderRadius: '0.5rem',
                border: `0.0625rem solid ${phaseColor}40`,
                background: phaseColor + '10', color: phaseColor,
                fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'var(--font-body)',
                textDecoration: 'none',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'opacity 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {item.action.label}
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
