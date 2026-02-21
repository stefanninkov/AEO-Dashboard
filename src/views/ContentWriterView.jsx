import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PenTool, Loader2, Copy, Check, ChevronDown, ChevronUp, Sparkles, Trash2, Clock, AlertCircle } from 'lucide-react'
import { callAI } from '../utils/apiClient'
import { hasApiKey } from '../utils/aiProvider'
import { getAnalyzerIndustryContext, AUDIENCE_LABELS, INDUSTRY_LABELS, LANGUAGE_LABELS } from '../utils/getRecommendations'
import { useActivityWithWebhooks } from '../hooks/useActivityWithWebhooks'
import logger from '../utils/logger'

function buildContentTypes(t) {
  return [
    {
      id: 'faq',
      label: t('writer.types.faq'),
      icon: '❓',
      description: t('writer.typeDescriptions.faq'),
      prompt: (topic, context, tone) => `Generate an AEO-optimized FAQ section about "${topic}".
${context}

Requirements:
- Generate 5-8 question-answer pairs
- Questions should match how people ask AI assistants (natural language)
- Answers should be concise (2-3 sentences for the direct answer, then expand)
- Lead each answer with a clear, direct response that AI can extract
- Include relevant keywords naturally
- Tone: ${tone}

Return as JSON:
{
  "title": "FAQ section title",
  "intro": "Brief intro paragraph (1-2 sentences)",
  "items": [
    {
      "question": "...",
      "answer": "Direct answer first. Then expanded explanation...",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "schemaNote": "Brief note about implementing FAQPage schema for this content"
}`,
    },
    {
      id: 'howto',
      label: t('writer.types.howTo'),
      icon: '📋',
      description: t('writer.typeDescriptions.howTo'),
      prompt: (topic, context, tone) => `Create an AEO-optimized how-to guide about "${topic}".
${context}

Requirements:
- Clear, numbered steps (5-10 steps)
- Each step should have a concise title and detailed instructions
- Include a TL;DR summary at the top (2-3 sentences)
- Include estimated time, difficulty level, and prerequisites
- Structure content so AI assistants can extract step-by-step answers
- Tone: ${tone}

Return as JSON:
{
  "title": "How-To: ...",
  "tldr": "Summary in 2-3 sentences that directly answers the question",
  "difficulty": "beginner|intermediate|advanced",
  "timeEstimate": "e.g., 15 minutes",
  "prerequisites": ["prerequisite 1", "..."],
  "steps": [
    {
      "number": 1,
      "title": "Step title",
      "detail": "Detailed instructions for this step",
      "tip": "Optional pro tip (null if none)"
    }
  ],
  "conclusion": "Wrap-up paragraph",
  "schemaNote": "Brief note about implementing HowTo schema for this content"
}`,
    },
    {
      id: 'comparison',
      label: t('writer.types.comparison'),
      icon: '⚖️',
      description: t('writer.typeDescriptions.comparison'),
      prompt: (topic, context, tone) => `Write an AEO-optimized comparison article about "${topic}".
${context}

Requirements:
- Compare 2-4 options/alternatives
- Lead with a clear recommendation summary
- Include pros/cons for each option
- Add a comparison table data
- Structure for "which is better" and "X vs Y" AI queries
- Tone: ${tone}

Return as JSON:
{
  "title": "...",
  "summary": "Clear recommendation in 2-3 sentences (this is what AI will cite)",
  "options": [
    {
      "name": "Option name",
      "description": "Brief description",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"],
      "bestFor": "Best for this use case",
      "rating": 1-5
    }
  ],
  "verdict": "Final recommendation paragraph with nuance",
  "comparisonTable": {
    "headers": ["Feature", "Option A", "Option B"],
    "rows": [["Feature 1", "Value", "Value"]]
  },
  "schemaNote": "Brief note about comparison content schema"
}`,
    },
    {
      id: 'product',
      label: t('writer.types.product'),
      icon: '🛍️',
      description: t('writer.typeDescriptions.product'),
      prompt: (topic, context, tone) => `Write an AEO-optimized product/service description for "${topic}".
${context}

Requirements:
- Lead with a clear, benefit-focused description (1-2 sentences)
- Include key features with brief explanations
- Add use cases / "best for" section
- Include a mini FAQ (3-4 questions)
- Structure content for "what is", "how does X work" AI queries
- Tone: ${tone}

Return as JSON:
{
  "title": "Product/service name",
  "tagline": "One-line value proposition",
  "description": "2-3 paragraph description with key benefits upfront",
  "features": [
    {
      "name": "Feature name",
      "description": "Brief explanation",
      "highlight": true or false
    }
  ],
  "useCases": [
    {
      "title": "Use case title",
      "description": "Who benefits and why"
    }
  ],
  "faq": [
    {
      "question": "Common question",
      "answer": "Direct answer"
    }
  ],
  "schemaNote": "Brief note about Product/Service schema for this content"
}`,
    },
    {
      id: 'definition',
      label: t('writer.types.definition'),
      icon: '📖',
      description: t('writer.typeDescriptions.definition'),
      prompt: (topic, context, tone) => `Write an AEO-optimized definition article about "${topic}".
${context}

Requirements:
- Start with a clear, concise definition (1-2 sentences) that AI can extract directly
- Include etymology/origin if relevant
- Explain key concepts and subtopics
- Add related terms section
- Include "Why it matters" section
- Structure for "what is", "define", "explain" AI queries
- Tone: ${tone}

Return as JSON:
{
  "title": "What is ${topic}?",
  "definition": "Clear, authoritative 1-2 sentence definition that AI assistants will cite verbatim",
  "expanded": "2-3 paragraph expanded explanation",
  "keyPoints": [
    {
      "heading": "Key concept",
      "explanation": "Brief explanation"
    }
  ],
  "whyItMatters": "Paragraph explaining relevance and importance",
  "relatedTerms": [
    {
      "term": "Related term",
      "brief": "One-line explanation"
    }
  ],
  "schemaNote": "Brief note about DefinedTerm/Article schema for this content"
}`,
    },
  ]
}

