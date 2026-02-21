import { useState, useEffect } from 'react'
import { Send, CheckCircle, Clock, Bug, Lightbulb, MessageCircle, ArrowLeft, Monitor, Star, Heart, ThumbsUp, Minus, ThumbsDown } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useTheme } from '../../contexts/ThemeContext'

/* ── Category Definitions ── */
const CATEGORIES = [
  {
    value: 'bug',
    label: 'Bug Report',
    icon: Bug,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    description: 'Something isn\'t working correctly',
    fields: [
      { key: 'what_happened', label: 'What happened?', type: 'textarea', placeholder: 'Describe what went wrong...', required: true },
      { key: 'expected', label: 'What did you expect?', type: 'textarea', placeholder: 'What should have happened instead...', required: false },
      { key: 'steps', label: 'Steps to reproduce', type: 'textarea', placeholder: '1. Go to...\n2. Click on...\n3. See error...', required: false },
      { key: 'severity', label: 'How bad is it?', type: 'select', options: [
        { value: 'blocker', label: 'Blocker \u2014 Can\'t use the app' },
        { value: 'major', label: 'Major \u2014 Feature broken' },
        { value: 'minor', label: 'Minor \u2014 Annoying but workaround exists' },
        { value: 'cosmetic', label: 'Cosmetic \u2014 Visual issue' },
      ], required: true },
    ],
  },
  {
    value: 'feature',
    label: 'Feature Request',
    icon: Lightbulb,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
    description: 'Suggest a new feature or improvement',
    fields: [
      { key: 'feature_title', label: 'Feature title', type: 'text', placeholder: 'Short name for the feature...', required: true },
      { key: 'description', label: 'Describe the feature', type: 'textarea', placeholder: 'What would this feature do? Why do you need it?', required: true },
      { key: 'use_case', label: 'Use case', type: 'textarea', placeholder: 'How would you use this feature in your workflow?', required: false },
      { key: 'priority', label: 'How important is this?', type: 'select', options: [
        { value: 'critical', label: 'Critical \u2014 I really need this' },
        { value: 'nice', label: 'Nice to have \u2014 Would improve my experience' },
        { value: 'idea', label: 'Just an idea \u2014 No rush' },
      ], required: true },
    ],
  },
  {
    value: 'general',
    label: 'General Feedback',
    icon: MessageCircle,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
    description: 'Share your thoughts or ask a question',
    fields: [
      { key: 'rating', label: 'How\'s your experience?', type: 'rating', required: true },
      { key: 'message', label: 'Your message', type: 'textarea', placeholder: 'Tell us what\'s on your mind...', required: true },
      { key: 'area', label: 'Which area? (optional)', type: 'select', options: [
        { value: 'checklist', label: 'Checklist' },
        { value: 'analyzer', label: 'Analyzer' },
        { value: 'content', label: 'Content Writer' },
        { value: 'competitors', label: 'Competitors' },
        { value: 'settings', label: 'Settings' },
        { value: 'general', label: 'Overall / Other' },
      ], required: false },
    ],
  },
]

const RATINGS = [
  { value: 'love', Icon: Heart, label: 'Love it', color: '#EF4444' },
  { value: 'good', Icon: ThumbsUp, label: 'Good', color: '#10B981' },
  { value: 'okay', Icon: Minus, label: 'Okay', color: '#F59E0B' },
  { value: 'frustrated', Icon: ThumbsDown, label: 'Frustrating', color: '#EF4444' },
]

const RATE_LIMIT_KEY = 'aeo-feedback-last-submitted'
const RATE_LIMIT_MS = 5 * 60 * 1000 // 5 minutes

