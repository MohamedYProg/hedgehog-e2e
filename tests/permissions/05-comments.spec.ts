import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { loginAs, projectUrl, API_URL } from '../helpers/auth'

// ============================================================================
// Section 5: Comments (Scenarios 21-25)
// ============================================================================

async function ensureDefectExists(page: Page) {
  await page.goto(projectUrl('defects'))
  await expect(page.locator('table')).toBeVisible({ timeout: 15_000 })
  
  const firstDefectBtn = page.locator('tbody tr td button').first()
  const noDefectsText = page.getByText('No defects found')
  
  // Wait for either the first defect summary button OR the empty state to render
  await expect(firstDefectBtn.or(noDefectsText)).toBeVisible({ timeout: 15_000 })
  const hasDefects = await firstDefectBtn.isVisible()
  
  if (!hasDefects) {
    await page.goto(projectUrl('defects/create'))
    await expect(page.locator('#summary')).toBeVisible({ timeout: 15_000 })
    await page.locator('#summary').fill('Comment Trigger Defect')
    await page.locator('#description').fill('Temp defect created for comments trigger')
    await page.locator('#classification').fill('Bug')
    
    const compTrigger = page.locator('div:has(> label:has-text("Module"))').getByRole('combobox').first()
    await expect(compTrigger).toBeEnabled({ timeout: 15_000 })
    await compTrigger.click()
    const validOption = page.getByRole('option').filter({ hasNotText: 'No module' }).first()
    await expect(validOption).toBeVisible({ timeout: 10_000 })
    await validOption.click()

    // Select cycle after options load asynchronously
    const cycleSelect = page.locator('#detectedInCycleId')
    await expect(async () => {
      const count = await cycleSelect.locator('option').count()
      expect(count).toBeGreaterThan(1)
    }).toPass({ timeout: 10_000 })
    await cycleSelect.selectOption({ index: 1 })

    // Select reporter if required
    const reporterBtn = page.getByRole('button', { name: /Select Reporter|Unassigned/i }).or(page.getByText('Select Reporter')).first()
    if (await reporterBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await reporterBtn.click()
      await page.waitForTimeout(300)
      const userItem = page.locator('button, div').filter({ hasText: /Admin|admin|User/ }).first()
      if (await userItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await userItem.click()
      }
    }
    
    await page.getByRole('button', { name: 'Create Defect' }).click()
    await page.waitForURL(/\/defects(\?|$)/, { timeout: 20_000 })
  }
}



test.describe('Comments - Permissions', () => {
  // Scenario 21: QA Tester can navigate to a defect detail with comments
  test('S21 - QA Tester can view defect detail with comment section', async ({ page }) => {
    await loginAs(page, 'qa_tester')
    await ensureDefectExists(page)
    await page.goto(projectUrl('defects'))

    // Wait for the table to render
    await expect(page.locator('table')).toBeVisible({ timeout: 15_000 })

    // Find and click the first defect title
    const firstDefectBtn = page.locator('tbody tr td button').first()
    await expect(firstDefectBtn).toBeVisible({ timeout: 10_000 })
    await firstDefectBtn.click()

    // Wait for the detail page URL
    await page.waitForURL(/defects\/browse/, { timeout: 15_000 })

    // Wait for defect detail to load — the "Back" button and defect summary are always present
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({ timeout: 15_000 })

    // Wait for the Comments card to render (it loads with the defect data)
    await expect(page.locator('text=Comments (')).toBeVisible({ timeout: 15_000 })
  })

  // Scenario 22: Viewer can also view defect detail
  test('S22 - Viewer can navigate to defect detail page', async ({ page }) => {
    // Ensure the defect is created using a QA Tester context first
    await loginAs(page, 'qa_tester')
    await ensureDefectExists(page)

    // Now log in as viewer for the actual verification
    await loginAs(page, 'viewer')
    await page.goto(projectUrl('defects'))

    await expect(page.locator('table')).toBeVisible({ timeout: 15_000 })

    const firstDefectBtn = page.locator('tbody tr td button').first()
    await expect(firstDefectBtn).toBeVisible({ timeout: 10_000 })

    await firstDefectBtn.click()
    await page.waitForURL(/defects\/browse/, { timeout: 15_000 })

    // Wait for defect detail to load
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({ timeout: 15_000 })

    // Wait for the Comments card
    await expect(page.locator('text=Comments (')).toBeVisible({ timeout: 15_000 })
  })

  // Scenario 23: API enforcement - comments.create on defect
  test('S23 - API returns 403 for Viewer posting defect comment', async ({ page }) => {
    await loginAs(page, 'viewer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.post(`${API_URL}/api/v1/defects/fake-id/comments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: { content: 'Viewer should not be able to post this' },
    })

    expect(response.status()).toBe(403)
  })

  // Scenario 24: API enforcement - comments.create on test case
  test('S24 - API returns 403 for Viewer posting test case comment', async ({ page }) => {
    await loginAs(page, 'viewer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.post(`${API_URL}/api/v1/test-cases/fake-id/comments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: { content: 'Should be blocked' },
    })

    expect(response.status()).toBe(403)
  })

  // Scenario 25: API enforcement - comments.create on test plan
  test('S25 - API returns 403 for Viewer posting test plan comment', async ({ page }) => {
    await loginAs(page, 'viewer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.post(`${API_URL}/api/v1/test-plans/fake-id/comments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: { content: 'Should be blocked' },
    })

    expect(response.status()).toBe(403)
  })
})
