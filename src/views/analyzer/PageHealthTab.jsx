/**
 * PageHealthTab — Bird's-eye view of all analyzed URLs with health indicators.
 *
 * Shows:
 * - Summary stat cards (pages analyzed, avg score, needs work, top score)
 * - Sortable table of all pages with score, categories, last analyzed
 * - Category health overview (pass/fail rates across all pages)
 */
import { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText, AlertTriangle, CheckCircle2, TrendingUp, ArrowUpDown,
  ExternalLink, BarChart3, Shield, BookOpen, Code2,
} from 'lucide-react'
import StatCard from '../dashboard/StatCard'
import useGridNav from '../../hooks/useGridNav'
import Sparkline from '../../components/Sparkline'

const CATEGORY_META = {
  'Schema Markup': { icon: Code2, color: 'var(--color-phase-3)' },
  'Content Structure': { icon: BookOpen, color: 'var(--color-phase-4)' },
  'Technical SEO': { icon: Shield, color: 'var(--color-phase-2)' },
  'Authority Signals': { icon: TrendingUp, color: 'var(--color-phase-5)' },
}

function getScoreColor(score) {
  if (score >= 70) return 'var(--color-success)'
  if (score >= 40) return 'var(--color-warning)'
  return 'var(--color-error)'
}

function getScoreLabel(score, t) {
  if (score >= 70) return t('analyzer.health.strong')
  if (score >= 40) return t('analyzer.health.moderate')
  return t('analyzer.health.weak')
}

function getCategoryScore(category) {
  if (!category?.items?.length) return 0
  const pass = category.items.filter(i => i.status === 'pass').length
  return Math.round((pass / category.items.length) * 100)
}

