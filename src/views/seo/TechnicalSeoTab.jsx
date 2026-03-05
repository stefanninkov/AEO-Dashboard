import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2, XCircle, MinusCircle, ExternalLink, Wrench,
  Globe, Loader2, Shield, Server, Zap, ChevronDown, ChevronUp, Lightbulb,
  Clock, ArrowRight, Lock, HardDrive,
} from 'lucide-react'

/* ── Check Item Row with expandable fix guidance ── */
function CheckRow({ check }) {
  const [expanded, setExpanded] = useState(false)
  const icon = check.status === 'pass' ? <CheckCircle2 size={14} /> : check.status === 'fail' ? <XCircle size={14} /> : <MinusCircle size={14} />
  const color = check.status === 'pass' ? 'var(--color-success)' : check.status === 'fail' ? 'var(--color-error)' : 'var(--color-warning)'
  const hasFix = check.status !== 'pass' && check.fix
  return (
    <div style={{ padding: '0.5rem 0', borderBottom: '0.0625rem solid var(--border-subtle)' }}>
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: hasFix ? 'pointer' : 'default' }}
        onClick={() => hasFix && setExpanded(prev => !prev)}
      >
        <span style={{ color, flexShrink: 0, marginTop: '0.0625rem' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{check.item}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {check.points != null && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color, fontWeight: 600 }}>
                  {check.points}/{check.maxPoints}
                </span>
              )}
              {hasFix && (
                expanded
                  ? <ChevronUp size={12} style={{ color: 'var(--text-tertiary)' }} />
                  : <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
          </div>
          {check.detail && (
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem', lineHeight: 1.4 }}>{check.detail}</p>
          )}
        </div>
      </div>
      {expanded && check.fix && (
        <div style={{
          marginTop: '0.5rem', marginLeft: '1.375rem', padding: '0.625rem 0.75rem',
          background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--accent) 12%, transparent)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <Lightbulb size={12} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)' }}>How to fix</span>
          </div>
          {Array.isArray(check.fix) ? (
            <ol style={{ margin: 0, paddingLeft: '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {check.fix.map((step, i) => (
                <li key={i} style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{check.fix}</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Server Response Data Section ── */
function ServerDataSection({ serverData, url }) {
  if (!serverData) return null

  const checks = []

  // Response time
  if (serverData.responseTime != null) {
    const fast = serverData.responseTime < 500
    const ok = serverData.responseTime < 1500
    checks.push({
      item: 'Server response time (TTFB)',
      status: fast ? 'pass' : ok ? 'partial' : 'fail',
      detail: `${serverData.responseTime}ms — ${fast ? 'Fast' : ok ? 'Could be faster' : 'Slow'}`,
      fix: !fast ? [
        `Your server responded in ${serverData.responseTime}ms. Aim for under 500ms.`,
        'Enable server-side caching (Redis, Memcached, or CDN edge caching).',
        'Use a CDN (Cloudflare, Fastly, AWS CloudFront) to serve content from edge locations.',
        'Optimize database queries and reduce server-side processing time.',
        'Consider upgrading your hosting plan or switching to a faster provider.',
      ] : null,
    })
  }

  // HTTP status
  if (serverData.status) {
    const isOk = serverData.status >= 200 && serverData.status < 300
    checks.push({
      item: 'HTTP status code',
      status: isOk ? 'pass' : 'fail',
      detail: `HTTP ${serverData.status}${serverData.redirected ? ' (redirected)' : ''}`,
      fix: !isOk ? [
        `Server returned HTTP ${serverData.status}.`,
        serverData.status === 301 || serverData.status === 302 ? 'Page redirects — this adds latency. Fix the link to point directly to the final URL.' : '',
        serverData.status === 404 ? 'Page not found — check the URL or set up a proper redirect.' : '',
        serverData.status >= 500 ? 'Server error — check your server logs and hosting provider.' : '',
      ].filter(Boolean) : null,
    })
  }

  // Redirect detection
  if (serverData.redirected) {
    checks.push({
      item: 'No redirect chain',
      status: 'partial',
      detail: `Page redirects from ${url} to ${serverData.finalUrl}`,
      fix: [
        'Your URL redirects to a different URL — this adds load time.',
        `Final URL: ${serverData.finalUrl}`,
        'Update internal links and sitemaps to use the final destination URL directly.',
        'If this is a HTTP→HTTPS redirect, that\'s normal but ensure all internal links use HTTPS.',
      ],
    })
  }

  // Compression
  if (serverData.contentEncoding) {
    checks.push({
      item: 'Compression enabled',
      status: 'pass',
      detail: `Using ${serverData.contentEncoding} compression`,
    })
  } else {
    checks.push({
      item: 'Compression enabled',
      status: 'fail',
      detail: 'No gzip/brotli compression detected',
      fix: [
        'Enable gzip or brotli compression on your server to reduce transfer size by 60-80%.',
        'Nginx: Add "gzip on; gzip_types text/html text/css application/javascript;" to your config.',
        'Apache: Enable mod_deflate and add compression rules to .htaccess.',
        'Most CDNs (Cloudflare, Vercel, Netlify) enable compression automatically.',
      ],
    })
  }

  // Cache control
  if (serverData.cacheControl) {
    const hasMaxAge = serverData.cacheControl.includes('max-age')
    const noStore = serverData.cacheControl.includes('no-store')
    checks.push({
      item: 'Cache-Control headers',
      status: hasMaxAge && !noStore ? 'pass' : noStore ? 'partial' : 'partial',
      detail: `Cache-Control: ${serverData.cacheControl}`,
      fix: !hasMaxAge || noStore ? [
        'Configure proper cache headers to speed up return visits.',
        'For static assets (JS, CSS, images): Cache-Control: public, max-age=31536000, immutable',
        'For HTML pages: Cache-Control: public, max-age=3600, s-maxage=86400',
        'If using a CDN, configure edge caching rules for optimal performance.',
      ] : null,
    })
  } else {
    checks.push({
      item: 'Cache-Control headers',
      status: 'fail',
      detail: 'No Cache-Control header detected',
      fix: [
        'No caching headers found — browsers will re-download resources on every visit.',
        'Add Cache-Control headers to your server responses.',
        'Nginx: add_header Cache-Control "public, max-age=3600";',
        'Apache: <IfModule mod_expires.c> ExpiresDefault "access plus 1 hour" </IfModule>',
        'This dramatically improves page load speed for returning visitors.',
      ],
    })
  }

  // HSTS
  if (serverData.hsts) {
    checks.push({
      item: 'HSTS (HTTP Strict Transport Security)',
      status: 'pass',
      detail: `HSTS enabled: ${serverData.hsts.substring(0, 60)}${serverData.hsts.length > 60 ? '...' : ''}`,
    })
  } else {
    checks.push({
      item: 'HSTS (HTTP Strict Transport Security)',
      status: 'partial',
      detail: 'No HSTS header — browsers could connect via insecure HTTP',
      fix: [
        'Add HSTS to force browsers to always use HTTPS.',
        'Nginx: add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
        'Apache: Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"',
        'Start with a short max-age (3600) to test, then increase to 31536000 (1 year).',
        'This prevents SSL stripping attacks and improves security posture.',
      ],
    })
  }

  // X-Frame-Options
  if (serverData.xFrameOptions) {
    checks.push({
      item: 'X-Frame-Options (clickjacking protection)',
      status: 'pass',
      detail: `X-Frame-Options: ${serverData.xFrameOptions}`,
    })
  }

  // Server header exposure
  if (serverData.server || serverData.xPoweredBy) {
    const exposed = [serverData.server, serverData.xPoweredBy].filter(Boolean).join(', ')
    checks.push({
      item: 'Server info exposure',
      status: 'partial',
      detail: `Server exposes: ${exposed}`,
      fix: [
        `Your server reveals: ${exposed}. This helps attackers target known vulnerabilities.`,
        'Hide server version info for better security.',
        'Nginx: server_tokens off;',
        'Apache: ServerTokens Prod / ServerSignature Off',
        'Remove X-Powered-By header: In Express.js, use app.disable("x-powered-by").',
      ],
    })
  }

  if (checks.length === 0) return null

  return (
    <div style={{
      padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Server size={16} style={{ color: 'var(--accent)' }} />
        Server & Performance
      </h3>
      <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
        Response data captured from your server. Some headers may be limited by CORS policies.
      </p>
      {checks.map((check, i) => <CheckRow key={i} check={check} />)}
    </div>
  )
}

/* ── Core Web Vitals via PageSpeed Insights API ── */
function CoreWebVitals({ url }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchCWV = async () => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) })
      if (res.status === 429) {
        setRetryCount(prev => prev + 1)
        throw new Error('RATE_LIMITED')
      }
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const json = await res.json()

      const metrics = json.lighthouseResult?.audits
      const categories = json.lighthouseResult?.categories

      // Extract detailed data with thresholds
      const lcpVal = metrics?.['largest-contentful-paint']?.numericValue
      const clsVal = metrics?.['cumulative-layout-shift']?.numericValue
      const tbtVal = metrics?.['total-blocking-time']?.numericValue
      const fcpVal = metrics?.['first-contentful-paint']?.numericValue
      const siVal = metrics?.['speed-index']?.numericValue

      setData({
        performanceScore: Math.round((categories?.performance?.score || 0) * 100),
        lcp: { display: metrics?.['largest-contentful-paint']?.displayValue || 'N/A', value: lcpVal, status: lcpVal <= 2500 ? 'good' : lcpVal <= 4000 ? 'needs-improvement' : 'poor' },
        cls: { display: metrics?.['cumulative-layout-shift']?.displayValue || 'N/A', value: clsVal, status: clsVal <= 0.1 ? 'good' : clsVal <= 0.25 ? 'needs-improvement' : 'poor' },
        tbt: { display: metrics?.['total-blocking-time']?.displayValue || 'N/A', value: tbtVal, status: tbtVal <= 200 ? 'good' : tbtVal <= 600 ? 'needs-improvement' : 'poor' },
        fcp: { display: metrics?.['first-contentful-paint']?.displayValue || 'N/A', value: fcpVal, status: fcpVal <= 1800 ? 'good' : fcpVal <= 3000 ? 'needs-improvement' : 'poor' },
        si: { display: metrics?.['speed-index']?.displayValue || 'N/A', value: siVal, status: siVal <= 3400 ? 'good' : siVal <= 5800 ? 'needs-improvement' : 'poor' },
      })
      setRetryCount(0)
    } catch (err) {
      if (err.message === 'RATE_LIMITED') {
        setError('RATE_LIMITED')
      } else {
        setError(err.message || 'Failed to fetch Core Web Vitals')
      }
    }
    setLoading(false)
  }

  const metricColor = (status) =>
    status === 'good' ? 'var(--color-success)' : status === 'needs-improvement' ? 'var(--color-warning)' : 'var(--color-error)'

  if (!data && !loading && !error) {
    return (
      <div style={{
        padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Zap size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Core Web Vitals
          </h3>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
          Analyze your page's real-world performance using Google's PageSpeed Insights API. Measures LCP, CLS, TBT, FCP and Speed Index on mobile.
        </p>
        <button onClick={fetchCWV} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Zap size={14} />
          Run Performance Test
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
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Running performance test...</p>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
          Google PageSpeed is analyzing your page. This takes 15-30 seconds.
        </p>
      </div>
    )
  }

  if (error) {
    const isRateLimit = error === 'RATE_LIMITED'
    return (
      <div style={{
        padding: '1.25rem', background: 'var(--bg-card)', border: '0.0625rem solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Zap size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Core Web Vitals</h3>
        </div>
        {isRateLimit ? (
          <>
            <div style={{
              padding: '0.75rem 1rem', background: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
              border: '0.0625rem solid color-mix(in srgb, var(--color-warning) 20%, transparent)',
              borderRadius: 'var(--radius-md)', marginBottom: '0.75rem',
            }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-warning)', fontWeight: 500, marginBottom: '0.25rem' }}>
                Google API rate limit reached (429)
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                The free PageSpeed Insights API limits requests. Wait 1-2 minutes before trying again, or test at{' '}
                <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                  pagespeed.web.dev
                </a> directly.
              </p>
            </div>
            <button onClick={fetchCWV} className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
              {t('actions.retry')} {retryCount > 0 ? `(attempt ${retryCount + 1})` : ''}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-error)', marginBottom: '0.75rem' }}>{error}</p>
            <button onClick={fetchCWV} className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
              {t('actions.retry')}
            </button>
          </>
        )}
      </div>
    )
  }

  const scoreColor = data.performanceScore >= 90 ? 'var(--color-success)' : data.performanceScore >= 50 ? 'var(--color-warning)' : 'var(--color-error)'

  const metrics = [
    { label: 'LCP', data: data.lcp, desc: 'Largest Contentful Paint', target: '≤ 2.5s',
      fix: data.lcp.status !== 'good' ? ['Optimize your largest visible element (usually hero image or heading).', 'Compress and serve images in WebP/AVIF format.', 'Use a CDN to reduce server response time.', 'Preload critical resources: <link rel="preload" href="hero.webp" as="image">.', 'Reduce render-blocking CSS and JavaScript.'] : null },
    { label: 'TBT', data: data.tbt, desc: 'Total Blocking Time', target: '≤ 200ms',
      fix: data.tbt.status !== 'good' ? ['Reduce JavaScript execution time — split long tasks into smaller chunks.', 'Use code splitting to load only needed JS: import() for lazy loading.', 'Defer non-critical third-party scripts: <script defer src="...">',  'Remove unused JavaScript with tree-shaking and bundle analysis.', 'Move heavy computation to Web Workers.'] : null },
    { label: 'CLS', data: data.cls, desc: 'Cumulative Layout Shift', target: '≤ 0.1',
      fix: data.cls.status !== 'good' ? ['Add explicit width/height attributes to all images and videos.', 'Reserve space for ads and dynamic content with CSS aspect-ratio or min-height.', 'Avoid inserting content above existing content after page load.', 'Use CSS contain: layout on elements that might cause shifts.', 'Preload web fonts to prevent layout shifts from font loading: <link rel="preload" href="font.woff2" as="font" crossorigin>.'] : null },
    { label: 'FCP', data: data.fcp, desc: 'First Contentful Paint', target: '≤ 1.8s',
      fix: data.fcp.status !== 'good' ? ['Reduce server response time (TTFB) — use caching and a CDN.', 'Inline critical CSS and defer non-critical stylesheets.', 'Reduce render-blocking resources in <head>.', 'Enable text compression (gzip/brotli) on your server.', 'Minimize redirects — each redirect adds 100-300ms.'] : null },
    { label: 'SI', data: data.si, desc: 'Speed Index', target: '≤ 3.4s',
      fix: data.si.status !== 'good' ? ['Speed Index measures how quickly content is visually populated.', 'Minimize main thread work — reduce JavaScript execution.', 'Optimize images and use lazy loading for below-fold images.', 'Reduce the size of your critical rendering path.', 'Consider server-side rendering (SSR) for faster initial paint.'] : null },
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
            Core Web Vitals
          </h3>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Mobile Performance — Google PageSpeed Insights</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {metrics.map(m => (
          <MetricRow key={m.label} metric={m} metricColor={metricColor} />
        ))}
      </div>
    </div>
  )
}

/* ── Metric Row with expandable fix guidance ── */
function MetricRow({ metric, metricColor }) {
  const [expanded, setExpanded] = useState(false)
  const m = metric
  const color = metricColor(m.data.status)
  const hasFix = m.data.status !== 'good' && m.fix

  return (
    <div style={{
      padding: '0.625rem 0.75rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)',
      border: '0.0625rem solid var(--border-subtle)',
    }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: hasFix ? 'pointer' : 'default' }}
        onClick={() => hasFix && setExpanded(prev => !prev)}
      >
        <div style={{ width: '2.5rem' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {m.label}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color }}>
            {m.data.display}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
            {m.desc} (target: {m.target})
          </span>
        </div>
        <span style={{
          fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase', color,
          padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-sm)',
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
        }}>
          {m.data.status === 'good' ? 'Good' : m.data.status === 'needs-improvement' ? 'Needs work' : 'Poor'}
        </span>
        {hasFix && (
          expanded
            ? <ChevronUp size={12} style={{ color: 'var(--text-tertiary)' }} />
            : <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
        )}
      </div>
      {expanded && m.fix && (
        <div style={{
          marginTop: '0.5rem', padding: '0.625rem 0.75rem',
          background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
          border: '0.0625rem solid color-mix(in srgb, var(--accent) 12%, transparent)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <Lightbulb size={12} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent)' }}>How to improve {m.label}</span>
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {m.fix.map((step, i) => (
              <li key={i} style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</li>
            ))}
          </ol>
        </div>
      )}
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

      {/* Server Response Data */}
      <ServerDataSection serverData={lastScan.serverData} url={lastScan.url} />

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
