import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { getLenis } from '../../lib/lenis'

const BASE_URL = 'https://stefanninkov.github.io/AEO-Dashboard/'

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Dashboard', href: '/AEO-Dashboard/app' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'What is AEO?', href: '#what-is-aeo' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
]

export default function FooterSection() {
  const footerRef = useRef(null)

  useGSAP(() => {
    const footer = footerRef.current
    if (!footer) return

    gsap.fromTo(footer.querySelectorAll('.lp-footer__col'),
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.6,
        scrollTrigger: { trigger: footer, start: 'top 85%', once: true },
      }
    )
  }, { scope: footerRef })

  function handleClick(e, href) {
    if (!href.startsWith('#')) return
    e.preventDefault()
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: -80 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer ref={footerRef} className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__brand lp-footer__col">
          <a href="/AEO-Dashboard/" className="lp-footer__logo">
            <span className="lp-footer__logo-accent">AEO</span> Dashboard
          </a>
          <p className="lp-footer__tagline">
            The complete toolkit for Answer Engine Optimization.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col, i) => (
          <div key={i} className="lp-footer__col">
            <h4 className="lp-footer__col-title">{col.title}</h4>
            <ul className="lp-footer__links">
              {col.links.map((link, li) => (
                <li key={li}>
                  <a
                    href={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="lp-footer__bottom">
        <p>&copy; {new Date().getFullYear()} AEO Dashboard. All rights reserved.</p>
      </div>
    </footer>
  )
}
