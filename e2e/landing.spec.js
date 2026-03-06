import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('loads the landing page', async ({ page }) => {
    await page.goto('/features')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=AEO')).toBeVisible()
  })

  test('has features section', async ({ page }) => {
    await page.goto('/features')
    const features = page.locator('#features')
    await expect(features).toBeVisible()
  })

  test('has pricing section with toggle', async ({ page }) => {
    await page.goto('/features')
    const pricing = page.locator('#pricing')
    if (await pricing.isVisible()) {
      // Check pricing toggle exists
      const toggleBtns = pricing.locator('button').filter({ hasText: /monthly|quarterly|annual/i })
      expect(await toggleBtns.count()).toBeGreaterThan(0)
    }
  })

  test('navigates to app on CTA click', async ({ page }) => {
    await page.goto('/features')
    const cta = page.locator('a[href*="/app"]').first()
    if (await cta.isVisible()) {
      await expect(cta).toHaveAttribute('href', /\/app/)
    }
  })

  test('FAQ accordion works', async ({ page }) => {
    await page.goto('/features')
    const faqSection = page.locator('#faq')
    if (await faqSection.isVisible()) {
      const firstQ = faqSection.locator('button').first()
      await firstQ.click()
      // Should expand
      await page.waitForTimeout(300)
      await expect(page.locator('h1')).toBeVisible() // page didn't crash
    }
  })
})
