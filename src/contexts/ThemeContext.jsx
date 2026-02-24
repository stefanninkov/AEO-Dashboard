import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext({ theme: 'light', resolvedTheme: 'light', setTheme: () => {}, toggleTheme: () => {} })

function getSystemPreference() {
  if (typeof window === 'undefined') return 'light'
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
    return 'light'
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

  const toggleTheme = useCallback((event) => {
    const update = () => {
      setThemeState(prev => {
        const resolved = prev === 'auto' ? systemPref : prev
        return resolved === 'dark' ? 'light' : 'dark'
      })
    }

    // Use View Transition API for circular reveal if supported
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update()
      return
    }

    // Capture click position for the circular reveal origin
    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? 0
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    // Store coordinates as CSS custom properties for the animation
    document.documentElement.style.setProperty('--_tx', `${x}px`)
    document.documentElement.style.setProperty('--_ty', `${y}px`)
    document.documentElement.style.setProperty('--_tr', `${endRadius}px`)

    const transition = document.startViewTransition(update)
    transition.finished.then(() => {
      document.documentElement.style.removeProperty('--_tx')
      document.documentElement.style.removeProperty('--_ty')
      document.documentElement.style.removeProperty('--_tr')
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
