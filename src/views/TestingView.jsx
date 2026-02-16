import { useState } from 'react'
import {
  Clock, Calendar, Plus, Trash2, ExternalLink,
  CheckCircle2, XCircle, MinusCircle, ChevronDown, Search,
  Activity, Zap, Loader2, AlertCircle
} from 'lucide-react'
import { useAutoMonitor } from '../hooks/useAutoMonitor'
import { getFilteredPlatforms } from '../utils/getRecommendations'
import CollapsibleContent from '../components/shared/CollapsibleContent'

const ALL_PLATFORMS = ['ChatGPT', 'Perplexity', 'Google AIO', 'Bing Copilot', 'Claude']

const WEEKLY_TASKS = [
  { id: 'w1', text: 'Test top 10 queries in Perplexity', time: '10 min' },
  { id: 'w2', text: 'Test top 10 queries in ChatGPT', time: '10 min' },
  { id: 'w3', text: 'Spot-check 5 queries in Google AI Overviews', time: '5 min' },
  { id: 'w4', text: 'Log results in tracker', time: '5 min' },
]

const MONTHLY_TASKS = [
  { id: 'm1', text: 'Full query list (50-100) across all platforms' },
  { id: 'm2', text: 'Schema validation on all templates' },
  { id: 'm3', text: 'Bing/Google indexation check' },
  { id: 'm4', text: 'Competitor benchmarking' },
  { id: 'm5', text: 'Trend analysis and strategy update' },
]

const QUICK_LINKS = [
  { name: 'Google Rich Results Test', url: 'https://search.google.com/test/rich-results' },
  { name: 'Schema.org Validator', url: 'https://validator.schema.org/' },
  { name: 'PageSpeed Insights', url: 'https://pagespeed.web.dev/' },
  { name: 'Google Search Console', url: 'https://search.google.com/search-console' },
  { name: 'Bing Webmaster Tools', url: 'https://www.bing.com/webmasters' },
  { name: 'Perplexity.ai', url: 'https://www.perplexity.ai/' },
  { name: 'robots.txt Tester', url: 'https://www.google.com/webmasters/tools/robots-testing-tool' },
]

const STATUS_OPTIONS = [
  { value: 'not_checked', label: '—', color: 'text-text-tertiary' },
  { value: 'cited', label: 'Cited', color: 'text-success' },
  { value: 'partial', label: 'Partial', color: 'text-warning' },
  { value: 'not_cited', label: 'Not Cited', color: 'text-error' },
]

