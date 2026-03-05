import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2, XCircle, MinusCircle, ExternalLink, Wrench,
  Globe, Loader2, Shield, Smartphone, FileCode, Languages,
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

/* ── Core Web Vitals via PageSpeed Insights API ── */
function CoreWebVitals({ url }) {
  const { t } = useTranslation('app')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const fetchCWV = async () => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) })
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const json = await res.json()

      const metrics = json.lighthouseResult?.audits
      const categories = json.lighthouseResult?.categories

      setData({
        performanceScore: Math.round((categories?.performance?.score || 0) * 100),
        lcp: metrics?.['largest-contentful-paint']?.displayValue || 'N/A',
        fid: metrics?.['max-potential-fid']?.displayValue || metrics?.['total-blocking-time']?.displayValue || 'N/A',
        cls: metrics?.['cumulative-layout-shift']?.displayValue || 'N/A',
        tbt: metrics?.['total-blocking-time']?.displayValue || 'N/A',
        fcp: metrics?.['first-contentful-paint']?.displayValue || 'N/A',
        si: metrics?.['speed-index']?.displayValue || 'N/A',
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch Core Web Vitals')
    }
    setLoading(false)
  }

  if (!data && !loading && !error) {
    return (
      <div style={{
        padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', textAlign: 'center',
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          {t('seo.technical.coreWebVitals')}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
          {t('seo.technical.cwvDesc')}
        </p>
        <button onClick={fetchCWV} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
          {t('seo.technical.runCWV')}
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        padding: '2rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', textAlign: 'center',
      }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--accent)' }} />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{t('seo.technical.cwvLoading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {t('seo.technical.coreWebVitals')}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-error)' }}>{error}</p>
        <button onClick={fetchCWV} className="btn-secondary" style={{ marginTop: '0.75rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
          {t('actions.retry')}
        </button>
      </div>
    )
  }

  const scoreColor = data.performanceScore >= 90 ? 'var(--color-success)' : data.performanceScore >= 50 ? 'var(--color-warning)' : 'var(--color-error)'

  const metrics = [
    { label: 'LCP', value: data.lcp, desc: 'Largest Contentful Paint' },
    { label: 'TBT', value: data.tbt, desc: 'Total Blocking Time' },
    { label: 'CLS', value: data.cls, desc: 'Cumulative Layout Shift' },
    { label: 'FCP', value: data.fcp, desc: 'First Contentful Paint' },
    { label: 'SI', value: data.si, desc: 'Speed Index' },
  ]

  return (
    <div style={{
      padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: '3rem', height: '3rem', borderRadius: '50%', border: `3px solid ${scoreColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.875rem', color: scoreColor }}>
            {data.performanceScore}
          </span>
        </div>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('seo.technical.coreWebVitals')}
          </h3>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Mobile Performance (PageSpeed Insights)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: '0.75rem' }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            padding: '0.625rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)',
            border: '0.0625rem solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {m.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TechnicalSeoTab({ analyzer }) {
  const { t } = useTranslation('app')
  const { lastScan } = analyzer

  if (!lastScan) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-tertiary)' }}>
        <Wrench size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {t('seo.noScans')}
        </h3>
        <p style={{ fontSize: '0.875rem' }}>{t('seo.runAuditFirst')}</p>
      </div>
    )
  }

  const seoScore = lastScan.seoScore
  const urlTechChecks = seoScore?.checks?.filter(c => c.category === 'URL & Technical') || []
  const socialChecks = seoScore?.checks?.filter(c => c.category === 'Social & Sharing') || []

  // AEO cross-reference data
  const aeoScore = lastScan.aeoScore
  const aeoTechChecks = aeoScore?.checks?.filter(c => c.category === 'Technical') || []
  const aeoDiscoverChecks = aeoScore?.checks?.filter(c => c.category === 'AI Discoverability') || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 0' }}>
      {/* SEO-specific technical checks */}
      <div style={{
        padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} style={{ color: 'var(--accent)' }} />
          {t('seo.technical.urlTechnical')}
        </h3>
        {urlTechChecks.map((check, i) => <CheckRow key={i} check={check} />)}
      </div>

      {/* Social & Sharing */}
      <div style={{
        padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={16} style={{ color: 'var(--accent)' }} />
          {t('seo.technical.socialSharing')}
        </h3>
        {socialChecks.map((check, i) => <CheckRow key={i} check={check} />)}
      </div>

      {/* Core Web Vitals */}
      <CoreWebVitals url={lastScan.url} />

      {/* AEO Cross-reference */}
      {(aeoTechChecks.length > 0 || aeoDiscoverChecks.length > 0) && (
        <div style={{
          padding: '1.25rem', background: 'color-mix(in srgb, var(--accent) 4%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--accent) 12%, transparent)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ExternalLink size={16} style={{ color: 'var(--accent)' }} />
            {t('seo.coveredInAeo')}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
            {t('seo.coveredInAeoDesc')}
          </p>
          {[...aeoTechChecks, ...aeoDiscoverChecks].map((check, i) => <CheckRow key={i} check={check} />)}
        </div>
      )}
    </div>
  )
}
