const PLATFORMS = ['ChatGPT', 'Perplexity', 'Google AI', 'Bing Copilot', 'Claude', 'Gemini']

export default function PlatformsBar() {
  // Pure CSS marquee — no GSAP, no drift issues
  return (
    <section className="lp-platforms" aria-label="Supported AI platforms">
      <p className="lp-platforms__label">Optimize for every major AI platform</p>
      <div className="lp-platforms__marquee">
        <div className="lp-platforms__track">
          {[...PLATFORMS, ...PLATFORMS].map((name, i) => (
            <span key={i} className="lp-platforms__item">{name}</span>
          ))}
        </div>
        <div className="lp-platforms__track" aria-hidden="true">
          {[...PLATFORMS, ...PLATFORMS].map((name, i) => (
            <span key={i} className="lp-platforms__item">{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
