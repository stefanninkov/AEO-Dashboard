import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Bot, MessageSquare } from 'lucide-react'
import FeedbackTab from './help/FeedbackTab'
import HelpChatTab from './help/HelpChatTab'

const TABS = [
  { id: 'help', label: 'Help', icon: Bot },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
]

export default function HelpWidget({ user, activeView, activeProject, setActiveView }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('help')
  const panelRef = useRef(null)

  // Close on escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    // Delay to prevent the open-click from immediately closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [open])

  const handleNavigate = (view) => {
    setActiveView(view)
    setOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
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
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          transition: 'all 200ms ease',
        }}
        aria-label={open ? 'Close help widget' : 'Open help widget'}
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
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 120px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
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
            padding: '14px 16px 0',
            borderBottom: '1px solid var(--border-subtle)',
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
                      padding: '10px 12px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: 12, fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-phase-1)' : 'var(--text-tertiary)',
                      borderBottom: isActive ? '2px solid var(--color-phase-1)' : '2px solid transparent',
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
