import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportChecklist, exportMetrics, exportActivity, exportCompetitors } from '../generateCsv'

/* ── DOM mocks for downloadCsv ── */

let lastBlobContent = ''
let lastDownloadFilename = ''

beforeEach(() => {
  lastBlobContent = ''
  lastDownloadFilename = ''

  // Mock Blob
  globalThis.Blob = class Blob {
    constructor(parts) { this._content = parts.join('') }
  }

  // Mock URL.createObjectURL / revokeObjectURL
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()

  // Mock document.createElement('a') + body methods
  const mockLink = { href: '', download: '', click: vi.fn() }
  vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
  vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
  vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

  // Capture blob content and filename
  const origCreateObjectURL = globalThis.URL.createObjectURL
  globalThis.URL.createObjectURL = vi.fn((blob) => {
    lastBlobContent = blob._content
    return 'blob:mock-url'
  })
  Object.defineProperty(mockLink, 'download', {
    set(val) { lastDownloadFilename = val },
    get() { return lastDownloadFilename },
  })
})

/* ══════════════════════════════════════════
   exportChecklist
   ══════════════════════════════════════════ */

describe('exportChecklist', () => {
  const phases = [
    {
      number: 1,
      title: 'Foundation',
      categories: [
        {
          name: 'Basics',
          items: [
            { id: 'a1', text: 'Add schema markup', detail: 'Add JSON-LD' },
            { id: 'a2', text: 'Fix meta tags', detail: 'Title + desc' },
          ],
        },
      ],
    },
  ]

  it('generates CSV with correct headers', () => {
    const filename = exportChecklist({ project: { name: 'Test Project' }, phases })
    expect(lastBlobContent).toContain('Phase,Category,Task,Status,Assignee,Verified,Notes')
  })

  it('marks checked items as Complete', () => {
    exportChecklist({ project: { name: 'Test', checked: { a1: true } }, phases })
    expect(lastBlobContent).toContain('Complete')
    expect(lastBlobContent).toContain('Incomplete')
  })

  it('includes assignee name when member matches', () => {
    const members = [{ uid: 'u1', displayName: 'Alice', email: 'alice@test.com' }]
    exportChecklist({
      project: { name: 'Test', assignments: { a1: 'u1' } },
      phases,
      members,
    })
    expect(lastBlobContent).toContain('Alice')
  })

  it('returns slugified filename', () => {
    const filename = exportChecklist({ project: { name: 'My Cool Project' }, phases })
    expect(filename).toBe('My-Cool-Project-checklist.csv')
  })

  it('uses "export" as slug fallback for empty name', () => {
    const filename = exportChecklist({ project: {}, phases })
    expect(filename).toBe('export-checklist.csv')
  })

  it('handles empty phases gracefully', () => {
    const filename = exportChecklist({ project: { name: 'Test' }, phases: [] })
    expect(filename).toBe('Test-checklist.csv')
    // Only header line
    const lines = lastBlobContent.replace('\uFEFF', '').split('\n')
    expect(lines.length).toBe(1)
  })

  it('escapes commas in task text', () => {
    const phasesWithComma = [
      {
        number: 1, title: 'P1',
        categories: [{ name: 'Cat', items: [{ id: 'c1', text: 'Add title, description', detail: 'Info' }] }],
      },
    ]
    exportChecklist({ project: { name: 'T' }, phases: phasesWithComma })
    expect(lastBlobContent).toContain('"Add title, description"')
  })
})

/* ══════════════════════════════════════════
   exportMetrics
   ══════════════════════════════════════════ */

describe('exportMetrics', () => {
  it('returns null for empty history', () => {
    expect(exportMetrics({ project: { metricsHistory: [] } })).toBeNull()
  })

  it('returns null for missing history', () => {
    expect(exportMetrics({ project: {} })).toBeNull()
  })

  it('generates headers with engine columns', () => {
    const project = {
      name: 'Test',
      metricsHistory: [
        {
          timestamp: '2025-01-15T10:00:00Z',
          overallScore: 72,
          citations: { total: 10, totalPrompts: 5, byEngine: [{ engine: 'ChatGPT', citations: 6 }, { engine: 'Perplexity', citations: 4 }] },
        },
      ],
    }
    const filename = exportMetrics({ project })
    expect(filename).toBe('Test-metrics.csv')
    expect(lastBlobContent).toContain('ChatGPT Citations')
    expect(lastBlobContent).toContain('Perplexity Citations')
    expect(lastBlobContent).toContain('72')
  })

  it('handles entries with different engines across rows', () => {
    const project = {
      name: 'T',
      metricsHistory: [
        { timestamp: '2025-01-15T10:00:00Z', overallScore: 50, citations: { total: 3, totalPrompts: 2, byEngine: [{ engine: 'ChatGPT', citations: 3 }] } },
        { timestamp: '2025-01-16T10:00:00Z', overallScore: 60, citations: { total: 4, totalPrompts: 2, byEngine: [{ engine: 'Claude', citations: 4 }] } },
      ],
    }
    exportMetrics({ project })
    // Both engines should appear as columns
    expect(lastBlobContent).toContain('ChatGPT Citations')
    expect(lastBlobContent).toContain('Claude Citations')
  })
})

/* ══════════════════════════════════════════
   exportActivity
   ══════════════════════════════════════════ */

describe('exportActivity', () => {
  it('returns null for empty log', () => {
    expect(exportActivity({ project: { activityLog: [] } })).toBeNull()
  })

  it('returns null for missing log', () => {
    expect(exportActivity({ project: {} })).toBeNull()
  })

  it('maps type labels correctly', () => {
    const project = {
      name: 'Test',
      activityLog: [
        { type: 'check', timestamp: '2025-01-15T10:00:00Z', authorName: 'Alice', data: { taskText: 'Task 1' } },
        { type: 'bulk_check', timestamp: '2025-01-15T11:00:00Z', authorName: 'Bob', data: {} },
      ],
    }
    const filename = exportActivity({ project })
    expect(filename).toBe('Test-activity.csv')
    expect(lastBlobContent).toContain('Task Checked')
    expect(lastBlobContent).toContain('Bulk Check')
    expect(lastBlobContent).toContain('Alice')
    expect(lastBlobContent).toContain('Task 1')
  })

  it('falls back to raw type for unknown types', () => {
    const project = {
      name: 'T',
      activityLog: [{ type: 'custom_type', timestamp: '2025-01-15T10:00:00Z', data: {} }],
    }
    exportActivity({ project })
    expect(lastBlobContent).toContain('custom_type')
  })
})

/* ══════════════════════════════════════════
   exportCompetitors
   ══════════════════════════════════════════ */

describe('exportCompetitors', () => {
  it('returns null for empty competitors', () => {
    expect(exportCompetitors({ project: { competitors: [] } })).toBeNull()
  })

  it('returns null for missing competitors', () => {
    expect(exportCompetitors({ project: {} })).toBeNull()
  })

  it('generates correct CSV with competitor data', () => {
    const project = {
      name: 'Test',
      competitors: [
        { name: 'Rival Inc', url: 'https://rival.com', citationShare: 35.5, lastAnalyzed: '2025-01-15T10:00:00Z' },
        { name: 'Other Co', url: 'https://other.co', citationShare: null },
      ],
    }
    const filename = exportCompetitors({ project })
    expect(filename).toBe('Test-competitors.csv')
    expect(lastBlobContent).toContain('Rival Inc')
    expect(lastBlobContent).toContain('https://rival.com')
    expect(lastBlobContent).toContain('35.5')
    expect(lastBlobContent).toContain('Other Co')
  })
})