function buildToneOptions(t) {
  return [
    { id: 'professional', label: t('writer.tones.professional') },
    { id: 'conversational', label: t('writer.tones.conversational') },
    { id: 'technical', label: t('writer.tones.technical') },
    { id: 'friendly', label: t('writer.tones.friendly') },
  ]
}

export default function ContentWriterView({ activeProject, updateProject, user }) {
  const { t } = useTranslation('app')
  const { logAndDispatch } = useActivityWithWebhooks({ activeProject, updateProject })
  const [topic, setTopic] = useState('')
  const [selectedType, setSelectedType] = useState('faq')
  const [tone, setTone] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const apiKeySet = hasApiKey()

  const CONTENT_TYPES = useMemo(() => buildContentTypes(t), [t])
  const TONE_OPTIONS = useMemo(() => buildToneOptions(t), [t])

  const history = activeProject?.contentHistory || []

  const generate = async () => {
    if (!topic.trim() || loading) return
    if (!hasApiKey()) {
      setError(t('writer.apiKeyError'))
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const contentType = CONTENT_TYPES.find(ct => ct.id === selectedType)
    const context = getAnalyzerIndustryContext(activeProject?.questionnaire)

    try {
      const data = await callAI({
        maxTokens: 4000,
        system: `You are an expert AEO (Answer Engine Optimization) content writer. Generate content optimized for AI assistants like ChatGPT, Perplexity, and Google AI Overviews. Your content should:
- Lead with direct, clear answers that AI can cite
- Use natural language that matches how people ask questions
- Be factually accurate and authoritative
- Include relevant keywords naturally
- Be structured for easy parsing by AI systems

Return ONLY valid JSON matching the requested format.`,
        messages: [{
          role: 'user',
          content: contentType.prompt(topic, context, tone),
        }],
      })

      const textContent = data.text

      const parsed = parseJSON(textContent)
      if (parsed) {
        const entry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: selectedType,
          topic,
          tone,
          content: parsed,
          createdAt: new Date().toISOString(),
        }
        setResult(entry)

        // Persist to history
        const newHistory = [entry, ...history].slice(0, 50)
        updateProject(activeProject.id, { contentHistory: newHistory })

        // Log activity
        logAndDispatch('contentWrite', { type: selectedType, topic: topic.slice(0, 60) }, user)
      } else {
        setError(t('writer.parseError'))
      }
    } catch (err) {
      logger.error('Content writer error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyContent = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      logger.warn('Clipboard copy failed')
    }
  }

  const deleteHistoryItem = (id) => {
    const newHistory = history.filter(h => h.id !== id)
    updateProject(activeProject.id, { contentHistory: newHistory })
  }

  const loadFromHistory = (entry) => {
    setResult(entry)
    setTopic(entry.topic)
    setSelectedType(entry.type)
    setTone(entry.tone)
    setShowHistory(false)
  }

  const renderContent = (entry) => {
    if (!entry?.content) return null
    const c = entry.content

    switch (entry.type) {
      case 'faq': return <FaqContent content={c} onCopy={copyContent} copied={copied} />
      case 'howto': return <HowToContent content={c} onCopy={copyContent} copied={copied} />
      case 'comparison': return <ComparisonContent content={c} onCopy={copyContent} copied={copied} />
      case 'product': return <ProductContent content={c} onCopy={copyContent} copied={copied} />
      case 'definition': return <DefinitionContent content={c} onCopy={copyContent} copied={copied} />
      default: return <pre className="fix-code-block">{JSON.stringify(c, null, 2)}</pre>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01875rem] text-text-primary">{t('writer.title')}</h2>
          <span className="text-[0.6875rem] px-2 py-0.5 rounded-full bg-phase-2/10 text-phase-2 font-medium">{activeProject?.name}</span>
        </div>
        <p className="text-[0.8125rem] text-text-secondary">
          {activeProject?.questionnaire?.completedAt ? (() => {
            const q = activeProject.questionnaire
            const audience = AUDIENCE_LABELS[q.audience] || null
            const industry = INDUSTRY_LABELS[q.industry] || q.industry
            const langNames = q.languages?.length > 0 ? q.languages.map(l => LANGUAGE_LABELS[l] || l).join(', ') : null
            let subtitle = t('writer.generate')
            if (audience) {
              subtitle = t('writer.generateForAudience', { audience })
            } else {
              subtitle = t('writer.subtitle')
            }
            if (langNames && langNames !== 'English') {
              subtitle += t('writer.inLanguage', { languages: langNames })
            }
            if (industry) {
              subtitle += t('writer.industryFocus', { industry })
            }
            return subtitle
          })() : t('writer.defaultCiteContent')}
        </p>
      </div>

      {/* Content Type Selector */}
      <div className="cw-type-grid">
        {CONTENT_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`cw-type-card ${selectedType === type.id ? 'active' : ''}`}
          >
            <span className="cw-type-icon">{type.icon}</span>
            <span className="cw-type-label">{type.label}</span>
            <span className="cw-type-desc">{type.description}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="cw-form-card">
        <div className="cw-form-row">
          <div className="cw-form-field" style={{ flex: 1 }}>
            <label htmlFor="cw-topic" className="cw-label">{t('writer.topicLabel')}</label>
            <input
              id="cw-topic"
              type="text"
              placeholder={
                selectedType === 'faq' ? t('writer.placeholders.faq')
                : selectedType === 'howto' ? t('writer.placeholders.howTo')
                : selectedType === 'comparison' ? t('writer.placeholders.comparison')
                : selectedType === 'product' ? t('writer.placeholders.product')
                : t('writer.placeholders.definition')
              }
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              className="analyzer-url-input"
            />
          </div>
          <div className="cw-form-field">
            <label htmlFor="cw-tone" className="cw-label">{t('writer.tone')}</label>
            <select
              id="cw-tone"
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="cw-select"
            >
              {TONE_OPTIONS.map(toneOpt => (
                <option key={toneOpt.id} value={toneOpt.id}>{toneOpt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cw-form-actions">
          <button
            onClick={generate}
            disabled={loading || !topic.trim() || !apiKeySet}
            className="metrics-run-btn"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {t('writer.generateContent')}
          </button>

          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="cw-history-toggle"
            >
              <Clock size={14} />
              {t('writer.historyCount', { count: history.length })}
              {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {!apiKeySet && (
          <p className="text-[0.6875rem] text-warning mt-2">{t('writer.apiKeyMissing')}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3 fade-in-up">
          <AlertCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-error">{t('writer.generationError')}</p>
            <p className="text-xs text-text-secondary mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="cw-history-panel fade-in-up">
          <p className="cw-section-title">{t('writer.recentGenerations')}</p>
          {history.map(entry => {
            const typeInfo = CONTENT_TYPES.find(ct => ct.id === entry.type)
            return (
              <div key={entry.id} className="cw-history-item">
                <button onClick={() => loadFromHistory(entry)} className="cw-history-item-main">
                  <span className="cw-history-icon">{typeInfo?.icon || '📝'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="cw-history-topic">{entry.topic}</p>
                    <p className="cw-history-meta">
                      {typeInfo?.label} · {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => deleteHistoryItem(entry.id)}
                  className="cw-history-delete"
                  title={t('writer.delete')}
                  aria-label={t('writer.deleteHistoryItem')}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="cw-loading-card fade-in-up">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-phase-2)' }} />
          <div>
            <p className="text-sm font-medium text-text-primary">{t('writer.generatingType', { type: CONTENT_TYPES.find(ct => ct.id === selectedType)?.label })}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{t('writer.generatingTime')}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="cw-result fade-in-up">
          <div className="cw-result-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PenTool size={16} style={{ color: 'var(--color-phase-2)' }} />
              <span className="cw-result-title">{result.content.title || result.topic}</span>
            </div>
            <button
              onClick={() => copyContent(contentToMarkdown(result))}
              className="cw-copy-all-btn"
              title={t('writer.copyAsMarkdown')}
              aria-label={t('writer.copyContentAsMarkdown')}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t('writer.copied') : t('writer.copyMarkdown')}
            </button>
          </div>
          {renderContent(result)}
          {result.content.schemaNote && (
            <div className="cw-schema-note">
              <Sparkles size={12} style={{ color: 'var(--color-phase-3)', flexShrink: 0 }} />
              <span><strong>{t('writer.schemaTip')}</strong> {result.content.schemaNote}</span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="analyzer-empty-card fade-in-up">
          <div className="analyzer-empty-icon">
            <PenTool size={28} className="text-text-tertiary" />
          </div>
          <h3 className="analyzer-empty-title">{t('writer.readyToWrite')}</h3>
          <p className="analyzer-empty-text">
            {t('writer.readyToWriteDesc')}
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Content Renderers ── */

function FaqContent({ content }) {
  return (
    <div className="cw-content-body">
      {content.intro && <p className="cw-intro">{content.intro}</p>}
      <div className="cw-faq-list">
        {content.items?.map((item, idx) => (
          <div key={idx} className="cw-faq-item">
            <h4 className="cw-faq-q">Q: {item.question}</h4>
            <p className="cw-faq-a">{item.answer}</p>
            {item.keywords?.length > 0 && (
              <div className="cw-keywords">
                {item.keywords.map((kw, i) => <span key={i} className="cw-keyword">{kw}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HowToContent({ content }) {
  return (
    <div className="cw-content-body">
      {content.tldr && (
        <div className="cw-tldr">
          <strong>TL;DR:</strong> {content.tldr}
        </div>
      )}
      <div className="cw-howto-meta">
        {content.difficulty && <span className="cw-meta-badge">Difficulty: {content.difficulty}</span>}
        {content.timeEstimate && <span className="cw-meta-badge">Time: {content.timeEstimate}</span>}
      </div>
      {content.prerequisites?.length > 0 && (
        <div className="cw-prereqs">
          <p className="cw-prereqs-title">Prerequisites</p>
          <ul>
            {content.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      <div className="cw-steps">
        {content.steps?.map((step, idx) => (
          <div key={idx} className="cw-step">
            <div className="cw-step-number">{step.number || idx + 1}</div>
            <div className="cw-step-content">
              <h4 className="cw-step-title">{step.title}</h4>
              <p className="cw-step-detail">{step.detail}</p>
              {step.tip && <p className="cw-step-tip">💡 {step.tip}</p>}
            </div>
          </div>
        ))}
      </div>
      {content.conclusion && <p className="cw-conclusion">{content.conclusion}</p>}
    </div>
  )
}

function ComparisonContent({ content }) {
  return (
    <div className="cw-content-body">
      {content.summary && (
        <div className="cw-tldr">
          <strong>Quick Answer:</strong> {content.summary}
        </div>
      )}
      <div className="cw-comparison-grid">
        {content.options?.map((opt, idx) => (
          <div key={idx} className="cw-option-card">
            <div className="cw-option-header">
              <h4 className="cw-option-name">{opt.name}</h4>
              {opt.rating && (
                <span className="cw-option-rating">{'★'.repeat(opt.rating)}{'☆'.repeat(5 - opt.rating)}</span>
              )}
            </div>
            <p className="cw-option-desc">{opt.description}</p>
            <div className="cw-option-lists">
              <div>
                <p className="cw-list-label" style={{ color: 'var(--color-success)' }}>Pros</p>
                <ul className="cw-pros-list">
                  {opt.pros?.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <p className="cw-list-label" style={{ color: 'var(--color-error)' }}>Cons</p>
                <ul className="cw-cons-list">
                  {opt.cons?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
            {opt.bestFor && <p className="cw-best-for">Best for: {opt.bestFor}</p>}
          </div>
        ))}
      </div>
      {content.verdict && <p className="cw-conclusion"><strong>Verdict:</strong> {content.verdict}</p>}
    </div>
  )
}

function ProductContent({ content }) {
  return (
    <div className="cw-content-body">
      {content.tagline && <p className="cw-tagline">{content.tagline}</p>}
      {content.description && <div className="cw-description">{content.description}</div>}
      {content.features?.length > 0 && (
        <div className="cw-features">
          <p className="cw-section-title">Key Features</p>
          {content.features.map((f, i) => (
            <div key={i} className="cw-feature-item">
              <span className={`cw-feature-dot ${f.highlight ? 'highlight' : ''}`} />
              <div>
                <strong>{f.name}</strong>
                <span className="cw-feature-desc"> — {f.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {content.useCases?.length > 0 && (
        <div className="cw-use-cases">
          <p className="cw-section-title">Use Cases</p>
          {content.useCases.map((uc, i) => (
            <div key={i} className="cw-use-case">
              <strong>{uc.title}:</strong> {uc.description}
            </div>
          ))}
        </div>
      )}
      {content.faq?.length > 0 && (
        <div className="cw-mini-faq">
          <p className="cw-section-title">Common Questions</p>
          {content.faq.map((q, i) => (
            <div key={i} className="cw-faq-item">
              <h4 className="cw-faq-q">Q: {q.question}</h4>
              <p className="cw-faq-a">{q.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DefinitionContent({ content }) {
  return (
    <div className="cw-content-body">
      {content.definition && (
        <div className="cw-definition-box">
          {content.definition}
        </div>
      )}
      {content.expanded && <div className="cw-expanded">{content.expanded}</div>}
      {content.keyPoints?.length > 0 && (
        <div className="cw-key-points">
          <p className="cw-section-title">Key Concepts</p>
          {content.keyPoints.map((kp, i) => (
            <div key={i} className="cw-key-point">
              <h4>{kp.heading}</h4>
              <p>{kp.explanation}</p>
            </div>
          ))}
        </div>
      )}
      {content.whyItMatters && (
        <div className="cw-why-matters">
          <p className="cw-section-title">Why It Matters</p>
          <p>{content.whyItMatters}</p>
        </div>
      )}
      {content.relatedTerms?.length > 0 && (
        <div className="cw-related-terms">
          <p className="cw-section-title">Related Terms</p>
          <div className="cw-terms-grid">
            {content.relatedTerms.map((rt, i) => (
              <div key={i} className="cw-term">
                <strong>{rt.term}</strong>
                <span> — {rt.brief}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Helpers ── */

function contentToMarkdown(entry) {
  const c = entry.content
  let md = `# ${c.title || entry.topic}\n\n`

  switch (entry.type) {
    case 'faq':
      if (c.intro) md += `${c.intro}\n\n`
      c.items?.forEach(item => {
        md += `## ${item.question}\n\n${item.answer}\n\n`
      })
      break
    case 'howto':
      if (c.tldr) md += `> **TL;DR:** ${c.tldr}\n\n`
      if (c.difficulty) md += `**Difficulty:** ${c.difficulty} | `
      if (c.timeEstimate) md += `**Time:** ${c.timeEstimate}\n\n`
      c.steps?.forEach(step => {
        md += `### Step ${step.number || ''}: ${step.title}\n\n${step.detail}\n\n`
        if (step.tip) md += `> 💡 ${step.tip}\n\n`
      })
      if (c.conclusion) md += `---\n\n${c.conclusion}\n\n`
      break
    case 'comparison':
      if (c.summary) md += `> ${c.summary}\n\n`
      c.options?.forEach(opt => {
        md += `## ${opt.name}\n\n${opt.description}\n\n`
        md += `**Pros:** ${opt.pros?.join(', ')}\n\n`
        md += `**Cons:** ${opt.cons?.join(', ')}\n\n`
        if (opt.bestFor) md += `**Best for:** ${opt.bestFor}\n\n`
      })
      if (c.verdict) md += `---\n\n**Verdict:** ${c.verdict}\n\n`
      break
    case 'product':
      if (c.tagline) md += `*${c.tagline}*\n\n`
      if (c.description) md += `${c.description}\n\n`
      if (c.features?.length) {
        md += `## Features\n\n`
        c.features.forEach(f => { md += `- **${f.name}** — ${f.description}\n` })
        md += '\n'
      }
      break
    case 'definition':
      if (c.definition) md += `> ${c.definition}\n\n`
      if (c.expanded) md += `${c.expanded}\n\n`
      if (c.keyPoints?.length) {
        c.keyPoints.forEach(kp => { md += `## ${kp.heading}\n\n${kp.explanation}\n\n` })
      }
      if (c.whyItMatters) md += `## Why It Matters\n\n${c.whyItMatters}\n\n`
      break
    default:
      md += JSON.stringify(c, null, 2)
  }

  if (c.schemaNote) md += `---\n\n*Schema Note: ${c.schemaNote}*\n`
  return md
}

function parseJSON(text) {
  try {
    const clean = text.replace(/```json\s?|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch (e) {
    logger.warn('Content JSON parse error:', e)
  }
  return null
}
