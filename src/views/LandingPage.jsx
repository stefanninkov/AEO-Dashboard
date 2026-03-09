import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { createLenis, destroyLenis } from '../lib/lenis'
import { ScrollTrigger } from '../lib/gsap'
import './LandingPage.css'

// Section components
import LandingNav from './landing/LandingNav'
import HeroSection from './landing/HeroSection'
import PlatformsBar from './landing/PlatformsBar'
import SocialProof from './landing/SocialProof'
import ProblemSection from './landing/ProblemSection'
import WhatIsAeoSection from './landing/WhatIsAeoSection'
import FeaturesSection from './landing/FeaturesSection'
import FeaturesGrid from './landing/FeaturesGrid'
import InteractiveDemo from './landing/InteractiveDemo'
import BeforeAfterShowcase from './landing/BeforeAfterShowcase'
import IntegrationLogos from './landing/IntegrationLogos'
import CaseStudies from './landing/CaseStudies'
import AiCostSection from './landing/AiCostSection'
import HowItWorks from './landing/HowItWorks'
import ComparisonTable from './landing/ComparisonTable'
import PricingSection from './landing/PricingSection'
import TestimonialsSection from './landing/TestimonialsSection'
import FaqSection from './landing/FaqSection'
import FinalCta from './landing/FinalCta'
import FooterSection from './landing/FooterSection'

const BASE_URL = 'https://stefanninkov.github.io/AEO-Dashboard/'

export default function LandingPage() {
  const rootRef = useRef(null)
  const [lenisReady, setLenisReady] = useState(false)

  // Lenis smooth scroll — landing page only
  // useLayoutEffect runs before paint. We delay section rendering until Lenis is ready
  // so that children's useGSAP hooks see the correct ScrollTrigger scroller defaults.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setLenisReady(true)
      return
    }

    createLenis(root)
    setLenisReady(true)

    return () => {
      destroyLenis()
      ScrollTrigger.getAll().forEach((t) => t.kill())
      setLenisReady(false)
    }
  }, [])

  // JSON-LD structured data
  const schemaData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'AEO Dashboard',
        url: BASE_URL,
        description: 'The complete toolkit for Answer Engine Optimization.',
        logo: `${BASE_URL}logo.png`,
      },
      {
        '@type': 'WebPage',
        name: 'AEO Dashboard - Optimize Your Website for AI Search Engines',
        url: BASE_URL,
        description: 'Get your clients cited by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot.',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['#hero', '#what-is-aeo', '#how-it-works', '#faq'],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'AEO Dashboard',
        url: BASE_URL,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: [
          { '@type': 'Offer', name: 'Starter', price: '29', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Professional', price: '49', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Enterprise', price: '149', priceCurrency: 'USD' },
        ],
      },
    ],
  }), [])

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schemaData)
    document.head.appendChild(script)
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [schemaData])

  return (
    <div ref={rootRef} className="lp-root">
      {lenisReady && (
        <>
          <LandingNav />

          <main>
            <HeroSection />
            <PlatformsBar />
            <SocialProof />
            <ProblemSection />
            <WhatIsAeoSection />
            <FeaturesSection />
            <FeaturesGrid />
            <InteractiveDemo />
            <BeforeAfterShowcase />
            <IntegrationLogos />
            <CaseStudies />
            <AiCostSection />
            <HowItWorks />
            <ComparisonTable />
            <PricingSection />
            <TestimonialsSection />
            <FaqSection />
            <FinalCta />
          </main>

          <FooterSection />
        </>
      )}
    </div>
  )
}
