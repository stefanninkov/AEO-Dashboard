import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ── jsPDF mock ── */

let mockDoc
let savedFilename

function createMockDoc() {
  return {
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFillColor: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    text: vi.fn(),
    rect: vi.fn(),
    roundedRect: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    splitTextToSize: vi.fn((text) => [text]),
    save: vi.fn((name) => { savedFilename = name }),
    autoTable: vi.fn(),
    lastAutoTable: { finalY: 50 },
    addImage: vi.fn(),
  }
}

vi.mock('jspdf', () => ({
  jsPDF: function MockJsPDF() { return mockDoc },
}))
vi.mock('jspdf-autotable', () => ({ applyPlugin: vi.fn() }))

/* ── Test data ── */

const testPhases = [
  {
    number: 1,
    id: 'phase-1',
    title: 'Foundation',
    categories: [
      {
        name: 'Audit',
        id: 'audit',
        items: [
          { id: 'p1-c1-i1', text: 'Audit site', detail: 'Full audit' },
          { id: 'p1-c1-i2', text: 'Check schema', detail: 'Schema check' },
        ],
      },
    ],
  },
  {
    number: 2,
    id: 'phase-2',
    title: 'Schema',
    categories: [
      {
        name: 'Markup',
        id: 'markup',
        items: [
          { id: 'p2-c1-i1', text: 'Add JSON-LD', detail: 'JSON-LD markup' },
        ],
      },
    ],
  },
]

const testProject = {
  name: 'Test Project',
  url: 'https://example.com',
  checked: { 'p1-c1-i1': true },
  notes: { 'p1-c1-i1': 'Done via Claude' },
  verifications: { 'p1-c1-i1': { method: 'ai' } },
  analyzerResults: {
    score: 85,
    summary: 'Good overall performance.',
    categories: [
      { name: 'Schema', items: [{ name: 'JSON-LD present', status: 'pass' }] },
    ],
  },
  competitors: [
    { name: 'Competitor A', url: 'https://a.com', aeoScore: 72, mentions: 15, citationShare: 35, isOwn: false },
    { name: 'My Site', url: 'https://example.com', aeoScore: 85, mentions: 20, citationShare: 45, isOwn: true },
  ],
  competitorAnalysis: { aiSummary: 'You are leading in citation share.' },
  metricsHistory: [
    { timestamp: 1700000000000, overallScore: 70, citations: { total: 10, totalPrompts: 50, byEngine: [{ engine: 'ChatGPT', citations: 6 }] } },
    { timestamp: 1700100000000, overallScore: 80, citations: { total: 15, totalPrompts: 60, byEngine: [{ engine: 'ChatGPT', citations: 10 }] } },
  ],
  contentCalendar: [
    { id: 'cc1', title: 'Blog Post A', scheduledDate: '2026-03-01', status: 'published', pageUrl: 'https://example.com/blog-a' },
    { id: 'cc2', title: 'Guide B', scheduledDate: '2026-03-15', status: 'scheduled', pageUrl: null },
  ],
}

const allSections = {
  summary: true, phases: true, completed: true, remaining: true,
  notes: true, analyzer: true, competitors: true, metrics: true, contentCalendar: true,
}

const noSections = {
  summary: false, phases: false, completed: false, remaining: false,
  notes: false, analyzer: false, competitors: false, metrics: false, contentCalendar: false,
}

/* ── Import under test (after mocks) ── */

let generatePdf
beforeEach(async () => {
  mockDoc = createMockDoc()
  savedFilename = ''
  const mod = await import('../generatePdf')
  generatePdf = mod.generatePdf
})

/* ── Tests ── */

