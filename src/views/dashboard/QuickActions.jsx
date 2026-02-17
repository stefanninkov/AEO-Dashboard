import { memo } from 'react'
import { CheckSquare, Zap, FlaskConical } from 'lucide-react'

export default memo(function QuickActions({ setActiveView }) {
  return (
    <div className="quick-actions-grid">
      <button className="quick-action-card" onClick={() => setActiveView('checklist')}>
        <CheckSquare size={24} className="text-phase-3" style={{ margin: '0 auto 0.625rem' }} />
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Open Checklist</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Track your AEO tasks</p>
      </button>
      <button className="quick-action-card" onClick={() => setActiveView('analyzer')}>
        <Zap size={24} className="text-phase-1" style={{ margin: '0 auto 0.625rem' }} />
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Run Analyzer</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Scan your site for AEO</p>
      </button>
      <button className="quick-action-card" onClick={() => setActiveView('testing')}>
        <FlaskConical size={24} className="text-phase-5" style={{ margin: '0 auto 0.625rem' }} />
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Start Testing</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Test across AI platforms</p>
      </button>
    </div>
  )
})
