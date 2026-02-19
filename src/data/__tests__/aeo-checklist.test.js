import { describe, it, expect } from 'vitest'
import { phases } from '../aeo-checklist'

describe('aeo-checklist data integrity', () => {
  it('exports exactly 7 phases', () => {
    expect(phases).toHaveLength(7)
  })

  it('has exactly 99 total items', () => {
    const total = phases.reduce(
      (sum, phase) => sum + phase.categories.reduce((s, cat) => s + cat.items.length, 0),
      0,
    )
    expect(total).toBe(99)
  })

  it('every phase has required fields', () => {
    phases.forEach((phase, i) => {
      expect(phase.id).toBeTruthy()
      expect(phase.number).toBe(i + 1)
      expect(typeof phase.title).toBe('string')
      expect(phase.title.length).toBeGreaterThan(0)
      expect(typeof phase.color).toBe('string')
      expect(phase.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(Array.isArray(phase.categories)).toBe(true)
      expect(phase.categories.length).toBeGreaterThan(0)
    })
  })

  it('every category has required fields', () => {
    phases.forEach(phase => {
      phase.categories.forEach(cat => {
        expect(cat.id).toBeTruthy()
        expect(typeof cat.name).toBe('string')
        expect(cat.name.length).toBeGreaterThan(0)
        expect(Array.isArray(cat.items)).toBe(true)
        expect(cat.items.length).toBeGreaterThan(0)
      })
    })
  })

  it('every item has required fields', () => {
    phases.forEach(phase => {
      phase.categories.forEach(cat => {
        cat.items.forEach(item => {
          expect(item.id).toBeTruthy()
          expect(typeof item.text).toBe('string')
          expect(item.text.length).toBeGreaterThan(0)
          expect(typeof item.detail).toBe('string')
          expect(item.detail.length).toBeGreaterThan(0)
        })
      })
    })
  })

  it('all item IDs are unique across the entire checklist', () => {
    const allIds = []
    phases.forEach(phase => {
      phase.categories.forEach(cat => {
        cat.items.forEach(item => {
          allIds.push(item.id)
        })
      })
    })

    const unique = new Set(allIds)
    expect(unique.size).toBe(allIds.length)
  })

  it('item IDs follow the pN-cN-iN naming convention', () => {
    phases.forEach(phase => {
      phase.categories.forEach(cat => {
        cat.items.forEach(item => {
          expect(item.id).toMatch(/^p\d+-c\d+-i\d+$/)
        })
      })
    })
  })

  it('phase IDs follow the phase-N naming convention', () => {
    phases.forEach((phase, i) => {
      expect(phase.id).toBe(`phase-${i + 1}`)
    })
  })

  it('item IDs start with the correct phase prefix', () => {
    phases.forEach(phase => {
      const phaseNum = phase.number
      phase.categories.forEach(cat => {
        cat.items.forEach(item => {
          expect(item.id.startsWith(`p${phaseNum}-`)).toBe(true)
        })
      })
    })
  })
})
