import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { SearchCheck, BotMessageSquare, TrendingDown } from 'lucide-react'

const PROBLEMS = [
  {
    Icon: SearchCheck,
    title: 'Invisible to AI',
    description: 'Your clients\' websites don\'t appear in ChatGPT, Perplexity, or Google AI Overview answers — they\'re losing traffic to competitors who do.',
    color: '#EF4444',
  },
  {
    Icon: BotMessageSquare,
    title: 'No AI Strategy',
    description: 'Traditional SEO tools don\'t measure AI visibility. You\'re optimizing for search engines of the past, not the AI-powered future.',
    color: '#F59E0B',
  },
  {
    Icon: TrendingDown,
    title: 'Declining Traffic',
    description: 'AI answers are cannibalizing organic clicks. Without AEO, your clients\' traffic will continue to erode as AI search adoption grows.',
    color: '#8B5CF6',
  },
]

export default function ProblemSection() {
  const sectionRef = useRef(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    // Section header
    gsap.fromTo(section.querySelector('.lp-section__header'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      }
    )

    // Problem cards stagger in
    gsap.fromTo(section.querySelectorAll('.lp-problem__card'),
      { opacity: 0, y: 50, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="lp-section lp-problem" aria-label="The problem">
      <div className="lp-section__header">
        <span className="lp-section__label">The Problem</span>
        <h2 className="lp-section__title">Your Clients Are Invisible to AI</h2>
        <p className="lp-section__subtitle">
          AI search engines answer questions without linking to websites. If your content isn't optimized for AI, it doesn't exist.
        </p>
      </div>

      <div className="lp-problem__grid">
        {PROBLEMS.map((problem, i) => (
          <div key={i} className="lp-problem__card">
            <div className="lp-problem__icon" style={{ backgroundColor: `${problem.color}15`, color: problem.color }}>
              <problem.Icon size={24} />
            </div>
            <h3 className="lp-problem__card-title">{problem.title}</h3>
            <p className="lp-problem__card-desc">{problem.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
