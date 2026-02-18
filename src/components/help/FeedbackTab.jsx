import { useState, useEffect } from 'react'
import { Send, CheckCircle, Clock } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useTheme } from '../../contexts/ThemeContext'

const RATINGS = [
  { value: 'love', emoji: '\uD83D\uDE0D', label: 'Love it' },
  { value: 'good', emoji: '\uD83D\uDE0A', label: 'Good' },
  { value: 'okay', emoji: '\uD83D\uDE10', label: 'Okay' },
  { value: 'frustrated', emoji: '\uD83D\uDE1F', label: 'Frustrating' },
]

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General Feedback' },
]

const RATE_LIMIT_KEY = 'aeo-feedback-last-submitted'
const RATE_LIMIT_MS = 5 * 60 * 1000 // 5 minutes

export default function FeedbackTab({ user, activeView, activeProject }) {
  const { resolvedTheme } = useTheme()
  const [rating, setRating] = useState(null)
  const [category, setCategory] = useState(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  // Check rate limit on mount
  useEffect(() => {
    const lastSubmitted = localStorage.getItem(RATE_LIMIT_KEY)
    if (lastSubmitted) {
      const elapsed = Date.now() - parseInt(lastSubmitted, 10)
      if (elapsed < RATE_LIMIT_MS) {
        setRateLimited(true)
        setRemainingTime(Math.ceil((RATE_LIMIT_MS - elapsed) / 60000))
        const timer = setInterval(() => {
          const now = Date.now() - parseInt(lastSubmitted, 10)
          if (now >= RATE_LIMIT_MS) {
            setRateLimited(false)
            clearInterval(timer)
          } else {
            setRemainingTime(Math.ceil((RATE_LIMIT_MS - now) / 60000))
          }
        }, 15000)
        return () => clearInterval(timer)
      }
    }
  }, [])

  const canSubmit = rating && message.trim().length > 0 && !submitting && !rateLimited

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)

    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || '',
        displayName: user?.displayName || '',
        rating,
        category,
        message: message.trim(),
        context: {
          view: activeView || 'unknown',
          projectId: activeProject?.id || null,
          projectName: activeProject?.name || null,
          browser: navigator.userAgent,
          theme: resolvedTheme,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
        },
        createdAt: serverTimestamp(),
        status: 'new',
        adminNote: '',
      })

      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()))
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Success state
  if (submitted) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12, padding: '40px 20px', textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(16,185,129,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle size={24} style={{ color: 'var(--color-success)' }} />
        </div>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
          Thank you!
        </h4>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          Your feedback helps us improve the app. We read every submission.
        </p>
      </div>
    )
  }

  // Rate limited state
  if (rateLimited) {
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
          <Clock size={24} style={{ color: 'var(--color-warning)' }} />
        </div>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
          Thanks for your feedback!
        </h4>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          You can submit again in {remainingTime} minute{remainingTime !== 1 ? 's' : ''}.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
      {/* Rating */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          How's your experience?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {RATINGS.map(r => {
            const isSelected = rating === r.value
            return (
              <button
                key={r.value}
                onClick={() => setRating(r.value)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                  background: isSelected ? 'rgba(255,107,53,0.1)' : 'var(--hover-bg)',
                  border: isSelected ? '2px solid var(--color-phase-1)' : '2px solid transparent',
                  transition: 'all 150ms', fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ fontSize: 22 }}>{r.emoji}</span>
                <span style={{
                  fontSize: 10, fontWeight: 500,
                  color: isSelected ? 'var(--color-phase-1)' : 'var(--text-tertiary)',
                }}>{r.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Category */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Category <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {CATEGORIES.map(c => {
            const isSelected = category === c.value
            return (
              <button
                key={c.value}
                onClick={() => setCategory(isSelected ? null : c.value)}
                style={{
                  padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
                  fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)',
                  background: isSelected ? 'var(--color-phase-1)' : 'var(--hover-bg)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  border: 'none', transition: 'all 150ms',
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Message */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Your message
        </p>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind..."
          className="input-field"
          rows={3}
          style={{ width: '100%', resize: 'vertical', fontSize: 12, lineHeight: 1.5 }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="btn-primary"
        style={{
          width: '100%', padding: '10px', fontSize: 12,
          opacity: canSubmit ? 1 : 0.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <Send size={13} />
        {submitting ? 'Sending...' : 'Send Feedback'}
      </button>
    </div>
  )
}
