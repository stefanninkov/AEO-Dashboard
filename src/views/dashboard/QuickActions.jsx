import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Zap, FlaskConical } from 'lucide-react'

export default memo(function QuickActions({ setActiveView }) {
  const { t } = useTranslation('app')
  return (
    <div className="quick-actions-grid">
      <button className="quick-action-card" onClick={() => setActiveView('checklist')}>
        <BookOpen size={24} className="text-phase-3" style={{ margin: '0 auto 0.625rem' }} />
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t('dashboard.quickActions.aeoGuide')}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('dashboard.quickActions.aeoGuideDesc')}</p>
      </button>
      <button className="quick-action-card" onClick={() => setActiveView('analyzer')}>
        <Zap size={24} className="text-phase-1" style={{ margin: '0 auto 0.625rem' }} />
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t('dashboard.quickActions.runAnalyzer')}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('dashboard.quickActions.runAnalyzerDesc')}</p>
      </button>
      <button className="quick-action-card" onClick={() => setActiveView('testing')}>
        <FlaskConical size={24} className="text-phase-5" style={{ margin: '0 auto 0.625rem' }} />
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t('dashboard.quickActions.startTesting')}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('dashboard.quickActions.startTestingDesc')}</p>
      </button>
    </div>
  )
})
