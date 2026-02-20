import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default memo(function StatCard({ label, value, trend, icon, iconColor }) {
  const { t } = useTranslation('app')
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: '2.125rem', height: '2.125rem', borderRadius: '0.5625rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: iconColor + '18', color: iconColor,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)' }}>
        {value}
      </div>
      {trend !== null && trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
          {trend > 0 ? (
            <TrendingUp size={12} style={{ color: 'var(--color-success)' }} />
          ) : trend < 0 ? (
            <TrendingDown size={12} style={{ color: 'var(--color-error)' }} />
          ) : (
            <Minus size={12} style={{ color: 'var(--text-tertiary)' }} />
          )}
          <span style={{
            fontSize: '0.6875rem', fontWeight: 500,
            color: trend > 0 ? 'var(--color-success)' : trend < 0 ? 'var(--color-error)' : 'var(--text-tertiary)',
          }}>
            {trend > 0 ? '+' : ''}{trend}% {t('dashboard.statCard.vsLastPeriod')}
          </span>
        </div>
      )}
    </div>
  )
})
