import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Boundary Value Analysis (BVA) limits', () => {

  test('BVA-015: Test Cycle startDate after endDate is rejected', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab`)
    await expect(page.getByRole('heading', { name: 'Test Lab' })).toBeVisible({ timeout: 30_000 })

    // Switch to Cycles tab
    await page.getByRole('button', { name: 'Cycles', exact: true }).click()
    await expect(page.getByText('Select a cycle or run')).toBeVisible({ timeout: 15_000 })

    // Click tree header New Cycle button
    await page.locator('button[title="New Cycle"]').first().click()
    await expect(page.getByRole('heading', { name: 'New Cycle' })).toBeVisible({ timeout: 10_000 })

    // Fill start date as after end date
    await page.locator('#cname').fill('Boundary Cycle Date')
    await page.locator('#cstart').fill('2026-08-01')
    await page.locator('#cend').fill('2026-07-01') // End date is before start date

    // Submit
    await page.getByRole('button', { name: 'Create', exact: true }).click()

    // Assert date range validation check (Toast or inline error message)
    await expect(page.getByText(/End date must be after start date/i).or(page.getByText(/Invalid date range/i))).toBeVisible({ timeout: 15_000 })

    // Cancel modal
    await page.getByRole('button', { name: 'Cancel' }).click()
  })
})
