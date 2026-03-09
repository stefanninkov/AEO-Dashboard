import { useState, useCallback, useMemo } from 'react'

/**
 * useThemeCustomizer — Custom theme colors, fonts, and branding.
 *
 * Stored in localStorage: aeo-custom-theme
 * Applies CSS custom properties to document root.
 */

const STORAGE_KEY = 'aeo-custom-theme'

const PRESET_THEMES = [
  {
    id: 'default',
    name: 'Default Blue',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    bgPrimary: null, // use system
  },
  {
    id: 'emerald',
    name: 'Emerald',
    accent: '#10b981',
    accentHover: '#059669',
  },
  {
    id: 'violet',
    name: 'Violet',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
  },
  {
    id: 'rose',
    name: 'Rose',
    accent: '#f43f5e',
    accentHover: '#e11d48',
  },
  {
    id: 'amber',
    name: 'Amber',
    accent: '#f59e0b',
    accentHover: '#d97706',
  },
  {
    id: 'cyan',
    name: 'Cyan',
    accent: '#06b6d4',
    accentHover: '#0891b2',
  },
  {
    id: 'slate',
    name: 'Slate',
    accent: '#64748b',
    accentHover: '#475569',
  },
]

const DEFAULT_CONFIG = {
  preset: 'default',
  customAccent: null,
  fontFamily: null, // null = system default
  fontSize: 'medium', // 'small' | 'medium' | 'large'
  borderRadius: 'medium', // 'none' | 'small' | 'medium' | 'large'
  density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
  brandName: null,
  brandLogoUrl: null,
}

const FONT_OPTIONS = [
  { id: 'system', label: 'System Default', value: null },
  { id: 'inter', label: 'Inter', value: "'Inter', system-ui, sans-serif" },
  { id: 'dm-sans', label: 'DM Sans', value: "'DM Sans', system-ui, sans-serif" },
  { id: 'mono', label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
]

const SIZE_SCALES = {
  small: 0.875,
  medium: 1,
  large: 1.125,
}

const RADIUS_SCALES = {
  none: '0',
  small: '0.25rem',
  medium: '0.5rem',
  large: '1rem',
}

const DENSITY_SCALES = {
  compact: 0.75,
  comfortable: 1,
  spacious: 1.25,
}

export function useThemeCustomizer() {
  const loadConfig = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG }
    } catch {
      return { ...DEFAULT_CONFIG }
    }
  }

  const [config, setConfig] = useState(loadConfig)

  const save = useCallback((next) => {
    setConfig(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    applyTheme(next)
  }, [])

  const updateConfig = useCallback((changes) => {
    save({ ...config, ...changes })
  }, [config, save])

  const resetToDefault = useCallback(() => {
    save({ ...DEFAULT_CONFIG })
  }, [save])

  const selectPreset = useCallback((presetId) => {
    save({ ...config, preset: presetId, customAccent: null })
  }, [config, save])

  // Active accent color
  const activeAccent = useMemo(() => {
    if (config.customAccent) return config.customAccent
    const preset = PRESET_THEMES.find(p => p.id === config.preset)
    return preset?.accent || PRESET_THEMES[0].accent
  }, [config.preset, config.customAccent])

  // Apply on mount
  useState(() => applyTheme(config))

  return {
    config,
    updateConfig,
    resetToDefault,
    selectPreset,
    activeAccent,
    presets: PRESET_THEMES,
    fontOptions: FONT_OPTIONS,
    sizeOptions: Object.keys(SIZE_SCALES),
    radiusOptions: Object.keys(RADIUS_SCALES),
    densityOptions: Object.keys(DENSITY_SCALES),
  }
}

function applyTheme(config) {
  const root = document.documentElement
  if (!root) return

  // Accent color
  const preset = PRESET_THEMES.find(p => p.id === config.preset)
  const accent = config.customAccent || preset?.accent || PRESET_THEMES[0].accent
  const accentHover = preset?.accentHover || accent
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-hover', accentHover)

  // Font
  if (config.fontFamily) {
    root.style.setProperty('--font-body', config.fontFamily)
  } else {
    root.style.removeProperty('--font-body')
  }

  // Font size scale
  const scale = SIZE_SCALES[config.fontSize] || 1
  root.style.setProperty('--font-scale', scale)

  // Border radius
  const radius = RADIUS_SCALES[config.borderRadius] || RADIUS_SCALES.medium
  root.style.setProperty('--radius-md', radius)

  // Density
  const density = DENSITY_SCALES[config.density] || 1
  root.style.setProperty('--density-scale', density)
}
