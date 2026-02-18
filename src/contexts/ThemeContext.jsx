import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext({ theme: 'dark', resolvedTheme: 'dark', setTheme: () => {}, toggleTheme: () => {} })

function getSystemPreference() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function getStoredTheme() {
  try {
    return localStorage.getItem('aeo-theme')
  } catch {
    return null
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = getStoredTheme()
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
    return 'dark'
  })

  const [systemPref, setSystemPref] = useState(getSystemPreference)

  // The actual theme applied to the DOM
  const resolvedTheme = theme === 'auto' ? systemPref : theme

  // Apply data-theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  // Store theme preference
  useEffect(() => {
    try {
      localStorage.setItem('aeo-theme', theme)
    } catch { /* ignore */ }
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e) => {
      setSystemPref(e.matches ? 'light' : 'dark')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const setTheme = useCallback((val) => {
    setThemeState(val)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      // Simple two-state toggle (dark ↔ light)
      // "auto" is still available via setTheme() in Settings
      const resolved = prev === 'auto' ? systemPref : prev
      return resolved === 'dark' ? 'light' : 'dark'
    })
  }, [systemPref])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
