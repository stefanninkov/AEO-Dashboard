import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const PLATFORMS = ['ChatGPT', 'Perplexity', 'Google AI', 'Bing Copilot', 'Claude', 'Gemini']

export default function PlatformsBar() {
  const trackRef = useRef(null)

  useGSAP(() => {
    const track = trackRef.current
    if (!track) return

    // Duplicate items for seamless loop
    const items = track.querySelectorAll('.lp-platforms__item')
    const totalWidth = Array.from(items).reduce((w, el) => w + el.offsetWidth + 48, 0)

    gsap.to(track, {
      x: -totalWidth,
      duration: totalWidth / 40,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth),
      },
    })
  }, { scope: trackRef })

  return (
    <section className="lp-platforms" aria-label="Supported AI platforms">
      <p className="lp-platforms__label">Optimize for every major AI platform</p>
      <div className="lp-platforms__marquee">
        <div ref={trackRef} className="lp-platforms__track">
          {[...PLATFORMS, ...PLATFORMS, ...PLATFORMS].map((name, i) => (
            <span key={i} className="lp-platforms__item">{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
