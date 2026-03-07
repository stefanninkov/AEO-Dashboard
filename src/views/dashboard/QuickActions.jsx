import { memo } from 'react'
import { BookOpen, Sparkles, FlaskConical } from 'lucide-react'

export default memo(function QuickActions({ setActiveView }) {
return (
    <div className="quick-actions-grid stagger-grid">
      <button className="quick-action-card" onClick={() => setActiveView('checklist')}>
        <BookOpen size={24} className="text-phase-3" style={{ margin: '0 auto var(--space-2)' }} />
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{'AEO Guide'}</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{'Step-by-step optimization checklist'}</p>
      </button>
      <button className="quick-action-card" onClick={() => setActiveView('analyzer')}>
        <Sparkles size={24} className="text-phase-1" style={{ margin: '0 auto var(--space-2)' }} />
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{'Run Analyzer'}</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{'Analyze your site for AEO readiness'}</p>
      </button>
      <button className="quick-action-card" onClick={() => setActiveView('testing')}>
        <FlaskConical size={24} className="text-phase-5" style={{ margin: '0 auto var(--space-2)' }} />
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{'Start Testing'}</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{'Test queries across AI engines'}</p>
      </button>
    </div>
  )
})
