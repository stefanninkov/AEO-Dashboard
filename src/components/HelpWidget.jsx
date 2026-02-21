import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, X, Bot, MessageSquare } from 'lucide-react'
import FeedbackTab from './help/FeedbackTab'
import HelpChatTab from './help/HelpChatTab'

export default function HelpWidget({ user, activeView, activeProject, setActiveView }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('feedback')
  const panelRef = useRef(null)
  const btnRef = useRef(null)

  const TABS = [
    { id: 'feedback', label: t('help.feedback'), icon: MessageSquare },
    { id: 'help', label: t('help.help'), icon: Bot },
  ]

  // Close on escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Close when clicking outside (but not on the toggle button itself)
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleNavigate = (view) => {
    setActiveView(view)
    setOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(prev => !prev)}
        className="help-widget-btn"
        style={{
          position: 'fixed',
          bottom: 24, right: 24,
          width: 48, height: 48,
          borderRadius: 14,
          border: 'none',
          background: open ? 'var(--text-secondary)' : 'var(--color-phase-1)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 150,
          boxShadow: '0 0.25rem 1rem rgba(0,0,0,0.2)',
          transition: 'all 200ms ease',
        }}
        aria-label={open ? t('help.closeWidget') : t('help.openWidget')}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="help-widget-panel"
          style={{
            position: 'fixed',
            bottom: 84, right: 24,
            width: 380,
            maxWidth: 'calc(100vw - 3rem)',
            maxHeight: 'calc(100vh - 7.5rem)',
            background: 'var(--bg-card)',
            border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 150,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'help-widget-slide-up 200ms ease-out both',
          }}
        >
          {/* Header with Tabs */}
          <div style={{
            padding: '0.875rem 1rem 0',
            borderBottom: '0.0625rem solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '0.625rem 0.75rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: 12, fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-phase-1)' : 'var(--text-tertiary)',
                      borderBottom: isActive ? '0.125rem solid var(--color-phase-1)' : '0.125rem solid transparent',
                      transition: 'all 150ms',
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{
            flex: 1, padding: 16,
            overflowY: 'auto',
            minHeight: 0,
            display: 'flex', flexDirection: 'column',
          }}>
            {activeTab === 'help' && (
              <HelpChatTab
                user={user}
                activeView={activeView}
                activeProject={activeProject}
                onNavigate={handleNavigate}
              />
            )}
            {activeTab === 'feedback' && (
              <FeedbackTab
                user={user}
                activeView={activeView}
                activeProject={activeProject}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
