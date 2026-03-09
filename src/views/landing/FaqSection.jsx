import { useRef, useState, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const FAQ_ITEMS = [
  {
    question: 'What is AEO and how is it different from SEO?',
    answer: 'AEO (Answer Engine Optimization) focuses on getting your content cited by AI-powered search engines like ChatGPT, Perplexity, and Google AI Overviews. While SEO targets traditional search rankings, AEO ensures your content is structured and optimized for AI to understand, reference, and cite.',
  },
  {
    question: 'Do I need technical knowledge to use AEO Dashboard?',
    answer: 'No. The 99-point checklist guides you step-by-step through every optimization. The AI Content Writer generates schema markup and optimized content with one click. The Schema Generator has a visual, point-and-click interface.',
  },
  {
    question: 'How does the AI-powered analyzer work?',
    answer: 'Enter any URL and our deterministic engine crawls the HTML in real-time. It checks 10 AI crawlers in your robots.txt, analyzes your sitemap, evaluates schema markup, and scores your site across 5 categories — no API key needed for the base analysis.',
  },
  {
    question: 'What AI platforms can I test my content on?',
    answer: 'The AI Search Testing Lab lets you test across ChatGPT, Perplexity, Claude, and Gemini simultaneously. You can see which platforms cite your content, compare their responses, and identify visibility gaps.',
  },
  {
    question: 'How much does the AI cost?',
    answer: 'You bring your own API key, so there\'s no markup. A full project optimization using every AI feature costs approximately $2–3 in total API costs. Individual feature uses cost $0.01–0.05 each.',
  },
  {
    question: 'Can I share reports with clients?',
    answer: 'Yes. The Client Portal lets you create branded, read-only dashboards with secure sharing links. Clients can track their AEO progress in real-time without needing their own account.',
  },
]

export default function FaqSection() {
  const sectionRef = useRef(null)
  const [openIndex, setOpenIndex] = useState(null)
  const answerRefs = useRef({})

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    gsap.fromTo(section.querySelector('.lp-section__header'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      }
    )

    gsap.fromTo(section.querySelectorAll('.lp-faq__item'),
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, stagger: 0.08, duration: 0.5,
        scrollTrigger: { trigger: section.querySelector('.lp-faq__list'), start: 'top 80%', once: true },
      }
    )
  }, { scope: sectionRef })

  const toggle = useCallback((i) => {
    const answerEl = answerRefs.current[i]
    if (!answerEl) return

    if (openIndex === i) {
      // Close
      gsap.to(answerEl, {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
        onComplete: () => setOpenIndex(null),
      })
    } else {
      // Close previous
      if (openIndex !== null && answerRefs.current[openIndex]) {
        gsap.to(answerRefs.current[openIndex], {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.inOut',
        })
      }
      // Open new
      setOpenIndex(i)
      gsap.set(answerEl, { height: 'auto', opacity: 1 })
      const h = answerEl.scrollHeight
      gsap.fromTo(answerEl,
        { height: 0, opacity: 0 },
        { height: h, opacity: 1, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [openIndex])

  return (
    <section ref={sectionRef} id="faq" className="lp-section lp-faq" aria-label="FAQ">
      <div className="lp-section__header">
        <span className="lp-section__label">FAQ</span>
        <h2 className="lp-section__title">Frequently Asked Questions</h2>
      </div>

      <div className="lp-faq__list">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className={`lp-faq__item ${openIndex === i ? 'lp-faq__item--open' : ''}`}>
            <button
              className="lp-faq__question"
              onClick={() => toggle(i)}
              aria-expanded={openIndex === i}
            >
              <span>{item.question}</span>
              <svg className="lp-faq__chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              ref={(el) => { answerRefs.current[i] = el }}
              className="lp-faq__answer"
              style={{ height: 0, opacity: 0, overflow: 'hidden' }}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
