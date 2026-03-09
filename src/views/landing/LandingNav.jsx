import { useState, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { useTheme } from '../../contexts/ThemeContext'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { getLenis } from '../../lib/lenis'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function LandingNav() {
  const [solid, setSolid] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()
  const navRef = useRef(null)
  const mobileRef = useRef(null)

  useEffect(() => {
    // Lenis uses .lp-root as the scroll container, so listen on both window and the root
    const root = document.querySelector('.lp-root')
    const onScroll = () => {
      const scrollTop = root ? root.scrollTop : window.scrollY
      setSolid(scrollTop > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    if (root) root.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (root) root.removeEventListener('scroll', onScroll)
    }
  }, [])

  useGSAP(() => {
    if (!mobileRef.current) return
    if (mobileOpen) {
      gsap.fromTo(mobileRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      )
      gsap.fromTo(mobileRef.current.querySelectorAll('a, button'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out', delay: 0.1 }
      )
    }
  }, { dependencies: [mobileOpen] })

  function scrollTo(e, href) {
    e.preventDefault()
    setMobileOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(el, { offset: -80 })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <header
        ref={navRef}
        className={`lp-nav ${solid ? 'lp-nav--solid' : ''}`}
      >
        <nav className="lp-nav__inner">
          <a href="/AEO-Dashboard/" className="lp-nav__logo">
            <span className="lp-nav__logo-accent">AEO</span>
            <span>Dashboard</span>
          </a>

          <div className="lp-nav__links">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="lp-nav__link"
                data-text={link.label}
                onClick={(e) => scrollTo(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="lp-nav__actions">
            <button
              className="lp-nav__theme-btn"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="/AEO-Dashboard/app" className="lp-nav__cta">Get Started</a>
            <button
              className="lp-nav__mobile-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div ref={mobileRef} className="lp-nav__mobile-overlay">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="lp-nav__mobile-link"
              onClick={(e) => scrollTo(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          <button className="lp-nav__theme-btn" onClick={toggleTheme}>
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a href="/AEO-Dashboard/app" className="lp-nav__cta">Get Started</a>
        </div>
      )}
    </>
  )
}
