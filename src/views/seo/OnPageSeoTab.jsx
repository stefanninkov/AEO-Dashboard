import { useTranslation } from 'react-i18next'
import {
  CheckCircle2, XCircle, MinusCircle, ExternalLink, FileSearch,
} from 'lucide-react'

function CheckRow({ check }) {
  const icon = check.status === 'pass' ? <CheckCircle2 size={14} /> : check.status === 'fail' ? <XCircle size={14} /> : <MinusCircle size={14} />
  const color = check.status === 'pass' ? 'var(--color-success)' : check.status === 'fail' ? 'var(--color-error)' : 'var(--color-warning)'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
      <span style={{ color, flexShrink: 0, marginTop: '0.0625rem' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{check.item}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, fontWeight: 600 }}>
            {check.points}/{check.maxPoints}
          </span>
        </div>
        {check.detail && (
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem', lineHeight: 1.4 }}>{check.detail}</p>
        )}
      </div>
    </div>
  )
}

function CategorySection({ title, checks }) {
  if (!checks || checks.length === 0) return null
  const score = checks.reduce((s, c) => s + c.points, 0)
  const maxScore = checks.reduce((s, c) => s + c.maxPoints, 0)
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const color = pct >= 70 ? 'var(--color-success)' : pct >= 40 ? 'var(--color-warning)' : 'var(--color-error)'

  return (
    <div style={{
      padding: '1.25rem', background: 'var(--bg-card)',
      border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color }}>{pct}%</span>
      </div>
      {checks.map((check, i) => <CheckRow key={i} check={check} />)}
    </div>
  )
}

export default function OnPageSeoTab({ analyzer }) {
  const { t } = useTranslation('app')
  const { lastScan } = analyzer

  if (!lastScan) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-tertiary)' }}>
        <FileSearch size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('seo.noScans')}
        </h3>
        <p style={{ fontSize: '0.875rem' }}>{t('seo.runAuditFirst')}</p>
      </div>
    )
  }

  const seoScore = lastScan.seoScore
  const checks = seoScore?.checks || []

  // Group by category
  const keywordChecks = checks.filter(c => c.category === 'Keyword Optimization')
  const readabilityChecks = checks.filter(c => c.category === 'Readability & UX')
  const imageChecks = checks.filter(c => c.category === 'Image Optimization')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 0' }}>
      {/* AEO note */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1rem', background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
        border: '0.0625rem solid color-mix(in srgb, var(--accent) 15%, transparent)',
        borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)',
      }}>
        <ExternalLink size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        {t('seo.aeoNote')}
      </div>

      {/* Target Keyword */}
      {seoScore.targetKeyword && (
        <div style={{
          padding: '0.75rem 1rem', background: 'var(--bg-card)',
          border: '0.0625rem solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('seo.targetKeyword')}:</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600,
            color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)',
          }}>
            {seoScore.targetKeyword}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
            ({t('seo.autoDetected')})
          </span>
        </div>
      )}

      <CategorySection title={t('seo.onPage.keywordOptimization')} checks={keywordChecks} />
      <CategorySection title={t('seo.onPage.readability')} checks={readabilityChecks} />
      <CategorySection title={t('seo.onPage.imageOptimization')} checks={imageChecks} />
    </div>
  )
}
