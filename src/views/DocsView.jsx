import { useState } from 'react'
import { Search, BookOpen, ChevronRight } from 'lucide-react'

export default function DocsView({ phases, setDocItem }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhase, setSelectedPhase] = useState(null)

  const allDocs = phases.flatMap(phase =>
    phase.categories.flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        phaseId: phase.id,
        phaseNumber: phase.number,
        phaseTitle: phase.title,
        phaseColor: phase.color,
        phaseIcon: phase.icon,
        categoryName: cat.name,
      }))
    )
  )

  const filteredDocs = allDocs.filter(doc => {
    const matchesSearch = !searchQuery.trim() ||
      doc.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.doc.sections.some(s =>
        s.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.body.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesPhase = !selectedPhase || doc.phaseId === selectedPhase
    return matchesSearch && matchesPhase
  })

  /* Group filtered docs by phase */
  const groupedByPhase = phases
    .map(phase => ({
      ...phase,
      docs: filteredDocs.filter(d => d.phaseId === phase.id),
    }))
    .filter(group => group.docs.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.3px] text-text-primary mb-1">Documentation</h2>
        <p className="text-[0.8125rem] text-text-secondary">Comprehensive guides for every AEO task. Search or browse by phase.</p>
      </div>

      {/* Search */}
      <div className="docs-search-wrap">
        <Search size={14} className="docs-search-icon" />
        <input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="docs-search-input"
        />
      </div>

      {/* Phase Filter */}
      <div className="docs-filter-bar">
        <button
          onClick={() => setSelectedPhase(null)}
          className={`docs-filter-pill${!selectedPhase ? ' active' : ''}`}
          style={!selectedPhase ? { backgroundColor: 'var(--color-phase-1)' } : undefined}
        >
          All Phases
        </button>
        {phases.map(phase => (
          <button
            key={phase.id}
            onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
            className={`docs-filter-pill${selectedPhase === phase.id ? ' active' : ''}`}
            style={selectedPhase === phase.id ? { backgroundColor: phase.color } : undefined}
          >
            {phase.icon} Phase {phase.number}
          </button>
        ))}
      </div>

      {/* Doc count */}
      <p className="docs-count">
        Showing {filteredDocs.length} of {allDocs.length} documents
      </p>

      {/* Doc List - grouped by phase */}
      {groupedByPhase.map(phase => (
        <div key={phase.id} className="docs-phase-group">
          <div className="docs-phase-header">
            <span className="docs-phase-icon">{phase.icon}</span>
            <span className="docs-phase-label">Phase {phase.number}: {phase.title}</span>
            <span className="docs-phase-count">{phase.docs.length} {phase.docs.length === 1 ? 'doc' : 'docs'}</span>
          </div>
          {phase.docs.map(doc => (
            <button
              key={doc.id}
              onClick={() => setDocItem(doc)}
              className="docs-item"
            >
              <BookOpen size={14} className="docs-item-icon" />
              <div className="docs-item-content">
                <div className="docs-item-meta">
                  <span
                    className="docs-item-badge"
                    style={{ color: doc.phaseColor, backgroundColor: doc.phaseColor + '12' }}
                  >
                    P{doc.phaseNumber}
                  </span>
                  <span className="docs-item-category">{doc.categoryName}</span>
                </div>
                <div className="docs-item-title">{doc.doc.title}</div>
                <div className="docs-item-desc">{doc.detail}</div>
              </div>
              <ChevronRight size={14} className="docs-item-arrow" />
            </button>
          ))}
        </div>
      ))}

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="docs-empty">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--hover-bg)' }}>
            <BookOpen size={20} className="text-text-tertiary" />
          </div>
          <h3 className="font-heading text-[0.8125rem] font-bold mb-1 text-text-primary">No documentation found</h3>
          <p className="text-[0.75rem] text-text-tertiary text-center max-w-xs">Try adjusting your search or phase filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  )
}
