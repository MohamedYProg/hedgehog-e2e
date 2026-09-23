import { test, expect } from '@playwright/test'
import { loginAs, API_URL } from '../helpers/auth'

// ============================================================================
// Section 7: Test Executions (Scenarios 29-31)
// ============================================================================

test.describe('Test Executions - Permissions', () => {
  // Scenario 29: API enforcement - Viewer cannot update test execution
  test('S29 - API returns 403 for Viewer updating test execution', async ({ page }) => {
    await loginAs(page, 'viewer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.patch(`${API_URL}/api/v1/test-executions/fake-id`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: { status: 'PASSED' },
    })

    expect(response.status()).toBe(403)
  })

  // Scenario 30: API enforcement - Viewer cannot delete test execution
  test('S30 - API returns 403 for Viewer deleting test execution', async ({ page }) => {
    await loginAs(page, 'viewer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.delete(`${API_URL}/api/v1/test-executions/fake-id`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    expect(response.status()).toBe(403)
  })

  // Scenario 31: QA Tester CAN access test execution (has test-plans.read/update)
  test('S31 - API does not return 403 for QA Tester reading test execution', async ({ page }) => {
    await loginAs(page, 'qa_tester')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.get(`${API_URL}/api/v1/test-executions/fake-id`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // QA Tester HAS test-plans.read, so the read permission gate must pass.
    // 'fake-id' doesn't exist, so the expected outcome is 200 (if permitted and
    // somehow found) or 404 — never 403 (forbidden) or 401 (auth). A bare
    // `.not.toBe(403)` would pass on 401/500 too and hide a regression.
    expect([200, 404]).toContain(response.status())
    expect(response.status()).not.toBe(403)
    expect(response.status()).not.toBe(401)
  })
})
