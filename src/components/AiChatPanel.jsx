import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { MessageSquare, X, Send, Trash2, Bot, User, AlertCircle, Sparkles, Settings } from 'lucide-react'
import { useAiChat } from '../hooks/useAiChat'

const QUICK_PROMPTS = [
  'What should I focus on next?',
  'Why did my score change?',
  'How am I doing vs competitors?',
  'Summarize my AEO performance',
]

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 'var(--space-2)',
      alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      <div style={{
        width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: isUser ? 'var(--accent)' : 'color-mix(in srgb, var(--color-phase-2) 12%, transparent)',
      }}>
        {isUser
          ? <User size={12} style={{ color: '#fff' }} />
          : <Bot size={12} style={{ color: 'var(--color-phase-2)' }} />
        }
      </div>
      <div style={{
        maxWidth: '80%', padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-lg)',
        background: isUser ? 'var(--accent)' : 'var(--hover-bg)',
        color: isUser ? '#fff' : 'var(--text-secondary)',
        fontSize: 'var(--text-sm)', lineHeight: 1.5,
        opacity: message.isError ? 0.6 : 1,
      }}>
        {message.content}
      </div>
    </div>
  )
}

function AiChatPanel({ isOpen, onClose, activeProject, activeView, onOpenSettings }) {
  const { messages, loading, sendMessage, clearChat, hasApiKey } = useAiChat({
    activeProject,
    activeView,
  })
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleSend = useCallback(() => {
    if (!input.trim() || loading) return
    sendMessage(input)
    setInput('')
  }, [input, loading, sendMessage])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleQuickPrompt = useCallback((text) => {
    sendMessage(text)
  }, [sendMessage])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.3)',
          opacity: 1, transition: 'opacity 200ms',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="AI Chat Assistant"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 999,
          width: 'min(24rem, 100vw)',
          background: 'var(--bg-page)',
          borderLeft: '0.0625rem solid var(--border-default)',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-2xl)',
          animation: 'slideInRight 200ms ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '0.0625rem solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <div style={{
            width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
            background: 'color-mix(in srgb, var(--color-phase-2) 12%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={14} style={{ color: 'var(--color-phase-2)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Assistant
            </div>
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
              {activeProject ? activeProject.name : 'No project selected'}
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="btn-icon-sm"
              title="Clear chat"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="btn-icon-sm"
            title="Close"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: 'auto', padding: 'var(--space-4)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
          }}
        >
          {!hasApiKey ? (
            /* No API key */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              flex: 1, gap: 'var(--space-3)', textAlign: 'center', padding: 'var(--space-6)',
            }}>
              <AlertCircle size={32} style={{ color: 'var(--text-disabled)' }} />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                Add your API key in Settings to use the AI chat assistant.
              </p>
              {onOpenSettings && (
                <button onClick={onOpenSettings} className="btn-primary btn-sm">
                  <Settings size={14} />
                  Open Settings
                </button>
              )}
            </div>
          ) : messages.length === 0 ? (
            /* Empty state with quick prompts */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              flex: 1, gap: 'var(--space-4)', textAlign: 'center',
            }}>
              <div style={{
                width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)',
                background: 'color-mix(in srgb, var(--color-phase-2) 8%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={20} style={{ color: 'var(--color-phase-2)' }} />
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                  Ask about your project
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  I can analyze your AEO data, explain trends, and suggest improvements.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    disabled={loading}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--hover-bg)',
                      border: '0.0625rem solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 100ms, background 100ms',
                    }}
                    onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.target.style.borderColor = 'var(--border-subtle)'}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat messages */
            <>
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {loading && (
                <div style={{
                  display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: 'color-mix(in srgb, var(--color-phase-2) 12%, transparent)',
                  }}>
                    <Bot size={12} style={{ color: 'var(--color-phase-2)' }} />
                  </div>
                  <div style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-lg)', background: 'var(--hover-bg)',
                    display: 'flex', gap: 'var(--space-1)',
                  }}>
                    <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-disabled)', animation: 'pulse 1.2s infinite' }} />
                    <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-disabled)', animation: 'pulse 1.2s infinite 0.2s' }} />
                    <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-disabled)', animation: 'pulse 1.2s infinite 0.4s' }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input area */}
        {hasApiKey && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '0.0625rem solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)',
              background: 'var(--hover-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-2)',
              border: '0.0625rem solid var(--border-subtle)',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your AEO data..."
                rows={1}
                disabled={loading}
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
                  resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                  maxHeight: '5rem', overflowY: 'auto',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
                  background: input.trim() && !loading ? 'var(--accent)' : 'var(--border-subtle)',
                  border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 100ms',
                }}
                title="Send"
              >
                <Send size={14} style={{ color: input.trim() && !loading ? '#fff' : 'var(--text-disabled)' }} />
              </button>
            </div>
            <p style={{
              fontSize: '0.5625rem', color: 'var(--text-disabled)',
              textAlign: 'center', marginTop: 'var(--space-1)',
            }}>
              AI responses are based on your project data and may not always be accurate.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

/**
 * AiChatButton — Floating button that toggles the chat panel.
 */
export function AiChatButton({ onClick, hasMessages = false }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open AI Chat"
      title="AI Chat Assistant"
      style={{
        width: '3rem', height: '3rem', borderRadius: '50%',
        background: 'var(--accent)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-lg)',
        transition: 'transform 150ms, box-shadow 150ms',
      }}
      onMouseEnter={e => { e.target.style.transform = 'scale(1.08)'; e.target.style.boxShadow = 'var(--shadow-xl)' }}
      onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'var(--shadow-lg)' }}
    >
      <MessageSquare size={20} style={{ color: '#fff' }} />
      {hasMessages && (
        <div style={{
          position: 'absolute', top: -2, right: -2,
          width: 10, height: 10, borderRadius: '50%',
          background: 'var(--color-phase-2)',
          border: '2px solid var(--bg-page)',
        }} />
      )}
    </button>
  )
}

export default memo(AiChatPanel)
