import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenisInstance = null
let tickerCallback = null

export function createLenis(wrapper) {
  if (lenisInstance) {
    destroyLenis()
  }

  lenisInstance = new Lenis({
    wrapper,
    content: wrapper,
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    syncTouch: true,
  })

  // Tell ScrollTrigger how to read/set scroll position on the Lenis wrapper
  ScrollTrigger.scrollerProxy(wrapper, {
    scrollTop(value) {
      if (arguments.length) {
        lenisInstance?.scrollTo(value, { immediate: true })
      }
      return lenisInstance?.scroll ?? 0
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
    pinType: wrapper.style.transform ? 'transform' : 'fixed',
  })

  // Make all ScrollTrigger instances use the Lenis wrapper by default
  ScrollTrigger.defaults({ scroller: wrapper })

  // Sync Lenis scroll events → ScrollTrigger.update
  lenisInstance.on('scroll', ScrollTrigger.update)

  // Drive Lenis from GSAP ticker
  tickerCallback = (time) => {
    lenisInstance?.raf(time * 1000)
  }
  gsap.ticker.add(tickerCallback)
  gsap.ticker.lagSmoothing(0)

  return lenisInstance
}

export function destroyLenis() {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback)
    tickerCallback = null
  }
  // Reset ScrollTrigger defaults
  ScrollTrigger.defaults({ scroller: window })
  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
  }
}

export function getLenis() {
  return lenisInstance
}
