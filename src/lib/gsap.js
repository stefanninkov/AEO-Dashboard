import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Default ease for Osmo-style smooth animations
gsap.defaults({
  ease: 'power3.out',
  duration: 0.8,
})

export { gsap, ScrollTrigger }
