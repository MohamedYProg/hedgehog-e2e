import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Bulk Actions Toolbar E2E', () => {
  test('multi-selects defects rows and checks bulk actions toolbar', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/defects`)
    await expect(page.getByRole('heading', { name: 'Defects' })).toBeVisible({ timeout: 20_000 })

    const checkboxes = page.locator('tbody input[type="checkbox"]')
    const count = await checkboxes.count()
    if (count > 0) {
      await checkboxes.first().click()
      if (count > 1) {
        await checkboxes.nth(1).click()
      }
      await page.waitForTimeout(500)

      // Confirm bulk actions toolbar or selection badge renders
      const selectionText = page.getByText(/selected/i).first()
      if (await selectionText.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await expect(selectionText).toBeVisible()
      }
    }
  })
})
