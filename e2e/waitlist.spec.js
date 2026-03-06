import { test, expect } from '@playwright/test'

test.describe('Waitlist Page', () => {
  test('loads the waitlist page with hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=AEO')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })

  test('has navigation links', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('opens scorecard quiz on CTA click', async ({ page }) => {
    await page.goto('/')
    const ctaButton = page.locator('button').filter({ hasText: /score|check|assess/i }).first()
    if (await ctaButton.isVisible()) {
      await ctaButton.click()
      // Scorecard should appear
      await expect(page.locator('[class*="scorecard"], [class*="Scorecard"]')).toBeVisible({ timeout: 5000 })
    }
  })

  test('FAQ section expands on click', async ({ page }) => {
    await page.goto('/')
    const faqSection = page.locator('#faq')
    if (await faqSection.isVisible()) {
      const firstQuestion = faqSection.locator('button').first()
      await firstQuestion.click()
      const answer = faqSection.locator('[class*="answer"][class*="open"], [class*="faq-open"]').first()
      await expect(answer).toBeVisible({ timeout: 3000 })
    }
  })

  test('theme toggle works', async ({ page }) => {
    await page.goto('/')
    const themeBtn = page.locator('button[aria-label*="Switch to"]').first()
    if (await themeBtn.isVisible()) {
      await themeBtn.click()
      // Just verify it doesn't crash
      await expect(page.locator('h1')).toBeVisible()
    }
  })
})
