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
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 0.8,
  })

  // Sync Lenis with GSAP's ticker
  lenisInstance.on('scroll', ScrollTrigger.update)

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
  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
  }
}

export function getLenis() {
  return lenisInstance
}
