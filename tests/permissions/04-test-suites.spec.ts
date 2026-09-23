import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { loginAs, projectUrl, API_URL } from '../helpers/auth'

// Helper to navigate and select All Test Cases so the table and headers render
async function navigateToTestCasesAndSelectAll(page: Page, role: string) {
  await loginAs(page, role)
  await page.goto(projectUrl('test-cases'))
  const allTestCasesRow = page.getByText('All Test Cases').first()
  await expect(allTestCasesRow).toBeVisible({ timeout: 20_000 })
  await allTestCasesRow.click()
}

// ============================================================================
// Section 4: Test Suites (Scenarios 16-20)
// ============================================================================

test.describe('Test Suites - Permissions', () => {
  // Scenario 16: QA Tester has create options in test cases view
  test('S16 - QA Tester has create capability in test cases view', async ({ page }) => {
    await navigateToTestCasesAndSelectAll(page, 'qa_tester')

    // QA Tester has test-suites.create and test-cases.create
    // Verify at least one create/add action exists on the page (automatically waits for table loading to finish)
    const createOption = page
      .locator('button, [role="menuitem"]')
      .filter({ hasText: /Create|New|Add/i })
      .first()

    await expect(createOption).toBeVisible({ timeout: 20_000 })
  })

  // Scenario 17: Developer cannot create test suites (read only)
  test('S17 - Developer cannot create test suites', async ({ page }) => {
    await navigateToTestCasesAndSelectAll(page, 'developer')

    const createSuite = page.getByText('Create new Test Suite')
    await expect(createSuite).not.toBeVisible()
  })

  // Scenario 18: Viewer cannot create test suites
  test('S18 - Viewer has read-only test suite access', async ({ page }) => {
    await navigateToTestCasesAndSelectAll(page, 'viewer')

    const createSuite = page.getByText('Create new Test Suite')
    await expect(createSuite).not.toBeVisible()
  })

  // Scenario 19: API enforcement - Developer gets 403 on test-suite create API
  test('S19 - API returns 403 for Developer creating test suite', async ({ page }) => {
    await loginAs(page, 'developer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))
    // Get the project ID from currentProjectData
    const projectId = await page.evaluate(() => {
      const data = localStorage.getItem('currentProjectData')
      return data ? JSON.parse(data).id : null
    })

    // Test suite creation endpoint is /api/v1/projects/{projectId}/test-suites
    const response = await page.request.post(`${API_URL}/api/v1/projects/${projectId}/test-suites`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'E2E Forbidden Suite',
        description: 'Should fail with 403',
      },
    })

    // Developer does NOT have test-suites.create or test-cases.create — should get 403
    expect(response.status()).toBe(403)
  })

  // Scenario 20: API enforcement - Viewer gets 403 on test-suite update API
  test('S20 - API returns 403 for Viewer updating test suite', async ({ page }) => {
    await loginAs(page, 'viewer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.patch(`${API_URL}/api/v1/test-suites/fake-id`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Should Fail',
      },
    })

    expect(response.status()).toBe(403)
  })
})
