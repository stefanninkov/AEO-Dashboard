import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, AlertCircle, Settings, Loader } from 'lucide-react'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { callAI } from '../../utils/apiClient'
import { hasApiKey, getFastModel } from '../../utils/aiProvider'
import { buildHelpSystemPrompt } from '../../utils/helpAssistantPrompt'
const MAX_CONTEXT_MESSAGES = 6
const MAX_TOKENS = 500

const QUICK_QUESTIONS = [
  'What is AEO?',
  'How do I improve my score?',
  'How does schema markup help?',
  'What are the 7 phases?',
]

export default function HelpChatTab({ user, activeView, activeProject, onNavigate }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionDocId, setSessionDocId] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const apiKeyAvailable = typeof window !== 'undefined' ? hasApiKey() : false

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Save/update chat session in Firestore
  const saveChatSession = useCallback(async (updatedMessages) => {
    if (!user?.uid || updatedMessages.length === 0) return

    const sessionData = {
      userId: user.uid,
      userEmail: user.email || '',
      displayName: user.displayName || '',
      messages: updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
      })),
      context: {
        view: activeView || 'unknown',
        projectId: activeProject?.id || null,
      },
      updatedAt: serverTimestamp(),
    }

    try {
      if (sessionDocId) {
        await updateDoc(doc(db, 'chatLogs', sessionDocId), sessionData)
      } else {
        const docRef = await addDoc(collection(db, 'chatLogs'), {
          ...sessionData,
          createdAt: serverTimestamp(),
        })
        setSessionDocId(docRef.id)
      }
    } catch (err) {
      console.error('Failed to save chat session:', err)
    }
  }, [user, activeView, activeProject, sessionDocId])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading || !apiKeyAvailable) return

    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      // Build API messages (keep last N for context window)
      const contextMessages = updatedMessages.slice(-MAX_CONTEXT_MESSAGES).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await callAI({
        messages: contextMessages,
        system: buildHelpSystemPrompt(),
        maxTokens: MAX_TOKENS,
        model: getFastModel(),
        retries: 1,
      })

      const assistantContent = response.text || 'Sorry, I couldn\'t generate a response. Please try again.'
      const assistantMsg = { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() }
      const finalMessages = [...updatedMessages, assistantMsg]
      setMessages(finalMessages)

      // Save to Firestore
      saveChatSession(finalMessages)
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: err.message?.includes('401')
          ? 'Your API key appears to be invalid. Please check it in Settings.'
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, apiKeyAvailable, saveChatSession])

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  // No API key state
  if (!apiKeyAvailable) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12, padding: '40px 20px', textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(245,158,11,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertCircle size={24} style={{ color: 'var(--color-warning)' }} />
        </div>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          API Key Required
        </h4>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          Set up your Anthropic API key in Settings to use the AI assistant.
        </p>
        {onNavigate && (
          <button
            onClick={() => onNavigate('settings')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: 'var(--color-phase-1)', color: '#fff',
              border: 'none', transition: 'all 150ms',
            }}
          >
            <Settings size={13} />
            Go to Settings
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Messages Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', padding: '4px 0',
          display: 'flex', flexDirection: 'column', gap: 12,
          minHeight: 0,
        }}
      >
        {/* Welcome message when empty */}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,107,53,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
            }}>
              <Bot size={20} style={{ color: 'var(--color-phase-1)' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              AEO Assistant
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 16 }}>
              Ask me anything about the app or AEO optimization.
            </p>

            {/* Quick question chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
                    fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)',
                    background: 'var(--hover-bg)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 150ms',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 8,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: msg.role === 'user' ? 'var(--color-phase-4)' : 'rgba(255,107,53,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {msg.role === 'user'
                ? <User size={13} style={{ color: '#fff' }} />
                : <Bot size={13} style={{ color: 'var(--color-phase-1)' }} />
              }
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '80%', padding: '8px 12px', borderRadius: 12,
              background: msg.role === 'user' ? 'var(--color-phase-4)' : 'var(--hover-bg)',
              color: msg.role === 'user' ? '#fff' : msg.isError ? 'var(--color-error)' : 'var(--text-primary)',
              fontSize: 12, lineHeight: 1.6,
              borderTopRightRadius: msg.role === 'user' ? 4 : 12,
              borderTopLeftRadius: msg.role === 'user' ? 12 : 4,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {renderMarkdown(msg.content)}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: 'rgba(255,107,53,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={13} style={{ color: 'var(--color-phase-1)' }} />
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: 12, borderTopLeftRadius: 4,
              background: 'var(--hover-bg)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Loader size={13} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
          marginTop: 8, flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about the app..."
          className="input-field"
          style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            width: 34, height: 34, borderRadius: 8, border: 'none',
            background: input.trim() && !loading ? 'var(--color-phase-1)' : 'var(--hover-bg)',
            color: input.trim() && !loading ? '#fff' : 'var(--text-disabled)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            transition: 'all 150ms', flexShrink: 0,
          }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}

/**
 * Simple markdown renderer for bold text and lists.
 * Converts **text** to <strong> and - items to bullet points.
 */
function renderMarkdown(text) {
  if (!text) return null

  return text.split('\n').map((line, i) => {
    // Bold
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>
      }
      return part
    })

    // Bullet list
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: 6, paddingLeft: 4 }}>
          <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>&bull;</span>
          <span>{rendered.map((r, idx) => typeof r === 'string' ? r.replace(/^[-*]\s/, '') : r)}</span>
        </div>
      )
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s/)
    if (numMatch) {
      return (
        <div key={i} style={{ display: 'flex', gap: 6, paddingLeft: 4 }}>
          <span style={{ color: 'var(--text-tertiary)', flexShrink: 0, fontSize: '0.875em' }}>{numMatch[1]}.</span>
          <span>{rendered.map((r, idx) => typeof r === 'string' ? r.replace(/^\d+\.\s/, '') : r)}</span>
        </div>
      )
    }

    return <div key={i}>{rendered}{i < text.split('\n').length - 1 ? '' : ''}</div>
  })
}
