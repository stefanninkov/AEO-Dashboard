import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} })

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
  const [theme, setTheme] = useState(() => {
    const stored = getStoredTheme()
    return stored === 'light' || stored === 'dark' ? stored : getSystemPreference()
  })

  // Apply data-theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('aeo-theme', theme)
    } catch { /* ignore */ }
  }, [theme])

  // Listen for system preference changes (only if no stored preference)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e) => {
      const stored = getStoredTheme()
      if (!stored) {
        setTheme(e.matches ? 'light' : 'dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
