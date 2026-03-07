import { useState, useCallback, memo } from 'react'
import { LayoutGrid, Search, FileText, Swords, ChevronDown } from 'lucide-react'

export const PRESET_IDS = {
  OVERVIEW: 'overview',
  SEO_FOCUS: 'seo-focus',
  CONTENT_FOCUS: 'content-focus',
  COMPETITIVE_INTEL: 'competitive-intel',
}

export const PRESETS = [
  {
    id: PRESET_IDS.OVERVIEW,
    i18nKey: 'dashboard.presets.overview',
    fallbackLabel: 'Overview',
    icon: LayoutGrid,
    description: 'dashboard.presets.overviewDesc',
    fallbackDesc: 'Stats, phase progress, recommendations & quick actions',
    sections: ['stats', 'siteHealth', 'quickWin', 'scoreHistory', 'donut', 'progress', 'recommendations', 'charts', 'phaseProgress', 'activity', 'activityInsights', 'competitorAlerts', 'quickActions'],
  },
  {
    id: PRESET_IDS.SEO_FOCUS,
    i18nKey: 'dashboard.presets.seoFocus',
    fallbackLabel: 'SEO Focus',
    icon: Search,
    description: 'dashboard.presets.seoFocusDesc',
    fallbackDesc: 'SEO scores, technical issues & competitor comparison',
    sections: ['stats', 'siteHealth', 'scoreHistory', 'recommendations', 'competitorAlerts', 'quickActions'],
  },
  {
    id: PRESET_IDS.CONTENT_FOCUS,
    i18nKey: 'dashboard.presets.contentFocus',
    fallbackLabel: 'Content Focus',
    icon: FileText,
    description: 'dashboard.presets.contentFocusDesc',
    fallbackDesc: 'Content quality, decay alerts & writer tools',
    sections: ['stats', 'quickWin', 'scoreHistory', 'progress', 'recommendations', 'phaseProgress', 'activity', 'quickActions'],
  },
  {
    id: PRESET_IDS.COMPETITIVE_INTEL,
    i18nKey: 'dashboard.presets.competitiveIntel',
    fallbackLabel: 'Competitive Intel',
    icon: Swords,
    description: 'dashboard.presets.competitiveIntelDesc',
    fallbackDesc: 'Competitor tracking, citations & content gaps',
    sections: ['stats', 'competitorAlerts', 'scoreHistory', 'charts', 'recommendations', 'activityInsights', 'quickActions'],
  },
]

const STORAGE_KEY = 'aeo-dashboard-preset'

export function getStoredPreset() {
  try {
    return localStorage.getItem(STORAGE_KEY) || PRESET_IDS.OVERVIEW
  } catch {
    return PRESET_IDS.OVERVIEW
  }
}

export function storePreset(presetId) {
  try {
    localStorage.setItem(STORAGE_KEY, presetId)
  } catch { /* non-critical */ }
}

export function getPresetById(id) {
  return PRESETS.find(p => p.id === id) || PRESETS[0]
}

export function isSectionVisible(presetId, sectionName) {
  const preset = getPresetById(presetId)
  return preset.sections.includes(sectionName)
}

/** Dropdown layout switcher for the dashboard header */
const DashboardPresetSwitcher = memo(function DashboardPresetSwitcher({ activePreset, onSelect }) {
const [open, setOpen] = useState(false)
  const current = getPresetById(activePreset)
  const Icon = current.icon

  const handleSelect = useCallback((id) => {
    onSelect(id)
    setOpen(false)
  }, [onSelect])

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost btn-sm"
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          fontSize: 'var(--text-xs)', fontWeight: 600,
          padding: 'var(--space-1) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Icon size={14} style={{ color: 'var(--accent)' }} />
        <span>{current.fallbackLabel}</span>
        <ChevronDown size={12} style={{
          color: 'var(--text-tertiary)',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'none',
        }} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-dropdown)' }}
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 'var(--space-1)',
              width: '16rem', background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
              zIndex: 'var(--z-dropdown)', overflow: 'hidden',
              animation: 'fade-in 0.15s ease-out',
            }}
          >
            {PRESETS.map(preset => {
              const PresetIcon = preset.icon
              const isActive = preset.id === activePreset
              return (
                <button
                  key={preset.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(preset.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                    width: '100%', padding: 'var(--space-3)',
                    background: isActive ? 'var(--hover-bg)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--hover-bg)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: isActive ? 'var(--accent-muted)' : 'var(--border-subtle)',
                  }}>
                    <PresetIcon size={14} style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)' }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                    }}>
                      {preset.fallbackLabel}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)',
                      marginTop: '2px', lineHeight: 1.3,
                    }}>
                      {preset.fallbackDesc}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
})

export default DashboardPresetSwitcher
