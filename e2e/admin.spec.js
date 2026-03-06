import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test('loads the admin panel', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('body')).toBeVisible()
  })

  test('has admin navigation', async ({ page }) => {
    await page.goto('/admin')
    // Admin should have navigation sidebar or top bar
    const nav = page.locator('nav, [class*="sidebar"], [role="navigation"]').first()
    await expect(nav).toBeVisible({ timeout: 10000 })
  })
})
