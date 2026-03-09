import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenisInstance = null

export function createLenis(wrapper) {
  if (lenisInstance) {
    lenisInstance.destroy()
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

  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenisInstance
}

export function destroyLenis() {
  if (lenisInstance) {
    gsap.ticker.remove(lenisInstance.raf)
    lenisInstance.destroy()
    lenisInstance = null
  }
}

export function getLenis() {
  return lenisInstance
}