describe('generatePdf', () => {
  it('calls save with correct filename pattern', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: noSections, agencyName: 'Acme', reportDate: 'Jan 1, 2026' })
    expect(savedFilename).toMatch(/^AEO-Report-Test-Project-\d{4}-\d{2}-\d{2}\.pdf$/)
  })

  it('falls back to "Project" when name is empty', async () => {
    await generatePdf({ project: { name: '' }, phases: testPhases, sections: noSections, agencyName: '', reportDate: '' })
    expect(savedFilename).toMatch(/^AEO-Report-Project-/)
  })

  it('renders cover page with project name', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: noSections, agencyName: 'Acme', reportDate: 'Jan 1, 2026' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls).toContain('Acme')
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Test Project'))).toBe(true)
  })

  it('renders overall progress score on cover page', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: noSections, agencyName: '', reportDate: '' })
    // 1 of 3 items checked = 33%
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls).toContain('33%')
    expect(textCalls.some(t => typeof t === 'string' && t.includes('1 of 3'))).toBe(true)
  })

  it('renders summary section when enabled', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: { ...noSections, summary: true }, agencyName: '', reportDate: '' })
    expect(mockDoc.addPage).toHaveBeenCalled()
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Executive Summary'))).toBe(true)
    expect(mockDoc.autoTable).toHaveBeenCalled()
  })

  it('skips summary when disabled', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: noSections, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.every(t => typeof t !== 'string' || !t.includes('Executive Summary'))).toBe(true)
  })

  it('renders phase detail pages when phases enabled', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: { ...noSections, phases: true, completed: true, remaining: true }, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Phase 1: Foundation'))).toBe(true)
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Phase 2: Schema'))).toBe(true)
  })

  it('renders analyzer results when enabled and data exists', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: { ...noSections, analyzer: true }, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Analyzer Results'))).toBe(true)
    expect(textCalls).toContain('85/100')
  })

  it('skips analyzer when no analyzerResults', async () => {
    const proj = { ...testProject, analyzerResults: null }
    await generatePdf({ project: proj, phases: testPhases, sections: { ...noSections, analyzer: true }, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.every(t => typeof t !== 'string' || !t.includes('Analyzer Results'))).toBe(true)
  })

  it('renders competitors section when enabled', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: { ...noSections, competitors: true }, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Competitor Analysis'))).toBe(true)
    // autoTable called for competitors rankings
    expect(mockDoc.autoTable).toHaveBeenCalled()
  })

  it('skips competitors when no data', async () => {
    const proj = { ...testProject, competitors: [] }
    await generatePdf({ project: proj, phases: testPhases, sections: { ...noSections, competitors: true }, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.every(t => typeof t !== 'string' || !t.includes('Competitor Analysis'))).toBe(true)
  })

  it('renders metrics section when enabled', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: { ...noSections, metrics: true }, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Performance Metrics'))).toBe(true)
    // Shows latest score
    expect(textCalls).toContain('80')
  })

  it('renders content calendar section when enabled', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: { ...noSections, contentCalendar: true }, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Content Calendar'))).toBe(true)
    expect(mockDoc.autoTable).toHaveBeenCalled()
  })

  it('applies custom accent color', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: noSections, agencyName: '', reportDate: '', accentColor: '#0000FF' })
    // Cover page accent line should use parsed color [0, 0, 255]
    expect(mockDoc.setFillColor).toHaveBeenCalledWith(0, 0, 255)
  })

  it('adds logo when logoDataUrl is provided', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: noSections, agencyName: '', reportDate: '', logoDataUrl: 'data:image/png;base64,abc123' })
    expect(mockDoc.addImage).toHaveBeenCalledWith('data:image/png;base64,abc123', 'AUTO', 20, 25, 28, 28)
  })

  it('handles empty project gracefully', async () => {
    await generatePdf({ project: {}, phases: testPhases, sections: allSections, agencyName: '', reportDate: '' })
    expect(savedFilename).toMatch(/^AEO-Report-Project-/)
    expect(mockDoc.save).toHaveBeenCalledTimes(1)
  })

  it('handles all sections disabled — only cover page', async () => {
    const addPageBefore = mockDoc.addPage.mock.calls.length
    await generatePdf({ project: testProject, phases: testPhases, sections: noSections, agencyName: '', reportDate: '' })
    // No addPage calls (only cover page, which is the default first page)
    expect(mockDoc.addPage.mock.calls.length - addPageBefore).toBe(0)
    expect(mockDoc.save).toHaveBeenCalledTimes(1)
  })

  it('renders trend indicator for metrics with 2+ entries', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: { ...noSections, metrics: true }, agencyName: '', reportDate: '' })
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    // +10 difference between scores 70 → 80
    expect(textCalls.some(t => typeof t === 'string' && t.includes('+10'))).toBe(true)
  })

  it('includes notes when section enabled', async () => {
    await generatePdf({ project: testProject, phases: testPhases, sections: { ...noSections, phases: true, completed: true, remaining: true, notes: true }, agencyName: '', reportDate: '' })
    // splitTextToSize should be called with a note
    const splitCalls = mockDoc.splitTextToSize.mock.calls.map(c => c[0])
    expect(splitCalls.some(t => typeof t === 'string' && t.includes('Done via Claude'))).toBe(true)
  })
})