export default function PageHealthTab({ activeProject }) {
  const { t } = useTranslation('app')
  const [sortBy, setSortBy] = useState('score') // 'score' | 'date' | 'name'
  const [sortDir, setSortDir] = useState('asc') // 'asc' | 'desc'
  const healthGridRef = useRef(null)
  useGridNav(healthGridRef)

  const pages = useMemo(() => {
    const pa = activeProject?.pageAnalyses || {}
    return Object.entries(pa).map(([url, data]) => ({
      url,
      score: data.overallScore || 0,
      analyzedAt: data.analyzedAt || null,
      label: data.label || null,
      summary: data.summary || '',
      categories: data.categories || [],
      topPriorities: data.topPriorities || [],
    }))
  }, [activeProject?.pageAnalyses])

  const sortedPages = useMemo(() => {
    const sorted = [...pages]
    sorted.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'score') cmp = a.score - b.score
      else if (sortBy === 'date') cmp = new Date(a.analyzedAt || 0) - new Date(b.analyzedAt || 0)
      else cmp = (a.label || a.url).localeCompare(b.label || b.url)
      return sortDir === 'desc' ? -cmp : cmp
    })
    return sorted
  }, [pages, sortBy, sortDir])

  // Aggregate stats
  const stats = useMemo(() => {
    if (!pages.length) return { count: 0, avg: 0, needsWork: 0, topScore: 0 }
    const scores = pages.map(p => p.score)
    return {
      count: pages.length,
      avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
      needsWork: pages.filter(p => p.score < 50).length,
      topScore: Math.max(...scores),
    }
  }, [pages])

  // Category health across all pages
  const categoryHealth = useMemo(() => {
    const cats = {}
    pages.forEach(page => {
      page.categories.forEach(cat => {
        if (!cats[cat.name]) cats[cat.name] = { total: 0, pass: 0, fail: 0, partial: 0 }
        cat.items.forEach(item => {
          cats[cat.name].total++
          if (item.status === 'pass') cats[cat.name].pass++
          else if (item.status === 'fail') cats[cat.name].fail++
          else cats[cat.name].partial++
        })
      })
    })
    return Object.entries(cats).map(([name, data]) => ({
      name,
      ...data,
      passRate: data.total ? Math.round((data.pass / data.total) * 100) : 0,
    }))
  }, [pages])

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir(col === 'score' ? 'asc' : 'desc') }
  }

  if (!pages.length) {
    return (
      <div className="card card-xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', textAlign: 'center' }}>
        <BarChart3 size={32} style={{ color: 'var(--text-disabled)' }} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          {t('analyzer.health.noPages')}
        </h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', maxWidth: '20rem' }}>
          {t('analyzer.health.noPagesDesc')}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Summary Cards */}
      <div ref={healthGridRef} className="stats-grid-4 stagger-grid" role="grid" aria-label={t('analyzer.health.categoryHealth')}>
        <StatCard
          layout="horizontal"
          icon={<FileText size={14} />}
          iconColor="var(--color-phase-3)"
          label={t('analyzer.health.pagesAnalyzed')}
          value={stats.count}
        />
        <StatCard
          layout="horizontal"
          icon={<BarChart3 size={14} />}
          iconColor={getScoreColor(stats.avg)}
          label={t('analyzer.health.avgScore')}
          value={stats.avg}
          subValue="/100"
        />
        <StatCard
          layout="horizontal"
          icon={<AlertTriangle size={14} />}
          iconColor="var(--color-error)"
          label={t('analyzer.health.needsWork')}
          value={stats.needsWork}
          subValue={t('analyzer.health.pagesBelow50')}
        />
        <StatCard
          layout="horizontal"
          icon={<CheckCircle2 size={14} />}
          iconColor="var(--color-success)"
          label={t('analyzer.health.topScore')}
          value={stats.topScore}
          subValue="/100"
        />
      </div>

      {/* Category Health Overview */}
      {categoryHealth.length > 0 && (
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.0469rem', color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-3)',
          }}>
            {t('analyzer.health.categoryHealth')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--space-3)' }}>
            {categoryHealth.map(cat => {
              const meta = CATEGORY_META[cat.name] || { icon: FileText, color: 'var(--text-tertiary)' }
              const Icon = meta.icon
              return (
                <div key={cat.name} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)', background: 'var(--hover-bg)', borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: meta.color + '15', color: meta.color, flexShrink: 0,
                  }}>
                    <Icon size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                      {cat.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{
                        flex: 1, height: '0.25rem', background: 'var(--border-subtle)',
                        borderRadius: '0.125rem', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${cat.passRate}%`, height: '100%',
                          background: getScoreColor(cat.passRate),
                          borderRadius: '0.125rem', transition: 'width 300ms',
                        }} />
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xs)',
                        fontWeight: 700, color: getScoreColor(cat.passRate), minWidth: '2rem', textAlign: 'right',
                      }}>
                        {cat.passRate}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pages Table */}
      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
          <thead>
            <tr style={{ borderBottom: '0.0625rem solid var(--border-subtle)' }}>
              <th
                onClick={() => toggleSort('name')}
                style={{
                  padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-2xs)', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.0469rem', color: 'var(--text-tertiary)', cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {t('analyzer.health.page')}
                  <ArrowUpDown size={10} style={{ opacity: sortBy === 'name' ? 1 : 0.3 }} />
                </span>
              </th>
              <th
                onClick={() => toggleSort('score')}
                style={{
                  padding: '0.75rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-2xs)', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.0469rem', color: 'var(--text-tertiary)', cursor: 'pointer',
                  userSelect: 'none', width: '5rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  {t('analyzer.health.score')}
                  <ArrowUpDown size={10} style={{ opacity: sortBy === 'score' ? 1 : 0.3 }} />
                </span>
              </th>
              <th style={{
                padding: '0.75rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xs)', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.0469rem', color: 'var(--text-tertiary)', width: '5rem',
              }}>
                {t('analyzer.health.status')}
              </th>
              <th
                onClick={() => toggleSort('date')}
                style={{
                  padding: '0.75rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-2xs)', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.0469rem', color: 'var(--text-tertiary)', cursor: 'pointer',
                  userSelect: 'none', width: '7rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                  {t('analyzer.health.analyzed')}
                  <ArrowUpDown size={10} style={{ opacity: sortBy === 'date' ? 1 : 0.3 }} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPages.map((page, i) => {
              const color = getScoreColor(page.score)
              return (
                <tr
                  key={page.url}
                  className="page-table-row"
                  style={{
                    borderBottom: i < sortedPages.length - 1 ? '0.0625rem solid var(--border-subtle)' : 'none',
                  }}
                >
                  <td style={{ padding: '0.625rem 1rem', maxWidth: '20rem' }}>
                    <div style={{
                      fontWeight: 600, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {page.label || new URL(page.url).pathname}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginTop: '0.0625rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                    }}>
                      {page.url}
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-disabled)', flexShrink: 0 }}
                      >
                        <ExternalLink size={9} />
                      </a>
                    </div>
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontWeight: 700,
                      fontSize: 'var(--text-sm)', color,
                    }}>
                      {page.score}
                    </span>
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '0.125rem 0.5rem',
                      borderRadius: '0.375rem', fontSize: 'var(--text-2xs)', fontWeight: 600,
                      background: color + '15', color,
                    }}>
                      {getScoreLabel(page.score, t)}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.625rem 0.75rem', textAlign: 'right',
                    fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {page.analyzedAt
                      ? new Date(page.analyzedAt).toLocaleDateString()
                      : '—'
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