export default function TestingView({ activeProject, updateProject }) {
  const [newQuery, setNewQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState({ monitor: true, weekly: true, monthly: false, tracker: true, links: false, timeline: false })
  const [bouncingId, setBouncingId] = useState(null)

  const PLATFORMS = getFilteredPlatforms(activeProject?.questionnaire, ALL_PLATFORMS)

  // Auto monitor
  const {
    monitoring: autoMonitoring,
    progress: monitorProgress,
    error: monitorError,
    runMonitor,
  } = useAutoMonitor({ activeProject, updateProject })

  const monitorHistory = activeProject?.monitorHistory || []
  const lastRun = activeProject?.lastMonitorRun

  // Per-project routine state
  const weeklyChecked = activeProject?.weeklyChecked || {}
  const monthlyChecked = activeProject?.monthlyChecked || {}

  const setWeeklyChecked = (updater) => {
    const next = typeof updater === 'function' ? updater(weeklyChecked) : updater
    updateProject(activeProject.id, { weeklyChecked: next })
  }
  const setMonthlyChecked = (updater) => {
    const next = typeof updater === 'function' ? updater(monthlyChecked) : updater
    updateProject(activeProject.id, { monthlyChecked: next })
  }

  const queryTracker = activeProject?.queryTracker || []

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleWeeklyToggle = (taskId) => {
    if (!weeklyChecked[taskId]) {
      setBouncingId(taskId)
      setTimeout(() => setBouncingId(null), 350)
    }
    setWeeklyChecked(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleMonthlyToggle = (taskId) => {
    if (!monthlyChecked[taskId]) {
      setBouncingId(taskId)
      setTimeout(() => setBouncingId(null), 350)
    }
    setMonthlyChecked(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const addQuery = () => {
    if (!newQuery.trim()) return
    const updated = [...queryTracker, {
      id: crypto.randomUUID(),
      query: newQuery.trim(),
      platforms: {},
      lastChecked: null,
      notes: '',
    }]
    updateProject(activeProject.id, { queryTracker: updated })
    setNewQuery('')
  }

  const deleteQuery = (queryId) => {
    const updated = queryTracker.filter(q => q.id !== queryId)
    updateProject(activeProject.id, { queryTracker: updated })
  }

  const updateQueryPlatform = (queryId, platform, status) => {
    const updated = queryTracker.map(q => {
      if (q.id !== queryId) return q
      return {
        ...q,
        platforms: { ...q.platforms, [platform]: status },
        lastChecked: new Date().toISOString(),
      }
    })
    updateProject(activeProject.id, { queryTracker: updated })
  }

  const updateQueryNotes = (queryId, notes) => {
    const updated = queryTracker.map(q =>
      q.id === queryId ? { ...q, notes } : q
    )
    updateProject(activeProject.id, { queryTracker: updated })
  }

  const getVisibilityScore = () => {
    if (queryTracker.length === 0) return 0
    let totalPossible = 0
    let totalCited = 0
    queryTracker.forEach(q => {
      PLATFORMS.forEach(platform => {
        totalPossible++
        const status = q.platforms?.[platform]
        if (status === 'cited') totalCited++
        else if (status === 'partial') totalCited += 0.5
      })
    })
    return totalPossible > 0 ? Math.round((totalCited / totalPossible) * 100) : 0
  }

  const visibilityScore = getVisibilityScore()

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01875rem] text-text-primary">Testing Hub</h2>
          <span className="text-[0.6875rem] px-2 py-0.5 rounded-full bg-phase-3/10 text-phase-3 font-medium">{activeProject?.name}</span>
        </div>
        <p className="text-[0.8125rem] text-text-secondary">Test, track, and validate your AEO implementation across all AI platforms.</p>
      </div>

      {/* AEO Visibility Score */}
      <div className="testing-score-card">
        <div className="testing-score-header">
          <h3 className="testing-score-label">AEO Visibility Score</h3>
          <span className={`testing-score-value ${
            visibilityScore >= 70 ? 'text-success' : visibilityScore >= 40 ? 'text-warning' : 'text-error'
          }`}>
            {visibilityScore}%
          </span>
        </div>
        <div className="testing-score-bar">
          <div
            className="testing-score-fill"
            style={{
              width: `${visibilityScore}%`,
              backgroundColor: visibilityScore >= 70 ? 'var(--color-success)' : visibilityScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
            }}
          />
        </div>
        <p className="testing-score-note">Based on {queryTracker.length} tracked queries across {PLATFORMS.length} platforms</p>
      </div>

      {/* Auto Monitor */}
      <CollapsibleSection
        title="Auto Monitor"
        subtitle={lastRun
          ? `Last run: ${new Date(lastRun).toLocaleDateString()} ${new Date(lastRun).toLocaleTimeString()}`
          : 'Never run'}
        icon={<Activity size={16} className="text-phase-4" />}
        expanded={expandedSections.monitor}
        onToggle={() => toggleSection('monitor')}
      >
        <div className="space-y-4">
          {/* Run button + status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-text-secondary">
                Checks your tracked queries against AI search results to see if your brand is being cited.
              </p>
              {!activeProject?.url && (
                <p className="text-xs text-warning mt-1">Set a project URL to enable monitoring.</p>
              )}
              {!activeProject?.queryTracker?.length && (
                <p className="text-xs text-warning mt-1">Add queries in the tracker below first.</p>
              )}
            </div>
            <button
              onClick={runMonitor}
              disabled={autoMonitoring || !activeProject?.url || !activeProject?.queryTracker?.length}
              className="px-4 py-2 bg-phase-4 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2 flex-shrink-0"
            >
              {autoMonitoring ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {monitorProgress.current}/{monitorProgress.total}
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Run Check Now
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {monitorError && (
            <div className="bg-error/10 border border-error/30 rounded-lg p-3 flex items-start gap-2 fade-in-up">
              <AlertCircle size={14} className="text-error flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary">{monitorError}</p>
            </div>
          )}

          {/* Progress bar */}
          {autoMonitoring && (
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-page)' }}>
                <div
                  className="h-full rounded-full bg-phase-4 transition-all duration-300"
                  style={{ width: `${monitorProgress.total > 0 ? (monitorProgress.current / monitorProgress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-text-tertiary">Checking query {monitorProgress.current} of {monitorProgress.total}...</p>
            </div>
          )}

          {/* Score Trend Chart */}
          {monitorHistory.length > 0 && (
            <div>
              <h4 className="font-heading text-xs font-bold text-text-tertiary mb-3">CITATION SCORE HISTORY</h4>
              <div className="flex items-end gap-1 h-24">
                {monitorHistory.slice(-30).map((entry, idx, arr) => (
                  <div
                    key={idx}
                    className="flex-1 min-w-[4px] max-w-[20px] rounded-t cursor-default group relative"
                    style={{
                      height: `${Math.max(entry.overallScore, 4)}%`,
                      backgroundColor: entry.overallScore >= 70 ? 'var(--color-success)' : entry.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
                      opacity: 0.5 + (idx / arr.length) * 0.5,
                    }}
                    title={`${new Date(entry.date).toLocaleDateString()}: ${entry.overallScore}% (${entry.queriesCited || 0}/${entry.queriesChecked || 0} cited)`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[0.625rem] text-text-tertiary">
                  {new Date(monitorHistory[Math.max(0, monitorHistory.length - 30)].date).toLocaleDateString()}
                </span>
                <span className="text-[0.625rem] text-text-tertiary">
                  {new Date(monitorHistory[monitorHistory.length - 1].date).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Latest Results */}
          {monitorHistory.length > 0 && (
            <div>
              <h4 className="font-heading text-xs font-bold text-text-tertiary mb-3">
                LATEST RESULTS — {monitorHistory[monitorHistory.length - 1].overallScore}% cited
              </h4>
              <div className="space-y-2">
                {Object.values(monitorHistory[monitorHistory.length - 1].results).map((result, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: 'var(--bg-page)', border: '1px solid color-mix(in srgb, var(--border-subtle) 50%, transparent)' }}
                  >
                    {result.cited ? (
                      <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={14} className="text-error flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{result.query}</p>
                      <p className="text-xs text-text-tertiary mt-0.5 truncate">{result.excerpt}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      result.cited ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {result.cited ? 'Cited' : 'Not Cited'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {monitorHistory.length === 0 && !autoMonitoring && (
            <div className="flex flex-col items-center justify-center py-8 rounded-xl fade-in-up" style={{ border: '2px dashed var(--border-subtle)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--hover-bg)' }}>
                <Activity size={20} className="text-text-tertiary" />
              </div>
              <h3 className="font-heading text-sm font-bold mb-1">No monitoring data yet</h3>
              <p className="text-xs text-text-tertiary text-center max-w-xs">
                {activeProject?.queryTracker?.length > 0
                  ? 'Click "Run Check Now" to see how your brand appears in AI search results.'
                  : 'Add queries to the tracker below, then run your first monitoring check.'}
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Weekly Routine */}
      <CollapsibleSection
        title="Weekly Routine"
        subtitle="~30 min per week"
        icon={<Clock size={16} className="text-phase-3" />}
        expanded={expandedSections.weekly}
        onToggle={() => toggleSection('weekly')}
      >
        <div className="space-y-2">
          {WEEKLY_TASKS.map(task => (
            <label key={task.id} className="flex items-center gap-3 py-2 px-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={weeklyChecked[task.id] || false}
                onChange={() => handleWeeklyToggle(task.id)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                weeklyChecked[task.id] ? 'border-phase-3 bg-phase-3' : ''
              } ${bouncingId === task.id ? 'check-bounce' : ''}`}
              style={!weeklyChecked[task.id] ? { borderColor: 'var(--border-default)' } : {}}>
                {weeklyChecked[task.id] && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className={`text-sm flex-1 transition-all duration-200 ${weeklyChecked[task.id] ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                {task.text}
              </span>
              <span className="text-xs text-text-tertiary">{task.time}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Monthly Routine */}
      <CollapsibleSection
        title="Monthly Routine"
        subtitle="Expanded analysis"
        icon={<Calendar size={16} className="text-phase-5" />}
        expanded={expandedSections.monthly}
        onToggle={() => toggleSection('monthly')}
      >
        <div className="space-y-2">
          {MONTHLY_TASKS.map(task => (
            <label key={task.id} className="flex items-center gap-3 py-2 px-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={monthlyChecked[task.id] || false}
                onChange={() => handleMonthlyToggle(task.id)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                monthlyChecked[task.id] ? 'border-phase-5 bg-phase-5' : ''
              } ${bouncingId === task.id ? 'check-bounce' : ''}`}
              style={!monthlyChecked[task.id] ? { borderColor: 'var(--border-default)' } : {}}>
                {monthlyChecked[task.id] && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className={`text-sm flex-1 transition-all duration-200 ${monthlyChecked[task.id] ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                {task.text}
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Query Tracker */}
      <CollapsibleSection
        title="Query Tracker"
        subtitle={`${queryTracker.length} queries tracked`}
        icon={<CheckCircle2 size={16} className="text-phase-6" />}
        expanded={expandedSections.tracker}
        onToggle={() => toggleSection('tracker')}
      >
        {/* Add Query */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a target query..."
            value={newQuery}
            onChange={e => setNewQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuery()}
            aria-label="Add a target query"
            className="flex-1 rounded-lg px-3 py-2 text-[0.8125rem] text-text-primary placeholder-text-disabled outline-none transition-colors duration-150"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
          />
          <button
            onClick={addQuery}
            disabled={!newQuery.trim()}
            className="px-3 py-2 bg-phase-6 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:hover:scale-100"
            aria-label="Add query"
          >
            <Plus size={16} />
          </button>
        </div>

        {queryTracker.length > 0 ? (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-card)' }}>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="text-left py-2 px-2 text-xs text-text-tertiary font-heading min-w-[11.25rem]">Query</th>
                  {PLATFORMS.map(p => (
                    <th key={p} className="text-center py-2 px-2 text-xs text-text-tertiary font-heading whitespace-nowrap min-w-[5.625rem]">{p}</th>
                  ))}
                  <th className="text-center py-2 px-2 text-xs text-text-tertiary font-heading min-w-[5rem]">Last Check</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {queryTracker.map((query, idx) => (
                  <tr key={query.id} className="transition-colors" style={{ borderBottom: '1px solid color-mix(in srgb, var(--border-subtle) 50%, transparent)', background: idx % 2 === 0 ? 'color-mix(in srgb, var(--bg-page) 20%, transparent)' : undefined }}>
                    <td className="py-2.5 px-2">
                      <p className="text-text-primary text-sm">{query.query}</p>
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={query.notes || ''}
                        onChange={e => updateQueryNotes(query.id, e.target.value)}
                        aria-label={`Notes for "${query.query}"`}
                        className="text-xs text-text-tertiary bg-transparent outline-none w-full mt-0.5 focus:text-text-secondary transition-colors"
                      />
                    </td>
                    {PLATFORMS.map(platform => (
                      <td key={platform} className="py-2.5 px-1 text-center">
                        <select
                          value={query.platforms?.[platform] || 'not_checked'}
                          onChange={e => updateQueryPlatform(query.id, platform, e.target.value)}
                          aria-label={`${platform} status for "${query.query}"`}
                          className={`rounded px-1.5 py-1 text-xs outline-none cursor-pointer focus:border-phase-3 transition-colors ${
                            STATUS_OPTIONS.find(s => s.value === (query.platforms?.[platform] || 'not_checked'))?.color || 'text-text-tertiary'
                          }`}
                          style={{ background: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                    <td className="py-2.5 px-2 text-center text-xs text-text-tertiary whitespace-nowrap">
                      {query.lastChecked ? new Date(query.lastChecked).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-1">
                      <button
                        onClick={() => deleteQuery(query.id)}
                        className="p-1 text-text-tertiary hover:text-error rounded transition-all duration-150"
                        aria-label="Delete query"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 rounded-xl fade-in-up" style={{ border: '2px dashed var(--border-subtle)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--hover-bg)' }}>
              <Search size={20} className="text-text-tertiary" />
            </div>
            <h3 className="font-heading text-sm font-bold mb-1">No queries tracked yet</h3>
            <p className="text-xs text-text-tertiary text-center max-w-xs">Add your target queries above to start tracking AEO visibility across all AI platforms.</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Quick Links */}
      <CollapsibleSection
        title="Quick Links"
        subtitle="Testing tools"
        icon={<ExternalLink size={16} className="text-phase-4" />}
        expanded={expandedSections.links}
        onToggle={() => toggleSection('links')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUICK_LINKS.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
              style={{ background: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}
            >
              <ExternalLink size={14} className="text-text-tertiary group-hover:text-phase-3 transition-colors flex-shrink-0" />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{link.name}</span>
            </a>
          ))}
        </div>
      </CollapsibleSection>

      {/* Timeline Expectations */}
      <CollapsibleSection
        title="Timeline Expectations"
        subtitle="When to expect results"
        icon={<Clock size={16} className="text-phase-7" />}
        expanded={expandedSections.timeline}
        onToggle={() => toggleSection('timeline')}
      >
        <div className="space-y-4">
          <TimelineItem
            period="2-4 weeks"
            description="Specific, low-competition queries where you have strong, well-structured content with proper schema markup."
            color="var(--color-success)"
          />
          <TimelineItem
            period="2-3 months"
            description="Broader queries with good content, comprehensive schema, and growing authority signals."
            color="var(--color-warning)"
          />
          <TimelineItem
            period="6+ months"
            description="Competitive queries in crowded niches. Requires sustained effort on content quality, authority building, and continuous optimization."
            color="var(--color-error)"
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}

function CollapsibleSection({ title, subtitle, icon, expanded, onToggle, children }) {
  return (
    <div className="testing-section-card">
      <button
        onClick={onToggle}
        className="testing-section-header"
        aria-expanded={expanded}
      >
        <span className="testing-section-header-icon">{icon}</span>
        <div className="testing-section-header-content">
          <h3 className="testing-section-title">{title}</h3>
          <p className="testing-section-subtitle">{subtitle}</p>
        </div>
        <ChevronDown
          size={14}
          className={`testing-section-chevron ${expanded ? 'expanded' : 'collapsed'}`}
        />
      </button>
      <CollapsibleContent expanded={expanded}>
        <div className="testing-section-body">
          {children}
        </div>
      </CollapsibleContent>
    </div>
  )
}

function TimelineItem({ period, description, color }) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex-shrink-0">
        <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: color }} />
      </div>
      <div>
        <p className="text-sm font-medium font-heading" style={{ color }}>{period}</p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
    </div>
  )
}
