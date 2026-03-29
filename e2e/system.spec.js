/**
 * System (E2E) tests — IDs ST-xx-OB in docs/TESTING_PLAN.md.
 */
import { test, expect } from '@playwright/test'

test.describe('Book Catalog — system flows', () => {
  test('ST-01-OB: home page loads with primary navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Book Catalog Home' })).toBeVisible()
  })

  test('ST-02-OB: open catalog from navbar', async ({ page }) => {
    await page.goto('/')
    // Avoid matching "Book Catalog Home" — use exact label or href.
    await page.getByRole('link', { name: 'Catalog', exact: true }).click()
    await expect(page).toHaveURL(/\/catalog/)
  })

  test('ST-03-OB: login page reachable', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })

  test('ST-04-OB: signup page reachable', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByText('Create your account')).toBeVisible()
  })
})
