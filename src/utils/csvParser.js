/**
 * csvParser — Lightweight CSV/JSON parser for bulk data import.
 *
 * Supports:
 * - CSV with header detection
 * - JSON arrays
 * - Row-level validation errors
 * - Type coercion (numbers, dates, booleans)
 */

/**
 * Parse CSV string into rows with headers.
 * @param {string} text — Raw CSV text
 * @returns {{ headers: string[], rows: object[], rawRows: string[][] }}
 */
export function parseCSV(text) {
  if (!text || !text.trim()) return { headers: [], rows: [], rawRows: [] }

  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length === 0) return { headers: [], rows: [], rawRows: [] }

  // Parse a single CSV line (handles quoted fields)
  const parseLine = (line) => {
    const fields = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"'
          i++ // skip escaped quote
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          fields.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
    }
    fields.push(current.trim())
    return fields
  }

  const headerFields = parseLine(lines[0])
  const rawRows = lines.slice(1).map(parseLine)

  const rows = rawRows.map(fields => {
    const row = {}
    headerFields.forEach((header, i) => {
      row[header] = fields[i] !== undefined ? fields[i] : ''
    })
    return row
  })

  return { headers: headerFields, rows, rawRows }
}

/**
 * Parse JSON string into rows with headers.
 * @param {string} text — Raw JSON text
 * @returns {{ headers: string[], rows: object[] }}
 */
export function parseJSON(text) {
  if (!text || !text.trim()) return { headers: [], rows: [] }

  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) {
    throw new Error('JSON must be an array of objects')
  }
  if (parsed.length === 0) return { headers: [], rows: [] }

  // Collect all unique keys
  const headerSet = new Set()
  parsed.forEach(row => {
    if (typeof row === 'object' && row !== null) {
      Object.keys(row).forEach(k => headerSet.add(k))
    }
  })

  return { headers: Array.from(headerSet), rows: parsed }
}

/**
 * Auto-detect format and parse.
 * @param {string} text — Raw file content
 * @param {string} fileName — File name for format detection
 * @returns {{ headers: string[], rows: object[], format: 'csv'|'json' }}
 */
export function autoDetectAndParse(text, fileName) {
  const ext = fileName?.split('.').pop()?.toLowerCase()

  if (ext === 'json' || text.trim().startsWith('[') || text.trim().startsWith('{')) {
    const result = parseJSON(text)
    return { ...result, format: 'json' }
  }

  const result = parseCSV(text)
  return { ...result, format: 'csv' }
}

/**
 * Coerce a string value to its likely type.
 */
function coerceValue(value) {
  if (value === '' || value === null || value === undefined) return ''
  if (value === 'true') return true
  if (value === 'false') return false

  // Try number
  const num = Number(value)
  if (!isNaN(num) && value.trim() !== '') return num

  return value
}

/**
 * Import type schemas — defines expected fields for each import target.
 */
export const IMPORT_SCHEMAS = {
  queries: {
    label: 'Queries',
    requiredFields: ['query'],
    optionalFields: ['engine', 'cited', 'excerpt', 'date'],
    transform: (row, mapping) => ({
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      query: String(row[mapping.query] || '').trim(),
      engine: String(row[mapping.engine] || 'chatgpt').trim(),
      addedAt: row[mapping.date] || new Date().toISOString(),
    }),
  },
  competitors: {
    label: 'Competitors',
    requiredFields: ['url'],
    optionalFields: ['name', 'notes'],
    transform: (row, mapping) => {
      let url = String(row[mapping.url] || '').trim()
      if (url && !url.startsWith('http')) url = 'https://' + url
      return {
        url,
        name: String(row[mapping.name] || '').trim() || url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
        notes: String(row[mapping.notes] || '').trim(),
        addedAt: new Date().toISOString(),
      }
    },
  },
  calendar: {
    label: 'Calendar Entries',
    requiredFields: ['title'],
    optionalFields: ['scheduledDate', 'status', 'notes', 'pageUrl'],
    transform: (row, mapping) => ({
      id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: String(row[mapping.title] || '').trim(),
      scheduledDate: row[mapping.scheduledDate] || new Date().toISOString().slice(0, 10),
      status: ['scheduled', 'in-progress', 'review', 'published'].includes(row[mapping.status]) ? row[mapping.status] : 'scheduled',
      notes: String(row[mapping.notes] || '').trim(),
      pageUrl: String(row[mapping.pageUrl] || '').trim(),
    }),
  },
}

/**
 * Validate and transform rows using a schema and column mapping.
 * @param {object[]} rows — Parsed rows
 * @param {string} importType — Key into IMPORT_SCHEMAS
 * @param {object} mapping — { schemaField: sourceColumnName }
 * @returns {{ valid: object[], errors: { row: number, message: string }[] }}
 */
export function validateAndTransform(rows, importType, mapping) {
  const schema = IMPORT_SCHEMAS[importType]
  if (!schema) return { valid: [], errors: [{ row: 0, message: `Unknown import type: ${importType}` }] }

  const valid = []
  const errors = []

  rows.forEach((row, i) => {
    // Check required fields
    for (const field of schema.requiredFields) {
      const sourceCol = mapping[field]
      if (!sourceCol || !row[sourceCol] || String(row[sourceCol]).trim() === '') {
        errors.push({ row: i + 1, message: `Missing required field "${field}"` })
        return
      }
    }

    try {
      const transformed = schema.transform(row, mapping)
      // Final validation — check the primary required field has content
      const primaryField = schema.requiredFields[0]
      if (!transformed[primaryField] || String(transformed[primaryField]).trim() === '') {
        errors.push({ row: i + 1, message: `Empty ${primaryField} after transformation` })
        return
      }
      valid.push(transformed)
    } catch (err) {
      errors.push({ row: i + 1, message: err.message || 'Transform error' })
    }
  })

  return { valid, errors }
}