export default function FeedbackTab({ user, activeView, activeProject }) {
  const { resolvedTheme } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
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

  const categoryConfig = CATEGORIES.find(c => c.value === selectedCategory)

  const canSubmit = (() => {
    if (!selectedCategory || submitting || rateLimited) return false
    if (!categoryConfig) return false
    for (const field of categoryConfig.fields) {
      if (field.required) {
        const val = formData[field.key]
        if (!val || (typeof val === 'string' && !val.trim())) return false
      }
    }
    return true
  })()

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      // Build structured feedback data
      const feedbackData = {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || '',
        displayName: user?.displayName || '',
        category: selectedCategory,
        // Store each field answer
        fields: { ...formData },
        // Flatten key fields for easy admin display
        rating: formData.rating || null,
        message: formData.message || formData.what_happened || formData.description || '',
        severity: formData.severity || null,
        priority: formData.priority || null,
        featureTitle: formData.feature_title || null,
        area: formData.area || null,
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
      }

      await addDoc(collection(db, 'feedback'), feedbackData)

      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()))
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      if (err.code === 'permission-denied') {
        setError('Permission denied. Firestore security rules need to allow writes to the "feedback" collection.')
      } else {
        setError('Failed to submit feedback. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    setSelectedCategory(null)
    setFormData({})
    setError(null)
  }

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Success state
  if (submitted) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12, padding: '2.5rem 1.25rem', textAlign: 'center',
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
          Your {selectedCategory === 'bug' ? 'bug report' : selectedCategory === 'feature' ? 'feature request' : 'feedback'} has been submitted. We read every submission.
        </p>
      </div>
    )
  }

  // Rate limited state
  if (rateLimited) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12, padding: '2.5rem 1.25rem', textAlign: 'center',
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

  // Step 1: Category Selection
  if (!selectedCategory) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0.25rem 0' }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.0313rem', marginBottom: 4,
        }}>
          What would you like to share?
        </p>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.875rem 1rem', borderRadius: 12,
                background: 'var(--hover-bg)', border: '0.125rem solid transparent',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
                transition: 'all 150ms', width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = cat.color
                e.currentTarget.style.background = cat.bg
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.background = 'var(--hover-bg)'
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} style={{ color: cat.color }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {cat.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Step 2: Category-Specific Form
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0.25rem 0' }}>
      {/* Back + Category header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 6, display: 'flex',
            color: 'var(--text-tertiary)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <ArrowLeft size={16} />
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0.25rem 0.625rem', borderRadius: 99,
          background: categoryConfig.bg,
        }}>
          <categoryConfig.icon size={12} style={{ color: categoryConfig.color }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: categoryConfig.color }}>
            {categoryConfig.label}
          </span>
        </div>
      </div>

      {/* Dynamic fields */}
      {categoryConfig.fields.map(field => (
        <div key={field.key}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
            marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.0313rem',
          }}>
            {field.label}
            {!field.required && (
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> (optional)</span>
            )}
          </p>

          {field.type === 'textarea' && (
            <textarea
              value={formData[field.key] || ''}
              onChange={e => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="input-field"
              rows={field.key === 'steps' ? 4 : 3}
              style={{ width: '100%', resize: 'vertical', fontSize: 12, lineHeight: 1.5 }}
            />
          )}

          {field.type === 'text' && (
            <input
              type="text"
              value={formData[field.key] || ''}
              onChange={e => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="input-field"
              style={{ width: '100%', fontSize: 12, padding: '0.5rem 0.75rem' }}
            />
          )}

          {field.type === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {field.options.map(opt => {
                const isSelected = formData[field.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleFieldChange(field.key, isSelected ? '' : opt.value)}
                    style={{
                      padding: '0.5rem 0.75rem', borderRadius: 8, cursor: 'pointer',
                      fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)',
                      background: isSelected ? categoryConfig.bg : 'var(--hover-bg)',
                      color: isSelected ? categoryConfig.color : 'var(--text-secondary)',
                      border: isSelected ? `0.0938rem solid ${categoryConfig.color}` : '0.0938rem solid transparent',
                      transition: 'all 150ms', textAlign: 'left', width: '100%',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {field.type === 'rating' && (
            <div style={{ display: 'flex', gap: 8 }}>
              {RATINGS.map(r => {
                const isSelected = formData[field.key] === r.value
                return (
                  <button
                    key={r.value}
                    onClick={() => handleFieldChange(field.key, r.value)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '0.625rem 0.375rem', borderRadius: 10, cursor: 'pointer',
                      background: isSelected ? 'rgba(255,107,53,0.1)' : 'var(--hover-bg)',
                      border: isSelected ? '0.125rem solid var(--color-phase-1)' : '0.125rem solid transparent',
                      transition: 'all 150ms', fontFamily: 'var(--font-body)',
                    }}
                  >
                    <r.Icon size={20} style={{ color: isSelected ? 'var(--color-phase-1)' : r.color }} />
                    <span style={{
                      fontSize: 10, fontWeight: 500,
                      color: isSelected ? 'var(--color-phase-1)' : 'var(--text-tertiary)',
                    }}>{r.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {/* Error */}
      {error && (
        <p style={{ fontSize: 11, color: 'var(--color-error)', lineHeight: 1.5, margin: 0 }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="btn-primary"
        style={{
          width: '100%', padding: '0.625rem', fontSize: 12,
          opacity: canSubmit ? 1 : 0.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <Send size={13} />
        {submitting ? 'Sending...' : `Submit ${categoryConfig.label}`}
      </button>
    </div>
  )
}
