import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Golden Land - Bất động sản/)
    await expect(page.getByRole('link', { name: 'GOLDENLAND' })).toBeVisible()
    await expect(page.getByRole('textbox')).toBeVisible()
  })
})
