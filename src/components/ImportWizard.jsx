/**
 * ImportWizard — Multi-step modal for CSV/JSON bulk data import.
 *
 * Steps: 1) Select type → 2) Upload file → 3) Map columns → 4) Preview/validate → 5) Confirm
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X, Upload, FileSpreadsheet, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Table2, Users, Calendar, Search,
  Check, Loader2,
} from 'lucide-react'
import { autoDetectAndParse, IMPORT_SCHEMAS, validateAndTransform } from '../utils/csvParser'

const IMPORT_TYPES = [
  { key: 'queries', icon: Search, color: 'var(--color-phase-3)' },
  { key: 'competitors', icon: Users, color: 'var(--color-phase-2)' },
  { key: 'calendar', icon: Calendar, color: 'var(--color-phase-1)' },
]

const STEPS = ['type', 'upload', 'map', 'preview', 'done']

export default function ImportWizard({ onComplete, onClose }) {
// Escape key handler
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

const fileInputRef = useRef(null)
  const [step, setStep] = useState(0) // index into STEPS
  const [importType, setImportType] = useState(null)
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState(null) // { headers, rows, format }
  const [mapping, setMapping] = useState({})
  const [result, setResult] = useState(null) // { valid, errors }
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null) // { count }

  const schema = importType ? IMPORT_SCHEMAS[importType] : null

  // Step 1: Select import type
  const handleTypeSelect = (type) => {
    setImportType(type)
    setStep(1)
  }

  // Step 2: File upload
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = autoDetectAndParse(ev.target.result, file.name)
        setParsed(data)

        // Auto-map columns by fuzzy matching field names
        if (schema) {
          const autoMapping = {}
          const allFields = [...schema.requiredFields, ...schema.optionalFields]
          allFields.forEach(field => {
            const fieldLower = field.toLowerCase()
            const match = data.headers.find(h =>
              h.toLowerCase() === fieldLower ||
              h.toLowerCase().includes(fieldLower) ||
              fieldLower.includes(h.toLowerCase())
            )
            if (match) autoMapping[field] = match
          })
          setMapping(autoMapping)
        }

        setStep(2)
      } catch (err) {
        setParsed({ headers: [], rows: [], format: 'unknown', error: err.message })
      }
    }
    reader.readAsText(file)
  }, [schema])

  // Step 3: Column mapping
  const handleMappingChange = (field, column) => {
    setMapping(prev => ({ ...prev, [field]: column }))
  }

  const canProceedToPreview = () => {
    if (!schema || !parsed) return false
    return schema.requiredFields.every(f => mapping[f] && mapping[f] !== '')
  }

  const handlePreview = () => {
    if (!parsed || !importType) return
    const validationResult = validateAndTransform(parsed.rows, importType, mapping)
    setResult(validationResult)
    setStep(3)
  }

  // Step 4: Confirm import
  const handleImport = async () => {
    if (!result || !result.valid.length || importing) return
    setImporting(true)

    try {
      await onComplete(importType, result.valid)
      setImportResult({ count: result.valid.length })
      setStep(4)
    } catch {
      // error handled by parent
    } finally {
      setImporting(false)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const stepName = STEPS[step]

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.0625rem',
    color: 'var(--text-tertiary)',
    marginBottom: '0.375rem',
  }

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />

      {/* Modal */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '36rem',
        maxHeight: '85vh', background: 'var(--card-bg)',
        borderRadius: 'var(--radius-xl)',
        border: '0.0625rem solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '0.0625rem solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={16} style={{ color: 'var(--color-phase-1)' }} />
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.875rem',
              fontWeight: 700, color: 'var(--text-primary)',
            }}>
              {'Bulk Data Import'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {STEPS.slice(0, -1).map((_, i) => (
                <div key={i} style={{
                  width: '1.5rem', height: '0.1875rem', borderRadius: '6.1875rem',
                  background: i <= step ? 'var(--color-phase-1)' : 'var(--border-default)',
                  transition: 'background 200ms',
                }} />
              ))}
            </div>
            <button onClick={onClose} className="btn-icon">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflow: 'auto', padding: '1.25rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>

          {/* Step 1: Select Type */}
          {stepName === 'type' && (
            <>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {'What would you like to import?'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {IMPORT_TYPES.map(({ key, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => handleTypeSelect(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                      border: '0.0625rem solid var(--border-default)',
                      background: 'transparent', cursor: 'pointer',
                      transition: 'all 150ms',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = color
                      e.currentTarget.style.background = color + '08'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-default)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: '0.5rem',
                      background: color + '12', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)', fontSize: '0.8125rem',
                        fontWeight: 700, color: 'var(--text-primary)',
                      }}>
                        {`Type_${key}`}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        {`Type_${key}_desc`}
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-disabled)' }} />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Upload */}
          {stepName === 'upload' && (
            <>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {'Upload a CSV or JSON file with your data.'}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.tsv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '0.75rem', padding: '2rem',
                  border: '0.125rem dashed var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'transparent', cursor: 'pointer',
                  transition: 'border-color 150ms',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-phase-1)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
              >
                <FileSpreadsheet size={32} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {'Click to select a file'}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)' }}>
                  CSV, JSON
                </span>
              </button>

              {parsed?.error && (
                <div style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(239,68,68,0.08)', color: 'var(--color-error)',
                  fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <AlertCircle size={14} />
                  {parsed.error}
                </div>
              )}
            </>
          )}

          {/* Step 3: Map Columns */}
          {stepName === 'map' && schema && parsed && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {'Map your file columns to the required fields.'}
                </p>
                <span style={{
                  fontSize: '0.625rem', color: 'var(--text-tertiary)',
                  padding: '0.125rem 0.5rem', borderRadius: '6.1875rem',
                  background: 'var(--hover-bg)',
                }}>
                  {parsed.rows.length} {'rows'} · {parsed.format.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Required fields */}
                {schema.requiredFields.map(field => (
                  <div key={field}>
                    <label style={labelStyle}>
                      {field} <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <select
                      value={mapping[field] || ''}
                      onChange={e => handleMappingChange(field, e.target.value)}
                      className="input-field"
                      style={{ width: '100%' }}
                    >
                      <option value="">{'Select column...'}</option>
                      {parsed.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Optional fields */}
                {schema.optionalFields.map(field => (
                  <div key={field}>
                    <label style={labelStyle}>{field}</label>
                    <select
                      value={mapping[field] || ''}
                      onChange={e => handleMappingChange(field, e.target.value)}
                      className="input-field"
                      style={{ width: '100%' }}
                    >
                      <option value="">{'Skip (optional)'}</option>
                      {parsed.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview first 3 rows */}
              {parsed.rows.length > 0 && (
                <div>
                  <div style={labelStyle}>{'Data Preview'}</div>
                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    border: '0.0625rem solid var(--border-subtle)',
                    overflow: 'auto', maxHeight: '10rem',
                  }}>
                    <table style={{
                      width: '100%', borderCollapse: 'collapse',
                      fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
                    }}>
                      <thead>
                        <tr>
                          {parsed.headers.map(h => (
                            <th key={h} style={{
                              padding: '0.375rem 0.5rem', textAlign: 'left',
                              borderBottom: '0.0625rem solid var(--border-subtle)',
                              background: 'var(--hover-bg)', color: 'var(--text-tertiary)',
                              fontWeight: 700, whiteSpace: 'nowrap',
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.rows.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {parsed.headers.map(h => (
                              <td key={h} style={{
                                padding: '0.375rem 0.5rem',
                                borderBottom: '0.0625rem solid var(--border-subtle)',
                                color: 'var(--text-secondary)',
                                maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {String(row[h] || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 4: Preview/Validate */}
          {stepName === 'preview' && result && (
            <>
              <div style={{
                display: 'flex', gap: '1rem', flexWrap: 'wrap',
              }}>
                <div className="card" style={{ padding: '0.75rem 1rem', flex: 1, minWidth: '8rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                    {'Valid Rows'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700,
                    color: result.valid.length > 0 ? 'var(--color-success)' : 'var(--text-disabled)',
                  }}>
                    {result.valid.length}
                  </div>
                </div>
                <div className="card" style={{ padding: '0.75rem 1rem', flex: 1, minWidth: '8rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                    {'Errors'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700,
                    color: result.errors.length > 0 ? 'var(--color-error)' : 'var(--text-disabled)',
                  }}>
                    {result.errors.length}
                  </div>
                </div>
              </div>

              {/* Errors list */}
              {result.errors.length > 0 && (
                <div>
                  <div style={labelStyle}>{'Validation Errors'}</div>
                  <div style={{
                    maxHeight: '8rem', overflow: 'auto',
                    borderRadius: 'var(--radius-md)',
                    border: '0.0625rem solid rgba(239,68,68,0.2)',
                  }}>
                    {result.errors.slice(0, 20).map((err, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.375rem 0.75rem',
                        borderBottom: '0.0625rem solid var(--border-subtle)',
                        fontSize: '0.6875rem',
                      }}>
                        <AlertCircle size={11} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {'Row'} {err.row}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{err.message}</span>
                      </div>
                    ))}
                    {result.errors.length > 20 && (
                      <div style={{ padding: '0.375rem 0.75rem', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        +{result.errors.length - 20} {'more errors'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Valid rows preview */}
              {result.valid.length > 0 && (
                <div>
                  <div style={labelStyle}>{'Preview (first 5 rows)'}</div>
                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    border: '0.0625rem solid var(--border-subtle)',
                    overflow: 'auto', maxHeight: '12rem',
                  }}>
                    <table style={{
                      width: '100%', borderCollapse: 'collapse',
                      fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
                    }}>
                      <thead>
                        <tr>
                          {Object.keys(result.valid[0]).map(k => (
                            <th key={k} style={{
                              padding: '0.375rem 0.5rem', textAlign: 'left',
                              borderBottom: '0.0625rem solid var(--border-subtle)',
                              background: 'var(--hover-bg)', color: 'var(--text-tertiary)',
                              fontWeight: 700, whiteSpace: 'nowrap',
                            }}>
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.valid.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val, j) => (
                              <td key={j} style={{
                                padding: '0.375rem 0.5rem',
                                borderBottom: '0.0625rem solid var(--border-subtle)',
                                color: 'var(--text-secondary)',
                                maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {String(val || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.valid.length > 5 && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                      {`+${result.valid.length - 5} more rows`}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 5: Done */}
          {stepName === 'done' && importResult && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '2rem 0', gap: '0.75rem',
            }}>
              <div style={{
                width: '3rem', height: '3rem', borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.875rem',
                fontWeight: 700, color: 'var(--color-success)',
              }}>
                {'Import Complete'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {`${importResult.count} items imported successfully.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          borderTop: '0.0625rem solid var(--border-subtle)',
          gap: '0.5rem',
        }}>
          <div>
            {step > 0 && step < 4 && (
              <button onClick={handleBack} className="btn-ghost btn-sm">
                <ArrowLeft size={13} /> {'Back'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {stepName === 'done' ? (
              <button onClick={onClose} className="btn-primary btn-sm">
                {'Done'}
              </button>
            ) : (
              <>
                <button onClick={onClose} className="btn-secondary btn-sm">
                  {'Cancel'}
                </button>
                {stepName === 'map' && (
                  <button
                    onClick={handlePreview}
                    disabled={!canProceedToPreview()}
                    className="btn-primary btn-sm"
                  >
                    {'Preview'} <ArrowRight size={13} />
                  </button>
                )}
                {stepName === 'preview' && result?.valid.length > 0 && (
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="btn-primary btn-sm"
                  >
                    {importing ? (
                      <><Loader2 size={13} className="mon-spinner" /> {'Importing...'}</>
                    ) : (
                      <><Check size={13} /> {`Import ${result.valid.length} rows`}</>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
