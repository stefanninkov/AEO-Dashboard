import { useState } from 'react'
import { Search, BookOpen, ChevronRight } from 'lucide-react'

export default function DocsView({ phases, setDocItem }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)

  const allDocs = phases.flatMap(phase =>
    phase.categories.flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        phaseId: phase.id,
        phaseNumber: phase.number,
        phaseTitle: phase.title,
        phaseColor: phase.color,
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-[15px] font-bold tracking-[-0.3px] text-text-primary mb-1">Documentation</h2>
        <p className="text-[13px] text-text-secondary">Comprehensive guides for every AEO task. Search or browse by phase.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? 'text-phase-3' : 'text-text-disabled'}`} />
        <input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-[13px] text-text-primary placeholder-text-disabled outline-none transition-colors duration-150"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
        />
      </div>

      {/* Phase Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPhase(null)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 ${
            !selectedPhase ? 'bg-phase-1 text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
          style={selectedPhase ? { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' } : {}}
        >
          All Phases
        </button>
        {phases.map(phase => (
          <button
            key={phase.id}
            onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 ${
              selectedPhase === phase.id
                ? 'text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            style={selectedPhase === phase.id ? { backgroundColor: phase.color } : { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            {phase.icon} Phase {phase.number}
          </button>
        ))}
      </div>

      {/* Doc count */}
      <p className="text-[11px] text-text-tertiary">
        Showing {filteredDocs.length} of {allDocs.length} documents
      </p>

      {/* Doc List */}
      <div className="space-y-2">
        {filteredDocs.map((doc, idx) => (
          <button
            key={doc.id}
            onClick={() => setDocItem(doc)}
            className="w-full text-left rounded-xl p-4 transition-all duration-200 group fade-in-up"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', animationDelay: `${Math.min(idx * 30, 600)}ms` }}
          >
            <div className="flex items-start gap-3">
              <BookOpen size={14} className="text-text-tertiary group-hover:text-phase-3 transition-colors flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-heading font-bold px-1.5 py-0.5 rounded"
                    style={{ color: doc.phaseColor, backgroundColor: doc.phaseColor + '12' }}
                  >
                    P{doc.phaseNumber}
                  </span>
                  <span className="text-[11px] text-text-tertiary">{doc.categoryName}</span>
                </div>
                <p className="text-[13px] font-medium text-text-primary">{doc.doc.title}</p>
                <p className="text-[11px] text-text-tertiary mt-1 truncate">{doc.detail}</p>
                <p className="text-[11px] text-text-tertiary mt-1">{doc.doc.sections.length} sections</p>
              </div>
              <ChevronRight size={14} className="text-text-disabled group-hover:text-text-tertiary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 rounded-xl fade-in-up" style={{ border: '1px dashed var(--border-default)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--hover-bg)' }}>
            <BookOpen size={20} className="text-text-tertiary" />
          </div>
          <h3 className="font-heading text-[13px] font-bold mb-1 text-text-primary">No documentation found</h3>
          <p className="text-[12px] text-text-tertiary text-center max-w-xs">Try adjusting your search or phase filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  )
}
