import { useState, useEffect } from 'react'

/**
 * useBreakpoint — Responsive breakpoint detection hook.
 *
 * Returns the current breakpoint and boolean helpers.
 * Matches the design system breakpoints:
 *   mobile:  < 640px
 *   tablet:  640px - 1023px
 *   desktop: >= 1024px
 *   wide:    >= 1280px
 */

const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1280,
}

function getBreakpoint(width) {
  if (width >= BREAKPOINTS.wide) return 'wide'
  if (width >= BREAKPOINTS.desktop) return 'desktop'
  if (width >= BREAKPOINTS.tablet) return 'tablet'
  return 'mobile'
}

export function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  useEffect(() => {
    let raf = null
    const handleResize = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setWidth(window.innerWidth)
      })
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const breakpoint = getBreakpoint(width)

  return {
    breakpoint,
    width,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
    isWide: breakpoint === 'wide',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  }
}
