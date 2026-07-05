/**
 * LlmsTxtGenerator — deterministic llms.txt builder inside the Schema view.
 *
 * llms.txt is an emerging standard (llmstxt.org): a markdown index at the
 * site root that helps AI systems navigate a site. Generation is pure
 * formatting — no API key required.
 */
import { useState } from 'react'
import { FileText, Copy, Check, Download, Info } from 'lucide-react'
import { buildLlmsTxt, parseLinkLines } from '../utils/llmsTxtGenerator'

export default function LlmsTxtGenerator({ activeProject }) {
  const [siteName, setSiteName] = useState(activeProject?.name || '')
  const [description, setDescription] = useState(activeProject?.questionnaire?.businessDescription || '')
  const [mainLinksText, setMainLinksText] = useState(activeProject?.url ? `Home | ${activeProject.url}` : '')
  const [optionalLinksText, setOptionalLinksText] = useState('')
  const [output, setOutput] = useState(null)
  const [copied, setCopied] = useState(false)

  const canGenerate = siteName.trim() && description.trim() && mainLinksText.trim()

  const generate = () => {
    if (!canGenerate) return
    setOutput(buildLlmsTxt({
      siteName,
      description,
      mainLinks: parseLinkLines(mainLinksText),
      optionalLinks: parseLinkLines(optionalLinksText),
    }))
  }

  const copyOutput = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadOutput = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'llms.txt'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      {/* Standard notice */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
        padding: '0.75rem 1rem', marginBottom: '1rem',
        background: 'var(--accent-subtle)', borderRadius: 'var(--radius-md)',
        fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5,
      }}>
        <Info size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.125rem' }} />
        <span>
          {'llms.txt is an emerging standard — a markdown index at your site root that helps AI systems find your key pages. Google says it neither helps nor hurts its systems, but it costs nothing, Lighthouse now checks for it, and adoption is growing. Generated instantly — no API key needed.'}
        </span>
      </div>

      {/* Form */}
      <div className="schema-form-card">
        <div className="schema-form-row">
          <div className="schema-form-field">
            <label className="schema-label">{'Site Name *'}</label>
            <input
              type="text"
              className="schema-input"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              placeholder="e.g., Acme Web Agency"
            />
          </div>
        </div>
        <div className="schema-form-row">
          <div className="schema-form-field schema-form-field-wide">
            <label className="schema-label">{'Site Summary *'}</label>
            <textarea
              className="schema-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="One short paragraph describing what your site is about and who it serves."
              rows={3}
              style={{ resize: 'vertical', minHeight: '4.5rem' }}
            />
          </div>
        </div>
        <div className="schema-form-row">
          <div className="schema-form-field schema-form-field-wide">
            <label className="schema-label">{'Main Pages * (one per line: Title | URL | optional note)'}</label>
            <textarea
              className="schema-input"
              value={mainLinksText}
              onChange={e => setMainLinksText(e.target.value)}
              placeholder={'Services | https://example.com/services | What we offer\nPricing | https://example.com/pricing'}
              rows={4}
              style={{ resize: 'vertical', minHeight: '5.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
            />
          </div>
        </div>
        <div className="schema-form-row">
          <div className="schema-form-field schema-form-field-wide">
            <label className="schema-label">{'Secondary Pages (optional, same format)'}</label>
            <textarea
              className="schema-input"
              value={optionalLinksText}
              onChange={e => setOptionalLinksText(e.target.value)}
              placeholder={'Blog | https://example.com/blog'}
              rows={2}
              style={{ resize: 'vertical', minHeight: '3.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
            />
          </div>
        </div>
        <button
          className="schema-generate-btn"
          onClick={generate}
          disabled={!canGenerate}
        >
          <FileText size={18} />
          {'Generate llms.txt'}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="schema-result">
          <div className="schema-result-header">
            <div>
              <h2 className="schema-result-title">
                <FileText size={20} />
                {'llms.txt'}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary btn-sm" onClick={copyOutput}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button className="btn-secondary btn-sm" onClick={downloadOutput}>
                <Download size={13} />
                {'Download'}
              </button>
            </div>
          </div>
          <pre className="schema-code-block" style={{ whiteSpace: 'pre-wrap' }}>
            <code>{output}</code>
          </pre>
          <div style={{
            marginTop: '0.75rem', fontSize: '0.8125rem',
            color: 'var(--text-tertiary)', lineHeight: 1.6,
          }}>
            {'Upload this file to your site root so it is reachable at '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              {(activeProject?.url || 'https://example.com').replace(/\/$/, '')}/llms.txt
            </code>
            {'. The Analyzer checks for it on your next scan.'}
          </div>
        </div>
      )}
    </>
  )
}
