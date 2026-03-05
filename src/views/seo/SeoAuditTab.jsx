import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Globe, Loader2, AlertCircle, CheckCircle2, XCircle, MinusCircle,
  TrendingUp, Zap, ExternalLink,
} from 'lucide-react'

/* ── Score Ring ── */
function ScoreRing({ score, label, size = 'lg' }) {
  const color = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
  const isLg = size === 'lg'
  const dim = isLg ? '5rem' : '3.5rem'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: dim, height: dim, borderRadius: '50%', border: `3px solid ${color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: isLg ? '1.5rem' : '1rem', color, lineHeight: 1 }}>
          {score}
        </span>
        {isLg && <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>/100</span>}
      </div>
      {label && <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>}
    </div>
  )
}

/* ── Category Bar ── */
function CategoryBar({ name, score, maxScore }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const color = pct >= 70 ? 'var(--color-success)' : pct >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '10rem', flexShrink: 0 }}>{name}</span>
      <div style={{ flex: 1, height: '0.375rem', background: 'var(--border-subtle)', borderRadius: '0.25rem', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '0.25rem', transition: 'width 500ms ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, fontWeight: 600, width: '2.5rem', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

/* ── Check Item Row ── */
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
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem', lineHeight: 1.4 }}>
            {check.detail}
          </p>
        )}
      </div>
    </div>
  )
}

export default function SeoAuditTab({ analyzer, activeProject }) {
  const { t } = useTranslation('app')
  const [urlInput, setUrlInput] = useState(analyzer.lastScanUrl || activeProject?.url || '')
  const { scanning, error, lastScan, auditHistory, scanUrl } = analyzer

  const handleScan = async () => {
    if (!urlInput.trim() || scanning) return
    await scanUrl(urlInput.trim())
  }

  const seoScore = lastScan?.seoScore
  const aeoScore = lastScan?.aeoScore

  // Priority issues = failing checks sorted by maxPoints (highest impact first)
  const priorityIssues = seoScore?.checks
    ?.filter(c => c.status === 'fail')
    ?.sort((a, b) => b.maxPoints - a.maxPoints)
    ?.slice(0, 10) || []

  // Quick wins = partial checks that could become passes easily (lowest maxPoints = easy wins)
  const quickWins = seoScore?.checks
    ?.filter(c => c.status === 'partial')
    ?.sort((a, b) => a.maxPoints - b.maxPoints)
    ?.slice(0, 5) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 0' }}>
      {/* URL Input */}
      <div style={{
        display: 'flex', gap: '0.75rem', alignItems: 'center',
        padding: '1rem 1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <Globe size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          type="url"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScan()}
          placeholder={t('seo.scanUrl')}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: '0.875rem', color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
          }}
        />
        <button
          onClick={handleScan}
          disabled={scanning || !urlInput.trim()}
          className="btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          {scanning ? t('seo.scanning') : t('seo.runAudit')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--color-error) 20%, transparent)',
          borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: '0.8125rem',
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* No scans yet */}
      {!lastScan && !scanning && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          color: 'var(--text-tertiary)',
        }}>
          <Globe size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {t('seo.noScans')}
          </h3>
          <p style={{ fontSize: '0.875rem', maxWidth: '24rem', margin: '0 auto' }}>
            {t('seo.noScansDesc')}
          </p>
        </div>
      )}

      {/* Results */}
      {seoScore && (
        <>
          {/* Score Rings */}
          <div style={{
            display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'flex-end',
            padding: '1.5rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <ScoreRing score={seoScore.overallScore} label={t('seo.seoScore')} />
            {aeoScore && <ScoreRing score={aeoScore.overallScore} label={t('seo.aeoScore')} size="sm" />}
            <div style={{ flex: 1, maxWidth: '20rem' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                {lastScan.url}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                {new Date(lastScan.timestamp).toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{seoScore.checks.filter(c => c.status === 'pass').length}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}> {t('seo.passed')}</span>
                </span>
                <span style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{seoScore.checks.filter(c => c.status === 'partial').length}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}> {t('seo.partial')}</span>
                </span>
                <span style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>{seoScore.checks.filter(c => c.status === 'fail').length}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}> {t('seo.failed')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{
            padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '0.625rem',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {t('seo.categoryBreakdown')}
            </h3>
            {Object.entries(seoScore.categories).map(([name, cat]) => (
              <CategoryBar key={name} name={name} score={cat.score} maxScore={cat.maxScore} />
            ))}
          </div>

          {/* AEO Cross-reference */}
          {aeoScore && (
            <div style={{
              padding: '1rem 1.25rem', background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
              border: '0.0625rem solid color-mix(in srgb, var(--accent) 15%, transparent)',
              borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <ExternalLink size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {t('seo.aeoReference')}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
                  {t('seo.aeoReferenceDesc')}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)', fontSize: '0.875rem' }}>
                {aeoScore.overallScore}/100
              </span>
            </div>
          )}

          {/* Priority Issues */}
          {priorityIssues.length > 0 && (
            <div style={{
              padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} style={{ color: 'var(--color-error)' }} />
                {t('seo.priorityIssues')} ({priorityIssues.length})
              </h3>
              {priorityIssues.map((check, i) => <CheckRow key={i} check={check} />)}
            </div>
          )}

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <div style={{
              padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} style={{ color: 'var(--color-warning)' }} />
                {t('seo.quickWins')} ({quickWins.length})
              </h3>
              {quickWins.map((check, i) => <CheckRow key={i} check={check} />)}
            </div>
          )}

          {/* Score History */}
          {auditHistory.length > 1 && (
            <div style={{
              padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {t('seo.scoreHistory')}
              </h3>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'flex-end', height: '3rem' }}>
                {auditHistory.slice(-20).map((entry, i) => {
                  const h = Math.max(4, (entry.overall / 100) * 48)
                  const color = entry.overall >= 70 ? 'var(--color-success)' : entry.overall >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
                  return (
                    <div
                      key={i}
                      title={`${entry.overall}/100 — ${new Date(entry.timestamp).toLocaleDateString()}`}
                      style={{
                        flex: 1, height: `${h}px`, background: color, borderRadius: '0.125rem',
                        opacity: i === auditHistory.slice(-20).length - 1 ? 1 : 0.5,
                        transition: 'height 300ms ease',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
