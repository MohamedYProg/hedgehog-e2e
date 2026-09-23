import { test, expect } from '@playwright/test'
import { loginAs, projectUrl, adminUrl, API_URL } from '../helpers/auth'

// ============================================================================
// Section 9: Edge Cases (Scenarios 36-40)
// ============================================================================

test.describe('Edge Cases - Permissions', () => {
  // Scenario 36: Unauthenticated user gets redirected to login
  test('S36 - Unauthenticated request redirects to signin', async ({ page }) => {
    // Don't login — go directly to a protected page
    await page.goto(projectUrl('defects'))

    // Should be redirected to the signin page
    await page.waitForURL(/\/auth\/signin/, { timeout: 15_000 })
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  // Scenario 37: API returns 401 for unauthenticated request
  test('S37 - API returns 401 without auth token', async ({ page }) => {
    // Direct API call to backend without auth token
    const response = await page.request.get(`${API_URL}/api/v1/defects`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(response.status()).toBe(401)
  })

  // Scenario 38: API returns 403 for comment on requirement (Viewer)
  test('S38 - API returns 403 for Viewer posting requirement comment', async ({ page }) => {
    await loginAs(page, 'viewer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.post(`${API_URL}/api/v1/requirements/fake-id/comments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: { content: 'Viewer should not be able to comment' },
    })

    expect(response.status()).toBe(403)
  })

  // Scenario 39: Test Plans - Viewer cannot create test plan
  test('S39 - Viewer cannot see New Test Plan button', async ({ page }) => {
    await loginAs(page, 'viewer')
    await page.goto(projectUrl('test-plans'))

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5_000)

    // Viewer has test-plans.read but NOT test-plans.create
    const newPlanBtn = page.getByRole('button', { name: 'New Test Plan', exact: true })
    await expect(newPlanBtn).not.toBeVisible()
  })

  // Scenario 40: Sidebar module visibility - Viewer sees limited sidebar items
  test('S40 - Viewer sees appropriate sidebar navigation items', async ({ page }) => {
    await loginAs(page, 'viewer')
    await page.goto(projectUrl('defects'))

    await page.waitForLoadState('networkidle')

    // Viewer should see read-only modules in sidebar
    const defectsNav = page.getByRole('button', { name: 'Defects' })
    await expect(defectsNav).toBeVisible({ timeout: 10_000 })

    const testPlansNav = page.getByRole('button', { name: 'Test Plans' })
    await expect(testPlansNav).toBeVisible()

    const reportsNav = page.getByRole('button', { name: 'Reports' })
    await expect(reportsNav).toBeVisible()

    const requirementsNav = page.getByRole('button', { name: 'Requirements' })
    await expect(requirementsNav).toBeVisible()
  })

  // Bonus: Verify Developer sidebar - no User Management
  test('S40b - Developer cannot see User Management in sidebar', async ({ page }) => {
    await loginAs(page, 'developer')
    await page.goto(projectUrl('defects'))

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3_000)

    const userMgmtNav = page.getByRole('button', { name: 'User Management' })
    const isVisible = await userMgmtNav.isVisible().catch(() => false)

    expect(isVisible).toBe(false)
  })
})
