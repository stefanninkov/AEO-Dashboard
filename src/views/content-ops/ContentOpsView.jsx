import { useState, useMemo } from 'react'
import { CalendarDays, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CalendarView from './CalendarView'
import BriefView from './BriefView'

export default function ContentOpsView({ activeProject, updateProject, user, phases, toggleCheckItem }) {
  const { t } = useTranslation('app')
  const [activeTab, setActiveTab] = useState('calendar') // 'calendar' | 'briefs'

  const calendarCount = (activeProject?.contentCalendar || []).length
  const briefCount = (activeProject?.contentBriefs || []).length

  return (
    <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700,
          color: 'var(--text-primary)', margin: 0,
        }}>
          {t('contentOps.title')}
        </h1>
        <p style={{
          fontSize: '0.8125rem', color: 'var(--text-secondary)',
          margin: '0.25rem 0 0', lineHeight: 1.5,
        }}>
          {t('contentOps.subtitle')}
        </p>
      </div>

      {/* Tab row */}
      <div style={{
        display: 'flex', gap: '0.375rem', marginBottom: '1.25rem',
        padding: '0.25rem',
        background: 'var(--hover-bg)',
        borderRadius: '0.625rem',
        width: 'fit-content',
      }}>
        <button
          onClick={() => setActiveTab('calendar')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4375rem 0.875rem', border: 'none', borderRadius: '0.5rem',
            cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
            fontWeight: 600, transition: 'background 150ms, color 150ms',
            background: activeTab === 'calendar' ? 'var(--color-phase-1)' : 'transparent',
            color: activeTab === 'calendar' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          <CalendarDays size={14} />
          {t('contentOps.tabCalendar')}
          {calendarCount > 0 && (
            <span style={{
              fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
              padding: '0.0625rem 0.375rem', borderRadius: '0.625rem', marginLeft: '0.125rem',
              background: activeTab === 'calendar' ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)',
              color: activeTab === 'calendar' ? '#fff' : 'var(--text-tertiary)',
            }}>
              {calendarCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('briefs')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4375rem 0.875rem', border: 'none', borderRadius: '0.5rem',
            cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
            fontWeight: 600, transition: 'background 150ms, color 150ms',
            background: activeTab === 'briefs' ? 'var(--color-phase-1)' : 'transparent',
            color: activeTab === 'briefs' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          <FileText size={14} />
          {t('contentOps.tabBriefs')}
          {briefCount > 0 && (
            <span style={{
              fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
              padding: '0.0625rem 0.375rem', borderRadius: '0.625rem', marginLeft: '0.125rem',
              background: activeTab === 'briefs' ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)',
              color: activeTab === 'briefs' ? '#fff' : 'var(--text-tertiary)',
            }}>
              {briefCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'calendar' && (
        <CalendarView
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
          phases={phases}
          toggleCheckItem={toggleCheckItem}
        />
      )}

      {activeTab === 'briefs' && (
        <BriefView
          activeProject={activeProject}
          updateProject={updateProject}
          user={user}
        />
      )}
    </div>
  )
}
