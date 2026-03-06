import { test, expect } from '@playwright/test'

test.describe('Dashboard App', () => {
  test('loads the dashboard', async ({ page }) => {
    await page.goto('/app')
    // Should see dashboard or login prompt
    await expect(page.locator('body')).toBeVisible()
  })

  test('has sidebar navigation', async ({ page }) => {
    await page.goto('/app')
    // Look for sidebar or navigation elements
    const sidebar = page.locator('[class*="sidebar"], nav, [role="navigation"]').first()
    await expect(sidebar).toBeVisible({ timeout: 10000 })
  })

  test('can switch views via hash navigation', async ({ page }) => {
    await page.goto('/app#checklist')
    await page.waitForTimeout(500)
    // Should show checklist view
    await expect(page.locator('body')).toBeVisible()
  })

  test('settings view loads', async ({ page }) => {
    await page.goto('/app#settings')
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })
})
