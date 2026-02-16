import { useState } from 'react'
import { Wand2, Loader2, Copy, Check, ChevronDown, ChevronUp, RotateCcw, Sparkles } from 'lucide-react'
import { callAnthropicApi } from '../../utils/apiClient'
import logger from '../../utils/logger'

/**
 * useFixGenerator — hook managing fix generation state for a single item.
 */
export function useFixGenerator({ item, categoryName, siteUrl, apiKey, existingFix, onFixGenerated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fix, setFix] = useState(existingFix || null)
  const [showPanel, setShowPanel] = useState(false)
  const [copied, setCopied] = useState(null)

  const generateFix = async () => {
    if (!apiKey) return
    setLoading(true)
    setError(null)
    setShowPanel(true)

    try {
      const data = await callAnthropicApi({
        apiKey,
        maxTokens: 4000,
        system: `You are an AEO (Answer Engine Optimization) expert. Generate practical, ready-to-use fixes for website issues. Always provide:
1. A brief explanation of WHY this matters for AEO
2. The exact code or content to implement
3. Clear implementation steps
4. Priority level (critical/high/medium/low)

Format your response as JSON:
{
  "explanation": "Why this matters for AEO (1-2 sentences)",
  "priority": "critical|high|medium|low",
  "codeBlocks": [
    {
      "language": "html|json|javascript|css|text",
      "label": "Short description of this code block",
      "code": "The actual code to implement"
    }
  ],
  "steps": ["Step 1...", "Step 2..."],
  "notes": "Any additional implementation notes (optional)"
}`,
        messages: [{
          role: 'user',
          content: `Generate a fix for this AEO issue:

Website: ${siteUrl || 'Unknown'}
Category: ${categoryName}
Item: ${item.name}
Current Status: ${item.status}
Analysis Note: ${item.note}

Provide a specific, implementable fix with code that can be directly copied and used.`
        }],
      })

      const textContent = data.content
        ?.filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n') || ''

      const parsed = parseFixJSON(textContent)
      if (parsed) {
        const fixData = {
          ...parsed,
          itemId: `${categoryName}::${item.name}`,
          generatedAt: new Date().toISOString(),
        }
        setFix(fixData)
        onFixGenerated(fixData)
      } else {
        setError('Could not parse the fix response. Try again.')
      }
    } catch (err) {
      logger.error('Fix generation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text, blockIdx) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(blockIdx)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      logger.warn('Clipboard copy failed')
    }
  }

  const togglePanel = () => setShowPanel(!showPanel)

  return { fix, loading, error, showPanel, copied, generateFix, togglePanel, copyToClipboard }
}

/**
 * FixButton — small inline button for the item row.
 */
export function FixButton({ hasFix, loading, showPanel, apiKey, itemName, onGenerate, onTogglePanel }) {
  if (loading) {
    return (
      <span className="fix-generate-btn" style={{ cursor: 'default', opacity: 0.7 }}>
        <Loader2 size={12} className="animate-spin" />
      </span>
    )
  }

  if (hasFix) {
    return (
      <button
        onClick={onTogglePanel}
        className="fix-generate-btn"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-success) 40%, var(--border-subtle))',
          color: 'var(--color-success)',
          background: showPanel
            ? 'color-mix(in srgb, var(--color-success) 12%, var(--bg-card))'
            : 'color-mix(in srgb, var(--color-success) 6%, var(--bg-card))',
        }}
        title="View generated fix"
        aria-label={`View fix for ${itemName}`}
      >
        <Sparkles size={12} />
        <span>Fix</span>
      </button>
    )
  }

  return (
    <button
      onClick={onGenerate}
      disabled={!apiKey}
      className="fix-generate-btn"
      title={!apiKey ? 'API key required' : `Generate fix for ${itemName}`}
      aria-label={`Generate fix for ${itemName}`}
    >
      <Wand2 size={12} />
      <span>Fix</span>
    </button>
  )
}

const PRIORITY_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' },
  high: { bg: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)' },
  medium: { bg: 'rgba(14,165,233,0.1)', color: 'var(--color-phase-3)' },
  low: { bg: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' },
}

/**
 * FixPanel — expandable panel rendered below an item row.
 */
export function FixPanel({ fix, loading, error, itemName, copied, onRegenerate, onRetry, onCopy }) {
  const [expanded, setExpanded] = useState(true)

  // Loading
  if (loading) {
    return (
      <div className="fix-panel">
        <div className="fix-loading">
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-phase-3)' }} />
          <span>Generating fix for <strong>{itemName}</strong>...</span>
        </div>
      </div>
    )
  }

  // Error without fix
  if (error && !fix) {
    return (
      <div className="fix-panel">
        <div className="fix-error">
          <p>{error}</p>
          <button onClick={onRetry} className="fix-retry-btn" aria-label="Retry fix generation">
            <RotateCcw size={12} /> Retry
          </button>
        </div>
      </div>
    )
  }

  if (!fix) return null

  const pColor = PRIORITY_COLORS[fix.priority] || PRIORITY_COLORS.medium

  return (
    <div className="fix-panel fade-in-up">
      {/* Fix Header */}
      <div
        className="fix-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded) } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
          <Sparkles size={14} style={{ color: 'var(--color-phase-3)', flexShrink: 0 }} />
          <span className="fix-header-label">AI Fix</span>
          <span
            className="fix-priority-badge"
            style={{ background: pColor.bg, color: pColor.color }}
          >
            {fix.priority}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onRegenerate() }}
            className="fix-regenerate-btn"
            title="Regenerate fix"
            aria-label="Regenerate fix"
          >
            <RotateCcw size={12} />
          </button>
          {expanded
            ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} />
            : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          }
        </div>
      </div>

      {expanded && (
        <div className="fix-body">
          {/* Explanation */}
          <p className="fix-explanation">{fix.explanation}</p>

          {/* Code Blocks */}
          {fix.codeBlocks?.map((block, idx) => (
            <div key={idx} className="fix-code-wrapper">
              <div className="fix-code-header">
                <span className="fix-code-lang">{block.language}</span>
                <span className="fix-code-label">{block.label}</span>
                <button
                  onClick={() => onCopy(block.code, idx)}
                  className="fix-copy-btn"
                  title="Copy code"
                  aria-label="Copy code to clipboard"
                >
                  {copied === idx ? <Check size={12} /> : <Copy size={12} />}
                  {copied === idx ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="fix-code-block"><code>{block.code}</code></pre>
            </div>
          ))}

          {/* Implementation Steps */}
          {fix.steps?.length > 0 && (
            <div className="fix-steps">
              <p className="fix-steps-title">Implementation Steps</p>
              <ol className="fix-steps-list">
                {fix.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Notes */}
          {fix.notes && (
            <p className="fix-notes">{fix.notes}</p>
          )}

          {/* Timestamp */}
          <p className="fix-timestamp">
            Generated {new Date(fix.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}

function parseFixJSON(text) {
  try {
    const clean = text.replace(/```json\s?|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.explanation && parsed.codeBlocks) {
        return parsed
      }
    }
  } catch (e) {
    logger.warn('Fix JSON parse error:', e)
  }
  return null
}
